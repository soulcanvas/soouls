'use client';

import { useEffect, useRef } from 'react';

interface SplineSceneProps {
    scene: string;
    className?: string;
    style?: React.CSSProperties;
    onLoad?: () => void;
}

export default function SplineScene({ scene, className, style, onLoad }: SplineSceneProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let cleanup: (() => void) | undefined;

        // Dynamically import ONLY on the client, never at module level
        import('@splinetool/runtime').then(({ Application }) => {
            const canvas = document.createElement('canvas');
            canvas.style.width = '100%';
            canvas.style.height = '100%';

            if (containerRef.current) {
                containerRef.current.appendChild(canvas);

                const app = new Application(canvas);
                app.load(scene).then(() => {
                    onLoad?.();
                });

                cleanup = () => {
                    try {
                        app.dispose?.();
                    } catch (_) { }
                    canvas.remove();
                };
            }
        });

        return () => {
            cleanup?.();
        };
    }, [scene, onLoad]);

    return (
        <div
            ref={containerRef}
            className={className}
            style={{ width: '100%', height: '100%', ...style }}
        />
    );
}
