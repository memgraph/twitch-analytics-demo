import React, { Component } from "react";
import { Dropdown } from "semantic-ui-react";

class DropdownStreamers extends Component {
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
      <Dropdown
        text="Sort by"
        icon="sort"
        floating
        labeled
        button
        className="icon"
      >
        <Dropdown.Menu>
          <Dropdown.Item
            icon="eye"
            text="Views"
            value="views"
            onClick={this.twoCalls}
          />
          <Dropdown.Item
            icon="user plus"
            text="Followers"
            value="followers"
            onClick={this.twoCalls}
          />
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}

export default DropdownStreamers;
