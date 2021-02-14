import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import { Grid, Typography } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import Nav from "../nav";
import ShiftCard from "./shift-card";
import { ShiftSummary } from "../model/shift";

function Home() {
  const [shifts, setShifts] = useState<ShiftSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    setIsLoading(true);

    async function loadData() {
      const token = await getAccessTokenSilently({
        audience: "https://tr-toolbox.me.uk/your-portfolio",
      });
      const uri = "/api/RecentShifts";

      const response = await fetch(uri, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const newShifts = (await response.json()) as ShiftSummary[];

        setShifts(newShifts);
      }

      setIsLoading(false);
    }

    loadData();
  }, [getAccessTokenSilently]);

  const shiftCards = shifts
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((s) => (
      <Grid item key={s.id} xs={6} sm={6} lg={3}>
        <ShiftCard shift={s} />
      </Grid>
    ));

  return (
    <Nav>
      <Typography component="h2" variant="h5">
        Recent Shifts
      </Typography>
      <Grid container spacing={2}>
        {shiftCards}
      </Grid>
    </Nav>
  );
}

export default withAuthenticationRequired(Home);
