import { Component } from "react";
import { Segment, Header } from "semantic-ui-react";

class GraphHeader extends Component {
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
          Graph visualization
        </Header>
      </Segment>
    );
  }
}

export default GraphHeader;
