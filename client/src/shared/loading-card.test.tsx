import React from "react";
import ReactDOM from "react-dom";
import renderer from "react-test-renderer";
import LoadingCard from "./loading-card";

it("renders without crashing", () => {
  const div = document.createElement("div");

  ReactDOM.render(<LoadingCard />, div);

  ReactDOM.unmountComponentAtNode(div);
});

it("renders correctly", () => {
  const tree = renderer.create(<LoadingCard />).toJSON();

  expect(tree).toMatchSnapshot();
});
