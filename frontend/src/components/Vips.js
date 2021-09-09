import React, { Component } from "react";
import {
  Grid,
  Segment,
  Header,
  Dimmer,
  Loader,
} from "semantic-ui-react";
import TableComp from "./TableComp";

class Vips extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      vips: [],
      streamers: [],
      numOfVips: "10",
      header: "Top 10 vips",
    };
  }

  fetchData(number) {
    fetch("/top-vips/" + number)
      .then((res) => res.json())
      .then(
        (result) => {
          this.setState({
            isLoaded: true,
            vips: result.vips,
            streamers: result.streamers,
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
      numOfVips: number,
      header: "Top " + number + " vips",
    });
  }
  componentDidMount() {
    this.fetchData(this.state.numOfVips);
  }

  render() {
    const { error, isLoaded, header } = this.state;
    const paragraph =
      "Find out which user has the most vip badges.";
    const headers = ["Vip", "Number of badges"];
    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return (
        <Segment style={{ padding: "8em 0em" }} vertical>
          <Dimmer active inverted>
            <Loader size="large" inverted>
              Getting top vips
            </Loader>
          </Dimmer>
        </Segment>
      );
    } else {
      return (
        <Segment style={{ padding: "8em 0em" }} vertical>
          <Grid container stackable verticalAlign="middle">
            <Grid.Row>
              <Grid.Column width={8}>
                <Header as="h3" style={{ fontSize: "2em" }}>
                  {header}
                </Header>
                <p style={{ fontSize: "1.33em" }}>{paragraph}</p>
              </Grid.Column>
              <Grid.Column floated="right" width={4}>
                <TableComp
                  headers={headers}
                  column_1={this.state.vips}
                  column_2={this.state.streamers}
                  column_1_key="name"
                  column_2_key="streamers"
                ></TableComp>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>
      );
    }
  }
}

export default Vips;
