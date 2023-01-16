<script lang="ts">
  import svelteLogo from "./assets/svelte.svg";
  import { socket } from "./lib/socket";

  let myTurn = false;

  let loading = 2;
  socket.on("connect", () => {
    console.log("connected");
    loading = 1;
  });
  socket.on("connect_error", (e) => {
    console.error("connect_error:", e);
  });
  socket.on("start", (data) => {
    loading = 0;
    console.log("started");
    myTurn = data === "o";
  });

  let state = Array(9).fill(0);

  socket.on("update", (data) => {
    state = data;
    myTurn = !myTurn;
  });

  const click = (index) => {
    if (state[index] !== 0 || !myTurn) return;
    socket.emit("move", index);
  };

  let winner;
  socket.on("end", (data) => {
    winner = data;
    loading = 3;
  });
</script>

<main>
  {#if loading === 2}
    <div class="load">Connecting...</div>
  {:else if loading == 1}
    <div class="load">Waiting for other player...</div>
  {:else if loading === 3}
    <div class="load">
      The winner is: {winner}
    </div>
  {/if}
  <div>
    <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
      <img src="/vite.svg" class="logo" alt="Vite Logo" />
    </a>
    <a href="https://svelte.dev" target="_blank" rel="noreferrer">
      <img src={svelteLogo} class="logo svelte" alt="Svelte Logo" />
    </a>
  </div>
  <h1>Vite + Svelte</h1>

  <div class="board">
    {#each state as cell, i}
      <div
        class="cell"
        style="cursor:{cell === 0 && myTurn ? 'pointer' : 'default'}"
        on:click={() => click(i)}
      >
        {cell === 0 ? "" : cell === 1 ? "X" : "O"}
      </div>
    {/each}
  </div>

  <p>
    Check out <a
      href="https://github.com/sveltejs/kit#readme"
      target="_blank"
      rel="noreferrer">SvelteKit</a
    >, the official Svelte app framework powered by Vite!
  </p>

  <p class="read-the-docs">Click on the Vite and Svelte logos to learn more</p>
</main>

<style>
  .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
  }
  .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }
  .logo.svelte:hover {
    filter: drop-shadow(0 0 2em #ff3e00aa);
  }
  .read-the-docs {
    color: #888;
  }
  .board {
    display: inline-grid;
    grid-template-columns: auto auto auto;
  }

  .cell {
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid black;
    width: 100px;
    height: 100px;
    font-size: 3em;
    color: white;
  }
  /* .load is a big cover */
  .load {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    font-size: 2em;
  }
</style>
