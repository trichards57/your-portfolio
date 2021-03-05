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
import React, { useEffect, useState } from "react";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import { useLocation } from "react-router-dom";
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

function Jobs() {
  const sharedClasses = useSharedStyles();
  const routerLocation = useLocation();
  const shiftId = new URLSearchParams(routerLocation.search).get("shiftId");
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorLoading, setErrorLoading] = useState(false);

  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    setIsLoading(true);
    setErrorLoading(false);

    async function loadData() {
      const token = await getAccessTokenSilently({
        audience: "https://tr-toolbox.me.uk/your-portfolio",
      });
      const uri = `/api/GetJobs?shiftId=${shiftId}`;

      const response = await fetch(uri, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const newJobs = (await response.json()) as JobSummary[];

        setJobs(newJobs);
      } else {
        setErrorLoading(true);
      }

      setIsLoading(false);
    }

    loadData();
  }, [getAccessTokenSilently, shiftId]);

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
          <TableBody>
            {isLoading && (
              <>
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
                  <TableCell>
                    <Skeleton />
                  </TableCell>
                  <TableCell>
                    <Skeleton />
                  </TableCell>
                  <TableCell>
                    <Skeleton />
                  </TableCell>
                  <TableCell />
                </TableRow>
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
                  <TableCell>
                    <Skeleton />
                  </TableCell>
                  <TableCell>
                    <Skeleton />
                  </TableCell>
                  <TableCell>
                    <Skeleton />
                  </TableCell>
                  <TableCell />
                </TableRow>
              </>
            )}
            {!isLoading &&
              !errorLoading &&
              jobs.map((j, i) => (
                <TableRow>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{j.age ?? ""}</TableCell>
                  <TableCell>{j.gender ?? ""}</TableCell>
                  <Hidden smDown>
                    <TableCell>Cat {j.category}</TableCell>
                  </Hidden>
                  <Hidden mdDown>
                    <TableCell>{j.reflectionFlag && <TickIcon />}</TableCell>
                    <TableCell />
                  </Hidden>
                  <TableCell>
                    <Hidden mdDown>
                      <Button startIcon={<EditIcon />}>Edit</Button>
                      <Button startIcon={<ReflectionIcon />}>Reflection</Button>
                      <Button startIcon={<DeleteIcon />}>Delete</Button>
                    </Hidden>
                    <Hidden lgUp>
                      <IconButton aria-label="Edit">
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
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Nav>
  );
}

export default withAuthenticationRequired(Jobs);
