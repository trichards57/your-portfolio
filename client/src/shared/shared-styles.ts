import { makeStyles } from "@material-ui/core";

const useSharedStyles = makeStyles((theme) => ({
  alert: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  formItemSkeleton: {
    height: "72px",
  },
  formRoot: {
    padding: theme.spacing(4),
  },
  formItem: {
    width: "100%",
  },
}));

export default useSharedStyles;
