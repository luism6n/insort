import React, { useLayoutEffect, useState } from "react";
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

  useLayoutEffect(() => {
    let messages = document.getElementById("messages");
    messages.scrollTop = messages.scrollHeight;
  }, [props.chatMessages]);

  return (
    <div className="flex flex-col w-full h-full justify-between items-center">
      <div className="flex flex-col w-full h-full">
        <ul id="messages" style={{ height: 150 }} className="overflow-y-scroll">
          {props.chatMessages.map(
            (m: { text: string; senderId: string; id: string }) => (
              <li key={m.id}>
                {props.playerNames[m.senderId]}: {m.text}
              </li>
            )
          )}
        </ul>
        <form className="flex items-center" onSubmit={submitChatMessage}>
          <TextInput
            classes="flex-1"
            input={chatInput}
            setInput={setChatInput}
          />

          <Button unique="send" type="submit">
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
