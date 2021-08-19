import React, { Component } from "react";
import { Form } from "semantic-ui-react";

class StreamersName extends Component {
  state = { name: "", submittedName: "" };

  handleChange = (e, { name, value }) => {
    this.setState({ [name]: value });
  };

  handleSubmit = () => {
    const { name } = this.state;
    this.setState({ submittedName: name }, () => {
      this.props.updateStateParent(this.state.submittedName);
    });
    this.setState({ name: "" });
  };

  render() {
    const { name } = this.state;

    return (
      <div>
        <Form onSubmit={this.handleSubmit}>
          <Form.Group>
            <Form.Input
              placeholder="Streamer's name"
              name="name"
              value={name}
              onChange={this.handleChange}
            />
            <Form.Button content="Search" />
          </Form.Group>
        </Form>
      </div>
    );
  }
}

export default StreamersName;
