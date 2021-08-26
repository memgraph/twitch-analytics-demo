import React from "react";
import { useD3 } from "../hooks/useD3";
import * as d3 from "d3";

function Graph(props) {
  const ref = useD3(
    (svg) => {
      svg.selectAll("*").remove();
      const height = 300;
      const width = 300;
      const simulation = d3
        .forceSimulation(props.nodes)
        .force(
          "link",
          d3
            .forceLink(props.links)
            .distance(100)
            .id((d) => d.id)
        )
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(width / 2, height / 2));
      const link = svg
        .append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(props.links)
        .join("line")
        .attr("stroke-width", 1);

      const node = svg
        .append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(props.nodes)
        .join("circle")
        .attr("r", 10)
        .attr("class", "node")
        .attr("fill", function (d) {
          if (d.label === "Team") return "red";
          else if (d.label === "Stream") return "orange";
          else if (d.label === "Game") return "blue";
          else if (d.label === "Language") return "purple";
        })
        .call(drag(simulation));

      var label = svg
        .selectAll(null)
        .data(props.nodes)
        .enter()
        .append("text")
        .text(function (d) {
          return d.name; //return d.label for label
        })
        .style("text-anchor", "middle")
        .style("fill", "white")
        .style("font-family", "Arial")
        .style("font-size", "12px");

      simulation.on("tick", () => {
        link
          .attr("x1", (d) => d.source.x)
          .attr("y1", (d) => d.source.y)
          .attr("x2", (d) => d.target.x)
          .attr("y2", (d) => d.target.y);

        node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
        label
          .attr("x", function (d) {
            return d.x;
          })
          .attr("y", function (d) {
            return d.y - 15;
          });
      });
    },
    [props.nodes.length]
  );

  const refEmpty = useD3((svg) => {
    svg.selectAll("*").remove();
    const height = 300;
    const width = 300;
    var g = svg.append("g").attr("transform", function (d, i) {
      return "translate(0,0)";
    });
    g.append("text")
      .attr("x", width / 2)
      .attr("y", height / 2)
      .attr("fill", "#ff7701")
      .attr("font-weight", "50")
      .text("No data available")
      .style("text-anchor", "middle")
      .style("font-family", "Arial")
      .style("font-size", "20px");
  });

  const drag = (simulation) => {
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return d3
      .drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  };
  if (props.nodes.length !== 0) {
    return (
      <svg
        ref={ref}
        style={{
          height: 300,
          width: 300,
          marginRight: "0px",
          marginLeft: "0px",
        }}
      ></svg>
    );
  } else {
    return (
      <svg
        ref={refEmpty}
        style={{
          height: 300,
          width: 300,
          marginRight: "0px",
          marginLeft: "0px",
        }}
      ></svg>
    );
  }
}

export default Graph;
