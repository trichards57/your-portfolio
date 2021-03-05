import { Alert } from "@material-ui/lab";
import { Paper, Typography } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { formatISO, isValid, parseISO } from "date-fns";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import { useHistory, useParams } from "react-router-dom";
import { NewShift, RoleType } from "../model/shift";
import Nav from "../nav";
import { ServerAudience } from "../shared/constants";
import ShiftForm from "../shared/shift-form";
import useSharedStyles from "../shared/shared-styles";

export function EditShiftBase() {
  const { id } = useParams<{ id: string }>();

  const sharedClasses = useSharedStyles();
  const history = useHistory();

  const [shiftDate, setShiftDate] = useState(
    formatISO(Date.now(), { representation: "date" })
  );
  const [dateValid, setDateValid] = useState(true);
  const [duration, setDuration] = useState(8.0);
  const [durationValid, setDurationValid] = useState(true);
  const [eventName, setEventName] = useState("");
  const [eventNameValid, setEventNameValid] = useState(false);
  const [location, setLocation] = useState("");
  const [role, setRole] = useState<RoleType>("EAC");
  const [crewMate, setCrewMate] = useState("");
  const [canSubmit, setCanSubmit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorLoading, setErrorLoading] = useState(false);
  const [saveRunning, setSaveRunning] = useState(false);
  const [errorSaving, setErrorSaving] = useState(false);

  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    setDateValid(isValid(parseISO(shiftDate)));
  }, [shiftDate]);
  useEffect(() => {
    setDurationValid(!Number.isNaN(duration) && duration > 0);
  }, [duration]);
  useEffect(() => {
    setEventNameValid(eventName.trim().length > 0);
  }, [eventName]);
  useEffect(() => {
    setCanSubmit(dateValid && durationValid && eventNameValid && !saveRunning);
  }, [dateValid, durationValid, eventNameValid, saveRunning]);

  useEffect(() => {
    setIsLoading(true);

    const abortController = new AbortController();

    async function loadData() {
      const token = await getAccessTokenSilently({
        audience: "https://tr-toolbox.me.uk/your-portfolio",
      });
      const uri = `/api/GetShift?id=${id}`;

      const response = await fetch(uri, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: abortController.signal,
      });

      if (!response.ok) {
        if (response.status === 401) history.push("/");
        else if (response.status === 404) history.push("/home");
        else setErrorLoading(true);
        return;
      }

      const shift = (await response.json()) as NewShift;

      if (abortController.signal.aborted) return;

      setShiftDate(shift.date.split("T")[0]);
      setDuration(shift.duration);
      setEventName(shift.event);
      setLocation(shift.location || "");
      setRole(shift.role);
      setCrewMate(shift.crewMate || "");
      setIsLoading(false);
    }
    loadData();
    return () => abortController.abort();
  }, [getAccessTokenSilently, history, id]);

  async function submit() {
    if (!canSubmit) return;

    setSaveRunning(true);
    setErrorSaving(false);

    const token = await getAccessTokenSilently({
      audience: ServerAudience,
    });
    const uri = "/api/UpdateShift";

    const response = await fetch(uri, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method: "POST",
      body: JSON.stringify({
        id,
        date: shiftDate,
        duration,
        event: eventName,
        role,
        crewMate,
        location,
      }),
    });

    if (response.ok) {
      history.push("/home");
    } else {
      setErrorSaving(true);
    }

    setSaveRunning(false);
  }

  return (
    <Nav>
      <Paper className={sharedClasses.formRoot}>
        <Typography component="h2" variant="h5" gutterBottom>
          Edit Shift
        </Typography>
        {errorSaving && (
          <Alert severity="error" className={sharedClasses.alert}>
            There was an problem speaking to the server. Please try again, or
            retry later.
          </Alert>
        )}
        {errorLoading && (
          <Alert severity="error" className={sharedClasses.alert}>
            There was a problem speaking to the server. Try refreshing, or come
            back a little later.
          </Alert>
        )}
        <ShiftForm
          setCrewMate={setCrewMate}
          canSubmit={canSubmit}
          crewMate={crewMate}
          dateValid={dateValid}
          duration={duration}
          durationValid={durationValid}
          eventName={eventName}
          eventNameValid={eventNameValid}
          isLoading={isLoading}
          location={location}
          role={role}
          setDuration={setDuration}
          setEventName={setEventName}
          setLocation={setLocation}
          setRole={setRole}
          setShiftDate={setShiftDate}
          shiftDate={shiftDate}
          submit={submit}
        />
      </Paper>
    </Nav>
  );
}

export default withAuthenticationRequired(EditShiftBase);
