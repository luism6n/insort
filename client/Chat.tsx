import React, { useState } from "react";
import { RoomState } from "../types/types";
import { Button, TextInput } from "./designSystem";

export function Chat(props: {
  playerNames: { [id: string]: string };
  chatMessages: { text: string; senderId: string }[];
  sendChatMessage: (text: string) => void;
}) {
  const [chatInput, setChatInput] = useState("");

  function submitChatMessage(e: React.FormEvent) {
    e.preventDefault();

    if (chatInput) {
      setChatInput("");
      props.sendChatMessage(chatInput);
    }
  }

  return (
    <div>
      <p>Chat</p>
      <ul>
        {props.chatMessages.map(
          (m: { text: string; senderId: string; id: string }) => (
            <li key={m.id}>
              {props.playerNames[m.senderId]}: {m.text}
            </li>
          )
        )}
      </ul>
      <form onSubmit={submitChatMessage}>
        <TextInput input={chatInput} setInput={setChatInput} />
        <Button type="submit">Send</Button>
      </form>
    </div>
  );
}
