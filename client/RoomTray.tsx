import React, { Fragment, useEffect, useState } from "react";
import { RoomState } from "../types/types";
import { Chat } from "./Chat";
import { colors } from "./colors";
import { Scores } from "./Scores";
import { motion } from "framer-motion";

// @ts-ignore
import expandIcon from "../assets/expand_up.png";
// @ts-ignore
import collapseIcon from "../assets/expand_down.png";
import SendFeedback from "./SendFeedback";

function RoomTrayHeader(props: {
  changeTeams: () => void;
  openTray: boolean;
  setOpenTray: React.Dispatch<React.SetStateAction<boolean>>;
  gameMode: string | null;
  title: string;
  toggleContent: () => void;
  newMessages: boolean;
}) {
  const [openFeedbackOverlay, setOpenFeedbackOverlay] = useState(false);

  const chatSpan = props.newMessages ? (
    <motion.span
      transition={{ duration: 0.5, repeat: Infinity }}
      animate={{ color: colors.red }}
      initial={{ color: colors.purple }}
    >
      chat
    </motion.span>
  ) : (
    <span>chat</span>
  );

  return (
    <Fragment>
      <div className="flex justify-between items-center" style={{ height: 30 }}>
        <div onClick={() => props.setOpenTray(!props.openTray)}>
          <img
            src={props.openTray ? collapseIcon : expandIcon}
            alt="Expand settings tray"
          />
        </div>
        <p>
          <button className="underline" onClick={() => props.setOpenTray(true)}>
            {props.title === "chat" ? chatSpan : "scores"}
          </button>{" "}
          (see{" "}
          <button className="underline" onClick={props.toggleContent}>
            {props.title === "chat" ? "scores" : chatSpan}
          </button>
          )
        </p>
        <button
          className="underline"
          onClick={() => setOpenFeedbackOverlay(true)}
        >
          Feedback
        </button>
      </div>
      <SendFeedback
        open={openFeedbackOverlay}
        setOpen={setOpenFeedbackOverlay}
      />
    </Fragment>
  );
}

export function RoomTray(props: {
  roomState: RoomState;
  playerId: string;
  chatMessages: { text: string; senderId: string }[];
  sendChatMessage: (text: string) => void;
  changeTeams: () => void;
}) {
  const [openTray, setOpenTray] = useState(false);
  const [mode, setMode] = useState<"chat" | "scores">("scores");
  const [newMessages, setNewMessages] = useState(false);
  const [firstRun, setFirstRun] = useState(true);

  useEffect(() => {
    if (firstRun) {
      setFirstRun(false);
      return;
    }

    setNewMessages(true);
  }, [props.chatMessages.length]);

  if (openTray && mode === "chat" && newMessages) {
    setNewMessages(false);
  }

  return (
    <div className="relative w-full h-0">
      <div
        className="flex justify-center w-full border-t-4 p-2"
        style={{
          position: "absolute",
          backgroundColor: colors.yellow,
          borderColor: colors.purple,
          top: openTray ? -240 : -40,
          height: 240,
          zIndex: 5,
        }}
      >
        <div className="flex flex-col max-w-xl w-full px-2 bg-grey-200">
          <RoomTrayHeader
            changeTeams={props.changeTeams}
            openTray={openTray}
            gameMode={props.roomState.match?.gameMode}
            setOpenTray={setOpenTray}
            title={mode}
            toggleContent={() => {
              setOpenTray(true);
              setMode((m) => (m === "chat" ? "scores" : "chat"));
            }}
            newMessages={newMessages}
          />
          <div className="flex w-full" style={{ height: 200 }}>
            {mode === "chat" ? (
              <div
                style={{
                  flex: 2,
                }}
                className="h-full"
              >
                <Chat
                  playerNames={props.roomState.playerNames}
                  chatMessages={props.chatMessages}
                  sendChatMessage={props.sendChatMessage}
                />
              </div>
            ) : (
              <div className="flex-1">
                <Scores playerId={props.playerId} roomState={props.roomState} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
