export async function paginate(model, pagination, options = {}) {
  const { page = 1, limit = 10 } = pagination;

  const safeLimit = Math.min(limit, 50);
  const offset = (page - 1) * safeLimit;

  const { rows, count } = await model.findAndCountAll({
    ...options,
    limit: safeLimit,
    offset,
  });

  return {
    data: rows,
    meta: {
      total: count,
      page,
      lastPage: Math.ceil(count / safeLimit),
    },
  };
}
