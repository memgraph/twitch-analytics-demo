var links;
var nodes;
var simulation;
var svg = d3.select("svg");
const width = svg.attr("width");
const height = svg.attr("height");
var xmlhttp = new XMLHttpRequest();

load_data();

function load_data() {
  xmlhttp.open("GET", "/load-data", true);
  xmlhttp.setRequestHeader("Content-type", "application/json; charset=utf-8");

  xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState == 4 && xmlhttp.status == "200") {
      //get_graph();
      console.log("LOAD DATA SUCCESS!");
    }
  };
  xmlhttp.send();
}

function populate_result_table(streamers, numbers, html_text) {
  var table = document.getElementById("top_streamers");
  var table_column = document.getElementById("followers/views");
  table_column.innerHTML = html_text;
  var tbody = document.getElementById("streamers_body");
  tbody.innerHTML = "";
  var views_or_followers = html_text.toLowerCase();

  for (var i = 0; i < streamers.length; i++) {
    var tr = document.createElement("tr");
    var th = document.createElement("th");
    var att_scope = document.createAttribute("scope");
    att_scope.value = "row";
    var td_streamer = document.createElement("td");
    var td_views = document.createElement("td");
    var text_1 = document.createTextNode(String(streamers[i]["name"]));
    var text_2 = document.createTextNode(
      String(numbers[i][views_or_followers])
    );
    td_streamer.appendChild(text_1);
    td_views.appendChild(text_2);
    th.setAttributeNode(att_scope);
    var text_3 = document.createTextNode(String(i + 1));
    th.appendChild(text_3);
    tr.appendChild(th);
    tr.appendChild(td_streamer);
    tr.appendChild(td_views);
    tbody.appendChild(tr);
    table.appendChild(tbody);
  }
  var tr = document.createElement("tr");
}

function get_top_streamers_by_views() {
  var num_of_streamers = document.getElementById("num_of_streamers").value;
  xmlhttp.open("GET", "/get-top-streamers-by-views/" + num_of_streamers, true);
  xmlhttp.setRequestHeader("Content-type", "application/json; charset=utf-8");
  xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState == 4 && xmlhttp.status == "200") {
      console.log("TOP STREAMERS BY VIEWS SUCCESS!");
      data = JSON.parse(xmlhttp.responseText);
      streamers = data.streamers;
      views = data.views;
      console.log(streamers);
      console.log(views);
      populate_result_table(streamers, views, "Views");
    }
  };
  xmlhttp.send();
}

function get_top_streamers_by_followers() {
  var num_of_streamers = document.getElementById("num_of_streamers").value;
  xmlhttp.open(
    "GET",
    "/get-top-streamers-by-followers/" + num_of_streamers,
    true
  );
  xmlhttp.setRequestHeader("Content-type", "application/json; charset=utf-8");
  xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState == 4 && xmlhttp.status == "200") {
      console.log("TOP STREAMERS BY FOLLOWERS SUCCESS!");
      data = JSON.parse(xmlhttp.responseText);
      streamers = data.streamers;
      followers = data.followers;
      console.log(streamers);
      console.log(followers);
      populate_result_table(streamers, followers, "Followers");
    }
  };
  xmlhttp.send();
}

function get_graph() {
  xmlhttp.open("GET", "/get-graph", true);
  xmlhttp.setRequestHeader("Content-type", "application/json; charset=utf-8");

  xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState == 4 && xmlhttp.status == "200") {
      data = JSON.parse(xmlhttp.responseText);
      links = data.links;
      nodes = data.nodes;

      const simulation = d3
        .forceSimulation(nodes)
        .force(
          "link",
          d3.forceLink(links).id((d) => d.id)
        )
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(width / 2, height / 2));

      const link = svg
        .append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke-width", 1);

      const node = svg
        .append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", 5)
        .attr("fill", function (d) {
          return d.label === "Team" ? "red" : "orange";
        })
        .call(drag(simulation));

      simulation.on("tick", () => {
        link
          .attr("x1", (d) => d.source.x)
          .attr("y1", (d) => d.source.y)
          .attr("x2", (d) => d.target.x)
          .attr("y2", (d) => d.target.y);

        node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
      });
    }
  };
  xmlhttp.send();
}

drag = (simulation) => {
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
