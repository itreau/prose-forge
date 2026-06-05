import type { PointLightConfig, AmbientLightConfig, PlaneConfig } from "./config";
import { computeLightPosition } from "./config";
import LightGizmo from "./LightGizmo";

interface SceneLightingProps {
  pointLight: PointLightConfig;
  ambientLight: AmbientLightConfig;
  plane: PlaneConfig;
  showLightHelper?: boolean;
}

export default function SceneLighting({
  pointLight,
  ambientLight,
  plane,
  showLightHelper = false,
}: SceneLightingProps) {
  const position = computeLightPosition(pointLight, plane);

  return (
    <>
      <pointLight
        position={position}
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
      {showLightHelper && <LightGizmo light={pointLight} plane={plane} />}
    </>
  );
}