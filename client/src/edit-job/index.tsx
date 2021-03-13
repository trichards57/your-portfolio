import { Paper, Typography } from "@material-ui/core";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { Alert } from "@material-ui/lab";
import Nav from "../nav";
import { NewJob, Outcome } from "../model/job";
import JobForm from "../shared/job-form";
import useSharedStyles from "../shared/shared-styles";
import useLoadedData from "../shared/load-data";

export function EditJobBase() {
  const { id } = useParams<{ id: string }>();
  const sharedClasses = useSharedStyles();
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
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    setCanSubmit(!saveRunning);
  }, [saveRunning]);

  const { data, errorLoading, isLoading } = useLoadedData<NewJob>(
    `/api/GetJob?id=${id}`
  );

  useEffect(() => {
    if (data) {
      setAge(data.age);
      setBlueLights(data.blueLights);
      setCategory(data.category);
      setDrove(data.drove);
      setGender(data.gender);
      setNotes(data.notes);
      setOutcome(data.outcome);
      setReflectionFlag(data.reflectionFlag);
      setShift(data.shift);
    }
  }, [data]);

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
      <Paper className={sharedClasses.formRoot}>
        <Typography component="h2" variant="h5" gutterBottom>
          Add Job
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
          isLoading={isLoading || errorLoading}
        />
      </Paper>
    </Nav>
  );
}

export default withAuthenticationRequired(EditJobBase);
