import { Server } from "socket.io";

const io = new Server(3000, {});
console.log("listening on port 3000");

let queue = null;

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("disconnect", () => {
    if (queue === socket) {
      queue = null;
    }
    console.log("user disconnected");
  });
  if (queue === null) {
    queue = socket;
  } else {
    // new game
    const game = new Game(queue, socket);
    io.to(queue.id).emit("start", "o");
    io.to(socket.id).emit("start", "x");
    queue = null;
  }
});

class Game {
  constructor(player1, player2) {
    this.player1 = player1;
    this.player2 = player2;

    this.data = Array(9).fill(0);
    this.play().then(() => {
      this.player1.disconnect();
      this.player2.disconnect();
    });
  }

  async waitForMove(player) {
    return new Promise((resolve, reject) => {
      const listener = (move) => {
        resolve(move);
        player.off("move", listener);
      };
      player.on("move", listener);
    });
  }

  isGameWon() {
    const data = this.data;
    const winConditions = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
    ];
    for (const condition of winConditions) {
      const [a, b, c] = condition;
      if (data[a] !== 0 && data[a] === data[b] && data[b] === data[c]) {
        return data[a];
      }
    }
    return 0;
  }

  async play() {
    let playerNow = this.player1;
    while (this.data.filter((data) => data === 0).length > 0) {
      const move = await this.waitForMove(playerNow);
      this.data[move] = playerNow === this.player1 ? 1 : 2;
      playerNow = playerNow === this.player1 ? this.player2 : this.player1;
			io.to(this.player1.id).emit("update", this.data);
			io.to(this.player2.id).emit("update", this.data);
      const winner = this.isGameWon();
      if (winner !== 0) {
        io.to(this.player1.id).emit("end", winner === 1 ? "x" : "o");
        io.to(this.player2.id).emit("end", winner === 1 ? "x" : "o");
        return;
      }
    }
  }
}
