import { GoogleAuth } from "google-auth-library";
import { writeFile } from "node:fs/promises";

const output = new URL("../public/views.json", import.meta.url);
const site = "https://razinaleksandr.github.io";
const property = process.env.GA_PROPERTY_ID;
const credentials = process.env.GA_SERVICE_ACCOUNT_JSON;
const keyFile = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const strict = process.argv.includes("--strict");
const startDate = process.env.GA_START_DATE || "2020-01-01";

// Keep the last published snapshot when GA is temporarily unavailable.
try {
  const response = await fetch(`${site}/views.json`, { signal: AbortSignal.timeout(10000) });
  if (response.ok) {
    const data = await response.json();
    if (Number.isSafeInteger(data.total) && data.total >= 0
      && typeof data.updatedAt === "string" && Number.isFinite(Date.parse(data.updatedAt))
      && typeof data.startDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(data.startDate)) {
      await writeFile(output, JSON.stringify({ total: data.total, updatedAt: data.updatedAt, startDate: data.startDate }) + "\n");
    }
  }
} catch {
  console.warn("[views] Previous snapshot unavailable.");
}

if (!property || (!credentials && !keyFile)) {
  console.log("[views] GA not configured; retaining any previous snapshot. Otherwise the counter is hidden.");
  process.exit(strict ? 1 : 0);
}

try {
  if (!/^\d+$/.test(property)) throw new Error("Invalid property ID");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) throw new Error("Invalid start date");
  const auth = new GoogleAuth({
    ...(credentials ? { credentials: JSON.parse(credentials) } : { keyFilename: keyFile }),
    scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
  });
  const client = await auth.getClient();
  const { data } = await client.request({
    url: `https://analyticsdata.googleapis.com/v1beta/properties/${property}:runReport`,
    method: "POST",
    timeout: 30000,
    data: {
      dateRanges: [{ startDate, endDate: "today" }],
      metrics: [{ name: "screenPageViews" }],
      dimensionFilter: {
        andGroup: { expressions: [
          { filter: { fieldName: "hostName", stringFilter: { matchType: "EXACT", value: new URL(site).hostname } } },
          { notExpression: { filter: { fieldName: "pagePath", stringFilter: { matchType: "FULL_REGEXP", value: "/next(/.*)?" } } } },
        ] },
      },
    },
  });
  if (data.metricHeaders?.[0]?.name !== "screenPageViews") throw new Error("Unexpected report");
  const raw = data.rows?.length ? data.rows[0]?.metricValues?.[0]?.value : "0";
  if (typeof raw !== "string" || !/^\d+$/.test(raw)) throw new Error("Missing count");
  const total = Number(raw);
  if (!Number.isSafeInteger(total)) throw new Error("Invalid count");
  await writeFile(output, JSON.stringify({ total, startDate, updatedAt: new Date().toISOString() }) + "\n");
  console.log(`[views] Updated: ${total} site page views.`);
} catch {
  // Auth errors may carry credential-bearing request details: never log them.
  console.warn("[views] GA report unavailable. Check property ID, service-account access and Data API configuration; retaining any previous snapshot.");
  if (strict) process.exitCode = 1;
}
