import React, { Component } from "react";

import "./Node.css";

export default class Node extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const {
      row,
      col,
      isStart,
      isFinish,
      isWall,
      onMouseDown,
      onMouseEnter,
      onMouseUp,
    } = this.props;
    const extraClassName = isFinish
      ? "node-finish"
      : isStart
      ? "node-start"
      : isWall
      ? "node-wall"
      : "";

    return (
      <div
        id={`node-${row}-${col}`}
        className={`node ${extraClassName}`}
        onMouseDown={(e) => onMouseDown(e, row, col)}
        onMouseEnter={(e) => onMouseEnter(e, row, col)}
        onMouseUp={() => onMouseUp()}
      ></div>
    );
  }
}
