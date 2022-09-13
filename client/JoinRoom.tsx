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
          placeholder="Enter username"
          value={nameInput}
          setValue={setNameInput}
        />
        <Button trackEventCls="umami--click--join-room" type="submit">
          Join
        </Button>
      </form>
    </div>
  );
}
