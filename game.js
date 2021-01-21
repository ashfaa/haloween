const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const canvasNext = document.getElementById('next');
const ctxNext = canvasNext.getContext('2d');

let scoreBar = {
  score: 0,
  level: 0,
  lines: 0
}

function updateBar(element, result) {
  let elements = document.getElementById(element);
  if (elements) {
    elements.textContent = result;
  }
}

let bar = new Proxy(scoreBar, {
  set: (target, key, value) => {
    target[key] = value;
    updateBar(key, value);
    return true;
  }
});

let input;

moves = {
  [key.LEFT]: p => ({ ...p, x: p.x - 1 }),
  [key.RIGHT]: p => ({ ...p, x: p.x + 1 }),
  [key.DOWN]: p => ({ ...p, y: p.y + 1 }),
  [key.SPACE]: p => ({ ...p, y: p.y + 1 }),
  [key.UP]: p => board.rotate(p)
};

let board = new Board(ctx, ctxNext);
addEventListener();
initNext();

function initNext() {
  // size papan
  ctxNext.canvas.width = 4 * blockSize;
  ctxNext.canvas.height = 4 * blockSize;
  ctxNext.scale(blockSize, blockSize);
}

function addEventListener() {
  document.addEventListener('keydown', event => {
    // kenapa deprecated wkwkkw
    if (event.keyCode === key.P) {
      pause();
    }
    if (event.keyCode === key.ESC) {
      gameOver();
    } else if (moves[event.keyCode]) {
      event.preventDefault();
      // Get new state
      let p = moves[event.keyCode](board.piece);
      if (event.keyCode === key.SPACE) {
        // Hard drop
        while (board.valid(p)) {
          bar.score += points.HARD_DROP;
          board.piece.move(p);
          p = moves[key.DOWN](board.piece);
        }       
      } else if (board.valid(p)) {
        board.piece.move(p);
        if (event.keyCode === key.DOWN) {
          bar.score += points.SOFT_DROP;         
        }
      }
    }
  });
}

function resetGame() {
  bar.score = 0;
  bar.lines = 0;
  bar.level = 0;
  board.reset();
  time = { start: 0, elapsed: 0, level: level[bar.level] };
}

function play() {
  resetGame();
  time.start = performance.now();
  // reset
  if (input) {
    cancelAnimationFrame(input);
  }

  animate();
}

function animate(now = 0) {
  time.elapsed = now - time.start;
  if (time.elapsed > time.level) {
    time.start = now;
    if (!board.drop()) {
      gameOver();
      return;
    }
  }

  // hapus papan
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  board.draw();
  input = requestAnimationFrame(animate);
}

function gameOver() {
  cancelAnimationFrame(input);
  ctx.fillStyle = 'white';
  ctx.fillRect(1, 2, 8.5,3);
  ctx.font = '0.14em Rum Raisin';
  ctx.fillStyle = 'red';
  ctx.fillText('YOU LOSE!', 1.2, 4);
}

function pause() {
  if (!input) {
    animate();
    return;
  }

  cancelAnimationFrame(input);
  input = null;
  
  ctx.fillStyle = 'white';
  ctx.fillRect(1, 2.5, 8.5,2);
  ctx.font = '0.1em Rum Raisin';
  ctx.fillStyle = 'orange';
  ctx.fillText('paused', 3, 4);
}