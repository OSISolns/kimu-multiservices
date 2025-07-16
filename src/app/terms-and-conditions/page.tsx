import React from 'react';

export default function TermsAndConditions() {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8 bg-white rounded-xl shadow-md mt-8 mb-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Car Rental Terms and Conditions</h1>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">1. Rental Requirements</h2>
        <ul className="list-disc pl-6 text-gray-700">
          <li>Renter must be at least 21 years old and possess a valid driver&apos;s license.</li>
          <li>International renters must present a valid passport and driver&apos;s license.</li>
          <li>All information provided must be accurate and up-to-date.</li>
        </ul>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">2. Booking and Payment</h2>
        <ul className="list-disc pl-6 text-gray-700">
          <li>All bookings are subject to availability and confirmation.</li>
          <li>Payment can be made via mobile money or cash on pickup.</li>
          <li>Full payment is required before or at the time of vehicle collection.</li>
        </ul>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">3. Vehicle Use</h2>
        <ul className="list-disc pl-6 text-gray-700">
          <li>Vehicles must not be used for illegal activities or driven outside permitted areas without prior consent.</li>
          <li>The renter is responsible for any traffic violations, fines, or penalties incurred during the rental period.</li>
          <li>Smoking and transporting hazardous materials in the vehicle are strictly prohibited.</li>
        </ul>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">4. Insurance and Liability</h2>
        <ul className="list-disc pl-6 text-gray-700">
          <li>Basic insurance is included. Additional coverage may be available at extra cost.</li>
          <li>The renter is liable for any damage, loss, or theft of the vehicle not covered by insurance.</li>
          <li>In case of an accident, the renter must notify the company and local authorities immediately.</li>
        </ul>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">5. Fuel Policy</h2>
        <ul className="list-disc pl-6 text-gray-700">
          <li>Vehicles are provided with a full tank and must be returned with a full tank unless otherwise agreed.</li>
          <li>Refueling charges may apply if the vehicle is not returned with a full tank.</li>
        </ul>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">6. Cancellations and No-Shows</h2>
        <ul className="list-disc pl-6 text-gray-700">
          <li>Cancellations should be made at least 24 hours before the scheduled pickup time.</li>
          <li>No-shows or late cancellations may incur a fee.</li>
        </ul>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">7. Privacy</h2>
        <ul className="list-disc pl-6 text-gray-700">
          <li>Your personal information will be handled in accordance with our privacy policy and will not be shared with third parties except as required by law.</li>
        </ul>
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">8. Agreement</h2>
        <ul className="list-disc pl-6 text-gray-700">
          <li>By booking a vehicle, you agree to abide by these terms and conditions.</li>
          <li>The company reserves the right to update these terms at any time without prior notice.</li>
        </ul>
      </section>
      <div className="text-center text-gray-500 text-sm mt-8">
        &copy; {new Date().getFullYear()} KIMU Transport. All rights reserved.
      </div>
    </div>
  );
} 