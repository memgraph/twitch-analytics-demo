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
import { Tab } from "semantic-ui-react";

class App extends Component {
  constructor(props) {
    super(props);
    this.headerComp = React.createRef();
    this.graphHeader = React.createRef();
    this.generalStats = React.createRef();
    this.scrollToAppComponent = this.scrollToAppComponent.bind(this);
    this.state = {
      color: "orange",
    };
  }

  handleColorChange = (e) => this.setState({ color: e.target.value });
  scrollToAppComponent = (compId) => {
    switch (compId) {
      case "GeneralStats":
        scrollToComponent(this.generalStats.current, {
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
        break;
      default:
      // do nothing
    }
  };

  handleClick = (e) => {
    this.scrollToAppComponent(e.target.id);
  };
  render() {
    const { color } = this.state;
    const panesStats = [
      {
        menuItem: { key: "games", icon: "game", content: "Games" },
        render: () => (
          <Tab.Pane>
            <Games />
          </Tab.Pane>
        ),
      },
      {
        menuItem: { key: "teams", icon: "users", content: "Teams" },
        render: () => (
          <Tab.Pane>
            <Teams />
          </Tab.Pane>
        ),
      },
      {
        menuItem: { key: "vips", icon: "star", content: "Vips" },
        render: () => (
          <Tab.Pane>
            <Vips />
          </Tab.Pane>
        ),
      },
      {
        menuItem: { key: "moderators", icon: "trophy", content: "Moderators" },
        render: () => (
          <Tab.Pane>
            <Moderators />
          </Tab.Pane>
        ),
      },
      {
        menuItem: {
          key: "streamers",
          icon: "user",
          content: "Streamers",
        },
        render: () => (
          <Tab.Pane>
            <Streamers />
          </Tab.Pane>
        ),
      },
    ];

    return (
      <div>
        <HeaderComp
          ref={this.headerComp}
          scrollTarget={this.scrollToAppComponent}
        />
        <Tab
          ref={this.generalStats}
          panes={panesStats}
          menu={{ color, inverted: true, attached: false, tabular: false }}
        />
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
