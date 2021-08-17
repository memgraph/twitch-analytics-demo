import { Component } from "react";
//import { Graph } from "react-d3-graph";

class SvgComp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      data: {},
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
    /* const myConfig = {
      nodeHighlightBehavior: true,
      node: {
        color: "lightgreen",
        size: 120,
        labelProperty: "name",
        highlightStrokeColor: "blue",
      },
      link: {
        type: "CURVE_SMOOTH",
        highlightColor: "lightblue",
      },
    };*/
    const { error, isLoaded } = this.state;
    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <div>Loading...</div>;
    } else {
      console.log(this.state.links);
      console.log(this.state.nodes);
      //if (this.state.nodes.length !== 0) {
      //obrisi stari sadrzaj svg-a (innerHTML = "")
      //   draw_graph(this.state.links, this.state.nodes);
      //  } else {
      // User with that name does not exist
      // }
      return (
        <svg width="1400" height="600"></svg>
        /* <Graph
          id="graph-id" // id is mandatory, if no id is defined rd3g will throw an error
          data={this.state.data}
          config={myConfig}
        />*/
      );
    }
  }
}

export default SvgComp;
