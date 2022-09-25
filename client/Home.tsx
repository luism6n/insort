import React from "react";
import { Link } from "react-router-dom";
import { nanoid } from "nanoid";
import { colors } from "./colors";
import { Button } from "./designSystem";
import Box from "./Box";
import { ev } from "./analytics";

export function Home() {
  function handleCreateRoom(e: React.MouseEvent) {
    e.preventDefault();

    ev("room created");
    window.location.href = `/r/${nanoid()}`;
  }

  return (
    <div className="flex flex-col p-2 max-w-xl w-full items-center gap-6">
      <Box>
        <p className="text-center">
          Welcome to <span className="italic">Insort</span>! A quiz-like card
          game to have fun with friends while testing your knowlegde. :)
        </p>
      </Box>
      <p>
        {/* This has to be an anchor tag, not a Link,
          so that we actually hit the server */}
        <a onClick={handleCreateRoom} href="#">
          <Button>Create Room</Button>
        </a>
      </p>
      <p>
        <Link
          className="text-sm text-center hover:text-red-800 umami--click--build-deck"
          to="/build-deck"
        >
          Submit your idea for a deck here!
        </Link>
      </p>
    </div>
  );
}
