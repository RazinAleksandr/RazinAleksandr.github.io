# Search verification and public page views

The production site is served at `https://razinaleksandr.github.io/`.
Only `main` deploys. The deployment cleans files absent from the new build,
including the retired `/next/` directory. No preview site is generated.
The existing `gh-pages` publishing branch remains in use.

## Google Search Console and Bing Webmaster Tools

The site includes production canonical URLs, matching Open Graph URLs,
ProfilePage/Person JSON-LD on the home page, a sitemap and a permissive robots.txt.
The CV remains a PDF. No HTML CV was added.

1. In [Search Console](https://search.google.com/search-console), add a URL-prefix
   property for `https://razinaleksandr.github.io/`. Choose HTML-tag verification
   and copy only the `content` value into the GitHub Actions repository variable
   `GOOGLE_SITE_VERIFICATION`.
2. In [Bing Webmaster Tools](https://www.bing.com/webmasters/), add the site and
   choose meta-tag verification. Put the `msvalidate.01` content value in the
   repository variable `BING_SITE_VERIFICATION`. Alternatively, use Bing's
   supported import from an already verified Search Console account.
3. Publish the changes through `main`, then finish verification in the services.
4. Submit `https://razinaleksandr.github.io/sitemap-index.xml` and inspect `/`
   and `/cv/`. Request indexing if appropriate. Verify that `/next/` now returns
   404 after deployment; old search results can take time to disappear.

Variables are configured in repository Settings → Secrets and variables →
Actions → Variables. These verification values are public HTML tokens, not API keys.
Only the account owner can obtain them and inspect the private indexing reports;
adding the integration does not itself verify the site or request indexing.

## Page-view badge

The badge appears at the bottom right of the portrait when a valid snapshot is
available. It shows **total site page views**, like the reference site's `/*`
counter, not unique visitors and not views of the currently open page alone.

The source is the existing GA4 property used by measurement ID `G-QX68KTT819`.
The reporting API needs the separate, numeric **property ID**; the measurement
ID cannot be substituted for it.

1. Enable the Google Analytics Data API in a Google Cloud project and create a
   service account. Give its email **Viewer** access to the correct GA4 property.
2. Put its JSON credential into the GitHub Actions repository **secret**
   `GA_SERVICE_ACCOUNT_JSON`. Do not commit or paste the credential into chat.
3. Set the repository **variable** `GA_PROPERTY_ID` to the numeric property ID.
   Optionally set `GA_START_DATE` (`YYYY-MM-DD`); the default is `2020-01-01`.
4. Deploy `main` or manually run the Deploy site workflow on `main`.

The job fetches `screenPageViews` for the production hostname, excluding
historical `/next` and `/next/*` traffic, from the configured start date through
today. It includes the other production paths on the same hostname. GA-blocked
visits and traffic before GA4 collection began are not recoverable by this API;
the result is recorded GA4 views, not an exact historical count of every visit.

Only `{ total, startDate, updatedAt }` is published as `/views.json`. The badge is
rendered into HTML during the build. No client receives credentials or calls the
Analytics reporting API. Counts update on deployment and the daily workflow,
subject to GitHub scheduling and GA reporting delays; they are not real-time.

If GA is unconfigured or unavailable, the job preserves a valid last published
snapshot with its original timestamp. With no valid snapshot the badge is hidden.
No synthetic starting value or third-party counter is used. `public/views.json`
is generated and ignored by Git.

Local authenticated refresh: `node scripts/update-pageviews.mjs`, with the same
environment variables, then `npm run build`. Keep credentials outside the repo.

Official references:

- [Analytics API setup](https://developers.google.com/analytics/devguides/reporting/data/v1/quickstart)
- [runReport](https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/properties/runReport)
- [Metric definitions](https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema)
- [ProfilePage markup](https://developers.google.com/search/docs/appearance/structured-data/profile-page)
