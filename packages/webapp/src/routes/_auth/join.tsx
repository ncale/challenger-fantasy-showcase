import { LINKS } from "@challenger-fantasy/core";
import { joinSearchSchema } from "@challenger-fantasy/schemas";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { EmailStep } from "~/components/auth/email-step";
import { OtpStep } from "~/components/auth/otp-step";
import { StepIndicator } from "~/components/auth/step-indicator";
import { UsernameStep } from "~/components/auth/username-step";

export const Route = createFileRoute("/_auth/join")({
  component: JoinPage,
  validateSearch: joinSearchSchema,
});

type Step = "email" | "otp" | "username";

function JoinPage() {
  const { ref } = Route.useSearch();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");

  const handleEmailSuccess = (submittedEmail: string) => {
    setEmail(submittedEmail);
    setStep("otp");
  };

  const handleOtpSuccess = (hasUsername: boolean) => {
    if (hasUsername) {
      navigate({ to: "/waitlist" });
    } else {
      setStep("username");
    }
  };

  const handleUsernameSuccess = () => {
    navigate({ to: "/waitlist" });
  };

  const handleOtpBack = () => {
    setStep("email");
  };

  const currentStepNumber = step === "email" ? 1 : step === "otp" ? 2 : 3;

  return (
    <div className="w-full max-w-md">
      <StepIndicator currentStep={currentStepNumber} totalSteps={3} />

      <div className="mt-8">
        {step === "email" && (
          <>
            <h1 className="text-3xl font-bold mb-3">Join the waitlist</h1>
            <p className="text-muted-foreground text-md mb-8">
              Enter your email to get early access to Challenger Fantasy.
            </p>
            <EmailStep referralCode={ref} onSuccess={handleEmailSuccess} />
          </>
        )}

        {step === "otp" && (
          <>
            <h1 className="text-3xl font-bold mb-3">Verify your email</h1>
            <p className="text-muted-foreground text-md mb-8">
              Enter the code we sent to your email.
            </p>
            <OtpStep
              email={email}
              referralCode={ref}
              onSuccess={handleOtpSuccess}
              onBack={handleOtpBack}
            />
          </>
        )}

        {step === "username" && (
          <>
            <h1 className="text-3xl font-bold mb-3">Claim your username</h1>
            <p className="text-muted-foreground text-md mb-8">
              Choose a unique username for your profile.
            </p>
            <UsernameStep onSuccess={handleUsernameSuccess} />
          </>
        )}
      </div>

      <div className="mt-20 text-xs text-muted-foreground text-center">
        <p>
          By continuing, you agree to our{" "}
          <a
            href={LINKS.TOS}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground w-fit underline"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href={LINKS.PRIVACY}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground w-fit underline"
          >
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}
