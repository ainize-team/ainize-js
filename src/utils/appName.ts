export const nameParser = (name: string) => {
  return name.replaceAll(/[./-]/g, "_").toLowerCase();
}