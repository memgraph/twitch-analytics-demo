import React, { Component } from "react";
import {
  Button,
  Container,
  Menu,
  Segment,
  Visibility,
  Header,
  Icon,
} from "semantic-ui-react";

function TwitchHeading() {
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
      <button id="GraphHeader" class="huge ui orange basic inverted button">
        Graph visualization
        <Icon name="right arrow" />
      </button>
    </Container>
  );
}

class HeaderComp extends Component {
  state = {};
  hideFixedMenu = () => this.setState({ fixed: false });
  showFixedMenu = () => this.setState({ fixed: true });
  handleClick = (e) => this.props.scrollTarget(e.target.id);
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
          style={{ minHeight: 700, padding: "1em 0em" }}
          vertical
        >
          <Menu
            fixed={fixed ? "top" : null}
            inverted={!fixed}
            pointing={!fixed}
            secondary={!fixed}
            size="large"
          >
            <Container>
              <Menu.Item as="a">
                <Button
                  id="Games"
                  onClick={this.handleClick}
                  as="a"
                  inverted={!fixed}
                  color="orange"
                >
                  Games
                </Button>
              </Menu.Item>
              <Menu.Item as="a">
                <Button
                  id="Teams"
                  onClick={this.handleClick}
                  as="a"
                  inverted={!fixed}
                  color="orange"
                >
                  Teams
                </Button>
              </Menu.Item>
              <Menu.Item as="a">
                <Button
                  id="Vips"
                  onClick={this.handleClick}
                  as="a"
                  inverted={!fixed}
                  color="orange"
                >
                  Vips
                </Button>
              </Menu.Item>
              <Menu.Item as="a">
                <Button
                  id="Moderators"
                  onClick={this.handleClick}
                  as="a"
                  inverted={!fixed}
                  color="orange"
                >
                  Moderators
                </Button>
              </Menu.Item>
              <Menu.Item as="a">
                <Button
                  id="Streamers"
                  onClick={this.handleClick}
                  as="a"
                  inverted={!fixed}
                  color="orange"
                >
                  Streamers
                </Button>
              </Menu.Item>
            </Container>
          </Menu>
          <TwitchHeading />
        </Segment>
      </Visibility>
    );
  }
}

export default HeaderComp;
