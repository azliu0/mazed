import React, { useState, useEffect } from "react";

/**
 * teacher end page after the game ends
 *
 * @param {string} _id user _id
 * @param {object} gameState game state
 * @param {string} gamePin game pin
 */
const TeacherEndPage = (props) => {
  const [displayData, setDisplayData] = useState([]);

  useEffect(() => {
    let playerData = [];
    for (let playerid in props.gameState["players"]) {
      if (playerid !== props.gameState["teacher"]["_id"]) {
        let curPlayer = (
          <div key={playerData.length}>
            <div className="text-3xl">{props.gameState["players"][playerid]["name"]}</div>
            <div>Current Level: {props.gameState["players"][playerid]["level"]}</div>
            <div>x: {Math.round(props.gameState["players"][playerid].p.x * 100) / 100}</div>
            <div>y: {Math.round(props.gameState["players"][playerid].p.y * 100) / 100}</div>
            <div>
              questions answered: {props.gameState["players"][playerid]["flashcards_total"]}
            </div>
            <div>number of people tagged: {props.gameState["players"][playerid]["tags"]}</div>
            <div>active: {props.gameState["players"][playerid]["active"] ? "true" : "false"}</div>
          </div>
        );
        if (props.gameState["players"][playerid]["active"]) {
          playerData.push(curPlayer);
        } else {
          playerData.push(<div className="text-gray-400">{curPlayer}</div>);
        }
      }
    }
    setDisplayData(playerData);
  }, []);

  return (
    <>
      <div className="background">
        <div className="sheerbox">
          <div className="text-5xl">Game Ended</div>
          <div>
            {displayData.length ? (
              <>
                <div className="overflow-y-scroll h-[70vh]">
                  <div className="text-4xl h-auto">Player data:</div>
                  <div className>{displayData}</div>
                </div>
              </>
            ) : (
              <div>No one played the game sad</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TeacherEndPage;
