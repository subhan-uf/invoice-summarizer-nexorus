"use client";

import React, { useState } from "react";
import { Link } from "@heroui/link";
import { Button } from "@heroui/button";
import { Avatar, AvatarGroup } from "@heroui/avatar";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { Divider } from "@heroui/divider";
import { 
  HomeIcon,
  DocumentTextIcon,
  UserGroupIcon,
  EnvelopeIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  UserIcon,
  ArrowRightOnRectangleIcon
} from "@heroicons/react/24/outline";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
  { name: "Invoices", href: "/invoices", icon: DocumentTextIcon },
  { name: "Clients", href: "/clients", icon: UserGroupIcon },
  { name: "Email History", href: "/email-history", icon: EnvelopeIcon },
  { name: "Settings", href: "/settings", icon: Cog6ToothIcon },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Route protection
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/");
      } else {
        setUser(user);
        // Fetch profile
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        setProfile(data);
      }
    };
    checkAuth();
  }, [router]);

  // Breadcrumbs
  const getBreadcrumbs = () => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments[0] !== "dashboard") return null;
    return (
      <nav className="flex items-center gap-2 text-sm text-default-500 mb-4">
        <Button variant="light" size="sm" onPress={() => router.back()}>&larr; Back</Button>
        {segments.map((seg, idx) => (
          <span key={idx} className="capitalize">
            {idx > 0 && <span className="mx-1">/</span>}
            {seg}
          </span>
        ))}
      </nav>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 bg-content1 border-r border-divider">
          <div className="flex items-center justify-between p-4 border-b border-divider">
            <h2 className="text-lg font-semibold">AI Invoice Summarizer</h2>
            <Button
              isIconOnly
              variant="light"
              onPress={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="w-6 h-6" />
            </Button>
          </div>
          <nav className="p-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-default-600 hover:text-primary hover:bg-primary/10 transition-colors"
              >
                {React.createElement(item.icon, { className: "w-5 h-5" })}
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-content1 border-r border-divider px-6">
          <div className="flex h-16 shrink-0 items-center">
            <h2 className="text-lg font-semibold">AI Invoice Summarizer</h2>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="flex items-center gap-x-3 px-2 py-2 text-sm leading-6 text-default-600 rounded-md hover:text-primary hover:bg-primary/10 transition-colors"
                      >
                        {React.createElement(item.icon, { className: "w-5 h-5 shrink-0" })}
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navbar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-divider bg-content1 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <Button
            type="button"
            className="-m-2.5 p-2.5 text-default-600 lg:hidden"
            variant="light"
            onPress={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="w-6 h-6" />
          </Button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1" />
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <Button
                    variant="light"
                    className="flex items-center gap-2"
                  >
                    <Avatar
                      src={profile?.avatar_url || "https://i.pravatar.cc/150?u=1"}
                      name={user?.email || "User"}
                      size="sm"
                    />
                    <span className="hidden md:block">{user?.email || "User"}</span>
                    <ChevronDownIcon className="w-4 h-4" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="User menu">
                  <DropdownItem key="profile" startContent={<UserIcon className="w-4 h-4" />}>Profile</DropdownItem>
                  <DropdownItem key="settings" startContent={<Cog6ToothIcon className="w-4 h-4" />}>Settings</DropdownItem>
                  <DropdownItem key="logout" startContent={<ArrowRightOnRectangleIcon className="w-4 h-4" />} className="text-danger" onPress={async () => { 
                await supabase.auth.signOut(); 
                toast.success("Logged out successfully");
                router.replace("/"); 
              }}>Logout</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Breadcrumbs and back button for subpages */}
            {pathname !== "/dashboard" && getBreadcrumbs()}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 