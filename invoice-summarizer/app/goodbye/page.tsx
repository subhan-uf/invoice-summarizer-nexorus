"use client";

import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { title, subtitle } from "@/components/primitives";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function GoodbyePage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-success/10 rounded-full p-3">
              <CheckCircleIcon className="w-8 h-8 text-success" />
            </div>
          </div>
          <h1 className={title({ size: "lg" })}>Account Deleted</h1>
          <p className={subtitle({ class: "mt-2" })}>
            Your account and all associated data have been permanently removed
          </p>
        </div>
        <Card className="bg-content1/50 backdrop-blur-sm">
          <CardBody className="p-6">
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-default-600 mb-4">
                  Thank you for using AI Invoice Summarizer. We're sorry to see you go.
                </p>
                <p className="text-sm text-default-500">
                  If you change your mind, you can always create a new account.
                </p>
              </div>
              
              <div className="space-y-3">
                <Button
                  as={Link}
                  href="/signup"
                  className="w-full"
                  color="primary"
                  size="lg"
                >
                  Create New Account
                </Button>
                <Button
                  as={Link}
                  href="/"
                  className="w-full"
                  variant="bordered"
                  size="lg"
                >
                  Back to Home
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
} 