import React from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiFileText } from "react-icons/fi";

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            {/* Logo */}
            <div className="flex items-center">
              <img
                src="/logo.png"
                alt="Innovasure Logo"
                className="h-12 lg:h-14 w-auto"
              />
            </div>

            {/* Back Button */}
            <Link
              to="/login"
              className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              <FiArrowLeft className="h-4 w-4 mr-1" />
              Back to Login
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto md:px-4 lg:px-6 pb-4 md:pb-6 lg:pb-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-b-3xl bg-linear-to-br from-blue-600 via-blue-500 to-indigo-600 text-white shadow-lg mb-4 lg:mb-8">
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('/bg1.jpg')`,
              }}
            />
          </div>

          <div className="relative z-10 p-4 md:p-6 lg:p-8 text-center">
            <h1 className="text-2xl lg:text-3xl font-bold mb-2">
              Terms and Conditions
            </h1>
            <p className="text-blue-100 text-sm lg:text-base">
              Last updated:{" "}
              {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white lg:rounded-2xl lg:shadow-sm border-b lg:border border-gray-100 p-4 md:p-6 lg:p-8 space-y-6">
          <section>
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-4">
              1. Agreement to Terms
            </h2>
            <p className="text-gray-700 text-sm lg:text-base leading-relaxed">
              By accessing and using the Innovasure micro-insurance platform,
              you accept and agree to be bound by the terms and provision of
              this agreement. This platform facilitates insurance services
              through our hierarchical agent network (Admin → Super-Agent →
              Agent → Member). If you do not agree to abide by these terms,
              please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-4">
              2. Account Registration
            </h2>
            <p className="text-gray-700 text-sm lg:text-base leading-relaxed mb-4">
              To use our services, you must:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm lg:text-base">
              <li>Be at least 18 years of age</li>
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>
                Accept responsibility for all activities under your account
              </li>
              <li>Notify us immediately of any unauthorized access</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-4">
              3. Insurance Services
            </h2>
            <p className="text-gray-700 text-sm lg:text-base leading-relaxed mb-4">
              Our micro-insurance platform facilitates:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm lg:text-base">
              <li>
                Subscription to daily/weekly/monthly micro-insurance plans
              </li>
              <li>
                Premium payment processing via M-Pesa (Daraja C2B) and bank
                transfers
              </li>
              <li>
                Automated payment reconciliation and allocation to insurance,
                commissions, and admin funds
              </li>
              <li>
                Agent and Super-Agent commission tracking and bulk B2C payouts
              </li>
              <li>
                Policy management, coverage tracking, and renewal processing
              </li>
              <li>KYC/AML compliance verification and document management</li>
              <li>
                Dependent management (spouse, children) under primary member
                policy
              </li>
              <li>
                Payment reminders via SMS and USSD services (Africa's Talking)
              </li>
              <li>Daily settlement reports and financial reconciliations</li>
            </ul>
            <p className="text-gray-700 text-sm lg:text-base leading-relaxed mt-4">
              All insurance policies are underwritten by licensed insurance
              companies under the Insurance Regulatory Authority of Kenya. We
              act as an intermediary and technology platform facilitating the
              agent network, premium collection, and commission distribution.
            </p>
          </section>

          <section>
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-4">
              4. Premium Payments
            </h2>
            <p className="text-gray-700 text-sm lg:text-base leading-relaxed mb-4">
              Premium payment terms:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm lg:text-base">
              <li>
                Payments must be made on time via M-Pesa (Paybill) or bank
                transfer to maintain coverage
              </li>
              <li>
                You have a 3-day grace period after the due date before
                suspension
              </li>
              <li>
                SMS reminders will be sent 1 day before due date and during
                grace period
              </li>
              <li>
                Overpayments will be applied to future premium cycles (e.g.,
                KShs 60 paid for KShs 20 daily plan = 3 days coverage)
              </li>
              <li>
                Partial payments during grace period may be accepted but require
                completion within 3 days
              </li>
              <li>
                Policy suspension occurs after grace period expires with unpaid
                premiums
              </li>
              <li>
                Refunds are subject to the terms of your specific policy and are
                rarely granted
              </li>
              <li>
                All payments are processed through Safaricom Daraja API (M-Pesa)
                and secure bank APIs
              </li>
              <li>
                Payment allocation: Premiums are automatically distributed to
                insurance, agent commission, super-agent commission, and admin
                portions
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-4">
              5. User Obligations
            </h2>
            <p className="text-gray-700 text-sm lg:text-base leading-relaxed mb-4">
              You agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm lg:text-base">
              <li>Provide truthful and accurate information</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Not engage in fraudulent or illegal activities</li>
              <li>
                Not attempt to hack, damage, or interfere with the platform
              </li>
              <li>Not use the service for unauthorized commercial purposes</li>
              <li>Respect the intellectual property rights of others</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-4">
              6. Prohibited Activities
            </h2>
            <p className="text-gray-700 text-sm lg:text-base leading-relaxed mb-4">
              You must not:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm lg:text-base">
              <li>Violate any applicable law or regulation</li>
              <li>Infringe upon the rights of others</li>
              <li>Transmit any harmful or malicious code or files</li>
              <li>
                Attempt to gain unauthorized access to any part of the platform
              </li>
              <li>
                Interfere with the operation of the platform or others' use of
                it
              </li>
              <li>Engage in any form of automated data collection</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-4">
              7. Commission & Settlement Processing
            </h2>
            <p className="text-gray-700 text-sm lg:text-base leading-relaxed mb-4">
              Commission and settlement terms:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm lg:text-base">
              <li>
                Agents and Super-Agents earn commissions on premiums collected
                from their network
              </li>
              <li>
                Commissions are calculated and tracked in real-time via our
                commission ledger
              </li>
              <li>
                Daily settlement reports are generated automatically for admin
                review
              </li>
              <li>
                Commission payouts are processed via bulk M-Pesa B2C (minimum
                KShs 50 per payout)
              </li>
              <li>
                Failed payouts will be retried automatically with exponential
                backoff
              </li>
              <li>
                Admin processes insurance and admin fund transfers manually
                (recorded in system)
              </li>
              <li>
                All transactions are subject to reconciliation and audit trails
              </li>
              <li>
                Agent/Super-Agent access their commissions through their
                dedicated portals
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-4">
              8. Intellectual Property
            </h2>
            <p className="text-gray-700 text-sm lg:text-base leading-relaxed">
              All content on the Innovasure platform, including text, graphics,
              logos, images, and software, is the property of Innovasure Ltd. or
              its licensors and is protected by copyright and other intellectual
              property laws. You may not reproduce, distribute, or create
              derivative works without our express written permission.
            </p>
          </section>

          <section>
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-4">
              9. Disclaimers
            </h2>
            <p className="text-gray-700 text-sm lg:text-base leading-relaxed mb-4">
              <strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm lg:text-base">
              <li>The service is provided "as is" and "as available"</li>
              <li>We do not guarantee uninterrupted or error-free service</li>
              <li>
                We are not liable for any indirect, incidental, or consequential
                damages
              </li>
              <li>
                We do not warrant the accuracy or completeness of any
                information
              </li>
              <li>
                We reserve the right to modify or discontinue the service at any
                time
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-4">
              10. Limitation of Liability
            </h2>
            <p className="text-gray-700 text-sm lg:text-base leading-relaxed">
              In no event shall Innovasure Ltd. be liable for any special,
              indirect, incidental, or consequential damages, including but not
              limited to loss of data, profits, or business interruption,
              arising out of or in connection with the use of our services.
            </p>
          </section>

          <section>
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-4">
              11. Termination
            </h2>
            <p className="text-gray-700 text-sm lg:text-base leading-relaxed">
              We reserve the right to suspend or terminate your account at any
              time for violation of these terms, fraudulent activity, or any
              other reason we deem necessary. You may terminate your account at
              any time by contacting us. Upon termination, you will lose access
              to your account and all associated data.
            </p>
          </section>

          <section>
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-4">
              12. Governing Law & Regulations
            </h2>
            <p className="text-gray-700 text-sm lg:text-base leading-relaxed mb-4">
              These terms and conditions are governed by the laws of Kenya,
              including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm lg:text-base">
              <li>
                Insurance Regulatory Authority regulations for micro-insurance
                products
              </li>
              <li>
                Kenya Data Protection Act (2019) for personal data handling
              </li>
              <li>Central Bank of Kenya regulations for payment processing</li>
              <li>
                Safaricom Daraja API terms and conditions for M-Pesa
                transactions
              </li>
            </ul>
            <p className="text-gray-700 text-sm lg:text-base leading-relaxed mt-4">
              Any disputes arising from or related to these terms shall be
              subject to the exclusive jurisdiction of the courts of Kenya.
            </p>
          </section>

          <section>
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-4">
              13. Changes to Terms
            </h2>
            <p className="text-gray-700 text-sm lg:text-base leading-relaxed">
              We reserve the right to modify these terms at any time. We will
              notify you of material changes by posting the new terms on this
              page and updating the "Last updated" date. Your continued use of
              the service after such modifications constitutes acceptance of the
              updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-4">
              14. Contact Information
            </h2>
            <p className="text-gray-700 text-sm lg:text-base leading-relaxed mb-4">
              For questions about these Terms and Conditions, please contact us:
            </p>
            <div className="bg-gray-50 lg:rounded-lg p-4 space-y-2 text-gray-700 text-sm lg:text-base">
              <p>
                <strong>Email:</strong> legal@innovasure.com
              </p>
              <p>
                <strong>Phone:</strong> +254 XXX XXX XXX
              </p>
              <p>
                <strong>Address:</strong> P.O. Box XXX, Nairobi, Kenya
              </p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="mt-4 md:mt-6 lg:mt-8 text-center">
          <p className="text-[0.8rem] lg:text-sm text-gray-600">
            © 2025 Innovasure Ltd. All rights reserved.
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Terms;
