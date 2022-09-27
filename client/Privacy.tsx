import React from "react";
import { Overlay } from "./Overlay";
import { useEnabled } from "./analytics";
import { Title } from "./designSystem";

export function Privacy(props: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const { enabled, setEnabled } = useEnabled();

  return (
    <Overlay open={props.open} setOpen={props.setOpen}>
      <div className="flex flex-col gap-6">
        <Title>Note on Privacy</Title>
        <p>
          We do not collect any personal data, but we do collect anonymous click
          data to help improve Insort. Make sure your ad blocker is disabled if
          you want to help us improve Insort.
        </p>
        <p>
          <button
            className="underline inline"
            onClick={() => setEnabled(!enabled)}
          >
            Click here to opt {enabled ? "out of" : "into"} event tracking.
          </button>
        </p>
      </div>
    </Overlay>
  );
}
