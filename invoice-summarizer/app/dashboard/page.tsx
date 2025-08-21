"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Progress } from "@heroui/progress";
import {
  DocumentTextIcon,
  EnvelopeIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  BellIcon,
  InboxIcon,
  DocumentArrowDownIcon,
  CloudArrowUpIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { title, subtitle } from "@/components/primitives";
import DashboardLayout from "@/components/dashboard-layout";
import { supabase } from "@/lib/supabaseClient";
import GmailConnect from "@/components/gmail-connect";
import { getUserQuotaStatus } from "@/lib/userUtils";

// Mock data
const _stats = [
  {
    title: "Total Invoices",
    value: "1,247",
    change: "+12.5%",
    changeType: "positive",
    icon: DocumentTextIcon,
    color: "primary",
  },
  {
    title: "Email Detected",
    value: "892",
    change: "+8.2%",
    changeType: "positive",
    icon: InboxIcon,
    color: "secondary",
  },
  {
    title: "PDF Downloads",
    value: "456",
    change: "+23.1%",
    changeType: "positive",
    icon: DocumentArrowDownIcon,
    color: "success",
  },
  {
    title: "Emails Sent",
    value: "234",
    change: "+15.3%",
    changeType: "positive",
    icon: EnvelopeIcon,
    color: "warning",
  },
];

const _recentActivity = [
  {
    id: 1,
    type: "email",
    action: "Invoice detected from email",
    description: "INV-2024-001 from TechCorp",
    time: "2 minutes ago",
    status: "success",
  },
  {
    id: 2,
    type: "pdf",
    action: "PDF summary downloaded",
    description: "Wilson Consulting Invoice",
    time: "5 minutes ago",
    status: "success",
  },
  {
    id: 3,
    type: "email",
    action: "Summary sent via email",
    description: "To sarah@techcorp.com",
    time: "1 hour ago",
    status: "success",
  },
  {
    id: 4,
    type: "upload",
    action: "Manual upload processed",
    description: "Design Studio Invoice",
    time: "2 hours ago",
    status: "success",
  },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case "success":
      return CheckCircleIcon;
    case "warning":
      return ExclamationTriangleIcon;
    case "info":
      return ClockIcon;
    default:
      return ClockIcon;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "success":
      return "success";
    case "warning":
      return "warning";
    case "info":
      return "primary";
    default:
      return "default";
  }
};

export default function DashboardPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [emails, setEmails] = useState<any[]>([]);
  const [_clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [isGmailConnected, setIsGmailConnected] = useState(false);
  const [quota, setQuota] = useState<any | null>(null);

  useEffect(() => {
    // Check for URL parameters for success/error messages
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get("success");
    const errorMsg = urlParams.get("error");
    const message = urlParams.get("message");

    if (success === "gmail_connected" && message) {
      setSuccessMessage(decodeURIComponent(message));
      setShowMessage(true);
      toast.success(decodeURIComponent(message));
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (errorMsg === "gmail_connection_failed" && message) {
      setError(decodeURIComponent(message));
      setShowMessage(true);
      toast.error(decodeURIComponent(message));
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const fetchAll = async () => {
      setLoading(true);
      setError("");
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Not authenticated");
        setLoading(false);

        return;
      }
      const [invRes, emailRes, clientRes] = await Promise.all([
        supabase.from("invoices").select("*").eq("user_id", user.id),
        supabase.from("email_history").select("*").eq("user_id", user.id),
        supabase.from("clients").select("*").eq("user_id", user.id),
      ]);

      if (invRes.error || emailRes.error || clientRes.error) {
        setError(
          invRes.error?.message ||
            emailRes.error?.message ||
            clientRes.error?.message ||
            "Unknown error",
        );
        setLoading(false);

        return;
      }
      setInvoices(invRes.data || []);
      setEmails(emailRes.data || []);
      setClients(clientRes.data || []);
      setLoading(false);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const q = await getUserQuotaStatus(user.id);
          setQuota(q);
        }
      } catch (e) {
        console.warn("Failed to fetch quota status:", e);
      }
    };

    fetchAll();

    // Check Gmail connection status
    const checkGmailConnection = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: gmailTokens } = await supabase
          .from("gmail_tokens")
          .select("*")
          .eq("user_id", user.id)
          .single();

        setIsGmailConnected(!!gmailTokens);
      }
    };

    checkGmailConnection();
  }, []);

  const handleCheckEmail = async () => {
    try {
      setCheckingEmail(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Please log in to check email");

        return;
      }

      // Get the current session token
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        toast.error("Please log in to check email");

        return;
      }

      // Send request to our local API route (which will proxy to n8n)
      const response = await fetch("/api/scan-gmail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success(
          "Email scan initiated successfully! New invoices will appear shortly.",
        );
      } else {
        const errorData = await response.json();

        toast.error(errorData.error || "Failed to initiate email scan");
      }
    } catch (error) {
      console.error("Error checking email:", error);
      toast.error("Failed to check email. Please try again.");
    } finally {
      setCheckingEmail(false);
    }
  };

  // Stats
  const totalInvoices = invoices.length;
  const emailDetected = invoices.filter((i) => i.source === "email").length;
  const pdfDownloads = emails.length; // or use a separate downloads table if you have one
  const emailsSent = emails.length;

  // Processing Performance Metrics
  const processingStats = {
    total: totalInvoices,
    processed: invoices.filter((i) => i.status === "processed").length,
    processing: invoices.filter((i) => i.status === "processing").length,
    failed: invoices.filter((i) => i.status === "failed").length,
    uploaded: invoices.filter((i) => i.status === "uploaded").length,
    emailDetected: invoices.filter((i) => i.source === "email").length,
    manualUploads: invoices.filter((i) => i.source === "upload").length,
    successRate:
      totalInvoices > 0
        ? Math.round(
            (invoices.filter((i) => i.status === "processed").length /
              totalInvoices) *
              100,
          )
        : 0,
    emailSuccessRate:
      emailDetected > 0
        ? Math.round(
            (invoices.filter(
              (i) => i.source === "email" && i.status === "processed",
            ).length /
              emailDetected) *
              100,
          )
        : 0,
    uploadSuccessRate:
      invoices.filter((i) => i.source === "upload").length > 0
        ? Math.round(
            (invoices.filter(
              (i) => i.source === "upload" && i.status === "processed",
            ).length /
              invoices.filter((i) => i.source === "upload").length) *
              100,
          )
        : 0,
    avgProcessingTime: "2.3s", // This would need to be calculated from actual processing times
    totalAmount: invoices.reduce((sum, i) => sum + (i.amount || 0), 0),
    emailAmount: invoices
      .filter((i) => i.source === "email")
      .reduce((sum, i) => sum + (i.amount || 0), 0),
    uploadAmount: invoices
      .filter((i) => i.source === "upload")
      .reduce((sum, i) => sum + (i.amount || 0), 0),
  };

  // Recent activity (combine invoices and emails, sort by created_at/date)
  const recentActivity = [
    ...invoices.map((i) => ({
      id: i.id,
      type: i.source,
      action:
        i.source === "email"
          ? "Invoice detected from email"
          : "Manual upload processed",
      description: i.name,
      time: i.created_at || i.date,
      status:
        i.status === "processed"
          ? "success"
          : i.status === "failed"
            ? "warning"
            : "info",
    })),
    ...emails.map((e) => ({
      id: e.id,
      type: "email_sent",
      action: "Summary sent via email",
      description: e.subject,
      time: e.date + (e.time ? " " + e.time : ""),
      status:
        e.status === "delivered"
          ? "success"
          : e.status === "failed"
            ? "warning"
            : "info",
    })),
  ]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 10);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className={title({ size: "lg" })}>Dashboard</h1>
            <p className={subtitle({ class: "mt-2" })}>
              Monitor your invoice processing workflow - from email detection to
              PDF output
            </p>
          </div>
              <div className="flex gap-3 items-center">
                <Button
                  color="primary"
                  startContent={<BellIcon className="w-4 h-4" />}
                  variant="bordered"
                >
                  Notifications
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    color="primary"
                    startContent={<CloudArrowUpIcon className="w-4 h-4" />}
                    isDisabled={!!quota && quota.uploadsLeft <= 0}
                    title={quota && quota.uploadsLeft <= 0 ? `Free uploads ended. Reset on ${quota.resetAt ?? '\u2014'}` : undefined}
                  >
                    Upload Invoice
                  </Button>
                  <div className="text-sm text-default-500">
                    {quota
                      ? `Uploads left ${quota.uploadsLeft}/${quota.uploadsLimit}`
                      : "Uploads left —"}
                    {quota && quota.resetAt ? (
                      <div className="text-xs text-default-400">Resets: {new Date(quota.resetAt).toLocaleDateString()}</div>
                    ) : null}
                  </div>
                </div>
              </div>
        </div>

        {/* Gmail Connection Status */}
  <GmailConnect variant="card" isFreeTrial={!!quota} />

        {/* Check Email Button */}
        <Card className="bg-content1/50 backdrop-blur-sm border-1 border-divider/50">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-secondary/10 rounded-full p-3">
                  <InboxIcon className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Email Detection</h3>
                  <p className="text-default-600">
                    Scan your Gmail for invoice emails
                  </p>
                </div>
              </div>
              <Button
                color="secondary"
                isDisabled={!isGmailConnected || (!!quota && quota.emailsLeft <= 0)}
                isLoading={checkingEmail}
                startContent={<InboxIcon className="w-4 h-4" />}
                onPress={handleCheckEmail}
                title={quota && quota.emailsLeft <= 0 ? `Free detections ended. Reset on ${quota.resetAt ?? '—'}` : undefined}
              >
                Check Email
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Success/Error Messages */}
        {showMessage && (successMessage || error) && (
          <Card
            className={`${successMessage ? "bg-success/10 border-success/20" : "bg-danger/10 border-danger/20"} backdrop-blur-sm`}
          >
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`${successMessage ? "bg-success/20" : "bg-danger/20"} rounded-full p-2`}
                  >
                    {successMessage ? (
                      <CheckCircleIcon className="w-5 h-5 text-success" />
                    ) : (
                      <ExclamationTriangleIcon className="w-5 h-5 text-danger" />
                    )}
                  </div>
                  <div>
                    <p
                      className={`font-medium ${successMessage ? "text-success" : "text-danger"}`}
                    >
                      {successMessage || error}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="light"
                  onPress={() => {
                    setShowMessage(false);
                    setSuccessMessage("");
                    setError("");
                  }}
                >
                  ✕
                </Button>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Stats Cards */}
        {loading ? (
          <div className="text-center py-8">Loading dashboard...</div>
        ) : error ? (
          <div className="text-danger text-center py-8">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-content1/50 backdrop-blur-sm border-1 border-divider/50 hover:border-primary/30 transition-all duration-300">
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-primary/10 rounded-full p-3">
                    <DocumentTextIcon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalInvoices}</p>
                  <p className="text-sm text-default-600">Total Invoices</p>
                </div>
              </CardBody>
            </Card>
            <Card className="bg-content1/50 backdrop-blur-sm border-1 border-divider/50 hover:border-primary/30 transition-all duration-300">
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-secondary/10 rounded-full p-3">
                    <InboxIcon className="w-6 h-6 text-secondary" />
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold">{emailDetected}</p>
                  <p className="text-sm text-default-600">Email Detected</p>
                </div>
              </CardBody>
            </Card>
            <Card className="bg-content1/50 backdrop-blur-sm border-1 border-divider/50 hover:border-primary/30 transition-all duration-300">
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-success/10 rounded-full p-3">
                    <DocumentArrowDownIcon className="w-6 h-6 text-success" />
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold">{pdfDownloads}</p>
                  <p className="text-sm text-default-600">PDF Downloads</p>
                </div>
              </CardBody>
            </Card>
            <Card className="bg-content1/50 backdrop-blur-sm border-1 border-divider/50 hover:border-primary/30 transition-all duration-300">
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-warning/10 rounded-full p-3">
                    <EnvelopeIcon className="w-6 h-6 text-warning" />
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold">{emailsSent}</p>
                  <p className="text-sm text-default-600">Emails Sent</p>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card className="bg-content1/50 backdrop-blur-sm border-1 border-divider/50">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Recent Activity</h3>
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                {loading ? (
                  <div className="text-center py-8">Loading activity...</div>
                ) : error ? (
                  <div className="text-danger text-center py-8">{error}</div>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((activity) => {
                      const StatusIcon = getStatusIcon(activity.status);

                      return (
                        <div
                          key={activity.id}
                          className="flex items-start gap-4 p-4 rounded-lg bg-content1/30 hover:bg-content1/50 transition-colors"
                        >
                          <div
                            className={`bg-${getStatusColor(activity.status)}/10 rounded-full p-2 mt-1`}
                          >
                            <StatusIcon
                              className={`w-4 h-4 text-${getStatusColor(activity.status)}`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium text-sm">
                                {activity.action}
                              </p>
                              <span className="text-xs text-default-500">
                                {activity.time}
                              </span>
                            </div>
                            <p className="text-sm text-default-600">
                              {activity.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Quick Actions & Progress */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="bg-content1/50 backdrop-blur-sm border-1 border-divider/50">
              <CardHeader className="pb-4">
                <h3 className="text-lg font-semibold">Quick Actions</h3>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="space-y-3">
                  <Button
                    className="w-full justify-start"
                    color="primary"
                    startContent={<CloudArrowUpIcon className="w-4 h-4" />}
                    variant="bordered"
                  >
                    Upload Invoice
                  </Button>
                  <Button
                    className="w-full justify-start"
                    color="secondary"
                    startContent={<InboxIcon className="w-4 h-4" />}
                    variant="bordered"
                  >
                    Check Email
                  </Button>
                  <Button
                    className="w-full justify-start"
                    color="success"
                    startContent={<DocumentArrowDownIcon className="w-4 h-4" />}
                    variant="bordered"
                  >
                    Download PDF
                  </Button>
                  <Button
                    className="w-full justify-start"
                    color="warning"
                    startContent={<EnvelopeIcon className="w-4 h-4" />}
                    variant="bordered"
                  >
                    Send via Email
                  </Button>
                </div>
              </CardBody>
            </Card>

            {/* Processing Progress */}
            <Card className="bg-content1/50 backdrop-blur-sm border-1 border-divider/50">
              <CardHeader className="pb-4">
                <h3 className="text-lg font-semibold">Processing Status</h3>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Current Queue</span>
                      <span className="text-sm text-default-600">
                        {processingStats.processing} invoices
                      </span>
                    </div>
                    <Progress
                      className="mb-4"
                      color="primary"
                      value={
                        processingStats.total > 0
                          ? Math.round(
                              (processingStats.processed /
                                processingStats.total) *
                                100,
                            )
                          : 0
                      }
                    />
                    <p className="text-xs text-default-500">
                      {processingStats.processing > 0
                        ? `Processing ${processingStats.processing} invoices`
                        : "No invoices in queue"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Processing Status</span>
                      <span className="font-medium text-success">
                        {processingStats.processing > 0
                          ? `${processingStats.processing} active`
                          : "Idle"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Overall Success Rate</span>
                      <span
                        className={`font-medium ${processingStats.successRate >= 90 ? "text-success" : processingStats.successRate >= 70 ? "text-warning" : "text-danger"}`}
                      >
                        {processingStats.successRate}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Email Success Rate</span>
                      <span
                        className={`font-medium ${processingStats.emailSuccessRate >= 90 ? "text-success" : processingStats.emailSuccessRate >= 70 ? "text-warning" : "text-danger"}`}
                      >
                        {processingStats.emailSuccessRate}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Upload Success Rate</span>
                      <span
                        className={`font-medium ${processingStats.uploadSuccessRate >= 90 ? "text-success" : processingStats.uploadSuccessRate >= 70 ? "text-warning" : "text-danger"}`}
                      >
                        {processingStats.uploadSuccessRate}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Total Processed</span>
                      <span className="font-medium">
                        {processingStats.processed}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Failed</span>
                      <span className="font-medium text-danger">
                        {processingStats.failed}
                      </span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Performance Chart Placeholder */}
        <Card className="bg-content1/50 backdrop-blur-sm border-1 border-divider/50">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Processing Performance</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="light">
                  7 Days
                </Button>
                <Button color="primary" size="sm" variant="light">
                  30 Days
                </Button>
                <Button size="sm" variant="light">
                  90 Days
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <div className="space-y-6">
              {/* Processing Breakdown */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-success/10 rounded-lg p-4 border border-success/20">
                  <div className="flex items-center gap-2 mb-2">
                    <InboxIcon className="w-4 h-4 text-success" />
                    <span className="text-sm font-medium text-success">
                      Email Detection
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-success">
                    {processingStats.emailDetected}
                  </div>
                  <div className="text-xs text-default-500">
                    ${processingStats.emailAmount.toLocaleString()} total
                  </div>
                </div>
                <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <CloudArrowUpIcon className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-primary">
                      Manual Uploads
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {processingStats.manualUploads}
                  </div>
                  <div className="text-xs text-default-500">
                    ${processingStats.uploadAmount.toLocaleString()} total
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-success">
                    {processingStats.successRate}%
                  </div>
                  <div className="text-xs text-default-500">
                    Overall Success
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-secondary">
                    {processingStats.emailSuccessRate}%
                  </div>
                  <div className="text-xs text-default-500">Email Success</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-primary">
                    {processingStats.uploadSuccessRate}%
                  </div>
                  <div className="text-xs text-default-500">Upload Success</div>
                </div>
              </div>

              {/* Total Amount */}
              <div className="bg-gradient-to-r from-success/10 to-primary/10 rounded-lg p-4 border border-divider/50">
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">
                    ${processingStats.totalAmount.toLocaleString()}
                  </div>
                  <div className="text-sm text-default-500">
                    Total Invoice Value
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Get Started Tips */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-1 border-primary/20">
          <CardBody className="p-6">
            <div className="flex items-start gap-4">
              <div className="bg-primary/20 rounded-full p-3">
                <SparklesIcon className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">
                  Get Started with AI Invoice Summarizer
                </h3>
                <p className="text-default-600 mb-4">
                  Ready to streamline your invoice processing? Here&apos;s how
                  to get started with our complete workflow.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="bg-content1/50 backdrop-blur-sm rounded-lg p-4 border-1 border-divider/50">
                    <div className="text-2xl font-bold text-primary mb-1">
                      1
                    </div>
                    <h4 className="font-medium mb-2">Connect Email</h4>
                    <p className="text-sm text-default-600">
                      Link your email for automatic invoice detection
                    </p>
                  </div>
                  <div className="bg-content1/50 backdrop-blur-sm rounded-lg p-4 border-1 border-divider/50">
                    <div className="text-2xl font-bold text-primary mb-1">
                      2
                    </div>
                    <h4 className="font-medium mb-2">Upload or Detect</h4>
                    <p className="text-sm text-default-600">
                      Manually upload or let our system detect invoices
                    </p>
                  </div>
                  <div className="bg-content1/50 backdrop-blur-sm rounded-lg p-4 border-1 border-divider/50">
                    <div className="text-2xl font-bold text-primary mb-1">
                      3
                    </div>
                    <h4 className="font-medium mb-2">Get Summaries</h4>
                    <p className="text-sm text-default-600">
                      AI processes and creates detailed summaries
                    </p>
                  </div>
                  <div className="bg-content1/50 backdrop-blur-sm rounded-lg p-4 border-1 border-divider/50">
                    <div className="text-2xl font-bold text-primary mb-1">
                      4
                    </div>
                    <h4 className="font-medium mb-2">Download or Send</h4>
                    <p className="text-sm text-default-600">
                      Download PDF or send via email
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}
