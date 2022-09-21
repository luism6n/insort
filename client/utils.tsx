export function safeExtractHostnameFromURL(text: string): string {
  try {
    return new URL(text).hostname.replace("www.", "");
  } catch (e) {
    return "<no url>";
  }
}
