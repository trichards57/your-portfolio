import {
  Button,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  Select,
  Switch,
  TextField,
} from "@material-ui/core";
import React from "react";
import { Save as SaveIcon } from "@material-ui/icons";
import { Skeleton } from "@material-ui/lab";
import { Outcome } from "../model/job";
import useSharedStyles from "./shared-styles";

interface JobFormProps {
  age: number | undefined;
  blueLights: boolean;
  canSubmit: boolean;
  category: number;
  drove: boolean;
  gender: "Male" | "Female" | undefined;
  isLoading: boolean;
  notes: string;
  outcome: Outcome;
  reflectionFlag: boolean;
  setAge(value: number | undefined): void;
  setBlueLights(value: boolean): void;
  setCategory(value: number): void;
  setDrove(value: boolean): void;
  setGender(value: "Male" | "Female" | undefined): void;
  setNotes(value: string): void;
  setOutcome(value: Outcome): void;
  setReflectionFlag(value: boolean): void;
  submit(): void;
}

export default function JobForm(props: JobFormProps) {
  const {
    age,
    blueLights,
    canSubmit,
    category,
    drove,
    gender,
    isLoading,
    notes,
    outcome,
    reflectionFlag,
    setAge,
    setBlueLights,
    setCategory,
    setDrove,
    setGender,
    setNotes,
    setOutcome,
    setReflectionFlag,
    submit,
  } = props;

  const sharedClasses = useSharedStyles();

  return (
    <form noValidate>
      <Grid container spacing={2}>
        <Grid item sm={12} md={2}>
          {isLoading ? (
            <Skeleton className={sharedClasses.formItemSkeleton} />
          ) : (
            <TextField
              label="Age"
              type="number"
              id="age"
              className={sharedClasses.formItem}
              value={age?.toString() ?? ""}
              onChange={(c) => {
                const val = parseInt(c.currentTarget.value, 10);
                if (!val || val < 0) setAge(undefined);
                else setAge(val);
              }}
              variant="filled"
            />
          )}
        </Grid>
        <Grid item sm={12} md={4}>
          {isLoading ? (
            <Skeleton className={sharedClasses.formItemSkeleton} />
          ) : (
            <FormControl className={sharedClasses.formItem} variant="filled">
              <InputLabel htmlFor="gender" id="gender-label">
                Gender
              </InputLabel>
              <Select
                labelId="gender-label"
                id="gender"
                value={gender}
                onChange={(c) =>
                  setGender(c.target.value as "Male" | "Female" | undefined)
                }
                native
              >
                <option value={undefined}>Not Set</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </Select>
            </FormControl>
          )}
        </Grid>
        <Grid item sm={12} md={4}>
          {isLoading ? (
            <Skeleton className={sharedClasses.formItemSkeleton} />
          ) : (
            <FormControl className={sharedClasses.formItem} variant="filled">
              <InputLabel htmlFor="category" id="category-label">
                Category
              </InputLabel>
              <Select
                id="category"
                labelId="category-label"
                value={category}
                onChange={(c) => {
                  if (typeof c.target.value === "number")
                    setCategory(c.target.value as number);
                  else setCategory(parseInt(c.target.value as string, 10));
                }}
                native
              >
                <option value={1}>Cat 1</option>
                <option value={2}>Cat 2</option>
                <option value={3}>Cat 3</option>
                <option value={4}>Cat 4</option>
                <option value={5}>Cat 5</option>
              </Select>
            </FormControl>
          )}
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item sm={12} md={6}>
          {isLoading ? (
            <Skeleton className={sharedClasses.formItemSkeleton} />
          ) : (
            <FormControlLabel
              control={
                <Switch
                  checked={drove}
                  onChange={(c) => setDrove(c.currentTarget.checked)}
                />
              }
              label="Drove to Patient"
            />
          )}
        </Grid>
        <Grid item sm={12} md={6}>
          {isLoading ? (
            <Skeleton className={sharedClasses.formItemSkeleton} />
          ) : (
            <FormControlLabel
              control={
                <Switch
                  checked={blueLights}
                  onChange={(c) => setBlueLights(c.currentTarget.checked)}
                />
              }
              label="Used Blue Lights"
            />
          )}
        </Grid>
        <Grid item xs={12}>
          {isLoading ? (
            <Skeleton className={sharedClasses.formItemSkeleton} />
          ) : (
            <TextField
              label="Notes"
              multiline
              className={sharedClasses.formItem}
              value={notes}
              onChange={(c) => {
                setNotes(c.currentTarget.value);
              }}
              variant="filled"
              rows={6}
              id="notes"
            />
          )}
        </Grid>
        <Grid item sm={12} md={6}>
          {isLoading ? (
            <Skeleton className={sharedClasses.formItemSkeleton} />
          ) : (
            <FormControl
              className={sharedClasses.formItem}
              required
              variant="filled"
            >
              <InputLabel htmlFor="outcome" id="outcome-label">
                Outcome
              </InputLabel>
              <Select
                id="outcome"
                labelId="outcome-label"
                value={outcome}
                onChange={(c) => setOutcome(c.target.value as Outcome)}
                native
              >
                <option value="StoodDown">Stood Down</option>
                <option value="Conveyed">Conveyed</option>
                <option value="DischargedOnScene">Discharge on Scene</option>
                <option value="NotFound">Not Found</option>
                <option value="Other">Other</option>
              </Select>
            </FormControl>
          )}
        </Grid>
        <Grid item sm={12} md={6}>
          {isLoading ? (
            <Skeleton className={sharedClasses.formItemSkeleton} />
          ) : (
            <FormControlLabel
              control={
                <Switch
                  checked={reflectionFlag}
                  onChange={(c) => setReflectionFlag(c.currentTarget.checked)}
                />
              }
              label="Mark for Reflection"
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
  );
}
