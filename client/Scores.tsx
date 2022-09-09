import React, { Fragment } from "react";
import { RoomState } from "../types/types";
import { admin } from "./Room";

// @ts-ignore
import trophyIcon from "../assets/trophy_icon.png";
// @ts-ignore
import crownIcon from "../assets/crown_small.png";

export function Scores(props: { roomState: RoomState; playerId: string }) {
  function getScoreString(id: string) {
    let totalScore = props.roomState.scores[id];
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
        <ul className="flex justify-around">
          <li>Team red: {totalTeamScore("red")}</li>
          <li>Team blue: {totalTeamScore("blue")}</li>
        </ul>
      </Fragment>
    );
  } else {
    teamScores = null;
  }

  let maxOverallScoreId: string | null = null;
  let maxOverallScore = 0;
  for (let id of props.roomState.playerIds) {
    if (props.roomState.scores[id] > maxOverallScore) {
      maxOverallScore = props.roomState.scores[id];
      maxOverallScoreId = id;
    } else if (props.roomState.scores[id] === maxOverallScore) {
      maxOverallScoreId = null;
    }
  }

  let maxMatchScoreId: string | null = null;
  let maxMatchScore = 0;
  if (props.roomState.match) {
    for (let id of props.roomState.playerIds) {
      if (props.roomState.match.scores[id] > maxMatchScore) {
        maxMatchScore = props.roomState.match.scores[id];
        maxMatchScoreId = id;
      } else if (props.roomState.match.scores[id] === maxMatchScore) {
        maxMatchScoreId = null;
      }
    }
  }

  return (
    <div className="pb-2 h-full overflow-y-scroll" style={{ height: 200 }}>
      {teamScores}
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th>Player</th>
            <th>Overall Score</th>
            {props.roomState.match ? <th>Match Score</th> : null}
          </tr>
        </thead>
        {props.roomState.playerIds.map((id) => {
          return (
            <tr key={id}>
              <td className="text-center">{props.roomState.playerNames[id]}</td>
              <td className="text-center relative">
                {maxOverallScoreId === id && (
                  <img
                    className="absolute"
                    style={{
                      height: "1rem",
                      left: "65%",
                      top: 5,
                    }}
                    src={crownIcon}
                  />
                )}
                {props.roomState.scores[id]}
              </td>
              {props.roomState.match ? (
                <td className="text-center relative">
                  {maxMatchScoreId === id && (
                    <img
                      className="absolute"
                      style={{
                        height: "1rem",
                        left: "65%",
                        top: 5,
                      }}
                      src={trophyIcon}
                    />
                  )}
                  <p>{props.roomState.match.scores[id]}</p>
                </td>
              ) : null}
            </tr>
          );
        })}
      </table>
    </div>
  );
}
