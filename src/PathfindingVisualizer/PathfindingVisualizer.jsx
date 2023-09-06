import React, { Component } from "react";
import Node from "./Node/Node";
import "./PathfindingVisualizer.css";
import { dijkstra, getNodesInShortestPathOrder } from "../algorithms/dijkstra";
import { astar } from "../algorithms/astar";
import Dropdown from "react-bootstrap/Dropdown";

let START_NODE_COL = 16;
let FINISH_NODE_ROW = 12;
let START_NODE_ROW = 12;
let FINISH_NODE_COL = 45;

export default class PathfindingVisualizer extends Component {
  constructor() {
    super();
    this.state = {
      grid: [],
      mouseIsPressed: false,
      // To prevent user from adding walls while the algorithm is being animated
      animationIsRunning: false,
      dragNode: false,
      animationIsCompleted: [false, ""],
      chosenAnimation: "",
    };
  }
  // Initializes the grid
  componentDidMount() {
    const grid = getInitialGrid();
    this.setState({ grid });
  }
  handleMouseDown(row, col) {
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
  handleMouseEnter(row, col) {
    if (this.state.animationIsRunning || !this.state.mouseIsPressed) return;
    if (this.state.dragNode[0]) {
      let grid = this.move(this.state.grid, row, col, this.state.dragNode);
      this.setState({ grid: grid }, () => {
        if (this.state.animationIsCompleted[0]) {
          if (this.state.animationIsCompleted[1] === "dijkstra") {
            this.visualizeDijkstra();
          } else if (this.state.animationIsCompleted[1] === "astar") {
            this.visualizeAStar();
          }
        }
      });
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
      finishNode,
      startNode
    );
    this.animateAlgorithm(
      visitedNodesInOrder,
      nodesInShortestPathOrder,
      "dijkstra"
    );
  }
  visualizeAStar() {
    const { grid } = this.state;
    const startNode = grid[START_NODE_ROW][START_NODE_COL];
    const finishNode = grid[FINISH_NODE_ROW][FINISH_NODE_COL];
    const visitedNodesInOrder = astar(grid, startNode, finishNode);
    this.animateAlgorithm(visitedNodesInOrder, visitedNodesInOrder, "astar");
  }
  animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder, algorithm) {
    if (this.state.animationIsRunning) return;
    this.setState({
      grid: clearBoard(this.state.grid, "path", this.state.animationIsRunning),
      animationIsRunning: true,
    });
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      // After all visited nodes have been animated, animate the shortest path
      if (i === visitedNodesInOrder.length) {
        if (
          this.state.animationIsCompleted[0] === false ||
          this.state.animationIsCompleted[1] !== algorithm
        ) {
          setTimeout(() => {
            this.animateShortestPath(nodesInShortestPathOrder, algorithm);
          }, 10 * i);
        } else {
          this.animateShortestPath(nodesInShortestPathOrder, algorithm);
        }
        return;
      }
      // Animate each visited node
      const node = visitedNodesInOrder[i];
      if (
        this.state.animationIsCompleted[0] === false ||
        this.state.animationIsCompleted[1] !== algorithm
      ) {
        setTimeout(() => {
          document
            .getElementById(`node-${node.row}-${node.col}`)
            .classList.add("node-visited");
        }, 10 * i);
      } else {
        document
          .getElementById(`node-${node.row}-${node.col}`)
          .classList.add("node-visited-not-animated");
      }
    }
  }

  // Function to animate the shortest path after Dijkstra's algorithm
  animateShortestPath(nodesInShortestPathOrder, algorithm) {
    // Check if animation is not completed or if the algorithm has changed
    // (animationIsCompleted[0] corresponds to completion status, animationIsCompleted[1] to algorithm)
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      const node = nodesInShortestPathOrder[i];
      if (
        this.state.animationIsCompleted[0] === false || // If animation is not completed
        this.state.animationIsCompleted[1] !== algorithm // Or if the algorithm has changed
      ) {
        // Delay the addition of classes to create an animation effect
        setTimeout(() => {
          // Add class to mark this node as part of the shortest path
          document
            .getElementById(`node-${node.row}-${node.col}`)
            .classList.add("node-shortest-path");

          // Add an arrow to the last shortest path node
          document
            .getElementById(`node-${node.row}-${node.col}`)
            .classList.add("active");

          // After a short delay, remove the arrow (if not the last node)
          setTimeout(() => {
            if (i !== nodesInShortestPathOrder.length - 1) {
              document
                .getElementById(`node-${node.row}-${node.col}`)
                .classList.remove("active");
            }
          }, 50);
        }, 50 * i); // Delay increases with each node to create animation effect
      } else {
        // Add class to mark this node as part of the shortest path without animation
        document
          .getElementById(`node-${node.row}-${node.col}`)
          .classList.add("node-shortest-path-not-animated");

        // Add an arrow to the last shortest path node
        document
          .getElementById(`node-${node.row}-${node.col}`)
          .classList.add("active");

        // Remove the arrow (if not the last node)
        if (i !== nodesInShortestPathOrder.length - 1) {
          document
            .getElementById(`node-${node.row}-${node.col}`)
            .classList.remove("active");
        }
      }
    }

    // Update state to indicate animation is completed
    this.setState({
      animationIsRunning: false,
      animationIsCompleted: [true, algorithm], // Mark animation as completed for this algorithm
    });
  }

  // Define a function to move the starting node within a grid to a new position specified by the row and column indices.
  move = (grid, row, col, dragNode) => {
    // Create a copy of the grid array using the slice() method to avoid modifying the original grid directly.
    let newGrid = grid.slice();

    if (dragNode[1] === "start") {
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
    } else if (dragNode[1] === "finish") {
      const el = newGrid[FINISH_NODE_ROW][FINISH_NODE_COL];
      el.isFinish = false;
      newGrid[FINISH_NODE_ROW][FINISH_NODE_COL] = el;
      newGrid[row][col].isFinish = true;
      FINISH_NODE_COL = col;
      FINISH_NODE_ROW = row;
    }

    // Return the updated newGrid array with the starting node moved to the new position.
    // return newGrid;

    return newGrid;
  };
  // Displays the grid of nodes
  render() {
    let { grid, mouseIsPressed, animationIsRunning, chosenAnimation } =
      this.state;
    return (
      <>
        <header>
          <p>Pathfinding-Visualizer</p>
          <div className="buttons">
            <div className="mainsetup">
              <Dropdown>
                <Dropdown.Toggle id="dropdown-basic">
                  {chosenAnimation === "dijkstra"
                    ? "Dijkstra's Algorithm"
                    : chosenAnimation === "astar"
                    ? "A* Search"
                    : chosenAnimation === "bidirectional"
                    ? "Bidirectional Swarm Algorithm"
                    : "Algorithm"}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item
                    onClick={() => {
                      this.setState({ chosenAnimation: "dijkstra" });
                    }}
                  >
                    Dijkstra's Algorithm
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => this.setState({ chosenAnimation: "astar" })}
                  >
                    A* Search
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() =>
                      this.setState({ chosenAnimation: "bidirectional" })
                    }
                  >
                    Bidirectional Swarm Algorithm
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              <Dropdown>
                <Dropdown.Toggle id="dropdown-basic">
                  Mazes & Patterns
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item
                  // onClick={() => {
                  // }}
                  >
                    Simple stair pattern
                  </Dropdown.Item>
                  <Dropdown.Item
                  // onClick={() => this.setState({ chosenAnimation: "astar" })}
                  >
                    Recursive division
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
            <div>
              <button
                type="button"
                className="button visualize"
                onClick={() => {
                  this.setState(
                    { animationIsCompleted: [false, ""] },
                    function () {
                      if (chosenAnimation === "astar") {
                        this.visualizeAStar();
                      } else if (chosenAnimation === "dijkstra") {
                        this.visualizeDijkstra();
                      }
                    }
                  );
                }}
              >
                Visualize!
              </button>
            </div>

            <div className="clearing">
              {/* Cleares everything anf returns nodes back to original position */}
              <button
                className="button"
                onClick={() => {
                  this.setState({
                    grid: clearBoard(grid, "board", animationIsRunning),
                    animationIsCompleted: [false, ""],
                  });
                  // this.setState({  });
                }}
              >
                Clear Board
              </button>
              {/* Cleans path and walls */}
              <button
                className="button"
                onClick={() => {
                  this.setState({
                    grid: clearBoard(grid, "walls", animationIsRunning),
                  });
                  this.setState({ animationIsCompleted: [false, ""] });
                }}
              >
                Clear Walls
              </button>
              {/* Cleans just path */}
              <button
                className="button"
                onClick={() => {
                  this.setState({
                    grid: clearBoard(
                      grid,
                      "path",
                      animationIsRunning,
                      this.state.dragNode
                    ),
                  });
                  this.setState({ animationIsCompleted: [false, ""] });
                }}
              >
                Clear Path
              </button>
            </div>
          </div>
        </header>
        <div className="grid">
          {grid.map((row, rowIdx) => {
            return (
              <div id="row" key={rowIdx}>
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
                      onMouseUp={() => this.handleMouseUp()}
                      onMouseDown={() => this.handleMouseDown(row, col)}
                      onMouseEnter={() => this.handleMouseEnter(row, col)}
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
  for (let row = 0; row < 23; row++) {
    const currentRow = [];
    // Iterate through columns
    for (let col = 0; col < 59; col++) {
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
  if (
    (row === START_NODE_ROW && col === START_NODE_COL) ||
    (row === FINISH_NODE_ROW && col === FINISH_NODE_COL)
  )
    return grid;
  const newGrid = grid.slice();
  const node = newGrid[row][col];
  const newNode = {
    ...node,
    isWall: !node.isWall,
  };
  newGrid[row][col] = newNode;
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
    // grid = getInitialGrid();
    // Resetting the startNode
    START_NODE_COL = 16;
    START_NODE_ROW = 12;
    // Resetting the finishNode
    FINISH_NODE_ROW = 12;
    FINISH_NODE_COL = 45;
  }
  // Loop through rows
  for (let row = 0; row < 23; row++) {
    // Loop through columns
    for (let col = 0; col < 59; col++) {
      // If the object to clear is walls, reset the node at this position to be a new wall node.
      if (object === "walls") {
        grid[row][col] = createNode(row, col);
      }
      // If the object to clear is path, and the current node is not a wall, reset it to a new non-wall node.
      else if (object === "path" && grid[row][col].isWall === false) {
        grid[row][col] = createNode(row, col);
      } else if (object === "board") {
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
      document
        .getElementById(`node-${row}-${col}`)
        .classList.remove("node-visited-not-animated");
      document
        .getElementById(`node-${row}-${col}`)
        .classList.remove("node-shortest-path-not-animated");
    }
  }
  // Return the modified grid after clearing the specified object.
  return grid;
};
