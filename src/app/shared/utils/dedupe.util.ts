/**
 * Duplicate Detection Utility
 * 
 * Provides safe, deterministic functions for detecting duplicate records
 * in event sub-lists (volunteers, special guests, media, promotional materials).
 * 
 * All functions normalize data (trim, lowercase, collapse spaces) and handle
 * edge cases (missing IDs, phone formatting, etc.)
 */

/**
 * Normalizes text for comparison:
 * - Trims whitespace
 * - Converts to lowercase
 * - Collapses multiple spaces to single space
 */
export function normalizeText(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

/**
 * Normalizes phone number for comparison:
 * - Removes all non-digit characters
 * - Returns last 10 digits if longer (for India-like numbers)
 * - Returns empty string if no digits found
 */
export function normalizePhone(phone: string | null | undefined): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 0) return '';
  // Return last 10 digits if longer (handles country codes)
  return digits.length > 10 ? digits.slice(-10) : digits;
}

/**
 * Builds a deterministic key from record fields.
 * Joins normalized values with a separator.
 */
export function buildKey(record: any, fields: string[]): string {
  const values = fields
    .map(field => {
      const value = record[field];
      if (typeof value === 'string') {
        return normalizeText(value);
      }
      if (typeof value === 'number') {
        return String(value);
      }
      return '';
    })
    .filter(v => v.length > 0);
  
  return values.join('|');
}

/**
 * Checks if a record is a duplicate in a list.
 * Uses the provided key builder function.
 */
export function isDuplicate<T>(
  record: T,
  existingList: T[],
  getKey: (record: T) => string
): boolean {
  const recordKey = getKey(record);
  if (!recordKey) return false; // Empty key = not a duplicate
  
  return existingList.some(existing => {
    const existingKey = getKey(existing);
    return existingKey && existingKey === recordKey;
  });
}

/**
 * Removes duplicates from a list, keeping the first occurrence.
 * Uses the provided key builder function.
 */
export function removeDuplicates<T>(
  list: T[],
  getKey: (record: T) => string
): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  
  for (const item of list) {
    const key = getKey(item);
    if (key && !seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }
  
  return result;
}

/**
 * Key builders for specific record types
 */

/**
 * Builds key for Special Guest:
 * - Prefer: normalizedPhone (if available)
 * - Fallback: normalizedName + normalizedPhone
 */
export function getSpecialGuestKey(guest: any): string {
  const phone = normalizePhone(guest.phone || guest.personalNumber);
  if (phone) {
    return phone;
  }
  const name = normalizeText(guest.name || `${guest.firstName || ''} ${guest.lastName || ''}`);
  return buildKey(guest, ['name', 'phone']).replace(/name/, name);
}

/**
 * Builds key for Volunteer:
 * - Prefer: volunteer.id (if available)
 * - Fallback: normalizedName + normalizedPhone + normalizedBranch
 */
export function getVolunteerKey(volunteer: any): string {
  if (volunteer.id) {
    return `id:${volunteer.id}`;
  }
  const name = normalizeText(volunteer.name || volunteer.volunteer_name);
  const phone = normalizePhone(volunteer.contact || volunteer.phone);
  const branch = normalizeText(volunteer.branch || volunteer.branch_name);
  return [name, phone, branch].filter(v => v).join('|');
}

/**
 * Builds key for Event Media:
 * - Prefer: media_id or s3_key (if available)
 * - Fallback: filename + url + companyName
 */
export function getEventMediaKey(media: any): string {
  if (media.id || media.media_id) {
    return `id:${media.id || media.media_id}`;
  }
  if (media.s3_key) {
    return `s3:${normalizeText(media.s3_key)}`;
  }
  const filename = normalizeText(media.filename || media.fileName);
  const url = normalizeText(media.url || media.website);
  const company = normalizeText(media.companyName || media.organization);
  return [filename, url, company].filter(v => v).join('|');
}

/**
 * Builds key for Promotional Material:
 * - Prefer: id (if available)
 * - Fallback: name + type
 * Note: Index is not used as it's not available in removeDuplicates context
 */
export function getPromotionalMaterialKey(material: any): string {
  if (material.id) {
    return `id:${material.id}`;
  }
  const name = normalizeText(material.name || material.materialType);
  const type = normalizeText(material.type || material.materialType);
  return [name, type].filter(v => v).join('|');
}

