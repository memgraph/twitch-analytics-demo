import React, { Component } from "react";
import { Grid, Segment, Header } from "semantic-ui-react";

class GamesComp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      games: [],
      players: [],
    };
  }

  componentDidMount() {
    fetch("/get-top-games/10")
      .then((res) => res.json())
      .then(
        (result) => {
          this.setState({
            isLoaded: true,
            games: result.games,
            players: result.players,
          });
          console.log(result);
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
    return Object.keys(this.state.games).map((game, id) => {
      return (
        <tr>
          <td>{this.state.games[id]["name"]}</td>
          <td>{this.state.players[id]["players"]}</td>
        </tr>
      );
    });
  }

  render() {
    const { error, isLoaded, games, players } = this.state;
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
                  Top games
                </Header>
                <p style={{ fontSize: "1.33em" }}>
                  Find out which games are played by the largest number of
                  streamers.
                </p>
              </Grid.Column>
              <Grid.Column floated="right" width={4}>
                <table class="ui inverted table">
                  <thead class="">
                    <tr class="">
                      <th class="">Game</th>
                      <th class="">Number of players</th>
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

export default GamesComp;
