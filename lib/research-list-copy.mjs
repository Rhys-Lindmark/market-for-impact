// Display-only wording. Original scope descriptions stay in reports and models.
export function researchListDescription(value) {
  return value
    .replace(/\bwhole[-\s]+(?:gift|organization)(?:\s+cost)?\b[\s;:,–—-]*/gi, '')
    .replace(/\s+([;:,])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .replace(/^\w/, letter => letter.toUpperCase());
}
