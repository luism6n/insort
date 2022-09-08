import React, { useState } from "react";
import { Button, TextInput, Title } from "./designSystem";

export function JoinRoom(props: { join: (playerName: string) => void }) {
  const [nameInput, setNameInput] = useState("");

  return (
    <div className="flex flex-col justify-center w-1/2">
      <Title>Join Room</Title>
      <TextInput input={nameInput} setInput={setNameInput} />
      <div className="flex justify-center">
        <Button onClick={() => props.join(nameInput)}>Join</Button>
      </div>
    </div>
  );
}
