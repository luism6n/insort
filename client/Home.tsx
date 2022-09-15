import React from "react";
import { Link } from "react-router-dom";
import { nanoid } from "nanoid";
import { colors } from "./colors";
import { Button } from "./designSystem";

export function Home() {
  return (
    <div className="h-full w-full max-w-xl flex flex-col items-center">
      <p
        className="max-w-sm mb-10 text-center mt-4 p-4 bg-white border-4"
        style={{ borderColor: colors.purple }}
      >
        Welcome to <span className="italic">Insort</span>! A quiz-like card game
        to have fun with friends while testing your knowlegde. :)
      </p>
      <div className="flex flex-col w-full items-center gap-6">
        <p>
          {/* This has to be an anchor tag, not a Link,
          so that we actually hit the server */}
          <a
            className="hover:text-red-800 umami--click--create-room"
            href={`/r/${nanoid()}`}
          >
            <Button>Create Room</Button>
          </a>
        </p>
        <p>
          {/* This has to be an anchor tag, not a Link,
            so that we actually hit the server */}
          <Link
            className="text-sm hover:text-red-800 umami--click--build-deck"
            to="/build-deck"
          >
            Do you have an idea for a deck? Submit your own...
          </Link>
        </p>
      </div>
    </div>
  );
}
