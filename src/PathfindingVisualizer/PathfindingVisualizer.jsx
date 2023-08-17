import React, { Component } from "react";
import Node from "./Node/Node";
import "./PathfindingVisualizer.css";
import { dijkstra, getNodesInShortestPathOrder } from "../algorithms/dijkstra";
import { astar } from "../algorithms/astar";

let START_NODE_COL = 15;
let FINISH_NODE_ROW = 10;
let START_NODE_ROW = 10;
let FINISH_NODE_COL = 35;

export default class PathfindingVisualizer extends Component {
  constructor() {
    super();
    this.state = {
      grid: [],
      mouseIsPressed: false,
      // To prevent user from adding walls while the algorithm is being animated
      animationIsRunning: false,
      dragNode: false,
    };
  }
  // Initializes the grid
  componentDidMount() {
    const grid = getInitialGrid();
    this.setState({ grid });
  }
  handleMouseDown(e, row, col) {
    // e.preventDefault();
    if (this.state.animationIsRunning) return;
    if (this.state.animationIsRunning) return;
    if (row === START_NODE_ROW && col === START_NODE_COL) {
      this.setState({
        dragNode: [true, "start"],
      });
    } else if (row === FINISH_NODE_ROW && col === FINISH_NODE_COL) {
      this.setState({
        dragNode: [true, "finish"],
      });
    } else if (this.state.dragNode[0] === false) {
      const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
      this.setState({ grid: newGrid });
    }
    this.setState({ mouseIsPressed: true });
  }
  handleMouseEnter(e, row, col) {
    // e.preventDefault();
    if (this.state.animationIsRunning || !this.state.mouseIsPressed) return;
    if (this.state.dragNode[0]) {
      let grid = move(
        this.state.grid,
        row,
        col,
        this.state.animationIsRunning,
        this.state.dragNode
      );
      this.setState({ grid: grid });
    } else {
      const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
      this.setState({ grid: newGrid });
    }
  }
  handleMouseUp() {
    if (this.state.animationIsRunning) return;
    this.setState({ mouseIsPressed: false });
    this.setState({ dragNode: [false, ""] });
  }

  visualizeDijkstra() {
    const { grid } = this.state;
    const startNode = grid[START_NODE_ROW][START_NODE_COL];
    const finishNode = grid[FINISH_NODE_ROW][FINISH_NODE_COL];
    const visitedNodesInOrder = dijkstra(grid, startNode, finishNode);
    const nodesInShortestPathOrder = getNodesInShortestPathOrder(
      visitedNodesInOrder,
      finishNode
    );
    this.animateDjikstra(visitedNodesInOrder, nodesInShortestPathOrder);
  }
  visualizeAStar() {
    const { grid } = this.state;
    const startNode = grid[START_NODE_ROW][START_NODE_COL];
    const finishNode = grid[FINISH_NODE_ROW][FINISH_NODE_COL];
    const visitedNodesInOrder = astar(grid, startNode, finishNode);
    this.animateDjikstra(visitedNodesInOrder, visitedNodesInOrder);
  }
  animateDjikstra(visitedNodesInOrder, nodesInShortestPathOrder) {
    if (this.state.animationIsRunning) return;
    clearBoard(this.state.grid, "path", this.state.animationIsRunning);
    this.setState({ animationIsRunning: true });
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      // After all visited nodes have been animated, animate the shortest path
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          this.animateShortestPath(nodesInShortestPathOrder);
        }, 10 * i);
        return;
      }
      // Animate each visited node
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        document
          .getElementById(`node-${node.row}-${node.col}`)
          .classList.add("node-visited");
      }, 10 * i);
    }
  }
  // Function to animate the shortest path after Dijkstra's algorithm
  animateShortestPath(nodesInShortestPathOrder) {
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      setTimeout(() => {
        const node = nodesInShortestPathOrder[i];
        document
          .getElementById(`node-${node.row}-${node.col}`)
          .classList.add("node-shortest-path");
        // Adds an arrow to the last shortest path node
        document
          .getElementById(`node-${node.row}-${node.col}`)
          .classList.add("active");
        // Removes the arrow
        setTimeout(() => {
          // If we're on the finishNode don't remove the class so background-image is an arrow
          if (i !== nodesInShortestPathOrder.length - 1) {
            document
              .getElementById(`node-${node.row}-${node.col}`)
              .classList.remove("active");
          }
        }, 50);
      }, 50 * i);
    }
    this.setState({ animationIsRunning: false });
  }
  // Displays the grid of nodes
  render() {
    const { grid, mouseIsPressed, animationIsRunning } = this.state;
    return (
      <>
        <button onClick={() => this.visualizeDijkstra()}>
          Visualize Dijkstra's Algorithm
        </button>
        <button onClick={() => this.visualizeAStar()}>
          Visualize A* Algorithm
        </button>
        {/* Cleares everything anf returns nodes back to original position */}
        <button
          onClick={() =>
            this.setState({
              grid: clearBoard(grid, "board", animationIsRunning),
            })
          }
        >
          Clear Board
        </button>
        {/* Cleans path and walls */}
        <button
          onClick={() =>
            this.setState({
              grid: clearBoard(grid, "walls", animationIsRunning),
            })
          }
        >
          Clear Walls
        </button>
        {/* Cleans just path */}
        <button
          onClick={() =>
            this.setState({
              grid: clearBoard(
                grid,
                "path",
                animationIsRunning,
                this.state.dragNode
              ),
            })
          }
        >
          Clear Path
        </button>
        <div className="grid">
          {grid.map((row, rowIdx) => {
            return (
              <div key={rowIdx}>
                {/* Map through each node in the row */}
                {row.map((node, nodeIdx) => {
                  const { row, col, isFinish, isStart, isWall, isHovered } =
                    node;
                  return (
                    // Create a Node component for each node
                    <Node
                      key={nodeIdx}
                      col={col}
                      row={row}
                      isFinish={isFinish}
                      isStart={isStart}
                      isWall={isWall}
                      mouseIsPressed={mouseIsPressed}
                      // onMouseLeave={() => this.hover(false, row, col)}
                      onMouseUp={() => this.handleMouseUp()}
                      onMouseDown={(e) => this.handleMouseDown(e, row, col)}
                      onMouseEnter={(e) => this.handleMouseEnter(e, row, col)}
                    ></Node>
                  );
                })}
              </div>
            );
          })}
        </div>
      </>
    );
  }
}
// Generate the initial grid of nodes
const getInitialGrid = () => {
  const grid = [];
  // Iterate through rows
  for (let row = 0; row < 20; row++) {
    const currentRow = [];
    // Iterate through columns
    for (let col = 0; col < 50; col++) {
      // Create a node and add it to the current row
      currentRow.push(createNode(row, col));
    }
    // Add the current row to the grid
    grid.push(currentRow);
  }
  return grid;
};
const getGrid = (grid) => {
  const nodes = [];
  for (const row of grid) {
    for (const node of row) {
      nodes.push(node);
    }
  }
  return nodes;
};
// Create a node with specified row and column indices.
const createNode = (row, col) => {
  return {
    col,
    row,
    isStart: row === START_NODE_ROW && col === START_NODE_COL,
    isFinish: row === FINISH_NODE_ROW && col === FINISH_NODE_COL,
    isVisited: false,
    distance: Infinity,
    isWall: false,
    isHovered: false,
    previousNode: null,
    f: Infinity,
    g: Infinity,
    h: Infinity,
  };
};

const getNewGridWithWallToggled = (grid, row, col) => {
  const newGrid = grid.slice();
  const node = newGrid[row][col];
  const newNode = {
    ...node,
    isWall: !node.isWall,
  };
  newGrid[row][col] = newNode;
  return newGrid;
};

// Define a function to move the starting node within a grid to a new position specified by the row and column indices.
const move = (grid, row, col, animationIsRunning, node) => {
  clearBoard(grid, "path", animationIsRunning);
  // Create a copy of the grid array using the slice() method to avoid modifying the original grid directly.
  const newGrid = grid.slice();
  if (node[1] === "start") {
    // Get a reference to the element representing the starting node in the original grid.
    const el = newGrid[START_NODE_ROW][START_NODE_COL];
    // Set the "isStart" property of the current starting node element to false, indicating it is no longer the starting node.
    el.isStart = false;
    // Update the newGrid array to reflect the change in the starting node's status.
    newGrid[START_NODE_ROW][START_NODE_COL] = el;
    // Set the "isStart" property of the target element (where the starting node will be moved to) to true.
    newGrid[row][col].isStart = true;
    // Update the global START_NODE_COL and START_NODE_ROW variables to store the new starting node's column and row indices.
    START_NODE_COL = col;
    START_NODE_ROW = row;
  } else if (node[1] === "finish") {
    const el = newGrid[FINISH_NODE_ROW][FINISH_NODE_COL];
    el.isFinish = false;
    newGrid[FINISH_NODE_ROW][FINISH_NODE_COL] = el;
    newGrid[row][col].isFinish = true;
    FINISH_NODE_COL = col;
    FINISH_NODE_ROW = row;
  }

  // Return the updated newGrid array with the starting node moved to the new position.
  return newGrid;
};

// This function clears parts of the grid based on the provided parameters.
const clearBoard = (oldGrid, object, animationIsRunning) => {
  // If an animation is currently running, do not modify the grid and just return the old grid.
  if (animationIsRunning) return oldGrid;
  // Create a copy of the oldGrid array to avoid modifying the original grid directly.
  let grid = oldGrid.slice();
  // If the object to clear is the entire board, reset the grid to its initial state and reset the start node's position.
  if (object === "board") {
    grid = getInitialGrid();
    // Resetting the startNode
    START_NODE_COL = 15;
    START_NODE_ROW = 10;
    // Resetting the finishNode
    FINISH_NODE_ROW = 10;
    FINISH_NODE_COL = 35;
  }
  // Loop through rows
  for (let row = 0; row < 20; row++) {
    // Loop through columns
    for (let col = 0; col < 50; col++) {
      // If the object to clear is walls, reset the node at this position to be a new wall node.
      if (object === "walls") {
        grid[row][col] = createNode(row, col);
      }
      // If the object to clear is path, and the current node is not a wall, reset it to a new non-wall node.
      else if (object === "path" && grid[row][col].isWall === false) {
        grid[row][col] = createNode(row, col);
      }
      // Remove visual classes from the corresponding DOM element representing the node.
      document
        .getElementById(`node-${row}-${col}`)
        .classList.remove("node-visited");
      document
        .getElementById(`node-${row}-${col}`)
        .classList.remove("node-shortest-path");
      document.getElementById(`node-${row}-${col}`).classList.remove("active");
    }
  }
  // Return the modified grid after clearing the specified object.
  return grid;
};
