import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { useState } from 'react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  productDescription: string;
  price: number | string;
  billingCycle?: string;
}

export function CheckoutModal({ 
  isOpen, 
  onClose, 
  productName, 
  productDescription, 
  price,
  billingCycle 
}: CheckoutModalProps) {
  const [email, setEmail] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    alert(`Thank you! Your ${productName} purchase has been processed. You'll receive a confirmation email at ${email}.`);
    setProcessing(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-card">
        <DialogHeader>
          <DialogTitle className="text-2xl" style={{ fontWeight: 600 }}>
            Complete Your Purchase
          </DialogTitle>
          <DialogDescription>
            {productName} - {productDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Order Summary */}
          <div className="bg-secondary/30 rounded-[16px] p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Product</span>
              <span style={{ fontWeight: 500 }}>{productName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-2xl" style={{ fontWeight: 600, color: '#6E7E55' }}>
                {typeof price === 'number' ? `$${price}` : price}
                {billingCycle && <span className="text-sm text-muted-foreground ml-1">/{billingCycle}</span>}
              </span>
            </div>
          </div>

          {/* Payment Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-2" style={{ fontWeight: 500 }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-3 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ fontWeight: 500 }}>
                Card Number
              </label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="1234 5678 9012 3456"
                required
                maxLength={19}
                className="w-full px-4 py-3 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2" style={{ fontWeight: 500 }}>
                  Expiry Date
                </label>
                <input
                  type="text"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  placeholder="MM/YY"
                  required
                  maxLength={5}
                  className="w-full px-4 py-3 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-sm mb-2" style={{ fontWeight: 500 }}>
                  CVC
                </label>
                <input
                  type="text"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value)}
                  placeholder="123"
                  required
                  maxLength={4}
                  className="w-full px-4 py-3 rounded-[12px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3.5 rounded-full border-2 border-border hover:border-primary/50 transition-all"
                style={{ fontWeight: 500 }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={processing}
                className="flex-1 py-3.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50"
                style={{ fontWeight: 500 }}
              >
                {processing ? 'Processing...' : `Pay ${typeof price === 'number' ? `$${price}` : price}`}
              </button>
            </div>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-4">
            This is a demo checkout. No actual payment will be processed.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
