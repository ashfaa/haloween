class Board {
    ctx;
    ctxNext;
    grid;
    piece;
    next;
    input;
    time;
  
    constructor(ctx, ctxNext) {
      this.ctx = ctx;
      this.ctxNext = ctxNext;
      this.init();
    }
  
    init() {
      // papan game
      this.ctx.canvas.width = columns * blockSize;
      this.ctx.canvas.height = rows * blockSize;
      this.ctx.scale(blockSize, blockSize);
    }
  
    reset() {
      this.grid = this.getEmptyGrid();
      this.piece = new Piece(this.ctx);
      this.piece.setStartingPosition();
      this.getNewPiece();
    }
  
    getNewPiece() {
      this.next = new Piece(this.ctxNext);
      this.ctxNext.clearRect(
        0,
        0, 
        this.ctxNext.canvas.width, 
        this.ctxNext.canvas.height
      );
      this.next.draw();
    }
  
    draw() {
      this.piece.draw();
      this.drawBoard();
    }
  
    drop() {
      let p = moves[key.DOWN](this.piece);
      if (this.valid(p)) {
        this.piece.move(p);
      } else {
        this.freeze();
        this.clearLines();
        if (this.piece.y === 0) {
          // Game over
          return false;
        }
        this.piece = this.next;
        this.piece.ctx = this.ctx;
        this.piece.setStartingPosition();
        this.getNewPiece();
      }
      return true;
    }
  
    clearLines() {
      let lines = 0;
  
      this.grid.forEach((row, y) => {
  
        if (row.every(value => value > 0)) {
          lines++;
  
          // hapus row.
          this.grid.splice(y, 1);
  
          // 
          this.grid.unshift(Array(columns).fill(0));
        }
      });
      
      if (lines > 0) {
        // cek poin
  
        bar.score += this.getLinesClearedPoints(lines);
        bar.lines += lines;
  
        // naik level
        if (bar.lines >= linesLevel) {
          bar.level++;  
          bar.lines -= linesLevel;
  
          // makin cepet
          time.level = level[bar.level];
        }
      }
    }
  
    valid(p) {
      return p.shape.every((row, dy) => {
        return row.every((value, dx) => {
          let x = p.x + dx;
          let y = p.y + dy;
          return (
            value === 0 ||
            (this.insideWalls(x) && this.aboveFloor(y) && this.notOccupied(x, y))
          );
        });
      });
    }
  
    freeze() {
      this.piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value > 0) {
            this.grid[y + this.piece.y][x + this.piece.x] = value;
          }
        });
      });
    }
  
    drawBoard() {
      this.grid.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value > 0) {
            this.ctx.fillStyle = colors[value];
            this.ctx.fillRect(x, y, 1, 1);
          }
        });
      });
    }
  
    getEmptyGrid() {
      return Array.from({ length: rows }, () => Array(columns).fill(0));
    }
  
    insideWalls(x) {
      return x >= 0 && x < columns;
    }
  
    aboveFloor(y) {
      return y <= rows;
    }
  
    notOccupied(x, y) {
      return this.grid[y] && this.grid[y][x] === 0;
    }
  
    rotate(piece) {
      let p = JSON.parse(JSON.stringify(piece));
  
      // rubah bentuk
      for (let y = 0; y < p.shape.length; ++y) {
        for (let x = 0; x < y; ++x) {
          [p.shape[x][y], p.shape[y][x]] = [p.shape[y][x], p.shape[x][y]];
        }
      }
      p.shape.forEach(row => row.reverse());
      return p;
    }
  
    getLinesClearedPoints(lines, level) {
      const lineClearPoints =
        lines === 1
          ? points.SINGLE
          : lines === 2
          ? points.DOUBLE
          : lines === 3
          ? points.TRIPLE
          : lines === 4
          ? points.TETRIS
          : 0;
  
      return (bar.level + 1) * lineClearPoints;
    }
  }