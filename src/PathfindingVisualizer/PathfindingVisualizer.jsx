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
    if (this.state.animationIsRunning) return;
    e.preventDefault();
    console.log("press");
    if (this.state.animationIsRunning) return;
    if (row === START_NODE_ROW && col === START_NODE_COL) {
      this.setState({ dragNode: true });
    } else if (!this.state.dragNode) {
      const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
      this.setState({ grid: newGrid });
    }
    this.setState({ mouseIsPressed: true });
  }
  handleMouseEnter(e, row, col) {
    // e.preventDefault();
    if (this.state.animationIsRunning || !this.state.mouseIsPressed) return;
    if (this.state.dragNode) {
      let grid = move(this.state.grid, row, col);
      this.setState({ grid: grid });
    } else {
      const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
      this.setState({ grid: newGrid });
    }
  }
  handleMouseUp() {
    if (this.state.animationIsRunning) return;
    this.setState({ mouseIsPressed: false });
    this.setState({ dragNode: false });
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
    const { grid, mouseIsPressed } = this.state;
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
          onClick={() => this.setState({ grid: clearBoard(grid, "board") })}
        >
          Clear Board
        </button>
        {/* Cleans path and walls */}
        <button
          onClick={() => this.setState({ grid: clearBoard(grid, "walls") })}
        >
          Clear Walls
        </button>
        {/* Cleans just path */}
        <button
          onClick={() => this.setState({ grid: clearBoard(grid, "path") })}
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

const move = (grid, row, col) => {
  const newGrid = grid.slice();
  const el = newGrid[START_NODE_ROW][START_NODE_COL];
  el.isStart = false;
  newGrid[START_NODE_ROW][START_NODE_COL] = el;
  newGrid[row][col].isStart = true;
  START_NODE_COL = col;
  START_NODE_ROW = row;
  // this.setState({ grid: grid });
  return newGrid;
};

const clearBoard = (oldGrid, object) => {
  // Loop through rows
  // const grid = this.state.grid.slice();
  const grid = oldGrid.slice();
  for (let row = 0; row < 20; row++) {
    // Loop through columns
    for (let col = 0; col < 50; col++) {
      if (object === "board") {
        if (col === START_NODE_COL && row === START_NODE_ROW) {
          document.getElementById(`node-${row}-${col}`).className =
            "node node-start";
          grid[row][col].isStart = false;
          START_NODE_COL = 15;
          START_NODE_ROW = 10;
          grid[START_NODE_ROW][START_NODE_COL].isStart = true;
        } else if (col === FINISH_NODE_COL && row === FINISH_NODE_ROW) {
          document.getElementById(`node-${row}-${col}`).className =
            "node node-finish";
        } else {
          // Set the class name of the cell to the default node style
          document.getElementById(`node-${row}-${col}`).className = "node";
        }
      } else if (object === "walls") {
        document
          .getElementById(`node-${row}-${col}`)
          .classList.remove("node-wall");
      } else if (object === "path") {
        document
          .getElementById(`node-${row}-${col}`)
          .classList.remove("node-visited");
        document
          .getElementById(`node-${row}-${col}`)
          .classList.remove("node-shortest-path");
        document
          .getElementById(`node-${row}-${col}`)
          .classList.remove("active");
      }
    }
  }
  return grid;
};
