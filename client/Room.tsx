import { RoomTray } from "./RoomTray";
import { Match } from "./Match";
import { JoinRoom } from "./JoinRoom";
import React, { Fragment, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { RoomState } from "../types/types";
import { RoomSettings } from "./RoomSettings";
import { useSocket } from "./useSocket";
import { Button, Toast } from "./designSystem";
import { colors } from "./colors";

export function admin(state: RoomState) {
  return state.playerIds[0];
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
        <div className="w-1/2">
          <RoomSettings
            deckOptions={roomState.deckOptions}
            selectedDeck={selectedDeck}
            setSelectedDeck={setSelectedDeck}
            gameModeOptions={roomState.gameModeOptions}
            selectedGameMode={selectedGameMode}
            setSelectedGameMode={setSelectedGameMode}
          />
        </div>
        <div className="flex">
          <Button onClick={() => newGame(selectedDeck, selectedGameMode)}>
            Play
          </Button>
        </div>
      </Fragment>
    );
  } else {
    content = (
      <Fragment>
        <div className="flex h-0 relative" style={{ top: -50, left: "-45%" }}>
          <Button unique="back" onClick={changeRoomSettings}>
            <span className="sr-only">Back to room settings</span>
          </Button>
        </div>
        <Match
          roomId={roomId}
          changeNextCardPosition={changeNextCardPosition}
          placeCard={placeCard}
          newGame={() => newGame(selectedDeck, selectedGameMode)}
          playerId={playerId}
          roomState={roomState}
        />
      </Fragment>
    );
  }

  let backgroundColor = "bg-gray-200";
  if (roomState?.match?.gameMode === "Teams") {
    if (roomState.match.teams[playerId] === "red") {
      backgroundColor = colors.red;
    } else {
      backgroundColor = colors.blue;
    }
  }

  return (
    <div className="w-full h-full" style={{ backgroundColor: backgroundColor }}>
      <div className="flex flex-1 flex-col justify-start items-center h-full w-full max-w-xl m-auto">
        {content}
      </div>
      {roomState && (
        <RoomTray
          roomState={roomState}
          playerId={playerId}
          chatMessages={chatMessages}
          sendChatMessage={sendChatMessage}
          changeTeams={changeTeams}
        />
      )}
      {toast.message !== "" && (
        <Toast message={toast.message} type={toast.type} />
      )}
    </div>
  );
}
