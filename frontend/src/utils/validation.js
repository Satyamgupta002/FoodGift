// Email validation
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone number validation for Indian numbers (10 digits)
export const isValidPhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

// Get email error message
export const getEmailError = (email) => {
  if (!email) return '';
  if (!email.includes('@')) return 'Email must contain @';
  if (!email.includes('.')) return 'Email must contain a domain';
  if (!isValidEmail(email)) return 'Please enter a valid email address';
  return '';
};

// Get phone error message
export const getPhoneError = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length !== 10) return 'Phone number must be 10 digits';
  if (!isValidPhone(phone)) return 'Phone number should start with 6-9 and have 10 digits';
  return '';
};
