// Keep first 2 chars of each word, replace the rest with 'x'
export function censorName(name) {
  return name.split(' ').map(word => {
    if (word.length <= 2) return word + 'x';
    return word.slice(0, 2) + 'x'.repeat(word.length - 2);
  }).join(' ');
}
