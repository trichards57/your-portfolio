import { useAuth0 } from "@auth0/auth0-react";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { rest } from "msw";
import { setupServer } from "msw/node";
import React from "react";
import ReactDOM from "react-dom";
import { useHistory } from "react-router-dom";
import { EditJobBase } from ".";
import { NewJob } from "../model/job";

const testId = "abcd";

const testData: NewJob & { id: string } = {
  id: testId,
  blueLights: false,
  category: 2,
  drove: false,
  notes: "Old Notes",
  outcome: "NotFound",
  reflectionFlag: false,
  shift: "abcdef",
  age: 12,
  gender: "Male",
};

const testUpdate: NewJob = {
  blueLights: true,
  category: 3,
  drove: true,
  notes: "Test Notes",
  outcome: "DischargedOnScene",
  reflectionFlag: true,
  shift: "abcdef",
  age: 23,
  gender: "Female",
};

jest.mock("@auth0/auth0-react");
jest.mock("react-router-dom", () => ({
  useHistory: jest.fn(),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  useParams<T>() {
    return { id: testId };
  },
}));

const testToken = "abcdefg";

const getEndPoint = "/api/GetJob";
const updateEndPoint = "/api/UpdateJob";

const server = setupServer(
  rest.get(getEndPoint, (req, res, ctx) => {
    if (req.headers.get("authorization") === `Bearer ${testToken}`) {
      if (req.url.searchParams.get("id") === testId) {
        return res(ctx.json(testData));
      }
      return res(ctx.status(404));
    }
    return res(ctx.status(401));
  }),
  rest.post(updateEndPoint, (req, res, ctx) => {
    if (req.headers.get("authorization") === `Bearer ${testToken}`) {
      const { id, ...update } = JSON.parse(req.body?.toString() ?? "") as {
        id: string;
      } & NewJob;

      if (id === testId) {
        expect(update).toEqual(testUpdate);

        return res(ctx.status(200));
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

  ReactDOM.render(<EditJobBase />, div);

  ReactDOM.unmountComponentAtNode(div);
});

it("renders loading correctly", async () => {
  const res = render(<EditJobBase />);

  expect(res.asFragment()).toMatchSnapshot();
});

it("renders successful load correctly", async () => {
  const res = render(<EditJobBase />);

  await res.findByDisplayValue(testData.notes);

  expect(res.asFragment()).toMatchSnapshot();
});

it("redirects to the login page if not authorised", async () => {
  (useAuth0 as jest.Mock).mockReturnValue({
    getAccessTokenSilently: jest
      .fn()
      .mockReturnValue(Promise.resolve("BadToken")),
  });

  const testPush = jest.fn();

  (useHistory as jest.Mock).mockReturnValue({
    push: testPush,
  });

  render(<EditJobBase />);

  await waitFor(() => expect(testPush).toBeCalledWith("/"));
});

it("redirects to the home page if not found", async () => {
  const testPush = jest.fn();

  (useHistory as jest.Mock).mockReturnValue({
    push: testPush,
  });

  server.use(
    rest.get(getEndPoint, (req, res, ctx) => {
      if (req.headers.get("authorization") === `Bearer ${testToken}`) {
        return res(ctx.status(404));
      }
      return res(ctx.status(401));
    })
  );

  render(<EditJobBase />);

  await waitFor(() => expect(testPush).toBeCalledWith("/home"));
});

it("displays an error if the request fails", async () => {
  server.use(rest.get(getEndPoint, (_, res, ctx) => res(ctx.status(500))));

  const res = render(<EditJobBase />);

  await res.findByText("There was a problem speaking to the server.", {
    exact: false,
  });

  expect(res.asFragment()).toMatchSnapshot();
});

it("prevents input of invalid ages", async () => {
  const res = render(<EditJobBase />);

  await res.findByDisplayValue(testData.notes);

  const box = res.getByRole("spinbutton", {
    name: "Age",
  });

  fireEvent.change(box, {
    target: { value: "-1" },
  });

  expect(box).toHaveValue(null);
});

it("submits data to the server when save is clicked", async () => {
  const testPush = jest.fn();

  (useHistory as jest.Mock).mockReturnValue({
    push: testPush,
  });

  const res = render(<EditJobBase />);

  await res.findByDisplayValue(testData.notes);

  fireEvent.change(res.getByRole("spinbutton", { name: "Age" }), {
    target: { value: testUpdate.age?.toString() },
  });
  fireEvent.change(res.getByRole("combobox", { name: "Gender" }), {
    target: { value: testUpdate.gender },
  });
  fireEvent.change(res.getByRole("combobox", { name: "Category" }), {
    target: { value: testUpdate.category },
  });
  fireEvent.click(res.getByRole("checkbox", { name: "Drove to Patient" }));
  fireEvent.click(res.getByRole("checkbox", { name: "Used Blue Lights" }));
  fireEvent.change(res.getByRole("textbox", { name: "Notes" }), {
    target: { value: testUpdate.notes },
  });
  fireEvent.change(res.getByRole("combobox", { name: "Outcome" }), {
    target: { value: testUpdate.outcome },
  });
  fireEvent.click(res.getByRole("checkbox", { name: "Mark for Reflection" }));

  const saveButton = res.getByRole("button", { name: "Save" });

  fireEvent.click(saveButton);

  expect(saveButton).toBeDisabled();
  await waitFor(() => expect(testPush).toBeCalledWith("/home"));
  expect(saveButton).toBeEnabled();
});

it("displays alert when save fails", async () => {
  const testPush = jest.fn();

  (useHistory as jest.Mock).mockReturnValue({
    push: testPush,
  });

  const res = render(<EditJobBase />);

  await res.findByDisplayValue(testData.notes);

  server.use(rest.post(updateEndPoint, (_, rs, ctx) => rs(ctx.status(500))));

  fireEvent.change(res.getByRole("spinbutton", { name: "Age" }), {
    target: { value: testUpdate.age?.toString() },
  });
  fireEvent.change(res.getByRole("combobox", { name: "Gender" }), {
    target: { value: testUpdate.gender },
  });
  fireEvent.change(res.getByRole("combobox", { name: "Category" }), {
    target: { value: testUpdate.category },
  });
  fireEvent.click(res.getByRole("checkbox", { name: "Drove to Patient" }));
  fireEvent.click(res.getByRole("checkbox", { name: "Used Blue Lights" }));
  fireEvent.change(res.getByRole("textbox", { name: "Notes" }), {
    target: { value: testUpdate.notes },
  });
  fireEvent.change(res.getByRole("combobox", { name: "Outcome" }), {
    target: { value: testUpdate.outcome },
  });
  fireEvent.click(res.getByRole("checkbox", { name: "Mark for Reflection" }));

  const saveButton = res.getByRole("button", { name: "Save" });

  fireEvent.click(saveButton);

  expect(saveButton).toBeDisabled();
  await waitFor(() => res.getByRole("alert"));

  const alert = res.getByRole("alert");
  expect(alert).toHaveTextContent("problem speaking to the server");

  expect(testPush).not.toBeCalled();

  expect(saveButton).toBeEnabled();
});
