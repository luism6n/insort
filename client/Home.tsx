import React, { useState } from "react";
import { Link } from "react-router-dom";
import { nanoid } from "nanoid";
import { Button, Title } from "./designSystem";
import { ev } from "./analytics";
import { Privacy } from "./Privacy";
import { DeckSelection } from "./DeckSelection";

interface Props {
  selectedDeck: string;
  setSelectedDeck: React.Dispatch<React.SetStateAction<string>>;
}

export function Home(props: Props) {
  const [openPrivacyNotice, setOpenPrivacyNotice] = useState(false);

  function handleGoToBuildDeck(e: React.MouseEvent) {
    e.preventDefault();

    ev("go to build deck");
    window.location.href = "/build-deck";
  }

  return (
    <div className="flex flex-col p-2 max-w-xl w-full items-center">
      <p className="text-center">Welcome to Insort! Choose Deck to begin...</p>
      <DeckSelection
        selectedDeck={props.selectedDeck}
        setSelectedDeck={props.setSelectedDeck}
      />
      <p>
        <Link to={`/r/${nanoid()}`}>
          <Button>Create Room</Button>
        </Link>
      </p>
      <p>
        <a onClick={handleGoToBuildDeck} href="#">
          Submit your deck!
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
