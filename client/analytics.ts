export function ev(event: string) {
  if (!(<any>window).umami) {
    console.warn("umami not loaded");
    return;
  }

  let umami = (<any>window).umami;

  try {
    umami(event);
  } catch (e) {
    console.error("error communicating with umami");
    console.error(e);
  }
}
