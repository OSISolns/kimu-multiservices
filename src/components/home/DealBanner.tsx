'use client'

import Link from 'next/link'

interface DealBannerProps {
    onDismiss: () => void;
}

export default function DealBanner({ onDismiss }: DealBannerProps) {
    const featuredDeal = {
        title: 'Drive Now, Pay Later with Kimu Transport and Multiservices LTD',
        description: 'Own a Toyota Corolla Levin or BYD EV today with only 20% deposit. Limited slots available.',
        link: 'http://localhost:3000/offers?tab=sales#vehicles',
    };

    return (
        <div className="relative overflow-hidden text-white px-4 py-3" style={{ backgroundColor: '#1e40af' }}>
            {/* Shimmering overlay */}
            <div
                className="absolute inset-0 opacity-30"
                style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
                    animation: 'shimmer 3s infinite linear',
                }}
            />

            <style jsx>{`
                @keyframes shimmer {
                    0% {
                        transform: translateX(-100%);
                    }
                    100% {
                        transform: translateX(100%);
                    }
                }
            `}</style>

            <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center gap-3 relative z-10">
                <div className="flex-1">
                    <p className="text-sm uppercase tracking-widest text-white/80">Limited-Time Deal</p>
                    <h2 className="text-xl font-semibold">{featuredDeal.title}</h2>
                    <p className="text-sm text-white/80">{featuredDeal.description}</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href={featuredDeal.link}
                        className="inline-flex items-center gap-2 bg-white/90 text-blue-700 px-4 py-2 rounded-full font-semibold hover:bg-white transition"
                    >
                        Explore Offer
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M12.9 4.6 11.5 6l2.1 2.1H5v2h8.6L11.5 12l1.4 1.4 4.6-4.6-4.6-4.6z" />
                        </svg>
                    </Link>
                    <button
                        className="text-white/70 hover:text-white"
                        onClick={onDismiss}
                        aria-label="Dismiss deal announcement"
                    >
                        ✕
                    </button>
                </div>
            </div>
        </div>
    )
}
