import React, { Component } from "react";
import { Table } from "semantic-ui-react";

class TableComp extends Component {
  renderRows() {
    return Object.keys(this.props.column_1).map((game, id) => {
      return (
        <Table.Row key={this.props.column_1[id][this.props.column_1_key]}>
          <Table.Cell>
            {this.props.column_1[id][this.props.column_1_key]}
          </Table.Cell>
          <Table.Cell>
            {this.props.column_2[id][this.props.column_2_key]}
          </Table.Cell>
        </Table.Row>
      );
    });
  }
  render() {
    return (
      <Table celled inverted selectable>
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

export default TableComp;
