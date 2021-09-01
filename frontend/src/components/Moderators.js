import React, { Component } from "react";
import {
  Grid,
  Segment,
  Header,
  Dimmer,
  Loader,
  Button,
  Icon,
} from "semantic-ui-react";
import DropdownComp from "./DropdownComp";
import TableComp from "./TableComp";

class Moderators extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      moderators: [],
      streamers: [],
      numOfMods: "10",
      header: "Top 10 moderators",
    };
  }

  fetchData(number) {
    fetch("/get-top-moderators/" + number)
      .then((res) => res.json())
      .then(
        (result) => {
          this.setState({
            isLoaded: true,
            moderators: result.moderators,
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
      numOfMods: number,
      header: "Top " + number + " moderators",
    });
  }

  componentDidMount() {
    this.fetchData(this.state.numOfMods);
  }

  updateNumOfMods = (num) => {
    this.fetchData(num.value);
  };

  handleRefresh = () => {
    this.fetchData("10");
  };

  render() {
    const options = [
      { key: 5, text: "5", value: 5 },
      { key: 10, text: "10", value: 10 },
      { key: 15, text: "15", value: 15 },
      { key: 20, text: "20", value: 20 },
    ];
    const { error, isLoaded, header } = this.state;
    const headers = ["Moderator", "Number of channels"];
    const paragraph =
      "Find out which user is the most popular channel moderator. Choose a number of top moderators you would like to see:";
    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return (
        <Segment style={{ padding: "8em 0em" }} vertical>
          <Dimmer active inverted>
            <Loader size="large" inverted>
              Getting top moderators
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
                <br></br>
                <DropdownComp
                  options={options}
                  updateStateParent={this.updateNumOfMods}
                  placeHolder="Number of moderators"
                />
                <br></br>
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
              </Grid.Column>
              <Grid.Column floated="right" width={4}>
                <TableComp
                  headers={headers}
                  column_1={this.state.moderators}
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

export default Moderators;
