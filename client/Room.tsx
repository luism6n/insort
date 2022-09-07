import { Match } from "./Match";
import { JoinRoom } from "./JoinRoom";
import React, { Fragment, useEffect, useState, Ref } from "react";
import { useParams } from "react-router-dom";
import { RoomState } from "../types/types";
import { motion } from "framer-motion";
import { ChooseDeck } from "./ChooseDeck";
import { Scores } from "./Scores";
import { useSocket } from "./useSocket";
import { Warning } from "./designSystem";

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
  const [warning, setWarning] = useState<{
    message: string;
    timeoutId: ReturnType<typeof setTimeout>;
  }>({ message: "", timeoutId: null });

  const {
    socketLoading,
    placeCard,
    changeNextPlacement,
    newGame,
    chooseNewDeck,
    join,
    playerId,
  } = useSocket(roomId, setRoomState, setWarning);

  function handleKeyNavigation(e: KeyboardEvent) {
    if (e.key === "ArrowRight") {
      changeNextPlacement(1);
    } else if (e.key === "ArrowLeft") {
      changeNextPlacement(-1);
    } else if (e.key === "Enter") {
      if (roomState && roomState.match && !roomState.match.concluded) {
        placeCard();
      }
    }
  }

  useEffect(() => {
    if (warning.message.length === 0) {
      return;
    }

    if (warning.timeoutId !== null) {
      console.log("clearing timeout id", warning.timeoutId);
      clearTimeout(warning.timeoutId);
    }

    const timeoutId = setTimeout(() => {
      setWarning({ message: "", timeoutId: null });
    }, 3000);
    console.log({ timeoutId });

    return () => {
      console.log("clearing timeout id", timeoutId);
      clearTimeout(timeoutId);
    };
  }, [warning]);

  useEffect(() => {
    // handleKeyNavigation closures on roomState, so we need to
    // add and remove the event listener when roomState changes
    document.addEventListener("keydown", handleKeyNavigation);

    return () => {
      document.removeEventListener("keydown", handleKeyNavigation);
    };
  }, [roomState]);

  let content = null;

  if (socketLoading) {
    content = <p>Loading...</p>;
  } else if (!roomState) {
    content = <JoinRoom join={join} />;
  } else if (roomState.match === null) {
    content = (
      <Fragment>
        <ChooseDeck
          deckOptions={roomState.deckOptions}
          selectedDeck={selectedDeck}
          setSelectedDeck={setSelectedDeck}
          newGame={() => newGame(selectedDeck)}
        />
        <Scores playerId={playerId} roomState={roomState} />
      </Fragment>
    );
  } else {
    content = (
      <Fragment>
        <Match
          roomId={roomId}
          changeNextPlacement={changeNextPlacement}
          placeCard={placeCard}
          newGame={newGame}
          selectedDeck={selectedDeck}
          chooseNewDeck={chooseNewDeck}
          playerId={playerId}
          roomState={roomState}
        />
        <Scores playerId={playerId} roomState={roomState} />
      </Fragment>
    );
  }

  return (
    <Fragment>
      {content}
      {warning.message !== "" && <Warning message={warning.message} />}
    </Fragment>
  );
}
