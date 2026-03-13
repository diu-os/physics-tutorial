import { useMemo } from 'react';
import { useWavelengthColor } from './hooks/useWavelengthColor';

interface ScreenProps {
  position: [number, number, number];
  wavelength: number;
  slitDistance: number;
  observerOn: boolean;
}

const SCREEN_WIDTH = 5.5;
const SCREEN_HEIGHT = 4;
const STRIP_COUNT = 100;
const PATTERN_HEIGHT = 3.5;

/**
 * Detection screen with interference/classical pattern
 */
export function Screen({ 
  position, 
  wavelength, 
  slitDistance, 
  observerOn 
}: ScreenProps) {
  const color = useWavelengthColor(wavelength);

  // Calculate pattern strips
  const strips = useMemo(() => {
    const result: Array<{ z: number; intensity: number }> = [];
    const slit1Z = -slitDistance;
    const slit2Z = slitDistance;
    const d = Math.abs(slit2Z - slit1Z);
    const k = (2 * Math.PI * d) / (wavelength / 150);

    for (let i = 0; i < STRIP_COUNT; i++) {
      const z = (i / STRIP_COUNT - 0.5) * SCREEN_WIDTH;
      
      let intensity: number;
      if (observerOn) {
        // Classical: two Gaussian peaks
        const sigma = 0.3;
        const g1 = Math.exp(-Math.pow(z - slit1Z, 2) / (2 * sigma * sigma));
        const g2 = Math.exp(-Math.pow(z - slit2Z, 2) / (2 * sigma * sigma));
        intensity = Math.max(g1, g2);
      } else {
        // Quantum: interference pattern cos²
        intensity = Math.pow(Math.cos(k * z), 2);
      }

      if (intensity > 0.1) {
        result.push({ z, intensity });
      }
    }

    return result;
  }, [wavelength, slitDistance, observerOn]);

  return (
    <group position={position}>
      {/* Main screen panel */}
      <mesh>
        <boxGeometry args={[0.2, SCREEN_HEIGHT, SCREEN_WIDTH]} />
        <meshPhongMaterial color={0x151525} />
      </mesh>

      {/* Pattern strips */}
      {strips.map((strip, i) => (
        <mesh 
          key={i} 
          position={[-0.15, 0, strip.z]}
        >
          <boxGeometry args={[
            0.08,                              // X: thickness
            PATTERN_HEIGHT,                    // Y: height
            SCREEN_WIDTH / STRIP_COUNT * 0.8  // Z: width
          ]} />
          <meshBasicMaterial 
            color={color} 
            transparent 
            opacity={strip.intensity * 0.9} 
          />
        </mesh>
      ))}
    </group>
  );
}
