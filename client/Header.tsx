import React from "react";
// @ts-ignore
import logoUrl from "../assets/logo_background_only.png";
import { colors } from "./colors";

export function Header({}) {
  return (
    <header
      style={{
        height: 65,
        backgroundColor: colors.yellow,
        borderColor: colors.purple,
      }}
      className="flex justify-center items-center h-20 w-full border-b-4"
    >
      <p
        className="relative w-0"
        style={{
          color: colors.purple,
          fontSize: "1.5rem",
          left: "22px",
          top: "-5px",
        }}
      >
        INSORT
      </p>
      <img src={logoUrl} className="h-full" />
    </header>
  );
}
