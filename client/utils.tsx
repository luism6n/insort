export function safeExtractHostnameFromURL(text: string): string {
  try {
    let domain = new URL(text).hostname;
    // take only top level and second level domain
    domain = domain.split(".").slice(-2).join(".");
    return domain;
  } catch (e) {
    return "<no url>";
  }
}

export function getUrlWithoutPath(url: string): string {
  try {
    const urlObj = new URL(url);
    urlObj.pathname = "";
    return urlObj.toString();
  } catch (e) {
    return url;
  }
}
