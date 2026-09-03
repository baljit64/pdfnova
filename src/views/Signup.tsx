import AuthShell from "../components/auth/AuthShell";
import SignupForm from "../components/auth/SignupForm";

export default function Signup() {
  return (
    <AuthShell
      title="Create your account"
      description="Sign up to keep your PDFNova activity connected to your account. All PDF tools remain available without signing in."
    >
      <SignupForm />
    </AuthShell>
  );
}
