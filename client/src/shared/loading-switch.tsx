import { FormControlLabel, Switch, SwitchProps } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import React from "react";
import useSharedStyles from "./shared-styles";

function LoadingSwitch(
  props: SwitchProps & { isLoading?: boolean; label: string }
) {
  const { isLoading, label, ...rest } = props;
  const sharedClasses = useSharedStyles();

  if (isLoading) return <Skeleton className={sharedClasses.formItemSkeleton} />;

  return <FormControlLabel control={<Switch {...rest} />} label={label} />;
}

export default LoadingSwitch;
