const TERMINAL_STATUSES = new Set(['collected', 'picked up', 'expired', 'cancelled']);

export const isTerminalRequestStatus = (status) => TERMINAL_STATUSES.has(status);

export const shouldMarkRequestAsExpired = (status) => {
  if (!status) return false;

  return status === 'pending' || status === 'accepted';
};

export const isRequestVisibleToReceiver = (request, receiverId) => {
  if (!request) return false;

  if (request.status === 'pending') return true;

  if (request.status === 'accepted') {
    if (!receiverId) return false;
    return request.acceptedBy?.toString() === receiverId.toString();
  }

  return false;
};
