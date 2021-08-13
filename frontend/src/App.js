import "./App.css";
import "semantic-ui-css/semantic.min.css";
import "semantic-ui-less/semantic.less";
import React from "react";
import HeaderComp from "./components/HeaderComp";
import GamesComp from "./components/GamesComp";

function App() {
  return (
    <div>
      <HeaderComp></HeaderComp>
      <GamesComp></GamesComp>
    </div>
  );
}

export default App;
