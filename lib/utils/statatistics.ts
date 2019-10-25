export function mode(numbers: number[]): number {
  if (!numbers || numbers.length === 0) {
    return null;
  }

  const counts: { [key: number]: number } = {};

  for (const num of numbers) {
    counts[num] = (counts[num] || 0) + 1;
  }

  return Object.keys(counts)
    .map(key => ({ key: parseInt(key, 10), value: counts[key] }))
    .sort((a, b) => b.value - a.value)[0].key;
}
