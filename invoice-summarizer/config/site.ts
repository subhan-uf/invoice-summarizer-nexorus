export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "AI Invoice Summarizer by Subhan",
  description:
    "Transform your invoices into clear, actionable summaries in seconds with AI-powered analysis.",
  navItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Features",
      href: "/#features",
    },
    {
      label: "Pricing",
      href: "/#pricing",
    },
    {
      label: "Login",
      href: "/login",
    },
  ],
  navMenuItems: [
    {
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      label: "Invoices",
      href: "/invoices",
    },
    {
      label: "Clients",
      href: "/clients",
    },
    {
      label: "Email History",
      href: "/email-history",
    },
    {
      label: "Settings",
      href: "/settings",
    },
    {
      label: "Logout",
      href: "/logout",
    },
  ],
  links: {
    github: "https://github.com/subhan-uf",
  
    docs: "https://docs.invoice-summarizer.com",
   
    sponsor: "https://patreon.com/subhan",
  },
};
