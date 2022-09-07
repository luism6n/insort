export function getRefYDistance(d1: HTMLElement, d2: HTMLElement): number {
  return d1.getBoundingClientRect().top - d2.getBoundingClientRect().top;
}
export function getDivDimensions(d: HTMLElement): [number, number] {
  let rect = d.getBoundingClientRect();
  return [rect.width, rect.height];
}
