import React, { useState } from "react";
import { ev } from "./analytics";
import { Button, Input, Title } from "./designSystem";
import { Privacy } from "./Privacy";

export function JoinRoom(props: { join: (playerName: string) => void }) {
  const [nameInput, setNameInput] = useState("");
  const [openPrivacyNotice, setOpenPrivacyNotice] = useState(false);

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();

    ev("join room");
    props.join(nameInput);
  }

  return (
    <div className="flex flex-col items-center">
      <Title>Join Room</Title>
      <form onSubmit={handleJoin} className="flex flex-col gap-2 items-center">
        <div className="flex-col items-start">
          <Input
            required
            label="Choose a nickname for this match"
            placeholder="Nickname"
            value={nameInput}
            setValue={setNameInput}
          />
        </div>
        <p className="text-sm text-center">
          Send the{" "}
          <a className="underline" href={window.location.href} target="_blank">
            link to this room
          </a>{" "}
          to your friends to play together!
        </p>
        <Button type="submit">Join</Button>
      </form>

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
