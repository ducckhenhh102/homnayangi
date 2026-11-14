export function validate(schema) {
  return (req, res, next) => {
    try {
      const s = schema.shape || schema;
      if (s.query) {
        req.query = s.query.parse(req.query);
      }
      if (s.body) {
        req.body = s.body.parse(req.body);
      }
      if (s.params) {
        req.params = s.params.parse(req.params);
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}
