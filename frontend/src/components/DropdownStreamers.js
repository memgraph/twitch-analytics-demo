import React, { Component } from "react";
import { Dropdown } from "semantic-ui-react";

class DropdownStreamers extends Component {
  state = {
    value: "Followers",
  };

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
        text={value}
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
            value="Views"
            onClick={this.twoCalls}
          />
          <Dropdown.Item
            icon="user plus"
            text="Followers"
            value="Followers"
            onClick={this.twoCalls}
          />
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}

export default DropdownStreamers;
