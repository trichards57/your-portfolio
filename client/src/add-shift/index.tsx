import { Paper, Typography, makeStyles } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { formatISO, isValid, parseISO } from "date-fns";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import { useHistory } from "react-router-dom";
import { Alert } from "@material-ui/lab";
import Nav from "../nav";
import { NewShift, RoleType } from "../model/shift";
import ShiftForm from "../shared/shift-form";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(4),
  },
  item: {
    width: "100%",
  },
  alert: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
}));

export function AddShiftBase() {
  const classes = useStyles();
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

  async function submit() {
    if (!canSubmit) return;

    setSaveRunning(true);
    setErrorSaving(false);

    const token = await getAccessTokenSilently({
      audience: "https://tr-toolbox.me.uk/your-portfolio",
    });
    const uri = "/api/LogShift";

    const response = await fetch(uri, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method: "POST",
      body: JSON.stringify({
        date: shiftDate,
        duration,
        event: eventName,
        role,
        crewMate,
        location,
      } as NewShift),
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
      <Paper className={classes.root}>
        <Typography component="h2" variant="h5" gutterBottom>
          Add Shift
        </Typography>
        {errorSaving && (
          <Alert severity="error" className={classes.alert}>
            There was an problem speaking to the server. Please try again, or
            retry later.
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
          isLoading={false}
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

export default withAuthenticationRequired(AddShiftBase);
