import React, { Component } from "react";
import { Grid, Segment, Header } from "semantic-ui-react";
import DropdownComp from "./DropdownComp";
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
    fetch("/get-top-vips/" + number)
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

  updateNumOfVips = (num) => {
    this.fetchData(num.value);
  };

  render() {
    const { error, isLoaded, header } = this.state;
    const paragraph =
      "Find out which user has the most vip badges. Choose a number of top vips you would like to see:";
    const headers = ["Vip", "Number of badges"];
    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <div>Loading...</div>;
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
                <br></br>
                <DropdownComp
                  updateStateParent={this.updateNumOfVips}
                  placeHolder="Number of vips"
                />
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
