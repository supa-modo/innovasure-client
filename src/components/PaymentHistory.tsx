/**
 * Payment History Component
 * Displays member's payment transaction history
 */

import React, { useEffect, useState } from "react";
import { api } from "../services/api";

interface Payment {
  id: string;
  provider: string;
  amount: number;
  received_at: string;
  status: string;
  provider_txn_ref: string;
}

interface PaymentHistoryProps {
  memberId: string;
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({ memberId }) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPayments();
  }, [memberId]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/payments/member/${memberId}`);
      setPayments(response.data.payments);
    } catch (error: any) {
      console.error("Failed to fetch payments:", error);
      setError("Failed to load payment history");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600">Loading payments...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchPayments}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Payment History</h3>
        <button
          onClick={fetchPayments}
          className="text-sm text-green-600 hover:text-green-700"
        >
          Refresh
        </button>
      </div>

      {payments.length === 0 ? (
        <div className="text-center py-8">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="mt-2 text-gray-500">No payments yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Your payment history will appear here
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">
                  Date
                </th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">
                  Amount
                </th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">
                  Reference
                </th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-b border-gray-100">
                  <td className="py-3 px-2 text-sm">
                    {new Date(payment.received_at).toLocaleDateString("en-KE", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="py-3 px-2 text-sm font-medium">
                    KShs {Number(payment.amount).toLocaleString()}
                  </td>
                  <td className="py-3 px-2 text-xs text-gray-600 font-mono">
                    {payment.provider_txn_ref}
                  </td>
                  <td className="py-3 px-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        payment.status === "allocated"
                          ? "bg-green-100 text-green-800"
                          : payment.status === "matched"
                            ? "bg-blue-100 text-blue-800"
                            : payment.status === "unmatched"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {payment.status.charAt(0).toUpperCase() +
                        payment.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {payments.length > 0 && (
            <div className="mt-4 text-sm text-gray-500 text-right">
              Total: {payments.length} payment{payments.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;
