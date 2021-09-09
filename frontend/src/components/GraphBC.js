import React from "react";
import { useD3 } from "../hooks/useD3";
import * as d3 from "d3";

function GraphPR(props) {
  const ref = useD3(
    (svg) => {
      svg.selectAll("*").remove();
      const height = 500;
      const width = 750;

      const simulation = d3
        .forceSimulation(props.nodes)
        .force(
          "x",
          d3.forceX().x((d) => d.x)
        )
        .force(
          "y",
          d3.forceY().y((d) => d.y)
        )
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force(
          "collide",
          d3.forceCollide().radius((d) => d.betweenness_centrality * 7000000)
        );

      const node = svg
        .append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(props.nodes)
        .join("circle")
        .attr("r", function (d) {
          return d.betweenness_centrality * 3000000;
        })
        .attr("class", "node")
        .attr("fill", "#ff7701")
        .call(drag(simulation));

      var label = svg
        .selectAll(null)
        .data(props.nodes)
        .enter()
        .append("text")
        .text(function (d) {
          return d.name;
        })
        .style("text-anchor", "middle")
        .style("fill", "#1b1c1d")
        .style("font-family", "Arial")
        .attr("font-weight", "700")
        .style("font-size", "12px");

      simulation.on("tick", () => {
        node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
        label
          .attr("x", function (d) {
            return d.x;
          })
          .attr("y", function (d) {
            return d.y - d.betweenness_centrality * 3000000 - 5;
          });
      });
    },
    [props.nodes.length]
  );

  const drag = (simulation) => {
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.5).restart();
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
  return (
    <svg
      ref={ref}
      style={{
        height: 500,
        width: "100%",
        marginRight: "0px",
        marginLeft: "0px",
      }}
    ></svg>
  );
}

export default GraphPR;
