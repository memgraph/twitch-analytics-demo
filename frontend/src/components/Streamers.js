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

class Streamers extends Component {
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
      numOfStrViews: "10",
      numOfStrFollowers: "10",
      headerViews: "Top 10 streamers by views",
      headerFollowers: "Top 10 streamers by followers",
    };
  }

  fetchDataViews(number) {
    fetch("/get-top-streamers-by-views/" + number)
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
    this.setState({
      numOfStrFollowers: number,
      headerViews: "Top " + number + " streamers by views",
    });
  }

  fetchDataFollowers(number) {
    fetch("/get-top-streamers-by-followers/" + number)
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
    this.setState({
      numOfStrViews: number,
      headerFollowers: "Top " + number + " streamers by followers",
    });
  }

  componentDidMount() {
    this.fetchDataViews(this.state.numOfStrViews);
    this.fetchDataFollowers(this.state.numOfStrFollowers);
  }

  updateNumOfStrViews = (num) => {
    this.fetchDataViews(num.value);
  };

  updateNumOfStrFollowers = (num) => {
    this.fetchDataFollowers(num.value);
  };

  handleRefreshFollowers = () => {
    this.fetchDataFollowers("10");
  };

  handleRefreshViews = () => {
    this.fetchDataViews("10");
  };

  render() {
    const {
      error,
      isViewsLoaded,
      isFollowersLoaded,
      headerViews,
      headerFollowers,
    } = this.state;
    const paragraphViews =
      "Check out most popular streamers by view count. Choose a number of top streamers you would like to see:";
    const headersViews = ["Streamer", "Number of views"];
    const paragraphFollowers =
      "Find out which streamers have the largest fan base. Choose a number of top streamers you would like to see:";
    const headersFollowers = ["Streamer", "Number of followers"];
    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isViewsLoaded || !isFollowersLoaded) {
      return (
        <Segment style={{ padding: "8em 0em" }} vertical>
          <Dimmer active inverted>
            <Loader size="large" inverted>
              Getting top streamers
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
                  {headerViews}
                </Header>
                <p style={{ fontSize: "1.33em" }}>{paragraphViews}</p>
                <br></br>
                <DropdownComp
                  updateStateParent={this.updateNumOfStrViews}
                  placeHolder="Number of streamers"
                />
                <br></br>
                <Button
                  inverted
                  color="orange"
                  icon
                  labelPosition="left"
                  onClick={this.handleRefreshViews}
                >
                  <Icon name="refresh" />
                  Refresh
                </Button>
              </Grid.Column>
              <Grid.Column floated="right" width={4}>
                <TableComp
                  headers={headersViews}
                  column_1={this.state.streamersViews}
                  column_2={this.state.views}
                  column_1_key="name"
                  column_2_key="views"
                ></TableComp>
              </Grid.Column>
            </Grid.Row>
          </Grid>
          <Grid container stackable verticalAlign="middle">
            <Grid.Row>
              <Grid.Column width={8}>
                <Header as="h3" style={{ fontSize: "2em" }}>
                  {headerFollowers}
                </Header>
                <p style={{ fontSize: "1.33em" }}>{paragraphFollowers}</p>
                <br></br>
                <DropdownComp
                  updateStateParent={this.updateNumOfStrFollowers}
                  placeHolder="Number of streamers"
                />
                <br></br>
                <Button
                  inverted
                  color="orange"
                  icon
                  labelPosition="left"
                  onClick={this.handleRefreshFollowers}
                >
                  <Icon name="refresh" />
                  Refresh
                </Button>
              </Grid.Column>
              <Grid.Column floated="right" width={4}>
                <TableComp
                  headers={headersFollowers}
                  column_1={this.state.streamersFollowers}
                  column_2={this.state.followers}
                  column_1_key="name"
                  column_2_key="followers"
                ></TableComp>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>
      );
    }
  }
}

export default Streamers;
