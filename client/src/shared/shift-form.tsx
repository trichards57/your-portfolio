import {
  Button,
  FormControl,
  Grid,
  InputLabel,
  Select,
  TextField,
  makeStyles,
} from "@material-ui/core";
import React, { useState } from "react";
import { Save as SaveIcon } from "@material-ui/icons";
import { Skeleton } from "@material-ui/lab";
import { RoleType } from "../model/shift";

interface ShiftFormProps {
  canSubmit: boolean;
  crewMate: string;
  dateValid: boolean;
  duration: number;
  durationValid: boolean;
  eventName: string;
  eventNameValid: boolean;
  isLoading: boolean;
  location: string;
  role: RoleType;
  setCrewMate(value: string): void;
  setDuration(value: number): void;
  setEventName(value: string): void;
  setLocation(value: string): void;
  setRole(value: RoleType): void;
  setShiftDate(value: string): void;
  shiftDate: string;
  submit(): void;
}

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
  alert: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
}));

export default function ShiftForm({
  isLoading,
  shiftDate,
  setShiftDate,
  dateValid,
  duration,
  durationValid,
  setDuration,
  eventName,
  eventNameValid,
  setEventName,
  location,
  setLocation,
  role,
  setRole,
  crewMate,
  setCrewMate,
  submit,
  canSubmit,
}: ShiftFormProps) {
  const classes = useStyles();
  const [eventNameChanged, setEventNameChanged] = useState(false);

  return (
    <form noValidate>
      <Grid container spacing={2}>
        <Grid item xs={6} sm={8} md={3} lg={2}>
          {isLoading ? (
            <Skeleton className={classes.skeleton} />
          ) : (
            <TextField
              label="Date"
              type="date"
              id="date"
              InputLabelProps={{
                shrink: true,
              }}
              className={classes.item}
              value={shiftDate}
              onChange={(c) => setShiftDate(c.target.value)}
              required
              error={!dateValid}
              helperText={dateValid ? "" : "You need to enter a date"}
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
              id="hours"
              className={classes.item}
              value={duration.toString()}
              onChange={(c) => setDuration(parseFloat(c.currentTarget.value))}
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
              id="event"
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
              id="location"
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
              <InputLabel htmlFor="role" id="role-label">
                Role
              </InputLabel>
              <Select
                labelId="role-label"
                id="role"
                value={role}
                onChange={(c) => setRole(c.target.value as RoleType)}
                native
              >
                <option value="EAC">EAC</option>
                <option value="AFA">AFA</option>
                <option value="CRU">CRU</option>
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
              id="crew-mate"
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
              id="save-button"
            >
              Save
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </form>
  );
}
