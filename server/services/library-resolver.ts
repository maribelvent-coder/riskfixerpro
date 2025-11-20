/**
 * Library Resolver Service
 * Converts human-readable threat/control names to database IDs
 * Enables developer-friendly configuration while maintaining referential integrity
 */
import { db } from '../db';
import { threatLibrary, controlLibrary } from '../../shared/schema';
import { eq } from 'drizzle-orm';

export interface LibraryLookupResult {
  found: Array<{ id: string; name: string }>;
  missing: string[];
}

/**
 * Resolve threat names to database IDs
 */
export async function resolveThreatNames(names: string[]): Promise<LibraryLookupResult> {
  if (names.length === 0) {
    return { found: [], missing: [] };
  }

  const threats = await db
    .select({ id: threatLibrary.id, name: threatLibrary.name })
    .from(threatLibrary)
    .where(eq(threatLibrary.active, true));

  const threatMap = new Map(threats.map(t => [t.name, t]));
  const found: Array<{ id: string; name: string }> = [];
  const missing: string[] = [];

  for (const name of names) {
    const threat = threatMap.get(name);
    if (threat) {
      found.push(threat);
    } else {
      missing.push(name);
    }
  }

  return { found, missing };
}

/**
 * Resolve control names to database IDs
 */
export async function resolveControlNames(names: string[]): Promise<LibraryLookupResult> {
  if (names.length === 0) {
    return { found: [], missing: [] };
  }

  const controls = await db
    .select({ id: controlLibrary.id, name: controlLibrary.name })
    .from(controlLibrary)
    .where(eq(controlLibrary.active, true));

  const controlMap = new Map(controls.map(c => [c.name, c]));
  const found: Array<{ id: string; name: string }> = [];
  const missing: string[] = [];

  for (const name of names) {
    const control = controlMap.get(name);
    if (control) {
      found.push(control);
    } else {
      missing.push(name);
    }
  }

  return { found, missing };
}

/**
 * Load full threat library as ID-keyed map for efficient lookups
 */
export async function loadThreatLibrary(): Promise<Map<string, any>> {
  const threats = await db
    .select()
    .from(threatLibrary)
    .where(eq(threatLibrary.active, true));
  
  return new Map(threats.map(t => [t.id, t]));
}

/**
 * Load full control library as ID-keyed map for efficient lookups
 */
export async function loadControlLibrary(): Promise<Map<string, any>> {
  const controls = await db
    .select()
    .from(controlLibrary)
    .where(eq(controlLibrary.active, true));
  
  return new Map(controls.map(c => [c.id, c]));
}

/**
 * Load control library keyed by name for questionnaire resolution
 */
export async function loadControlLibraryByName(): Promise<Map<string, any>> {
  const controls = await db
    .select()
    .from(controlLibrary)
    .where(eq(controlLibrary.active, true));
  
  return new Map(controls.map(c => [c.name, c]));
}

/**
 * Load threat library keyed by name for questionnaire resolution
 */
export async function loadThreatLibraryByName(): Promise<Map<string, any>> {
  const threats = await db
    .select()
    .from(threatLibrary)
    .where(eq(threatLibrary.active, true));
  
  return new Map(threats.map(t => [t.name, t]));
}
