import { useAuth0 } from "@auth0/auth0-react";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { rest } from "msw";
import { setupServer } from "msw/node";
import React from "react";
import ReactDOM from "react-dom";
import { useHistory } from "react-router-dom";
import { AddJobBase } from ".";
import { NewJob } from "../model/job";

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
  useLocation: () => ({
    search: `?shift=${testUpdate.shift}`,
  }),
}));

const testToken = "abcdefg";

const endPoint = "/api/LogJob";

const server = setupServer(
  rest.post(endPoint, (req, res, ctx) => {
    if (req.headers.get("authorization") === `Bearer ${testToken}`) {
      const update = JSON.parse(req.body?.toString() ?? "") as NewJob;

      expect(update).toEqual(testUpdate);

      return res(ctx.status(200));
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

  ReactDOM.render(<AddJobBase />, div);

  ReactDOM.unmountComponentAtNode(div);
});

it("renders correctly", async () => {
  const res = render(<AddJobBase />);

  expect(res.asFragment()).toMatchSnapshot();
});

it("prevents input of invalid ages", async () => {
  const res = render(<AddJobBase />);

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

  const res = render(<AddJobBase />);

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

  const res = render(<AddJobBase />);

  server.use(rest.post(endPoint, (_, rs, ctx) => rs(ctx.status(500))));

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
