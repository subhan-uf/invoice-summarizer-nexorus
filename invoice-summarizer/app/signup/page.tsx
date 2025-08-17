"use client";

import { Link } from "@heroui/link";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Input } from "@heroui/input";
import { Checkbox } from "@heroui/checkbox";
import { Divider } from "@heroui/divider";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { supabase } from "@/lib/supabaseClient";
import { title, subtitle } from "@/components/primitives";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      toast.error("Passwords do not match");

      return;
    }
    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
      toast.error(signUpError.message);
      setLoading(false);

      return;
    }

    setLoading(false);

    // Check if email confirmation is required
    if (data.user && !data.session) {
      // Email confirmation required
      setShowVerificationMessage(true);
      toast.success(
        "Account created! Please check your email to verify your account.",
      );
    } else {
      // Auto-confirmed or already confirmed
      toast.success("Account created successfully!");
      router.push("/invoices");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-8">
      <div className="w-full max-w-md">
        {showVerificationMessage ? (
          <Card className="bg-content1/50 backdrop-blur-sm">
            <CardBody className="p-6 text-center">
              <div className="mb-6">
                <div className="bg-success/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-success"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </div>
                <h2 className={title({ size: "md" })}>Check Your Email</h2>
                <p className="text-default-600 mt-2">
                  We&apos;ve sent a verification link to{" "}
                  <strong>{email}</strong>
                </p>
              </div>
              <div className="space-y-4">
                <p className="text-sm text-default-500">
                  Click the link in your email to verify your account and start
                  using AI Invoice Summarizer.
                </p>
                <Button
                  color="primary"
                  onPress={() => {
                    router.push("/login");
                  }}
                >
                  Go to Login
                </Button>
              </div>
            </CardBody>
          </Card>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className={title({ size: "lg" })}>Create Account</h1>
              <p className={subtitle({ class: "mt-2" })}>
                Start your free trial of AI Invoice Summarizer
              </p>
            </div>
            <Card className="bg-content1/50 backdrop-blur-sm">
              <CardBody className="p-6">
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div>
                    <Input
                      isRequired
                      label="Email"
                      placeholder="john@example.com"
                      type="email"
                      value={email}
                      variant="bordered"
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Input
                      isRequired
                      label="Password"
                      placeholder="Create a strong password"
                      type="password"
                      value={password}
                      variant="bordered"
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div>
                    <Input
                      isRequired
                      label="Confirm Password"
                      placeholder="Confirm your password"
                      type="password"
                      value={confirmPassword}
                      variant="bordered"
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  <div className="flex items-start gap-2">
                    <Checkbox className="mt-1" size="sm" />
                    <div className="text-sm text-default-600">
                      I agree to the{" "}
                      <Link className="text-primary" href="/terms">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link className="text-primary" href="/privacy">
                        Privacy Policy
                      </Link>
                    </div>
                  </div>
                  {error && <div className="text-danger text-sm">{error}</div>}
                  <Button
                    className="w-full"
                    color="primary"
                    isLoading={loading}
                    size="lg"
                    type="submit"
                  >
                    Create Account
                  </Button>
                </form>
                <Divider className="my-6" />
                <div className="text-center">
                  <p className="text-sm text-default-600">
                    Already have an account?{" "}
                    <Link className="text-primary" href="/login">
                      Sign in
                    </Link>
                  </p>
                </div>
              </CardBody>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
