import type { PointLightConfig, AmbientLightConfig } from "./config";

interface SceneLightingProps {
  pointLight: PointLightConfig;
  ambientLight: AmbientLightConfig;
}

export default function SceneLighting({
  pointLight,
  ambientLight,
}: SceneLightingProps) {
  return (
    <>
      <pointLight
        position={pointLight.position}
        intensity={pointLight.intensity}
        color={pointLight.color}
        distance={pointLight.distance}
        decay={pointLight.decay}
        castShadow={pointLight.castShadow}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <ambientLight
        intensity={ambientLight.intensity}
        color={ambientLight.color}
      />
      <hemisphereLight
        args={["#fefcf3", "#1a1a2e", 0.15]}
      />
    </>
  );
}