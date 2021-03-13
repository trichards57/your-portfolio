import {
  Button,
  Hidden,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@material-ui/core";
import React from "react";
import { withAuthenticationRequired } from "@auth0/auth0-react";
import { Link, useLocation } from "react-router-dom";
import {
  CheckCircleOutlined as TickIcon,
  Delete as DeleteIcon,
  Create as EditIcon,
  Assignment as ReflectionIcon,
} from "@material-ui/icons";
import { Alert, Skeleton } from "@material-ui/lab";
import Nav from "../nav";
import { JobSummary } from "../model/job";
import useSharedStyles from "../shared/shared-styles";
import useLoadedData from "../shared/load-data";

function GridHeader() {
  return (
    <TableHead>
      <TableRow>
        <TableCell>Job Number</TableCell>
        <TableCell>Age</TableCell>
        <TableCell>Gender</TableCell>
        <Hidden smDown>
          <TableCell>Category</TableCell>
        </Hidden>
        <Hidden mdDown>
          <TableCell>Marked for Reflection</TableCell>
          <TableCell>Reflection Written</TableCell>
        </Hidden>
        <TableCell />
      </TableRow>
    </TableHead>
  );
}

function GridRow(props: { i?: number; job?: JobSummary }) {
  const { job, i } = props;
  if (!job) {
    return (
      <TableRow>
        <TableCell>
          <Skeleton />
        </TableCell>
        <TableCell>
          <Skeleton />
        </TableCell>
        <TableCell>
          <Skeleton />
        </TableCell>
        <Hidden smDown>
          <TableCell>
            <Skeleton />
          </TableCell>
        </Hidden>
        <Hidden mdDown>
          <TableCell>
            <Skeleton />
          </TableCell>
          <TableCell>
            <Skeleton />
          </TableCell>
        </Hidden>
        <TableCell />
      </TableRow>
    );
  }

  return (
    <TableRow>
      <TableCell>{i}</TableCell>
      <TableCell>{job.age ?? ""}</TableCell>
      <TableCell>{job.gender ?? ""}</TableCell>
      <Hidden smDown>
        <TableCell>Cat {job.category}</TableCell>
      </Hidden>
      <Hidden mdDown>
        <TableCell>{job.reflectionFlag && <TickIcon />}</TableCell>
        <TableCell />
      </Hidden>
      <TableCell>
        <Hidden mdDown>
          <Button startIcon={<EditIcon />}>Edit</Button>
          <Button startIcon={<ReflectionIcon />}>Reflection</Button>
          <Button startIcon={<DeleteIcon />}>Delete</Button>
        </Hidden>
        <Hidden lgUp>
          <IconButton
            aria-label="edit"
            component={Link}
            to={`/editJob?shift=${job.id}`}
          >
            <EditIcon />
          </IconButton>
          <IconButton aria-label="reflection">
            <ReflectionIcon />
          </IconButton>
          <IconButton aria-label="delete">
            <DeleteIcon />
          </IconButton>
        </Hidden>
      </TableCell>
    </TableRow>
  );
}

export function JobsBase() {
  const sharedClasses = useSharedStyles();
  const routerLocation = useLocation();
  const shiftId = new URLSearchParams(routerLocation.search).get("shiftId");

  const { data: jobs, errorLoading, isLoading } = useLoadedData<JobSummary[]>(
    `/api/GetJobs?shiftId=${shiftId}`
  );

  return (
    <Nav>
      <Typography component="h2" variant="h5">
        Jobs
      </Typography>
      {errorLoading && (
        <Alert severity="error" className={sharedClasses.alert}>
          There was a problem speaking to the server. Try refreshing, or come
          back a little later.
        </Alert>
      )}
      <TableContainer component={Paper}>
        <Table>
          <GridHeader />
          <TableBody>
            {isLoading && (
              <>
                <GridRow />
                <GridRow />
                <GridRow />
              </>
            )}
            {!isLoading &&
              !errorLoading &&
              jobs &&
              jobs.map((j, i) => <GridRow job={j} key={j.id} i={i + 1} />)}
          </TableBody>
        </Table>
      </TableContainer>
    </Nav>
  );
}

export default withAuthenticationRequired(JobsBase);
