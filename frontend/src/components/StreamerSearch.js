import React, { Component } from "react";
import AutoSearch from "./AutoSearch";

class StreamerSearch extends Component {
  state = { submittedName: "" };

  handleSubmit = (strName) => {
    this.setState({ submittedName: strName }, () => {
      this.props.updateStateParent(this.state.submittedName);
    });
    this.setState({ name: "" });
  };

  render() {
    return (
      <div>
        <AutoSearch updateStateParent={this.handleSubmit} />
      </div>
    );
  }
}

export default StreamerSearch;
