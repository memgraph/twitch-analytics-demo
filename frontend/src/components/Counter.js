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
    const { counter } = this.state;
    return (
      <Button inverted color="orange">
        {counter}
      </Button>
    );
  }
}

export default Counter;
