import { useAuth0 } from "@auth0/auth0-react";
import { render, waitFor } from "@testing-library/react";
import { rest } from "msw";
import { setupServer } from "msw/node";
import React from "react";
import ReactDOM from "react-dom";
import { useHistory } from "react-router-dom";
import { JobsBase } from ".";
import { JobSummary } from "../model/job";

const testShiftId = "hijklmn";

jest.mock("@auth0/auth0-react");
jest.mock("react-router-dom", () => ({
  useLocation: () => ({
    search: `?shiftId=${testShiftId}`,
  }),
  useHistory: jest.fn(),
}));

const testToken = "abcdefg";

const endPoint = "/api/GetJobs";

const server = setupServer(
  rest.get(endPoint, (req, res, ctx) => {
    if (req.headers.get("authorization") === `Bearer ${testToken}`) {
      if (req.url.searchParams.get("shiftId") === testShiftId) {
        return res(
          ctx.json([
            {
              category: 1,
              id: "abcd",
              reflectionFlag: true,
              age: 10,
              gender: "Male",
            },
            {
              category: 2,
              id: "efgh",
              reflectionFlag: true,
              age: 10,
              gender: "Female",
            },
            {
              category: 3,
              id: "ijkl",
              reflectionFlag: false,
            },
          ] as JobSummary[])
        );
      }
      return res(ctx.status(404));
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

  ReactDOM.render(<JobsBase />, div);

  ReactDOM.unmountComponentAtNode(div);
});

it("renders loading correctly", async () => {
  const res = render(<JobsBase />);

  expect(res.asFragment()).toMatchSnapshot();
});

it("renders successful load correctly", async () => {
  const res = render(<JobsBase />);

  await res.findByText("Male");

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

  render(<JobsBase />);

  await waitFor(() => expect(testPush).toBeCalledWith("/"));
});

it("displays an error if the request fails", async () => {
  server.use(rest.get(endPoint, (_, res, ctx) => res(ctx.status(500))));

  const res = render(<JobsBase />);

  await res.findByText("There was a problem speaking to the server.", {
    exact: false,
  });
});
