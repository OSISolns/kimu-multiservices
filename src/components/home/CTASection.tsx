import Link from 'next/link'

export default function CTASection() {
    return (
        <section className="py-16 bg-gradient-to-r from-orange-500 to-blue-700 text-white">
            <div className="max-w-3xl mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold mb-4">Book Your Premium Ride Today</h2>
                <p className="text-xl mb-8">Contact us for premium car rentals, executive taxi services, and airport transfers in Rwanda.</p>
                <Link
                    href="/contact"
                    className="bg-white text-orange-600 px-8 py-3 rounded-lg hover:bg-orange-100 hover:scale-105 shadow-lg transition-all font-semibold"
                >
                    Contact Us
                </Link>
            </div>
        </section>
    )
}
