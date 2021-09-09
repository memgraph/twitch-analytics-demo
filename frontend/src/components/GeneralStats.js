import { Component } from "react";
import { Segment, Header } from "semantic-ui-react";

class GeneralStats extends Component {
  render() {
    return (
      <Segment
        inverted
        textAlign="center"
        style={{ minHeight: 220, padding: "1em 0em" }}
        vertical
      >
        <Header
          as="h1"
          inverted
          color="orange"
          textAlign="center"
          style={{
            fontSize: "4em",
            fontWeight: "normal",
            marginBottom: 0,
            marginTop: "1em",
          }}
        >
          General statistics
        </Header>
      </Segment>
    );
  }
}

export default GeneralStats;
