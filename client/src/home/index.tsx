import { Grid, Typography } from "@material-ui/core";
import React, { ReactNode } from "react";
import { withAuthenticationRequired } from "@auth0/auth0-react";
import { Alert } from "@material-ui/lab";
import Nav from "../nav";
import ShiftCard from "../shared/shift-card";
import { ShiftSummary } from "../model/shift";
import useSharedStyles from "../shared/shared-styles";
import useLoadedData from "../shared/load-data";

export function HomeBase() {
  const sharedClasses = useSharedStyles();

  const { data: shifts, errorLoading, isLoading } = useLoadedData<
    ShiftSummary[]
  >("/api/RecentShifts");

  let content: ReactNode;

  if (isLoading) {
    content = [{}, {}, {}, {}].map((s, i) => (
      // eslint-disable-next-line react/no-array-index-key
      <Grid item key={i} xs={6} sm={6} lg={3}>
        <ShiftCard />
      </Grid>
    ));
  } else if (errorLoading || !shifts)
    content = (
      <Alert severity="error" className={sharedClasses.alert}>
        There was a problem speaking to the server. Try refreshing, or come back
        a little later.
      </Alert>
    );
  else {
    content = shifts
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((s) => (
        <Grid item key={s.id} xs={6} sm={6} lg={3}>
          <ShiftCard shift={s} />
        </Grid>
      ));
  }

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
