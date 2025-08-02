"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

interface DisconnectGmailButtonProps {
  className?: string;
  variant?: "solid" | "bordered" | "light" | "flat" | "faded" | "shadow" | "ghost";
  size?: "sm" | "md" | "lg";
  onDisconnect?: () => void;
}

export default function DisconnectGmailButton({ 
  className = "", 
  variant = "bordered",
  size = "md",
  onDisconnect 
}: DisconnectGmailButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDisconnect = async () => {
    try {
      setLoading(true);
      
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) {
        toast.error('Please log in to disconnect Gmail');
        setLoading(false);
        return;
      }

      // Call the disconnect API
      const response = await fetch('/api/auth/disconnect-gmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message || 'Gmail disconnected successfully');
        // Call the callback if provided
        if (onDisconnect) {
          onDisconnect();
        }
      } else {
        toast.error(result.error || 'Failed to disconnect Gmail. Please try again.');
      }
    } catch (error) {
      console.error('Error disconnecting Gmail:', error);
      toast.error('Failed to disconnect Gmail. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      className={className}
      variant={variant}
      size={size}
      color="danger"
      startContent={<EnvelopeIcon className="w-4 h-4" />}
      onPress={handleDisconnect}
      isLoading={loading}
    >
      Disconnect Gmail
    </Button>
  );
} 