export const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value).trim());
export const isPhone = (value) => {
  const digits = String(value).replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
};

export function validateSignup(values) {
  const errors = {};
  if (!values.first_name?.trim()) errors.first_name = 'Enter your first name.';
  if (!values.last_name?.trim()) errors.last_name = 'Enter your last name.';
  if (!isEmail(values.email || '')) errors.email = 'Enter an email address like name@example.com.';
  if ((values.password || '').length < 8) errors.password = 'Use at least 8 characters.';
  if (values.phone_number && !isPhone(values.phone_number)) errors.phone_number = 'Enter a phone number with 7 to 15 digits.';
  return errors;
}
