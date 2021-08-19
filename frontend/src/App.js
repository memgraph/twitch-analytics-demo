import "./App.css";
import "semantic-ui-css/semantic.min.css";
import "semantic-ui-less/semantic.less";
import React from "react";
import HeaderComp from "./components/HeaderComp";
import Games from "./components/Games";
import Teams from "./components/Teams";
import Vips from "./components/Vips";
import Moderators from "./components/Moderators";
import Streamers from "./components/Streamers";
import GraphHeader from "./components/GraphHeader";
import FetchStreamer from "./components/FetchStreamer";

function App() {
  return (
    <div>
      <HeaderComp />
      <Games />
      <Teams />
      <Vips />
      <Moderators />
      <Streamers />
      <GraphHeader />
      <FetchStreamer />
    </div>
  );
}

export default App;
