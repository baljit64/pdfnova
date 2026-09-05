import AuthShell from "../../components/auth/AuthShell";
import PasswordRecoveryForm from "../../components/auth/PasswordRecoveryForm";

export const metadata = { title: "Forgot password | PDFNova", robots: { index: false, follow: false } };

export default function ForgotPasswordPage() {
  return <AuthShell title="Forgot password?" description="We'll email you a link to reset your password.">
    <PasswordRecoveryForm />
  </AuthShell>;
}
