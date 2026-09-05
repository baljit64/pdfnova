export interface SignupValues {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginValues {
  email: string;
  password: string;
}

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value: string): string | null {
  return EMAIL_PATTERN.test(value.trim())
    ? null
    : "Enter a valid email address.";
}

export function validatePassword(value: string, minimum = 8): string | null {
  return value.length >= minimum ? null : `Use at least ${minimum} characters.`;
}

export function validateSignup(
  values: SignupValues
): FieldErrors<SignupValues> {
  const errors: FieldErrors<SignupValues> = {};

  if (!values.fullName.trim()) errors.fullName = "Enter your full name.";

  const emailError = validateEmail(values.email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePassword(values.password);
  if (passwordError) errors.password = passwordError;

  if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}

export function validateLogin(values: LoginValues): FieldErrors<LoginValues> {
  const errors: FieldErrors<LoginValues> = {};

  const emailError = validateEmail(values.email);
  if (emailError) errors.email = emailError;
  if (!values.password) errors.password = "Enter your password.";

  return errors;
}
