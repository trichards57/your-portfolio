import { Card, CardContent, Typography, makeStyles } from "@material-ui/core";
import React from "react";
import { Skeleton } from "@material-ui/lab";

const useStyles = makeStyles({
  date: {
    fontSize: 14,
    width: "50%",
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

function ShiftCard() {
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

export default ShiftCard;
