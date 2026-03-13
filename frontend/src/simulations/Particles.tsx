import { useRef, useEffect, useCallback, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useWavelengthColor } from './hooks/useWavelengthColor';
import { useInterference } from './hooks/useInterference';

interface ParticlesProps {
  wavelength: number;
  slitDistance: number;
  intensity: number;
  observerOn: boolean;
  slowMotion?: boolean;
  showTrails?: boolean;
  soundEnabled?: boolean;
  onParticleHit?: (z: number) => void;
  sourceX?: number;
  barrierX?: number;
  screenX?: number;
}

interface Particle {
  mesh: THREE.Mesh;
  glow: THREE.Mesh;
  ghost?: THREE.Mesh;
  ghostGlow?: THREE.Mesh;
  trailPoints: THREE.Vector3[];
  trailMesh?: THREE.Mesh;
  ghostTrailPoints: THREE.Vector3[];
  ghostTrailMesh?: THREE.Mesh;
  targetZ: number;
  phase: 'toBarrier' | 'splitting' | 'toScreen' | 'hit';
  speed: number;
  splitProgress: number;
}

const MAX_PARTICLES = 120;
const TRAIL_LENGTH = 25;

// Audio system
let audioCtx: AudioContext | null = null;

function playHit(enabled: boolean) {
  if (!enabled) return;
  
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.value = 600 + Math.random() * 600;
    gain.gain.setValueAtTime(0.025, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.04);
  } catch (e) {
    // Audio not available
  }
}

export function Particles({
  wavelength,
  slitDistance,
  intensity,
  observerOn,
  slowMotion = false,
  showTrails = true,
  soundEnabled = true,
  onParticleHit,
  sourceX = -8,
  barrierX = 0,
  screenX = 8,
}: ParticlesProps) {
  const groupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<Particle[]>([]);
  const color = useWavelengthColor(wavelength);
  const { getInterferencePosition } = useInterference(wavelength, slitDistance);
  const { camera } = useThree();

  const slit1Z = -slitDistance;
  const slit2Z = slitDistance;
  const timeScale = slowMotion ? 0.2 : 1;

  const geometries = useMemo(() => ({
    particle: new THREE.SphereGeometry(0.1, 16, 16),
    glow: new THREE.SphereGeometry(0.2, 16, 16),
    ghost: new THREE.SphereGeometry(0.08, 12, 12),
  }), []);

  const createTrailMesh = useCallback((c: THREE.Color, opacity: number) => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.1, 0, 0),
    ]);
    const geometry = new THREE.TubeGeometry(curve, 20, 0.03, 8, false);
    const material = new THREE.MeshBasicMaterial({
      color: c,
      transparent: true,
      opacity: opacity,
    });
    return new THREE.Mesh(geometry, material);
  }, []);

  const updateTrailMesh = useCallback((mesh: THREE.Mesh, points: THREE.Vector3[]) => {
    if (points.length < 2) return;
    
    const curve = new THREE.CatmullRomCurve3(points);
    const newGeometry = new THREE.TubeGeometry(curve, Math.max(8, points.length * 2), 0.025, 6, false);
    
    mesh.geometry.dispose();
    mesh.geometry = newGeometry;
  }, []);

  const spawnParticle = useCallback(() => {
    if (!groupRef.current || particlesRef.current.length >= MAX_PARTICLES) return;

    const mat = new THREE.MeshBasicMaterial({ color });
    const glowMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.3 });
    
    const mesh = new THREE.Mesh(geometries.particle, mat);
    const glow = new THREE.Mesh(geometries.glow, glowMat);
    
    const startPos = new THREE.Vector3(sourceX + 0.5, 1.2, 0);
    mesh.position.copy(startPos);
    glow.position.copy(startPos);

    let ghost: THREE.Mesh | undefined;
    let ghostGlow: THREE.Mesh | undefined;
    let ghostTrailMesh: THREE.Mesh | undefined;
    
    if (!observerOn) {
      const ghostMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.4 });
      const ghostGlowMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.15 });
      ghost = new THREE.Mesh(geometries.ghost, ghostMat);
      ghostGlow = new THREE.Mesh(geometries.glow, ghostGlowMat);
      ghost.position.copy(startPos);
      ghostGlow.position.copy(startPos);
      ghost.visible = false;
      ghostGlow.visible = false;
      groupRef.current.add(ghost);
      groupRef.current.add(ghostGlow);
      
      if (showTrails) {
        ghostTrailMesh = createTrailMesh(color, 0.25);
        ghostTrailMesh.visible = false;
        groupRef.current.add(ghostTrailMesh);
      }
    }

    let trailMesh: THREE.Mesh | undefined;
    if (showTrails) {
      trailMesh = createTrailMesh(color, 0.5);
      groupRef.current.add(trailMesh);
    }

    const targetZ = observerOn
      ? (Math.random() < 0.5 ? slit1Z : slit2Z) + (Math.random() - 0.5) * 0.15
      : getInterferencePosition();

    const particle: Particle = {
      mesh, glow, ghost, ghostGlow,
      trailPoints: [startPos.clone()],
      trailMesh,
      ghostTrailPoints: [],
      ghostTrailMesh,
      targetZ,
      phase: 'toBarrier',
      speed: 0.06 + Math.random() * 0.02,
      splitProgress: 0,
    };

    particlesRef.current.push(particle);
    groupRef.current.add(mesh);
    groupRef.current.add(glow);
  }, [color, observerOn, slit1Z, slit2Z, sourceX, getInterferencePosition, geometries, showTrails, createTrailMesh]);

  // Clear particles on mode/param change
  useEffect(() => {
    if (!groupRef.current) return;
    
    particlesRef.current.forEach(p => {
      groupRef.current?.remove(p.mesh);
      groupRef.current?.remove(p.glow);
      if (p.ghost) groupRef.current?.remove(p.ghost);
      if (p.ghostGlow) groupRef.current?.remove(p.ghostGlow);
      if (p.trailMesh) {
        p.trailMesh.geometry.dispose();
        (p.trailMesh.material as THREE.Material).dispose();
        groupRef.current?.remove(p.trailMesh);
      }
      if (p.ghostTrailMesh) {
        p.ghostTrailMesh.geometry.dispose();
        (p.ghostTrailMesh.material as THREE.Material).dispose();
        groupRef.current?.remove(p.ghostTrailMesh);
      }
      (p.mesh.material as THREE.Material).dispose();
      (p.glow.material as THREE.Material).dispose();
    });
    particlesRef.current = [];
  }, [observerOn, wavelength, slitDistance]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const cameraDistance = camera.position.distanceTo(new THREE.Vector3(0, 1, 0));
    const dt = delta * timeScale;
    
    const visibility = Math.max(0.3, Math.min(1, (22 - cameraDistance) / 12));
    const sizeScale = 0.6 + visibility * 0.6;

    // Spawn particles
    if (Math.random() < (intensity / 500) * timeScale) {
      spawnParticle();
    }

    const toRemove: Particle[] = [];

    particlesRef.current.forEach(p => {
      const { mesh, glow, ghost, ghostGlow, trailPoints, trailMesh, ghostTrailPoints, ghostTrailMesh, targetZ, phase, speed } = p;

      mesh.scale.setScalar(sizeScale);
      glow.scale.setScalar(sizeScale);
      
      const meshMat = mesh.material as THREE.MeshBasicMaterial;
      const glowMat = glow.material as THREE.MeshBasicMaterial;
      
      if (phase !== 'hit') {
        meshMat.opacity = visibility;
        glowMat.opacity = visibility * 0.3;
      }

      // Update trail
      if (showTrails && trailMesh && phase !== 'hit') {
        trailPoints.push(mesh.position.clone());
        if (trailPoints.length > TRAIL_LENGTH) trailPoints.shift();
        if (trailPoints.length >= 2) {
          updateTrailMesh(trailMesh, trailPoints);
          (trailMesh.material as THREE.MeshBasicMaterial).opacity = visibility * 0.5;
        }
      }

      if (phase === 'toBarrier') {
        mesh.position.x += speed * timeScale;

        if (mesh.position.x >= barrierX - 1.5 && !observerOn) {
          p.phase = 'splitting';
          if (ghost) {
            ghost.visible = true;
            ghost.position.copy(mesh.position);
          }
          if (ghostGlow) {
            ghostGlow.visible = true;
            ghostGlow.position.copy(mesh.position);
          }
          if (ghostTrailMesh) {
            ghostTrailMesh.visible = true;
          }
        } else if (mesh.position.x >= barrierX - 0.15) {
          p.phase = 'toScreen';
          if (observerOn) {
            mesh.position.z = Math.random() < 0.5 ? slit1Z : slit2Z;
          }
        }
      } 
      else if (phase === 'splitting') {
        p.splitProgress += dt * 2;
        mesh.position.x += speed * timeScale;
        
        const ease = Math.min(p.splitProgress, 1);
        const smooth = ease * ease * (3 - 2 * ease);
        
        mesh.position.z = THREE.MathUtils.lerp(0, slit1Z, smooth * 0.85);
        
        if (ghost && ghostGlow) {
          ghost.position.x = mesh.position.x;
          ghost.position.y = mesh.position.y;
          ghost.position.z = THREE.MathUtils.lerp(0, slit2Z, smooth * 0.85);
          ghostGlow.position.copy(ghost.position);
          ghost.scale.setScalar(sizeScale * 0.9);
          
          (ghost.material as THREE.MeshBasicMaterial).opacity = 0.4 * ease * visibility;

          // Ghost trail
          if (showTrails && ghostTrailMesh) {
            ghostTrailPoints.push(ghost.position.clone());
            if (ghostTrailPoints.length > TRAIL_LENGTH) ghostTrailPoints.shift();
            if (ghostTrailPoints.length >= 2) {
              updateTrailMesh(ghostTrailMesh, ghostTrailPoints);
              (ghostTrailMesh.material as THREE.MeshBasicMaterial).opacity = visibility * 0.25;
            }
          }
        }

        if (mesh.position.x >= barrierX - 0.1) {
          p.phase = 'toScreen';
          mesh.position.z = slit1Z;
          if (ghost) ghost.position.z = slit2Z;
        }
      }
      else if (phase === 'toScreen') {
        mesh.position.x += speed * timeScale;

        if (!observerOn && ghost && ghostGlow) {
          ghost.position.x += speed * timeScale;
          
          const progress = (mesh.position.x - barrierX) / (screenX - barrierX);
          const converge = progress * progress;
          
          mesh.position.z = THREE.MathUtils.lerp(slit1Z, targetZ, converge);
          ghost.position.z = THREE.MathUtils.lerp(slit2Z, targetZ, converge);
          ghostGlow.position.copy(ghost.position);
          
          if (progress > 0.6) {
            const fade = (progress - 0.6) / 0.4;
            (ghost.material as THREE.MeshBasicMaterial).opacity = 0.4 * (1 - fade) * visibility;
            if (ghostTrailMesh) {
              (ghostTrailMesh.material as THREE.MeshBasicMaterial).opacity = 0.25 * (1 - fade) * visibility;
            }
          }

          // Continue ghost trail
          if (showTrails && ghostTrailMesh) {
            ghostTrailPoints.push(ghost.position.clone());
            if (ghostTrailPoints.length > TRAIL_LENGTH) ghostTrailPoints.shift();
            if (ghostTrailPoints.length >= 2) {
              updateTrailMesh(ghostTrailMesh, ghostTrailPoints);
            }
          }
        } else {
          const zDiff = targetZ - mesh.position.z;
          mesh.position.z += zDiff * 0.1 * timeScale;
        }

        if (mesh.position.x >= screenX - 0.22) {
          p.phase = 'hit';
          playHit(soundEnabled);
          onParticleHit?.(targetZ);
          mesh.position.x = screenX - 0.2;
          mesh.position.z = targetZ;
          if (ghost) ghost.visible = false;
          if (ghostGlow) ghostGlow.visible = false;
          if (ghostTrailMesh) ghostTrailMesh.visible = false;
        }
      } 
      else if (phase === 'hit') {
        meshMat.transparent = true;
        meshMat.opacity -= dt * 1.5;
        glowMat.opacity -= dt * 1.5;
        
        if (trailMesh) {
          (trailMesh.material as THREE.MeshBasicMaterial).opacity -= dt;
        }
        
        if (meshMat.opacity <= 0) {
          toRemove.push(p);
        }
      }

      glow.position.copy(mesh.position);
    });

    // Cleanup dead particles
    toRemove.forEach(p => {
      groupRef.current?.remove(p.mesh);
      groupRef.current?.remove(p.glow);
      if (p.ghost) groupRef.current?.remove(p.ghost);
      if (p.ghostGlow) groupRef.current?.remove(p.ghostGlow);
      if (p.trailMesh) {
        p.trailMesh.geometry.dispose();
        (p.trailMesh.material as THREE.Material).dispose();
        groupRef.current?.remove(p.trailMesh);
      }
      if (p.ghostTrailMesh) {
        p.ghostTrailMesh.geometry.dispose();
        (p.ghostTrailMesh.material as THREE.Material).dispose();
        groupRef.current?.remove(p.ghostTrailMesh);
      }
      (p.mesh.material as THREE.Material).dispose();
      (p.glow.material as THREE.Material).dispose();
      
      const idx = particlesRef.current.indexOf(p);
      if (idx > -1) particlesRef.current.splice(idx, 1);
    });
  });

  // Cleanup on unmount: dispose per-particle materials
  useEffect(() => {
    return () => {
      particlesRef.current.forEach(p => {
        (p.mesh.material as THREE.Material).dispose();
        (p.glow.material as THREE.Material).dispose();
        p.mesh.geometry.dispose();
        p.glow.geometry.dispose();
      });
    };
  }, []);

  // Dispose shared geometries (from useMemo) on unmount
  useEffect(() => {
    return () => {
      geometries.particle.dispose();
      geometries.glow.dispose();
      geometries.ghost.dispose();
    };
  }, [geometries]);

  return <group ref={groupRef} />;
}
