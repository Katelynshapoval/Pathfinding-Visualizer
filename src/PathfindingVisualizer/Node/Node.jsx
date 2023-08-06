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
    return <div className={`node ${extraClassName}`}></div>;
  }
}
