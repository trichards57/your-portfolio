import {
  SelectProps,
  Select,
  InputLabel,
  FormControl,
} from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import React from "react";
import useSharedStyles from "./shared-styles";

function LoadingSelectField(props: SelectProps & { isLoading?: boolean }) {
  const {
    isLoading,
    required,
    variant,
    id,
    labelId,
    children,
    label,
    ...rest
  } = props;
  const sharedClasses = useSharedStyles();

  if (isLoading) return <Skeleton className={sharedClasses.formItemSkeleton} />;

  return (
    <FormControl
      className={sharedClasses.formItem}
      required={required}
      variant={variant}
    >
      <InputLabel htmlFor={id} id={labelId}>
        {label}
      </InputLabel>
      <Select id={id} labelId={labelId} {...rest}>
        {children}
      </Select>
    </FormControl>
  );
}

export default LoadingSelectField;
