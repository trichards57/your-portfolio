import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import {
  Button,
  FormControl,
  Grid,
  InputLabel,
  makeStyles,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@material-ui/core";
import { Save as SaveIcon } from "@material-ui/icons";
import { Skeleton } from "@material-ui/lab";
import { formatISO, isValid, parseISO } from "date-fns";
import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { NewShift, RoleType } from "../model/shift";
import Nav from "../nav";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(4),
  },
  item: {
    width: "100%",
  },
  skeleton: {
    height: "72px",
  },
}));

function EditShift() {
  const { id } = useParams<{ id: string }>();

  const classes = useStyles();
  const history = useHistory();

  const [shiftDate, setShiftDate] = useState(
    formatISO(Date.now(), { representation: "date" })
  );
  const [dateValid, setDateValid] = useState(true);
  const [duration, setDuration] = useState(8.0);
  const [durationValid, setDurationValid] = useState(true);
  const [eventName, setEventName] = useState("");
  const [eventNameChanged, setEventNameChanged] = useState(false);
  const [eventNameValid, setEventNameValid] = useState(false);
  const [location, setLocation] = useState("");
  const [role, setRole] = useState<RoleType>("EAC");
  const [crewMate, setCrewMate] = useState("");
  const [canSubmit, setCanSubmit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    setDateValid(isValid(parseISO(shiftDate)));
  }, [shiftDate]);
  useEffect(() => {
    setDurationValid(!isNaN(duration) && duration > 0);
  }, [duration]);
  useEffect(() => {
    setEventNameValid(eventName.trim().length > 0);
  }, [eventName]);
  useEffect(() => {
    setCanSubmit(dateValid && durationValid && eventNameValid);
  }, [dateValid, durationValid, eventNameValid]);

  useEffect(() => {
    setIsLoading(true);
    async function loadData() {
      const token = await getAccessTokenSilently({
        audience: "https://tr-toolbox.me.uk/your-portfolio",
      });
      const uri = `/api/GetShift?id=${id}`;

      const response = await fetch(uri, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: "GET",
      });

      if (!response.ok) {
        history.push("/home");
      }

      const shift = (await response.json()) as NewShift;

      setShiftDate(shift.date.split("T")[0]);
      setDuration(shift.duration);
      setEventName(shift.event);
      setEventNameChanged(false);
      setLocation(shift.location || "");
      setRole(shift.role);
      setCrewMate(shift.crewMate || "");
      setIsLoading(false);
    }
    loadData();
  }, [getAccessTokenSilently, history, id]);

  async function submit() {
    if (!canSubmit) return;

    const token = await getAccessTokenSilently({
      audience: "https://tr-toolbox.me.uk/your-portfolio",
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
    }
  }

  return (
    <Nav>
      <Paper className={classes.root}>
        <Typography component="h2" variant="h5" gutterBottom>
          Add Shift
        </Typography>
        <form noValidate>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={8} md={3} lg={2}>
              {isLoading ? (
                <Skeleton className={classes.skeleton} />
              ) : (
                <TextField
                  label="Date"
                  type="date"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  className={classes.item}
                  value={shiftDate}
                  onChange={(c) => setShiftDate(c.currentTarget.value)}
                  required
                  error={!dateValid}
                  helperText={dateValid ? "" : "A valid date is required"}
                  variant="filled"
                />
              )}
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              {isLoading ? (
                <Skeleton className={classes.skeleton} />
              ) : (
                <TextField
                  label="Hours"
                  type="number"
                  className={classes.item}
                  value={duration.toString()}
                  onChange={(c) =>
                    setDuration(parseFloat(c.currentTarget.value))
                  }
                  error={!durationValid}
                  helperText={
                    durationValid ? "" : "You need to enter a shift length"
                  }
                  required
                  variant="filled"
                />
              )}
            </Grid>
            <Grid item xs={12} md={7} lg={8}>
              {isLoading ? (
                <Skeleton className={classes.skeleton} />
              ) : (
                <TextField
                  label="Event"
                  className={classes.item}
                  value={eventName}
                  onChange={(c) => {
                    setEventName(c.currentTarget.value);
                    setEventNameChanged(true);
                  }}
                  error={!eventNameValid && eventNameChanged}
                  helperText={
                    eventNameValid || !eventNameChanged
                      ? ""
                      : "You need to name this shift"
                  }
                  required
                  variant="filled"
                />
              )}
            </Grid>
            <Grid item xs={12}>
              {isLoading ? (
                <Skeleton className={classes.skeleton} />
              ) : (
                <TextField
                  label="Location"
                  className={classes.item}
                  value={location}
                  onChange={(c) => setLocation(c.currentTarget.value)}
                  variant="filled"
                />
              )}
            </Grid>
            <Grid item xs={12} md={4} lg={2}>
              {isLoading ? (
                <Skeleton className={classes.skeleton} />
              ) : (
                <FormControl className={classes.item} required variant="filled">
                  <InputLabel id="role-label">Role</InputLabel>
                  <Select
                    labelId="role-label"
                    value={role}
                    onChange={(c) => setRole(c.target.value as RoleType)}
                  >
                    <MenuItem value="EAC">EAC</MenuItem>
                    <MenuItem value="AFA">AFA</MenuItem>
                    <MenuItem value="CRU">CRU</MenuItem>
                  </Select>
                </FormControl>
              )}
            </Grid>
            <Grid item xs={12} md={8} lg={10}>
              {isLoading ? (
                <Skeleton className={classes.skeleton} />
              ) : (
                <TextField
                  label="Crew Mate"
                  className={classes.item}
                  value={crewMate}
                  onChange={(c) => setCrewMate(c.currentTarget.value)}
                  variant="filled"
                />
              )}
            </Grid>
            <Grid container item xs={12} justify="flex-end">
              <Grid item>
                <Button
                  startIcon={<SaveIcon />}
                  color="primary"
                  variant="contained"
                  onClick={submit}
                  disabled={!canSubmit}
                >
                  Save
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Nav>
  );
}

export default withAuthenticationRequired(EditShift);
