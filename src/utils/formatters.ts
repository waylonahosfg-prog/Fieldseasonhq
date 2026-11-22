export function slugifySpecies(species: string): string {
  return species
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function formatEvergreenStatus(status: string): string {
  return status
    .replaceAll('Ended before Nov. 3, 2026', 'Closed for 2026 (check next cycle)')
    .replaceAll('Open on Nov. 3', 'Active in 2026–27 cycle')
    .replaceAll('Upcoming after Nov. 3', 'Late 2026 / 2027 window')
    .replaceAll(' on Nov. 3', ' in 2026–27')
    .replaceAll('before Nov. 3', 'earlier in 2026');
}
