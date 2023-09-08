export function stairPattern(grid) {
  // Initialize variables for row, column, and walls array.
  let row = grid.length - 1; // Starting from the bottom row.
  let col = 0; // Starting from the leftmost column.
  let walls = []; // An array to store the elements in the pattern.

  // Initialize a boolean variable 'up' to keep track of traversal direction.
  let up = true; // When true, we move up; when false, we move down.

  // Start traversing the grid horizontally until we reach the rightmost column.
  while (col <= grid[0].length - 1) {
    grid[row][col].isWall = true;
    // Push the current grid element into the 'walls' array.
    walls.push(grid[row][col]);

    // Adjust the 'row' value based on the 'up' direction.
    if (up) {
      row--; // Move up one row.
    } else {
      row++; // Move down one row.
    }

    col++; // Move to the next column.

    // Check if we've reached the top or bottom row, and if so, change direction.
    if (row === 0 || row === grid.length - 1) {
      up = !up; // Toggle the direction (up to down or down to up).
    }
  }

  // Return the array containing the staircase pattern elements.
  return walls;
}
