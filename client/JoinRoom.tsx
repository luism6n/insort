import React, { useState } from "react";
import { ev } from "./analytics";
import { Button, Input, Title } from "./designSystem";
import { Privacy } from "./Privacy";
import { useToast } from "./useToast";

export function JoinRoom(props: { join: (playerName: string) => void }) {
  const [nameInput, setNameInput] = useState("");
  const [openPrivacyNotice, setOpenPrivacyNotice] = useState(false);
  const { toast, setToast } = useToast();

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();

    ev("join room");
    props.join(nameInput);
  }

  function writeLinkToRoomToClipboard(e: React.MouseEvent) {
    e.preventDefault();

    ev("copy room link");

    navigator.clipboard.writeText(window.location.href);
    setToast({ type: "notification", message: "Link copied to clipboard!" });
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
        <Button type="submit">Join</Button>
        <p className="text-sm text-center">
          Send the link of this room to your friends to play together!
          <br />
          <a
            className="underline"
            href={window.location.href}
            onClick={writeLinkToRoomToClipboard}
            target="_blank"
          >
            copy link
          </a>
        </p>
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

      {toast}
    </div>
  );
}
