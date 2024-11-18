interface ValidationError {
  field: string;
  message: string;
}

export function validateRequiredFields(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>,
  requiredFields: string[],
) {
  const errors: ValidationError[] = [];

  requiredFields.forEach(field => {
    if (!data[field]) {
      errors.push({
        field,
        message: `${field} is required`,
      });
    }
  });

  return errors;
}
