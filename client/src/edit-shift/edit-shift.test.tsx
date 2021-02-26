import { useAuth0 } from "@auth0/auth0-react";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { rest } from "msw";
import { setupServer } from "msw/node";
import ReactDOM from "react-dom";
import { useHistory } from "react-router-dom";
import { EditShift } from ".";
import { NewShift } from "../model/shift";

jest.mock("@auth0/auth0-react");
jest.mock("react-router-dom", () => ({
  useHistory: jest.fn(),
  useParams<T>() {
    return { id: testId };
  },
}));

const testToken = "abcdefg";
const testId = "abcd";

const getEndPoint = "/api/GetShift";
const updateEndPoint = "/api/UpdateShift";

const testUpdate: NewShift = {
  date: "2021-01-02",
  duration: 6.5,
  event: "SWASFT Shift",
  role: "CRU",
  crewMate: "New Crew Mate",
  location: "New Location",
};

const server = setupServer(
  rest.get(getEndPoint, (req, res, ctx) => {
    if (req.headers.get("authorization") === `Bearer ${testToken}`) {
      if (req.url.searchParams.get("id") === testId) {
        return res(
          ctx.json({
            date: "2020-01-01",
            duration: 3,
            event: "Test Shift 1",
            id: "abcdef",
            loggedCalls: 4,
            role: "EAC",
            crewMate: "Test Crewmate 1",
            location: "Test Location 1",
          })
        );
      }
      return res(ctx.status(404));
    }
    return res(ctx.status(401));
  }),
  rest.post(updateEndPoint, (req, res, ctx) => {
    if (req.headers.get("authorization") === `Bearer ${testToken}`) {
      const { id, ...update } = JSON.parse(req.body?.toString() ?? "") as {
        id: string;
      } & NewShift;

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

  ReactDOM.render(<EditShift />, div);

  ReactDOM.unmountComponentAtNode(div);
});

it("renders loading correctly", async () => {
  const res = render(<EditShift />);

  expect(res.asFragment()).toMatchSnapshot();
});

it("renders successful load correctly", async () => {
  const res = render(<EditShift />);

  await res.findByDisplayValue("Test Shift 1");

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

  render(<EditShift />);

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

  render(<EditShift />);

  await waitFor(() => expect(testPush).toBeCalledWith("/home"));
});

it("displays an error if the request fails", async () => {
  server.use(
    rest.get(getEndPoint, (_, res, ctx) => {
      return res(ctx.status(500));
    })
  );

  const res = render(<EditShift />);

  await res.findByText("There was a problem speaking to the server.", {
    exact: false,
  });

  expect(res.asFragment()).toMatchSnapshot();
});

it("displays an invalid date properly", async () => {
  const res = render(<EditShift />);

  await res.findByDisplayValue("Test Shift 1");

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
  const res = render(<EditShift />);

  await res.findByDisplayValue("Test Shift 1");

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
  const res = render(<EditShift />);

  await res.findByDisplayValue("Test Shift 1");

  const box = res.getByRole("textbox", {
    name: "Event",
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

  const res = render(<EditShift />);

  await res.findByDisplayValue("Test Shift 1");

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

  const res = render(<EditShift />);

  server.use(
    rest.post(updateEndPoint, (_, res, ctx) => {
      return res(ctx.status(500));
    })
  );

  await res.findByDisplayValue("Test Shift 1");

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
  expect(alert).toContainHTML("problem speaking to the server");

  expect(testPush).not.toBeCalled();

  expect(saveButton).toBeEnabled();
});
