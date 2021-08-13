import React, { Component } from "react";
import { Grid, Segment, Header } from "semantic-ui-react";

class VipsComp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      vips: [],
      streamers: [],
    };
  }

  componentDidMount() {
    fetch("/get-top-vips/10")
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
  }

  renderRows() {
    return Object.keys(this.state.vips).map((vip, id) => {
      return (
        <tr>
          <td>{this.state.vips[id]["name"]}</td>
          <td>{this.state.streamers[id]["streamers"]}</td>
        </tr>
      );
    });
  }

  render() {
    const { error, isLoaded, vips, streamers } = this.state;
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
                  Top vips
                </Header>
                <p style={{ fontSize: "1.33em" }}>
                  Find out which user has the most vip badges.
                </p>
              </Grid.Column>
              <Grid.Column floated="right" width={4}>
                <table class="ui inverted table">
                  <thead class="">
                    <tr class="">
                      <th class="">Vip</th>
                      <th class="">Number of badges</th>
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

export default VipsComp;
