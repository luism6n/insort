import React, { useState } from "react";
import { Link } from "react-router-dom";
import { nanoid } from "nanoid";
import { colors } from "./colors";
import { Button } from "./designSystem";
import Box from "./Box";
import { ev } from "./analytics";
import { Privacy } from "./Privacy";

export function Home() {
  const [openPrivacyNotice, setOpenPrivacyNotice] = useState(false);

  function handleCreateRoom(e: React.MouseEvent) {
    e.preventDefault();

    ev("create room");
    window.location.href = `/r/${nanoid()}`;
  }

  function handleGoToBuildDeck(e: React.MouseEvent) {
    e.preventDefault();

    ev("go to build deck");
    window.location.href = "/build-deck";
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
        <a onClick={handleGoToBuildDeck} href="#">
          Submit your idea for a deck here!
        </a>
      </p>

      <button
        onClick={() => setOpenPrivacyNotice(true)}
        className="mt-8 underline text-sm"
      >
        privacy
      </button>

      <Privacy
        open={openPrivacyNotice}
        setOpen={setOpenPrivacyNotice}
      ></Privacy>
    </div>
  );
}
