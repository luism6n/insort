import React from "react";
import { RoomState } from "../types/types";
import { admin } from "./Room";

export function Scores(props: { roomState: RoomState; playerId: string }) {
  return (
    <ul>
      {props.roomState.playerIds.map((id) => {
        return (
          <li
            style={{
              textDecoration:
                id === props.roomState.currentPlayerId ? "underline" : "",
            }}
            key={id}
          >
            {props.roomState.playerNames[id]}: {props.roomState.scores[id]}
            {id === admin(props.roomState) ? " (admin)" : ""}
            {id === props.playerId ? " (you)" : ""}
          </li>
        );
      })}
    </ul>
  );
}
