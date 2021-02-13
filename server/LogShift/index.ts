import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { NewShift } from "../../shared/model/shift";
import { validateNewShift } from "../validation/shift";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  context.log("Received log shift request.");

  try {
    const incomingData = JSON.parse(req.body) as Partial<NewShift>;

    const [validationResult, validData] = validateNewShift(incomingData);

    if (validationResult.length > 0) {
      context.log("Incoming data failed validation.");
      context.res = {
        status: 400,
        body: JSON.stringify(validationResult),
      };
      return;
    }

    
  } catch (err) {
    context.log(err);
    context.res = {
      status: 400,
    };
    return;
  }

  const name = req.query.name || (req.body && req.body.name);
  const responseMessage = name
    ? "Hello, " + name + ". This HTTP triggered function executed successfully."
    : "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.";

  context.res = {
    // status: 200, /* Defaults to 200 */
    body: responseMessage,
  };
};

export default httpTrigger;
