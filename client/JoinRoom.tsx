import React, { useState } from "react";
import { Button, Input, Title } from "./designSystem";

export function JoinRoom(props: { join: (playerName: string) => void }) {
  const [nameInput, setNameInput] = useState("");

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
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
        <Button trackEventCls="umami--click--join-room" type="submit">
          Join
        </Button>
      </form>
    </div>
  );
}
