"use client";

import { Link } from "@heroui/link";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import { Checkbox } from "@heroui/checkbox";
import { Divider } from "@heroui/divider";
import { title, subtitle } from "@/components/primitives";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

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
      toast.success("Account created! Please check your email to verify your account.");
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
                  <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className={title({ size: "md" })}>Check Your Email</h2>
                <p className="text-default-600 mt-2">
                  We've sent a verification link to <strong>{email}</strong>
                </p>
              </div>
              <div className="space-y-4">
                <p className="text-sm text-default-500">
                  Click the link in your email to verify your account and start using AI Invoice Summarizer.
                </p>
                <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                  <p className="text-sm text-warning">
                    <strong>Can't find the email?</strong> Check your spam folder or try signing up again.
                  </p>
                </div>
                <Button
                  variant="bordered"
                  onPress={() => {
                    setShowVerificationMessage(false);
                    setEmail("");
                    setPassword("");
                    setConfirmPassword("");
                  }}
                >
                  Try Again
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
                  type="email"
                  label="Email"
                  placeholder="john@example.com"
                  variant="bordered"
                  isRequired
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Input
                  type="password"
                  label="Password"
                  placeholder="Create a strong password"
                  variant="bordered"
                  isRequired
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
              <div>
                <Input
                  type="password"
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  variant="bordered"
                  isRequired
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
              </div>
              <div className="flex items-start gap-2">
                <Checkbox size="sm" className="mt-1" />
                <div className="text-sm text-default-600">
                  I agree to the{" "}
                  <Link href="/terms" className="text-primary">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-primary">
                    Privacy Policy
                  </Link>
                </div>
              </div>
              {error && <div className="text-danger text-sm">{error}</div>}
              <Button
                type="submit"
                className="w-full"
                color="primary"
                size="lg"
                isLoading={loading}
              >
                Create Account
              </Button>
                </form>
                <Divider className="my-6" />
                <div className="text-center">
                  <p className="text-sm text-default-600">
                    Already have an account?{" "}
                    <Link href="/login" className="text-primary">
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