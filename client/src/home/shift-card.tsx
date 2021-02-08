import {
  Button,
  Card,
  CardActions,
  CardContent,
  makeStyles,
  Typography,
} from "@material-ui/core";
import classNames from "classnames";
import { format, parseISO } from "date-fns";
import React from "react";
import { Shift } from "../../../shared/model/shift";

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

function ShiftCard({ shift }: { shift: Shift }) {
  const classes = useStyles();

  return (
    <Card>
      <CardContent>
        <Typography
          className={classNames(classes.date, classes.trimText)}
          color="textSecondary"
          gutterBottom
        >
          {format(parseISO(shift.date), "d MMMM yyyy")}
        </Typography>
        <Typography className={classes.trimText} variant="h5" component="h2">
          {shift.event}
        </Typography>
        <Typography
          className={classNames(classes.location, classes.trimText)}
          color="textSecondary"
        >
          {shift.location}
        </Typography>
        <Typography variant="body2" component="p">
          Role: {shift.role}
        </Typography>
        <Typography variant="body2" component="p">
          Logged Calls: {shift.loggedCalls}
        </Typography>
      </CardContent>
      <CardActions>
        <Button variant="contained" size="small">
          Edit
        </Button>
        <Button color="primary" variant="contained" size="small">
          Add Job
        </Button>
      </CardActions>
    </Card>
  );
}

export default ShiftCard;
