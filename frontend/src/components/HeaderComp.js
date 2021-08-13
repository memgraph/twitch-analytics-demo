import React, { Component } from "react";
import {
  Button,
  Container,
  Menu,
  Segment,
  Visibility,
  Header,
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
    </Container>
  );
}

class HeaderComp extends Component {
  state = {};
  hideFixedMenu = () => this.setState({ fixed: false });
  showFixedMenu = () => this.setState({ fixed: true });
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
            <Container>
              <Menu.Item as="a">
                <Button as="a" inverted={!fixed}>
                  Games
                </Button>
              </Menu.Item>
              <Menu.Item as="a">
                <Button as="a" inverted={!fixed}>
                  Teams
                </Button>
              </Menu.Item>
              <Menu.Item as="a">
                <Button as="a" inverted={!fixed}>
                  Vips
                </Button>
              </Menu.Item>
              <Menu.Item as="a">
                <Button as="a" inverted={!fixed}>
                  Moderators
                </Button>
              </Menu.Item>
              <Menu.Item as="a">
                <Button as="a" inverted={!fixed}>
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
