export const PASSWORD_POLICY_MESSAGE =
  "Password minimal 8 karakter dan harus mengandung huruf besar, huruf kecil, angka, serta simbol.";

export const PASSWORD_POLICY_HINT =
  "Gunakan minimal 8 karakter dengan kombinasi huruf besar, huruf kecil, angka, dan simbol.";

const passwordPolicyRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export function validatePasswordStrength(password: string) {
  return passwordPolicyRegex.test(password);
}
