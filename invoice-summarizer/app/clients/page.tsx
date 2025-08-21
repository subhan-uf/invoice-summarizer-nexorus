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
import { Avatar } from "@heroui/avatar";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  PhoneIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

import { title, subtitle } from "@/components/primitives";
import DashboardLayout from "@/components/dashboard-layout";
import { supabase } from "@/lib/supabaseClient";
import { getUserQuotaStatus } from "@/lib/userUtils";

export default function ClientsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editingClient, setEditingClient] = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [quota, setQuota] = useState<any | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchClients = async () => {
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
        .from("clients")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setClients(data || []);
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

    fetchClients();
  }, []);

  const filteredClients = mounted
    ? clients.filter((client) => {
        const matchesSearch =
          client.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          client.company?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus =
          statusFilter === "all" || client.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
    : [];

  // Calculate stats
  const totalClients = mounted ? clients.length : 0;
  const activeClients = mounted
    ? clients.filter((c) => c.status === "active").length
    : 0;
  const totalExpenses = mounted
    ? clients.reduce((sum, client) => sum + (client.total_amount || 0), 0)
    : 0;
  const totalInvoices = mounted
    ? clients.reduce((sum, client) => sum + (client.total_invoices || 0), 0)
    : 0;

  const handleEditClient = (client: any) => {
    setEditingClient(client);
    onOpen();
  };

  const handleAddClient = () => {
    setEditingClient(null);
    onOpen();
  };

  const handleSaveClient = async (form: any) => {
    setModalLoading(true);
    setModalError("");
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setModalError("Not authenticated");
      setModalLoading(false);

      return;
    }
    let result;

    if (editingClient) {
      result = await supabase
        .from("clients")
        .update({
          ...form,
          user_id: user.id,
        })
        .eq("id", editingClient.id);
    } else {
      result = await supabase.from("clients").insert({
        ...form,
        user_id: user.id,
      });
    }
    if (result.error) {
      setModalError(result.error.message);
      setModalLoading(false);

      return;
    }
    // Refresh clients
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error) setClients(data || []);
    setModalLoading(false);
    onClose();
  };

  const handleDeleteClient = async (clientId: string) => {
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
    const { error } = await supabase
      .from("clients")
      .delete()
      .eq("id", clientId);

    if (error) {
      setError(error.message);
      setLoading(false);

      return;
    }
    setClients(clients.filter((c) => c.id !== clientId));
    setLoading(false);
  };

  if (!mounted) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <span className="text-lg text-default-500">Loading...</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className={title({ size: "lg" })}>Clients</h1>
            <div className="flex items-center gap-4">
              <p className={subtitle({ class: "mt-2" })}>
                Manage your client database and track invoice relationships
              </p>
              {quota && (
                <div className="text-sm text-default-500">
                  Uploads left: {quota.uploadsLeft}/{quota.uploadsLimit}
                  {quota.resetAt ? (
                    <div className="text-xs">Resets: {new Date(quota.resetAt).toLocaleDateString()}</div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              color="primary"
              startContent={<UserGroupIcon className="w-4 h-4" />}
              variant="bordered"
            >
              Import Clients
            </Button>
            <Button
              color="primary"
              startContent={<PlusIcon className="w-4 h-4" />}
              onPress={handleAddClient}
            >
              Add Client
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-content1/50 backdrop-blur-sm border-1 border-divider/50">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div className="bg-primary/10 rounded-full p-3">
                  <UserGroupIcon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{totalClients}</p>
                  <p className="text-sm text-default-600">Total Clients</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-content1/50 backdrop-blur-sm border-1 border-divider/50">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div className="bg-success/10 rounded-full p-3">
                  <BuildingOfficeIcon className="w-6 h-6 text-success" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{activeClients}</p>
                  <p className="text-sm text-default-600">Active Clients</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-content1/50 backdrop-blur-sm border-1 border-divider/50">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div className="bg-secondary/10 rounded-full p-3">
                  <GlobeAltIcon className="w-6 h-6 text-secondary" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{totalInvoices}</p>
                  <p className="text-sm text-default-600">Total Invoices</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-content1/50 backdrop-blur-sm border-1 border-divider/50">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div className="bg-warning/10 rounded-full p-3">
                  <PhoneIcon className="w-6 h-6 text-warning" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    ${totalExpenses.toLocaleString()}
                  </p>
                  <p className="text-sm text-default-600">Total Expenses</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="bg-content1/50 backdrop-blur-sm border-1 border-divider/50">
          <CardBody className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search clients..."
                  size="lg"
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
                    size="lg"
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
                  <DropdownItem key="all">All Clients</DropdownItem>
                  <DropdownItem key="active">Active</DropdownItem>
                  <DropdownItem key="inactive">Inactive</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </CardBody>
        </Card>

        {/* Clients Table */}
        <Card className="bg-content1/50 backdrop-blur-sm border-1 border-divider/50">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Client Directory ({filteredClients.length})
              </h3>
              <div className="flex items-center gap-2 text-sm text-default-600">
                <span>Total: {clients.length}</span>
                <span>•</span>
                <span>
                  Active: {clients.filter((c) => c.status === "active").length}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <Table aria-label="Clients table" selectionMode="multiple">
              <TableHeader>
                <TableColumn>CLIENT</TableColumn>
                <TableColumn>COMPANY</TableColumn>
                <TableColumn>INVOICES</TableColumn>
                <TableColumn>TOTAL AMOUNT</TableColumn>
                <TableColumn>LAST INVOICE</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <div className="text-center py-8">Loading clients...</div>
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
                ) : filteredClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <div className="text-center py-8">No clients found.</div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar name={client.name} size="md" />
                          <div>
                            <p className="font-medium">{client.name}</p>
                            <p className="text-sm text-default-500">
                              {client.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <BuildingOfficeIcon className="w-4 h-4 text-default-400" />
                          <span className="font-medium">{client.company}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Chip color="primary" size="sm" variant="flat">
                            {client.total_invoices || 0}
                          </Chip>
                          <span className="text-sm text-default-600">
                            invoices
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-success">
                          ${(client.total_amount || 0).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {client.last_invoice
                              ? new Date(
                                  client.last_invoice,
                                ).toLocaleDateString()
                              : "Never"}
                          </p>
                          <p className="text-sm text-default-500">
                            {client.last_invoice
                              ? `${Math.floor((Date.now() - new Date(client.last_invoice).getTime()) / (1000 * 60 * 60 * 24))} days ago`
                              : "No invoices"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip
                          color={
                            client.status === "active" ? "success" : "default"
                          }
                          size="sm"
                          variant="flat"
                        >
                          {client.status.charAt(0).toUpperCase() +
                            client.status.slice(1)}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <Dropdown>
                          <DropdownTrigger>
                            <Button isIconOnly size="sm" variant="light">
                              <EllipsisVerticalIcon className="w-4 h-4" />
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu>
                            <DropdownItem
                              key="edit"
                              startContent={<PencilIcon className="w-4 h-4" />}
                              onPress={() => handleEditClient(client)}
                            >
                              Edit Client
                            </DropdownItem>
                            <DropdownItem
                              key="delete"
                              className="text-danger"
                              color="danger"
                              startContent={<TrashIcon className="w-4 h-4" />}
                              onPress={() => handleDeleteClient(client.id)}
                            >
                              Delete Client
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

        {/* Add/Edit Client Modal */}
        <Modal isOpen={isOpen} size="2xl" onClose={onClose}>
          <ModalContent>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <UserGroupIcon className="w-6 h-6 text-primary" />
                {editingClient ? "Edit Client" : "Add New Client"}
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    defaultValue={editingClient?.name || ""}
                    label="Client Name"
                    placeholder="Enter client name"
                    variant="bordered"
                    onChange={(e) =>
                      setEditingClient((prev: any) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                  />
                  <Input
                    defaultValue={editingClient?.email || ""}
                    label="Email Address"
                    placeholder="client@example.com"
                    variant="bordered"
                    onChange={(e) =>
                      setEditingClient((prev: any) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    defaultValue={editingClient?.company || ""}
                    label="Company Name"
                    placeholder="Enter company name"
                    variant="bordered"
                    onChange={(e) =>
                      setEditingClient((prev: any) => ({
                        ...prev,
                        company: e.target.value,
                      }))
                    }
                  />
                  <Input
                    defaultValue={editingClient?.phone || ""}
                    label="Phone Number"
                    placeholder="+1 (555) 123-4567"
                    startContent={
                      <PhoneIcon className="w-4 h-4 text-default-400" />
                    }
                    variant="bordered"
                    onChange={(e) =>
                      setEditingClient((prev: any) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    defaultValue={editingClient?.website || ""}
                    label="Website"
                    placeholder="https://example.com"
                    startContent={
                      <GlobeAltIcon className="w-4 h-4 text-default-400" />
                    }
                    variant="bordered"
                    onChange={(e) =>
                      setEditingClient((prev: any) => ({
                        ...prev,
                        website: e.target.value,
                      }))
                    }
                  />
                  <Input
                    defaultValue={editingClient?.address || ""}
                    label="Address"
                    placeholder="Enter address"
                    startContent={
                      <MapPinIcon className="w-4 h-4 text-default-400" />
                    }
                    variant="bordered"
                    onChange={(e) =>
                      setEditingClient((prev: any) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Additional Information</h4>
                  <textarea
                    className="border rounded-lg p-2 w-full min-h-[80px]"
                    placeholder="Any additional notes about this client..."
                    value={editingClient?.notes || ""}
                    onChange={(e) =>
                      setEditingClient((prev: any) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                  />
                </div>
                {modalError && (
                  <div className="text-danger text-sm">{modalError}</div>
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button disabled={modalLoading} variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button
                color="primary"
                isLoading={modalLoading}
                onPress={() => handleSaveClient(editingClient)}
              >
                {editingClient ? "Update Client" : "Add Client"}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
