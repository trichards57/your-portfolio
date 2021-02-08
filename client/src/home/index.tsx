import { withAuthenticationRequired } from "@auth0/auth0-react";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Grid,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { format, formatISO, parseISO, sub } from "date-fns";
import React from "react";
import Nav from "../nav";
import randomWords from "random-words";
import classNames from "classnames";

function randomRole() {
  const val = Math.random();

  if (val < 1 / 3) return "EAC";
  if (val < 2 / 3) return "AFA";
  return "CRU";
}

const useStyles = makeStyles({
  date: {
    fontSize: 14,
  },
  trimText: {
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    overflow: "hidden",
  },
  location: {
    marginBottom: 12,
  },
});

function Home() {
  const classes = useStyles();

  const shifts = [
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
        <Card>
          <CardContent>
            <Typography
              className={classNames(classes.date, classes.trimText)}
              color="textSecondary"
              gutterBottom
            >
              {format(parseISO(s.date), "d MMMM yyyy")}
            </Typography>
            <Typography
              className={classes.trimText}
              variant="h5"
              component="h2"
            >
              {s.event}
            </Typography>
            <Typography
              className={classNames(classes.location, classes.trimText)}
              color="textSecondary"
            >
              {s.location}
            </Typography>
            <Typography variant="body2" component="p">
              Role : {s.role}
            </Typography>
            <Typography variant="body2" component="p">
              Logged Calls : {s.loggedCalls}
            </Typography>
          </CardContent>
          <CardActions>
            <Button size="small">Edit</Button>
            <Button size="small">Add Job</Button>
          </CardActions>
        </Card>
      </Grid>
    ));

  return (
    <Nav>
      <Typography component="h2" variant="h5">
        Recent Shifts
      </Typography>
      <Grid container spacing={2}>
        {shiftCards}
        <Grid item xs={6} sm={6} lg={3}>
          <Card>Add Shift</Card>
        </Grid>
      </Grid>
    </Nav>
  );
}

export default withAuthenticationRequired(Home);
