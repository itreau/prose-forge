import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Preload } from "@react-three/drei";
import type { SceneConfig } from "./config";
import PaperPlane from "./PaperPlane";
import SceneLighting from "./SceneLighting";

interface PaperSceneProps {
  config: SceneConfig;
  className?: string;
}

function SceneFallback() {
  return (
    <mesh rotation={[-Math.PI / 2.05, 0, 0]}>
      <planeGeometry args={[40, 55]} />
      <meshStandardMaterial color="#f4f3ec" roughness={0.65} />
    </mesh>
  );
}

export default function PaperScene({ config, className }: PaperSceneProps) {
  return (
    <Canvas
      className={className}
      shadows
      dpr={[1, 2]}
      camera={{
        position: config.cameraPosition,
        fov: config.cameraFov,
        near: 0.1,
        far: 50,
      }}
      gl={{ antialias: true }}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        background: config.backgroundColor,
      }}
    >
      <SceneLighting
        pointLight={config.pointLight}
        ambientLight={config.ambientLight}
      />
      <Suspense fallback={<SceneFallback />}>
        <PaperPlane material={config.material} plane={config.plane} />
        <Preload all />
      </Suspense>
    </Canvas>
  );
}