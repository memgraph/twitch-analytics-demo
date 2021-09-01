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

class Teams extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      teams: [],
      members: [],
      numOfTeams: "10",
      header: "Top 10 teams",
    };
  }

  fetchData(number) {
    fetch("/get-top-teams/" + number)
      .then((res) => res.json())
      .then(
        (result) => {
          this.setState({
            isLoaded: true,
            teams: result.teams,
            members: result.members,
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
      numOfTeams: number,
      header: "Top " + number + " teams",
    });
  }

  componentDidMount() {
    this.fetchData(this.state.numOfTeams);
  }

  updateNumOfTeams = (num) => {
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
    const paragraph =
      "Find out which teams are the most popular. Choose a number of top teams you would like to see:";
    const headers = ["Team", "Number of members"];
    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return (
        <Segment style={{ padding: "8em 0em" }} vertical>
          <Dimmer active inverted>
            <Loader size="large" inverted>
              Getting top teams
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
                  updateStateParent={this.updateNumOfTeams}
                  placeHolder="Number of teams"
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
                  column_1={this.state.teams}
                  column_2={this.state.members}
                  column_1_key="name"
                  column_2_key="members"
                ></TableComp>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>
      );
    }
  }
}

export default Teams;
