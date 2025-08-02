"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";
import { Chip } from "@heroui/chip";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/modal";
import { title, subtitle } from "@/components/primitives";
import DashboardLayout from "@/components/dashboard-layout";
import { 
  DocumentTextIcon,
  CloudArrowUpIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  EnvelopeIcon,
  TrashIcon,
  PlusIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowUpTrayIcon,
  DocumentArrowDownIcon,
  InboxIcon
} from "@heroicons/react/24/outline";
import { supabase } from "@/lib/supabaseClient";
import { generateSummaryText } from "@/lib/utils";
import GmailConnect from "@/components/gmail-connect";
import toast from "react-hot-toast";

// Mock data
const invoices = [
  {
    id: 1,
    name: "INV-2024-001.pdf",
    client: "TechCorp",
    date: "2024-01-15",
    status: "processed",
    amount: "$2,450.00",
    size: "1.2 MB",
    source: "email",
    summary: "Available"
  },
  {
    id: 2,
    name: "Invoice_StartupXYZ_Jan.pdf",
    client: "StartupXYZ",
    date: "2024-01-14",
    status: "processing",
    amount: "$890.00",
    size: "856 KB",
    source: "upload",
    summary: "Processing"
  },
  {
    id: 3,
    name: "INV-2024-003.pdf",
    client: "Freelance Client",
    date: "2024-01-13",
    status: "failed",
    amount: "$1,200.00",
    size: "2.1 MB",
    source: "email",
    summary: "Failed"
  },
  {
    id: 4,
    name: "Wilson_Consulting_Invoice.pdf",
    client: "Wilson Consulting",
    date: "2024-01-12",
    status: "processed",
    amount: "$3,750.00",
    size: "1.8 MB",
    source: "upload",
    summary: "Available"
  },
  {
    id: 5,
    name: "Design_Studio_Invoice.pdf",
    client: "Design Studio Pro",
    date: "2024-01-11",
    status: "processed",
    amount: "$1,650.00",
    size: "1.5 MB",
    source: "email",
    summary: "Available"
  }
];

const statusColors = {
  processed: "success",
  processing: "warning",
  failed: "danger",
  uploaded: "primary"
};

const statusIcons = {
  processed: CheckCircleIcon,
  processing: ClockIcon,
  failed: ExclamationTriangleIcon,
  uploaded: ArrowUpTrayIcon
};

const sourceIcons = {
  email: InboxIcon,
  upload: CloudArrowUpIcon
};

export default function InvoicesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [summaryToShow, setSummaryToShow] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<any>(null);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [invoiceToEmail, setInvoiceToEmail] = useState<any>(null);
  const [additionalRecipient, setAdditionalRecipient] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const fetchInvoices = async () => {
      setLoading(true);
      setError("");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) {
        setError(error.message);
      } else {
        setInvoices(data || []);
      }
      setLoading(false);
    };
    fetchInvoices();

    // Set up real-time subscription for processing status updates
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const channel = supabase
          .channel('invoice-status-updates')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'invoices',
              filter: `user_id=eq.${user.id}`
            },
            (payload) => {
              console.log('Real-time invoice update:', payload);
              // Refresh the invoices list when status changes
              fetchInvoices();
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      }
    };

    setupRealtime();
  }, [mounted]);

  const filteredInvoices = mounted ? invoices.filter((invoice) => {
    const matchesSearch = invoice.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         invoice.client?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    const matchesSource = sourceFilter === "all" || invoice.source === sourceFilter;
    
    // Debug logging for filter issues
    if (searchQuery || statusFilter !== "all" || sourceFilter !== "all") {
      console.log('Filter debug:', {
        invoice: invoice.name,
        search: searchQuery,
        status: invoice.status,
        statusFilter,
        source: invoice.source,
        sourceFilter,
        matchesSearch,
        matchesStatus,
        matchesSource
      });
    }
    
    return matchesSearch && matchesStatus && matchesSource;
  }) : [];

  const getStatusChip = (status: string) => {
    const StatusIcon = statusIcons[status as keyof typeof statusIcons];
    return (
      <Chip
        size="sm"
        color={statusColors[status as keyof typeof statusColors] as any}
        variant="flat"
        startContent={<StatusIcon className="w-3 h-3" />}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Chip>
    );
  };

  const getSourceChip = (source: string) => {
    const SourceIcon = sourceIcons[source as keyof typeof sourceIcons];
    return (
      <Chip
        size="sm"
        color={source === "email" ? "secondary" : "primary"}
        variant="flat"
        startContent={<SourceIcon className="w-3 h-3" />}
      >
        {source === "email" ? "Email" : "Upload"}
      </Chip>
    );
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files).slice(0, 5);
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    setUploading(true);
    setUploadError("");
    setUploadSuccess("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setUploadError("Not authenticated");
      setUploading(false);
      return;
    }
    let anyError = false;
    for (const file of selectedFiles) {
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      const { data: storageData, error: storageError } = await supabase.storage
        .from("invoices")
        .upload(filePath, file);
      if (storageError) {
        setUploadError(`Failed to upload ${file.name}: ${storageError.message}`);
        anyError = true;
        continue;
      }
      const fileUrl = supabase.storage.from("invoices").getPublicUrl(filePath).data.publicUrl;
      // Insert invoice with processing status
      const { data: newInvoice, error: dbError } = await supabase.from("invoices").insert({
        user_id: user.id,
        name: file.name,
        status: "processing",
        source: "upload",
        file_url: fileUrl,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        created_at: new Date().toISOString(),
      }).select().single();
      
      if (dbError) {
        setUploadError(`Failed to save ${file.name} in database: ${dbError.message}`);
        anyError = true;
        continue;
      }

      // Automatically generate AI summary
      try {
        console.log('[Upload] Starting AI summary for invoice:', newInvoice.id);
        
        // Get the current session token
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        
        if (!token) {
          console.error('[Upload] No session token available');
          continue;
        }
        
        const response = await fetch('/api/summarize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            invoiceId: newInvoice.id,
          }),
        });

        const result = await response.json();
        
        if (result.success) {
          console.log('[Upload] AI summary generated successfully for:', file.name);
        } else {
          console.error('[Upload] Failed to generate AI summary for:', file.name, result.error);
          // Update status to failed if AI summary fails
          await supabase
            .from("invoices")
            .update({ status: "failed" })
            .eq("id", newInvoice.id);
        }
      } catch (error) {
        console.error('[Upload] Error generating AI summary for:', file.name, error);
        // Update status to failed if AI summary fails
        await supabase
          .from("invoices")
          .update({ status: "failed" })
          .eq("id", newInvoice.id);
      }
    }
    setUploading(false);
    setSelectedFiles([]);
    if (!anyError) {
      setUploadSuccess("Upload successful!");
      // Refresh invoices
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("invoices")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (!error) setInvoices(data || []);
      }
      onClose();
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    // Find the invoice to show in confirmation modal
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      setInvoiceToDelete(invoice);
      setDeleteModalOpen(true);
    }
  };

  const confirmDeleteInvoice = async () => {
    if (!invoiceToDelete) return;

    try {
      // Get user for client operations
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to delete invoices');
        return;
      }

      // The database trigger will automatically handle client updates when invoice is deleted
      console.log('[Delete] Deleting invoice:', invoiceToDelete.id);
      console.log('[Delete] Client ID:', invoiceToDelete.client_id);

      // Delete from Supabase Storage
      if (invoiceToDelete.file_url) {
        const filePath = invoiceToDelete.file_url.split('/public/invoices/')[1];
        if (filePath) {
          const { error: storageError } = await supabase.storage
            .from('invoices')
            .remove([filePath]);
          
          if (storageError) {
            console.error('Error deleting file from storage:', storageError);
            // Continue with database deletion even if storage deletion fails
          }
        }
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoiceToDelete.id);

      if (dbError) {
        toast.error(`Failed to delete invoice: ${dbError.message}`);
        return;
      }

      // Refresh the invoices list
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (!error) setInvoices(data || []);

      toast.success('Invoice deleted successfully');
      setDeleteModalOpen(false);
      setInvoiceToDelete(null);
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast.error('Failed to delete invoice. Please try again.');
    }
  };

  const handleEmailInvoice = (invoice: any) => {
    setInvoiceToEmail(invoice);
    setEmailModalOpen(true);
  };

  const confirmSendEmail = async () => {
    if (!invoiceToEmail) return;

    setSendingEmail(true);
    try {
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) {
        toast.error('Please log in to send emails');
        return;
      }
      
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          invoiceId: invoiceToEmail.id,
          recipientEmail: additionalRecipient || undefined,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(`Email sent successfully to ${result.recipient}`);
        // Refresh invoices to update email history
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from("invoices")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });
          if (!error) setInvoices(data || []);
        }
      } else {
        toast.error(`Failed to send email: ${result.error}`);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email. Please try again.');
    } finally {
      setSendingEmail(false);
      setEmailModalOpen(false);
      setInvoiceToEmail(null);
      setAdditionalRecipient("");
    }
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
            <h1 className={title({ size: "lg" })}>Invoices</h1>
            <p className={subtitle({ class: "mt-2" })}>
              Manage your invoice processing workflow - from email detection to PDF output
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="bordered"
              color="primary"
              startContent={<DocumentArrowDownIcon className="w-4 h-4" />}
            >
              Export
            </Button>
            <Button
              color="primary"
              startContent={<PlusIcon className="w-4 h-4" />}
              onPress={onOpen}
            >
              Upload Invoice
            </Button>
          </div>
        </div>

        {/* Gmail Connection Status */}
        <GmailConnect variant="card" />

        {/* Upload Area */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-dashed border-primary/30">
          <CardBody className="p-12 text-center">
            <div className="bg-primary/20 rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <CloudArrowUpIcon className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Upload Your Invoices</h3>
            <p className="text-default-600 mb-6 max-w-md mx-auto">
              Drag and drop your invoice files here, or click to browse. Our system also automatically detects 
              invoice emails and processes them instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                color="primary"
                startContent={<CloudArrowUpIcon className="w-4 h-4" />}
                onPress={onOpen}
              >
                Choose Files
              </Button>
              <Button
                variant="bordered"
                color="primary"
                startContent={<DocumentTextIcon className="w-4 h-4" />}
              >
                Browse Files
              </Button>
            </div>
            <p className="text-xs text-default-500 mt-4">
              Maximum 5 files at once • Up to 10MB per file • Auto-detects invoice emails
            </p>
          </CardBody>
        </Card>

        {/* Filters and Search */}
        <Card className="bg-content1/50 backdrop-blur-sm border-1 border-divider/50">
          <CardBody className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-2">
                <Input
                  placeholder="Search invoices..."
                  startContent={<MagnifyingGlassIcon className="w-4 h-4 text-default-400" />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  variant="bordered"
                  size="lg"
                />
              </div>
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    variant="bordered"
                    startContent={<FunnelIcon className="w-4 h-4" />}
                    size="lg"
                  >
                    Status: {statusFilter === "all" ? "All" : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  selectedKeys={[statusFilter]}
                  onSelectionChange={(keys) => setStatusFilter(Array.from(keys)[0] as string)}
                >
                  <DropdownItem key="all">All Status</DropdownItem>
                  <DropdownItem key="processed">Processed</DropdownItem>
                  <DropdownItem key="processing">Processing</DropdownItem>
                  <DropdownItem key="failed">Failed</DropdownItem>
                  <DropdownItem key="uploaded">Uploaded</DropdownItem>
                </DropdownMenu>
              </Dropdown>
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    variant="bordered"
                    startContent={<FunnelIcon className="w-4 h-4" />}
                    size="lg"
                  >
                    Source: {sourceFilter === "all" ? "All" : sourceFilter === "email" ? "Email" : "Upload"}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  selectedKeys={[sourceFilter]}
                  onSelectionChange={(keys) => setSourceFilter(Array.from(keys)[0] as string)}
                >
                  <DropdownItem key="all">All Sources</DropdownItem>
                  <DropdownItem key="email">Email Detection</DropdownItem>
                  <DropdownItem key="upload">Manual Upload</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </CardBody>
        </Card>

        {/* Invoices Table */}
        <Card className="bg-content1/50 backdrop-blur-sm border-1 border-divider/50">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Invoice History ({filteredInvoices.length})
              </h3>
              <div className="flex items-center gap-2 text-sm text-default-600">
                <span>Total: {invoices.length}</span>
                <span>•</span>
                <span>Processed: {invoices.filter(i => i.status === 'processed').length}</span>
                <span>•</span>
                <span>Email: {invoices.filter(i => i.source === 'email').length}</span>
              </div>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            {loading && <div className="text-center py-8">Loading invoices...</div>}
            {error && <div className="text-danger text-center py-8">{error}</div>}
            {!loading && !error && (
              <Table aria-label="Invoices table" selectionMode="multiple">
              <TableHeader>
                <TableColumn>INVOICE</TableColumn>
                <TableColumn>CLIENT</TableColumn>
                <TableColumn>SOURCE</TableColumn>
                <TableColumn>DATE</TableColumn>
                <TableColumn>AMOUNT</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>SUMMARY</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={`invoice-${invoice.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 rounded-lg p-2">
                          <DocumentTextIcon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{invoice.name}</p>
                          <p className="text-sm text-default-500">ID: {invoice.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center">
                          <span className="text-xs font-medium text-secondary">
                            {invoice.client && typeof invoice.client === 'string' && invoice.client.length > 0 ? invoice.client.charAt(0) : '?'}
                          </span>
                        </div>
                        <span className="font-medium">{invoice.client}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getSourceChip(invoice.source)}
                    </TableCell>
                                                       <TableCell>
                                     <div>
                                       <p className="font-medium">
                                         {invoice.date ? new Date(invoice.date).toLocaleDateString() : 'N/A'}
                                       </p>
                                       <p className="text-sm text-default-500">
                                         {invoice.created_at ? 
                                           `${Math.floor((Date.now() - new Date(invoice.created_at).getTime()) / (1000 * 60 * 60 * 24))} days ago` : 
                                           'Unknown'
                                         }
                                       </p>
                                     </div>
                                   </TableCell>
                    <TableCell>
                      <span className="font-semibold text-success">
                        {typeof invoice.amount === 'number' 
                          ? `$${invoice.amount.toLocaleString()}` 
                          : invoice.amount || 'N/A'
                        }
                      </span>
                    </TableCell>
                    <TableCell>
                      {getStatusChip(invoice.status)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        color={invoice.summary ? "success" : "warning"}
                        variant="flat"
                      >
                        {invoice.summary ? "Available" : "Pending AI Summary"}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <Dropdown>
                        <DropdownTrigger>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                          >
                            <EllipsisVerticalIcon className="w-4 h-4" />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu>
                          <DropdownItem
                            key="view"
                            startContent={<EyeIcon className="w-4 h-4" />}
                            isDisabled={!invoice.summary}
                            onClick={() => {
                              if (invoice.summary) {
                                // Convert summary object to readable text
                                const summaryText = typeof invoice.summary === 'string' 
                                  ? invoice.summary 
                                  : generateSummaryText(invoice.summary);
                                setSummaryToShow(summaryText);
                                setSummaryModalOpen(true);
                              }
                            }}
                          >
                            View Summary
                          </DropdownItem>
                          {!invoice.summary && (
                            <DropdownItem
                              key="summarize"
                              startContent={<DocumentTextIcon className="w-4 h-4" />}
                              onClick={async () => {
                                try {
                                  // Get the current session token
                                  const { data: { session } } = await supabase.auth.getSession();
                                  const token = session?.access_token;
                                  
                                  if (!token) {
                                    toast.error('Please log in to generate summaries');
                                    return;
                                  }
                                  
                                  const response = await fetch('/api/summarize', {
                                    method: 'POST',
                                    headers: {
                                      'Content-Type': 'application/json',
                                      'Authorization': `Bearer ${token}`,
                                    },
                                    body: JSON.stringify({
                                      invoiceId: invoice.id,
                                    }),
                                  });
                                  
                                  console.log('[Frontend] Sending invoice ID:', invoice.id);
                                  console.log('[Frontend] Invoice details:', invoice);

                                  const result = await response.json();
                                  
                                  if (result.success) {
                                    toast.success(result.message || 'Invoice summarized successfully!');
                                    // Refresh invoices to show updated summary
                                    const { data: { user } } = await supabase.auth.getUser();
                                    if (user) {
                                      const { data, error } = await supabase
                                        .from("invoices")
                                        .select("*")
                                        .eq("user_id", user.id)
                                        .order("created_at", { ascending: false });
                                      if (!error) setInvoices(data || []);
                                    }
                                  } else {
                                    toast.error(`Failed to summarize invoice: ${result.error}`);
                                  }
                                } catch (error) {
                                  console.error('Error summarizing invoice:', error);
                                  toast.error('Failed to summarize invoice. Please try again.');
                                }
                              }}
                            >
                              Generate AI Summary
                            </DropdownItem>
                          )}
                          <DropdownItem
                            key="download"
                            startContent={<DocumentArrowDownIcon className="w-4 h-4" />}
                            onClick={() => window.open(invoice.file_url, "_blank")}
                          >
                            Download PDF
                          </DropdownItem>
                          <DropdownItem
                            key="email"
                            startContent={<EnvelopeIcon className="w-4 h-4" />}
                            isDisabled={!invoice.summary}
                            onClick={() => handleEmailInvoice(invoice)}
                          >
                            Send via Email
                          </DropdownItem>
                          <DropdownItem
                            key="delete"
                            className="text-danger"
                            color="danger"
                            startContent={<TrashIcon className="w-4 h-4" />}
                            onPress={() => handleDeleteInvoice(invoice.id)}
                          >
                            Delete
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            )}
          </CardBody>
        </Card>

        {/* Upload Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="2xl">
          <ModalContent>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <CloudArrowUpIcon className="w-6 h-6 text-primary" />
                Upload Invoices
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-6">
                <div className="border-2 border-dashed border-divider rounded-lg p-8 text-center">
                  <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <CloudArrowUpIcon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Drag & Drop Files Here</h3>
                  <p className="text-default-600 mb-4">
                    Or click to browse your computer for invoice files
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    multiple
                    onChange={handleFileChange}
                    disabled={uploading}
                  />
                  {selectedFiles.length > 0 && (
                    <div className="mt-4 text-left">
                      <p className="font-medium mb-2">Selected files:</p>
                      <ul className="text-sm list-disc ml-6">
                        {selectedFiles.map((file) => (
                          <li key={file.name}>{file.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {uploadError && <div className="text-danger text-sm mt-2">{uploadError}</div>}
                  {uploadSuccess && <div className="text-success text-sm mt-2">{uploadSuccess}</div>}
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold">Supported Formats</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <DocumentTextIcon className="w-4 h-4 text-primary" />
                      <span className="text-sm">PDF Documents</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DocumentTextIcon className="w-4 h-4 text-secondary" />
                      <span className="text-sm">PNG Images</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DocumentTextIcon className="w-4 h-4 text-success" />
                      <span className="text-sm">JPG Images</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DocumentTextIcon className="w-4 h-4 text-warning" />
                      <span className="text-sm">Scanned Documents</span>
                    </div>
                  </div>
                </div>

                <div className="bg-secondary/10 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <InboxIcon className="w-4 h-4 text-secondary" />
                    <span className="font-medium text-sm">Email Detection</span>
                  </div>
                  <p className="text-sm text-default-600">
                    Don't want to upload manually? Connect your email and we'll automatically detect and process invoice attachments.
                  </p>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose} disabled={uploading}>
                Cancel
              </Button>
              <Button color="primary" onPress={handleUpload} isLoading={uploading} disabled={selectedFiles.length === 0 || uploading}>
                Upload Files
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Summary Modal */}
        <Modal isOpen={summaryModalOpen} onClose={() => setSummaryModalOpen(false)} size="4xl">
          <ModalContent>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <DocumentTextIcon className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-semibold">Invoice Summary</h3>
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="max-h-[70vh] overflow-y-auto">
                <pre className="whitespace-pre-wrap text-default-700 text-sm leading-relaxed font-mono bg-default-50 p-4 rounded-lg border">
                  {summaryToShow}
                </pre>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onPress={() => setSummaryModalOpen(false)}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
          <ModalContent>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <TrashIcon className="w-6 h-6 text-danger" />
                <h3 className="text-xl font-semibold">Delete Invoice</h3>
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <div className="bg-danger/10 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrashIcon className="w-5 h-5 text-danger" />
                    <span className="font-medium text-danger">Warning</span>
                  </div>
                  <p className="text-sm text-default-600">
                    Are you sure you want to delete this invoice? This action cannot be undone.
                  </p>
                </div>
                {invoiceToDelete && (
                  <div className="bg-default-50 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Invoice Details:</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Name:</strong> {invoiceToDelete.name || 'N/A'}</p>
                      <p><strong>Client:</strong> {invoiceToDelete.client || 'N/A'}</p>
                      <p><strong>Date:</strong> {invoiceToDelete.date ? new Date(invoiceToDelete.date).toLocaleDateString() : 'N/A'}</p>
                      <p><strong>Amount:</strong> {invoiceToDelete.amount ? 
                        (typeof invoiceToDelete.amount === 'number' 
                          ? `$${invoiceToDelete.amount.toLocaleString()}` 
                          : `$${parseFloat(invoiceToDelete.amount).toLocaleString()}`
                        ) : 'N/A'}</p>
                      <p><strong>Status:</strong> {invoiceToDelete.status || 'N/A'}</p>
                      <p><strong>Source:</strong> {invoiceToDelete.source || 'N/A'}</p>
                      <p><strong>Created:</strong> {invoiceToDelete.created_at ? new Date(invoiceToDelete.created_at).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={() => setDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                color="danger" 
                onPress={confirmDeleteInvoice}
                startContent={<TrashIcon className="w-4 h-4" />}
              >
                Delete Invoice
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Email Modal */}
        <Modal isOpen={emailModalOpen} onClose={() => setEmailModalOpen(false)}>
          <ModalContent>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <EnvelopeIcon className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-semibold">Send Invoice Summary</h3>
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                {invoiceToEmail && (
                  <div className="bg-default-50 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Invoice Details:</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Name:</strong> {invoiceToEmail.name || 'N/A'}</p>
                      <p><strong>Client:</strong> {invoiceToEmail.client || 'N/A'}</p>
                      <p><strong>Date:</strong> {invoiceToEmail.date ? new Date(invoiceToEmail.date).toLocaleDateString() : 'N/A'}</p>
                      <p><strong>Amount:</strong> {invoiceToEmail.amount ? 
                        (typeof invoiceToEmail.amount === 'number' 
                          ? `$${invoiceToEmail.amount.toLocaleString()}` 
                          : `$${parseFloat(invoiceToEmail.amount).toLocaleString()}`
                        ) : 'N/A'}</p>
                    </div>
                  </div>
                )}
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-default-700 mb-2 block">
                      Additional Recipient (Optional)
                    </label>
                    <Input
                      type="email"
                      placeholder="Enter email address to send to additional recipient"
                      value={additionalRecipient}
                      onChange={(e) => setAdditionalRecipient(e.target.value)}
                      variant="bordered"
                    />
                    <p className="text-xs text-default-500 mt-1">
                      Leave empty to send to your registered email address
                    </p>
                  </div>
                  
                  <div className="bg-primary/10 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <EnvelopeIcon className="w-4 h-4 text-primary" />
                      <span className="font-medium text-sm">Email Summary</span>
                    </div>
                    <p className="text-sm text-default-600">
                      The invoice summary will be sent as a formatted HTML email with all the key details and AI-generated insights.
                    </p>
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={() => setEmailModalOpen(false)} disabled={sendingEmail}>
                Cancel
              </Button>
              <Button 
                color="primary" 
                onPress={confirmSendEmail}
                isLoading={sendingEmail}
                startContent={<EnvelopeIcon className="w-4 h-4" />}
              >
                Send Email
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </DashboardLayout>
  );
} 