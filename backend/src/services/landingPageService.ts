import { config } from '../config.js';
import { getPool, memoryStore, generateId } from '../db/index.js';
import type { LandingPage } from '../types/index.js';

// ============================================
// GET LANDING PAGES
// ============================================

export async function getLandingPages(): Promise<LandingPage[]> {
  if (config.useMemoryDb) {
    return [...memoryStore.landingPages].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  const p = await getPool();
  if (!p) return [];

  const result = await p.query(
    `SELECT id, name, html, is_default, created_at, updated_at
     FROM landing_pages ORDER BY created_at DESC`
  );

  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    html: row.html,
    isDefault: row.is_default,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

// ============================================
// GET LANDING PAGE
// ============================================

export async function getLandingPage(id: string): Promise<LandingPage | null> {
  if (config.useMemoryDb) {
    return memoryStore.landingPages.find((p) => p.id === id) || null;
  }

  const pool = await getPool();
  if (!pool) return null;

  const result = await pool.query(
    `SELECT id, name, html, is_default, created_at, updated_at
     FROM landing_pages WHERE id = $1`,
    [id]
  );

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name,
    html: row.html,
    isDefault: row.is_default,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ============================================
// CREATE LANDING PAGE
// ============================================

export async function createLandingPage(data: {
  name: string;
  html: string;
  isDefault?: boolean;
}): Promise<LandingPage> {
  const now = new Date();

  if (config.useMemoryDb) {
    if (data.isDefault) {
      memoryStore.landingPages.forEach((p) => (p.isDefault = false));
    }

    const page: LandingPage = {
      id: generateId(),
      name: data.name,
      html: data.html,
      isDefault: data.isDefault || false,
      createdAt: now,
      updatedAt: now,
    };
    memoryStore.landingPages.push(page);
    console.log(`Landing page created: ${page.name}`);
    return page;
  }

  const p = await getPool();
  if (!p) throw new Error('Database not available');

  if (data.isDefault) {
    await p.query('UPDATE landing_pages SET is_default = false');
  }

  const result = await p.query(
    `INSERT INTO landing_pages (name, html, is_default)
     VALUES ($1, $2, $3)
     RETURNING id, name, html, is_default, created_at, updated_at`,
    [data.name, data.html, data.isDefault || false]
  );

  const row = result.rows[0];
  console.log(`Landing page created: ${row.name}`);

  return {
    id: row.id,
    name: row.name,
    html: row.html,
    isDefault: row.is_default,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ============================================
// UPDATE LANDING PAGE
// ============================================

export async function updateLandingPage(
  id: string,
  data: { name?: string; html?: string; isDefault?: boolean }
): Promise<LandingPage | null> {
  if (config.useMemoryDb) {
    const page = memoryStore.landingPages.find((p) => p.id === id);
    if (!page) return null;

    if (data.isDefault) {
      memoryStore.landingPages.forEach((p) => (p.isDefault = false));
    }

    if (data.name !== undefined) page.name = data.name;
    if (data.html !== undefined) page.html = data.html;
    if (data.isDefault !== undefined) page.isDefault = data.isDefault;
    page.updatedAt = new Date();
    return page;
  }

  const p = await getPool();
  if (!p) return null;

  if (data.isDefault) {
    await p.query('UPDATE landing_pages SET is_default = false');
  }

  const updates: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (data.name !== undefined) {
    updates.push(`name = $${paramIndex++}`);
    values.push(data.name);
  }
  if (data.html !== undefined) {
    updates.push(`html = $${paramIndex++}`);
    values.push(data.html);
  }
  if (data.isDefault !== undefined) {
    updates.push(`is_default = $${paramIndex++}`);
    values.push(data.isDefault);
  }

  if (updates.length === 0) return getLandingPage(id);

  updates.push(`updated_at = NOW()`);
  values.push(id);

  const result = await p.query(
    `UPDATE landing_pages SET ${updates.join(', ')}
     WHERE id = $${paramIndex}
     RETURNING id, name, html, is_default, created_at, updated_at`,
    values
  );

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    id: row.id,
    name: row.name,
    html: row.html,
    isDefault: row.is_default,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ============================================
// DELETE LANDING PAGE
// ============================================

export async function deleteLandingPage(id: string): Promise<boolean> {
  if (config.useMemoryDb) {
    const index = memoryStore.landingPages.findIndex((p) => p.id === id);
    if (index === -1) return false;
    memoryStore.landingPages.splice(index, 1);
    return true;
  }

  const p = await getPool();
  if (!p) return false;

  const result = await p.query('DELETE FROM landing_pages WHERE id = $1 RETURNING id', [id]);
  return result.rows.length > 0;
}
