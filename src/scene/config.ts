

export type TextureStyle = "clamp" | "stretch" | "tile";

export interface MaterialConfig {
  name: string;
  diffuse: string;
  roughness: string;
  normal: string;
  height: string;
  specular?: string;
  ao?: string;
  textureStyle: TextureStyle;
  tileX: number;
  tileY: number;
  roughnessScale: number;
  normalScale: number;
  metalness: number;
  aoScale: number;
}

export interface PointLightConfig {
  position: [number, number, number];
  intensity: number;
  color: string;
  distance: number;
  decay: number;
  castShadow: boolean;
}

export interface AmbientLightConfig {
  intensity: number;
  color: string;
}

export interface PlaneConfig {
  width: number;
  height: number;
  segments: number;
}

export interface SceneConfig {
  material: MaterialConfig;
  pointLight: PointLightConfig;
  ambientLight: AmbientLightConfig;
  plane: PlaneConfig;
  cameraPosition: [number, number, number];
  cameraFov: number;
  backgroundColor: string;
}

export const defaultSceneConfig: SceneConfig = {
  material: {
    name: "paper",
    diffuse: "/assets/materials/paper/diffuse.jpg",
    roughness: "/assets/materials/paper/roughness.jpg",
    normal: "/assets/materials/paper/normal.jpg",
    height: "/assets/materials/paper/height.jpg",
    textureStyle: "tile",
    tileX: 4,
    tileY: 4,
    roughnessScale: 0.65,
    normalScale: 0.3,
    metalness: 0.0,
    aoScale: 1.0,
  },
  pointLight: {
    position: [12, 10, 8],
    intensity: 250,
    color: "#fefcf3",
    distance: 60,
    decay: 2,
    castShadow: true,
  },
  ambientLight: {
    intensity: 0.35,
    color: "#e8e4df",
  },
  plane: {
    width: 2,
    height: 2,
    segments: 32,
  },
  cameraPosition: [0, 4.5, 1],
  cameraFov: 30,
  backgroundColor: "#1a1a2e",
};

export function resolveMaterialPaths(
  materialName: string,
): Omit<MaterialConfig, "roughnessScale" | "normalScale" | "metalness" | "aoScale" | "name" | "textureStyle" | "tileX" | "tileY"> & { name: string } {
  const base = `/assets/materials/${materialName}`;
  return {
    name: materialName,
    diffuse: `${base}/diffuse.png`,
    roughness: `${base}/roughness.png`,
    normal: `${base}/normal.png`,
    height: `${base}/height.png`,
  };
}

export function buildSceneConfig(
  overrides?: Partial<SceneConfig>,
): SceneConfig {
  return {
    ...defaultSceneConfig,
    ...overrides,
    material: {
      ...defaultSceneConfig.material,
      ...overrides?.material,
    },
    pointLight: {
      ...defaultSceneConfig.pointLight,
      ...overrides?.pointLight,
    },
    ambientLight: {
      ...defaultSceneConfig.ambientLight,
      ...overrides?.ambientLight,
    },
    plane: {
      ...defaultSceneConfig.plane,
      ...overrides?.plane,
    },
  };
}