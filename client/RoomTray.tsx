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
import { Privacy } from "./Privacy";

function RoomTrayHeader(props: {
  changeTeams: () => void;
  openTray: boolean;
  setOpenTray: React.Dispatch<React.SetStateAction<boolean>>;
  gameMode: string | null;
  title: string;
  toggleContent: (mode: string) => void;
  newMessages: boolean;
}) {
  const [openFeedbackOverlay, setOpenFeedbackOverlay] = useState(false);
  const [openPrivacyOverlay, setOpenPrivacyOverlay] = useState(false);

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
      {/* clickable overlay that dismisses the tray */}
      {props.openTray && (
        <div
          onClick={() => props.setOpenTray(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "calc(100% - 240px)",
            opacity: 0.5,
            zIndex: 1,
            backgroundColor: "black",
          }}
        ></div>
      )}

      <div
        className="text-center grid grid-cols-4"
        style={{ zIndex: 2, height: 30 }}
      >
        <button
          className="text-left text-sm underline"
          onClick={() => setOpenPrivacyOverlay(true)}
        >
          privacy
        </button>
        <button
          className="underline text-right pr-2"
          onClick={() => props.toggleContent("scores")}
        >
          scores
        </button>
        <button
          className="underline text-left pl-2"
          onClick={() => props.toggleContent("chat")}
        >
          {chatSpan}
        </button>
        <button
          className="text-right text-sm underline"
          onClick={() => setOpenFeedbackOverlay(true)}
        >
          feedback
        </button>
      </div>
      <SendFeedback
        open={openFeedbackOverlay}
        setOpen={setOpenFeedbackOverlay}
      />
      <Privacy open={openPrivacyOverlay} setOpen={setOpenPrivacyOverlay} />
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
        className="flex justify-center w-full border-t-4 px-2"
        style={{
          position: "absolute",
          backgroundColor: colors.yellow,
          borderColor: colors.purple,
          top: openTray ? -240 : -40,
          height: 240,
          zIndex: 5,
        }}
      >
        <div className="flex flex-col max-w-xl w-full bg-grey-200">
          <RoomTrayHeader
            changeTeams={props.changeTeams}
            openTray={openTray}
            gameMode={props.roomState.match?.gameMode}
            setOpenTray={setOpenTray}
            title={mode}
            toggleContent={(m: "chat" | "scores") => {
              setOpenTray(true);
              setMode(m);
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
