# AI Invoice Summarizer Nexorus

[Visit the live website](https://ai-invoice-summarizer.netlify.app/)

## Overview

**AI Invoice Summarizer Nexorus** is an intelligent SaaS platform by Nexorus Technologies that automates invoice processing for modern businesses. Leveraging cutting-edge AI, automation, and seamless integrations, it extracts, summarizes, and manages invoices to save time, reduce errors, and streamline financial workflows.

Founded by Subhan Farooq, Nexorus Technologies is committed to transforming how businesses handle invoice data, offering a solution that is both powerful and user-friendly.

---

## Key Features

- **AI-Powered Summarization**: Automatically extracts and summarizes invoice details, including line items, vendors, dates, and amounts.
- **Email Integration**: Connect your Gmail account to detect invoices and automate their processing.
- **Automated Workflows**: Integrates with tools like n8n for business process automation.
- **Secure Storage**: Utilizes Supabase for robust data storage and authentication.
- **Comprehensive Dashboard**: View, search, and manage all invoice summaries in one place.
- **Export & Sharing**: Email summaries directly to clients, or export for further analysis.
- **Customizable**: Adaptable to a range of business needs and invoice formats.

---

## Technology Stack

- **Frontend:** Next.js 14, HeroUI v2, Tailwind CSS, Framer Motion, TypeScript, next-themes
- **Backend:** Next.js API routes, LangChain (AI integration), Nodemailer (email), Supabase (database/auth), PostgreSQL
- **Automation:** n8n (workflow automation)
- **AI:** OpenAI API for natural language invoice summarization

---

## Usage

- **Manual Upload:** Upload PDF invoices, generate AI-powered summaries, and email them to clients.
- **Email Automation:** Connect Gmail and let n8n automation detect invoices, trigger summarization, and store results.
- **Dashboard:** Monitor, review, and manage all processed invoices.

---

## API Endpoints (Backend)

- `POST /api/summarize` — Summarizes invoice by ID
- `POST /api/email` — Sends email with invoice summary
- `POST /api/webhook/n8n` — Receives invoice data from n8n automation

---

## Support & Troubleshooting

- Review console logs for errors
- Confirm environment variables are set
- Test individual components (PDF parsing, AI, email)
- Check Supabase logs for database issues

For issues or questions, open an issue on [GitHub](https://github.com/subhan-uf/invoice-summarizer-nexorus/issues).

---

## License

Licensed under the [MIT license](https://github.com/heroui-inc/next-app-template/blob/main/LICENSE).

---

## About Nexorus Technologies

Nexorus Technologies is dedicated to revolutionizing business workflows through intelligent automation and AI innovation. Founded in 2024, our mission is to help organizations save time, reduce errors, and focus on what matters most.

Meet our team and learn more on the [About page](https://ai-invoice-summarizer.netlify.app/about).

---

**Try it now:**  
[https://ai-invoice-summarizer.netlify.app/](https://ai-invoice-summarizer.netlify.app/)
