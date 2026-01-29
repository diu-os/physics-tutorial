// QuantumTunneling/Particles.tsx
/**
 * Particle animation system for quantum tunneling simulation
 */

import { useRef, useEffect, useCallback, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTunneling, getParticleColor, getGlowColor } from './hooks/useTunneling';

interface ParticlesProps {
  energy: number;
  barrierHeight: number;
  barrierWidth: number;
  intensity: number;
  slowMotion?: boolean;
  showGlow?: boolean;
  showTrails?: boolean;
  barrierX?: number;
  sourceX?: number;
  targetX?: number;
  onParticleTunneled?: () => void;
  onParticleReflected?: () => void;
}

interface Particle {
  mesh: THREE.Mesh;
  glow: THREE.Mesh;
  trailPoints: THREE.Vector3[];
  trailMesh?: THREE.Mesh;
  phase: 'incident' | 'barrier' | 'transmitted' | 'reflected';
  willTunnel: boolean;
  speed: number;
  startTime: number;
  barrierEntryX?: number;
  hitFlashDone: boolean;
  hitTime: number;
}

const MAX_PARTICLES = 80;
const TRAIL_LENGTH = 20;
const HIT_FLASH_DURATION = 0.1;

export function Particles({
  energy,
  barrierHeight,
  barrierWidth,
  intensity,
  slowMotion = false,
  showGlow = true,
  showTrails = true,
  barrierX = 0,
  sourceX = -8,
  targetX = 8,
  onParticleTunneled,
  onParticleReflected,
}: ParticlesProps) {
  const groupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<Particle[]>([]);
  const lastSpawnRef = useRef(0);
  
  const { probability, isClassical, getEvanescentDecay } = useTunneling(
    energy, 
    barrierHeight, 
    barrierWidth
  );
  
  const timeScale = slowMotion ? 0.25 : 1;
  const scaledEnergy = energy / 2;
  
  const barrierLeft = barrierX - barrierWidth / 2;
  const barrierRight = barrierX + barrierWidth / 2;

  const geometries = useMemo(() => ({
    particle: new THREE.SphereGeometry(0.12, 16, 16),
    glow: new THREE.SphereGeometry(0.25, 16, 16),
  }), []);

  const createTrailMesh = useCallback((color: number, opacity: number) => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.1, 0, 0),
    ]);
    const geometry = new THREE.TubeGeometry(curve, 16, 0.025, 6, false);
    const material = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
    });
    return new THREE.Mesh(geometry, material);
  }, []);

  const updateTrailMesh = useCallback((mesh: THREE.Mesh, points: THREE.Vector3[]) => {
    if (points.length < 2) return;
    
    const curve = new THREE.CatmullRomCurve3(points);
    const newGeometry = new THREE.TubeGeometry(curve, Math.max(6, points.length * 2), 0.02, 5, false);
    
    mesh.geometry.dispose();
    mesh.geometry = newGeometry;
  }, []);

  const spawnParticle = useCallback(() => {
    if (!groupRef.current || particlesRef.current.length >= MAX_PARTICLES) return;

    const willTunnel = isClassical || Math.random() < probability;
    
    const color = getParticleColor('incident');
    const glowColor = getGlowColor('incident');
    
    const mat = new THREE.MeshBasicMaterial({ color });
    const glowMat = new THREE.MeshBasicMaterial({ 
      color: glowColor, 
      transparent: true, 
      opacity: 0.35 
    });
    
    const mesh = new THREE.Mesh(geometries.particle, mat);
    const glow = new THREE.Mesh(geometries.glow, glowMat);
    
    const z = (Math.random() - 0.5) * 3;
    const startPos = new THREE.Vector3(sourceX + 0.5, scaledEnergy, z);
    
    mesh.position.copy(startPos);
    glow.position.copy(startPos);
    
    groupRef.current.add(mesh);
    if (showGlow) groupRef.current.add(glow);

    let trailMesh: THREE.Mesh | undefined;
    if (showTrails) {
      trailMesh = createTrailMesh(color, 0.4);
      groupRef.current.add(trailMesh);
    }

    const particle: Particle = {
      mesh,
      glow,
      trailPoints: [startPos.clone()],
      trailMesh,
      phase: 'incident',
      willTunnel,
      speed: 0.06 + Math.random() * 0.02,
      startTime: Date.now(),
      hitFlashDone: false,
      hitTime: 0,
    };

    particlesRef.current.push(particle);
  }, [geometries, probability, isClassical, sourceX, scaledEnergy, showGlow, showTrails, createTrailMesh]);

  useFrame((_, delta) => {
    const dt = delta * timeScale;
    const now = Date.now();
    const spawnInterval = 1000 / intensity;
    
    if (now - lastSpawnRef.current > spawnInterval) {
      spawnParticle();
      lastSpawnRef.current = now;
    }

    const toRemove: Particle[] = [];

    particlesRef.current.forEach(p => {
      const { mesh, glow, trailPoints, trailMesh, phase, willTunnel, speed } = p;
      const meshMat = mesh.material as THREE.MeshBasicMaterial;
      const glowMat = glow.material as THREE.MeshBasicMaterial;

      if (showTrails && trailMesh && phase !== 'reflected') {
        trailPoints.push(mesh.position.clone());
        if (trailPoints.length > TRAIL_LENGTH) trailPoints.shift();
        if (trailPoints.length >= 2) {
          updateTrailMesh(trailMesh, trailPoints);
        }
      }

      if (phase === 'incident') {
        mesh.position.x += speed * timeScale;
        
        if (mesh.position.x >= barrierLeft) {
          if (willTunnel) {
            p.phase = 'barrier';
            p.barrierEntryX = mesh.position.x;
            meshMat.color.setHex(getParticleColor('barrier'));
            glowMat.color.setHex(getGlowColor('barrier'));
          } else {
            p.phase = 'reflected';
            meshMat.color.setHex(getParticleColor('reflected'));
            glowMat.color.setHex(getGlowColor('reflected'));
            onParticleReflected?.();
          }
        }
      }
      else if (phase === 'barrier') {
        mesh.position.x += speed * timeScale * 0.7;
        
        const progress = (mesh.position.x - barrierLeft) / barrierWidth;
        const decay = getEvanescentDecay(progress);
        
        mesh.scale.setScalar(0.8 + 0.4 * decay);
        meshMat.opacity = 0.5 + 0.5 * decay;
        glowMat.opacity = 0.15 + 0.25 * decay;
        
        if (mesh.position.x >= barrierRight) {
          p.phase = 'transmitted';
          meshMat.color.setHex(getParticleColor('transmitted'));
          glowMat.color.setHex(getGlowColor('transmitted'));
          meshMat.opacity = 1;
          mesh.scale.setScalar(1);
        }
      }
      else if (phase === 'transmitted') {
        mesh.position.x += speed * timeScale;
        
        if (mesh.position.x >= targetX) {
          if (!p.hitFlashDone) {
            meshMat.color.setHex(0xffffff);
            glowMat.color.setHex(0xffffff);
            mesh.scale.setScalar(1.5);
            glow.scale.setScalar(2);
            glowMat.opacity = 0.8;
            p.hitFlashDone = true;
            p.hitTime = 0;
            onParticleTunneled?.();
          }
          
          p.hitTime += dt;
          
          if (p.hitTime > HIT_FLASH_DURATION) {
            meshMat.opacity -= dt * 4;
            glowMat.opacity -= dt * 4;
            if (trailMesh) {
              (trailMesh.material as THREE.MeshBasicMaterial).opacity -= dt * 3;
            }
            
            if (meshMat.opacity <= 0) {
              toRemove.push(p);
            }
          }
        }
      }
      else if (phase === 'reflected') {
        mesh.position.x -= speed * timeScale;
        
        const fadeProgress = Math.max(0, (sourceX - mesh.position.x) / 3);
        meshMat.opacity = 1 - fadeProgress;
        glowMat.opacity = 0.35 * (1 - fadeProgress);
        
        if (trailMesh) {
          (trailMesh.material as THREE.MeshBasicMaterial).opacity = 0.4 * (1 - fadeProgress);
        }
        
        if (mesh.position.x <= sourceX - 2) {
          toRemove.push(p);
        }
      }

      glow.position.copy(mesh.position);
    });

    toRemove.forEach(p => {
      groupRef.current?.remove(p.mesh);
      groupRef.current?.remove(p.glow);
      if (p.trailMesh) {
        p.trailMesh.geometry.dispose();
        (p.trailMesh.material as THREE.Material).dispose();
        groupRef.current?.remove(p.trailMesh);
      }
      (p.mesh.material as THREE.Material).dispose();
      (p.glow.material as THREE.Material).dispose();
      
      const idx = particlesRef.current.indexOf(p);
      if (idx > -1) particlesRef.current.splice(idx, 1);
    });
  });

  useEffect(() => {
    return () => {
      particlesRef.current.forEach(p => {
        (p.mesh.material as THREE.Material).dispose();
        (p.glow.material as THREE.Material).dispose();
      });
    };
  }, []);

  useEffect(() => {
    particlesRef.current.forEach(p => {
      groupRef.current?.remove(p.mesh);
      groupRef.current?.remove(p.glow);
      if (p.trailMesh) {
        p.trailMesh.geometry.dispose();
        (p.trailMesh.material as THREE.Material).dispose();
        groupRef.current?.remove(p.trailMesh);
      }
      (p.mesh.material as THREE.Material).dispose();
      (p.glow.material as THREE.Material).dispose();
    });
    particlesRef.current = [];
  }, [energy, barrierHeight, barrierWidth]);

  return <group ref={groupRef} />;
}
