import { setupServer } from "msw/node";
import { rest } from "msw";
import { forwardRef as mockForwardRef } from "react";
import { Home } from ".";
import ReactDOM from "react-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { render, waitFor } from "@testing-library/react";
import { useHistory } from "react-router-dom";

jest.mock("@auth0/auth0-react");
jest.mock("react-router-dom", () => ({
  Link: mockForwardRef((p: any, ref) => <div ref={ref} {...p}></div>),
  useHistory: jest.fn(),
}));

const testToken = "abcdefg";

const endPoint = "/api/RecentShifts";

const server = setupServer(
  rest.get(endPoint, (req, res, ctx) => {
    if (req.headers.get("authorization") === `Bearer ${testToken}`) {
      return res(
        ctx.json([
          {
            date: "2020-01-01",
            duration: 3,
            event: "Test Shift 1",
            id: "abcdef",
            loggedCalls: 4,
            role: "EAC",
            crewMate: "Test Crewmate 1",
            location: "Test Location 1",
          },
          {
            date: "2020-02-02",
            duration: 5,
            event: "Test Shift 2",
            id: "abcfef",
            loggedCalls: 4,
            role: "AFA",
            location: "Test Location 2",
          },
          {
            date: "2020-01-03",
            duration: 8,
            event: "Test Shift 3",
            id: "abcgef",
            loggedCalls: 4,
            role: "CRU",
            crewMate: "Test Crewmate 3",
          },
        ])
      );
    }

    return res(ctx.status(401));
  })
);

beforeAll(() => server.listen());

beforeEach(() =>
  (useAuth0 as jest.Mock).mockReturnValue({
    getAccessTokenSilently: jest
      .fn()
      .mockReturnValue(Promise.resolve(testToken)),
  })
);

afterEach(() => server.resetHandlers());

afterAll(() => server.close());

it("renders without crashing", () => {
  const div = document.createElement("div");

  ReactDOM.render(<Home />, div);

  ReactDOM.unmountComponentAtNode(div);
});

it("renders loading correctly", async () => {
  const res = render(<Home />);

  expect(res.asFragment()).toMatchSnapshot();
});

it("renders successful load correctly", async () => {
  const res = render(<Home />);

  await res.findByText("Test Shift 1");

  expect(res.asFragment()).toMatchSnapshot();
});

it("redirects to the home page if not authorised", async () => {
  (useAuth0 as jest.Mock).mockReturnValue({
    getAccessTokenSilently: jest
      .fn()
      .mockReturnValue(Promise.resolve("BadToken")),
  });

  const testPush = jest.fn();

  (useHistory as jest.Mock).mockReturnValue({
    push: testPush,
  });

  render(<Home />);

  await waitFor(() => expect(testPush).toBeCalledWith("/"));
});

it("displays an error if the request fails", async () => {
  server.use(
    rest.get(endPoint, (_, res, ctx) => {
      return res(ctx.status(500));
    })
  );

  const res = render(<Home />);

  await res.findByText("There was a problem speaking to the server.", {
    exact: false,
  });
});
