// Function to strip newlines and whitespace
// (because Aspen likes to add those for some damn reason)
export default function trim(str: string): string {
  return str.replace(/^\s+|\s+$/g, "");
}