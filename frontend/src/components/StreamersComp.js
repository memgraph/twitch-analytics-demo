import React, { Component } from "react";
import { Grid, Segment, Header } from "semantic-ui-react";

class StreamersComp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isViewsLoaded: false,
      isFollowersLoaded: false,
      streamersViews: [],
      streamersFollowers: [],
      views: [],
      followers: [],
    };
  }

  componentDidMount() {
    fetch("/get-top-streamers-by-views/10")
      .then((res) => res.json())
      .then(
        (result) => {
          this.setState({
            isViewsLoaded: true,
            streamersViews: result.streamers,
            views: result.views,
          });
        },
        (error) => {
          this.setState({
            isViewsLoaded: true,
            error,
          });
        }
      );
    fetch("/get-top-streamers-by-followers/10")
      .then((res) => res.json())
      .then(
        (result) => {
          this.setState({
            isFollowersLoaded: true,
            streamersFollowers: result.streamers,
            followers: result.followers,
          });
        },
        (error) => {
          this.setState({
            isFollowersLoaded: true,
            error,
          });
        }
      );
  }

  renderViewsRows() {
    return Object.keys(this.state.streamersViews).map((streamer, id) => {
      return (
        <tr>
          <td>{this.state.streamersViews[id]["name"]}</td>
          <td>{this.state.views[id]["views"]}</td>
        </tr>
      );
    });
  }

  renderFollowersRows() {
    return Object.keys(this.state.streamersFollowers).map((streamer, id) => {
      return (
        <tr>
          <td>{this.state.streamersFollowers[id]["name"]}</td>
          <td>{this.state.followers[id]["followers"]}</td>
        </tr>
      );
    });
  }

  render() {
    const {
      error,
      isViewsLoaded,
      isFollowersLoaded,
      streamersViews,
      streamersFollowers,
      views,
      followers,
    } = this.state;
    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isViewsLoaded || !isFollowersLoaded) {
      return <div>Loading...</div>;
    } else {
      return (
        <Segment style={{ padding: "8em 0em" }} vertical>
          <Grid container stackable verticalAlign="middle">
            <Grid.Row>
              <Grid.Column width={8}>
                <Header as="h3" style={{ fontSize: "2em" }}>
                  Top streamers by views
                </Header>
                <p style={{ fontSize: "1.33em" }}>
                  Check out most popular streamers by view count.
                </p>
              </Grid.Column>
              <Grid.Column floated="right" width={4}>
                <table class="ui inverted table">
                  <thead class="">
                    <tr class="">
                      <th class="">Streamer</th>
                      <th class="">Number of views</th>
                    </tr>
                  </thead>
                  <tbody class="">{this.renderViewsRows()}</tbody>
                </table>
              </Grid.Column>
            </Grid.Row>
          </Grid>
          <Grid container stackable verticalAlign="middle">
            <Grid.Row>
              <Grid.Column width={8}>
                <Header as="h3" style={{ fontSize: "2em" }}>
                  Top streamers by followers
                </Header>
                <p style={{ fontSize: "1.33em" }}>
                  Find out which streamers have the largest fan base.
                </p>
              </Grid.Column>
              <Grid.Column floated="right" width={4}>
                <table class="ui inverted table">
                  <thead class="">
                    <tr class="">
                      <th class="">Streamer</th>
                      <th class="">Number of followers</th>
                    </tr>
                  </thead>
                  <tbody class="">{this.renderFollowersRows()}</tbody>
                </table>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>
      );
    }
  }
}

export default StreamersComp;
