import { useState } from "react";
export function ev(event: string) {
  if (!(<any>window).umami) {
    console.warn("umami not loaded");
    return;
  }

  if (window.localStorage.getItem("analytics") === "false") {
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

export function useEnabled() {
  const [enabled, setEnabled] = useState(
    window.localStorage.getItem("analytics") !== "false"
  );

  return {
    enabled,
    setEnabled: (enabled: boolean) => {
      ev("analytics " + (enabled ? "enabled" : "disabled"));
      window.localStorage.setItem("analytics", enabled ? "true" : "false");
      ev("analytics " + (enabled ? "enabled" : "disabled"));
      setEnabled(enabled);
    },
  };
}
