import {
  Button,
  Card,
  CardActions,
  CardContent,
  Typography,
  makeStyles,
} from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import { format, parseISO } from "date-fns";
import { Link } from "react-router-dom";
import React from "react";
import classNames from "classnames";
import { ShiftSummary } from "../model/shift";

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

interface IShiftCardProps {
  deleteClicked(id: string): void;
  shift: ShiftSummary;
}

function LoadingCard() {
  const classes = useStyles();

  return (
    <Card>
      <CardContent>
        <Typography className={classes.date} gutterBottom>
          <Skeleton />
        </Typography>
        <Typography className={classes.trimText} variant="h5" component="h2">
          <Skeleton />
        </Typography>
        <Typography className={classes.location} color="textSecondary">
          <Skeleton />
        </Typography>
        <Typography variant="body2" component="p">
          <Skeleton />
        </Typography>
        <Typography variant="body2" component="p">
          <Skeleton />
        </Typography>
      </CardContent>
    </Card>
  );
}

function ShiftCard({ deleteClicked, shift }: IShiftCardProps) {
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
          {shift.location || "[no location]"}
        </Typography>
        <Typography variant="body2" component="p">
          Role: {shift.role}
        </Typography>
        <Typography variant="body2" component="p">
          Logged Calls: {shift.loggedCalls}
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          variant="contained"
          size="small"
          {...{ component: Link, to: `/editShift/${shift.id}` }}
        >
          Edit
        </Button>
        <Button
          variant="contained"
          size="small"
          color="secondary"
          onClick={() => deleteClicked(shift.id)}
        >
          Delete
        </Button>
        <Button
          color="primary"
          variant="contained"
          size="small"
          {...{ component: Link, to: `/addJob?shift=${shift.id}` }}
        >
          Add Job
        </Button>
        {shift.loggedCalls > 0 && (
          <Button
            variant="contained"
            size="small"
            {...{ component: Link, to: `/jobs?shiftId=${shift.id}` }}
          >
            Show Jobs
          </Button>
        )}
      </CardActions>
    </Card>
  );
}

function IsLoadingCard(props: Partial<IShiftCardProps>) {
  const { shift, deleteClicked } = props;

  if (!shift) return <LoadingCard />;
  if (!deleteClicked)
    throw Error("deleteClicked is required when shift is provided");

  return <ShiftCard shift={shift} deleteClicked={deleteClicked} />;
}

export default IsLoadingCard;
