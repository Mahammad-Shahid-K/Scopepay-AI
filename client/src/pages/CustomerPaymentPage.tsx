import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  DollarSign,
  Lock,
  ArrowRight,
  Sparkles,
  CreditCard,
  FileCheck2,
  RefreshCw
} from 'lucide-react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Alert } from '../components/ui/Alert';
import { api } from '../services/api';
import { PublicInvoiceDetails } from '../types';

export const CustomerPaymentPage: React.FC = () => {
  const { shareToken } = useParams<{ shareToken: string }>();

  const [invoice, setInvoice] = useState<PublicInvoiceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentData, setPaymentData] = useState<{
    orderId: string;
    captureId: string;
    amount: number;
    currency: string;
  } | null>(null);

  const loadInvoice = async () => {
    if (!shareToken) return;
    try {
      setLoading(true);
      setError('');
      const data = await api.getPublicInvoice(shareToken);
      setInvoice(data);
      if (data.status === 'paid') {
        setPaymentSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || 'Invoice not found or link has expired.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoice();
  }, [shareToken]);

  // Real backend PayPal Order creation
  const handleCreateOrder = async (): Promise<string> => {
    if (!invoice) throw new Error('Invoice not found');
    setError('');
    try {
      const res = await api.createPayPalOrder(invoice.id);
      return res.orderId;
    } catch (err: any) {
      setError(err.message || 'Failed to initialize PayPal order');
      throw err;
    }
  };

  // Real backend PayPal Order capture & verification
  const handleApprove = async (data: { orderID: string }) => {
    if (!invoice) return;
    setProcessing(true);
    setError('');
    try {
      // Server-side capture and verification
      const result = await api.capturePayPalOrder(data.orderID, invoice.id);
      if (result.success) {
        setPaymentSuccess(true);
        setPaymentData({
          orderId: result.orderId,
          captureId: result.captureId,
          amount: result.amount,
          currency: result.currency
        });
        setInvoice({
          ...invoice,
          status: 'paid'
        });
      } else {
        throw new Error('Server could not verify transaction result.');
      }
    } catch (err: any) {
      setError(err.message || 'Payment capture failed on server. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // Fast sandbox simulated checkout for instant testing
  const handleSimulatedSandboxCheckout = async () => {
    if (!invoice) return;
    setProcessing(true);
    setError('');
    try {
      // 1. Backend creates order
      const order = await api.createPayPalOrder(invoice.id);
      // 2. Backend captures and verifies transaction
      const captureResult = await api.capturePayPalOrder(order.orderId, invoice.id);
      if (captureResult.success) {
        setPaymentSuccess(true);
        setPaymentData({
          orderId: captureResult.orderId,
          captureId: captureResult.captureId,
          amount: captureResult.amount,
          currency: captureResult.currency
        });
        setInvoice({
          ...invoice,
          status: 'paid'
        });
      }
    } catch (err: any) {
      setError(err.message || 'Sandbox capture failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-4">
        <div className="w-8 h-8 border-2 border-[#DC2626] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-[#6B7280]">Loading secure payment checkout...</p>
      </div>
    );
  }

  if (error && !invoice) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-[#E5E7EB] rounded-lg p-8 text-center shadow-sm">
          <AlertCircle className="w-10 h-10 text-[#DC2626] mx-auto mb-3" />
          <h2 className="text-lg font-bold text-[#111827]">Invoice Unavailable</h2>
          <p className="text-xs text-[#6B7280] mt-1 mb-6">{error}</p>
          <Link to="/">
            <Button variant="secondary" size="sm">Go to Homepage</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!invoice) return null;

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827] flex flex-col py-10 px-4 sm:px-6">
      {/* Centered Payment Container */}
      <div className="max-w-2xl w-full mx-auto space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-[#DC2626] flex items-center justify-center text-white">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm tracking-tight text-[#111827]">
              ScopePay <span className="text-[#DC2626]">AI</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
            <Lock className="w-3.5 h-3.5 text-[#15803D]" />
            <span>256-Bit Secure PayPal Checkout</span>
          </div>
        </div>

        {error && (
          <Alert type="error" title="Payment Notice">
            {error}
          </Alert>
        )}

        {/* Payment Confirmation Card (when Paid) */}
        {paymentSuccess ? (
          <Card className="border-green-300 shadow-md">
            <CardContent className="p-8 text-center space-y-5">
              <div className="w-14 h-14 rounded-full bg-[#F0FDF4] border border-green-200 text-[#15803D] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#F0FDF4] text-[#15803D] border border-green-200 mb-2">
                  Payment Verified & Completed
                </span>
                <h2 className="text-2xl font-extrabold text-[#111827]">
                  Thank you! Payment Received
                </h2>
                <p className="text-xs text-[#6B7280] mt-1 max-w-sm mx-auto">
                  Your payment has been captured and verified via PayPal Sandbox.
                  An automated receipt has been logged on the server.
                </p>
              </div>

              <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-5 text-left text-xs space-y-2.5 max-w-md mx-auto">
                <div className="flex justify-between border-b border-[#E5E7EB] pb-2">
                  <span className="text-[#6B7280]">Invoice Number:</span>
                  <span className="font-bold text-[#111827]">{invoice.invoice_number}</span>
                </div>
                <div className="flex justify-between border-b border-[#E5E7EB] pb-2">
                  <span className="text-[#6B7280]">Amount Paid:</span>
                  <span className="font-extrabold text-[#15803D]">
                    ${Number(invoice.amount_total).toFixed(2)} {invoice.currency}
                  </span>
                </div>
                <div className="flex justify-between border-b border-[#E5E7EB] pb-2">
                  <span className="text-[#6B7280]">Project:</span>
                  <span className="font-semibold text-[#111827]">{invoice.project_title}</span>
                </div>
                <div className="flex justify-between border-b border-[#E5E7EB] pb-2">
                  <span className="text-[#6B7280]">Recipient Freelancer:</span>
                  <span className="font-semibold text-[#111827]">{invoice.freelancer_business || invoice.freelancer_name}</span>
                </div>
                {paymentData && (
                  <div className="flex justify-between pt-1">
                    <span className="text-[#6B7280]">PayPal Capture ID:</span>
                    <span className="font-mono text-[11px] text-[#111827]">{paymentData.captureId}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <Button variant="secondary" size="sm" onClick={() => window.print()}>
                  Print Receipt
                </Button>
                <Link to="/dashboard">
                  <Button size="sm">Return to Freelancer Portal</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Active Payment Card */
          <Card className="shadow-sm">
            {/* Header with Amount */}
            <div className="p-6 sm:p-8 bg-white border-b border-[#E5E7EB]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-[#DC2626] uppercase tracking-wider">
                    Customer Invoice
                  </span>
                  <h1 className="text-2xl font-bold text-[#111827] mt-0.5">
                    {invoice.invoice_number}
                  </h1>
                  <p className="text-xs text-[#6B7280] mt-1">
                    Issued by <strong>{invoice.freelancer_business || invoice.freelancer_name}</strong>
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs text-[#6B7280] block font-medium">Total Amount Due</span>
                  <span className="text-3xl font-extrabold text-[#111827] tracking-tight">
                    ${Number(invoice.amount_total).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-xs text-[#6B7280] ml-1 font-bold">{invoice.currency}</span>
                </div>
              </div>
            </div>

            {/* Scope Deliverables Summary */}
            <CardContent className="p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider mb-2">
                  Project: {invoice.project_title}
                </h3>
                {invoice.project_description && (
                  <p className="text-xs text-[#6B7280] leading-relaxed mb-4">
                    {invoice.project_description}
                  </p>
                )}

                <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-md p-4">
                  <span className="text-xs font-semibold text-[#111827] block mb-2">
                    Included Contract Deliverables:
                  </span>
                  <ul className="space-y-2 text-xs text-[#4B5563]">
                    {invoice.deliverables && invoice.deliverables.length > 0 ? (
                      invoice.deliverables.map((d, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D] flex-shrink-0 mt-0.5" />
                          <span><strong>{d.title}:</strong> {d.description}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-[#6B7280]">Baseline milestone deliverables as contracted.</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Payment Processing Indicator */}
              {processing && (
                <div className="p-4 bg-[#FFFBEB] border border-amber-200 rounded-md text-center space-y-2">
                  <div className="w-6 h-6 border-2 border-[#B45309] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-bold text-[#B45309]">Verifying Payment on Server...</p>
                  <p className="text-[11px] text-[#6B7280]">
                    PayPal Sandbox capture in progress. Verifying order amount and transaction ID.
                  </p>
                </div>
              )}

              {/* PayPal Sandbox Checkout Options */}
              <div className="pt-4 border-t border-[#E5E7EB] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#111827] uppercase tracking-wider">
                    Select Payment Method
                  </span>
                  <span className="text-[11px] text-[#DC2626] font-semibold bg-[#FEF2F2] px-2 py-0.5 rounded border border-red-200">
                    PayPal Sandbox Enabled
                  </span>
                </div>

                {/* Primary PayPal Sandbox Button Trigger */}
                <div className="space-y-3">
                  <Button
                    size="lg"
                    onClick={handleSimulatedSandboxCheckout}
                    loading={processing}
                    disabled={processing}
                    className="w-full bg-[#0070BA] hover:bg-[#003087] text-white font-bold py-3 text-sm flex items-center justify-center gap-2"
                  >
                    <span className="italic font-extrabold text-base">PayPal</span>
                    <span>Sandbox Checkout (${Number(invoice.amount_total).toFixed(2)})</span>
                  </Button>

                  <p className="text-[11px] text-[#6B7280] text-center">
                    Simulates instant client approval & triggers backend order creation, capture, and verification.
                  </p>
                </div>

                {/* PayPal JavaScript SDK Component integration */}
                {invoice.paypal_client_id && (
                  <div className="pt-2">
                    <PayPalScriptProvider
                      options={{
                        clientId: invoice.paypal_client_id,
                        currency: invoice.currency || 'USD'
                      }}
                    >
                      <PayPalButtons
                        style={{ layout: 'vertical', shape: 'rect' }}
                        disabled={processing}
                        createOrder={handleCreateOrder}
                        onApprove={async (data) => {
                          await handleApprove(data);
                        }}
                        onError={(err) => {
                          console.error('PayPal Buttons error:', err);
                          setError('PayPal checkout encountered an issue. You can use the Sandbox Checkout button above.');
                        }}
                      />
                    </PayPalScriptProvider>
                  </div>
                )}
              </div>
            </CardContent>

            <div className="px-6 py-4 bg-[#F9FAFB] border-t border-[#E5E7EB] rounded-b-lg text-center text-[11px] text-[#6B7280]">
              Payments are verified server-side via the PayPal Orders REST API v2 before invoice completion.
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
