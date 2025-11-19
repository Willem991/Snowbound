(() => {

  // ---------- channels ------------

    const chatSocket = new WebSocket(
        'ws://'
        + window.location.host
        + '/main/game/'
    );

    chatSocket.onmessage = function(e) {
        const data = JSON.parse(e.data);

        const rect = canvas.getBoundingClientRect();
        dest.x = data.x - rect.left;
        dest.y = data.y - rect.top;
    };     


  // --------- game variables -------
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const info = document.getElementById("info");

  function spritePath(file) {
    return window.STATIC_URL + "gameapp/img/" + file;
}

  // --------- CONFIG ----------
  const SPRITE_FILENAME = spritePath("RunSheet.png");

  console.log(window.STATIC_URL);

  const DIRECTIONS = 8;     // number of rows
  const FRAMES_PER_ROW = 8; // number of frames in each row

  const DEFAULT_SPEED = 2;

  // Character state
  let char = { 
    x: 100, 
    y: 100, 
    frame: 0, 
    direction: 4, // start facing South
    moving: false 
  };

  let dest = { x: char.x, y: char.y };
  let speed = DEFAULT_SPEED;

  let frameTimer = 0;
  let FRAME_W = 32, FRAME_H = 32;

  // Load sprite
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

  // Click to set destination
  canvas.addEventListener("click", (e) => {

    chatSocket.send(JSON.stringify({
        'x':e.clientX,
        'y':e.clientY
    }));
    messageInputDom.value = '';
  });

  // ---------------------------
  // MATCHES YOUR SPRITE SHEET EXACTLY
  // Row order: N, NE, E, SE, S, SW, W, NW
  // ---------------------------
  function getDirection(dx, dy) {
    const angle = Math.atan2(dy, dx);
    let d = angle * 180 / Math.PI;
    if (d < 0) d += 360;

    // 0: N
    // 1: NE
    // 2: E
    // 3: SE
    // 4: S
    // 5: SW
    // 6: W
    // 7: NW

    if (d >= 337.5 || d < 22.5) return 2;        // East
    if (d >= 22.5 && d < 67.5) return 3;         // SE
    if (d >= 67.5 && d < 112.5) return 4;        // South
    if (d >= 112.5 && d < 157.5) return 5;       // SW
    if (d >= 157.5 && d < 202.5) return 6;       // West
    if (d >= 202.5 && d < 247.5) return 7;       // NW
    if (d >= 247.5 && d < 292.5) return 0;       // North
    if (d >= 292.5 && d < 337.5) return 1;       // NE

    return 4;
  }

  function update() {
    const dx = dest.x - char.x;
    const dy = dest.y - char.y;
    const dist = Math.hypot(dx, dy);

    if (dist > speed) {
      char.moving = true;
      char.direction = getDirection(dx, dy);
      char.x += (dx / dist) * speed;
      char.y += (dy / dist) * speed;
    } else {
      char.moving = false;
      char.x = dest.x;
      char.y = dest.y;
    }

    // Animate
    if (char.moving) {
      frameTimer++;
      if (frameTimer > 6) {
        char.frame = (char.frame + 1) % FRAMES_PER_ROW;
        frameTimer = 0;
      }
    } else {
      char.frame = 0;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!sprite.complete || sprite.naturalWidth === 0) {
      ctx.fillStyle = "#111";
      ctx.fillRect(10, 10, 220, 60);
      ctx.fillStyle = "#fff";
      ctx.fillText("Sprite not loaded.", 20, 32);
      ctx.fillText(`Expected: ${SPRITE_FILENAME}`, 20, 52);
      ctx.beginPath();
      ctx.fillStyle = "#222";
      ctx.arc(char.x, char.y, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.stroke();
      return;
    }

    const sx = char.frame * FRAME_W;
    const sy = char.direction * FRAME_H;

    const dx = Math.round(char.x - FRAME_W / 2);
    const dy = Math.round(char.y - FRAME_H / 2);

    ctx.drawImage(sprite, sx, sy, FRAME_W, FRAME_H, dx, dy, FRAME_W, FRAME_H);

    // Draw target marker
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.beginPath();
    ctx.arc(dest.x, dest.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Game loop
  let started = false;
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