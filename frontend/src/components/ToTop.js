import React, { Component } from "react";
import { Button, Grid } from "semantic-ui-react";

class ToTop extends Component {
  constructor(props) {
    super(props);
    this.state = {
      is_visible: false,
    };
  }

  handleClick = (e) => {
    this.props.handleClickToTop(e.target.id);
  };

  componentDidMount() {
    var scrollComponent = this;
    document.addEventListener("scroll", function (e) {
      scrollComponent.toggleVisibility();
    });
  }

  toggleVisibility() {
    if (window.pageYOffset > 300) {
      this.setState({
        is_visible: true,
      });
    } else {
      this.setState({
        is_visible: false,
      });
    }
  }

  render() {
    const { is_visible } = this.state;
    return (
      <Grid centered columns={10}>
        <Grid.Column>
          {is_visible && (
            <Button
              id="HeaderComp"
              circular
              icon="angle double up"
              onClick={this.handleClick}
              color="orange"
            />
          )}
        </Grid.Column>
      </Grid>
    );
  }
}

export default ToTop;
