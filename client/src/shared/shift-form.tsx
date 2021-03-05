import { Button, Grid } from "@material-ui/core";
import React, { useState } from "react";
import { Save as SaveIcon } from "@material-ui/icons";
import { RoleType } from "../model/shift";
import useSharedStyles from "./shared-styles";
import LoadingTextField from "./loading-text-field";
import LoadingSelectField from "./loading-select-field";

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

export default function ShiftForm(props: ShiftFormProps) {
  const {
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
  } = props;
  const sharedClasses = useSharedStyles();
  const [eventNameChanged, setEventNameChanged] = useState(false);

  return (
    <form noValidate>
      <Grid container spacing={2}>
        <Grid item xs={6} sm={8} md={3} lg={2}>
          <LoadingTextField
            isLoading={isLoading}
            label="Date"
            type="date"
            id="date"
            InputLabelProps={{
              shrink: true,
            }}
            className={sharedClasses.formItem}
            value={shiftDate}
            onChange={(c) => setShiftDate(c.target.value)}
            required
            error={!dateValid}
            helperText={dateValid ? "" : "You need to enter a date"}
            variant="filled"
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <LoadingTextField
            isLoading={isLoading}
            label="Hours"
            type="number"
            id="hours"
            className={sharedClasses.formItem}
            value={duration.toString()}
            onChange={(c) => setDuration(parseFloat(c.currentTarget.value))}
            error={!durationValid}
            helperText={durationValid ? "" : "You need to enter a shift length"}
            required
            variant="filled"
          />
        </Grid>
        <Grid item xs={12} md={7} lg={8}>
          <LoadingTextField
            isLoading={isLoading}
            label="Event"
            id="event"
            className={sharedClasses.formItem}
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
        </Grid>
        <Grid item xs={12}>
          <LoadingTextField
            isLoading={isLoading}
            label="Location"
            id="location"
            className={sharedClasses.formItem}
            value={location}
            onChange={(c) => setLocation(c.currentTarget.value)}
            variant="filled"
          />
        </Grid>
        <Grid item xs={12} md={4} lg={2}>
          <LoadingSelectField
            isLoading={isLoading}
            required
            variant="filled"
            label="Role"
            id="role"
            labelId="role-label"
            value={role}
            onChange={(c) => setRole(c.target.value as RoleType)}
            native
          >
            <option value="EAC">EAC</option>
            <option value="AFA">AFA</option>
            <option value="CRU">CRU</option>
          </LoadingSelectField>
        </Grid>
        <Grid item xs={12} md={8} lg={10}>
          <LoadingTextField
            isLoading={isLoading}
            label="Crew Mate"
            id="crew-mate"
            className={sharedClasses.formItem}
            value={crewMate}
            onChange={(c) => setCrewMate(c.currentTarget.value)}
            variant="filled"
          />
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
