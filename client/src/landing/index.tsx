import { useAuth0 } from "@auth0/auth0-react";
import {
  Button,
  Container,
  makeStyles,
  Paper,
  Typography,
} from "@material-ui/core";
import { log } from "console";
import React from "react";

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    padding: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

function Landing() {
  const classes = useStyles();
  const { loginWithRedirect } = useAuth0();

  return (
    <Container component="main" maxWidth="sm">
      <Paper className={classes.paper} elevation={0}>
        <Typography component="h1" variant="h5">
          Your Portfolio
        </Typography>
        <Typography component="p" variant="body1">
          Track your portfolio as you work.
        </Typography>
        <Button onClick={() => loginWithRedirect({ })}>
          Register
        </Button>
        <Button onClick={() => loginWithRedirect()}>Login</Button>
      </Paper>
    </Container>
  );
}

export default Landing;
