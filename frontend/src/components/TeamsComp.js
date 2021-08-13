import React, { Component } from "react";
import { Grid, Segment, Header } from "semantic-ui-react";

class TeamsComp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      teams: [],
      members: [],
    };
  }

  componentDidMount() {
    fetch("/get-top-teams/10")
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
  }

  renderRows() {
    return Object.keys(this.state.teams).map((team, id) => {
      return (
        <tr>
          <td>{this.state.teams[id]["name"]}</td>
          <td>{this.state.members[id]["members"]}</td>
        </tr>
      );
    });
  }

  render() {
    const { error, isLoaded, teams, members } = this.state;
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
                  Top teams
                </Header>
                <p style={{ fontSize: "1.33em" }}>
                  Find out which teams are the most popular.
                </p>
              </Grid.Column>
              <Grid.Column floated="right" width={4}>
                <table class="ui inverted table">
                  <thead class="">
                    <tr class="">
                      <th class="">Team</th>
                      <th class="">Number of members</th>
                    </tr>
                  </thead>
                  <tbody class="">{this.renderRows()}</tbody>
                </table>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>
      );
    }
  }
}

export default TeamsComp;
