import React from "react";
import ReactDOM from "react-dom";
import esp from './components/config';
import EMainWindow from "./components/Layout/EMainWindow";
import EChartFactory from './components/Content/EMC/EChartsFactory';
import EChartSourceCreator from './components/Content/EMC/EChartSourceCreator';
import EChartOptionCreator from './components/Content/EMC/EChartOptionCreator';
import Enumerable from 'linq';
import './components/Base/JQuery/jquery.extensions';

const config = {
    url:'http://172.16.9.121:8111/UIService/'
}
esp.init(config);

window.EChartFactory = EChartFactory;
window.EChartSourceCreator = EChartSourceCreator;
window.EChartOptionCreator = EChartOptionCreator;
window.Enumerable = Enumerable;
ReactDOM.render(
    <EMainWindow projectID={'969a2aa0-c3df-449e-b324-375fb28a01fd'}/>,
    document.getElementById("container")
);