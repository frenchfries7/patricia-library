const env = import.meta.env;

const need = (key) => {
  if (!env[key]) console.error(`Missing environment variable: ${key}`);
  return env[key] || "";
};

const BASE = need("VITE_API_BASE_URL");
const url = (key) => `${BASE}${need(key)}`;

export const STORAGE = {
  token: need("VITE_TOKEN_STORAGE_KEY"),
  user: need("VITE_USER_STORAGE_KEY"),
};

export const ENDPOINTS = {
  members: url("VITE_API_MEMBERS"),
  membersSearch: url("VITE_API_MEMBERS_SEARCH"),
  membersCreate: url("VITE_API_CREATE"),
  membersUpdate: url("VITE_API_UPDATE"),

  // Authentication
  login: url("VITE_API_LOGIN"),

  // Library Services
  services: url("VITE_API_SERVICES"),

  login: url("VITE_API_LOGIN"),
  services: url("VITE_API_SERVICES"),
  members: url("VITE_API_MEMBERS"),
  membersSearch: url("VITE_API_MEMBERS_SEARCH"),
  timeIn: url("VITE_API_ATTENDANCE_TIMEIN"),
  timeOut: url("VITE_API_ATTENDANCE_TIMEOUT"),
  attendanceToday: url("VITE_API_ATTENDANCE_TODAY"),
  attendanceSummary: url("VITE_API_ATTENDANCE_SUMMARY"),
  attendanceReport: url("VITE_API_ATTENDANCE_REPORT"),
};
