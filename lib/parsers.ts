// Function to strip newlines and whitespace
// (because Aspen likes to add those for some damn reason)
export function trim(str: string): string;
export function trim(str: string[]): string[];
export function trim(str: string | string[]) {
  if (Array.isArray(str)) {
    return str.map((s) => s.replace(/^\s+|\s+$/g, ""));
  } else {
    return str.replace(/^\s+|\s+$/g, "");
  }
  
}

export function cleanSplit(str: string, sep: string = "\n"): string[] {
  return trim(str.split(sep).filter(str => trim(str) !== ""));
}