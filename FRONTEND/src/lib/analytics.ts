import posthog from "posthog-js";

// The five steps of the acquisition funnel. Keep this list small: an event that
// nobody reads is just noise in the dashboard.
export type AnalyticsEvent =
  | "signup_started"
  | "signup_completed"
  | "cv_created"
  | "cv_downloaded"
  | "analysis_run"
  | "payment_submitted";

const key = import.meta.env.VITE_POSTHOG_KEY;
const enabled = Boolean(key);

export const initAnalytics = (): void => {
  if (!enabled) return;
  posthog.init(key, {
    api_host: import.meta.env.VITE_POSTHOG_HOST ?? "https://eu.i.posthog.com",
    person_profiles: "identified_only",
    capture_pageview: true,
  });
};

export const track = (event: AnalyticsEvent, properties?: Record<string, unknown>): void => {
  if (!enabled) return;
  posthog.capture(event, properties);
};

export const identifyUser = (userId: string): void => {
  if (!enabled) return;
  posthog.identify(userId);
};

export const resetAnalytics = (): void => {
  if (!enabled) return;
  posthog.reset();
};
