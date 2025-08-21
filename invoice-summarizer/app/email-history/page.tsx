"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Chip } from "@heroui/chip";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import {
  EnvelopeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

import { title, subtitle } from "@/components/primitives";
import DashboardLayout from "@/components/dashboard-layout";
import { supabase } from "@/lib/supabaseClient";
import { getUserQuotaStatus } from "@/lib/userUtils";

const statusColors = {
  delivered: "success",
  failed: "danger",
  pending: "warning",
};

const statusIcons = {
  delivered: CheckCircleIcon,
  failed: ExclamationTriangleIcon,
  pending: ClockIcon,
};

export default function EmailHistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quota, setQuota] = useState<any | null>(null);

  useEffect(() => {
    const fetchEmails = async () => {
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
      const { data, error } = await supabase
        .from("email_history")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setEmails(data || []);
      }
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

    fetchEmails();
  }, []);

  const filteredEmails = emails.filter((email) => {
    const matchesSearch =
      email.recipient?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.invoiceName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.client?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.subject?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || email.status === statusFilter;
    const matchesDate = dateFilter === "all" || email.date === dateFilter;

    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusChip = (status: string) => {
    const StatusIcon = statusIcons[status as keyof typeof statusIcons];

    return (
      <Chip
        color={statusColors[status as keyof typeof statusColors] as any}
        size="sm"
        startContent={<StatusIcon className="w-3 h-3" />}
        variant="flat"
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Chip>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className={title({ size: "lg" })}>Email History</h1>
          <p className={subtitle({ class: "mt-2" })}>
            Track all sent invoice summaries and their delivery status
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {quota && (
            <Card className="bg-content1/50 backdrop-blur-sm">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-default-600">Free Uploads Left</p>
                    <p className="text-2xl font-bold">{quota.uploadsLeft}</p>
                    <p className="text-sm text-default-600">Detections left: {quota.emailsLeft}/{quota.emailsLimit}</p>
                    <p className="text-xs text-default-500">Resets: {quota.resetAt ? new Date(quota.resetAt).toLocaleString() : '—'}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
          <Card className="bg-content1/50 backdrop-blur-sm">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-default-600">
                    Total Sent
                  </p>
                  <p className="text-2xl font-bold">{emails.length}</p>
                </div>
                <EnvelopeIcon className="w-8 h-8 text-primary" />
              </div>
            </CardBody>
          </Card>
          <Card className="bg-content1/50 backdrop-blur-sm">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-default-600">
                    Delivered
                  </p>
                  <p className="text-2xl font-bold">
                    {emails.filter((e) => e.status === "delivered").length}
                  </p>
                </div>
                <CheckCircleIcon className="w-8 h-8 text-success" />
              </div>
            </CardBody>
          </Card>
          <Card className="bg-content1/50 backdrop-blur-sm">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-default-600">Failed</p>
                  <p className="text-2xl font-bold">
                    {emails.filter((e) => e.status === "failed").length}
                  </p>
                </div>
                <ExclamationTriangleIcon className="w-8 h-8 text-danger" />
              </div>
            </CardBody>
          </Card>
          <Card className="bg-content1/50 backdrop-blur-sm">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-default-600">
                    Success Rate
                  </p>
                  <p className="text-2xl font-bold">
                    {emails.length > 0
                      ? (
                          (emails.filter((e) => e.status === "delivered")
                            .length /
                            emails.length) *
                          100
                        ).toFixed(1) + "%"
                      : "0%"}
                  </p>
                </div>
                <CheckCircleIcon className="w-8 h-8 text-success" />
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="bg-content1/50 backdrop-blur-sm">
          <CardBody className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search emails..."
                  startContent={
                    <MagnifyingGlassIcon className="w-4 h-4 text-default-400" />
                  }
                  value={searchQuery}
                  variant="bordered"
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    startContent={<FunnelIcon className="w-4 h-4" />}
                    variant="bordered"
                  >
                    Status:{" "}
                    {statusFilter === "all"
                      ? "All"
                      : statusFilter.charAt(0).toUpperCase() +
                        statusFilter.slice(1)}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  selectedKeys={[statusFilter]}
                  onSelectionChange={(keys) =>
                    setStatusFilter(Array.from(keys)[0] as string)
                  }
                >
                  <DropdownItem key="all">All</DropdownItem>
                  <DropdownItem key="delivered">Delivered</DropdownItem>
                  <DropdownItem key="failed">Failed</DropdownItem>
                  <DropdownItem key="pending">Pending</DropdownItem>
                </DropdownMenu>
              </Dropdown>
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    startContent={<FunnelIcon className="w-4 h-4" />}
                    variant="bordered"
                  >
                    Date: {dateFilter === "all" ? "All" : dateFilter}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  selectedKeys={[dateFilter]}
                  onSelectionChange={(keys) =>
                    setDateFilter(Array.from(keys)[0] as string)
                  }
                >
                  <DropdownItem key="all">All Dates</DropdownItem>
                  <DropdownItem key="2024-01-15">Today</DropdownItem>
                  <DropdownItem key="2024-01-14">Yesterday</DropdownItem>
                  <DropdownItem key="2024-01-13">2 days ago</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </CardBody>
        </Card>

        {/* Email History Table */}
        <Card className="bg-content1/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <h3 className="text-lg font-semibold">
              Email History ({filteredEmails.length})
            </h3>
          </CardHeader>
          <CardBody className="pt-0">
            <Table aria-label="Email history table">
              <TableHeader>
                <TableColumn>DATE & TIME</TableColumn>
                <TableColumn>RECIPIENT</TableColumn>
                <TableColumn>INVOICE</TableColumn>
                <TableColumn>CLIENT</TableColumn>
                <TableColumn>SUBJECT</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <div className="text-center py-8">
                        Loading email history...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <div className="text-danger text-center py-8">
                        {error}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredEmails.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <div className="text-center py-8">
                        No email history found.
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmails.map((email) => (
                    <TableRow key={email.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{email.date}</p>
                          <p className="text-sm text-default-600">
                            {email.time}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{email.recipient}</TableCell>
                      <TableCell>{email.invoiceName}</TableCell>
                      <TableCell>{email.client}</TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">{email.subject}</div>
                      </TableCell>
                      <TableCell>{getStatusChip(email.status)}</TableCell>
                      <TableCell>
                        <Dropdown>
                          <DropdownTrigger>
                            <Button isIconOnly size="sm" variant="light">
                              <EllipsisVerticalIcon className="w-4 h-4" />
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu>
                            <DropdownItem
                              key="resend"
                              startContent={
                                <ArrowPathIcon className="w-4 h-4" />
                              }
                            >
                              Resend
                            </DropdownItem>
                            <DropdownItem
                              key="view"
                              startContent={
                                <EnvelopeIcon className="w-4 h-4" />
                              }
                            >
                              View Email
                            </DropdownItem>
                            <DropdownItem
                              key="details"
                              startContent={
                                <EnvelopeIcon className="w-4 h-4" />
                              }
                            >
                              Delivery Details
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}
