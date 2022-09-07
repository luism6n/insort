import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { RoomState } from "../types/types";

export function useSocket(
  roomId: string,
  setRoomState: React.Dispatch<React.SetStateAction<RoomState | null>>,
  setWarning: React.Dispatch<
    React.SetStateAction<{
      message: string;
      timeoutId: ReturnType<typeof setTimeout>;
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
        setWarning({ message: message, timeoutId: null });
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

  function changeNextPlacement(inc: number) {
    console.log(`emitting changeNextPlacement`, { inc });
    socket!.emit(`changeNextPlacement`, {
      increment: inc,
    });
  }

  return {
    socketLoading: !socket,
    changeNextPlacement,
    placeCard,
    newGame,
    chooseNewDeck,
    join,
    playerId: socket?.id,
  };
}
