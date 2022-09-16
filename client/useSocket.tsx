import { nanoid } from "nanoid";
import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { RoomState } from "../types/types";

export function useSocket(
  roomId: string,
  setRoomState: React.Dispatch<React.SetStateAction<RoomState | null>>,
  setToast: (t: { message: string; type: string }) => void,
  setChatMessages: React.Dispatch<
    React.SetStateAction<{ text: string; senderId: string }[]>
  >
) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!socket) {
      setSocket(io());
    } else {
      socket.on("chatMessage", (data: { text: string; senderId: string }) => {
        let message = { ...data, id: nanoid() };
        setChatMessages((chatMessages) => {
          if (chatMessages.length > 200) {
            return [...chatMessages.slice(1), message];
          } else {
            return [...chatMessages, message];
          }
        });
      });

      socket.on(`roomState`, (data: RoomState) => {
        setRoomState(data);
      });

      socket.on("warning", (message: string) => {
        setToast({ message: message, type: "warning" });
      });

      socket.on("notification", (message: string) => {
        setToast({ message: message, type: "notification" });
      });
    }
  }, [socket]);

  function cancelSuspense() {
    console.log("emitting cancelSuspense");
    socket!.emit("cancelSuspense");
  }

  function sendChatMessage(text: string) {
    console.log("emitting chatMessage:", text);
    socket!.emit("chatMessage", { text });
  }

  function placeCard() {
    console.log(`emitting placeCard`);
    socket!.emit("placeCard");
  }

  function newGame(selectedDeck: string, selectedGameMode: number) {
    console.log("emitting newGame", { selectedDeck, selectedGameMode });
    socket!.emit("newGame", { selectedDeck, selectedGameMode });
  }

  function changeRoomSettings() {
    console.log("emitting changeRoomSettings");
    socket!.emit("changeRoomSettings");
  }

  function join(playerName: string) {
    socket!.emit("join", { roomId: roomId, playerName });
  }

  function changeNextCardPosition(inc: number) {
    console.log(`emitting changeNextCardPosition`, { inc });
    socket!.emit(`changeNextCardPosition`, {
      increment: inc,
    });
  }

  function changeTeams() {
    console.log(`emitting changeTeams`);
    socket!.emit(`changeTeams`);
  }

  return {
    socketLoading: !socket,
    changeNextCardPosition,
    placeCard,
    newGame,
    changeRoomSettings,
    sendChatMessage,
    changeTeams,
    join,
    cancelSuspense,
    playerId: socket?.id,
  };
}
