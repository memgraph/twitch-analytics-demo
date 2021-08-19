import { Component } from "react";
import { Grid, Segment } from "semantic-ui-react";
import Graph from "./Graph";
import LeftColumn from "./LeftColumn";
import StreamersName from "./StreamersName";

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
    fetch("/get-streamer/" + name)
      .then((res) => res.json())
      .then(
        (result) => {
          this.setState({
            isLoaded: true,
            data: result,
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
      return <div>Loading...</div>;
    } else {
      const header = "Get to know your favourite streamer";
      const paragraph =
        "Find out which games does your favourite streamer plays, in which language does the streamer strems and which teams is the streamer part of.";
      const square = { width: 250, height: 250 };
      return (
        <Segment style={{ padding: "8em 0em" }} vertical>
          <Grid container stackable verticalAlign="middle">
            <Grid.Row>
              <Grid.Column width={8}>
                <LeftColumn header={header} paragraph={paragraph}></LeftColumn>
                <br></br>
                <StreamersName updateStateParent={this.updateStreamerName} />
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
