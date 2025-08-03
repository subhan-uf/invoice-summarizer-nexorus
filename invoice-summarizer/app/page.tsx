import { Link } from "@heroui/link";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Avatar } from "@heroui/avatar";
import { Divider } from "@heroui/divider";
import { button as buttonStyles } from "@heroui/theme";
import {
  DocumentTextIcon,
  ShieldCheckIcon,
  ClockIcon,
  ChartBarIcon,
  CheckIcon,
  StarIcon,
  UserIcon,
  EnvelopeIcon,
  SparklesIcon,
  BoltIcon,
  LockClosedIcon,
  GlobeAltIcon,
  InboxIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";

import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-content1">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />

        <div className="relative flex flex-col items-center justify-center gap-6 py-20 md:py-32 px-6">
          <div className="inline-block max-w-5xl text-center justify-center">
            <div className="flex justify-center mb-6">
              <Chip
                color="primary"
                size="lg"
                startContent={<SparklesIcon className="w-4 h-4" />}
                variant="flat"
              >
                ✨ AI-Powered Invoice Analysis
              </Chip>
            </div>
            <h1 className={title({ size: "lg" })}>
              Transform Your&nbsp;
              <span className={title({ color: "violet" })}>Invoices</span>
              <br />
              Into Clear, Actionable&nbsp;
              <span className={title({ color: "violet" })}>Summaries</span>
            </h1>
            <div
              className={subtitle({ class: "mt-6 max-w-3xl mx-auto text-lg" })}
            >
              Automatically detect invoice emails or manually upload files. Get
              instant AI-powered summaries that highlight key details, payment
              terms, and actionable insights. Download as PDF or send directly
              via email.
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-10">
            <Button
              as={Link}
              className={buttonStyles({
                color: "primary",
                radius: "full",
                variant: "shadow",
                size: "lg",
              })}
              href="/signup"
              size="lg"
              startContent={<SparklesIcon className="w-5 h-5" />}
            >
              Start Free Trial
            </Button>
            <Button
              as={Link}
              className={buttonStyles({
                variant: "bordered",
                radius: "full",
                size: "lg",
              })}
              href="/login"
              size="lg"
              startContent={<UserIcon className="w-5 h-5" />}
            >
              Sign In
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center gap-8 mt-12 text-sm text-default-500">
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="w-4 h-4 text-success" />
              <span>Bank-level Security</span>
            </div>
            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-primary" />
              <span>5-second Processing</span>
            </div>
            <div className="flex items-center gap-2">
              <GlobeAltIcon className="w-4 h-4 text-secondary" />
              <span>99.9% Uptime</span>
            </div>
          </div>
        </div>

        {/* Product Preview */}
        <div className="relative px-6 pb-20">
          <Card className="max-w-6xl mx-auto bg-content1/30 backdrop-blur-xl border-1 border-divider/50 shadow-2xl">
            <CardBody className="p-12">
              <div className="flex items-center justify-center h-80 bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/10 rounded-2xl border-1 border-divider/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
                <div className="text-center relative z-10">
                  <div className="bg-content1/80 backdrop-blur-sm rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                    <DocumentTextIcon className="w-12 h-12 text-primary" />
                  </div>
                  <p className="text-default-600 text-lg font-medium">
                    Interactive Demo Coming Soon
                  </p>
                  <p className="text-default-500 text-sm mt-2">
                    Experience the power of AI invoice processing
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-content1/20" id="features">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="text-center mb-20">
            <div className="flex justify-center mb-6">
              <Chip color="secondary" size="lg" variant="flat">
                How It Works
              </Chip>
            </div>
            <h2 className={title({ size: "lg" })}>Smart Invoice Processing</h2>
            <p
              className={subtitle({ class: "mt-6 max-w-3xl mx-auto text-lg" })}
            >
              From email detection to PDF output - streamline your entire
              invoice workflow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-content1/50 backdrop-blur-sm border-1 border-divider/50 hover:border-primary/30 transition-all duration-300 hover:scale-105">
              <CardBody className="p-8">
                <div className="bg-primary/10 rounded-full p-4 w-16 h-16 flex items-center justify-center mb-6">
                  <InboxIcon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Email Detection</h3>
                <p className="text-default-600 leading-relaxed">
                  Our system automatically detects invoice emails and processes
                  them instantly. No manual intervention needed.
                </p>
              </CardBody>
            </Card>

            <Card className="bg-content1/50 backdrop-blur-sm border-1 border-divider/50 hover:border-primary/30 transition-all duration-300 hover:scale-105">
              <CardBody className="p-8">
                <div className="bg-success/10 rounded-full p-4 w-16 h-16 flex items-center justify-center mb-6">
                  <BoltIcon className="w-8 h-8 text-success" />
                </div>
                <h3 className="text-xl font-semibold mb-4">AI Summarization</h3>
                <p className="text-default-600 leading-relaxed">
                  Advanced AI extracts key details, amounts, dates, and payment
                  terms in under 5 seconds.
                </p>
              </CardBody>
            </Card>

            <Card className="bg-content1/50 backdrop-blur-sm border-1 border-divider/50 hover:border-primary/30 transition-all duration-300 hover:scale-105">
              <CardBody className="p-8">
                <div className="bg-secondary/10 rounded-full p-4 w-16 h-16 flex items-center justify-center mb-6">
                  <DocumentArrowDownIcon className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">PDF Output</h3>
                <p className="text-default-600 leading-relaxed">
                  Download professional PDF summaries or send them directly via
                  email to clients and team members.
                </p>
              </CardBody>
            </Card>

            <Card className="bg-content1/50 backdrop-blur-sm border-1 border-divider/50 hover:border-primary/30 transition-all duration-300 hover:scale-105">
              <CardBody className="p-8">
                <div className="bg-warning/10 rounded-full p-4 w-16 h-16 flex items-center justify-center mb-6">
                  <EnvelopeIcon className="w-8 h-8 text-warning" />
                </div>
                <h3 className="text-xl font-semibold mb-4">
                  Email Integration
                </h3>
                <p className="text-default-600 leading-relaxed">
                  Send summaries directly to any email address with one click.
                  Perfect for client communication.
                </p>
              </CardBody>
            </Card>

            <Card className="bg-content1/50 backdrop-blur-sm border-1 border-divider/50 hover:border-primary/30 transition-all duration-300 hover:scale-105">
              <CardBody className="p-8">
                <div className="bg-danger/10 rounded-full p-4 w-16 h-16 flex items-center justify-center mb-6">
                  <LockClosedIcon className="w-8 h-8 text-danger" />
                </div>
                <h3 className="text-xl font-semibold mb-4">
                  Secure Processing
                </h3>
                <p className="text-default-600 leading-relaxed">
                  Bank-level encryption ensures your invoice data is always
                  protected and never stored permanently.
                </p>
              </CardBody>
            </Card>

            <Card className="bg-content1/50 backdrop-blur-sm border-1 border-divider/50 hover:border-primary/30 transition-all duration-300 hover:scale-105">
              <CardBody className="p-8">
                <div className="bg-primary/10 rounded-full p-4 w-16 h-16 flex items-center justify-center mb-6">
                  <ChartBarIcon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">
                  Dashboard Analytics
                </h3>
                <p className="text-default-600 leading-relaxed">
                  Track all your processed invoices, view summaries, and manage
                  your workflow from one central dashboard.
                </p>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-gradient-to-br from-content1/20 to-background">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="text-center mb-20">
            <div className="flex justify-center mb-6">
              <Chip color="primary" size="lg" variant="flat">
                Simple, Transparent Pricing
              </Chip>
            </div>
            <h2 className={title({ size: "lg" })}>Choose Your Plan</h2>
            <p
              className={subtitle({ class: "mt-6 max-w-2xl mx-auto text-lg" })}
            >
              Start free and scale as you grow. No hidden fees, no surprises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <Card className="bg-content1/50 backdrop-blur-sm border-1 border-divider/50 relative">
              <CardBody className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">Free</h3>
                  <div className="text-4xl font-bold text-primary mb-2">$0</div>
                  <p className="text-default-600">
                    Perfect for getting started
                  </p>
                </div>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3">
                    <CheckIcon className="w-5 h-5 text-success" />
                    <span>10 invoices per month</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckIcon className="w-5 h-5 text-success" />
                    <span>Email detection</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckIcon className="w-5 h-5 text-success" />
                    <span>PDF downloads</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckIcon className="w-5 h-5 text-success" />
                    <span>Basic summaries</span>
                  </div>
                </div>
                <Button
                  as={Link}
                  className="w-full"
                  color="primary"
                  href="/signup"
                  size="lg"
                  variant="bordered"
                >
                  Get Started Free
                </Button>
              </CardBody>
            </Card>

            {/* Pro Plan */}
            <Card className="bg-content1/50 backdrop-blur-sm border-2 border-primary/50 relative scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Chip color="primary" size="sm" variant="solid">
                  Most Popular
                </Chip>
              </div>
              <CardBody className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">Pro</h3>
                  <div className="text-4xl font-bold text-primary mb-2">
                    $29
                  </div>
                  <p className="text-default-600">For growing businesses</p>
                </div>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3">
                    <CheckIcon className="w-5 h-5 text-success" />
                    <span>Unlimited invoices</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckIcon className="w-5 h-5 text-success" />
                    <span>Advanced AI summaries</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckIcon className="w-5 h-5 text-success" />
                    <span>Email sending</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckIcon className="w-5 h-5 text-success" />
                    <span>Custom templates</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckIcon className="w-5 h-5 text-success" />
                    <span>Analytics dashboard</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckIcon className="w-5 h-5 text-success" />
                    <span>Priority support</span>
                  </div>
                </div>
                <Button
                  as={Link}
                  className="w-full"
                  color="primary"
                  href="/signup"
                  size="lg"
                >
                  Start Pro Trial
                </Button>
              </CardBody>
            </Card>

            {/* Enterprise Plan */}
            <Card className="bg-content1/50 backdrop-blur-sm border-1 border-divider/50 relative">
              <CardBody className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
                  <div className="text-4xl font-bold text-primary mb-2">
                    Custom
                  </div>
                  <p className="text-default-600">For large organizations</p>
                </div>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3">
                    <CheckIcon className="w-5 h-5 text-success" />
                    <span>Everything in Pro</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckIcon className="w-5 h-5 text-success" />
                    <span>Custom integrations</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckIcon className="w-5 h-5 text-success" />
                    <span>Dedicated support</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckIcon className="w-5 h-5 text-success" />
                    <span>SLA guarantees</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckIcon className="w-5 h-5 text-success" />
                    <span>On-premise option</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckIcon className="w-5 h-5 text-success" />
                    <span>Custom training</span>
                  </div>
                </div>
                <Button
                  as={Link}
                  className="w-full"
                  color="primary"
                  href="/contact"
                  size="lg"
                  variant="bordered"
                >
                  Contact Sales
                </Button>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-content1/20">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="text-center mb-20">
            <div className="flex justify-center mb-6">
              <Chip color="secondary" size="lg" variant="flat">
                Trusted by Businesses Worldwide
              </Chip>
            </div>
            <h2 className={title({ size: "lg" })}>What Our Customers Say</h2>
            <p
              className={subtitle({ class: "mt-6 max-w-2xl mx-auto text-lg" })}
            >
              Join thousands of satisfied customers who&apos;ve transformed
              their invoice processing
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-content1/50 backdrop-blur-sm border-1 border-divider/50">
              <CardBody className="p-8">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className="w-5 h-5 text-warning fill-current"
                    />
                  ))}
                </div>
                <p className="text-default-600 mb-6 leading-relaxed">
                  &ldquo;The email detection feature is incredible! Invoices are
                  automatically processed and summarized. The PDF output looks
                  professional and the email sending saves us hours.&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <Avatar
                    name="Sarah Johnson"
                    src="https://i.pravatar.cc/150?u=1"
                  />
                  <div>
                    <p className="font-semibold">Sarah Johnson</p>
                    <p className="text-sm text-default-600">CFO, TechCorp</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="bg-content1/50 backdrop-blur-sm border-1 border-divider/50">
              <CardBody className="p-8">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className="w-5 h-5 text-warning fill-current"
                    />
                  ))}
                </div>
                <p className="text-default-600 mb-6 leading-relaxed">
                  &ldquo;Perfect for our accounting team. We can upload invoices
                  manually or let the system detect them from emails. The
                  summaries are incredibly detailed and accurate.&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <Avatar
                    name="Michael Chen"
                    src="https://i.pravatar.cc/150?u=2"
                  />
                  <div>
                    <p className="font-semibold">Michael Chen</p>
                    <p className="text-sm text-default-600">
                      Founder, StartupXYZ
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="bg-content1/50 backdrop-blur-sm border-1 border-divider/50">
              <CardBody className="p-8">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className="w-5 h-5 text-warning fill-current"
                    />
                  ))}
                </div>
                <p className="text-default-600 mb-6 leading-relaxed">
                  &ldquo;The ability to send summarized invoices directly via
                  email is a game-changer. Our clients love the professional PDF
                  format and clear summaries.&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <Avatar
                    name="Emma Davis"
                    src="https://i.pravatar.cc/150?u=3"
                  />
                  <div>
                    <p className="font-semibold">Emma Davis</p>
                    <p className="text-sm text-default-600">
                      Accountant, Freelance
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-gradient-to-br from-background to-content1/20">
        <div className="container mx-auto max-w-4xl px-6">
          <div className="text-center mb-20">
            <div className="flex justify-center mb-6">
              <Chip color="primary" size="lg" variant="flat">
                Frequently Asked Questions
              </Chip>
            </div>
            <h2 className={title({ size: "lg" })}>
              Everything You Need to Know
            </h2>
            <p
              className={subtitle({ class: "mt-6 max-w-2xl mx-auto text-lg" })}
            >
              Get answers to common questions about AI Invoice Summarizer
            </p>
          </div>

          <div className="space-y-6">
            <Card className="bg-content1/50 backdrop-blur-sm border-1 border-divider/50 hover:border-primary/30 transition-all duration-300">
              <CardBody className="p-8">
                <h3 className="text-xl font-semibold mb-4 text-primary">
                  How does email detection work?
                </h3>
                <p className="text-default-600 leading-relaxed">
                  Our system automatically scans your connected email for
                  invoice attachments and processes them instantly. You can also
                  manually upload files for immediate processing.
                </p>
              </CardBody>
            </Card>

            <Card className="bg-content1/50 backdrop-blur-sm border-1 border-divider/50 hover:border-primary/30 transition-all duration-300">
              <CardBody className="p-8">
                <h3 className="text-xl font-semibold mb-4 text-primary">
                  What output formats are available?
                </h3>
                <p className="text-default-600 leading-relaxed">
                  You can download professional PDF summaries or send them
                  directly via email to any recipient. Both options maintain the
                  same high-quality formatting and detail.
                </p>
              </CardBody>
            </Card>

            <Card className="bg-content1/50 backdrop-blur-sm border-1 border-divider/50 hover:border-primary/30 transition-all duration-300">
              <CardBody className="p-8">
                <h3 className="text-xl font-semibold mb-4 text-primary">
                  Is my data secure?
                </h3>
                <p className="text-default-600 leading-relaxed">
                  Absolutely. We use bank-level encryption and never store your
                  invoice data permanently. All processing is done securely and
                  your data is automatically deleted after processing.
                </p>
              </CardBody>
            </Card>

            <Card className="bg-content1/50 backdrop-blur-sm border-1 border-divider/50 hover:border-primary/30 transition-all duration-300">
              <CardBody className="p-8">
                <h3 className="text-xl font-semibold mb-4 text-primary">
                  Can I customize the email templates?
                </h3>
                <p className="text-default-600 leading-relaxed">
                  Yes! Pro users can customize email templates with their
                  branding and messaging. Enterprise users get full template
                  customization and white-label options.
                </p>
              </CardBody>
            </Card>

            <Card className="bg-content1/50 backdrop-blur-sm border-1 border-divider/50 hover:border-primary/30 transition-all duration-300">
              <CardBody className="p-8">
                <h3 className="text-xl font-semibold mb-4 text-primary">
                  What if I&apos;m not satisfied?
                </h3>
                <p className="text-default-600 leading-relaxed">
                  We offer a 30-day money-back guarantee. If you&apos;re not
                  completely satisfied with our service, we&apos;ll refund your
                  subscription no questions asked.
                </p>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/10">
        <div className="container mx-auto max-w-4xl px-6 text-center">
          <h2 className={title({ size: "lg" })}>
            Ready to Transform Your Invoice Processing?
          </h2>
          <p className={subtitle({ class: "mt-6 mb-10 text-lg" })}>
            Join thousands of businesses that have already streamlined their
            workflow with AI Invoice Summarizer
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              as={Link}
              className="text-lg px-8"
              color="primary"
              href="/signup"
              size="lg"
              startContent={<SparklesIcon className="w-6 h-6" />}
            >
              Start Free Trial
            </Button>
            <Button
              as={Link}
              className="text-lg px-8"
              color="primary"
              href="/contact"
              size="lg"
              startContent={<EnvelopeIcon className="w-6 h-6" />}
              variant="bordered"
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-divider bg-content1/20">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="text-xl font-bold mb-4">AI Invoice Summarizer</h3>
              <p className="text-default-600 leading-relaxed">
                Transform your invoices into clear, actionable summaries with
                AI-powered analysis.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    className="text-default-600 hover:text-primary transition-colors"
                    href="/features"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-default-600 hover:text-primary transition-colors"
                    href="/pricing"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-default-600 hover:text-primary transition-colors"
                    href="/docs"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-default-600 hover:text-primary transition-colors"
                    href="/api"
                  >
                    API
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    className="text-default-600 hover:text-primary transition-colors"
                    href="/about"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-default-600 hover:text-primary transition-colors"
                    href="/contact"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-default-600 hover:text-primary transition-colors"
                    href="/careers"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-default-600 hover:text-primary transition-colors"
                    href="/blog"
                  >
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    className="text-default-600 hover:text-primary transition-colors"
                    href="/privacy"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-default-600 hover:text-primary transition-colors"
                    href="/terms"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-default-600 hover:text-primary transition-colors"
                    href="/cookies"
                  >
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link
                    className="text-default-600 hover:text-primary transition-colors"
                    href="/security"
                  >
                    Security
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <Divider className="my-8" />
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-default-600">
              © 2024 AI Invoice Summarizer by Subhan. All rights reserved.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link
                className="text-default-600 hover:text-primary transition-colors"
                href={siteConfig.links.twitter}
              >
                Twitter
              </Link>
              <Link
                className="text-default-600 hover:text-primary transition-colors"
                href={siteConfig.links.github}
              >
                GitHub
              </Link>
              <Link
                className="text-default-600 hover:text-primary transition-colors"
                href={siteConfig.links.discord}
              >
                Discord
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
