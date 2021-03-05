import { Button, Grid } from "@material-ui/core";
import React from "react";
import { Save as SaveIcon } from "@material-ui/icons";
import { Outcome } from "../model/job";
import useSharedStyles from "./shared-styles";
import LoadingTextField from "./loading-text-field";
import LoadingSelectField from "./loading-select-field";
import LoadingSwitch from "./loading-switch";

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
          <LoadingTextField
            isLoading={isLoading}
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
        </Grid>
        <Grid item sm={12} md={4}>
          <LoadingSelectField
            variant="filled"
            isLoading={isLoading}
            label="Gender"
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
          </LoadingSelectField>
        </Grid>
        <Grid item sm={12} md={4}>
          <LoadingSelectField
            variant="filled"
            isLoading={isLoading}
            label="Category"
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
          </LoadingSelectField>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item sm={12} md={6}>
          <LoadingSwitch
            isLoading={isLoading}
            label="Drove to Patient"
            checked={drove}
            onChange={(c) => setDrove(c.currentTarget.checked)}
          />
        </Grid>
        <Grid item sm={12} md={6}>
          <LoadingSwitch
            isLoading={isLoading}
            label="Used Blue Lights"
            checked={blueLights}
            onChange={(c) => setBlueLights(c.currentTarget.checked)}
          />
        </Grid>
        <Grid item xs={12}>
          <LoadingTextField
            isLoading={isLoading}
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
        </Grid>
        <Grid item sm={12} md={6}>
          <LoadingSelectField
            variant="filled"
            required
            isLoading={isLoading}
            label="Outcome"
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
          </LoadingSelectField>
        </Grid>
        <Grid item sm={12} md={6}>
          <LoadingSwitch
            isLoading={isLoading}
            label="Mark for Reflection"
            checked={reflectionFlag}
            onChange={(c) => setReflectionFlag(c.currentTarget.checked)}
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
            >
              Save
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </form>
  );
}
