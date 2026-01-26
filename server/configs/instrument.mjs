import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "https://1df2e9ac65633579e624961d6a83f0fe@o4510778196557824.ingest.us.sentry.io/4510778201866240",
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
});
