import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8 bg-white rounded-xl shadow-md mt-8 mb-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Privacy Policy</h1>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
        <p className="text-gray-700">This Privacy Policy explains how KIMU Transport collects, uses, and protects your personal information when you use our car rental services and website.</p>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">2. Information We Collect</h2>
        <ul className="list-disc pl-6 text-gray-700">
          <li>Personal details (name, email, phone number, address, date of birth, driver&apos;s license, etc.)</li>
          <li>Booking and rental information</li>
          <li>Payment details (only as required for processing transactions)</li>
          <li>Website usage data (IP address, browser type, device information, cookies, etc.)</li>
        </ul>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">3. How We Use Your Information</h2>
        <ul className="list-disc pl-6 text-gray-700">
          <li>To process bookings and provide car rental services</li>
          <li>To communicate with you about your booking or inquiries</li>
          <li>To improve our services and website</li>
          <li>To comply with legal obligations</li>
          <li>For marketing purposes (only with your consent)</li>
        </ul>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">4. Data Protection</h2>
        <ul className="list-disc pl-6 text-gray-700">
          <li>We implement appropriate security measures to protect your data from unauthorized access, alteration, or disclosure.</li>
          <li>Access to your personal information is restricted to authorized personnel only.</li>
        </ul>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">5. Sharing Your Information</h2>
        <ul className="list-disc pl-6 text-gray-700">
          <li>We do not sell or rent your personal information to third parties.</li>
          <li>We may share your data with trusted partners who assist in providing our services (e.g., payment processors), but only as necessary and with appropriate safeguards.</li>
          <li>We may disclose information if required by law or to protect our rights and safety.</li>
        </ul>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">6. Cookies and Tracking</h2>
        <ul className="list-disc pl-6 text-gray-700">
          <li>Our website may use cookies and similar technologies to enhance your experience and analyze usage.</li>
          <li>You can control cookies through your browser settings.</li>
        </ul>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">7. Your Rights</h2>
        <ul className="list-disc pl-6 text-gray-700">
          <li>You have the right to access, correct, or delete your personal information.</li>
          <li>You may withdraw consent for marketing communications at any time.</li>
          <li>To exercise your rights, please contact us using the details below.</li>
        </ul>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">8. Contact Us</h2>
        <p className="text-gray-700">If you have any questions or concerns about this Privacy Policy or your data, please contact us at <a href="mailto:kimutransport6@gmail.com" className="text-blue-600 underline">kimutransport6@gmail.com</a>.</p>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">9. Updates to This Policy</h2>
        <p className="text-gray-700">We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated effective date.</p>
      </section>
      <div className="text-center text-gray-500 text-sm mt-8">
        &copy; {new Date().getFullYear()} KIMU Transport. All rights reserved.
      </div>
    </div>
  );
} 