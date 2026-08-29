const generateId = (prefix, number) => {
  return prefix + String(number).padStart(3, '0');
};

const getNextSequence = async (model, prefix, field) => {
  const lastDoc = await model.findOne().sort({ [field]: -1 }).select(field);
  if (!lastDoc || !lastDoc[field]) return generateId(prefix, 1);
  const num = parseInt(lastDoc[field].replace(prefix, ''), 10) + 1;
  return generateId(prefix, num);
};

const paginate = (page = 1, limit = 10) => {
  const p = Math.max(1, parseInt(page));
  const l = Math.max(1, parseInt(limit));
  return {
    skip: (p - 1) * l,
    limit: l,
    page: p
  };
};

const buildFilter = (query, allowedFields) => {
  const filter = {};
  for (const key of allowedFields) {
    if (query[key] !== undefined) {
      filter[key] = query[key];
    }
  }
  return filter;
};

module.exports = { generateId, getNextSequence, paginate, buildFilter };
