// Testing is done the month after the activity it covers, so a test reports
// under the month before its test date: tested in July → June's report.
// Mirrors reportPeriodFor in the backend's utils/schedule.ts.
export const reportPeriodFor = (testDate: Date): string => {
  const d = new Date(testDate.getFullYear(), testDate.getMonth() - 1, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

// The month currently being tested and reported on (last month).
export const currentReportPeriod = (): string => reportPeriodFor(new Date());
