import AuthShell from "../components/auth/AuthShell";
import LoginForm from "../components/auth/LoginForm";

export default function Login() {
  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to your PDFNova account. All PDF tools remain available without signing in."
    >
      <LoginForm />
    </AuthShell>
  );
}
