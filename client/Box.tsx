import React from "react";
import { colors } from "./colors";

export default function Box(props: {
  onClick?: (e: any) => void;
  children: React.ReactNode;
  bgColor?: string;
}) {
  return (
    <div
      onClick={props.onClick}
      className="max-w-md w-full flex flex-col items-center p-2 m-2 border-4 bg-white"
      style={{ borderColor: colors.purple, backgroundColor: props.bgColor }}
    >
      {props.children}
    </div>
  );
}
