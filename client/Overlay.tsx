import React, { Fragment } from "react";
import { colors } from "./colors";

export function Overlay(props: {
  children: React.ReactNode;
  setOpen: (open: boolean) => void;
  open: boolean;
}) {
  return (
    <Fragment>
      {props.open ? (
        <div
          style={{ zIndex: 1000 }}
          onClick={() => props.setOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center"
        >
          <div
            style={{ borderColor: colors.purple }}
            className="border border-4 p-4 bg-white flex flex-col"
          >
            {props.children}
          </div>
        </div>
      ) : null}
    </Fragment>
  );
}
