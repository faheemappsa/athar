import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function Particles({ count = 200 }) {
  const mesh = useRef();
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 8;
      pos[i + 1] = (Math.random() - 0.5) * 6;
      pos[i + 2] = (Math.random() - 0.5) * 4;
    }
    return pos;
  }, [count]);

  useFrame((_, delta) => {
    if (mesh.current) {
      mesh.current.rotation.y += delta * 0.02;
      mesh.current.rotation.x += delta * 0.01;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#c9a84c"
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function CentralOrb() {
  const mesh = useRef();
  useFrame((_, delta) => {
    if (mesh.current) {
      mesh.current.rotation.y += delta * 0.1;
      mesh.current.rotation.x += delta * 0.05;
    }
  });

  return (
    <mesh ref={mesh}>
      <icosahedronGeometry args={[1.2, 1]} />
      <meshStandardMaterial
        color="#c9a84c"
        wireframe
        transparent
        opacity={0.15}
        emissive="#c9a84c"
        emissiveIntensity={0.3}
      />
    </mesh>
  );
}

function InnerGlow() {
  return (
    <mesh>
      <sphereGeometry args={[0.7, 32, 32]} />
      <meshBasicMaterial color="#c9a84c" transparent opacity={0.08} />
    </mesh>
  );
}

function Scene() {
  const { mouse } = useThree();

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[3, 2, 4]} intensity={0.6} color="#c9a84c" />
      <pointLight position={[-3, -2, -2]} intensity={0.3} color="#4a6fa5" />
      <group rotation={[mouse.y * 0.15, mouse.x * 0.2, 0]}>
        <CentralOrb />
        <InnerGlow />
        <Particles count={300} />
      </group>
    </>
  );
}

export default function MainScene() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene />
        <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
      </Canvas>
    </div>
  );
}
