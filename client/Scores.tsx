import React, { Fragment } from "react";
import { RoomState } from "../types/types";
import { admin } from "./Room";

export function Scores(props: { roomState: RoomState; playerId: string }) {
  function getScoreString(id: string) {
    let totalScore = props.roomState.scores[id];
    console.log({ totalScore });
    console.log(props.roomState.match?.scores);
    if (props.roomState.match) {
      return props.roomState.match.scores[id] + " (" + totalScore + ")";
    } else {
      return totalScore;
    }
  }

  function totalTeamScore(team: string) {
    let total = 0;
    for (let id of props.roomState.playerIds) {
      if (props.roomState.match.teams[id] === team) {
        total += props.roomState.match.scores[id];
      }
    }
    return total;
  }

  let teamScores;
  if (props.roomState.match?.gameMode === "teams") {
    teamScores = (
      <Fragment>
        <ul>
          <li>Team red: {totalTeamScore("red")}</li>
          <li>Team blue: {totalTeamScore("blue")}</li>
        </ul>
      </Fragment>
    );
  } else {
    teamScores = null;
  }

  return (
    <Fragment>
      {teamScores}
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
              {props.roomState.playerNames[id]}: {getScoreString(id)}
              {id === admin(props.roomState) ? " (admin)" : ""}
              {id === props.playerId ? " (you)" : ""}
              {props.roomState.match?.gameMode === "teams"
                ? " (team " + props.roomState.match.teams[id] + ")"
                : ""}
            </li>
          );
        })}
      </ul>
    </Fragment>
  );
}
