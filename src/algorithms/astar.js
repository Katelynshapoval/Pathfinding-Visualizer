// A* algorithm to find the shortest path in a grid
export function astar(grid, startNode, finishNode) {
  // List of nodes to be evaluated
  // The openList helps prioritize nodes for evaluation based on their estimated total cost, guiding the algorithm toward the most promising path.
  const openList = [];
  // List of nodes that have been fully evaluated
  // The closedList helps avoid re-evaluating nodes that have already been fully explored and whose optimal paths are known, improving the algorithm's efficiency.
  const closedList = [];
  // Initialize the properties of the start node
  initializeNode(startNode);
  // Add the start node to the open list
  openList.push(startNode);
  // While there are nodes in the open list
  while (!!openList.length) {
    // Get the node with the lowest f score from the open list (shortest distance to finishNode)
    const currentNode = getLowestFNode(openList);
    // Backtrack the path if the finish node is reached
    if (currentNode === finishNode) {
      return backtrackPath(currentNode);
    }
    // Remove the current node from the open list and add it to the closed list
    openList.splice(openList.indexOf(currentNode), 1);
    closedList.push(currentNode);
    // Get neighboring nodes
    let neighbors = getNeighbours(currentNode, grid);
    evaluateNeighbors(neighbors, currentNode, finishNode, openList, closedList);
  }
  // If no path found, return an empty array
  return [];
}
// Calculates the heuristic (estimated) distance between a given node and the finish node.
function heuristic(node, finishNode) {
  var d1 = Math.abs(finishNode.col - node.col);
  var d2 = Math.abs(finishNode.row - node.row);
  return d1 + d2;
}
// Change the first node
function initializeNode(node) {
  // Total estimated cost
  node.f = 0;
  // The actual cost from the start node
  node.g = 0;
  // The heuristic (estimated) cost to the finish node
  node.h = 0;
}
// This function evaluates the neighboring nodes to determine the best path for the algorithm.
function evaluateNeighbors(
  neighbors,
  currentNode,
  finishNode,
  openList,
  closedList
) {
  for (let i = 0; i < neighbors.length; i++) {
    let neighbor = neighbors[i];
    // Skip if neighbor is in closed list or is a wall
    if (closedList.includes(neighbor) || neighbor.isWall) {
      continue;
    }
    // Calculate tentative g score for the neighbor
    let gScore = currentNode.g + 1;
    let gScoreIsBest = false;
    // If neighbor is not in open list, add it
    if (!openList.includes(neighbor)) {
      gScoreIsBest = true;
      neighbor.h = heuristic(neighbor, finishNode);
      openList.push(neighbor);
    }
    // If tentative g score is better than current g score, update neighbor
    else if (gScore < neighbor.g) {
      gScoreIsBest = true;
    }
    // Update neighbor properties if g score is better
    if (gScoreIsBest) {
      neighbor.previousNode = currentNode;
      neighbor.g = gScore;
      neighbor.f = neighbor.g + neighbor.h;
    }
  }
}

function getLowestFNode(nodeList) {
  let lowestIndex = 0;
  for (let i = 0; i < nodeList.length; i++) {
    if (nodeList[i].f < nodeList[lowestIndex].f) {
      lowestIndex = i;
    }
  }
  return nodeList[lowestIndex];
}

function backtrackPath(currentNode) {
  // If the current node is the finish node, backtrack to retrieve the path
  let curr = currentNode;
  let ret = [];
  // Backtrack from the finish node to the start node
  while (curr.previousNode) {
    // Add the current node to the path
    ret.push(curr);
    // Move to the previous node
    curr = curr.previousNode;
  }
  // Reverse the path to get it from start to finish
  return ret.reverse();
}

function getNeighbours(node, grid) {
  const neighbors = [];
  const { col, row } = node;
  // Check if the current node is not in the top row of the grid
  // If true, add the node above it to the neighbors array
  if (row > 0) neighbors.push(grid[row - 1][col]);
  // Check if the current node is not in the bottom row of the grid
  // If true, add the node below it to the neighbors arrays
  if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
  // Check if the current node is not in the leftmost column of the grid
  // If true, add the node to the left of it to the neighbors arrays
  if (col > 0) neighbors.push(grid[row][col - 1]);
  // Check if the current node is not in the rightmost column of the grid
  // If true, add the node to the right of it to the neighbors array
  if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
  return neighbors;
}
