export const ZONE_LABEL: Record<string, string> = {
  "America/New_York": "Eastern Time",
  "America/Chicago": "Central Time",
  "America/Denver": "Mountain Time",
  "America/Phoenix": "Arizona Time",
  "America/Los_Angeles": "Pacific Time",
  "America/Anchorage": "Alaska Time",
  "Pacific/Honolulu": "Hawaii-Aleutian Time",
};

export const STATES_BY_TZ: Record<string, string[]> = {
  "America/New_York": [
    "CT",
    "DC",
    "DE",
    "FL",
    "GA",
    "IN",
    "KY",
    "ME",
    "MD",
    "MA",
    "MI",
    "NH",
    "NJ",
    "NY",
    "NC",
    "OH",
    "PA",
    "RI",
    "SC",
    "VT",
    "VA",
    "WV",
  ],

  "America/Chicago": [
    "AL",
    "AR",
    "IL",
    "IA",
    "KS",
    "LA",
    "MN",
    "MS",
    "MO",
    "NE",
    "ND",
    "OK",
    "SD",
    "TN",
    "TX",
    "WI",
  ],

  "America/Denver": ["CO", "ID", "MT", "NM", "UT", "WY"],

  "America/Phoenix": ["AZ"],

  "America/Los_Angeles": ["CA", "NV", "OR", "WA"],

  "America/Anchorage": ["AK"],

  "Pacific/Honolulu": ["HI"],
};
