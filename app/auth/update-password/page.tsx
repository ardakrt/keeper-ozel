import { Suspense } from "react";
import ResetPasswordForm from "@/components/ResetPasswordForm";
import { redirect } from "next/navigation";

export default async function UpdatePasswordPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const code = searchParams.code as string | undefined;

  if (code) {
    // Redirect to callback to handle code exchange and cookie setting securely
    redirect(`/auth/callback?code=${code}&next=/auth/update-password`);
  }

  return (
    <div className="min-h-screen w-full relative bg-white dark:bg-black overflow-hidden flex items-center justify-center p-4">
      {/* Light Mode Background */}
      <div
        className="absolute inset-0 z-0 dark:hidden"
        style={{
          backgroundImage: "radial-gradient(125% 125% at 50% 90%, #ffffff 40%, #10b981 100%)",
          backgroundSize: "100% 100%",
        }}
      />
      {/* Dark Mode Background */}
      <div
        className="absolute inset-0 z-0 hidden dark:block"
        style={{
          background: "radial-gradient(150% 150% at 50% 100%, #000000 40%, #299690ff 100%)"
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        <Suspense fallback={<div className="w-full h-96 bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-3xl animate-pulse" />}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}