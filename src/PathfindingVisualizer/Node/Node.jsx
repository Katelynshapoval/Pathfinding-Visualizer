import React, { Component } from "react";

import "./Node.css";

export default class Node extends Component {
  render() {
    const { row, col, isStart, isFinish } = this.props;
    const extraClassName = isFinish
      ? "node-finish"
      : isStart
      ? "node-start"
      : "";
    return (
      <div id={`node-${row}-${col}`} className={`node ${extraClassName}`}></div>
    );
  }
}
