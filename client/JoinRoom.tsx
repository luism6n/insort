import React, { useState } from "react";
import { Button, Input, Title } from "./designSystem";

export function JoinRoom(props: { join: (playerName: string) => void }) {
  const [nameInput, setNameInput] = useState("");

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    props.join(nameInput);
  }

  return (
    <div className="flex flex-col w-1/2">
      <Title>Join Room</Title>
      <form onSubmit={handleJoin} className="flex flex-col gap-2 items-center">
        <Input
          required
          label="Choose a name to join this room"
          placeholder="Enter username"
          value={nameInput}
          setValue={setNameInput}
        />
        <p className="text-sm text-center">
          Send the link to this room to your friends to play together!
        </p>
        <Button trackEventCls="umami--click--join-room" type="submit">
          Join
        </Button>
      </form>
    </div>
  );
}
