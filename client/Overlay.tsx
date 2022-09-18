import React, { Fragment } from "react";
import Box from "./Box";
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
          className="fixed p-2 inset-0 bg-black bg-opacity-75 flex justify-center items-center"
        >
          <Box>{props.children}</Box>
        </div>
      ) : null}
    </Fragment>
  );
}
