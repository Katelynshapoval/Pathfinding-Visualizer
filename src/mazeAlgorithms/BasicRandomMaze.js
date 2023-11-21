export function basicRandomMaze(grid) {
  let walls = [];
  let random = 290;
  let rows = grid.length;
  let cols = grid[0].length;
  while (random !== 0) {
    let randomRow = Math.floor(Math.random() * rows);
    let randomCol = Math.floor(Math.random() * cols);
    if (walls.includes(grid[randomRow][randomCol])) {
      continue;
    }
    grid[randomRow][randomCol].isWall = true;
    walls.push(grid[randomRow][randomCol]);
    random -= 1;
  }
  return walls;
}
