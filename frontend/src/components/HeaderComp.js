import React, { Component } from "react";
import {
  Button,
  Container,
  Menu,
  Segment,
  Visibility,
  Header,
  MenuItem,
} from "semantic-ui-react";
import Counter from "./Counter";

function TwitchHeading(props) {
  return (
    <Container text>
      <Header
        as="h1"
        content="Twitch Analytics Demo"
        inverted
        style={{
          fontSize: "4em",
          fontWeight: "normal",
          marginBottom: 0,
          marginTop: "2em",
        }}
      />
      <Header
        as="h2"
        content="World's leading live streaming platform"
        inverted
        style={{
          fontSize: "1.7em",
          fontWeight: "normal",
          marginTop: "1.5em",
        }}
      />
    </Container>
  );
}

class HeaderComp extends Component {
  state = {};
  hideFixedMenu = () => this.setState({ fixed: false });
  showFixedMenu = () => this.setState({ fixed: true });
  handleClick = (e) => this.props.scrollTarget(e.target.id);
  handleClickFromHeader = (id) => this.props.scrollTarget(id);
  render() {
    const { fixed } = this.state;

    return (
      <Visibility
        once={false}
        onBottomPassed={this.showFixedMenu}
        onBottomPassedReverse={this.hideFixedMenu}
      >
        <Segment
          inverted
          textAlign="center"
          style={{ minHeight: 500, padding: "1em 0em" }}
          vertical
        >
          <Menu
            fixed={fixed ? "top" : null}
            inverted={!fixed}
            pointing={!fixed}
            secondary={!fixed}
            size="large"
          >
            <Menu.Item as="a">
              <Button
                id="GeneralStats"
                onClick={this.handleClick}
                as="a"
                inverted={!fixed}
                color="orange"
              >
                General statistics
              </Button>
            </Menu.Item>

            <Menu.Item as="a">
              <Button
                id="GraphHeader"
                onClick={this.handleClick}
                as="a"
                inverted={!fixed}
                color="orange"
              >
                Graph visualization
              </Button>
            </Menu.Item>
            <MenuItem as="a">
              <Counter count="nodes" />
            </MenuItem>
            <MenuItem as="a">
              <Counter count="edges" />
            </MenuItem>
          </Menu>
          <TwitchHeading handleClickGraph={this.handleClickFromHeader} />
        </Segment>
      </Visibility>
    );
  }
}

export default HeaderComp;
