export type PageViews = { total: number; updatedAt: string; startDate: string };

export function isPageViews(value: unknown): value is PageViews {
  if (!value || typeof value !== "object") return false;
  const data = value as PageViews;
  return Number.isSafeInteger(data.total) && data.total >= 0
    && typeof data.updatedAt === "string" && Number.isFinite(Date.parse(data.updatedAt))
    && typeof data.startDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(data.startDate);
}
