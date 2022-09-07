import { Chat } from "./Chat";
import { Match } from "./Match";
import { JoinRoom } from "./JoinRoom";
import React, { Fragment, useEffect, useState, Ref } from "react";
import { useParams } from "react-router-dom";
import { RoomState } from "../types/types";
import { motion } from "framer-motion";
import { RoomSettings } from "./RoomSettings";
import { Scores } from "./Scores";
import { useSocket } from "./useSocket";
import { Button, Toast } from "./designSystem";

export function admin(state: RoomState) {
  return state.playerIds[0];
}

export function Card({
  content,
  value,
  unit,
  x,
  y,
  comesFrom = { x: 0, y: 0 },
  innerRef = null,
  zIndex = 0,
}: {
  content: number | string;
  value: number | string;
  unit: string;
  x?: number;
  y?: number;
  comesFrom?: { x: number; y: number };
  innerRef?: Ref<HTMLDivElement> | null;
  zIndex?: number;
}) {
  let style: any = { position: "relative" };

  if (x !== undefined || y !== undefined) {
    style = {
      position: "absolute",
    };
  }

  return (
    <motion.div
      style={{ ...style, zIndex }}
      animate={{ left: x, top: y }}
      transition={{ duration: 0.25 }}
      initial={{ left: comesFrom.x, top: comesFrom.y }}
      ref={innerRef}
      className="border border-black flex-shrink-0 w-36 h-36 bg-gray-300 text-center text-align-center flex flex-col justify-between p-2"
    >
      <p>{content}</p>
      <p className="font-bold  mt-auto">
        {value} {unit}
      </p>
    </motion.div>
  );
}
export function Room() {
  let { roomId } = useParams();
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [selectedDeck, setSelectedDeck] = useState(0);
  const [selectedGameMode, setSelectedGameMode] = useState(0);
  const [toast, setToast] = useState<{
    message: string;
    timeoutId: ReturnType<typeof setTimeout>;
    type: string;
  }>({ message: "", timeoutId: null, type: "" });
  const [chatMessages, setChatMessages] = useState<
    { text: string; senderId: string }[]
  >([]);

  const {
    socketLoading,
    placeCard,
    changeNextCardPosition,
    newGame,
    changeRoomSettings,
    changeTeams,
    join,
    sendChatMessage,
    playerId,
  } = useSocket(roomId, setRoomState, setToast, setChatMessages);

  useEffect(() => {
    if (toast.message.length === 0) {
      return;
    }

    if (toast.timeoutId !== null) {
      console.log("clearing timeout id", toast.timeoutId);
      clearTimeout(toast.timeoutId);
    }

    const timeoutId = setTimeout(() => {
      setToast({ message: "", timeoutId: null, type: "" });
    }, 3000);
    console.log({ timeoutId });

    return () => {
      console.log("clearing timeout id", timeoutId);
      clearTimeout(timeoutId);
    };
  }, [toast]);

  let content = null;

  if (socketLoading) {
    content = <p>Loading...</p>;
  } else if (!roomState) {
    content = <JoinRoom join={join} />;
  } else if (roomState.match === null) {
    content = (
      <Fragment>
        <RoomSettings
          deckOptions={roomState.deckOptions}
          selectedDeck={selectedDeck}
          setSelectedDeck={setSelectedDeck}
          gameModeOptions={roomState.gameModeOptions}
          selectedGameMode={selectedGameMode}
          setSelectedGameMode={setSelectedGameMode}
        />
        <div className="flex">
          <Button onClick={() => newGame(selectedDeck, selectedGameMode)}>
            Play
          </Button>
        </div>
        <Scores playerId={playerId} roomState={roomState} />
      </Fragment>
    );
  } else {
    content = (
      <Fragment>
        <Match
          roomId={roomId}
          changeNextCardPosition={changeNextCardPosition}
          placeCard={placeCard}
          newGame={() => newGame(selectedDeck, selectedGameMode)}
          playerId={playerId}
          roomState={roomState}
        />
        <div className="flex">
          <Button onClick={changeRoomSettings}>Change Room Settings</Button>
          {roomState.match.gameMode === "teams" && (
            <Button onClick={changeTeams}>Change Teams</Button>
          )}
        </div>
        <Scores playerId={playerId} roomState={roomState} />
      </Fragment>
    );
  }

  return (
    <Fragment>
      <div className="flex flex-col justify-between flex-1">
        <div className="flex flex-col justify-center items-center flex-2">
          {content}
        </div>
        <div className="flex flex-1">
          {roomState && (
            <Chat
              playerNames={roomState.playerNames}
              chatMessages={chatMessages}
              sendChatMessage={sendChatMessage}
            />
          )}
        </div>
      </div>
      {toast.message !== "" && (
        <Toast message={toast.message} type={toast.type} />
      )}
    </Fragment>
  );
}
