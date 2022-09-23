import React, { useState } from "react";
// @ts-ignore
import logoUrl from "../assets/logo_background_only.png";
import { colors } from "./colors";
import { Overlay } from "./Overlay";

export function Header({}) {
  const [openCredits, setOpenCredits] = useState(false);

  return (
    <header
      style={{
        height: 65,
        backgroundColor: colors.yellow,
        borderColor: colors.purple,
      }}
      className="flex justify-center w-full border-b-4"
    >
      <div className="flex justify-center items-center w-full max-w-xl ">
        <div className="flex-1 mr-auto"></div>
        <a
          className="relative w-0"
          style={{
            color: colors.purple,
            fontSize: "1.5rem",
            left: "22px",
            top: "-5px",
          }}
          href="/"
        >
          INSORT
        </a>
        <img width={134} height={61} src={logoUrl} className="h-full m-auto" />
        <button
          onClick={() => setOpenCredits(true)}
          className="umami--click--credits flex-1 ml-auto text-end pr-2 underline"
        >
          Credits
        </button>
      </div>

      <Overlay open={openCredits} setOpen={setOpenCredits}>
        <h1 className="bold text-lg text-center">Credits</h1>
        <p>
          Coding: Luís Möllmann (
          <a
            target="_blank"
            href="https://github.com/luism6n"
            className="underline"
          >
            github.com/luism6n
          </a>
          )
        </p>

        <p>
          Art & Design: Natália Chies (
          <a
            target="_blank"
            href="https://github.com/ntlchs"
            className="underline"
          >
            github.com/ntlchs
          </a>
          )
        </p>
      </Overlay>
    </header>
  );
}
