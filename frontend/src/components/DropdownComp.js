import React, { Component } from "react";
import { Dropdown, Grid } from "semantic-ui-react";

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
            options={this.props.options}
            placeholder={this.props.placeHolder}
            selection
            value={value}
          />
        </Grid.Column>
      </Grid>
    );
  }
}
