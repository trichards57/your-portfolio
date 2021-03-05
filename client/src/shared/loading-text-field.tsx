import { TextField, TextFieldProps } from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import React from "react";
import useSharedStyles from "./shared-styles";

function LoadingTextField(props: TextFieldProps & { isLoading?: boolean }) {
  const { isLoading, ...rest } = props;
  const sharedClasses = useSharedStyles();

  if (isLoading) return <Skeleton className={sharedClasses.formItemSkeleton} />;

  return <TextField {...rest} />;
}

export default LoadingTextField;
