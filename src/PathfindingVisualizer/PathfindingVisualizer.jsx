import React, { Component, createRef, useRef } from "react";
import Node from "./Node/Node";
import "./PathfindingVisualizer.css";
import { dijkstra, getNodesInShortestPathOrder } from "../algorithms/dijkstra";
import { astar } from "../algorithms/astar";
import Dropdown from "react-bootstrap/Dropdown";
import { ReactComponent as Arrowright } from "./Node/arrow-right.svg";
import { ReactComponent as FinishNode } from "./Node/circle.svg";
import { stairPattern } from "../mazeAlgorithms/stairPattern";
import { recursiveDivisionMaze } from "../mazeAlgorithms/recursiveDivision";
import { basicRandomMaze } from "../mazeAlgorithms/BasicRandomMaze";

let START_NODE_COL = 16;
let FINISH_NODE_ROW = 11;
let START_NODE_ROW = 11;
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
      speed: "fast",
    };
    this.nodeRefs = [];
  }

  // Initializes the grid and create nodeReft
  componentDidMount() {
    const grid = getInitialGrid();
    this.setState({ grid });
    for (let row = 0; row < 23; row++) {
      this.nodeRefs[row] = [];
      for (let col = 0; col < 59; col++) {
        this.nodeRefs[row][col] = createRef();
      }
    }
  }
  // This function is called when the mouse button is pressed down on a grid cell.
  handleMouseDown(row, col) {
    // If an animation is currently running, do nothing.
    if (this.state.animationIsRunning) return;

    // Check if the mouse is pressed on the start node.
    if (row === START_NODE_ROW && col === START_NODE_COL) {
      // Set the dragNode state to indicate that the start node is being dragged.
      this.setState({
        dragNode: [true, "start"],
      });
    }
    // Check if the mouse is pressed on the finish node.
    else if (row === FINISH_NODE_ROW && col === FINISH_NODE_COL) {
      // Set the dragNode state to indicate that the finish node is being dragged.
      this.setState({
        dragNode: [true, "finish"],
      });
    }
    // If neither start nor finish node is being dragged and animation is not running, toggle wall on the grid.
    else if (this.state.dragNode[0] === false) {
      // Generate a new grid with the wall toggled at the specified row and column.
      const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
      // Update the grid state with the new grid that includes the wall change.
      this.setState({ grid: newGrid });
    }
    // Set the mouseIsPressed state to true to indicate that the mouse button is being held down.
    this.setState({ mouseIsPressed: true });
  }

  // This function is called when the mouse enters a grid cell.
  handleMouseEnter(row, col) {
    // If an animation is currently running or the mouse button is not pressed, do nothing.
    if (this.state.animationIsRunning || !this.state.mouseIsPressed) return;

    // Check if a node is being dragged.
    if (this.state.dragNode[0]) {
      // Move the dragged node to the new position on the grid.
      let grid = this.move(this.state.grid, row, col, this.state.dragNode);
      // Update the grid state with the new grid after the node movement.
      this.setState({ grid: grid }, () => {
        // If the animation is completed and its type is dijkstra or astar, trigger visualization.
        if (this.state.animationIsCompleted[0]) {
          if (this.state.animationIsCompleted[1] === "dijkstra") {
            this.visualizeDijkstra();
          } else if (this.state.animationIsCompleted[1] === "astar") {
            this.visualizeAStar();
          }
        }
      });
    } else {
      // If no node is being dragged, toggle wall on the grid at the specified row and column.
      const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
      // Update the grid state with the new grid that includes the wall change.
      this.setState({ grid: newGrid });
    }
  }

  // This function is called when the mouse button is released.
  handleMouseUp() {
    // If an animation is currently running, do nothing.
    if (this.state.animationIsRunning) return;

    // Set the mouseIsPressed state to false to indicate that the mouse button is no longer pressed.
    this.setState({ mouseIsPressed: false });

    // Reset the dragNode state to indicate that no node is being dragged.
    this.setState({ dragNode: [false, ""] });
  }

  // Visualize the Dijkstra's algorithm on the grid.
  visualizeDijkstra() {
    // Retrieve the current grid and the start and finish nodes from the state.
    const { grid } = this.state;
    const startNode = grid[START_NODE_ROW][START_NODE_COL];
    const finishNode = grid[FINISH_NODE_ROW][FINISH_NODE_COL];

    // Run Dijkstra's algorithm to find the visited nodes in order.
    const visitedNodesInOrder = dijkstra(grid, startNode, finishNode);

    // Calculate the nodes in the shortest path order based on the visited nodes.
    const nodesInShortestPathOrder = getNodesInShortestPathOrder(
      visitedNodesInOrder,
      finishNode,
      startNode
    );

    // Trigger the animation of the algorithm, passing the visited nodes, shortest path nodes, and algorithm type.
    this.animateAlgorithm(
      visitedNodesInOrder,
      "dijkstra",
      nodesInShortestPathOrder
    );
  }

  // Visualize the A* algorithm on the grid.
  visualizeAStar() {
    // Retrieve the current grid and the start and finish nodes from the state.
    const { grid } = this.state;
    const startNode = grid[START_NODE_ROW][START_NODE_COL];
    const finishNode = grid[FINISH_NODE_ROW][FINISH_NODE_COL];

    // Run the A* algorithm to find the visited nodes in order.
    const visitedNodesInOrder = astar(grid, startNode, finishNode);
    // const visitedNodesInOrder = [];

    // Trigger the animation of the algorithm, passing the visited nodes and algorithm type.
    this.animateAlgorithm(visitedNodesInOrder, "astar");
  }
  // Visualize the BidirectionalSearch algorithm on the grid
  async visualizePattern(maze) {
    // Get the current state of the grid
    await this.setState({
      grid: clearBoard(
        this.state.grid,
        "walls",
        this.state.animationIsRunning,
        this.nodeRefs
      ),
      animationIsRunning: true,
    });
    const { grid } = this.state;
    // Speed of animation
    let speed =
      this.state.speed === "fast"
        ? 6
        : this.state.speed === "average"
        ? 60
        : this.state.speed === "slow"
        ? 320
        : 10;
    // Obtain the walls in the staircase pattern by calling the 'stairPattern' or 'recursiveDivisionMaze' function.
    // Depending on the 'maze' parameter.
    let walls =
      maze === "stairs"
        ? stairPattern(grid)
        : maze === "recursive"
        ? recursiveDivisionMaze(grid, 0, 22, 0, 58, "h", [], [])
        : maze === "basic"
        ? basicRandomMaze(grid)
        : [];

    // Create a Promise to wait for the animations to complete
    const animationPromise = new Promise((resolve) => {
      let animationCount = 0;

      // Function to be called after each animation is complete
      const onAnimationComplete = () => {
        animationCount++;
        if (animationCount === walls.length) {
          // Resolve the promise when all animations are complete
          resolve();
        }
      };

      // Iterate through the 'walls' array to visualize each wall element with a delay.
      walls.forEach((wall, i) => {
        const wallRef = this.nodeRefs[wall.row][wall.col].current;

        // Set a timeout for each animation, with a delay proportional to the index 'i'
        setTimeout(() => {
          if (
            // Check if the current wall is not the start or finish node
            !(wall.row === START_NODE_ROW && wall.col === START_NODE_COL) &&
            !(wall.row === FINISH_NODE_ROW && wall.col === FINISH_NODE_COL)
          ) {
            // Add the 'node-wall' class to visually represent a wall
            wallRef.classList.add("node-wall");
          }

          // Call the onAnimationComplete function after each animation
          onAnimationComplete();
        }, speed * i);
      });
    });

    // Wait for the animations to complete before updating the state
    await animationPromise;

    // Update the state after animations are complete
    this.setState({ grid: grid, animationIsRunning: false });
  }

  animateAlgorithm(
    visitedNodesInOrder,
    algorithm,
    nodesInShortestPathOrder = visitedNodesInOrder
  ) {
    // Check if an animation is already running, and if so, return.
    if (this.state.animationIsRunning) return;

    // Determine animation speed based on the selected speed settings.
    let speed =
      this.state.speed === "fast"
        ? 10
        : this.state.speed === "average"
        ? 80
        : this.state.speed === "slow"
        ? 350
        : 10;

    // Clear the board of previous path markings and set animationIsRunning to true.
    this.setState({
      grid: clearBoard(
        this.state.grid,
        "path",
        this.state.animationIsRunning,
        this.nodeRefs
      ),
      animationIsRunning: true,
    });

    // Iterate through visited nodes and animate them.
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      // After all visited nodes have been animated, animate the shortest path.
      if (i === visitedNodesInOrder.length) {
        // Check if animation completion flags indicate it's not completed or it's a different algorithm.
        if (
          this.state.animationIsCompleted[0] === false ||
          this.state.animationIsCompleted[1] !== algorithm
        ) {
          // Schedule animation of the shortest path with a delay based on speed.
          setTimeout(() => {
            this.animateShortestPath(nodesInShortestPathOrder, algorithm);
          }, speed * i);
        } else {
          // Animate the shortest path immediately.
          this.animateShortestPath(nodesInShortestPathOrder, algorithm);
        }
        return;
      }

      // Animate each visited node.
      const node = visitedNodesInOrder[i];
      const nodeRef = this.nodeRefs[node.row][node.col].current;

      // Check animation completion flags to determine the animation behavior.
      if (
        this.state.animationIsCompleted[0] === false ||
        this.state.animationIsCompleted[1] !== algorithm
      ) {
        // Schedule animation of visited node with a delay based on speed.
        setTimeout(() => {
          nodeRef.classList.add("node-visited");
        }, speed * i);
      } else {
        // If animation is already completed, apply a different CSS class for the visited node.
        nodeRef.classList.add("node-visited-not-animated");
      }
    }
  }

  // Function to animate the shortest path after Dijkstra's algorithm
  animateShortestPath(nodesInShortestPathOrder, algorithm) {
    // Check if animation is not completed or if the algorithm has changed
    // (animationIsCompleted[0] corresponds to completion status, animationIsCompleted[1] to algorithm)
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      const node = nodesInShortestPathOrder[i];
      const nodeRef = this.nodeRefs[node.row][node.col].current;

      if (
        this.state.animationIsCompleted[0] === false || // If animation is not completed
        this.state.animationIsCompleted[1] !== algorithm // Or if the algorithm has changed
      ) {
        // Delay the addition of classes to create an animation effect
        setTimeout(() => {
          // Add class to mark this node as part of the shortest path
          nodeRef.classList.add("node-shortest-path");

          // Add an arrow to the last shortest path node

          nodeRef.classList.add("active");
          if (i >= 1) {
            if (node.row < nodesInShortestPathOrder[i - 1].row) {
              nodeRef.classList.add("up");
            } else if (node.row > nodesInShortestPathOrder[i - 1].row) {
              nodeRef.classList.add("down");
            } else if (node.col > nodesInShortestPathOrder[i - 1].col) {
              nodeRef.classList.add("right");
            } else if (node.col < nodesInShortestPathOrder[i - 1].col) {
              nodeRef.classList.add("left");
            }
          }
          // After a short delay, remove the arrow (if not the last node)
          setTimeout(() => {
            if (i !== nodesInShortestPathOrder.length - 1 && i !== 0) {
              nodeRef.className = "node node-shortest-path";
            }
          }, 50);
        }, 50 * i); // Delay increases with each node to create animation effect
      } else {
        // Add class to mark this node as part of the shortest path without animation

        nodeRef.classList.add("node-shortest-path-not-animated");

        // Add an arrow to the last shortest path node

        nodeRef.classList.add("active");
        if (i === nodesInShortestPathOrder.length - 1) {
          nodeRef.className =
            "node node-finish node-visited-not-animated node-shortest-path-not-animated active";
          if (node.row < nodesInShortestPathOrder[i - 1].row) {
            nodeRef.classList.add("up");
          } else if (node.row > nodesInShortestPathOrder[i - 1].row) {
            nodeRef.classList.add("down");
          } else if (node.col > nodesInShortestPathOrder[i - 1].col) {
            nodeRef.classList.add("right");
          } else if (node.col < nodesInShortestPathOrder[i - 1].col) {
            nodeRef.classList.add("left");
          }
        }

        // Remove the arrow (if not the last node)
        if (i !== nodesInShortestPathOrder.length - 1) {
          nodeRef.classList.remove("active");
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
    let { grid, mouseIsPressed, animationIsRunning, chosenAnimation, speed } =
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
                    : "Algorithm"}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item
                    onClick={() => {
                      if (animationIsRunning) return;
                      this.setState({ chosenAnimation: "dijkstra" });
                    }}
                  >
                    Dijkstra's Algorithm
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => {
                      if (animationIsRunning) return;
                      this.setState({ chosenAnimation: "astar" });
                    }}
                  >
                    A* Search
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              <Dropdown>
                <Dropdown.Toggle id="dropdown-basic">
                  Mazes & Patterns
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item
                    onClick={() => {
                      if (animationIsRunning) return;
                      this.visualizePattern("stairs");
                    }}
                  >
                    Simple stair pattern
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => {
                      if (animationIsRunning) return;
                      this.visualizePattern("recursive");
                    }}
                  >
                    Recursive division
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => {
                      if (animationIsRunning) return;
                      this.visualizePattern("basic");
                    }}
                  >
                    Basic Random Maze
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
            <div>
              <button
                type="button"
                className="button visualize"
                onClick={() => {
                  if (animationIsRunning) return;
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

            <div className="secondary">
              {/* Cleares everything anf returns nodes back to original position */}
              <button
                className="button"
                onClick={() => {
                  if (animationIsRunning) return;
                  this.setState({
                    grid: clearBoard(
                      grid,
                      "board",
                      animationIsRunning,
                      this.nodeRefs
                    ),
                    animationIsCompleted: [false, ""],
                  });
                }}
              >
                Clear Board
              </button>
              {/* Cleans path and walls */}
              <button
                className="button"
                onClick={() => {
                  if (animationIsRunning) return;
                  this.setState({
                    grid: clearBoard(
                      grid,
                      "walls",
                      animationIsRunning,
                      this.nodeRefs
                    ),
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
                  if (animationIsRunning) return;
                  this.setState({
                    grid: clearBoard(
                      grid,
                      "path",
                      animationIsRunning,
                      this.nodeRefs
                    ),
                  });
                  this.setState({ animationIsCompleted: [false, ""] });
                }}
              >
                Clear Path
              </button>
            </div>
            <Dropdown className="speed">
              <Dropdown.Toggle id="dropdown-basic">
                Speed:
                {this.speed === "fast"
                  ? " Fast"
                  : speed === "average"
                  ? " Average"
                  : speed === "slow"
                  ? " Slow"
                  : " Fast"}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item
                  onClick={() => {
                    if (animationIsRunning) return;
                    this.setState({ speed: "fast" });
                  }}
                >
                  Fast
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => {
                    if (animationIsRunning) return;
                    this.setState({ speed: "average" });
                  }}
                >
                  Average
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => {
                    if (animationIsRunning) return;
                    this.setState({ speed: "slow" });
                  }}
                >
                  Slow
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </header>
        <div className="explanations">
          <div className="explanation">
            {/* <img src={arrowright} alt="h" srcset="" /> */}
            <Arrowright />
            <p>Start Node</p>
          </div>
          <div className="explanation">
            <FinishNode />
            <p>Target Node</p>
          </div>
          <div className="explanation">
            <div className="node"></div>
            <p>Unvisited Node</p>
          </div>
          <div className="explanation">
            <div className="node node-visited-not-animated"></div>
            <p>Visited Node</p>
          </div>
          <div className="explanation">
            <div className="node node-shortest-path-not-animated"></div>
            <p>Shortest-path Node</p>
          </div>
          <div className="explanation">
            <div className="node node-wall-not-animated"></div>
            <p>Wall Node</p>
          </div>
        </div>
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
                      nodeRefs={this.nodeRefs}
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
const clearBoard = (oldGrid, object, animationIsRunning, nodeRefs) => {
  // If an animation is currently running, do not modify the grid and just return the old grid.
  if (animationIsRunning) return oldGrid;
  // Create a copy of the oldGrid array to avoid modifying the original grid directly.
  let grid = oldGrid.slice();
  // If the object to clear is the entire board, reset the grid to its initial state and reset the start node's position.
  if (object === "board") {
    // grid = getInitialGrid();
    // Resetting the startNode
    START_NODE_COL = 16;
    START_NODE_ROW = 11;
    // Resetting the finishNode
    FINISH_NODE_ROW = 11;
    FINISH_NODE_COL = 45;
  }
  // Loop through rows
  for (let row = 0; row < 23; row++) {
    // Loop through columns
    for (let col = 0; col < 59; col++) {
      const nodeRef = nodeRefs[row][col].current;
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
      if (row === FINISH_NODE_ROW && col === FINISH_NODE_COL) {
        const nodeRef = nodeRefs[row][col].current;
        nodeRef.className = "node node-finish";
      }
      // Remove visual classes from the corresponding DOM element representing the node.
      nodeRef.classList.remove("node-visited");
      nodeRef.classList.remove("node-shortest-path");
      nodeRef.classList.remove("active");
      nodeRef.classList.remove("node-visited-not-animated");
      nodeRef.classList.remove("node-shortest-path-not-animated");
    }
  }
  // Return the modified grid after clearing the specified object.
  return grid;
};
