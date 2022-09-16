export function safeExtractHostnameFromURL(text: string): string {
  try {
    return new URL(text).hostname;
  } catch (e) {
    return "<no url>";
  }
}
