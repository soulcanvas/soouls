'use client';

export default function FooterSection() {
    return (
        <footer
            id="footer"
            className="relative flex items-center justify-center overflow-hidden"
            style={{
                backgroundColor: '#1F1F1F',
                minHeight: '507px',
                padding: '40px 0',
            }}
        >
            {/* Noise Overlay */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
                    opacity: 0.08,
                    mixBlendMode: 'overlay',
                    pointerEvents: 'none',
                }}
            />

            {/* Stacked Text block matching Figma Gap -136px on 280px font */}
            <div
                className="relative z-10 flex flex-col items-center justify-center"
            >
                {Array.from({ length: 6 }).map((_, i) => (
                    <span
                        key={i}
                        className="font-urbanist"
                        style={{
                            fontSize: 'clamp(100px, 15vw, 280px)',
                            lineHeight: '0.55em', /* Emulates the negative overlap tightly */
                            letterSpacing: '-0.035em',
                            fontWeight: 800,
                            color: 'transparent',
                            WebkitTextStroke: '2px #FFFFFF',
                            userSelect: 'none',
                            textTransform: 'none',
                        }}
                    >
                        Soulcanvas
                    </span>
                ))}
            </div>
        </footer>
    );
}
