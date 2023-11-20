// Function to generate the maze using recursive division algorithm
export function recursiveDivisionMaze(
  grid,
  rowStart,
  rowEnd,
  colStart,
  colEnd,
  orientation,
  walls,
  gaps
) {
  // Create outer walls if they haven't been created yet
  if (walls.length === 0) {
    createOuterWalls(grid, walls);
  }

  // Base case: If the dimensions are too small, exit recursion
  if (rowEnd <= rowStart || colEnd <= colStart) {
    return walls;
  }

  // Determine whether to generate a vertical or horizontal wall
  if (orientation === "v") {
    generateVerticalMaze(
      grid,
      rowStart,
      rowEnd,
      colStart,
      colEnd,
      orientation,
      walls,
      gaps
    );
  } else if (orientation === "h") {
    generateHorizontalMaze(
      grid,
      rowStart,
      rowEnd,
      colStart,
      colEnd,
      orientation,
      walls,
      gaps
    );
  }
  // Return the updated walls array
  return walls;
}

// Function to create outer walls around the grid
function createOuterWalls(grid, walls) {
  for (let c = 0; c < grid[0].length; c++) {
    setWall(grid, 0, c, walls);
    setWall(grid, grid.length - 1, c, walls);
  }

  for (let r = 0; r < grid.length; r++) {
    setWall(grid, r, 0, walls);
    setWall(grid, r, grid[0].length - 1, walls);
  }
}

// Function to set a wall at the specified position
function setWall(grid, row, col, walls) {
  grid[row][col].isWall = true;
  walls.push(grid[row][col]);
}

// Function to generate a vertical wall within the maze
function generateVerticalMaze(
  grid,
  rowStart,
  rowEnd,
  colStart,
  colEnd,
  orientation,
  walls,
  gaps
) {
  // Generate possible positions for columns and rows
  let possibleCols = generatePossibleNumbers(colStart, colEnd, 2);
  let possibleRows = generatePossibleNumbers(rowStart, rowEnd, 2);

  // Randomly choose a column and row from the possible positions
  let randomRowIndex = getRandomIndex(possibleRows.length);
  let randomColIndex = getRandomIndex(possibleCols.length);

  let currentCol = possibleCols[randomColIndex];
  let rowRandom = possibleRows[randomRowIndex];

  // Add the gap to the gaps array
  gaps.push([rowRandom, currentCol]);

  // Create a vertical wall except at the chosen gap
  for (let r = rowStart; r <= rowEnd; r++) {
    if (r !== rowRandom && !isGap(gaps, r, currentCol)) {
      setWall(grid, r, currentCol, walls);
    }
  }

  // Recursively call the function for the divided regions
  callVertical(
    grid,
    rowStart,
    rowEnd,
    colStart,
    colEnd,
    currentCol,
    orientation,
    walls,
    gaps
  );
}

// Function to generate a horizontal wall within the maze
function generateHorizontalMaze(
  grid,
  rowStart,
  rowEnd,
  colStart,
  colEnd,
  orientation,
  walls,
  gaps
) {
  // Generate possible positions for columns and rows
  let possibleCols = generatePossibleNumbers(colStart, colEnd, 2);
  let possibleRows = generatePossibleNumbers(rowStart, rowEnd, 2);

  // Randomly choose a column and row from the possible positions
  let randomRowIndex = getRandomIndex(possibleRows.length);
  let randomColIndex = getRandomIndex(possibleCols.length);

  let currentRow = possibleRows[randomRowIndex];
  let colRandom = possibleCols[randomColIndex];

  // Add the gap to the gaps array
  gaps.push([currentRow, colRandom]);

  // Create a horizontal wall except at the chosen gap
  for (let c = colStart; c <= colEnd; c++) {
    if (c !== colRandom && !isGap(gaps, currentRow, c)) {
      setWall(grid, currentRow, c, walls);
    }
  }

  // Recursively call the function for the divided regions
  callHorizontal(
    grid,
    rowStart,
    rowEnd,
    colStart,
    colEnd,
    currentRow,
    orientation,
    walls,
    gaps
  );
}

// Function to generate an array of possible numbers within a range with a given step
function generatePossibleNumbers(start, end, step) {
  let possibleNumbers = [];
  for (let number = start; number <= end; number += step) {
    possibleNumbers.push(number);
  }
  return possibleNumbers;
}

// Function to get a random index from an array
function getRandomIndex(length) {
  return Math.floor(Math.random() * length);
}

// Function to check if a gap exists at a given position
function isGap(gaps, row, col) {
  return gaps.some(([r, c]) => r === row && c === col);
}

// Function to handle recursive division in the vertical direction
function callVertical(
  grid,
  rowStart,
  rowEnd,
  colStart,
  colEnd,
  currentCol,
  orientation,
  walls,
  gaps
) {
  // Determine whether to divide the left or right region
  if (rowEnd - rowStart > currentCol - 2 - colStart) {
    recursiveDivisionMaze(
      grid,
      rowStart,
      rowEnd,
      colStart,
      currentCol - 2,
      "h",
      walls,
      gaps
    );
  } else {
    recursiveDivisionMaze(
      grid,
      rowStart,
      rowEnd,
      colStart,
      currentCol - 2,
      orientation,
      walls,
      gaps
    );
  }

  if (rowEnd - rowStart > colEnd - (currentCol + 2)) {
    recursiveDivisionMaze(
      grid,
      rowStart,
      rowEnd,
      currentCol + 2,
      colEnd,
      "h",
      walls,
      gaps
    );
  } else {
    recursiveDivisionMaze(
      grid,
      rowStart,
      rowEnd,
      currentCol + 2,
      colEnd,
      orientation,
      walls,
      gaps
    );
  }
}

// Function to handle recursive division in the horizontal direction
function callHorizontal(
  grid,
  rowStart,
  rowEnd,
  colStart,
  colEnd,
  currentRow,
  orientation,
  walls,
  gaps
) {
  // Determine whether to divide the upper or lower region
  if (currentRow - 2 - rowStart > colEnd - colStart) {
    recursiveDivisionMaze(
      grid,
      rowStart,
      currentRow - 2,
      colStart,
      colEnd,
      orientation,
      walls,
      gaps
    );
  } else {
    recursiveDivisionMaze(
      grid,
      rowStart,
      currentRow,
      colStart,
      colEnd,
      "v",
      walls,
      gaps
    );
  }

  if (rowEnd - (currentRow + 2) > colEnd - colStart) {
    recursiveDivisionMaze(
      grid,
      currentRow + 2,
      rowEnd,
      colStart,
      colEnd,
      orientation,
      walls,
      gaps
    );
  } else {
    recursiveDivisionMaze(
      grid,
      currentRow,
      rowEnd,
      colStart,
      colEnd,
      "v",
      walls,
      gaps
    );
  }
}
