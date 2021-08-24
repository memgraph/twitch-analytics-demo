import React, { Component } from "react";
import { Grid, Segment, Header } from "semantic-ui-react";
import DropdownComp from "./DropdownComp";
import TableComp from "./TableComp";

class Games extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      games: [],
      players: [],
      numOfGames: "10",
      header: "Top 10 games",
    };
  }

  fetchData(number) {
    fetch("/get-top-games/" + number)
      .then((res) => res.json())
      .then(
        (result) => {
          this.setState({
            isLoaded: true,
            games: result.games,
            players: result.players,
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
      numOfGames: number,
      header: "Top " + number + " games",
    });
  }

  componentDidMount() {
    this.fetchData(this.state.numOfGames);
  }

  updateNumOfGames = (num) => {
    this.fetchData(num.value);
  };

  render() {
    const { error, isLoaded, header } = this.state;
    const paragraph =
      "Find out which games are played by the largest number of streamers. Choose a number of top games you would like to see:";
    const headers = ["Game", "Number of players"];
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
                  updateStateParent={this.updateNumOfGames}
                  placeHolder="Number of games"
                />
              </Grid.Column>
              <Grid.Column floated="right" width={4}>
                <TableComp
                  headers={headers}
                  column_1={this.state.games}
                  column_2={this.state.players}
                  column_1_key="name"
                  column_2_key="players"
                ></TableComp>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>
      );
    }
  }
}

export default Games;
