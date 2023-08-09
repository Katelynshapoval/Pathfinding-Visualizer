export function astar(grid, startNode, finishNode) {
  const openList = [];
  const closedList = [];
  startNode.f = 0;
  startNode.g = 0;
  startNode.h = 0;
  openList.push(startNode);
  while (!!openList.length) {
    let currentNode = openList[0];

    if (currentNode === finishNode)
      return getNodesInShortestPathOrder(finishNode);
    openList.shift();
    closedList.push(currentNode);
    let neighbors = getNeighbours(currentNode, grid);
    for (const neighbor of neighbors) {
      console.log(heuristic(neighbor, finishNode));
      if (!openList.includes(neighbor)) {
        // g = 0;
        // h = 0;
        // f = 0;
        openList.push(neighbor);
        neighbor.previousNode = currentNode;
      }
      if (openList.includes(neighbor)) {
        neighbor.previousNode = currentNode;
      }
    }
    return;
  }
}

function heuristic(node, finishNode) {
  // This is the Manhattan distance
  var d1 = Math.abs(finishNode.col - node.col);
  var d2 = Math.abs(finishNode.row - node.row);
  return d1 + d2;
}
// Backtracks from the finishNode to find the shortest path.
export function getNodesInShortestPathOrder(finishNode) {
  const nodesInShortestPathOrder = [];
  let currentNode = finishNode;
  while (currentNode !== null) {
    nodesInShortestPathOrder.unshift(currentNode);
    currentNode = currentNode.previousNode;
  }
  return nodesInShortestPathOrder;
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

function getAllNodes(grid) {
  const nodes = [];
  for (const row of grid) {
    for (const node of row) {
      nodes.push(node);
    }
  }
  return nodes;
}

function sortNodesByDistance(unvisitedNodes) {
  unvisitedNodes.sort((nodeA, nodeB) => nodeA.distance - nodeB.distance);
}

function updateUnvisitedNeighbors(node, grid) {
  const unvisitedNeighbors = getUnvisitedNeighbours(node, grid);
  for (const neighbor of unvisitedNeighbors) {
    // Update the distance of the neighbor to be one more than the distance of the current node
    neighbor.distance = node.distance + 1;
    neighbor.previousNode = node;
  }
}

function getUnvisitedNeighbours(node, grid) {
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
  return neighbors.filter((neighbor) => !neighbor.isVisited);
}

// function getAllNodes(grid) {
//   const nodes = [];
//   for (const row of grid) {
//     for (const node of row) {
//       nodes.push(node);
//     }
//   }
//   return nodes;
// }
