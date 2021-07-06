import React, { forwardRef as mockForwardRef } from "react";
import { fireEvent, render, waitFor } from "@testing-library/react";
import ReactDOM from "react-dom";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { useAuth0 } from "@auth0/auth0-react";
import { useHistory } from "react-router-dom";
import { HomeBase } from ".";

jest.mock("@auth0/auth0-react");
jest.mock("react-router-dom", () => ({
  Link: mockForwardRef((p: any, ref) => <div ref={ref} {...p} />),
  useHistory: jest.fn(),
}));

const testToken = "abcdefg";

const recentEndPoint = "/api/RecentShifts";
const allEndPoint = "/api/GetAllShifts";

const testRecentData = [
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
];

const testAllData = Array.from(Array(20).keys()).map((i) => ({
  date: `2020-01-${(i + 1).toString().padStart(2, "0")}`,
  duration: i / 2,
  event: `Test Shift ${i}`,
  id: `abcd${i.toString().padStart(2, "0")}`,
  loggedCalls: i % 5,
  role: "EAC",
  crewMate: `Test Crewmate ${i}`,
  location: `Test Location ${i}`,
}));

const server = setupServer(
  rest.get(recentEndPoint, (req, res, ctx) => {
    if (req.headers.get("authorization") === `Bearer ${testToken}`) {
      return res(ctx.json(testRecentData));
    }

    return res(ctx.status(401));
  }),
  rest.get(allEndPoint, (req, res, ctx) => {
    if (req.headers.get("authorization") === `Bearer ${testToken}`) {
      const pageString = req.url.searchParams.get("page");
      const countString = req.url.searchParams.get("count");

      if (!pageString || !countString) return res(ctx.status(400));

      const page = parseInt(pageString, 10);
      const count = parseInt(countString, 10);

      const data = testAllData.slice(page * count, (page + 1) * count);

      return res(
        ctx.set("x-total-count", testAllData.length.toString()),
        ctx.json(data)
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

  ReactDOM.render(<HomeBase />, div);

  ReactDOM.unmountComponentAtNode(div);
});

it("renders all without crashing", () => {
  const div = document.createElement("div");

  ReactDOM.render(<HomeBase all />, div);

  ReactDOM.unmountComponentAtNode(div);
});

it("renders loading correctly", () => {
  const res = render(<HomeBase />);

  expect(res.asFragment()).toMatchSnapshot();
});

it("renders loading all correctly", () => {
  const res = render(<HomeBase all />);

  expect(res.asFragment()).toMatchSnapshot();
});

it("renders successful load correctly", async () => {
  const res = render(<HomeBase />);

  await res.findByText("Test Shift 1");

  expect(res.asFragment()).toMatchSnapshot();
});

it("renders successful load all correctly", async () => {
  const res = render(<HomeBase all />);

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

  render(<HomeBase />);

  await waitFor(() => expect(testPush).toBeCalledWith("/"));
});

it("redirects to the home page if all not authorised", async () => {
  (useAuth0 as jest.Mock).mockReturnValue({
    getAccessTokenSilently: jest
      .fn()
      .mockReturnValue(Promise.resolve("BadToken")),
  });

  const testPush = jest.fn();

  (useHistory as jest.Mock).mockReturnValue({
    push: testPush,
  });

  render(<HomeBase all />);

  await waitFor(() => expect(testPush).toBeCalledWith("/"));
});

it("displays an error if the request fails", async () => {
  server.use(rest.get(recentEndPoint, (_, res, ctx) => res(ctx.status(500))));

  const res = render(<HomeBase />);

  await res.findByText("There was a problem speaking to the server.", {
    exact: false,
  });
});

it("displays an error if request alls fails", async () => {
  server.use(rest.get(recentEndPoint, (_, res, ctx) => res(ctx.status(500))));

  const res = render(<HomeBase />);

  await res.findByText("There was a problem speaking to the server.", {
    exact: false,
  });
});

it("loads a new page if pagination clicked", async () => {
  const res = render(<HomeBase all />);

  await res.findByText("Test Shift 1");

  fireEvent.click(
    res.getByRole("button", {
      name: "Go to next page",
    })
  );

  await res.findByText("Test Shift 7");

  expect(res.asFragment()).toMatchSnapshot();
});

it("loads all if switches", async () => {
  const res = render(<HomeBase />);

  await res.findByText("Test Shift 1");

  res.rerender(<HomeBase all />);

  await res.findByText("Test Shift 1");

  expect(res.asFragment()).toMatchSnapshot();
});
