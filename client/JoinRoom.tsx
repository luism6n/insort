import React, { useState } from "react";
import { Button, Title } from "./designSystem";
export function JoinRoom(props: { join: (playerName: string) => void }) {
  const [nameInput, setNameInput] = useState("");

  return (
    <div className="flex flex-col justify-center h-full">
      <Title>Join Room</Title>
      <input
        className="border border-black"
        type="text"
        value={nameInput}
        onChange={(e) => setNameInput(e.target.value)}
      ></input>
      <Button onClick={() => props.join(nameInput)}>Join</Button>
    </div>
  );
}
