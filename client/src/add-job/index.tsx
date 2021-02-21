import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import {
  Button,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  makeStyles,
  MenuItem,
  Paper,
  Select,
  Switch,
  TextField,
  Typography,
} from "@material-ui/core";
import { Save as SaveIcon } from "@material-ui/icons";
import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { NewJob, Outcome } from "../model/job";
import Nav from "../nav";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(4),
  },
  item: {
    width: "100%",
  },
}));

function AddJob() {
  const routerLocation = useLocation();
  const shiftId = new URLSearchParams(routerLocation.search).get("shift");
  const classes = useStyles();
  const history = useHistory();

  const [age, setAge] = useState<number | undefined>(undefined);
  const [ageValid, setAgeValid] = useState(true);
  const [blueLights, setBlueLights] = useState(false);
  const [category, setCategory] = useState(3);
  const [drove, setDrove] = useState(false);
  const [gender, setGender] = useState<"Male" | "Female" | undefined>(
    undefined
  );
  const [notes, setNotes] = useState("");
  const [outcome, setOutcome] = useState<Outcome>("DischargedOnScene");
  const [reflectionFlag, setReflectionFlag] = useState(false);

  const [canSubmit, setCanSubmit] = useState(false);

  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    setAgeValid(age === undefined || age > 0);
  }, [age]);
  useEffect(() => {
    setCanSubmit(ageValid);
  }, [ageValid]);

  if (!shiftId) history.goBack();

  async function submit() {
    if (!canSubmit) return;

    const token = await getAccessTokenSilently({
      audience: "https://tr-toolbox.me.uk/your-portfolio",
    });
    const uri = "/api/LogJob";

    const response = await fetch(uri, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method: "POST",
      body: JSON.stringify({
        age,
        blueLights,
        category,
        drove,
        gender,
        notes,
        outcome,
        reflectionFlag,
        shift: shiftId,
      } as NewJob),
    });

    if (response.ok) {
      history.push("/home");
    }
  }

  return (
    <Nav>
      <Paper className={classes.root}>
        <Typography component="h2" variant="h5" gutterBottom>
          Add Job
        </Typography>
        <form noValidate>
          <Grid container spacing={2}>
            <Grid item sm={12} md={2}>
              <TextField
                label="Age"
                type="number"
                className={classes.item}
                value={age?.toString() ?? ""}
                onChange={(c) => {
                  const val = parseInt(c.currentTarget.value);
                  if (!val || val <= 0) setAge(undefined);
                  else setAge(val);
                }}
                error={!ageValid}
                helperText={
                  ageValid ? "" : "Either give a valid age or leave it blank"
                }
                variant="filled"
              />
            </Grid>
            <Grid item sm={12} md={4}>
              <FormControl className={classes.item} variant="filled">
                <InputLabel id="gender-label">Gender</InputLabel>
                <Select
                  labelId="gender-label"
                  value={gender}
                  onChange={(c) =>
                    setGender(c.target.value as "Male" | "Female" | undefined)
                  }
                >
                  <MenuItem value={undefined}>Not Set</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Male">Male</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item sm={12} md={4}>
              <FormControl className={classes.item} variant="filled">
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  value={category}
                  onChange={(c) => setCategory(c.target.value as number)}
                >
                  <MenuItem value={1}>Cat 1</MenuItem>
                  <MenuItem value={2}>Cat 2</MenuItem>
                  <MenuItem value={3}>Cat 3</MenuItem>
                  <MenuItem value={4}>Cat 4</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item sm={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={drove}
                    onChange={(c) => setDrove(c.currentTarget.checked)}
                  />
                }
                label="Drove to Patient"
              />
            </Grid>
            <Grid item sm={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={blueLights}
                    onChange={(c) => setBlueLights(c.currentTarget.checked)}
                  />
                }
                label="Used Blue Lights"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Notes"
                multiline
                className={classes.item}
                value={notes}
                onChange={(c) => {
                  setNotes(c.currentTarget.value);
                }}
                variant="filled"
                rows={6}
              />
            </Grid>
            <Grid item sm={12} md={6}>
              <FormControl className={classes.item} required variant="filled">
                <InputLabel id="outcome-label">Outcome</InputLabel>
                <Select
                  labelId="outcome-label"
                  value={outcome}
                  onChange={(c) => setOutcome(c.target.value as Outcome)}
                >
                  <MenuItem value="StoodDown">Stood Down</MenuItem>
                  <MenuItem value="Conveyed">Conveyed</MenuItem>
                  <MenuItem value="DischargedOnScene">
                    Discharge on Scene
                  </MenuItem>
                  <MenuItem value="NotFound">Not Found</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item sm={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={reflectionFlag}
                    onChange={(c) => setReflectionFlag(c.currentTarget.checked)}
                  />
                }
                label="Mark for Reflection"
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
      </Paper>
    </Nav>
  );
}

export default withAuthenticationRequired(AddJob);
