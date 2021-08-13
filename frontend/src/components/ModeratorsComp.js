import React, { Component } from "react";
import { Grid, Segment, Header } from "semantic-ui-react";

class ModeratorsComp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      moderators: [],
      streamers: [],
    };
  }

  componentDidMount() {
    fetch("/get-top-moderators/10")
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
  }

  renderRows() {
    return Object.keys(this.state.moderators).map((moderator, id) => {
      return (
        <tr>
          <td>{this.state.moderators[id]["name"]}</td>
          <td>{this.state.streamers[id]["streamers"]}</td>
        </tr>
      );
    });
  }

  render() {
    const { error, isLoaded, moderators, streamers } = this.state;
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
                  Top moderators
                </Header>
                <p style={{ fontSize: "1.33em" }}>
                  Find out which user is the most popular channel moderator.
                </p>
              </Grid.Column>
              <Grid.Column floated="right" width={4}>
                <table class="ui inverted table">
                  <thead class="">
                    <tr class="">
                      <th class="">Moderator</th>
                      <th class="">Number of channels</th>
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

export default ModeratorsComp;
