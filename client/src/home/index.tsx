import { withAuthenticationRequired } from "@auth0/auth0-react";
import { Grid, Typography } from "@material-ui/core";
import { formatISO, sub } from "date-fns";
import React from "react";
import Nav from "../nav";
import randomWords from "random-words";
import ShiftCard from "./shift-card";
import { ShiftSummary } from "../../../shared/model/shift";

function randomRole() {
  const val = Math.random();

  if (val < 1 / 3) return "EAC";
  if (val < 2 / 3) return "AFA";
  return "CRU";
}

function Home() {
  const shifts: ShiftSummary[] = [
    {
      id: 1,
      date: formatISO(sub(Date.now(), { days: 1 }), { representation: "date" }),
      event: (randomWords({ min: 3, max: 6 }) as string[]).join(" "),
      location: (randomWords({ min: 3, max: 6 }) as string[]).join(" "),
      duration: Math.random() * 12,
      role: randomRole(),
      crewMate: (randomWords(2) as string[]).join(" "),
      loggedCalls: Math.round(Math.random() * 12),
    },
    {
      id: 2,
      date: formatISO(sub(Date.now(), { days: 3 }), { representation: "date" }),
      event: (randomWords({ min: 3, max: 6 }) as string[]).join(" "),
      location: (randomWords({ min: 3, max: 6 }) as string[]).join(" "),
      duration: Math.random() * 12,
      role: randomRole(),
      crewMate: (randomWords(2) as string[]).join(" "),
      loggedCalls: Math.round(Math.random() * 12),
    },
    {
      id: 3,
      date: formatISO(Date.now(), { representation: "date" }),
      event: (randomWords({ min: 3, max: 6 }) as string[]).join(" "),
      location: (randomWords({ min: 3, max: 6 }) as string[]).join(" "),
      duration: Math.random() * 12,
      role: randomRole(),
      crewMate: (randomWords(2) as string[]).join(" "),
      loggedCalls: Math.round(Math.random() * 12),
    },
  ];

  const shiftCards = shifts
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((s) => (
      <Grid item key={s.id} xs={6} sm={6} lg={3}>
        <ShiftCard shift={s} />
      </Grid>
    ));

  return (
    <Nav>
      <Typography component="h2" variant="h5">
        Recent Shifts
      </Typography>
      <Grid container spacing={2}>
        {shiftCards}
      </Grid>
    </Nav>
  );
}

export default withAuthenticationRequired(Home);
