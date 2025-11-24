'use client'

import { useRef } from 'react'

export default function VideoSection() {
    const video1Ref = useRef<HTMLVideoElement>(null)
    const video2Ref = useRef<HTMLVideoElement>(null)

    return (
        <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-12">Experience KIMU Transport</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                    <div className="relative aspect-video rounded-lg overflow-hidden shadow-xl">
                        <video
                            ref={video1Ref}
                            className="w-full h-full object-cover"
                            controls
                            poster="/car-1.jpeg"
                            preload="metadata"
                            suppressHydrationWarning
                        >
                            <source src="/VID1.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </div>
                    <div className="relative aspect-video rounded-lg overflow-hidden shadow-xl">
                        <video
                            ref={video2Ref}
                            className="w-full h-full object-cover"
                            controls
                            poster="/car-2.jpeg"
                            preload="metadata"
                            suppressHydrationWarning
                        >
                            <source src="/VID2.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </div>
                </div>
            </div>
        </section>
    )
}
