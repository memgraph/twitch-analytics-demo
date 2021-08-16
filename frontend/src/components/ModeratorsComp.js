import React, { Component } from "react";
import { Grid, Segment } from "semantic-ui-react";
import DropdownComp from "./DropdownComp";
import LeftColumn from "./LeftColumn";
import TableComp from "./TableComp";

class ModeratorsComp extends Component {
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

  render() {
    const { error, isLoaded, header } = this.state;
    const headers = ["Moderator", "Number of channels"];
    const paragraph =
      "Find out which user is the most popular channel moderator. Choose a number of top moderators you would like to see:";
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
                <LeftColumn header={header} paragraph={paragraph}></LeftColumn>
                <br></br>
                <DropdownComp
                  updateStateParent={this.updateNumOfMods}
                  placeHolder="Number of moderators"
                />
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

export default ModeratorsComp;
