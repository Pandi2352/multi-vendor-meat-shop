import { Store } from 'lucide-react';

export function StorefrontFooter({ onOpenPartnerModal }: { onOpenPartnerModal: () => void }) {
  return (
    <footer className="border-t border-border bg-surface mt-auto py-6">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
        <div>
          <p>© 2026 Virudhunagar Meat Marketplace (விருதுநகர்). All rights reserved.</p>
          <p>Serving Virudhunagar, Sivakasi, Rajapalayam, Srivilliputhur, Aruppukkottai & Sattur.</p>
        </div>
        <button
          onClick={onOpenPartnerModal}
          className="flex items-center gap-1.5 text-primary hover:underline font-medium"
        >
          <Store className="h-3.5 w-3.5" />
          Sell With Us / கடை பதிவு செய்ய
        </button>
      </div>
    </footer>
  );
}
