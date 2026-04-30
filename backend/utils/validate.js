import ApiError from './ApiError.js';

const validate = (schema, data) => {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw ApiError.badRequest(result.error.issues[0].message);
  }
  return result.data;
};

export default validate;
