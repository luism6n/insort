import React from "react";
import { colors } from "./colors";

export default function Box(props: { children: React.ReactNode }) {
  return (
    <div
      className="max-w-xl w-full flex flex-col items-center p-2 m-2 border-4 bg-white"
      style={{ borderColor: colors.purple }}
    >
      {props.children}
    </div>
  );
}
