import React from "react";
import ReactDOM from "react-dom";
import LoadingCard from "./loading-card";
import renderer from "react-test-renderer";

it("renders without crashing", () => {
  const div = document.createElement("div");

  ReactDOM.render(<LoadingCard />, div);

  ReactDOM.unmountComponentAtNode(div);
});

it("renders correctly", () => {
  const tree = renderer.create(<LoadingCard />).toJSON();

  expect(tree).toMatchSnapshot();
});
