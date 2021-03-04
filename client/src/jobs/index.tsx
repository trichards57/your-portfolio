import {
  Button,
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
import Nav from "../nav";
import { JobSummary } from "../model/job";

function Jobs() {
  const routerLocation = useLocation();
  const shiftId = new URLSearchParams(routerLocation.search).get("shiftId");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState(false);

  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    setIsLoading(true);

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
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Job Number</TableCell>
              <TableCell>Age</TableCell>
              <TableCell>Gender</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Marked for Reflection</TableCell>
              <TableCell>Reflection Written</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {jobs.map((j, i) => (
              <TableRow>
                <TableCell>{i + 1}</TableCell>
                <TableCell>{j.age ?? ""}</TableCell>
                <TableCell>{j.gender ?? ""}</TableCell>
                <TableCell>Cat {j.category}</TableCell>
                <TableCell>{j.reflectionFlag && <TickIcon />}</TableCell>
                <TableCell />
                <TableCell>
                  <Button startIcon={<EditIcon />}>Edit</Button>
                  <Button startIcon={<ReflectionIcon />}>Reflection</Button>
                  <Button startIcon={<DeleteIcon />}>Delete</Button>
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
