import React, { useState } from "react";
import { Button, TextInput, Title } from "./designSystem";

export function JoinRoom(props: { join: (playerName: string) => void }) {
  const [nameInput, setNameInput] = useState("");

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    props.join(nameInput);
  }

  return (
    <div className="flex flex-col justify-center w-1/2">
      <Title>Join Room</Title>
      <form onSubmit={handleJoin} className="flex justify-center">
        <TextInput input={nameInput} setInput={setNameInput} />
        <Button type="submit">Join</Button>
      </form>
    </div>
  );
}
