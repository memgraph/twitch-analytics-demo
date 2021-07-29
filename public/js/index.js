var links;
var nodes;
var simulation;
var svg = d3.select("svg");
const width = svg.attr("width");
const height = svg.attr("height");
var xmlhttp = new XMLHttpRequest();
//Get the button
var mybutton = document.getElementById("myBtn");

// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function () {
  scrollFunction();
};

load_data();

function load_data() {
  showSection("about-section");
  xmlhttp.open("GET", "/load-data", true);
  xmlhttp.setRequestHeader("Content-type", "application/json; charset=utf-8");

  xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState == 4 && xmlhttp.status == "200") {
      get_graph();
      console.log("LOAD DATA SUCCESS!");
    }
  };
  xmlhttp.send();
}

function populate_result_table(
  first_column_data,
  second_column_data,
  first_column_text,
  second_column_text
) {
  var table = document.getElementById("results_table");
  var first_column = document.getElementById("first_column");
  var second_column = document.getElementById("second_column");
  first_column.innerHTML = first_column_text;
  second_column.innerHTML = second_column_text;
  var tbody = document.getElementById("streamers_body");
  tbody.innerHTML = "";
  var second_column_name = second_column_text.toLowerCase();

  for (var i = 0; i < first_column_data.length; i++) {
    var tr = document.createElement("tr");
    var th = document.createElement("th");
    var att_scope = document.createAttribute("scope");
    att_scope.value = "row";
    var td_streamer = document.createElement("td");
    var td_views = document.createElement("td");
    var text_1 = document.createTextNode(String(first_column_data[i]["name"]));
    var text_2 = document.createTextNode(
      String(second_column_data[i][second_column_name])
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
      populate_result_table(streamers, views, "Streamers", "Views");
      document.getElementById("results_table").style.display = "inline";
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
      populate_result_table(streamers, followers, "Streamers", "Followers");
      document.getElementById("results_table").style.display = "inline";
    }
  };
  xmlhttp.send();
}

function get_top_games() {
  var num_of_games = document.getElementById("num_of_games").value;
  xmlhttp.open("GET", "/get-top-games/" + num_of_games, true);
  xmlhttp.setRequestHeader("Content-type", "application/json; charset=utf-8");
  xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState == 4 && xmlhttp.status == "200") {
      console.log("TOP GAMES SUCCESS!");
      data = JSON.parse(xmlhttp.responseText);
      games = data.games;
      players = data.players;
      console.log(games);
      console.log(players);
      populate_result_table(games, players, "Games", "Players");
      document.getElementById("results_table").style.display = "inline";
    }
  };
  xmlhttp.send();
}

function get_top_teams() {
  var num_of_teams = document.getElementById("num_of_teams").value;
  xmlhttp.open("GET", "/get-top-teams/" + num_of_teams, true);
  xmlhttp.setRequestHeader("Content-type", "application/json; charset=utf-8");
  xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState == 4 && xmlhttp.status == "200") {
      console.log("TOP TEAMS SUCCESS!");
      data = JSON.parse(xmlhttp.responseText);
      teams = data.teams;
      members = data.members;
      console.log(teams);
      console.log(members);
      populate_result_table(teams, members, "Teams", "Members");
      document.getElementById("results_table").style.display = "inline";
    }
  };
  xmlhttp.send();
}

function get_top_vips() {
  var num_of_vips = document.getElementById("num_of_vips").value;
  xmlhttp.open("GET", "/get-top-vips/" + num_of_vips, true);
  xmlhttp.setRequestHeader("Content-type", "application/json; charset=utf-8");
  xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState == 4 && xmlhttp.status == "200") {
      console.log("TOP VIPS SUCCESS!");
      data = JSON.parse(xmlhttp.responseText);
      vips = data.vips;
      streamers = data.streamers;
      console.log(vips);
      console.log(streamers);
      populate_result_table(vips, streamers, "Vips", "Streamers");
      document.getElementById("results_table").style.display = "inline";
    }
  };
  xmlhttp.send();
}

function get_top_moderators() {
  var num_of_moderators = document.getElementById("num_of_moderators").value;
  xmlhttp.open("GET", "/get-top-moderators/" + num_of_moderators, true);
  xmlhttp.setRequestHeader("Content-type", "application/json; charset=utf-8");
  xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState == 4 && xmlhttp.status == "200") {
      console.log("TOP MODERATORS SUCCESS!");
      data = JSON.parse(xmlhttp.responseText);
      moderators = data.moderators;
      streamers = data.streamers;
      console.log(moderators);
      console.log(streamers);
      populate_result_table(moderators, streamers, "Moderators", "Streamers");
      document.getElementById("results_table").style.display = "inline";
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
          d3
            .forceLink(links)
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
        .attr("r", 10)
        .attr("class", "node")
        .attr("fill", function (d) {
          return d.label === "Team" ? "red" : "orange";
        })
        .call(drag(simulation));

      var label = svg
        .selectAll(null)
        .data(nodes)
        .enter()
        .append("text")
        .text(function (d) {
          return d.name; //return d.label for label
        })
        .style("text-anchor", "middle")
        .style("fill", "#555")
        .style("font-family", "Arial")
        .style("font-size", "12px");

      /* node.append("text").text(function (d) {
        console.log(d.name);
        return d.name;
      });*/

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
            return d.y - 10;
          });
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

function dropDownMenu() {
  document.getElementById("myDropdown").classList.toggle("show");
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function (event) {
  if (!event.target.matches(".dropdown-toggle")) {
    var dropdowns = document.getElementsByClassName("dropdown-menu");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains("show")) {
        openDropdown.classList.remove("show");
      }
    }
  }
};

function showSection(section) {
  var sections = [
    "results_table",
    "graph",
    "top-games",
    "top-teams",
    "top-streamers",
    "top-vips",
    "top-moderators",
    "about-section",
  ];
  var filtered = sections.filter(function (value, index, arr) {
    return value !== section;
  });
  for (var i = 0; i < filtered.length; i++)
    document.getElementById(filtered[i]).style.display = "none";
  document.getElementById(section).style.display = "inline";
}

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    mybutton.style.display = "block";
  } else {
    mybutton.style.display = "none";
  }
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}

function responsivefy(svg) {
  // get container + svg aspect ratio
  var container = d3.select(svg.node().parentNode),
    width = parseInt(svg.style("width")),
    height = parseInt(svg.style("height")),
    aspect = width / height;

  // add viewBox and preserveAspectRatio properties,
  // and call resize so that svg resizes on inital page load
  svg
    .attr("viewBox", "0 0 " + width + " " + height)
    .attr("perserveAspectRatio", "xMinYMid")
    .call(resize);

  // to register multiple listeners for same event type,
  // you need to add namespace, i.e., 'click.foo'
  // necessary if you call invoke this function for multiple svgs
  // api docs: https://github.com/mbostock/d3/wiki/Selections#on
  d3.select(window).on("resize." + container.attr("id"), resize);

  // get width of container and resize svg to fit it
  function resize() {
    var targetWidth = parseInt(container.style("width"));
    svg.attr("width", targetWidth);
    svg.attr("height", Math.round(targetWidth / aspect));
  }
}
