import React, { useState, useEffect } from "react";

const TEAMS = ["A", "B", "C"];
const COLORS = {
  A: "#ff69b4",
  B: "#888888",
  C: "#000000",
  LOCKED: "#ffffe0",
  WINNER: "#90ee90",
};

export default function KinballScoreboard() {
  const [teamNames, setTeamNames] = useState({ A: "A팀", B: "B팀", C: "C팀" });
  const [scores, setScores] = useState({ A: 0, B: 0, C: 0 });
  const [lockedTeam, setLockedTeam] = useState(null);
  const [winner, setWinner] = useState(null);
  const [goalScore, setGoalScore] = useState(null);
  const [finalScore, setFinalScore] = useState(null);
  const [flashing, setFlashing] = useState(null);
  const [initialized, setInitialized] = useState(false);

  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  useEffect(() => {
    if (!initialized) {
      const names = {};
      TEAMS.forEach((t) => {
        names[t] = prompt(`${t}팀 이름을 입력하세요:`) || `${t}팀`;
      });
      const goal = parseInt(prompt("1차 점수를 입력하세요:"), 10) || 10;
      const final = parseInt(prompt("최종 승리 점수를 입력하세요:"), 10) || goal + 5;
      setTeamNames(names);
      setGoalScore(goal);
      setFinalScore(final);
      setInitialized(true);
    }
  }, [initialized]);

  const handlePenalty = (team) => {
    if (winner || team === lockedTeam) return;
    setHistory((h) => [...h, { scores, lockedTeam, winner }]);
    setRedoStack([]);

    const newScores = { ...scores };
    TEAMS.forEach((t) => {
      if (t !== team && t !== lockedTeam) newScores[t] += 1;
    });
    setScores(newScores);

    if (!lockedTeam && Object.values(newScores).some((s) => s >= goalScore)) {
      const minTeam = Object.entries(newScores).reduce((min, [t, s]) =>
        s < min[1] ? [t, s] : min
      )[0];
      setLockedTeam(minTeam);
    }

    if (
      lockedTeam &&
      !winner &&
      TEAMS.filter((t) => t !== lockedTeam).some((t) => newScores[t] >= finalScore)
    ) {
      const win = TEAMS.filter((t) => t !== lockedTeam).find(
        (t) => newScores[t] >= finalScore
      );
      setWinner(win);
      flashWinner(win);
    }
  };

  const flashWinner = (team) => {
    let count = 0;
    const interval = setInterval(() => {
      setFlashing((prev) => (prev === team ? null : team));
      count++;
      if (count >= 6) clearInterval(interval);
    }, 300);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setRedoStack((r) => [...r, { scores, lockedTeam, winner }]);
    setScores(prev.scores);
    setLockedTeam(prev.lockedTeam);
    setWinner(prev.winner);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((r) => r.slice(0, -1));
    setHistory((h) => [...h, { scores, lockedTeam, winner }]);
    setScores(next.scores);
    setLockedTeam(next.lockedTeam);
    setWinner(next.winner);
  };

  const resetScores = () => {
    if (!window.confirm("정말 점수를 리셋하겠습니까?")) return;
    setScores({ A: 0, B: 0, C: 0 });
    setLockedTeam(null);
    setWinner(null);
    setFlashing(null);
    setHistory([]);
    setRedoStack([]);
  };

  const getBoxStyle = (team) => {
    let background = COLORS[team];
    if (team === lockedTeam) background = COLORS.LOCKED;
    if (flashing === team) background = COLORS.WINNER;
    return {
      background,
      color: "white",          // 항상 흰색 텍스트
      flex: 1,
      minWidth: 0,
      height: "65vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
      padding: "1rem",
      borderRadius: "1rem",
      fontFamily: "Arial, sans-serif",
    };
  };

  return (
    <div style={{ minHeight: "90vh", padding: "1rem", background: "white" }}>
      {/* 상단바: Undo, Title, Reset, Redo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1rem",
        }}
      >
        {/* 왼쪽: 되돌리기 & 다시 실행 */}
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={handleUndo}
            style={{ padding: "1rem", fontFamily: "Arial, sans-serif", margin: 0 }}
          >
            되돌리기
          </button>
          <button
            onClick={handleRedo}
            style={{ padding: "1rem", fontFamily: "Arial, sans-serif", margin: 0 }}
          >
            다시 실행
          </button>
        </div>

        {/* 가운데: 타이틀 */}
        <h1
          style={{
            fontSize: "4vw",
            fontWeight: "bold",
            textAlign: "center",
            margin: 0,
            fontFamily: "Arial, sans-serif",
          }}
        >
          킨볼 점수판
        </h1>

        {/* 오른쪽: 점수 리셋 */}
        <button
          onClick={resetScores}
          style={{
            padding: "1rem 1rem",
            background: "#dc2626",
            color: "white",
            border: "none",
            borderRadius: "0.5rem",
            cursor: "pointer",
            fontFamily: "Arial, sans-serif",
            margin: 0,
          }}
        >
          점수 리셋
        </button>
      </div>

      {/* 팀 박스 */}
      <div style={{ display: "flex", gap: "1rem" }}>
        {TEAMS.map((team) => (
          <div key={team} style={getBoxStyle(team)}>
            <h2
              style={{
                fontSize: "4vw",
                fontWeight: "bold",
                margin: 0,
                paddingTop: 0,
              }}
            >
              {teamNames[team]}
            </h2>
            <div
              style={{
                fontSize: "18vw",
                fontWeight: "bold",
                margin: "0.25rem 0",
              }}
            >
              {scores[team]}
            </div>
            <button
              onClick={() => handlePenalty(team)}
              disabled={lockedTeam === team || !!winner}
              style={{
                padding: "1rem 2rem",
                fontSize: "1vw",
                borderRadius: "0.5rem",
                background: "white",
                color: "black",
                border: "1px solid gray",
                cursor: lockedTeam === team || !!winner ? "not-allowed" : "pointer",
                fontFamily: "Arial, sans-serif",
                marginTop: "auto",
              }}
            >
              실점
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
