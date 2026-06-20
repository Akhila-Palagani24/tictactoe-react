import { useState, useEffect, useCallback } from "react";

const WIN_COMBOS = [
  [0,1,2],[3,4,5],[6,7,8], // rows
  [0,3,6],[1,4,7],[2,5,8], // cols
  [0,4,8],[2,4,6],         // diags
];

function checkWinner(board) {
  for (const [a,b,c] of WIN_COMBOS) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a,b,c] };
    }
  }
  return null;
}

function getRandomMove(board) {
  const free = board.map((v,i) => v === null ? i : null).filter(v => v !== null);
  if (free.length === 0) return null;
  return free[Math.floor(Math.random() * free.length)];
}

const EMPTY = Array(9).fill(null);

export default function TicTacToe() {
  const [board, setBoard] = useState(EMPTY);
  const [status, setStatus] = useState("idle"); // idle | playing | won | lost | tie
  const [winLine, setWinLine] = useState(null);
  const [message, setMessage] = useState("");
  const [xIsNext, setXIsNext] = useState(false); // false = user's turn (O), true = computer (X)
  const [history, setHistory] = useState([]);

  const startGame = useCallback(() => {
    const fresh = Array(9).fill(null);
    fresh[4] = "X"; // computer always starts center
    setBoard(fresh);
    setStatus("playing");
    setWinLine(null);
    setMessage("");
    setXIsNext(false); // user goes next
    setHistory(["Computer placed X in the center."]);
  }, []);

  const handleClick = (idx) => {
    if (status !== "playing" || xIsNext || board[idx] !== null) return;

    const next = [...board];
    next[idx] = "O";
    const win = checkWinner(next);

    if (win) {
      setBoard(next);
      setWinLine(win.line);
      setStatus("won");
      setMessage("You won! 🎉");
      setHistory(h => [...h, `You placed O on square ${idx + 1}.`, "You won!"]);
      return;
    }

    const full = next.every(v => v !== null);
    if (full) {
      setBoard(next);
      setStatus("tie");
      setMessage("It's a tie!");
      setHistory(h => [...h, `You placed O on square ${idx + 1}.`, "It's a tie!"]);
      return;
    }

    setBoard(next);
    setXIsNext(true);
    setHistory(h => [...h, `You placed O on square ${idx + 1}.`]);
  };

  // Computer move
  useEffect(() => {
    if (status !== "playing" || !xIsNext) return;

    const timer = setTimeout(() => {
      const next = [...board];
      const move = getRandomMove(next);
      if (move === null) return;
      next[move] = "X";

      const win = checkWinner(next);
      if (win) {
        setBoard(next);
        setWinLine(win.line);
        setStatus("lost");
        setMessage("Computer wins! 🤖");
        setHistory(h => [...h, `Computer placed X on square ${move + 1}.`, "Computer wins!"]);
        return;
      }

      const full = next.every(v => v !== null);
      if (full) {
        setBoard(next);
        setStatus("tie");
        setMessage("It's a tie!");
        setHistory(h => [...h, `Computer placed X on square ${move + 1}.`, "It's a tie!"]);
        return;
      }

      setBoard(next);
      setXIsNext(false);
      setHistory(h => [...h, `Computer placed X on square ${move + 1}.`]);
    }, 500);

    return () => clearTimeout(timer);
  }, [xIsNext, status, board]);

  const cellLabel = (val, idx) => val ?? (idx + 1);

  const cellStyle = (val, idx) => {
    const isWin = winLine && winLine.includes(idx);
    let bg = "bg-slate-800 hover:bg-slate-700";
    if (val === null && status === "playing" && !xIsNext) bg = "bg-slate-800 hover:bg-slate-600 cursor-pointer";
    if (val === "X") bg = isWin ? "bg-amber-500" : "bg-slate-700";
    if (val === "O") bg = isWin ? "bg-emerald-500" : "bg-slate-700";
    if (val !== null || status !== "playing" || xIsNext) return bg.replace("hover:bg-slate-600", "").replace("cursor-pointer","");
    return bg;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 font-mono">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-widest text-amber-400 mb-1">TIC‑TAC‑TOE</h1>
        <p className="text-slate-400 text-sm tracking-wider">YOU = O &nbsp;·&nbsp; COMPUTER = X</p>
      </div>

      {/* Status bar */}
      <div className="mb-6 h-8 flex items-center justify-center">
        {status === "idle" && (
          <p className="text-slate-400 text-sm">Press <span className="text-amber-400 font-bold">New Game</span> to start</p>
        )}
        {status === "playing" && (
          <p className={`text-sm font-semibold tracking-wider ${xIsNext ? "text-amber-400" : "text-emerald-400"}`}>
            {xIsNext ? "⏳ Computer is thinking…" : "🎯 Your turn — pick a square"}
          </p>
        )}
        {(status === "won" || status === "lost" || status === "tie") && (
          <p className={`text-lg font-bold tracking-wider ${status === "won" ? "text-emerald-400" : status === "lost" ? "text-red-400" : "text-slate-300"}`}>
            {message}
          </p>
        )}
      </div>

      {/* Board */}
      <div className="grid grid-cols-3 gap-2 mb-8">
        {board.map((val, idx) => {
          const isWin = winLine && winLine.includes(idx);
          const clickable = val === null && status === "playing" && !xIsNext;
          return (
            <button
              key={idx}
              onClick={() => handleClick(idx)}
              disabled={!clickable}
              className={[
                "w-24 h-24 rounded-lg text-2xl font-bold transition-all duration-150 select-none border-2",
                val === "X"
                  ? isWin ? "bg-amber-500 border-amber-300 text-white scale-105" : "bg-slate-700 border-slate-600 text-amber-400"
                  : val === "O"
                  ? isWin ? "bg-emerald-500 border-emerald-300 text-white scale-105" : "bg-slate-700 border-slate-600 text-emerald-400"
                  : clickable
                  ? "bg-slate-800 border-slate-600 text-slate-500 hover:bg-slate-700 hover:border-emerald-500 hover:text-emerald-400 cursor-pointer"
                  : "bg-slate-800 border-slate-700 text-slate-600 cursor-default",
              ].join(" ")}
            >
              {cellLabel(val, idx)}
            </button>
          );
        })}
      </div>

      {/* New game button */}
      <button
        onClick={startGame}
        className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold tracking-widest rounded-lg transition-colors text-sm mb-8"
      >
        {status === "idle" ? "NEW GAME" : "PLAY AGAIN"}
      </button>

      {/* Move history */}
      {history.length > 0 && (
        <div className="w-full max-w-xs bg-slate-900 rounded-lg p-4 border border-slate-800">
          <p className="text-xs text-slate-500 font-bold tracking-widest mb-2">MOVE LOG</p>
          <ul className="text-xs text-slate-400 space-y-1 max-h-32 overflow-y-auto">
            {history.map((h, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-slate-600">{i + 1}.</span>
                <span className={h.includes("won") || h.includes("tie") ? "text-amber-400 font-bold" : ""}>{h}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
