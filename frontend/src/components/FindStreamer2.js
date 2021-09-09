import { Component } from "react";
import { Grid, Segment, Header, Dimmer, Loader } from "semantic-ui-react";
import Graph from "./Graph";
import AutoCompleteGame from "./AutoCompleteGame";

class FindStreamer2 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      nodes: [],
      links: [],
      streamerName: "Fextralife",
      game: "League of Legends",
      language: "en",
    };
  }

  fetchData(gameName, lang) {
    fetch("/streamers/" + lang + "/" + gameName)
      .then((res) => res.json())
      .then(
        (result) => {
          this.setState({
            isLoaded: true,
            nodes: result.nodes,
            links: result.links,
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
      game: gameName,
      language: lang,
    });
  }

  componentDidMount() {
    this.fetchData(this.state.game, this.state.language);
  }

  updateGameLang = (gameName, lang) => {
    this.fetchData(gameName, lang);
  };

  render() {
    const { error, isLoaded } = this.state;
    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return (
        <Segment style={{ padding: "8em 0em" }} vertical>
          <Dimmer active inverted>
            <Loader size="large" inverted>
              Finding all streamers
            </Loader>
          </Dimmer>
        </Segment>
      );
    } else {
      const header = "Find streamers by game and language";
      const paragraph =
        "Find all streamers who stream your favourite game in your language.";
      const square = { width: 250, height: 250 };
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
                <AutoCompleteGame updateStateParent={this.updateGameLang} />
              </Grid.Column>
              <Grid.Column floated="right" width={4}>
                <Segment circular inverted style={square}>
                  <Graph nodes={this.state.nodes} links={this.state.links} />
                </Segment>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>
      );
    }
  }
}

export default FindStreamer2;
