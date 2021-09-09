import React, { Component } from "react";
import { Form, Radio } from "semantic-ui-react";

export default class RadioPick extends Component {
  state = {
    value: this.props.defaultValue,
  };

  twoCalls = (e, { value }) => {
    this.handleChange(e, { value });
    this.changeStateParent(e, { value });
  };

  handleChange = (e, { value }) => this.setState({ value });
  changeStateParent = (e, { value }) => {
    this.props.updateStateParent({ value });
  };

  render() {
    return (
      <Form>
        <Form.Field>
          <Radio
            label="By followers"
            name="radioGroup"
            value="followers"
            checked={this.state.value === "followers"}
            onChange={this.twoCalls}
          />
        </Form.Field>
        <Form.Field>
          <Radio
            label="By views"
            name="radioGroup"
            value="views"
            checked={this.state.value === "views"}
            onChange={this.twoCalls}
          />
        </Form.Field>
      </Form>
    );
  }
}
