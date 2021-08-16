import React, { Component } from "react";
import { Dropdown, Grid } from "semantic-ui-react";

const options = [
  { key: 5, text: "5", value: 5 },
  { key: 10, text: "10", value: 10 },
  { key: 15, text: "15", value: 15 },
  { key: 20, text: "20", value: 20 },
];

export default class DropdownComp extends Component {
  state = {};

  twoCalls = (e, { value }) => {
    this.handleChange(e, { value });
    this.changeStateParent(e, { value });
  };

  changeStateParent = (e, { value }) => {
    this.props.updateStateParent({ value });
  };

  handleChange = (e, { value }) => {
    this.setState({ value });
  };

  render() {
    const { value } = this.state;

    return (
      <Grid columns={2}>
        <Grid.Column>
          <Dropdown
            onChange={this.twoCalls}
            options={options}
            placeholder="Choose an option"
            selection
            value={value}
          />
        </Grid.Column>
      </Grid>
    );
  }
}
