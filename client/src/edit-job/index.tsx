import { Paper, Typography, makeStyles } from "@material-ui/core";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { Alert } from "@material-ui/lab";
import Nav from "../nav";
import { NewJob, Outcome } from "../model/job";
import JobForm from "../shared/job-form";

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

export function EditJobBase() {
  const { id } = useParams<{ id: string }>();

  const classes = useStyles();
  const history = useHistory();

  const [age, setAge] = useState<number | undefined>(undefined);
  const [blueLights, setBlueLights] = useState(false);
  const [category, setCategory] = useState(3);
  const [drove, setDrove] = useState(false);
  const [gender, setGender] = useState<"Male" | "Female" | undefined>(
    undefined
  );
  const [notes, setNotes] = useState("");
  const [outcome, setOutcome] = useState<Outcome>("DischargedOnScene");
  const [reflectionFlag, setReflectionFlag] = useState(false);
  const [shift, setShift] = useState("");
  const [canSubmit, setCanSubmit] = useState(false);
  const [saveRunning, setSaveRunning] = useState(false);
  const [errorSaving, setErrorSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorLoading, setErrorLoading] = useState(false);
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    setCanSubmit(!saveRunning);
  }, [saveRunning]);

  useEffect(() => {
    setIsLoading(true);

    const abortController = new AbortController();

    async function loadData() {
      const token = await getAccessTokenSilently({
        audience: "https://tr-toolbox.me.uk/your-portfolio",
      });
      const uri = `/api/GetJob?id=${id}`;

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

      const job = (await response.json()) as NewJob;

      if (abortController.signal.aborted) return;

      setAge(job.age);
      setBlueLights(job.blueLights);
      setCategory(job.category);
      setDrove(job.drove);
      setGender(job.gender);
      setNotes(job.notes);
      setOutcome(job.outcome);
      setReflectionFlag(job.reflectionFlag);
      setShift(job.shift);

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
      audience: "https://tr-toolbox.me.uk/your-portfolio",
    });
    const uri = "/api/UpdateJob";

    const response = await fetch(uri, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method: "POST",
      body: JSON.stringify({
        id,
        age,
        blueLights,
        category,
        drove,
        gender,
        notes,
        outcome,
        reflectionFlag,
        shift,
      } as NewJob),
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
          Add Job
        </Typography>
        {errorSaving && (
          <Alert severity="error" className={classes.alert}>
            There was an problem speaking to the server. Please try again, or
            retry later.
          </Alert>
        )}
        {errorLoading && (
          <Alert severity="error" className={classes.alert}>
            There was a problem speaking to the server. Try refreshing, or come
            back a little later.
          </Alert>
        )}
        <JobForm
          age={age}
          blueLights={blueLights}
          canSubmit={canSubmit}
          category={category}
          drove={drove}
          gender={gender}
          notes={notes}
          outcome={outcome}
          reflectionFlag={reflectionFlag}
          setAge={setAge}
          setBlueLights={setBlueLights}
          setCategory={setCategory}
          setDrove={setDrove}
          setGender={setGender}
          setNotes={setNotes}
          setOutcome={setOutcome}
          setReflectionFlag={setReflectionFlag}
          submit={submit}
          isLoading={isLoading}
        />
      </Paper>
    </Nav>
  );
}

export default withAuthenticationRequired(EditJobBase);
