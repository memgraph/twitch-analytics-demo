import React, { Component } from "react";
import {
  Table,
  Image,
  Header,
  Segment,
  Dimmer,
  Loader,
} from "semantic-ui-react";

class TableComp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      streamers: [],
      thumbnails: [],
    };
  }

  fetchThumbnails() {
    fetch("/get-thumbnails")
      .then((res) => res.json())
      .then(
        (result) => {
          this.setState({
            isLoaded: true,
            streamers: result.streamers,
            thumbnails: result.thumbnails,
          });
          console.log(result.thumbnails);
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
    this.fetchThumbnails();
  }

  renderRows() {
    return Object.keys(this.props.column_1).map((streamer, id) => {
      return (
        <Table.Row key={this.props.column_1[id][this.props.column_1_key]}>
          <Table.Cell>
            <Image src="" rounded size="mini" />
            <Header as="h4" inverted>
              <Header.Content>
                {this.props.column_1[id][this.props.column_1_key]}
              </Header.Content>
            </Header>
          </Table.Cell>
          <Table.Cell>
            {this.props.column_2[id][this.props.column_2_key]}
          </Table.Cell>
        </Table.Row>
      );
    });
  }
  render() {
    const { thumbnail, isLoaded, error } = this.state;
    console.log(thumbnail);
    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return (
        <Segment style={{ padding: "8em 0em" }} vertical>
          <Dimmer active inverted>
            <Loader size="large" inverted>
              Getting table
            </Loader>
          </Dimmer>
        </Segment>
      );
    } else {
      return (
        <Table inverted celled collapsing>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>{this.props.headers[0]}</Table.HeaderCell>
              <Table.HeaderCell>{this.props.headers[1]}</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>{this.renderRows()}</Table.Body>
        </Table>
      );
    }
  }
}

export default TableComp;
