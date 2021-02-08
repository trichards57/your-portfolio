import { useAuth0 } from "@auth0/auth0-react";
import {
  Button,
  Container,
  Grid,
  makeStyles,
  Paper,
  Typography,
} from "@material-ui/core";
import React from "react";

const useStyles = makeStyles((theme) => ({
  container: {
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundImage: "url(/splash-photo.jpg)",
    backgroundSize: "cover",
  },
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  summary: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
}));

// Photo by Jan Kahánek on Unsplash

function Landing() {
  const classes = useStyles();
  const { loginWithRedirect } = useAuth0();

  return (
    <Container className={classes.container} component="main">
      <Paper className={classes.paper}>
        <Typography component="h1" variant="h5">
          Your Portfolio
        </Typography>
        <Typography className={classes.summary} component="p" variant="body1">
          Track your portfolio as you work.
        </Typography>
        <Grid container spacing={3} alignItems="center" justify="center">
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              onClick={() => loginWithRedirect()}
            >
              Login
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="secondary"
              onClick={() =>
                loginWithRedirect({
                  screen_hint: "signup",
                })
              }
            >
              Register
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}

export default Landing;
