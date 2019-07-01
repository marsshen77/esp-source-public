import React from "react";
import ReactDOM from "react-dom";
import esp from './components/config';

import EMainWindow from "./components/Layout/EMainWindow";
const config = {
    url:'http://localhost:5000/'
}
esp.init(config);
ReactDOM.render(
    <EMainWindow projectID={'969a2aa0-c3df-449e-b324-375fb28a01fd'}/>,
    document.getElementById("container")
);