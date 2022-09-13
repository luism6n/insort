import React, { useState } from "react";
// @ts-ignore
import logoUrl from "../assets/logo_background_only.png";
import { colors } from "./colors";

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
        <img src={logoUrl} className="h-full m-auto" />
        <button
          onClick={() => setOpenCredits(true)}
          className="umami--click--credits flex-1 ml-auto text-end pr-2 underline"
        >
          Credits
        </button>
      </div>

      {openCredits && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 flex justify-center items-center"
          style={{ zIndex: 1000 }}
          onClick={() => setOpenCredits(false)}
        >
          <div
            className="flex flex-col items-center justify-center max-w-xl border-4 bg-white p-6 gap-6"
            style={{ borderColor: colors.purple }}
          >
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
              Design: Natália Chies (
              <a
                target="_blank"
                href="https://github.com/ntlchs"
                className="underline"
              >
                github.com/ntlchs
              </a>
              )
            </p>
          </div>
        </div>
      )}
    </header>
  );
}
