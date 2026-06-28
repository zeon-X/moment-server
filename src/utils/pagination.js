const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

export const getPaginationParams = (query) => {
  const page = Math.max(Number.parseInt(query.page, 10) || DEFAULT_PAGE, 1);
  const limit = Math.min(
    Math.max(Number.parseInt(query.limit, 10) || DEFAULT_LIMIT, 1),
    MAX_LIMIT,
  );

  return { page, limit };
};

export const getPaginationMeta = ({ page, limit, hasMore, itemCount }) => ({
  page,
  limit,
  itemCount,
  hasMore,
  nextPage: hasMore ? page + 1 : null,
});
