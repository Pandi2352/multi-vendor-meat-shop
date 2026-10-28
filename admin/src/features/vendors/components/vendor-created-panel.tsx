import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Copy, Check, Mail, KeyRound, ArrowRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import type { VendorProfile } from '../api';

interface VendorCreatedPanelProps {
  vendor: VendorProfile;
  onReset: () => void;
}

/** Comprehensive credentials and activation panel shown after creating a vendor. */
export function VendorCreatedPanel({ vendor, onReset }: VendorCreatedPanelProps) {
  const [copied, setCopied] = useState(false);
  const shop = vendor.shop;
  const invitation = vendor.invitation;
  const inviteUrl = invitation?.inviteUrl;

  const handleCopy = () => {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="p-6 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
        <div className="h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-text">Butcher Stall Created & Approved!</h2>
        <p className="text-xs text-muted max-w-lg mx-auto">
          <strong className="text-text">{vendor.businessName}</strong> is verified and registered on the platform.
          Vendor owner login credentials have been provisioned.
        </p>
      </div>

      {/* Credentials & Access Information Card */}
      <div className="p-6 rounded-md bg-surface border border-border space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-border">
          <KeyRound className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-sm font-bold text-text">Vendor Dashboard Login Credentials</h3>
            <p className="text-xs text-muted">How the butcher logs in to manage fresh products and orders</p>
          </div>
        </div>

        {/* Credentials Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-md bg-surface-muted border border-border space-y-1">
            <span className="text-[11px] font-medium text-muted block">Vendor Owner Name</span>
            <p className="font-semibold text-text text-sm">{vendor.ownerName}</p>
          </div>
          <div className="p-3.5 rounded-md bg-surface-muted border border-border space-y-1">
            <span className="text-[11px] font-medium text-muted block">Login Email Address</span>
            <p className="font-semibold text-text text-sm font-mono">{invitation?.email || 'Registered email'}</p>
          </div>
          <div className="p-3.5 rounded-md bg-surface-muted border border-border space-y-1">
            <span className="text-[11px] font-medium text-muted block">Stall Location & Town</span>
            <p className="font-semibold text-text text-sm">
              {shop?.locality}, {shop?.city}
            </p>
          </div>
          <div className="p-3.5 rounded-md bg-surface-muted border border-border space-y-1">
            <span className="text-[11px] font-medium text-muted block">Initial Password Flow</span>
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 text-sm">
              <Check className="h-4 w-4" /> Set on first login
            </span>
          </div>
        </div>

        {/* Activation Link Box */}
        {inviteUrl && (
          <div className="p-4 rounded-md bg-primary/5 border border-primary/20 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-primary flex items-center gap-1.5">
                  <Mail className="h-4 w-4" /> Direct Activation & Password Setup Link
                </span>
                <p className="text-xs text-muted mt-0.5">
                  An email was sent to the vendor. You can also copy and send this link directly via WhatsApp or SMS:
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                leftIcon={copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                onClick={handleCopy}
              >
                {copied ? 'Link Copied!' : 'Copy Link'}
              </Button>
            </div>
            <div className="p-2.5 rounded-md bg-surface border border-border font-mono text-[11px] text-text break-all select-all">
              {inviteUrl}
            </div>
          </div>
        )}

        {/* How It Works Explainer */}
        <div className="p-4 rounded-md bg-surface-muted/50 border border-border text-xs space-y-2">
          <p className="font-semibold text-text">What happens next?</p>
          <ol className="list-decimal list-inside space-y-1 text-muted">
            <li>The butcher clicks the invitation link received via email or WhatsApp.</li>
            <li>On first login, they create their private account password.</li>
            <li>They enter their Vendor Dashboard (<code className="text-text font-mono">/vendor</code>).</li>
            <li>From the Products menu, they can immediately begin adding daily fresh meat cuts and setting per-kg rates.</li>
          </ol>
        </div>
      </div>

      {/* Action Navigation */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <Button variant="outline" size="md" leftIcon={<Plus className="h-4 w-4" />} onClick={onReset}>
          Add Another Stall
        </Button>
        <Link to={ROUTES.ADMIN_VENDORS}>
          <Button variant="primary" size="md" rightIcon={<ArrowRight className="h-4 w-4" />}>
            View All Butcher Stalls
          </Button>
        </Link>
      </div>
    </div>
  );
}
