// Categories form a tree that can go several levels deep, and one category can sit under several
// parents (it then shows under each of them). The API lists each category's parent_ids.

export type CategoryNode = { id: number; name: string; parent_ids: number[] };

type ApiCategory = { id: number | string; name: string; parent_id?: number | string | null; parent_ids?: (number | string)[] | null };

/** Reads the API's categories (older responses only had a single parent_id). Links to missing categories are dropped. */
export function normalizeCategories<T extends ApiCategory>(raw: T[]): (Omit<T, "id" | "parent_ids"> & CategoryNode)[] {
  const ids = new Set(raw.map((c) => Number(c.id)));
  return raw.map((c) => {
    const parents = Array.isArray(c.parent_ids) ? c.parent_ids : c.parent_id ? [c.parent_id] : [];
    const id = Number(c.id);
    return {
      ...c,
      id,
      parent_ids: [...new Set(parents.map(Number))].filter((p) => p !== id && ids.has(p)),
    };
  });
}

const byName = (a: CategoryNode, b: CategoryNode) => a.name.localeCompare(b.name);

/** Main categories (no parents), A–Z. */
export const mainCategoriesOf = <C extends CategoryNode>(categories: C[]) =>
  categories.filter((c) => c.parent_ids.length === 0).sort(byName);

/** The categories directly under one, A–Z. */
export const childrenOf = <C extends CategoryNode>(categories: C[], id: number) =>
  categories.filter((c) => c.parent_ids.includes(id)).sort(byName);

/** Every category below one, at any depth (safe even if old data has a loop). */
export function descendantIdsOf(categories: CategoryNode[], id: number): Set<number> {
  const found = new Set<number>();
  const queue = [id];
  while (queue.length) {
    const current = queue.shift()!;
    for (const c of categories) {
      if (c.parent_ids.includes(current) && c.id !== id && !found.has(c.id)) {
        found.add(c.id);
        queue.push(c.id);
      }
    }
  }
  return found;
}

/** One way down from a main category to this one (through the first parent A–Z at each step). */
export function pathTo<C extends CategoryNode>(categories: C[], category: C): C[] {
  const path = [category];
  const seen = new Set([category.id]);
  let current = category;
  while (current.parent_ids.length) {
    const parent = categories
      .filter((c) => current.parent_ids.includes(c.id) && !seen.has(c.id))
      .sort(byName)[0];
    if (!parent) break;
    path.unshift(parent);
    seen.add(parent.id);
    current = parent;
  }
  return path;
}

/**
 * The tree flattened for lists: each category with its depth, under every parent it has.
 * A branch is never followed back into itself.
 */
export function flattenTree<C extends CategoryNode>(categories: C[]): { category: C; depth: number; path: number[] }[] {
  const rows: { category: C; depth: number; path: number[] }[] = [];
  const walk = (category: C, path: number[]) => {
    rows.push({ category, depth: path.length - 1, path });
    for (const child of childrenOf(categories, category.id)) {
      if (!path.includes(child.id)) walk(child, [...path, child.id]);
    }
  };
  for (const main of mainCategoriesOf(categories)) walk(main, [main.id]);
  return rows;
}
