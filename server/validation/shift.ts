import { isValid, parseISO } from "date-fns";
import { ValidationError } from "./validation-error";
import { NewShift } from "../../shared/model/shift";

export function validateNewShift(
  item: Partial<NewShift>
): [ValidationError<NewShift>[], NewShift | undefined] {
  let res: ValidationError<NewShift>[] = [];

  if (!item.date || !isValid(parseISO(item.date)))
    res.push({
      error: "invalid date",
      fieldName: "date",
    });

  if (!item.event || item.event.trim() === "")
    res.push({
      error: "missing event name",
      fieldName: "event",
    });

  if (!(item.role == "AFA" || item.role == "CRU" || item.role == "EAC"))
    res.push({
      error: "invalid role",
      fieldName: "role",
    });

  if (typeof item.duration != "number" || !Number.isFinite(item.duration))
    res.push({
      error: "invalid duration",
      fieldName: "duration",
    });

  return [res, item as NewShift];
}
