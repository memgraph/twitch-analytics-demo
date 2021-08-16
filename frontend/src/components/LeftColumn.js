import { Component } from "react";
import { Header } from "semantic-ui-react";

class LeftColumn extends Component {
  constructor(props) {
    super(props);
    this.state = {
      header: "",
      paragraph: "",
    };
  }

  render() {
    return (
      <div>
        <Header as="h3" style={{ fontSize: "2em" }}>
          {this.props.header}
        </Header>
        <p style={{ fontSize: "1.33em" }}>{this.props.paragraph}</p>
      </div>
    );
  }
}

export default LeftColumn;
