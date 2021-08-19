import { Component } from "react";
import Graph from "./Graph";

class FetchStreamer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      nodes: [],
      links: [],
    };
  }

  fetchData() {
    fetch("/get-streamer/Fextralife")
      .then((res) => res.json())
      .then(
        (result) => {
          this.setState({
            isLoaded: true,
            data: result,
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
  }

  componentDidMount() {
    this.fetchData();
  }

  render() {
    const { error, isLoaded } = this.state;
    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <div>Loading...</div>;
    } else {
      return <Graph nodes={this.state.nodes} links={this.state.links} />;
    }
  }
}

export default FetchStreamer;
