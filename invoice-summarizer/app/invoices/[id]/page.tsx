import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { Avatar } from "@heroui/avatar";
import { title, subtitle } from "@/components/primitives";
import DashboardLayout from "@/components/dashboard-layout";
import { 
  DocumentTextIcon,
  EnvelopeIcon,
  TrashIcon,
  ArrowLeftIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  UserIcon
} from "@heroicons/react/24/outline";

// Mock data
const invoiceData = {
  id: "INV-001",
  name: "Invoice_2024_001.pdf",
  date: "2024-01-15",
  status: "summarized",
  client: {
    name: "TechCorp",
    email: "accounts@techcorp.com",
    company: "TechCorp Solutions Inc.",
    avatar: "https://i.pravatar.cc/150?u=techcorp"
  },
  amount: "$1,250.00",
  size: "2.3 MB",
  summary: `This invoice from TechCorp Solutions Inc. details services rendered for web development and consulting work completed in January 2024.

Key Details:
• Invoice Number: INV-2024-001
• Issue Date: January 15, 2024
• Due Date: February 14, 2024
• Total Amount: $1,250.00

Services Provided:
• Website Development: $800.00
• UI/UX Design: $300.00
• Consulting Hours: $150.00

Payment Terms:
• Net 30 days
• Late payment fee: 1.5% per month
• Payment methods: Bank transfer, credit card

The invoice is well-structured and includes all necessary tax information. The client has a good payment history with no outstanding balances.`,
  metadata: {
    invoiceNumber: "INV-2024-001",
    issueDate: "January 15, 2024",
    dueDate: "February 14, 2024",
    paymentTerms: "Net 30",
    taxAmount: "$125.00",
    subtotal: "$1,125.00",
    total: "$1,250.00"
  }
};

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="light"
              startContent={<ArrowLeftIcon className="w-4 h-4" />}
            >
              Back
            </Button>
            <div>
              <h1 className={title({ size: "lg" })}>{invoiceData.name}</h1>
              <p className={subtitle({ class: "mt-2" })}>
                Invoice ID: {invoiceData.id}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              color="primary"
              startContent={<EnvelopeIcon className="w-4 h-4" />}
            >
              Email Summary
            </Button>
            <Button
              variant="bordered"
              startContent={<TrashIcon className="w-4 h-4" />}
              color="danger"
            >
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Invoice Summary */}
            <Card className="bg-content1/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <DocumentTextIcon className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">AI Generated Summary</h3>
                  <Chip
                    size="sm"
                    color="primary"
                    variant="flat"
                  >
                    Summarized
                  </Chip>
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="prose prose-sm max-w-none text-default-600">
                  {invoiceData.summary.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-4">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Invoice Metadata */}
            <Card className="bg-content1/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <h3 className="text-lg font-semibold">Invoice Details</h3>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <DocumentTextIcon className="w-4 h-4 text-default-500" />
                      <span className="text-sm font-medium">Invoice Number:</span>
                      <span className="text-sm text-default-600">{invoiceData.metadata.invoiceNumber}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-default-500" />
                      <span className="text-sm font-medium">Issue Date:</span>
                      <span className="text-sm text-default-600">{invoiceData.metadata.issueDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-default-500" />
                      <span className="text-sm font-medium">Due Date:</span>
                      <span className="text-sm text-default-600">{invoiceData.metadata.dueDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DocumentTextIcon className="w-4 h-4 text-default-500" />
                      <span className="text-sm font-medium">Payment Terms:</span>
                      <span className="text-sm text-default-600">{invoiceData.metadata.paymentTerms}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CurrencyDollarIcon className="w-4 h-4 text-default-500" />
                      <span className="text-sm font-medium">Subtotal:</span>
                      <span className="text-sm text-default-600">{invoiceData.metadata.subtotal}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CurrencyDollarIcon className="w-4 h-4 text-default-500" />
                      <span className="text-sm font-medium">Tax:</span>
                      <span className="text-sm text-default-600">{invoiceData.metadata.taxAmount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CurrencyDollarIcon className="w-4 h-4 text-default-500" />
                      <span className="text-sm font-medium">Total:</span>
                      <span className="text-sm font-semibold text-primary">{invoiceData.metadata.total}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DocumentTextIcon className="w-4 h-4 text-default-500" />
                      <span className="text-sm font-medium">File Size:</span>
                      <span className="text-sm text-default-600">{invoiceData.size}</span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Client Info */}
            <Card className="bg-content1/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <h3 className="text-lg font-semibold">Client Information</h3>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar
                    src={invoiceData.client.avatar}
                    name={invoiceData.client.name}
                    size="lg"
                  />
                  <div>
                    <p className="font-semibold">{invoiceData.client.name}</p>
                    <p className="text-sm text-default-600">{invoiceData.client.company}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-default-500" />
                    <span className="text-sm">{invoiceData.client.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <EnvelopeIcon className="w-4 h-4 text-default-500" />
                    <span className="text-sm">{invoiceData.client.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BuildingOfficeIcon className="w-4 h-4 text-default-500" />
                    <span className="text-sm">{invoiceData.client.company}</span>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-content1/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <h3 className="text-lg font-semibold">Quick Actions</h3>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="space-y-3">
                  <Button
                    className="w-full"
                    color="primary"
                    startContent={<EnvelopeIcon className="w-4 h-4" />}
                  >
                    Send Summary
                  </Button>
                  <Button
                    className="w-full"
                    variant="bordered"
                    startContent={<DocumentTextIcon className="w-4 h-4" />}
                  >
                    Download PDF
                  </Button>
                  <Button
                    className="w-full"
                    variant="bordered"
                    startContent={<DocumentTextIcon className="w-4 h-4" />}
                  >
                    View Original
                  </Button>
                </div>
              </CardBody>
            </Card>

            {/* Status Info */}
            <Card className="bg-content1/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <h3 className="text-lg font-semibold">Status</h3>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Processing Status</span>
                    <Chip
                      size="sm"
                      color="primary"
                      variant="flat"
                    >
                      Summarized
                    </Chip>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Email Status</span>
                    <Chip
                      size="sm"
                      color="default"
                      variant="flat"
                    >
                      Not Sent
                    </Chip>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Created</span>
                    <span className="text-sm text-default-600">2 hours ago</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 