import { Component } from "react";
import { Grid, Segment, Header } from "semantic-ui-react";
import GraphPR from "./GraphPR";

class PageRank extends Component {
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
    fetch("/get-page-rank")
      .then((res) => res.json())
      .then(
        (result) => {
          this.setState({
            isLoaded: true,
            nodes: result.page_rank,
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
      return <div>Loading...</div>;
    } else {
      const header = "Who is the most popular Twitch user?";
      const paragraph =
        "Find out which user is most popular using PageRank algorithm.";
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
                <GraphPR nodes={this.state.nodes} />
              </Segment>
            </Grid.Column>
          </Grid>
        </Segment>
      );
    }
  }
}

export default PageRank;
