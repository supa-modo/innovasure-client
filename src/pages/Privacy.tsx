import React from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiShield } from "react-icons/fi";

const Privacy: React.FC = () => {
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
              Privacy Policy
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
              1. Introduction
            </h2>
            <p className="text-gray-700 text-sm lg:text-base leading-relaxed">
              Welcome to Innovasure Ltd. ("we," "our," or "us"). We are
              committed to protecting your personal information and your right
              to privacy. This Privacy Policy explains how we collect, use,
              disclose, and safeguard your information when you use our
              insurance platform.
            </p>
            <p className="text-gray-700 text-sm lg:text-base leading-relaxed mt-4">
              By using our services, you agree to the collection and use of
              information in accordance with this policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-4">
              2. Information We Collect
            </h2>
            <p className="text-gray-700 text-sm lg:text-base leading-relaxed mb-4">
              As an insurance platform, we collect information that you provide
              directly to us, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm lg:text-base">
              <li>
                <strong>Personal Information:</strong> Full name, email address,
                phone number, date of birth, KRA PIN, and identification
                documents
              </li>
              <li>
                <strong>KYC Documents:</strong> National ID or passport (front
                and back), proof of address
              </li>
              <li>
                <strong>Account Information:</strong> Username, password, M-Pesa
                number, and account number
              </li>
              <li>
                <strong>Payment Information:</strong> M-Pesa transactions, bank
                account details, and payment history
              </li>
              <li>
                <strong>Profile Information:</strong> Dependants (spouse,
                children) with their details, emergency contacts, and family
                members
              </li>
              <li>
                <strong>Insurance Information:</strong> Subscriptions, premium
                amounts, coverage details, and policy status
              </li>
              <li>
                <strong>Agent Network Information:</strong> Your linked agent
                and super-agent details (if applicable)
              </li>
              <li>
                <strong>Usage Information:</strong> How you interact with our
                platform, including IP address, browser type, and device
                information
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-4">
              3. How We Use Your Information
            </h2>
            <p className="text-gray-700 text-sm lg:text-base leading-relaxed mb-4">
              We use the collected information for the following purposes:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm lg:text-base">
              <li>
                To provide, maintain, and improve our micro-insurance services
              </li>
              <li>
                To process your insurance subscriptions and premium payments via
                M-Pesa and bank transfers
              </li>
              <li>To verify your identity through KYC/AML compliance checks</li>
              <li>To manage your policy, coverage, and claims processing</li>
              <li>
                To process commissions and settlements for our agent network
              </li>
              <li>
                To send SMS notifications about payments, reminders, and policy
                updates via Africa's Talking
              </li>
              <li>To enable USSD services for members without smartphones</li>
              <li>
                To provide access to your dedicated member portal and
                personalized dashboard
              </li>
              <li>
                To generate settlement reports and financial reconciliations
              </li>
              <li>
                To comply with Kenya Data Protection Act and other regulatory
                requirements
              </li>
              <li>To prevent fraud, abuse, and money laundering activities</li>
              <li>
                To communicate with you about your account, services, and policy
                information
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-4">
              4. Information Sharing and Disclosure
            </h2>
            <p className="text-gray-700 text-sm lg:text-base leading-relaxed mb-4">
              We may share your information with:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm lg:text-base">
              <li>
                <strong>Insurance Providers:</strong> Partner insurance
                companies that underwrite your policies and receive premium
                allocations
              </li>
              <li>
                <strong>Agent Network:</strong> Your assigned agent and
                super-agent who help manage your policy
              </li>
              <li>
                <strong>Payment Processors:</strong> Safaricom Daraja API
                (M-Pesa) and bank APIs for premium collection and commission
                payouts
              </li>
              <li>
                <strong>Communication Services:</strong> Africa's Talking for
                SMS notifications and USSD services
              </li>
              <li>
                <strong>Service Providers:</strong> AWS (cloud storage), Vercel
                (hosting), and analytics providers
              </li>
              <li>
                <strong>Regulatory Authorities:</strong> Insurance Regulatory
                Authority, Office of the Data Protection Commissioner, and other
                government agencies as required by Kenyan law
              </li>
              <li>
                <strong>Business Transfers:</strong> In the event of a merger,
                acquisition, or sale of assets
              </li>
            </ul>
            <p className="text-gray-700 text-sm lg:text-base leading-relaxed mt-4">
              We do not sell your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-4">
              5. Data Security & Kenya Data Protection Act Compliance
            </h2>
            <p className="text-gray-700 text-sm lg:text-base leading-relaxed mb-4">
              We implement appropriate technical and organizational measures to
              protect your personal information, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm lg:text-base">
              <li>
                <strong>Encryption:</strong> TLS 1.2+ for data in transit and
                AWS KMS encryption at rest
              </li>
              <li>
                <strong>PII Protection:</strong> Sensitive data like KRA PIN and
                ID numbers are encrypted using AWS KMS
              </li>
              <li>
                <strong>Access Controls:</strong> Role-based access control
                (RBAC) to limit who can view personal information
              </li>
              <li>
                <strong>Secure Storage:</strong> Documents stored in AWS S3 with
                encryption and versioning
              </li>
              <li>
                <strong>Audit Logging:</strong> Complete audit trails for all
                data access and modifications
              </li>
              <li>
                <strong>Data Retention:</strong> Insurance records retained for
                7 years as required by Kenyan law
              </li>
              <li>
                <strong>Breach Notification:</strong> We will notify affected
                users and authorities within 72 hours of a breach as required by
                Data Protection Act
              </li>
              <li>
                <strong>Employee Training:</strong> Staff training on data
                protection best practices and DPA compliance
              </li>
            </ul>
            <p className="text-gray-700 text-sm lg:text-base leading-relaxed mt-4">
              We comply with the Kenya Data Protection Act (2019) and have
              completed a Data Protection Impact Assessment (DPIA).
            </p>
          </section>

          <section>
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-4">
              6. Your Rights
            </h2>
            <p className="text-gray-700 text-sm lg:text-base leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm lg:text-base">
              <li>Access and review your personal information</li>
              <li>Request correction of inaccurate or incomplete data</li>
              <li>Request deletion of your personal information</li>
              <li>Object to certain processing activities</li>
              <li>Withdraw consent for data processing</li>
              <li>
                File a complaint with the relevant data protection authority
              </li>
            </ul>
            <p className="text-gray-700 text-sm lg:text-base leading-relaxed mt-4">
              To exercise these rights, please contact us using the information
              provided in the "Contact Us" section.
            </p>
          </section>

          <section>
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-4">
              7. Cookies and Tracking Technologies
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We use cookies and similar tracking technologies to track activity
              on our platform and store certain information. You can instruct
              your browser to refuse all cookies or to indicate when a cookie is
              being sent.
            </p>
          </section>

          <section>
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-4">
              8. Children's Privacy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Our services are not intended for individuals under the age of 18.
              We do not knowingly collect personal information from children. If
              you believe we have inadvertently collected information from a
              child, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-4">
              9. Changes to This Privacy Policy
            </h2>
            <p className="text-gray-700 text-sm lg:text-base leading-relaxed">
              We may update our Privacy Policy from time to time. We will notify
              you of any changes by posting the new Privacy Policy on this page
              and updating the "Last updated" date. You are advised to review
              this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section>
            <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-4">
              10. Contact Us
            </h2>
            <p className="text-gray-700 text-sm lg:text-base leading-relaxed mb-4">
              If you have any questions or concerns about this Privacy Policy,
              please contact us:
            </p>
            <div className="bg-gray-50 lg:rounded-lg p-4 space-y-2 text-gray-700 text-sm lg:text-base">
              <p>
                <strong>Email:</strong> privacy@innovasure.com
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

export default Privacy;
