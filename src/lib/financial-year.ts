// Shared helper for the company's financial year start month.
// Stored in localStorage so Settings and Calendar stay in sync without a backend.

const KEY = "fyStartMonth"; // 0 = January … 11 = December

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const getFYStartMonth = (): number => {
  if (typeof window === "undefined") return 0;
  const v = window.localStorage.getItem(KEY);
  const n = v === null ? 0 : parseInt(v, 10);
  return Number.isFinite(n) && n >= 0 && n <= 11 ? n : 0;
};

export const setFYStartMonth = (month: number) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, String(month));
  window.dispatchEvent(new CustomEvent("fy-start-changed", { detail: month }));
};
