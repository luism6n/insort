import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { RoomState } from "../types/types";

export function useSocket(
  roomId: string,
  setRoomState: React.Dispatch<React.SetStateAction<RoomState | null>>,
  setMessage: React.Dispatch<
    React.SetStateAction<{
      message: string;
      timeoutId: ReturnType<typeof setTimeout>;
      type: string;
    }>
  >
) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!socket) {
      setSocket(io());
    } else {
      socket.on(`roomState`, (data: RoomState) => {
        setRoomState(data);
      });

      socket.on("warning", (message: string) => {
        setMessage({ message: message, timeoutId: null, type: "warning" });
      });

      socket.on("notification", (message: string) => {
        setMessage({ message: message, timeoutId: null, type: "notification" });
      });
    }
  }, [socket]);

  function placeCard() {
    console.log(`emitting placeCard`);
    socket!.emit("placeCard");
  }

  function newGame(selectedDeck: number) {
    console.log("emitting newGame", { selectedDeck });
    socket!.emit("newGame", { selectedDeck });
  }

  function chooseNewDeck() {
    console.log("emitting chooseNewDeck");
    socket!.emit("chooseNewDeck");
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

  return {
    socketLoading: !socket,
    changeNextCardPosition,
    placeCard,
    newGame,
    chooseNewDeck,
    join,
    playerId: socket?.id,
  };
}
