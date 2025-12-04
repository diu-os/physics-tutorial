import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface DoubleSlitProps {
  wavelength: number;      // nm (400-700)
  slitSeparation: number;  // mm (0.01-1)
  observerMode: boolean;
}

function DoubleSlit({ wavelength, slitSeparation, observerMode }: DoubleSlitProps) {
  const particlesRef = useRef<THREE.Points>(null);
  const waveParticlesRef = useRef<THREE.Points>(null);
  const timeRef = useRef(0);

  // Convert wavelength to color
  const wavelengthToColor = (wl: number): THREE.Color => {
    let r = 0, g = 0, b = 0;
    
    if (wl >= 380 && wl < 440) {
      r = -(wl - 440) / (440 - 380);
      b = 1;
    } else if (wl >= 440 && wl < 490) {
      g = (wl - 440) / (490 - 440);
      b = 1;
    } else if (wl >= 490 && wl < 510) {
      g = 1;
      b = -(wl - 510) / (510 - 490);
    } else if (wl >= 510 && wl < 580) {
      r = (wl - 510) / (580 - 510);
      g = 1;
    } else if (wl >= 580 && wl < 645) {
      r = 1;
      g = -(wl - 645) / (645 - 580);
    } else if (wl >= 645 && wl <= 780) {
      r = 1;
    }
    
    return new THREE.Color(r, g, b);
  };

  const color = wavelengthToColor(wavelength);

  // Generate interference pattern for the screen
  const interferencePattern = useMemo(() => {
    const numPoints = 100;
    const pattern: number[] = [];
    const wavelengthM = wavelength * 1e-9;
    const slitSepM = slitSeparation * 1e-3;
    
    for (let i = 0; i < numPoints; i++) {
      const y = (i - numPoints / 2) * 0.04;
      const theta = Math.atan(y / 2);
      
      if (observerMode) {
        // Particle behavior: two gaussian bands
        const band1 = Math.exp(-Math.pow((y - slitSeparation * 0.8), 2) / 0.05);
        const band2 = Math.exp(-Math.pow((y + slitSeparation * 0.8), 2) / 0.05);
        pattern.push((band1 + band2) * 0.8);
      } else {
        // Wave behavior: interference pattern
        const phase = Math.PI * slitSepM * Math.sin(theta) / wavelengthM;
        pattern.push(Math.pow(Math.cos(phase), 2));
      }
    }
    
    return pattern;
  }, [wavelength, slitSeparation, observerMode]);

  // Wave particles spreading from slits
  const waveParticles = useMemo(() => {
    const count = 3000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      // Random angle from each slit
      const fromTopSlit = i % 2 === 0;
      const slitY = fromTopSlit ? slitSeparation / 2 : -slitSeparation / 2;
      
      // Spread angle (-60 to +60 degrees)
      const angle = (Math.random() - 0.5) * Math.PI * 0.7;
      
      // Random distance from slit
      const distance = Math.random() * 2.5;
      
      const x = distance * Math.cos(angle);
      const y = slitY + distance * Math.sin(angle);
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = 0;
      
      // Store phase for animation
      phases[i] = Math.random() * Math.PI * 2;
      
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    
    return { positions, colors, phases };
  }, [slitSeparation, color]);

  // Animate wave particles
  useFrame((state, delta) => {
    timeRef.current += delta;
    
    if (waveParticlesRef.current && !observerMode) {
      const positions = waveParticlesRef.current.geometry.attributes.position.array as Float32Array;
      const count = positions.length / 3;
      const speed = 0.8;
      
      for (let i = 0; i < count; i++) {
        const fromTopSlit = i % 2 === 0;
        const slitY = fromTopSlit ? slitSeparation / 2 : -slitSeparation / 2;
        
        // Get current position
        let x = positions[i * 3];
        let y = positions[i * 3 + 1];
        
        // Calculate distance from origin slit
        const dx = x;
        const dy = y - slitY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0.01) {
          // Move outward from slit
          const dirX = dx / dist;
          const dirY = dy / dist;
          
          x += dirX * delta * speed;
          y += dirY * delta * speed;
          
          // Reset if too far
          if (x > 2.3 || Math.abs(y) > 2.5) {
            const angle = (Math.random() - 0.5) * Math.PI * 0.7;
            const startDist = 0.05;
            x = startDist * Math.cos(angle);
            y = slitY + startDist * Math.sin(angle);
          }
          
          positions[i * 3] = x;
          positions[i * 3 + 1] = y;
        }
      }
      
      waveParticlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  // Screen hit particles (for observer mode)
  const screenParticles = useMemo(() => {
    const count = 500;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const patternIndex = Math.floor(Math.random() * interferencePattern.length);
      const probability = interferencePattern[patternIndex];
      
      if (Math.random() < probability) {
        const y = (patternIndex - interferencePattern.length / 2) * 0.04;
        positions[i * 3] = 2.5;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
        
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
      } else {
        positions[i * 3] = 100;
        positions[i * 3 + 1] = 100;
        positions[i * 3 + 2] = 0;
      }
    }
    
    return { positions, colors };
  }, [interferencePattern, color]);

  return (
    <group>
      {/* Source emitter */}
      <mesh position={[-2.5, 0, 0]}>
        <boxGeometry args={[0.15, 0.8, 0.3]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.5} />
      </mesh>
      
      {/* Light beam from source to barrier */}
      <mesh position={[-1.25, 0, 0]}>
        <boxGeometry args={[2.3, 0.05, 0.05]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} />
      </mesh>
      
      {/* Barrier with two slits */}
      <group position={[0, 0, 0]}>
        {/* Top part */}
        <mesh position={[0, 1.2 + slitSeparation / 2, 0]}>
          <boxGeometry args={[0.08, 2.4 - slitSeparation, 0.4]} />
          <meshStandardMaterial color="#374151" />
        </mesh>
        
        {/* Middle part (between slits) */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.08, slitSeparation * 0.6, 0.4]} />
          <meshStandardMaterial color="#374151" />
        </mesh>
        
        {/* Bottom part */}
        <mesh position={[0, -1.2 - slitSeparation / 2, 0]}>
          <boxGeometry args={[0.08, 2.4 - slitSeparation, 0.4]} />
          <meshStandardMaterial color="#374151" />
        </mesh>
        
        {/* Slit glow indicators */}
        <pointLight position={[0.1, slitSeparation / 2 + slitSeparation * 0.35, 0]} color={color} intensity={0.5} distance={1} />
        <pointLight position={[0.1, -slitSeparation / 2 - slitSeparation * 0.35, 0]} color={color} intensity={0.5} distance={1} />
      </group>
      
      {/* Detection screen */}
      <mesh position={[2.5, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[0.6, 4]} />
        <meshStandardMaterial color="#1e293b" side={THREE.DoubleSide} />
      </mesh>
      
      {/* Interference pattern on screen */}
      <group position={[2.48, 0, 0]}>
        {interferencePattern.map((intensity, i) => (
          <mesh 
            key={i} 
            position={[0, (i - interferencePattern.length / 2) * 0.04, 0]}
            rotation={[0, -Math.PI / 2, 0]}
          >
            <planeGeometry args={[0.04, 0.5]} />
            <meshBasicMaterial 
              color={color} 
              transparent 
              opacity={intensity * 0.9}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      </group>
      
      {/* Screen hit particles */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={screenParticles.positions.length / 3}
            array={screenParticles.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={screenParticles.colors.length / 3}
            array={screenParticles.colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial 
          size={0.03} 
          vertexColors 
          transparent 
          opacity={0.9}
        />
      </points>
      
      {/* Wave particles (only in wave mode) */}
      {!observerMode && (
        <points ref={waveParticlesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={waveParticles.positions.length / 3}
              array={waveParticles.positions}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-color"
              count={waveParticles.colors.length / 3}
              array={waveParticles.colors}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial 
            size={0.015} 
            vertexColors 
            transparent 
            opacity={0.6}
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}
      
      {/* Observer eye (when observer mode is on) */}
      {observerMode && (
        <group position={[0, 1.8, 0]}>
          <mesh>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.3} />
          </mesh>
          {/* Eye pupil */}
          <mesh position={[0, -0.05, 0.12]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial color="#000" />
          </mesh>
          {/* Detection lines */}
          <line>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([0, -0.15, 0, 0, -1.8 + slitSeparation/2 + slitSeparation*0.35, 0])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#fbbf24" transparent opacity={0.3} />
          </line>
        </group>
      )}
      
      {/* Labels */}
      <group>
        {/* Source label */}
        <sprite position={[-2.5, 0.7, 0]} scale={[0.8, 0.2, 1]}>
          <spriteMaterial color="#9ca3af" />
        </sprite>
        
        {/* Slits label */}
        <sprite position={[0, 2.2, 0]} scale={[0.6, 0.2, 1]}>
          <spriteMaterial color="#9ca3af" />
        </sprite>
        
        {/* Screen label */}
        <sprite position={[2.5, 2.2, 0]} scale={[0.6, 0.2, 1]}>
          <spriteMaterial color="#9ca3af" />
        </sprite>
      </group>
    </group>
  );
}

export default DoubleSlit;
