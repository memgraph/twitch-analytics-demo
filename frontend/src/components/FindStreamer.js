import { Component } from "react";
import { Grid, Segment, Header, Dimmer, Loader } from "semantic-ui-react";
import AutoSearch from "./AutoSearch";
import Graph from "./Graph";

class FindStreamer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      nodes: [],
      links: [],
      streamerName: "Fextralife",
    };
  }

  fetchData(name) {
    fetch("/streamer/" + name)
      .then((res) => res.json())
      .then(
        (result) => {
          this.setState({
            isLoaded: true,
            nodes: result.nodes,
            links: result.links,
          });
        },
        (error) => {
          this.setState({
            isLoaded: true,
            error,
          });
        }
      );
    this.setState({
      streamerName: name,
    });
  }

  componentDidMount() {
    this.fetchData(this.state.streamerName);
  }

  updateStreamerName = (strName) => {
    this.fetchData(strName);
  };

  render() {
    const { error, isLoaded } = this.state;
    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return (
        <Segment style={{ padding: "8em 0em" }} vertical>
          <Dimmer active inverted>
            <Loader size="large" inverted>
              Finding your streamer
            </Loader>
          </Dimmer>
        </Segment>
      );
    } else {
      const header = "Get to know your favourite streamer";
      const paragraph =
        "Games, teams and languages - all you need to know about your favourite streamer.";
      const square = { width: 250, height: 250 };
      return (
        <Segment style={{ padding: "8em 0em" }} vertical>
          <Grid container stackable verticalAlign="middle">
            <Grid.Row>
              <Grid.Column width={8}>
                <Header as="h3" style={{ fontSize: "2em" }}>
                  {header}
                </Header>
                <p style={{ fontSize: "1.33em" }}>{paragraph}</p>
                <br></br>
                <AutoSearch updateStateParent={this.updateStreamerName} />
              </Grid.Column>
              <Grid.Column floated="right" width={4}>
                <Segment circular inverted style={square}>
                  <Graph nodes={this.state.nodes} links={this.state.links} />
                </Segment>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>
      );
    }
  }
}

export default FindStreamer;
