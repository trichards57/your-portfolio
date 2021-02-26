import { fireEvent, render, waitFor } from "@testing-library/react";
import React from "react";
import ReactDOM from "react-dom";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { useAuth0 } from "@auth0/auth0-react";
import { useHistory } from "react-router-dom";
import { NewShift } from "../model/shift";
import { AddShiftBase } from ".";

jest.mock("@auth0/auth0-react");
jest.mock("react-router-dom", () => ({
  useHistory: jest.fn(),
}));
const testToken = "abcdefg";

const endPoint = "/api/LogShift";

const testUpdate: NewShift = {
  date: "2021-01-02",
  duration: 6.5,
  event: "SWASFT Shift",
  role: "CRU",
  crewMate: "New Crew Mate",
  location: "New Location",
};

const server = setupServer(
  rest.post(endPoint, (req, res, ctx) => {
    if (req.headers.get("authorization") === `Bearer ${testToken}`) {
      const update = JSON.parse(req.body?.toString() ?? "") as NewShift;

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

  ReactDOM.render(<AddShiftBase />, div);

  ReactDOM.unmountComponentAtNode(div);
});

it("renders correctly", async () => {
  const res = render(<AddShiftBase />);

  expect(res.asFragment()).toMatchSnapshot();
});

it("displays an invalid date properly", async () => {
  const res = render(<AddShiftBase />);

  const box = res.getByLabelText("Date", {
    exact: false,
  });

  fireEvent.change(box, {
    target: { value: "" },
  });

  const alertId = box.getAttribute("aria-describedby");
  expect(box).toBeInvalid();

  expect(res.container.querySelector(`#${alertId}`)).toHaveTextContent(
    "You need to enter a date"
  );
  expect(res.getByRole("button", { name: "Save" })).toBeDisabled();
});

it("displays an invalid duration properly", async () => {
  const res = render(<AddShiftBase />);

  const box = res.getByRole("spinbutton", {
    name: "Hours",
  });

  fireEvent.change(box, {
    target: { value: "" },
  });

  const alertId = box.getAttribute("aria-describedby");
  expect(box).toBeInvalid();

  expect(res.container.querySelector(`#${alertId}`)).toHaveTextContent(
    "You need to enter a shift length"
  );
  expect(res.getByRole("button", { name: "Save" })).toBeDisabled();
});

it("displays an invalid event name properly", async () => {
  const res = render(<AddShiftBase />);

  const box = res.getByRole("textbox", {
    name: "Event",
  });

  fireEvent.change(box, {
    target: { value: "a" },
  });

  fireEvent.change(box, {
    target: { value: "" },
  });

  const alertId = box.getAttribute("aria-describedby");
  expect(box).toBeInvalid();

  expect(res.container.querySelector(`#${alertId}`)).toHaveTextContent(
    "You need to name this shift"
  );
  expect(res.getByRole("button", { name: "Save" })).toBeDisabled();
});

it("submits data to the server when save is clicked", async () => {
  const testPush = jest.fn();

  (useHistory as jest.Mock).mockReturnValue({
    push: testPush,
  });

  const res = render(<AddShiftBase />);

  fireEvent.change(res.getByLabelText("Date", { exact: false }), {
    target: { value: testUpdate.date },
  });
  fireEvent.change(res.getByRole("spinbutton", { name: "Hours" }), {
    target: { value: testUpdate.duration.toString() },
  });
  fireEvent.change(res.getByRole("textbox", { name: "Event" }), {
    target: { value: testUpdate.event },
  });
  fireEvent.change(res.getByRole("textbox", { name: "Location" }), {
    target: { value: testUpdate.location },
  });
  fireEvent.change(res.getByLabelText("Role", { exact: false }), {
    target: { value: testUpdate.role },
  });
  fireEvent.change(res.getByRole("textbox", { name: "Crew Mate" }), {
    target: { value: testUpdate.crewMate },
  });

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

  const res = render(<AddShiftBase />);

  server.use(rest.post(endPoint, (_, rs, ctx) => rs(ctx.status(500))));

  fireEvent.change(res.getByLabelText("Date", { exact: false }), {
    target: { value: testUpdate.date },
  });
  fireEvent.change(res.getByRole("spinbutton", { name: "Hours" }), {
    target: { value: testUpdate.duration.toString() },
  });
  fireEvent.change(res.getByRole("textbox", { name: "Event" }), {
    target: { value: testUpdate.event },
  });
  fireEvent.change(res.getByRole("textbox", { name: "Location" }), {
    target: { value: testUpdate.location },
  });
  fireEvent.change(res.getByLabelText("Role", { exact: false }), {
    target: { value: testUpdate.role },
  });
  fireEvent.change(res.getByRole("textbox", { name: "Crew Mate" }), {
    target: { value: testUpdate.crewMate },
  });

  const saveButton = res.getByRole("button", { name: "Save" });

  fireEvent.click(saveButton);

  expect(saveButton).toBeDisabled();
  await waitFor(() => res.getByRole("alert"));

  const alert = res.getByRole("alert");
  expect(alert).toHaveTextContent("problem speaking to the server");

  expect(testPush).not.toBeCalled();

  expect(saveButton).toBeEnabled();
});
