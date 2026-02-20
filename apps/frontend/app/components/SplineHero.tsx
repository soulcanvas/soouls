import type React from 'react';
import { Suspense, lazy } from 'react';

// Lazy loading Spline as recommended by the skill documentation
const Spline = lazy(() => import('@splinetool/react-spline'));

interface SplineHeroProps {
  scene?: string;
}

/**
 * A demonstration component for the Spline 3D Integration skill.
 * Following the patterns documented in .agent/skills/spline-3d-integration/SKILL.md
 */
const SplineHero: React.FC<SplineHeroProps> = ({
  scene = 'https://prod.spline.design/6Wq1Q7YGyH-H09vI/scene.splinecode', // Default Spline scene for demo
}) => {
  return (
    <div className="relative w-full h-[600px] bg-slate-900 rounded-xl overflow-hidden mb-8 border border-slate-800">
      <Suspense
        fallback={
          <div className="absolute inset-0 flex items-center justify-center text-slate-400">
            <div className="animate-pulse flex flex-col items-center">
              <div className="w-12 h-12 rounded-full border-4 border-slate-700 border-t-blue-500 animate-spin mb-4"></div>
              <p>Loading 3D Experience...</p>
            </div>
          </div>
        }
      >
        <Spline scene={scene} className="w-full h-full" />
      </Suspense>
    </div>
  );
};

export default SplineHero;
