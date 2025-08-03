import { supabase } from "./supabaseClient";

// Utility function to extract text from PDF buffer - SERVER SIDE ONLY
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Use pdf2json which works reliably without test file access issues
    const PDFParser = require("pdf2json");

    return new Promise((resolve, reject) => {
      const pdfParser = new PDFParser();

      pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
        try {
          let text = "";

          if (pdfData.Pages && pdfData.Pages.length > 0) {
            pdfData.Pages.forEach((page: any) => {
              if (page.Texts && page.Texts.length > 0) {
                page.Texts.forEach((textItem: any) => {
                  if (textItem.R && textItem.R.length > 0) {
                    textItem.R.forEach((run: any) => {
                      if (run.T) {
                        text += decodeURIComponent(run.T) + " ";
                      }
                    });
                  }
                });
              }
            });
          }
          resolve(text.trim());
        } catch (error) {
          reject(error);
        }
      });

      pdfParser.on("pdfParser_dataError", (error: any) => {
        reject(error);
      });

      // Parse the buffer
      pdfParser.parseBuffer(buffer);
    });
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw new Error("Failed to extract text from PDF");
  }
}

// Utility function to download file from Supabase Storage - SERVER SIDE ONLY
export async function downloadFileFromStorage(
  fileUrl: string,
  bucket: string = "invoices",
): Promise<Buffer> {
  try {
    const filePath = fileUrl.split("/").slice(-2).join("/");
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(bucket)
      .download(filePath);

    if (downloadError || !fileData) {
      throw new Error("Failed to download file from storage");
    }

    const arrayBuffer = await fileData.arrayBuffer();

    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error("Error downloading file from storage:", error);
    throw new Error("Failed to download file from storage");
  }
}
