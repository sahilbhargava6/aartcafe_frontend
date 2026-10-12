// Store search: every word typed has to match somewhere (title, category or description), words can
// be the start of a word ("fram" → "Frames"), singular/plural ("frame" ↔ "frames") or have a small
// typo ("nameplte" → "Nameplate"). A product also matches the categories above its own, so searching
// a category finds what is in its sub-categories. Results are ranked, title matches first.

import { type CategoryNode, descendantIdsOf } from "./categories";

export const normalizeText = (text: string) =>
  text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

const wordsOf = (text: string) => normalizeText(text).split(" ").filter(Boolean);

const stem = (word: string) => {
  if (word.length <= 3) return word;
  if (word.endsWith("ies")) return word.slice(0, -3) + "y";
  if (/(s|x|z|ch|sh)es$/.test(word)) return word.slice(0, -2);
  if (word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
};

/** Edit distance (a swapped pair of letters counts as one typo), or max + 1 once it is clearly too far. */
function distance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let before: number[] = [];
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    let best = i;
    for (let j = 1; j <= b.length; j++) {
      row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) row[j] = Math.min(row[j], before[j - 2] + 1);
      best = Math.min(best, row[j]);
    }
    if (best > max) return max + 1;
    before = prev;
    prev = row;
  }
  return prev[b.length];
}

/**
 * How well one typed word matches one word of the text: 3 same word (or singular/plural),
 * 2 start of the word, 1 small typo, 0.5 inside the word, 0 no match.
 */
function wordMatch(token: string, word: string, allowFuzzy: boolean): number {
  if (word === token || stem(word) === stem(token)) return 3;
  if (word.startsWith(token)) return 2;
  if (allowFuzzy && token.length >= 4) {
    const max = token.length >= 7 ? 2 : 1;
    if (distance(token, word, max) <= max) return 1;
    // a typo in a half-typed word: compare with the start of the word
    if (word.length > token.length && distance(token, word.slice(0, token.length), max) <= max) return 1;
  }
  if (token.length >= 3 && word.includes(token)) return 0.5;
  return 0;
}

const bestMatch = (token: string, words: string[], allowFuzzy: boolean) =>
  words.reduce((best, word) => Math.max(best, best === 3 ? 3 : wordMatch(token, word, allowFuzzy)), 0);

export type SearchableProduct = { title?: string | null; description?: string | null; categoryIds: number[] };

type Indexed<T> = { item: T; title: string; titleWords: string[]; categoryWords: string[]; descriptionWords: string[] };

/** Prepares products for searching: words of each title, description and category (own and above). */
export function buildSearchIndex<T extends SearchableProduct>(products: T[], categories: CategoryNode[]): Indexed<T>[] {
  // For every category, the names of it and every category above it
  const namesAbove = new Map<number, string[]>();
  for (const category of categories) {
    const names = new Set<string>();
    const queue = [category.id];
    const seen = new Set<number>();
    while (queue.length) {
      const id = queue.shift()!;
      if (seen.has(id)) continue;
      seen.add(id);
      const current = categories.find((c) => c.id === id);
      if (!current) continue;
      names.add(current.name);
      queue.push(...current.parent_ids);
    }
    namesAbove.set(category.id, [...names]);
  }
  return products.map((item) => ({
    item,
    title: normalizeText(item.title || ""),
    titleWords: wordsOf(item.title || ""),
    categoryWords: wordsOf(item.categoryIds.flatMap((id) => namesAbove.get(id) || []).join(" ")),
    descriptionWords: wordsOf(item.description || ""),
  }));
}

/** Products matching every word typed, best first. */
export function searchProducts<T extends SearchableProduct>(index: Indexed<T>[], query: string): T[] {
  const tokens = wordsOf(query);
  if (tokens.length === 0) return [];
  const phrase = tokens.join(" ");
  const scored: { item: T; score: number; length: number }[] = [];
  for (const entry of index) {
    let score = 0;
    let matchedAll = true;
    for (const token of tokens) {
      const best = Math.max(
        bestMatch(token, entry.titleWords, true) * 10,
        bestMatch(token, entry.categoryWords, true) * 6,
        // descriptions are long: only whole words or word starts count there
        bestMatch(token, entry.descriptionWords, false) >= 2 ? bestMatch(token, entry.descriptionWords, false) : 0
      );
      if (best === 0) { matchedAll = false; break; }
      score += best;
    }
    if (!matchedAll) continue;
    if (entry.title.startsWith(phrase)) score += 25;
    else if (entry.title.includes(phrase)) score += 12;
    scored.push({ item: entry.item, score, length: entry.title.length });
  }
  // Equal scores: the shorter (more exact) title first
  return scored.sort((a, b) => b.score - a.score || a.length - b.length).map((s) => s.item);
}

/** Categories whose name matches every word typed, best first. */
export function searchCategories<C extends CategoryNode>(categories: C[], query: string): C[] {
  const tokens = wordsOf(query);
  if (tokens.length === 0) return [];
  const phrase = tokens.join(" ");
  return categories
    .map((category) => {
      const name = normalizeText(category.name);
      const words = name.split(" ");
      let score = 0;
      for (const token of tokens) {
        const m = bestMatch(token, words, true);
        if (m === 0) return { category, score: 0 };
        score += m;
      }
      if (name.startsWith(phrase)) score += 5;
      return { category, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || a.category.name.localeCompare(b.category.name))
    .map((s) => s.category);
}

/**
 * Google-style completions of what is being typed, from the given phrases (product and category
 * names): ones starting with the query first, then ones with the query at the start of a word.
 */
export function searchSuggestions(phrases: string[], query: string, limit = 5): string[] {
  const q = normalizeText(query);
  if (!q) return [];
  const seen = new Set<string>();
  const ranked: { text: string; rank: number }[] = [];
  for (const phrase of phrases) {
    const text = phrase.trim().replace(/\s+/g, " ");
    const n = normalizeText(text);
    if (!n || n === q || seen.has(n)) continue;
    const rank = n.startsWith(q) ? 0 : (" " + n).includes(" " + q) ? 1 : -1;
    if (rank < 0) continue;
    seen.add(n);
    ranked.push({ text, rank });
  }
  return ranked
    .sort((a, b) => a.rank - b.rank || a.text.length - b.text.length || a.text.localeCompare(b.text))
    .slice(0, limit)
    .map((r) => r.text);
}

/** Splits text into pieces, marking the parts that match a typed word (for highlighting). */
export function highlightParts(text: string, query: string): { text: string; match: boolean }[] {
  const tokens = wordsOf(query).sort((a, b) => b.length - a.length);
  if (tokens.length === 0) return [{ text, match: false }];
  const escaped = tokens.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  // split() with a capture group puts the matched pieces at the odd positions
  return text
    .split(new RegExp(`(${escaped.join("|")})`, "gi"))
    .map((piece, i) => ({ text: piece, match: i % 2 === 1 }))
    .filter((piece) => piece.text);
}

/** How many products are in a category or anything below it. */
export function productCountIn(categories: CategoryNode[], products: SearchableProduct[], categoryId: number): number {
  const ids = new Set([categoryId, ...descendantIdsOf(categories, categoryId)]);
  return products.filter((p) => p.categoryIds.some((id) => ids.has(id))).length;
}

/**
 * "Showing results for …": the query with each misspelt word replaced by the closest word from the
 * store's own names, or null when every word is fine (or nothing close enough is found).
 */
export function correctedQuery(phrases: string[], query: string): string | null {
  const tokens = wordsOf(query);
  if (tokens.length === 0) return null;
  const vocabulary = [...new Set(phrases.flatMap(wordsOf))];
  let changed = false;
  const fixed = tokens.map((token) => {
    if (token.length < 4 || vocabulary.some((word) => word.startsWith(token) || stem(word) === stem(token))) return token;
    const max = token.length >= 7 ? 2 : 1;
    let best: { word: string; d: number } | null = null;
    for (const word of vocabulary) {
      const d = Math.min(distance(token, word, max), word.length > token.length ? distance(token, word.slice(0, token.length), max) : max + 1);
      if (d <= max && (!best || d < best.d || (d === best.d && word.length < best.word.length))) best = { word, d };
    }
    if (!best) return token;
    changed = true;
    return best.word;
  });
  return changed ? fixed.join(" ") : null;
}
