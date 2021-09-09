import { Component } from "react";
import { Grid, Segment, Header, Dimmer, Loader, Button, Icon } from "semantic-ui-react";
import GraphPR from "./GraphPR";
import TableComp from "./TableComp";

class PageRank extends Component {
  _isMounted = false;
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      nodes: [],
    };
    this.handleRefresh = this.handleRefresh.bind(this);
  }


  fetchData(){
    fetch("/page-rank")
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

  handleRefresh = () => {
    this.fetchData();
  };

  componentDidMount() {
    this._isMounted = true;
    this.fetchData();
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
              Calculating PageRank
            </Loader>
          </Dimmer>
        </Segment>
      );
    } else {
      const { nodes } = this.state;
      const header = "Who is the most popular Twitch user?";
      const paragraph =
        "Find out which user is most popular using PageRank algorithm.";
      const headers = ["Streamer", "Rank"];
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
              <p align="center">                
                <Button
                    inverted
                    color="orange"
                    icon
                    labelPosition="left"
                    onClick={this.handleRefresh}
                  >
                    <Icon name="refresh" />
                    Refresh
                </Button>
              </p>          
            </Grid.Column>
          </Grid>
          <Grid centered columns={2}>
            <Grid.Column>
              <Segment
                textAlign="center"
                style={{ minHeight: 500, padding: "1em 0em" }}
                vertical
              >
                <GraphPR nodes={nodes} />
              </Segment>
            </Grid.Column>
            <Grid.Column width={2}>
              <TableComp
                headers={headers}
                column_1={top10nodes}
                column_2={top10nodes}
                column_1_key="name"
                column_2_key="rank"
              ></TableComp>
            </Grid.Column>
          </Grid>
        </Segment>
      );
    }
  }
}

export default PageRank;
