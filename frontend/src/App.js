import "./App.css";
import "semantic-ui-css/semantic.min.css";
import "semantic-ui-less/semantic.less";
import React, { Component } from "react";
import HeaderComp from "./components/HeaderComp";
import Games from "./components/Games";
import Teams from "./components/Teams";
import Vips from "./components/Vips";
import Moderators from "./components/Moderators";
import Streamers from "./components/Streamers";
import GraphHeader from "./components/GraphHeader";
import FindStreamer from "./components/FindStreamer";
import FindStreamer2 from "./components/FindStreamer2";
import PageRank from "./components/PageRank";
import BC from "./components/BC";
import scrollToComponent from "react-scroll-to-component";

class App extends Component {
  constructor(props) {
    super(props);
    this.headerComp = React.createRef();
    this.games = React.createRef();
    this.teams = React.createRef();
    this.vips = React.createRef();
    this.moderators = React.createRef();
    this.streamers = React.createRef();
    this.graphHeader = React.createRef();
    this.scrollToAppComponent = this.scrollToAppComponent.bind(this);
  }
  scrollToAppComponent = (compId) => {
    console.log(compId);
    switch (compId) {
      case "Games":
        scrollToComponent(this.games.current, {
          offset: 0,
          align: "middle",
          duration: 500,
          ease: "inCirc",
        });
        break;
      case "Teams":
        scrollToComponent(this.teams.current, {
          offset: 0,
          align: "middle",
          duration: 500,
          ease: "inCirc",
        });
        break;
      case "Vips":
        scrollToComponent(this.vips.current, {
          offset: 0,
          align: "middle",
          duration: 500,
          ease: "inCirc",
        });
        break;
      case "Moderators":
        scrollToComponent(this.moderators.current, {
          offset: 0,
          align: "middle",
          duration: 500,
          ease: "inCirc",
        });
        break;
      case "Streamers":
        scrollToComponent(this.streamers.current, {
          offset: 0,
          align: "top",
          duration: 500,
          ease: "inCirc",
        });
        break;
      case "GraphHeader":
        scrollToComponent(this.graphHeader.current, {
          offset: 0,
          align: "top",
          duration: 500,
          ease: "inCirc",
        });
        break;
      case "HeaderComp":
        console.log("header");
        scrollToComponent(this.headerComp.current, {
          offset: 0,
          align: "top",
          duration: 500,
          ease: "inCirc",
        });
    }
  };

  handleClick = (e) => {
    this.scrollToAppComponent(e.target.id);
  };
  render() {
    return (
      <div>
        <HeaderComp
          ref={this.headerComp}
          scrollTarget={this.scrollToAppComponent}
        />
        <Games ref={this.games} />
        <Teams ref={this.teams} />
        <Vips ref={this.vips} />
        <Moderators ref={this.moderators} />
        <Streamers ref={this.streamers} />
        <GraphHeader ref={this.graphHeader} />
        <FindStreamer />
        <FindStreamer2 />
        <PageRank />
        <BC />
      </div>
    );
  }
}

export default App;
