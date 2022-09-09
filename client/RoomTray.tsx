import React, { Fragment, useState } from "react";
import { RoomState } from "../types/types";
import { Chat } from "./Chat";
import { colors } from "./colors";
import { Scores } from "./Scores";

// @ts-ignore
import expandIcon from "../assets/expand_up.png";
// @ts-ignore
import collapseIcon from "../assets/expand_down.png";

function RoomTrayHeader(props: {
  changeTeams: () => void;
  openTray: boolean;
  setOpenTray: React.Dispatch<React.SetStateAction<boolean>>;
  gameMode: string | null;
  title: string;
  toggleContent: () => void;
}) {
  return (
    <div className="flex justify-between items-center" style={{ height: 50 }}>
      {props.gameMode === "teams" ? (
        <button className="underline" onClick={props.changeTeams}>
          Switch Team
        </button>
      ) : (
        // div is here for flex to justify-between
        <div />
      )}
      <p>
        {props.title} (see{" "}
        <button className="underline" onClick={props.toggleContent}>
          {props.title === "chat" ? "scores" : "chat"}
        </button>
        )
      </p>
      <div onClick={() => props.setOpenTray(!props.openTray)}>
        <img
          src={props.openTray ? collapseIcon : expandIcon}
          alt="Expand settings tray"
        />
      </div>
    </div>
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
  const [mode, setMode] = useState<"chat" | "scores">("chat");

  return (
    <div className="relative w-full h-0">
      <div
        className="flex justify-center w-full border-t-4 p-2"
        style={{
          position: "absolute",
          backgroundColor: colors.yellow,
          borderColor: colors.purple,
          top: openTray ? -250 : -50,
          height: 250,
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
            toggleContent={() =>
              setMode((m) => (m === "chat" ? "scores" : "chat"))
            }
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
