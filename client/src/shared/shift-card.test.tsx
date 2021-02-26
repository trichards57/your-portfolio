import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import ShiftCard from "./shift-card";
import { ShiftSummary } from "../model/shift";
import renderer from "react-test-renderer";

const defaultShift: ShiftSummary = {
  date: "2021-10-01",
  duration: 5,
  event: "SWASFT Shift",
  id: "abcdef",
  loggedCalls: 5,
  role: "EAC",
  crewMate: "Test Crewmate",
  location: "Test Location",
};

it("renders without crashing", () => {
  const div = document.createElement("div");

  ReactDOM.render(
    <Router>
      <ShiftCard shift={defaultShift} />
    </Router>,
    div
  );

  ReactDOM.unmountComponentAtNode(div);
});

it("renders correctly", () => {
  const tree = renderer
    .create(
      <Router>
        <ShiftCard shift={defaultShift} />
      </Router>
    )
    .toJSON();

  expect(tree).toMatchSnapshot();
});
