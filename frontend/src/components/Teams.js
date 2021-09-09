import React, { Component } from "react";
import {
  Grid,
  Segment,
  Header,
  Dimmer,
  Loader,
} from "semantic-ui-react";
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
    fetch("/top-teams/" + number)
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

  render() {
    const { error, isLoaded, header } = this.state;
    const paragraph =
      "Find out which teams are the most popular.";
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
