import { supabase } from "./supabaseClient";

// Utility function to validate invoice data
export function validateInvoiceData(invoice: any): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!invoice.id) errors.push("Invoice ID is required");
  if (!invoice.user_id) errors.push("User ID is required");
  if (!invoice.name) errors.push("Invoice name is required");
  if (!invoice.file_url) errors.push("File URL is required");

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Utility function to format currency
export function formatCurrency(
  amount: string | number,
  currency: string = "USD",
): string {
  if (!amount) return "N/A";

  const numAmount =
    typeof amount === "string"
      ? parseFloat(amount.replace(/[^0-9.-]/g, ""))
      : amount;

  if (isNaN(numAmount)) return "N/A";

  // Ensure currency is valid
  const validCurrency = currency && currency.length === 3 ? currency : "USD";

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: validCurrency,
    }).format(numAmount);
  } catch (error) {
    // Fallback to simple formatting if currency is invalid
    return `$${numAmount.toFixed(2)}`;
  }
}

// Utility function to sanitize text for email
export function sanitizeText(text: string): string {
  if (!text) return "";

  return text
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .trim();
}

// Utility function to generate invoice summary text
export function generateSummaryText(summary: any): string {
  if (!summary) return "No summary available";

  let text = "";

  // Main summary
  if (summary.summary) {
    text += `📋 SUMMARY\n${summary.summary}\n\n`;
  }

  // Key Details
  if (summary.keyDetails) {
    text += `🔑 KEY DETAILS\n`;
    if (summary.keyDetails.vendor)
      text += `• Vendor: ${summary.keyDetails.vendor}\n`;
    if (summary.keyDetails.invoiceNumber)
      text += `• Invoice Number: ${summary.keyDetails.invoiceNumber}\n`;
    if (summary.keyDetails.dueDate)
      text += `• Due Date: ${summary.keyDetails.dueDate}\n`;
    if (summary.keyDetails.paymentTerms)
      text += `• Payment Terms: ${summary.keyDetails.paymentTerms}\n`;
    if (summary.keyDetails.subtotal)
      text += `• Subtotal: ${summary.keyDetails.subtotal}\n`;
    if (summary.keyDetails.taxAmount)
      text += `• Tax Amount: ${summary.keyDetails.taxAmount}\n`;
    text += "\n";
  }

  // Client Information
  if (summary.clientInfo) {
    text += `🏢 CLIENT INFORMATION\n`;
    if (summary.clientInfo.company)
      text += `• Company: ${summary.clientInfo.company}\n`;
    if (summary.clientInfo.name)
      text += `• Contact: ${summary.clientInfo.name}\n`;
    if (summary.clientInfo.email)
      text += `• Email: ${summary.clientInfo.email}\n`;
    if (summary.clientInfo.phone)
      text += `• Phone: ${summary.clientInfo.phone}\n`;
    if (summary.clientInfo.address)
      text += `• Address: ${summary.clientInfo.address}\n`;
    text += "\n";
  }

  // Line Items
  if (summary.lineItems && summary.lineItems.length > 0) {
    text += `📝 LINE ITEMS\n`;
    summary.lineItems.forEach((item: any, index: number) => {
      text += `${index + 1}. ${item.description || "Item"}\n`;
      if (item.quantity) text += `   Quantity: ${item.quantity}\n`;
      if (item.unitPrice) text += `   Unit Price: ${item.unitPrice}\n`;
      if (item.total) text += `   Total: ${item.total}\n`;
      text += "\n";
    });
  }

  // Total Amount
  if (summary.totalAmount) {
    text += `💰 TOTAL AMOUNT: ${formatCurrency(summary.totalAmount, summary.currency || "USD")}\n\n`;
  }

  // Business Context
  if (summary.businessContext) {
    text += `💼 BUSINESS CONTEXT\n${summary.businessContext}\n\n`;
  }

  // Notes
  if (summary.notes) {
    text += `📌 NOTES\n${summary.notes}\n`;
  }

  return text.trim();
}

// Utility function to handle API errors
export function handleApiError(error: any): {
  message: string;
  status: number;
} {
  console.error("API Error:", error);

  if (error.message?.includes("authentication")) {
    return { message: "Authentication failed", status: 401 };
  }

  if (error.message?.includes("not found")) {
    return { message: "Resource not found", status: 404 };
  }

  if (error.message?.includes("validation")) {
    return { message: "Invalid request data", status: 400 };
  }

  return { message: "Internal server error", status: 500 };
}

// Utility function to log operations
export async function logOperation(
  operation: string,
  details: any,
  userId: string,
) {
  try {
    await supabase.from("email_history").insert({
      user_id: userId,
      invoice_id: details.invoiceId || null,
      recipient: "System",
      subject: `System: ${operation}`,
      client: details.client || null,
      invoice_name: details.invoiceName || null,
      status: "system",
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString(),
    });
  } catch (error) {
    console.error("Error logging operation:", error);
  }
}

export function getDefaultAvatarUrl(name?: string, email?: string) {
  // Use name or email to generate a consistent avatar
  const identifier = name || email || "user";
  const encoded = encodeURIComponent(identifier);
  
  // Use a reliable avatar service with fallback
  return `https://ui-avatars.com/api/?name=${encoded}&background=6366f1&color=ffffff&size=150&bold=true&format=svg`;
}
