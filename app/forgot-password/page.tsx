import { ForgotForm } from "@/components/auth/Forms";

export const metadata = { title: "Forgot password", robots: { index: false, follow: false } };

export default function ForgotPassword() {
  return (
    <div className="wrap py-10 md:py-14">
      <ForgotForm />
    </div>
  );
}
