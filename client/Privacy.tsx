import React, { useEffect } from "react";
import { Overlay } from "./Overlay";
import { ev, useEnabled } from "./analytics";
import { Title } from "./designSystem";

export function Privacy(props: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const { enabled, setEnabled } = useEnabled();

  useEffect(() => {
    ev("view privacy notice");
  }, []);

  return (
    <Overlay open={props.open} setOpen={props.setOpen}>
      <div className="flex flex-col text-center justify-center gap-6">
        <Title>Note on Privacy</Title>
        <p>
          We do not collect any personal data. We only collect anonymous
          analytics to help guide deck creation and gameplay improvements. If
          you wanna help, make sure your ad blocker is disabled. The source code
          is auditable at{" "}
          <a
            target="_blank"
            className="underline"
            href="https://github.com/luism6n/insort"
          >
            github.com/luism6n/insort
          </a>
          .
        </p>
        <p>
          <button
            className="underline inline"
            onClick={() => setEnabled(!enabled)}
          >
            Click here to{" "}
            {enabled ? "opt out of any tracking" : "help us anonymously"}.
          </button>
        </p>
      </div>
    </Overlay>
  );
}
