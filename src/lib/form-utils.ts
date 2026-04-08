export function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export function getFormOptionalString(formData: FormData, key: string) {
  const value = getFormString(formData, key);
  return value.length > 0 ? value : undefined;
}

export function getFormBoolean(formData: FormData, key: string) {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

export function parseOptionalDate(dateValue?: string) {
  if (!dateValue) return null;
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}
