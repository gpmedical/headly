const svgDataUri = (svg: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

export const images = {
  logo: require("../../assets/images/logo.png"),
  onboarding: require("../../assets/images/onboarding.png"),
  onboardingTrack: require("../../assets/images/onboarding-track.png"),
  onboardingInsights: require("../../assets/images/onboarding-insights.png"),
  onboardingReminders: require("../../assets/images/onboarding-reminders.png"),
  onboardingExport: require("../../assets/images/onboarding-export.png"),
  googleLogo: {
    uri: svgDataUri(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>`,
    ),
  },
  appleLogo: {
    uri: svgDataUri(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#000000" d="M16.04 1.86c.08 1.16-.34 2.29-1.12 3.12-.81.87-2.15 1.53-3.25 1.44-.12-1.12.38-2.31 1.12-3.1.82-.88 2.23-1.55 3.25-1.46z"/><path fill="#000000" d="M20.4 17.25c-.55 1.25-.82 1.8-1.52 2.9-.99 1.54-2.39 3.46-4.12 3.48-1.54.02-1.94-1.02-4.03-1-2.08.01-2.52 1.03-4.06 1.01-1.73-.02-3.05-1.75-4.04-3.29-2.77-4.3-3.06-9.35-1.35-12.03 1.22-1.91 3.14-3.03 4.95-3.03 1.84 0 3 1.02 4.52 1.02 1.47 0 2.37-1.02 4.5-1.02 1.61 0 3.31.88 4.52 2.4-3.97 2.18-3.33 7.84.63 9.56z"/></svg>`,
    ),
  },
  envelopeIcon: {
    uri: svgDataUri(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><rect x="3.6" y="5.8" width="16.8" height="12.4" rx="1.9" stroke="#667085" stroke-width="1.8"/><path d="M4.8 7.6 12 12.8l7.2-5.2" stroke="#667085" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    ),
  },
  lockIcon: {
    uri: svgDataUri(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><rect x="5.2" y="10.4" width="13.6" height="9.2" rx="1.9" stroke="#667085" stroke-width="1.8"/><path d="M8.2 10.4V8.1a3.8 3.8 0 0 1 7.6 0v2.3" stroke="#667085" stroke-width="1.8" stroke-linecap="round"/><path d="M12 14.1v2" stroke="#667085" stroke-width="1.8" stroke-linecap="round"/></svg>`,
    ),
  },
  eyeIcon: {
    uri: svgDataUri(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M2.9 12s3.3-5.7 9.1-5.7 9.1 5.7 9.1 5.7-3.3 5.7-9.1 5.7S2.9 12 2.9 12Z" stroke="#667085" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="2.7" stroke="#667085" stroke-width="1.8"/></svg>`,
    ),
  },
  eyeSlashIcon: {
    uri: svgDataUri(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="M9.6 5.1c.75-.2 1.55-.3 2.4-.3 5.75 0 9.1 5.7 9.1 5.7a16 16 0 0 1-2.5 3.2" stroke="#667085" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M14.1 14.2a2.7 2.7 0 0 1-3.8-3.8" stroke="#667085" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.55 6.65A16 16 0 0 0 2.9 10.5s3.35 5.7 9.1 5.7c1.45 0 2.75-.35 3.88-.9" stroke="#667085" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="m4.2 3.8 15.6 15.6" stroke="#667085" stroke-width="1.8" stroke-linecap="round"/></svg>`,
    ),
  },
  shieldCheckIcon: {
    uri: svgDataUri(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 32" fill="none"><path d="M14 2.9 24 7.1v7.35c0 6.1-4.1 11.9-10 14.55C8.1 26.35 4 20.55 4 14.45V7.1l10-4.2Z" stroke="#0EA5A4" stroke-width="2" stroke-linejoin="round"/><path d="m9.75 15.55 2.75 2.85 5.85-6.05" stroke="#0EA5A4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    ),
  },
  checkIcon: {
    uri: svgDataUri(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"><path d="m5.2 12.7 4.2 4.1 9.4-9.5" stroke="#0EA5A4" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    ),
  },
} as const;
