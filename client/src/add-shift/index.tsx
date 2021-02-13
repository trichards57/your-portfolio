import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import {
  Button,
  FormControl,
  Grid,
  InputLabel,
  makeStyles,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@material-ui/core";
import { Save as SaveIcon } from "@material-ui/icons";
import React from "react";
import { useHistory } from "react-router-dom";
import Nav from "../nav";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(4),
  },
  item: {
    width: "100%",
  },
}));

function AddShift() {
  const classes = useStyles();
  const history = useHistory();

  const { getAccessTokenSilently } = useAuth0();

  async function submit() {
    const token = await getAccessTokenSilently();
    const uri = "/api/LogShift";

    const response = await fetch(uri, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method: "POST",
    });

    if (response.ok) {
      history.push("/");
    }
  }

  return (
    <Nav>
      <Paper className={classes.root}>
        <Typography component="h2" variant="h5" gutterBottom>
          Add Shift
        </Typography>
        <form>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={8} md={3} lg={2}>
              <TextField
                label="Date"
                type="date"
                InputLabelProps={{
                  shrink: true,
                }}
                className={classes.item}
              />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <TextField
                label="Duration"
                type="number"
                className={classes.item}
              />
            </Grid>
            <Grid item xs={12} md={7} lg={8}>
              <TextField label="Event" className={classes.item} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Location" className={classes.item} />
            </Grid>
            <Grid item xs={12} md={4} lg={2}>
              <FormControl className={classes.item}>
                <InputLabel id="role-label">Role</InputLabel>
                <Select labelId="role-label">
                  <MenuItem value="EAC">EAC</MenuItem>
                  <MenuItem value="AFA">AFA</MenuItem>
                  <MenuItem value="CRU">CRU</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={8} lg={10}>
              <TextField label="Crew Mate" className={classes.item} />
            </Grid>
            <Grid container item xs={12} justify="flex-end">
              <Grid item>
                <Button
                  startIcon={<SaveIcon />}
                  color="primary"
                  variant="contained"
                  onClick={submit}
                >
                  Save
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Nav>
  );
}

export default withAuthenticationRequired(AddShift);
