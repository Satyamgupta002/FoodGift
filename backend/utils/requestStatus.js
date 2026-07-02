const TERMINAL_STATUSES = new Set(['accepted', 'collected', 'picked up', 'expired', 'cancelled']);

export const isTerminalRequestStatus = (status) => TERMINAL_STATUSES.has(status);

export const shouldMarkRequestAsExpired = (status) => {
  if (!status) return false;

  return status === 'pending' || status === 'accepted';
};
