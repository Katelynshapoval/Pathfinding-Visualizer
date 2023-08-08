import React, { Component } from "react";
import Node from "./Node/Node";
import "./PathfindingVisualizer.css";
import { dijkstra, getNodesInShortestPathOrder } from "../algorithms/dijkstra";

const START_NODE_ROW = 10;
const START_NODE_COL = 15;
const FINISH_NODE_ROW = 10;
const FINISH_NODE_COL = 35;

export default class PathfindingVisualizer extends Component {
  constructor() {
    super();
    this.state = {
      grid: [],
    };
  }
  // Initializes the grid
  componentDidMount() {
    const grid = getInitialGrid();
    this.setState({ grid });
  }

  visualizeDijkstra() {
    const { grid } = this.state;
    const startNode = grid[START_NODE_ROW][START_NODE_COL];
    const finishNode = grid[FINISH_NODE_ROW][FINISH_NODE_COL];
    const visitedNodesInOrder = dijkstra(grid, startNode, finishNode);
    const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
    this.animateDjikstra(visitedNodesInOrder, nodesInShortestPathOrder);
  }
  animateDjikstra(visitedNodesInOrder, nodesInShortestPathOrder) {
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
        document.getElementById(`node-${node.row}-${node.col}`).className =
          "node node-visited";
      }, 10 * i);
    }
  }
  // Function to animate the shortest path after Dijkstra's algorithm
  animateShortestPath(nodesInShortestPathOrder) {
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      setTimeout(() => {
        const node = nodesInShortestPathOrder[i];
        document.getElementById(`node-${node.row}-${node.col}`).className =
          "node node-shortest-path";
      }, 50 * i);
    }
  }
  // Displays the grid of nodes
  render() {
    const { grid } = this.state;
    return (
      <>
        <button onClick={() => this.visualizeDijkstra()}>
          Visualize Dijkstra's Algorithm
        </button>
        <div className="grid">
          {grid.map((row, rowIdx) => {
            return (
              <div key={rowIdx}>
                {/* Map through each node in the row */}
                {row.map((node, nodeIdx) => {
                  const { row, col, isFinish, isStart } = node;
                  return (
                    // Create a Node component for each node
                    <Node
                      key={nodeIdx}
                      col={col}
                      row={row}
                      isFinish={isFinish}
                      isStart={isStart}
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
    previousNode: null,
  };
};
