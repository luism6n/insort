import { RoomTray } from "./RoomTray";
import { Match } from "./Match";
import { JoinRoom } from "./JoinRoom";
import React, { Fragment, useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { RoomState } from "../types/types";
import { RoomSettings } from "./RoomSettings";
import { useSocket } from "./useSocket";
import { Button } from "./designSystem";
import { colors } from "./colors";
import { useToast } from "./useToast";
import { ev } from "./analytics";

export function admin(state: RoomState) {
  return state.playerIds[0];
}

interface Props {
  selectedDeck: string;
  setSelectedDeck: React.Dispatch<React.SetStateAction<string>>;
}

function useQuery() {
  const { search } = useLocation();

  return React.useMemo(() => new URLSearchParams(search), [search]);
}

export function Room(props: Props) {
  let { roomId } = useParams();
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [selectedGameMode, setSelectedGameMode] = useState("");
  const [chatMessages, setChatMessages] = useState<
    { text: string; senderId: string }[]
  >([]);

  console.log(props.selectedDeck);

  const { toast, setToast } = useToast();

  const {
    socketLoading,
    placeCard,
    changeNextCardPosition,
    newGame,
    changeRoomSettings,
    changeTeams,
    join,
    sendChatMessage,
    cancelSuspense,
    playerId,
  } = useSocket(roomId, setRoomState, setToast, setChatMessages);

  useEffect(() => {
    if (socketLoading) {
      return;
    }

    const lastRoomId = window.localStorage.getItem("roomId");
    if (!lastRoomId) {
      return;
    } else if (lastRoomId === roomId) {
      const playerName = window.localStorage.getItem("playerName");
      join(playerName);
    }
  }, [socketLoading]);

  let content = null;

  function saveNameAndRoomAndJoin(playerName: string) {
    window.localStorage.setItem("playerName", playerName);
    window.localStorage.setItem("roomId", roomId);
    console.log({ roomState });
    join(playerName);
  }

  if (socketLoading) {
    content = <p>Loading...</p>;
  } else if (!roomState) {
    content = <JoinRoom join={saveNameAndRoomAndJoin} />;
  } else if (roomState.match === null) {
    content = (
      <RoomSettings
        numPlayers={roomState.playerIds.length}
        playerId={playerId}
        admin={admin(roomState)}
        adminName={roomState.playerNames[admin(roomState)]}
        selectedDeck={props.selectedDeck}
        setSelectedDeck={props.setSelectedDeck}
        selectedGameMode={selectedGameMode}
        setSelectedGameMode={setSelectedGameMode}
        newGame={newGame}
      />
    );
  } else {
    content = (
      <Fragment>
        <div
          className="flex h-0 relative"
          style={{ top: -54, left: "calc(-50% + 5px + 1rem)" }}
        >
          <Button
            unique="back"
            onClick={() => {
              ev("go back to room settings");
              changeRoomSettings();
            }}
          >
            <span className="sr-only">Back to room settings</span>
          </Button>
        </div>
        <Match
          cancelSuspense={cancelSuspense}
          roomId={roomId}
          changeNextCardPosition={changeNextCardPosition}
          placeCard={placeCard}
          newGame={() => newGame(props.selectedDeck, selectedGameMode)}
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
      backgroundColor = colors.green;
    }
  }

  return (
    <div className="w-full h-full p-x-2">
      <div className="flex f  lex-1 flex-col justify-start items-center h-full max-w-xl px-2 m-auto">
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
      {toast}
    </div>
  );
}
