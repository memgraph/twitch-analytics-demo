import "./App.css";
import "semantic-ui-css/semantic.min.css";
import "semantic-ui-less/semantic.less";
import React from "react";
import HeaderComp from "./components/HeaderComp";
import GamesComp from "./components/GamesComp";
import TeamsComp from "./components/TeamsComp";
import VipsComp from "./components/VipsComp";
import ModeratorsComp from "./components/ModeratorsComp";
import StreamersComp from "./components/StreamersComp";
import GraphHeader from "./components/GraphHeader";
import SvgComp from "./components/SvgComp";

function App() {
  return (
    <div>
      <HeaderComp />
      <GamesComp />
      <TeamsComp />
      <VipsComp />
      <ModeratorsComp />
      <StreamersComp />
      <GraphHeader />
      <SvgComp />
    </div>
  );
}

export default App;
