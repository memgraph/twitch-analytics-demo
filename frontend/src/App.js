import "./App.css";
import "semantic-ui-css/semantic.min.css";
import "semantic-ui-less/semantic.less";
import React from "react";
import HeaderComp from "./components/HeaderComp";
import GamesComp from "./components/GamesComp";
import TeamsComp from "./components/TeamsComp";
import VipsComp from "./components/VipsComp";

function App() {
  return (
    <div>
      <HeaderComp />
      <GamesComp />
      <TeamsComp />
      <VipsComp />
    </div>
  );
}

export default App;
