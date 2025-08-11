"use client";

import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Avatar } from "@heroui/avatar";
import { Link } from "@heroui/link";
import {
  BuildingOfficeIcon,
  UserIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  MapPinIcon,
  SparklesIcon,
  BoltIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  StarIcon,
} from "@heroicons/react/24/outline";

import { title, subtitle } from "@/components/primitives";
import { getDefaultAvatarUrl } from "@/lib/utils";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-content1">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />

        <div className="relative flex flex-col items-center justify-center gap-10 py-24 md:py-40 px-6">
          <div className="inline-block w-full max-w-7xl text-center justify-center">
            <div className="flex justify-center mb-6">
              <Chip
                color="primary"
                size="lg"
                startContent={<BuildingOfficeIcon className="w-4 h-4" />}
                variant="flat"
              >
                About Nexorus Technologies
              </Chip>
            </div>
            <h1 className={title({ size: "lg" })}>
              Transforming Invoice Processing with&nbsp;
              <span className={title({ color: "violet" })}>AI Innovation</span>
            </h1>
            <div
              className={subtitle({ class: "mt-6 max-w-4xl mx-auto text-lg" })}
            >
              Founded by Subhan Farooq, Nexorus Technologies is revolutionizing
              how businesses handle invoice processing through intelligent
              automation and cutting-edge AI technology.
            </div>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-24 bg-content1/20">
        <div className="container mx-auto w-full max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Founder Image */}
            <div className="relative flex justify-center">
              <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/10 rounded-2xl p-8 border-1 border-divider/50">
                <div className="relative">
                  <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl p-6 backdrop-blur-sm">
                    <div className="w-full flex items-center justify-center overflow-hidden">
                      <img
                        alt="Subhan Farooq, Founder"
                        className="rounded-full w-48 h-48 object-cover border-4 border-primary/30 shadow-lg mx-auto"
                        src="/images/founder.png"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Founder Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-4">Meet the Founder</h2>
                <h3 className="text-2xl font-semibold text-primary mb-2">
                  Subhan Farooq
                </h3>
                <p className="text-xl text-default-600 mb-6">
                  Founder & CEO, Nexorus Technologies
                </p>
                <p className="text-default-600 leading-relaxed text-lg">
                  A passionate technologist and entrepreneur with a vision to
                  transform how businesses handle their financial documents.
                  With expertise in AI, machine learning, and enterprise
                  software, Subhan leads Nexorus Technologies in creating
                  innovative solutions that streamline invoice processing
                  workflows.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 rounded-full p-2">
                    <EnvelopeIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-default-600">subhan@nexorus.com</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-secondary/10 rounded-full p-2">
                    <GlobeAltIcon className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="font-medium">LinkedIn</p>
                    <Link
                      isExternal
                      color="primary"
                      href="https://www.linkedin.com/in/subhan-farooq/"
                    >
                      linkedin.com/in/subhan-farooq
                    </Link>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-success/10 rounded-full p-2">
                    <MapPinIcon className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-default-600">Pakistan</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  isExternal
                  as={Link}
                  color="primary"
                  href="https://www.linkedin.com/in/subhan-farooq/"
                  startContent={<GlobeAltIcon className="w-4 h-4" />}
                  variant="bordered"
                >
                  Connect on LinkedIn
                </Button>
                <Button
                  as={Link}
                  color="secondary"
                  href="mailto:subhan@nexorus.com"
                  startContent={<EnvelopeIcon className="w-4 h-4" />}
                  variant="bordered"
                >
                  Send Email
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Story */}
      <section className="py-24 bg-gradient-to-br from-content1/20 to-background">
        <div className="container mx-auto w-full max-w-5xl px-6">
          <div className="text-center mb-20">
            <div className="flex justify-center mb-6">
              <Chip color="secondary" size="lg" variant="flat">
                Our Story
              </Chip>
            </div>
            <h2 className={title({ size: "lg" })}>
              Building the Future of Invoice Processing
            </h2>
            <p
              className={subtitle({ class: "mt-6 max-w-3xl mx-auto text-lg" })}
            >
              How Nexorus Technologies came to revolutionize business workflows
            </p>
          </div>

          <div className="space-y-8">
            <Card className="bg-content1/50 backdrop-blur-sm border-1 border-divider/50">
              <CardBody className="p-8">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 rounded-full p-3 mt-1">
                    <SparklesIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-4">The Vision</h3>
                    <p className="text-default-600 leading-relaxed">
                      Founded in 2024, Nexorus Technologies was born from a
                      simple observation: businesses were spending countless
                      hours manually processing invoices, a task that was both
                      time-consuming and error-prone. Our founder, Subhan
                      Farooq, recognized the potential for AI to transform this
                      critical business process.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="bg-content1/50 backdrop-blur-sm border-1 border-divider/50">
              <CardBody className="p-8">
                <div className="flex items-start gap-4">
                  <div className="bg-success/10 rounded-full p-3 mt-1">
                    <BoltIcon className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-4">
                      The Innovation
                    </h3>
                    <p className="text-default-600 leading-relaxed">
                      We developed AI Invoice Summarizer to automatically detect
                      invoice emails, extract key information, and generate
                      professional summaries. Our technology processes invoices
                      in seconds, not hours, while maintaining the highest
                      standards of accuracy and security.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="bg-content1/50 backdrop-blur-sm border-1 border-divider/50">
              <CardBody className="p-8">
                <div className="flex items-start gap-4">
                  <div className="bg-warning/10 rounded-full p-3 mt-1">
                    <ShieldCheckIcon className="w-6 h-6 text-warning" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-4">The Mission</h3>
                    <p className="text-default-600 leading-relaxed">
                      Today, Nexorus Technologies serves businesses worldwide,
                      helping them streamline their invoice processing
                      workflows. Our mission is to empower businesses with
                      intelligent automation that saves time, reduces errors,
                      and improves financial visibility.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-content1/20">
        <div className="container mx-auto w-full max-w-7xl px-6">
          <div className="text-center mb-20">
            <div className="flex justify-center mb-6">
              <Chip color="primary" size="lg" variant="flat">
                Our Values
              </Chip>
            </div>
            <h2 className={title({ size: "lg" })}>What Drives Us Forward</h2>
            <p
              className={subtitle({ class: "mt-6 max-w-3xl mx-auto text-lg" })}
            >
              The principles that guide our innovation and customer
              relationships
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-content1/50 backdrop-blur-sm border-1 border-divider/50 hover:border-primary/30 transition-all duration-300">
              <CardBody className="p-8 text-center">
                <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <SparklesIcon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Innovation</h3>
                <p className="text-default-600 leading-relaxed">
                  We constantly push the boundaries of what&apos;s possible with
                  AI and automation, always seeking new ways to improve our
                  customers&apos; workflows.
                </p>
              </CardBody>
            </Card>

            <Card className="bg-content1/50 backdrop-blur-sm border-1 border-divider/50 hover:border-primary/30 transition-all duration-300">
              <CardBody className="p-8 text-center">
                <div className="bg-success/10 rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <ShieldCheckIcon className="w-8 h-8 text-success" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Security</h3>
                <p className="text-default-600 leading-relaxed">
                  We prioritize the security and privacy of our customers&apos;
                  data, implementing bank-level encryption and never storing
                  sensitive information permanently.
                </p>
              </CardBody>
            </Card>

            <Card className="bg-content1/50 backdrop-blur-sm border-1 border-divider/50 hover:border-primary/30 transition-all duration-300">
              <CardBody className="p-8 text-center">
                <div className="bg-secondary/10 rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                  <ChartBarIcon className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Excellence</h3>
                <p className="text-default-600 leading-relaxed">
                  We strive for excellence in everything we do, from product
                  development to customer support, ensuring the highest quality
                  experience for our users.
                </p>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-gradient-to-br from-background to-content1/20">
        <div className="container mx-auto w-full max-w-7xl px-6">
          <div className="text-center mb-20">
            <div className="flex justify-center mb-6">
              <Chip color="secondary" size="lg" variant="flat">
                Our Team
              </Chip>
            </div>
            <h2 className={title({ size: "lg" })}>
              The Minds Behind the Innovation
            </h2>
            <p
              className={subtitle({ class: "mt-6 max-w-3xl mx-auto text-lg" })}
            >
              Meet the talented individuals driving Nexorus Technologies forward
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-content1/50 backdrop-blur-sm border-1 border-divider/50">
              <CardBody className="p-8 text-center">
                <Avatar
                  className="w-20 h-20 mx-auto mb-4"
                  name="Subhan Farooq"
                  size="lg"
                  src={getDefaultAvatarUrl("Subhan Farooq")}
                />
                <h3 className="text-xl font-semibold mb-2">Subhan Farooq</h3>
                <p className="text-primary font-medium mb-4">Founder & CEO</p>
                <p className="text-default-600 text-sm leading-relaxed">
                  Visionary leader with expertise in AI, machine learning, and
                  enterprise software. Drives the company&apos;s strategic
                  direction and innovation.
                </p>
                <div className="flex justify-center gap-2 mt-4">
                  <Link
                    isExternal
                    color="primary"
                    href="https://www.linkedin.com/in/subhan-farooq/"
                  >
                    <StarIcon className="w-4 h-4" />
                  </Link>
                </div>
              </CardBody>
            </Card>

            <Card className="bg-content1/50 backdrop-blur-sm border-1 border-divider/50">
              <CardBody className="p-8 text-center">
                <div className="bg-secondary/20 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <UserIcon className="w-10 h-10 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  AI Engineering Team
                </h3>
                <p className="text-secondary font-medium mb-4">
                  Machine Learning Engineers
                </p>
                <p className="text-default-600 text-sm leading-relaxed">
                  Expert team developing cutting-edge AI algorithms for invoice
                  processing and document analysis.
                </p>
              </CardBody>
            </Card>

            <Card className="bg-content1/50 backdrop-blur-sm border-1 border-divider/50">
              <CardBody className="p-8 text-center">
                <div className="bg-success/20 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <UserIcon className="w-10 h-10 text-success" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Product Team</h3>
                <p className="text-success font-medium mb-4">
                  Product & Design
                </p>
                <p className="text-default-600 text-sm leading-relaxed">
                  Dedicated team creating intuitive user experiences and
                  ensuring our products meet customer needs.
                </p>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/10">
        <div className="container mx-auto w-full max-w-7xl px-6 text-center">
          <h2 className={title({ size: "lg" })}>
            Join Us in Transforming Business
          </h2>
          <p className={subtitle({ class: "mt-6 mb-10 text-lg" })}>
            Experience the future of invoice processing with AI Invoice
            Summarizer
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
              isExternal
              as={Link}
              className="text-lg px-8"
              color="primary"
              href="https://www.linkedin.com/in/subhan-farooq/"
              size="lg"
              startContent={<GlobeAltIcon className="w-6 h-6" />}
              variant="bordered"
            >
              Connect with Founder
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
