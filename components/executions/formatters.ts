export const formatDuration = (ms: number | null): string => {
  if (ms === null || ms === undefined) return "—";
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  const minutes = Math.floor(ms / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1000);
  return `${minutes}m ${seconds}s`;
};

export const isLiveStatus = (
  status: string,
): boolean => status === "RUNNING" || status === "PENDING";
