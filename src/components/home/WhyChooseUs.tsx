export default function WhyChooseUs() {
    return (
        <section className="py-16 bg-white">
            <div className="max-w-4xl mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold mb-8 text-gray-900">Why Choose <span className="text-orange-500">KIMU Transport?</span></h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-blue-50 rounded-xl p-6 shadow text-gray-900">
                        <div className="text-3xl mb-3">🚗</div>
                        <div className="font-bold mb-2">Modern Fleet</div>
                        <div className="text-gray-500">Latest models, meticulously maintained for your comfort and safety.</div>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-6 shadow text-gray-900">
                        <div className="text-3xl mb-3">🛡️</div>
                        <div className="font-bold mb-2">Professional Drivers</div>
                        <div className="text-gray-500">Trained, courteous, and always on time. Your journey is our priority.</div>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-6 shadow text-gray-900">
                        <div className="text-3xl mb-3">⭐</div>
                        <div className="font-bold mb-2">Luxury Experience</div>
                        <div className="text-gray-500">Enjoy a premium, stress-free ride every time you choose KIMU.</div>
                    </div>
                </div>
            </div>
        </section>
    )
}
