import ldap from 'ldapjs';
import { config } from '../config.js';
import { getPool, memoryStore, generateId, generateToken } from '../db/index.js';
import type { Recipient } from '../types/index.js';

// ============================================
// LDAP CLIENT
// ============================================

let ldapClient: ldap.Client | null = null;

function getClient(): ldap.Client {
  if (!ldapClient) {
    ldapClient = ldap.createClient({
      url: config.ldap.url,
      reconnect: true,
    });

    ldapClient.on('error', (err) => {
      console.error('LDAP connection error:', err);
      ldapClient = null;
    });
  }
  return ldapClient;
}

export function closeLdapConnection(): void {
  if (ldapClient) {
    ldapClient.unbind(() => {
      console.log('LDAP connection closed');
    });
    ldapClient = null;
  }
}

// ============================================
// LDAP BIND (Authentication)
// ============================================

async function bindAdmin(): Promise<void> {
  return new Promise((resolve, reject) => {
    const client = getClient();
    client.bind(config.ldap.adminDn, config.ldap.adminPassword, (err) => {
      if (err) {
        console.error('LDAP bind failed:', err);
        reject(new Error(`LDAP bind failed: ${err.message}`));
      } else {
        resolve();
      }
    });
  });
}

// ============================================
// LDAP TEST CONNECTION
// ============================================

export async function testLdapConnection(): Promise<boolean> {
  try {
    await bindAdmin();
    console.log('LDAP connection successful');
    return true;
  } catch (error) {
    console.error('LDAP connection test failed:', error);
    return false;
  }
}

// ============================================
// LDAP USER INTERFACE
// ============================================

export interface LdapUser {
  dn: string;
  cn: string;
  sn: string;
  mail: string;
  uid?: string;
  givenName?: string;
}

// ============================================
// SEARCH LDAP USERS
// ============================================

export async function searchLdapUsers(): Promise<LdapUser[]> {
  await bindAdmin();

  return new Promise((resolve, reject) => {
    const client = getClient();
    const users: LdapUser[] = [];

    const searchBase = config.ldap.usersOu
      ? `${config.ldap.usersOu},${config.ldap.baseDn}`
      : config.ldap.baseDn;

    const opts: ldap.SearchOptions = {
      filter: config.ldap.userFilter,
      scope: 'sub',
      attributes: ['cn', 'sn', 'mail', 'uid', 'givenName'],
    };

    client.search(searchBase, opts, (err, res) => {
      if (err) {
        console.error('LDAP search error:', err);
        return reject(new Error(`LDAP search failed: ${err.message}`));
      }

      res.on('searchEntry', (entry) => {
        const obj = entry.pojo;

        // Extract attributes
        const getAttribute = (name: string): string => {
          const attr = obj.attributes.find(a => a.type === name);
          if (!attr) return '';
          return Array.isArray(attr.values) ? attr.values[0] || '' : '';
        };

        const mail = getAttribute('mail');
        if (mail) {
          users.push({
            dn: obj.objectName,
            cn: getAttribute('cn') || 'Unknown',
            sn: getAttribute('sn') || 'Unknown',
            mail: mail,
            uid: getAttribute('uid'),
            givenName: getAttribute('givenName'),
          });
        }
      });

      res.on('error', (err) => {
        console.error('LDAP search stream error:', err);
        reject(new Error(`LDAP search stream error: ${err.message}`));
      });

      res.on('end', (result) => {
        if (result?.status !== 0) {
          console.warn('LDAP search ended with status:', result?.status);
        }
        console.log(`LDAP search completed: ${users.length} users found`);
        resolve(users);
      });
    });
  });
}

// ============================================
// SYNC LDAP USERS TO CAMPAIGN
// ============================================

export interface SyncResult {
  success: boolean;
  totalFound: number;
  synced: number;
  skipped: number;
  errors: number;
  details: Array<{
    email: string;
    status: 'synced' | 'skipped' | 'error';
    message?: string;
  }>;
}

export async function syncLdapUsersToCampaign(campaignId: string): Promise<SyncResult> {
  const result: SyncResult = {
    success: true,
    totalFound: 0,
    synced: 0,
    skipped: 0,
    errors: 0,
    details: [],
  };

  try {
    // Get LDAP users
    const ldapUsers = await searchLdapUsers();
    result.totalFound = ldapUsers.length;

    if (ldapUsers.length === 0) {
      console.log('No LDAP users found to sync');
      return result;
    }

    // Sync to database
    if (config.useMemoryDb) {
      // In-memory sync
      const now = new Date();
      const existingEmails = new Set(
        memoryStore.recipients
          .filter((r) => r.campaignId === campaignId)
          .map((r) => r.email.toLowerCase())
      );

      for (const user of ldapUsers) {
        const email = user.mail.toLowerCase();

        if (existingEmails.has(email)) {
          result.skipped++;
          result.details.push({
            email: user.mail,
            status: 'skipped',
            message: 'Already exists',
          });
          continue;
        }

        const recipient: Recipient = {
          id: generateId(),
          campaignId,
          email: user.mail,
          firstName: user.givenName || user.cn || 'Unknown',
          lastName: user.sn || 'Unknown',
          token: generateToken(),
          status: 'pending',
          createdAt: now,
          updatedAt: now,
        };

        memoryStore.recipients.push(recipient);
        existingEmails.add(email);
        result.synced++;
        result.details.push({
          email: user.mail,
          status: 'synced',
        });

        console.log(`Synced: ${user.mail}`);
      }
    } else {
      // PostgreSQL sync
      const p = await getPool();
      if (!p) throw new Error('Database not available');

      for (const user of ldapUsers) {
        try {
          const insertResult = await p.query(
            `INSERT INTO recipients (campaign_id, email, first_name, last_name, token)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (campaign_id, email) DO NOTHING
             RETURNING id`,
            [
              campaignId,
              user.mail,
              user.givenName || user.cn || 'Unknown',
              user.sn || 'Unknown',
              generateToken(),
            ]
          );

          if (insertResult.rows.length > 0) {
            result.synced++;
            result.details.push({
              email: user.mail,
              status: 'synced',
            });
            console.log(`Synced: ${user.mail}`);
          } else {
            result.skipped++;
            result.details.push({
              email: user.mail,
              status: 'skipped',
              message: 'Already exists',
            });
          }
        } catch (dbErr) {
          result.errors++;
          result.details.push({
            email: user.mail,
            status: 'error',
            message: dbErr instanceof Error ? dbErr.message : 'Unknown error',
          });
          console.error(`DB Error (${user.mail}):`, dbErr);
        }
      }
    }

    console.log(`LDAP sync completed: ${result.synced} synced, ${result.skipped} skipped, ${result.errors} errors`);
    return result;
  } catch (error) {
    console.error('LDAP sync failed:', error);
    result.success = false;
    throw error;
  }
}

// ============================================
// GET LDAP USERS (Preview without syncing)
// ============================================

export async function getLdapUsersPreview(): Promise<{
  users: LdapUser[];
  count: number;
}> {
  const users = await searchLdapUsers();
  return {
    users,
    count: users.length,
  };
}
