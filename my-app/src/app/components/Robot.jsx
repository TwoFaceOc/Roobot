"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

function RobotHead({ animate }) {
  const headRef = useRef();
  const { mouse, clock } = useThree();
  const { scene } = useGLTF("/models/scene.gltf");

  const baseRotation = THREE.MathUtils.degToRad(-90);
  const initialPosition = [0, -1.5, 0]; // البداية أسفل الشاشة
  const finalPosition = [0, -0.2, 0]; // موضع المنتصف

  const [scale, setScale] = useState(0);
  const [opacity, setOpacity] = useState(0);
  const [positionY, setPositionY] = useState(initialPosition[1]);

  useFrame(() => {
    if (!headRef.current) return;

    // تتبع الرأس أفقيًا + Idle حركة بسيطة
    const offset = mouse.x * 0.3;
    const idle = Math.sin(clock.getElapsedTime() * 1.5) * 0.05;
    headRef.current.rotation.y = baseRotation + offset + idle;

    // حركة دخول تدريجية
    if (animate) {
      setScale((s) => Math.min(s + 0.02, 0.6));
      setOpacity((o) => Math.min(o + 0.05, 1));
      setPositionY((y) => Math.min(y + 0.03, finalPosition[1]));
    }

    headRef.current.position.set(finalPosition[0], positionY, finalPosition[2]);
    headRef.current.scale.set(scale, scale, scale);

    // تطبيق الشفافية لجميع المواد
    headRef.current.traverse((child) => {
      if (child.material) {
        child.material.transparent = true;
        child.material.opacity = opacity;
        // إضافة لون glow بسيط
        if (child.material.emissive) {
          child.material.emissive.set(new THREE.Color(0x00ffff));
          child.material.emissiveIntensity = 0.2;
        }
      }
    });
  });

  return <primitive ref={headRef} object={scene} />;
}

export default function LandingPage() {
  const [showRobot, setShowRobot] = useState(false);
  const [textVisible, setTextVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setTextVisible(true), 300);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="landing-page">
      <div className="background"></div>

      {!showRobot && (
        <div className={`content ${textVisible ? "visible" : ""}`}>
          <h1>Welcome to RoboWorld</h1>
          <p>Discover futuristic technology with interactive 3D robots.</p>
          <button onClick={() => setShowRobot(true)}>Get Started</button>
        </div>
      )}

      {showRobot && (
        <Canvas camera={{ position: [0, 1, 3], fov: 50 }}>
          <ambientLight intensity={0.4} />
          <spotLight
            position={[5, 5, 5]}
            angle={0.3}
            intensity={1.5}
            castShadow
          />
          <directionalLight position={[-5, 5, -5]} intensity={0.8} />

          <Suspense fallback={<mesh />}>
            <RobotHead animate={showRobot} />
          </Suspense>

          {/* Bloom effect */}
          <EffectComposer>
            <Bloom
              intensity={1.5}
              luminanceThreshold={0.2}
              luminanceSmoothing={0.05}
              height={300}
            />
          </EffectComposer>

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            enableRotate={false}
          />
        </Canvas>
      )}

      <style jsx>{`
        .landing-page {
          width: 100vw;
          height: 100vh;
          position: relative;
          overflow: hidden;
        }
        .background {
          position: absolute;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
          background-size: 600% 600%;
          animation: gradient 20s ease infinite;
          z-index: -1;
        }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .content {
          position: absolute;
          top: 40%;
          left: 50%;
          transform: translate(-50%, -50%) translateY(-30px);
          text-align: center;
          color: white;
          z-index: 10;
          opacity: 0;
          transition: all 1s ease;
        }
        .content.visible {
          opacity: 1;
          transform: translate(-50%, -50%) translateY(0);
        }
        .content h1 {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
        .content p {
          font-size: 1.2rem;
          margin-bottom: 2rem;
        }
        .content button {
          padding: 1rem 2rem;
          font-size: 1rem;
          border: none;
          border-radius: 10px;
          background: #00ffff;
          color: #000;
          cursor: pointer;
          transition: 0.3s;
        }
        .content button:hover {
          background: #00b3b3;
        }
      `}</style>
    </div>
  );
}
