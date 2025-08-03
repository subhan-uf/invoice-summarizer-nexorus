"use client";

import { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { EnvelopeIcon, CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

interface GmailConnectProps {
  className?: string;
  variant?: "card" | "button";
}

export default function GmailConnect({ className = "", variant = "card" }: GmailConnectProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);


  useEffect(() => {
    checkGmailConnection();
  }, []);

  const checkGmailConnection = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      // Check if user has Gmail tokens
      const { data: gmailTokens } = await supabase
        .from('gmail_tokens')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setIsConnected(!!gmailTokens);
      setUserEmail(user.email || null);
      
      setLoading(false);
    } catch (error) {
      console.error('Error checking Gmail connection:', error);
      setLoading(false);
    }
  };



  const handleConnectGmail = () => {
    setConnecting(true);
    
    // Google OAuth2 parameters
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    
    if (!clientId) {
      console.error('Google Client ID not configured');
      toast.error('Gmail integration not configured. Please contact support.');
      setConnecting(false);
      return;
    }
    
    const redirectUri = `${window.location.origin}/api/auth/callback/google`;
    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.metadata',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ];
    const scope = encodeURIComponent(scopes.join(' '));
    
    // Build OAuth URL
    const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${scope}&` +
      `access_type=offline&` +
      `prompt=consent`;

    // Redirect to Google OAuth
    window.location.href = oauthUrl;
  };

  const handleDisconnectGmail = async () => {
    try {
      setConnecting(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please log in to disconnect Gmail');
        setConnecting(false);
        return;
      }

      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) {
        toast.error('Please log in to disconnect Gmail');
        setConnecting(false);
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
        setIsConnected(false);
        toast.success(result.message || 'Gmail disconnected successfully');
      } else {
        toast.error(result.error || 'Failed to disconnect Gmail. Please try again.');
      }
    } catch (error) {
      console.error('Error disconnecting Gmail:', error);
      toast.error('Failed to disconnect Gmail. Please try again.');
    } finally {
      setConnecting(false);
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        {variant === "card" ? (
          <Card className="bg-content1/50 backdrop-blur-sm">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-default-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-default-200 rounded w-3/4"></div>
                  <div className="h-3 bg-default-200 rounded w-1/2 mt-2"></div>
                </div>
              </div>
            </CardBody>
          </Card>
        ) : (
          <Button
            variant="bordered"
            className="w-full"
            disabled
          >
            <div className="w-4 h-4 bg-default-200 rounded animate-pulse"></div>
            <span>Loading...</span>
          </Button>
        )}
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className={className}>
        {variant === "card" ? (
          <Card className="bg-success/10 border-success/20 backdrop-blur-sm">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-success/20 rounded-full p-2">
                    <CheckCircleIcon className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="font-medium text-success">Connected to Gmail</p>
                    <p className="text-sm text-default-500">
                      {userEmail ? `Scanning ${userEmail} for invoices` : 'Scanning for invoices'}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="bordered"
                  color="danger"
                  onPress={handleDisconnectGmail}
                  isLoading={connecting}
                >
                  Disconnect
                </Button>
              </div>
            </CardBody>
          </Card>
        ) : (
          <Button
            variant="bordered"
            color="success"
            className="w-full"
            startContent={<CheckCircleIcon className="w-4 h-4" />}
            onPress={handleDisconnectGmail}
            isLoading={connecting}
          >
            Connected to Gmail ✅
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      {variant === "card" ? (
        <Card className="bg-warning/10 border-warning/20 backdrop-blur-sm">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-warning/20 rounded-full p-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="font-medium text-warning">Gmail Not Connected</p>
                  <p className="text-sm text-default-500">
                    Connect your Gmail to automatically detect invoice PDFs
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                color="primary"
                startContent={<EnvelopeIcon className="w-4 h-4" />}
                onPress={handleConnectGmail}
                isLoading={connecting}
              >
                Connect Gmail
              </Button>
            </div>
          </CardBody>
        </Card>
      ) : (
        <Button
          color="primary"
          className="w-full"
          startContent={<EnvelopeIcon className="w-4 h-4" />}
          onPress={handleConnectGmail}
          isLoading={connecting}
        >
          Connect your Gmail
        </Button>
      )}
    </div>
  );
} 