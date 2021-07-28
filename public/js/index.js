var links;
var nodes;
var simulation;
var svg = d3.select("svg");
const width = svg.attr("width");
const height = svg.attr("height");
var xmlhttp = new XMLHttpRequest();

load_data();

function load_data() {
  document.getElementById("top-games").style.display = "none";
  document.getElementById("top-teams").style.display = "none";
  document.getElementById("top-streamers").style.display = "none";
  document.getElementById("top-vips").style.display = "none";
  document.getElementById("results_table").style.display = "none";
  document.getElementById("top-moderators").style.display = "none";
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

function showGraph() {
  document.getElementById("graph").style.display = "inline";
  document.getElementById("top-games").style.display = "none";
  document.getElementById("top-teams").style.display = "none";
  document.getElementById("top-streamers").style.display = "none";
  document.getElementById("top-vips").style.display = "none";
  document.getElementById("top-moderators").style.display = "none";
  document.getElementById("results_table").style.display = "none";
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

function showTopStreamers() {
  document.getElementById("results_table").style.display = "none";
  document.getElementById("graph").style.display = "none";
  document.getElementById("top-games").style.display = "none";
  document.getElementById("top-teams").style.display = "none";
  document.getElementById("top-streamers").style.display = "inline";
  document.getElementById("top-vips").style.display = "none";
  document.getElementById("top-moderators").style.display = "none";
}

function showTopGames() {
  document.getElementById("results_table").style.display = "none";
  document.getElementById("graph").style.display = "none";
  document.getElementById("top-games").style.display = "inline";
  document.getElementById("top-teams").style.display = "none";
  document.getElementById("top-streamers").style.display = "none";
  document.getElementById("top-vips").style.display = "none";
  document.getElementById("top-moderators").style.display = "none";
}

function showTopTeams() {
  document.getElementById("results_table").style.display = "none";
  document.getElementById("graph").style.display = "none";
  document.getElementById("top-games").style.display = "none";
  document.getElementById("top-teams").style.display = "inline";
  document.getElementById("top-streamers").style.display = "none";
  document.getElementById("top-vips").style.display = "none";
  document.getElementById("top-moderators").style.display = "none";
}

function showTopVips() {
  document.getElementById("results_table").style.display = "none";
  document.getElementById("graph").style.display = "none";
  document.getElementById("top-games").style.display = "none";
  document.getElementById("top-teams").style.display = "none";
  document.getElementById("top-streamers").style.display = "none";
  document.getElementById("top-vips").style.display = "inline";
  document.getElementById("top-moderators").style.display = "none";
}

function showTopModerators() {
  document.getElementById("results_table").style.display = "none";
  document.getElementById("graph").style.display = "none";
  document.getElementById("top-games").style.display = "none";
  document.getElementById("top-teams").style.display = "none";
  document.getElementById("top-streamers").style.display = "none";
  document.getElementById("top-vips").style.display = "none";
  document.getElementById("top-moderators").style.display = "inline";
}
