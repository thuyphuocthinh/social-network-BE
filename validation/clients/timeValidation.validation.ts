import { Request } from "express";
import { isDate } from "util/types";

export const timeValidation = (req: Request, fields: string[]) => {
  let isValid: Boolean = true;
  const invalidFields: string[] = [];
  for (const field of fields) {
    const date = new Date(req.body[field]);
    if (!isDate(date)) {
      isValid = false;
      invalidFields.push(field);
    }
  }
  return {
    isValid,
    invalidFieldsString: invalidFields.join(", "),
  };
};
