
window.addEventListener("DOMContentLoaded", () => {

  console.log("Running")

  function imgPath(file) {
    return window.STATIC_URL + "gameapp/img/" + file;
  }

  // --------- game variables -------
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const info = document.getElementById("info");

  const SPRITE_FILENAME = imgPath("RunSheet.png");

  const DIRECTIONS = 8;     // number of rows in sprite sheet
  const FRAMES_PER_ROW = 8; // frames per row
  const DEFAULT_SPEED = 2;

  let FRAME_W = 32, FRAME_H = 32;
  let frameTimer = 0;
  let started = false;

  const id = String(Math.random()); // unique ID for this penguin

  // Track all penguins
  let penguins = {};

  // Map spawn points
  const SPAWNS = {
    town: { x: 150, y: 380 },
    lighthouse: { x: 400, y: 300 }
  };

  // Map buttons
  const map_icon = document.getElementById("map_icon");
  const town_icon = document.getElementById("map_town");
  const lighthouse_icon = document.getElementById("map_lh");
  const map = document.getElementById("map");

  console.log(town_icon)

  let mapGroup = "town"; // initial map

  // ------------- Load maps --------------
  const TOWN_FILENAME = imgPath('sample_town_full.webp');
  const town_bg = new Image();
  town_bg.src = TOWN_FILENAME;

  const LIGHTHOUSE_FILENAME = imgPath('sample_lighthouse_full.webp');
  const lighthouse_bg = new Image();
  lighthouse_bg.src = LIGHTHOUSE_FILENAME;

  // ------------- Load sprite sheet -------------
  const sprite = new Image();
  sprite.src = SPRITE_FILENAME;

  sprite.onload = () => {
    FRAME_W = Math.floor(sprite.width / FRAMES_PER_ROW);
    FRAME_H = Math.floor(sprite.height / DIRECTIONS);
    info.innerText = `Loaded: ${sprite.width}×${sprite.height}, frame ${FRAME_W}×${FRAME_H}`;
    if (!started) startLoop();
  };

  sprite.onerror = () => {
    info.innerText = "ERROR: Sprite could not be loaded.";
    if (!started) startLoop();
  };

  // --------------------------- Helper Functions ---------------------------
  function getDirection(dx, dy) {
    const angle = Math.atan2(dy, dx);
    let d = angle * 180 / Math.PI;
    if (d < 0) d += 360;

    if (d >= 337.5 || d < 22.5) return 2;  // East
    if (d >= 22.5 && d < 67.5) return 3;   // SE
    if (d >= 67.5 && d < 112.5) return 4;  // South
    if (d >= 112.5 && d < 157.5) return 5; // SW
    if (d >= 157.5 && d < 202.5) return 6; // West
    if (d >= 202.5 && d < 247.5) return 7; // NW
    if (d >= 247.5 && d < 292.5) return 0; // North
    if (d >= 292.5 && d < 337.5) return 1; // NE

    return 4; // fallback South
  }

  // --------------------------- WebSocket / Room Switching ---------------------------
  let chatSocket;

  function switchRoom(newRoom) {
    // Remove penguin from old room
    if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
      chatSocket.send(JSON.stringify({ type: "remove", id: id }));
      chatSocket.close();
    }

    mapGroup = newRoom;

    // Reset your penguin to spawn point
    penguins = {
      [id]: {
        x: SPAWNS[mapGroup].x,
        y: SPAWNS[mapGroup].y,
        frame: 0,
        direction: 4,
        moving: false,
        dest: { 
          x: SPAWNS[mapGroup].x,
          y: SPAWNS[mapGroup].y
        }
      }
    };

    // Create new WebSocket for the new room
    chatSocket = new WebSocket(
      'ws://' + window.location.host + '/ws/main/game/' + mapGroup + '/'
    );

    chatSocket.onopen = function() {
      chatSocket.send(JSON.stringify({
        id: id,
        x: penguins[id].x,
        y: penguins[id].y
      }));
    };

    chatSocket.onmessage = function(e) {
      const data = JSON.parse(e.data);

      if (data.type === "all_penguins") {
        for (let pengId in data.penguins) {
          if (pengId === id) continue; // skip self
          const p = data.penguins[pengId];
          penguins[pengId] = {
            x: p.x,
            y: p.y,
            frame: 0,
            direction: 4,
            moving: false,
            dest: { x: p.x, y: p.y }
          };
        }
        return;
      }

      if (data.type === "remove") {
        delete penguins[data.id];
        return;
      }

      const pengId = data.id;
      if (!penguins[pengId]) {
        penguins[pengId] = {
          x: data.x,
          y: data.y,
          frame: 0,
          direction: 4,
          moving: false,
          dest: { x: data.x, y: data.y }
        };
      } else {
        penguins[pengId].dest.x = data.x;
        penguins[pengId].dest.y = data.y;
      }
    };
  }

  // --------------------------- Map Buttons ---------------------------
  map_icon.addEventListener("click", () => map.classList.remove("hide"));

  town_icon.addEventListener("click", () => {
    map.classList.add("hide");
    console.log("Hello")
    console.log(penguins[id]);
    switchRoom("town");
    console.log(penguins[id])
  });

  lighthouse_icon.addEventListener("click", () => {
    map.classList.add("hide");
    switchRoom("lighthouse");
  });

  // --------------------------- Initial Room ---------------------------
  switchRoom(mapGroup);

  // --------------------------- Before unload ---------------------------
  window.addEventListener("beforeunload", () => {
    if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
      chatSocket.send(JSON.stringify({ type: "remove", id: id }));
    }
  });

  // --------------------------- Click to move ---------------------------
  canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const p = penguins[id];
    p.dest.x = e.clientX - rect.left;
    p.dest.y = e.clientY - rect.top;

    if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
      chatSocket.send(JSON.stringify({ id: id, x: p.dest.x, y: p.dest.y }));
    }
  });

  // --------------------------- Game Loop ---------------------------
  function update() {
    for (let pid in penguins) {
      const p = penguins[pid];
      const dx = p.dest.x - p.x;
      const dy = p.dest.y - p.y;
      const dist = Math.hypot(dx, dy);

      if (dist > DEFAULT_SPEED) {
        p.moving = true;
        p.direction = getDirection(dx, dy);
        p.x += (dx / dist) * DEFAULT_SPEED;
        p.y += (dy / dist) * DEFAULT_SPEED;
      } else {
        p.moving = false;
        p.x = p.dest.x;
        p.y = p.dest.y;
      }

      if (p.moving) {
        frameTimer++;
        if (frameTimer > 6) {
          p.frame = (p.frame + 1) % FRAMES_PER_ROW;
          frameTimer = 0;
        }
      } else {
        p.frame = 0;
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!sprite.complete || sprite.naturalWidth === 0) return;

    const sorted = Object.values(penguins).sort((a,b) => a.y - b.y);

    switch (mapGroup) {
      case "town": ctx.drawImage(town_bg,0,0); break;
      case "lighthouse": ctx.drawImage(lighthouse_bg,0,0); break;
    }

    for (let p of sorted) {
      const sx = p.frame * FRAME_W;
      const sy = p.direction * FRAME_H;
      const dx = Math.round(p.x - FRAME_W / 2);
      const dy = Math.round(p.y - FRAME_H / 2);
      ctx.drawImage(sprite, sx, sy, FRAME_W, FRAME_H, dx, dy, FRAME_W, FRAME_H);
    }
  }

  function startLoop() {
    if (started) return;
    started = true;
    function loop() {
      update();
      draw();
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  startLoop();

})();
