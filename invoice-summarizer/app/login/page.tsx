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

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      toast.error(error.message);
    } else {
      toast.success("Logged in successfully!");
      router.push("/invoices");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className={title({ size: "lg" })}>Welcome Back</h1>
          <p className={subtitle({ class: "mt-2" })}>
            Sign in to your AI Invoice Summarizer account
          </p>
        </div>

        <Card className="bg-content1/50 backdrop-blur-sm">
          <CardBody className="p-6">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <Input
                  isRequired
                  label="Email"
                  placeholder="Enter your email"
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
                  placeholder="Enter your password"
                  type="password"
                  value={password}
                  variant="bordered"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="flex justify-between items-center">
                <Checkbox size="sm">Remember me</Checkbox>
                <Link className="text-sm text-primary" href="/forgot-password">
                  Forgot password?
                </Link>
              </div>
              {error && <div className="text-danger text-sm">{error}</div>}
              <Button
                className="w-full"
                color="primary"
                isLoading={loading}
                size="lg"
                type="submit"
              >
                Sign In
              </Button>
            </form>

            <Divider className="my-6" />

            <div className="text-center">
              <p className="text-sm text-default-600">
                Don&apos;t have an account?{" "}
                <Link className="text-primary" href="/signup">
                  Sign up
                </Link>
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
