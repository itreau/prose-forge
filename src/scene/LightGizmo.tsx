import type { PointLightConfig, PlaneConfig } from "./config";
import { computeLightPosition } from "./config";

interface LightGizmoProps {
  light: PointLightConfig;
  plane: PlaneConfig;
}

export default function LightGizmo({ light, plane }: LightGizmoProps) {
  const position = computeLightPosition(light, plane);
  const len = 0.12;
  const thin = 0.008;
  const opacity = 0.7;

  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.025, 12, 12]} />
        <meshBasicMaterial color="#ffcc00" transparent opacity={0.9} />
      </mesh>
      <mesh position={[len / 2, 0, 0]}>
        <boxGeometry args={[len, thin, thin]} />
        <meshBasicMaterial color="#ff4444" transparent opacity={opacity} />
      </mesh>
      <mesh position={[-len / 2, 0, 0]}>
        <boxGeometry args={[len, thin, thin]} />
        <meshBasicMaterial color="#ff4444" transparent opacity={opacity} />
      </mesh>
      <mesh position={[0, len / 2, 0]}>
        <boxGeometry args={[thin, len, thin]} />
        <meshBasicMaterial color="#44ff44" transparent opacity={opacity} />
      </mesh>
      <mesh position={[0, -len / 2, 0]}>
        <boxGeometry args={[thin, len, thin]} />
        <meshBasicMaterial color="#44ff44" transparent opacity={opacity} />
      </mesh>
      <mesh position={[0, 0, len / 2]}>
        <boxGeometry args={[thin, thin, len]} />
        <meshBasicMaterial color="#4488ff" transparent opacity={opacity} />
      </mesh>
      <mesh position={[0, 0, -len / 2]}>
        <boxGeometry args={[thin, thin, len]} />
        <meshBasicMaterial color="#4488ff" transparent opacity={opacity} />
      </mesh>
    </group>
  );
}