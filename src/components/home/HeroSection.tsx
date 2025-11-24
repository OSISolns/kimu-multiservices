import Link from 'next/link'
import Image from 'next/image'

export default function HeroSection() {
    return (
        <section className="relative flex flex-col md:flex-row items-center justify-between px-4 py-24 max-w-7xl mx-auto">
            <div className="max-w-xl z-10">
                <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-gray-900 leading-tight drop-shadow-lg">
                    Experience Premium<br />
                    <span className="text-orange-500">Transportation</span> in Rwanda
                </h1>
                <p className="text-lg text-gray-700 mb-8">
                    Premium car rentals, executive taxi services, and airport transfers. Arrive in style, comfort, and safety with KIMU Transport & Multiservices.
                </p>
                <div className="flex gap-4">
                    <Link href="/offers" className="bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors shadow-lg">
                        View Services
                    </Link>
                    <Link href="/rent-a-car" className="bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors shadow-lg">
                        Rent a Car
                    </Link>
                </div>
            </div>
            <div className="flex-1 flex justify-end items-center mt-12 md:mt-0">
                <Image
                    src="/vehicles/TXL-02.png"
                    alt="Luxury Car"
                    width={1000}
                    height={700}
                    className="object-contain animate-hero-float"
                    priority
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                />
            </div>
        </section>
    )
}
