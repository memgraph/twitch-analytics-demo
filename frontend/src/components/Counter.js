import { Component } from "react";
import { Button } from "semantic-ui-react";

class Counter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoaded: false,
      error: false,
      counter: "0",
    };
  }

  fetch() {
    fetch("/" + this.props.count)
      .then((res) => res.json())
      .then(
        (result) => {
          this.setState({
            isLoaded: true,
            counter: result[this.props.count],
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
    this.interval = setInterval(() => this.fetch(), 3000);
  }
  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    const { error, isLoaded, counter } = this.state;
    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return (
        <Button loading secondary>
          Loading
        </Button>
      );
    } else {
      if (this.props.count === "nodes") {
        return (
          <Button animated="vertical" inverted color="orange">
            <Button.Content visible> {counter} </Button.Content>
            <Button.Content hidden> Nodes </Button.Content>
          </Button>
        );
      } else {
        return (
          <Button animated="vertical" inverted color="orange">
            <Button.Content visible> {counter} </Button.Content>
            <Button.Content hidden> Edges </Button.Content>
          </Button>
        );
      }
    }
  }
}

export default Counter;
