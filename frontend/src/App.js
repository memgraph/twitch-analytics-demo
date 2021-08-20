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
import FindStreamer from "./components/FindStreamer";
import FindStreamer2 from "./components/FindStreamer2";

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
      <FindStreamer />
      <FindStreamer2 />
    </div>
  );
}

export default App;
