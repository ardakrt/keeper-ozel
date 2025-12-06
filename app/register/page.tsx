"use client";

import RegisterForm from "@/components/RegisterForm";
import AuthContainer from "@/components/AuthContainer";
import { useState } from "react";

export default function Page() {
  const [step, setStep] = useState<"emailInput" | "detailsInput" | "verificationInput">("emailInput");
  const [backTrigger, setBackTrigger] = useState(0);

  const handleBackClick = () => {
    if (step === "detailsInput" || step === "verificationInput") {
      // RegisterForm'a geri dönmesi için sinyal gönder
      setBackTrigger(prev => prev + 1);
    } else if (step === "emailInput") {
      // İlk adımdaysa login sayfasına yönlendir
      window.location.href = "/login";
    }
  };

  return (
    <AuthContainer showBackButton={true} onBackClick={handleBackClick} hideTabs={true}>
      <RegisterForm onStepChange={setStep} backTrigger={backTrigger} />
    </AuthContainer>
  );
}
