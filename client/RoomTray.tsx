import React, { Fragment, useState } from "react";
import { RoomState } from "../types/types";
import { Chat } from "./Chat";
import { colors } from "./colors";
import { Scores } from "./Scores";

// @ts-ignore
import expandIcon from "../assets/expand_up.png";
// @ts-ignore
import collapseIcon from "../assets/expand_down.png";

export function RoomTray(props: {
  roomState: RoomState;
  playerId: string;
  chatMessages: { text: string; senderId: string }[];
  sendChatMessage: (text: string) => void;
  changeTeams: () => void;
}) {
  const [openTray, setOpenTray] = useState(false);

  return (
    <div className="relative w-full h-0">
      <div
        className="flex justify-center w-full border-t-4"
        style={{
          position: "absolute",
          backgroundColor: colors.yellow,
          borderColor: colors.purple,
          top: openTray ? -250 : -50,
          height: 250,
        }}
      >
        <div className="flex flex-col max-w-xl w-full">
          <div
            className="flex justify-between items-center underline"
            style={{ height: 50 }}
          >
            {props.roomState.match?.gameMode === "teams" ? (
              <button onClick={props.changeTeams}>Switch Team</button>
            ) : (
              // div is here for flex to justify-between
              <div />
            )}
            <div onClick={() => setOpenTray(!openTray)}>
              <img
                src={openTray ? collapseIcon : expandIcon}
                alt="Expand settings tray"
              />
            </div>
          </div>
          <div className="flex w-full" style={{ height: 200 }}>
            <div className="flex-1">
              <Scores playerId={props.playerId} roomState={props.roomState} />
            </div>
            <div
              style={{
                flex: 2,
              }}
              className="h-full pb-2"
            >
              <Chat
                playerNames={props.roomState.playerNames}
                chatMessages={props.chatMessages}
                sendChatMessage={props.sendChatMessage}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
