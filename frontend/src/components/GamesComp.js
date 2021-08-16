import React, { Component } from "react";
import { Grid, Segment } from "semantic-ui-react";
import DropdownComp from "./DropdownComp";
import LeftColumn from "./LeftColumn";
import TableComp from "./TableComp";

class GamesComp extends Component {
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

  //on dropdown change set new numofgames state and change header to Top _numOfGames_ games

  fetchData() {
    fetch("/get-top-games/" + this.state.numOfGames)
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
  }

  componentDidMount() {
    this.fetchData();
  }

  componentDidUpdate() {
    this.fetchData();
  }

  updateNumOfGames = (num) => {
    console.log(num.value);
    this.setState({
      numOfGames: num.value,
      header: "Top " + num.value + " games",
    });
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
                <LeftColumn header={header} paragraph={paragraph}></LeftColumn>
                <br></br>
                <DropdownComp updateStateParent={this.updateNumOfGames} />
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

export default GamesComp;
