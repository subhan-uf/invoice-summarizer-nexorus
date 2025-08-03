import { Link } from "@heroui/link";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Input } from "@heroui/input";

import { title, subtitle } from "@/components/primitives";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className={title({ size: "lg" })}>Reset Password</h1>
          <p className={subtitle({ class: "mt-2" })}>
            Enter your email address and we&apos;ll send you a link to reset
            your password
          </p>
        </div>

        <Card className="bg-content1/50 backdrop-blur-sm">
          <CardBody className="p-6">
            <form className="space-y-6">
              <div>
                <Input
                  isRequired
                  label="Email"
                  placeholder="Enter your email address"
                  type="email"
                  variant="bordered"
                />
              </div>

              <Button
                className="w-full"
                color="primary"
                size="lg"
                type="submit"
              >
                Send Reset Link
              </Button>
            </form>

            <div className="text-center mt-6">
              <p className="text-sm text-default-600">
                Remember your password?{" "}
                <Link className="text-primary" href="/login">
                  Sign in
                </Link>
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
