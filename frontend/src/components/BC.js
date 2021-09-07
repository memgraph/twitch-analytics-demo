import { Component } from "react";
import { Grid, Segment, Header, Dimmer, Loader } from "semantic-ui-react";
import GraphBC from "./GraphBC";
import TableComp from "./TableComp";

class BC extends Component {
  _isMounted = false;
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      nodes: [],
    };
  }

  componentDidMount() {
    this._isMounted = true;
    fetch("/betweenness-centrality")
      .then((res) => res.json())
      .then(
        (result) => {
          this.setState({
            isLoaded: true,
            nodes: result.bc,
          });
        },
        (error) => {
          this.setState({
            isLoaded: true,
            error,
          });
        }
      );
  }

  componentWillUnmount() {
    this._isMounted = false;
  }
  render() {
    const { error, isLoaded } = this.state;
    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return (
        <Segment style={{ padding: "8em 0em" }} vertical>
          <Dimmer active inverted>
            <Loader size="large" inverted>
              Calculating Betweenness centrality
            </Loader>
          </Dimmer>
        </Segment>
      );
    } else {
      const { nodes } = this.state;
      const header = "Which Twitch user has the most influence?";
      const paragraph =
        "Find out which user is most influential using Betweenness centrality algorithm.";
      const headers = ["Streamer", "BC"];
      let top10nodes = nodes.slice(0, 10);
      return (
        <Segment style={{ padding: "8em 0em" }} vertical>
          <Grid centered columns={2}>
            <Grid.Column>
              <Header as="h3" textAlign="center" style={{ fontSize: "2em" }}>
                {header}
              </Header>
              <p align="center" style={{ fontSize: "1.33em" }}>
                {paragraph}
              </p>
            </Grid.Column>
          </Grid>
          <br></br>
          <Grid centered columns={2}>
            <Grid.Column>
              <Segment
                textAlign="center"
                style={{ minHeight: 500, padding: "1em 0em" }}
                vertical
              >
                <GraphBC nodes={nodes} />
              </Segment>
            </Grid.Column>
            <Grid.Column width={2}>
              <TableComp
                headers={headers}
                column_1={top10nodes}
                column_2={top10nodes}
                column_1_key="name"
                column_2_key="betweenness_centrality"
              ></TableComp>
            </Grid.Column>
          </Grid>
        </Segment>
      );
    }
  }
}

export default BC;
