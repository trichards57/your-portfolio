import ReactDOM from "react-dom";
import Landing from ".";
import renderer from "react-test-renderer";
import { useAuth0 } from "@auth0/auth0-react";
import { ServerAudience } from "../shared/constants";
import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("@auth0/auth0-react");

it("renders without crashing", () => {
  const div = document.createElement("div");

  (useAuth0 as jest.Mock).mockReturnValue({
    loginWithRedirect: jest.fn(),
  });

  ReactDOM.render(<Landing />, div);

  ReactDOM.unmountComponentAtNode(div);
});

it("renders correctly", () => {
  (useAuth0 as jest.Mock).mockReturnValue({
    loginWithRedirect: jest.fn(),
  });

  const tree = renderer.create(<Landing />).toJSON();

  expect(tree).toMatchSnapshot();
});

it("calls auth0 when login clicked", () => {
  const mockAuth = {
    loginWithRedirect: jest.fn(),
  };
  (useAuth0 as jest.Mock).mockReturnValue(mockAuth);

  render(<Landing />);

  fireEvent.click(screen.getByText("Login"));

  expect(mockAuth.loginWithRedirect).toBeCalledWith({
    audience: ServerAudience,
  });
});

it("calls auth0 when register is clicked and prompts auth0 to register", () => {
  const mockAuth = {
    loginWithRedirect: jest.fn(),
  };
  (useAuth0 as jest.Mock).mockReturnValue(mockAuth);

  render(<Landing />);

  fireEvent.click(screen.getByText("Register"));

  expect(mockAuth.loginWithRedirect).toBeCalledWith({
    audience: ServerAudience,
    screen_hint: "signup",
  });
});
