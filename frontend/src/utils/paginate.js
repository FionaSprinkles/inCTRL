export function paginate(items, page, pageSize) {
  const list = Array.isArray(items) ? items : []
  const size = Math.max(1, Math.floor(Number(pageSize)) || 1)
  const total = list.length
  const pageCount = total === 0 ? 1 : Math.ceil(total / size)
  const current = Math.min(Math.max(1, Math.floor(Number(page)) || 1), pageCount)
  const start = (current - 1) * size

  return {
    page: current,
    pageCount,
    total,
    items: list.slice(start, start + size),
  }
}
