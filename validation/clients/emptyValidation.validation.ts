import { Request } from "express";

export const emptyValidation = (req: Request, fields: string[]) => {
  let isValid: Boolean = true;
  const invalidFields: string[] = [];
  for (const field of fields) {
    if (!req.body[field]) {
      isValid = false;
      invalidFields.push(field);
    }
  }
  return {
    isValid,
    invalidFieldsString: invalidFields.join(", "),
  };
};
