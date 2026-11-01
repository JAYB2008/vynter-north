/**
 * 5-word-shingle Jaccard similarity computation
 * Compares character personality sheets to ensure true originality.
 */

export function compute5WordShingles(text: string): Set<string> {
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);

  const shingles = new Set<string>();
  if (words.length < 5) {
    if (words.length > 0) shingles.add(words.join(" "));
    return shingles;
  }

  for (let i = 0; i <= words.length - 5; i++) {
    shingles.add(words.slice(i, i + 5).join(" "));
  }

  return shingles;
}

export function computeJaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersectionCount = 0;

  for (const item of setA) {
    if (setB.has(item)) {
      intersectionCount++;
    }
  }

  const unionSize = setA.size + setB.size - intersectionCount;
  return unionSize > 0 ? intersectionCount / unionSize : 0;
}
