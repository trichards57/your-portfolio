import { Grid, Typography } from "@material-ui/core";
import React, { ReactNode, useEffect, useState } from "react";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import { Alert } from "@material-ui/lab";
import { useHistory } from "react-router-dom";
import LoadingCard from "../shared/loading-card";
import Nav from "../nav";
import ShiftCard from "../shared/shift-card";
import { ShiftSummary } from "../model/shift";
import useSharedStyles from "../shared/shared-styles";

export function HomeBase() {
  const sharedClasses = useSharedStyles();
  const history = useHistory();
  const [shifts, setShifts] = useState<ShiftSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    setIsLoading(true);

    const abortController = new AbortController();

    async function loadData() {
      const token = await getAccessTokenSilently({
        audience: "https://tr-toolbox.me.uk/your-portfolio",
      });
      const uri = "/api/RecentShifts";

      const response = await fetch(uri, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: abortController.signal,
      });

      if (response.ok) {
        const newShifts = (await response.json()) as ShiftSummary[];

        if (abortController.signal.aborted) return;

        setShifts(newShifts);
      } else if (response.status === 401) history.push("/");
      else setError(true);

      setIsLoading(false);
    }

    loadData();
    return () => abortController.abort();
  }, [getAccessTokenSilently, history]);

  const shiftCards = shifts
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((s) => (
      <Grid item key={s.id} xs={6} sm={6} lg={3}>
        <ShiftCard shift={s} />
      </Grid>
    ));

  const loadingCards = [{}, {}, {}, {}].map((s, i) => (
    // eslint-disable-next-line react/no-array-index-key
    <Grid item key={i} xs={6} sm={6} lg={3}>
      <LoadingCard />
    </Grid>
  ));

  let content: ReactNode;

  if (isLoading) content = loadingCards;
  else if (error)
    content = (
      <Alert severity="error" className={sharedClasses.alert}>
        There was a problem speaking to the server. Try refreshing, or come back
        a little later.
      </Alert>
    );
  else content = shiftCards;

  return (
    <Nav>
      <Typography component="h2" variant="h5">
        Recent Shifts
      </Typography>
      <Grid container spacing={2}>
        {content}
      </Grid>
    </Nav>
  );
}

export default withAuthenticationRequired(HomeBase);
