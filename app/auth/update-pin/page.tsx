import { Suspense } from "react";
import UpdatePinForm from "@/components/UpdatePinForm";
import { redirect } from "next/navigation";

export default async function UpdatePinPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const code = searchParams.code as string | undefined;

  if (code) {
    // Redirect to callback to handle code exchange and cookie setting securely
    // This ensures the session is persisted to the browser before loading the form
    redirect(`/auth/callback?code=${code}&next=/auth/update-pin`);
  }

  return (
    <Suspense fallback={<div className="min-h-screen w-full bg-white dark:bg-black" />}>
      <UpdatePinForm />
    </Suspense>
  );
}