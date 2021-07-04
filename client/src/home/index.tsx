import { Grid, Typography, Button } from "@material-ui/core";
import React, { ReactNode, useState } from "react";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import { Alert, Pagination } from "@material-ui/lab";
import Nav from "../nav";
import ShiftCard from "../shared/shift-card";
import { ShiftSummary } from "../model/shift";
import useSharedStyles from "../shared/shared-styles";
import useLoadedArrayData from "../shared/load-array-data";
import { ServerAudience } from "../shared/constants";

const PAGE_SIZE = 6;

interface HomeParams {
  all?: boolean;
}

export function HomeBase({ all }: HomeParams) {
  const sharedClasses = useSharedStyles();
  const [currentPage, setCurrentPage] = useState(0);

  const getUri = all
    ? `/api/GetAllShifts?count=${PAGE_SIZE}&page=${currentPage}`
    : "/api/RecentShifts";

  const deleteUri = "/api/DeleteShift";

  const {
    data: shifts,
    errorLoading,
    isLoading,
    totalItems: totalShifts,
    deleteItem,
    showUndelete,
    removeUndelete,
    reloadData,
  } = useLoadedArrayData<ShiftSummary>(getUri, deleteUri);

  const { getAccessTokenSilently } = useAuth0();

  async function undelete(id: string) {
    if (!id) return;

    const token = await getAccessTokenSilently({
      audience: ServerAudience,
    });
    const uri = `/api/UndeleteShift?id=${id}`;

    const response = await fetch(uri, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method: "POST",
    });

    if (response.ok) {
      reloadData();
      removeUndelete(id);
    }
  }

  let content: ReactNode;
  let undeleteHeader: ReactNode;

  if (isLoading) {
    content = [{}, {}, {}, {}].map((s, i) => (
      // eslint-disable-next-line react/no-array-index-key
      <Grid item key={i} xs={6} sm={6} lg={3}>
        <ShiftCard />
      </Grid>
    ));
  } else if (errorLoading || !shifts)
    content = (
      <Alert severity="error" className={sharedClasses.alert}>
        There was a problem speaking to the server. Try refreshing, or come back
        a little later.
      </Alert>
    );
  else {
    content = shifts
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((s) => (
        <Grid item key={s.id} xs={6} sm={6} lg={3}>
          <ShiftCard shift={s} deleteClicked={deleteItem} />
        </Grid>
      ));
    if (showUndelete && showUndelete.length > 0) {
      undeleteHeader = showUndelete
        .sort((a, b) => a.localeCompare(b))
        .map((s) => (
          <Alert
            severity="success"
            className={sharedClasses.alert}
            action={
              <Button color="inherit" size="small" onClick={() => undelete(s)}>
                UNDO
              </Button>
            }
            onClose={() => removeUndelete(s)}
          >
            Shift successfully deleted.
          </Alert>
        ));
    }
  }

  return (
    <Nav>
      <Typography component="h2" variant="h5">
        {all ? "Shifts" : "Recent Shifts"}
      </Typography>
      {undeleteHeader}
      <Grid container spacing={2}>
        {content}
        {!isLoading && all && totalShifts && totalShifts > PAGE_SIZE && (
          <Grid item xs={12}>
            <Pagination
              count={Math.ceil(totalShifts / PAGE_SIZE)}
              page={currentPage + 1}
              onChange={(_, v) => setCurrentPage(v - 1)}
            />
          </Grid>
        )}
      </Grid>
    </Nav>
  );
}

export default withAuthenticationRequired(HomeBase);
