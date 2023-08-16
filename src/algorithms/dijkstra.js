// Performs Dijkstra's algorithm; returns *all* nodes in the order
// in which they were visited. Also makes nodes point back to their
// previous node, effectively allowing us to compute the shortest path
// by backtracking from the finish node.
export function dijkstra(grid, startNode, finishNode) {
  const visitedNodesInOrder = [];
  startNode.distance = 0;
  const unvisitedNodes = getAllNodes(grid);
  while (!!unvisitedNodes.length) {
    sortNodesByDistance(unvisitedNodes);
    const closestNode = unvisitedNodes.shift();
    // If we encounter a wall, we skip it.
    if (closestNode.isWall) continue;
    // If the closest node is at a distance of infinity,
    // we must be trapped and should therefore stop.
    if (closestNode.distance === Infinity) return visitedNodesInOrder;
    closestNode.isVisited = true;
    visitedNodesInOrder.push(closestNode);
    if (closestNode === finishNode) return visitedNodesInOrder;
    updateUnvisitedNeighbors(closestNode, grid);
  }
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

function getAllNodes(grid) {
  const nodes = [];
  for (const row of grid) {
    for (const node of row) {
      nodes.push(node);
    }
  }
  return nodes;
}

// Backtracks from the finishNode to find the shortest path.
// Only works when called *after* the dijkstra method above.
export function getNodesInShortestPathOrder(visitedNodesInOrder, finishNode) {
  if (!visitedNodesInOrder.includes(finishNode)) return [];
  const nodesInShortestPathOrder = [];
  let currentNode = finishNode;
  while (currentNode !== null) {
    nodesInShortestPathOrder.unshift(currentNode);
    currentNode = currentNode.previousNode;
  }
  return nodesInShortestPathOrder;
}
