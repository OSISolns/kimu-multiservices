// Simple representative derivation without DB changes.
// Adjust the mapping logic as needed to match your business rules.

export function deriveRepresentative(vehicle: any): string {
  if (!vehicle) return 'Unassigned';

  // Prefer explicit fields when present
  const explicit = (vehicle.representative || vehicle.assignedTo || vehicle.owner || '').toString().trim();
  if (explicit) return explicit;

  const name = String(vehicle.name || '').toLowerCase();

  // Example mapping by brand keywords; tweak freely
  if (name.includes('toyota')) return 'Representative A';
  if (name.includes('hyundai')) return 'Representative B';
  if (name.includes('kia')) return 'Representative C';
  if (name.includes('nissan')) return 'Representative D';
  if (name.includes('mitsubishi')) return 'Representative E';

  // Fallback grouping to keep filter usable
  const firstLetter = name.replace(/[^a-z]/g, '').charAt(0);
  if (firstLetter) {
    return `Representative ${firstLetter.toUpperCase()}`;
  }

  return 'Unassigned';
}


