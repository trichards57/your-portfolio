import { Grid, Typography } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import { Pagination } from "@material-ui/lab";
import LoadingCard from "../shared/loading-card";
import Nav from "../nav";
import ShiftCard from "../shared/shift-card";
import { ShiftSummary } from "../model/shift";

const PAGE_SIZE = 6;

function Shifts() {
  const [shifts, setShifts] = useState<ShiftSummary[][]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalShifts, setTotalShifts] = useState(0);

  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    setIsLoading(true);

    async function loadData() {
      const token = await getAccessTokenSilently({
        audience: "https://tr-toolbox.me.uk/your-portfolio",
      });
      const page = currentPage;
      const uri = `/api/GetAllShifts?count=${PAGE_SIZE}&page=${page}`;

      const response = await fetch(uri, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const newShifts = (await response.json()) as ShiftSummary[];

        setShifts((s) => {
          // eslint-disable-next-line no-param-reassign
          s[page] = newShifts;
          return s;
        });
        const totalCount = response.headers.get("x-total-count");
        if (totalCount) setTotalShifts(parseInt(totalCount, 10));
        else setTotalShifts(newShifts.length);
      }

      setIsLoading(false);
    }

    loadData();
  }, [getAccessTokenSilently, currentPage]);

  const shiftCards =
    shifts[currentPage] &&
    shifts[currentPage]
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((s) => (
        <Grid item key={s.id} xs={6} sm={6} lg={3}>
          <ShiftCard shift={s} />
        </Grid>
      ));

  const loadingCards = [{}, {}, {}, {}].map((s, i) => (
    // eslint-disable-next-line react/no-array-index-key
    <Grid item key={i} xs={6} sm={6} lg={3}>
      <LoadingCard />
    </Grid>
  ));

  return (
    <Nav>
      <Typography component="h2" variant="h5">
        Shifts
      </Typography>
      <Grid container spacing={2}>
        <>
          {isLoading ? loadingCards : shiftCards}
          {!isLoading && totalShifts > PAGE_SIZE && (
            <Grid item xs={12}>
              <Pagination
                count={Math.ceil(totalShifts / PAGE_SIZE)}
                page={currentPage + 1}
                onChange={(_, v) => setCurrentPage(v - 1)}
              />
            </Grid>
          )}
        </>
      </Grid>
    </Nav>
  );
}

export default withAuthenticationRequired(Shifts);
