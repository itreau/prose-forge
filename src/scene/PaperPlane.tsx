import { useRef, useEffect } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { Mesh, Texture } from "three";
import type { MaterialConfig, PlaneConfig } from "./config";

interface PaperPlaneProps {
  material: MaterialConfig;
  plane: PlaneConfig;
}

const WRAPPING_MAP: Record<string, THREE.Wrapping> = {
  clamp: THREE.ClampToEdgeWrapping,
  stretch: THREE.ClampToEdgeWrapping,
  tile: THREE.RepeatWrapping,
};

export default function PaperPlane({ material, plane }: PaperPlaneProps) {
  const meshRef = useRef<Mesh>(null);

  const textureEntries: Record<string, string> = {
    map: material.diffuse,
    roughnessMap: material.roughness,
    normalMap: material.normal,
    displacementMap: material.height,
  };
  if (material.specular) textureEntries.metalnessMap = material.specular;
  if (material.ao) textureEntries.aoMap = material.ao;

  const textures = useTexture(textureEntries);

  const wrapMode = WRAPPING_MAP[material.textureStyle] ?? THREE.RepeatWrapping;
  const isTile = material.textureStyle === "tile";
  const repeatX = isTile ? material.tileX : 1;
  const repeatY = isTile ? material.tileY : 1;

  useEffect(() => {
    const allTextures = [
      textures.map,
      textures.roughnessMap,
      textures.normalMap,
      textures.displacementMap,
      textures.metalnessMap,
      textures.aoMap,
    ] as THREE.Texture[];

    for (const tex of allTextures) {
      if (!tex) continue;
      tex.wrapS = wrapMode;
      tex.wrapT = wrapMode;
      tex.repeat.set(repeatX, repeatY);
      tex.needsUpdate = true;
    }
  }, [textures, wrapMode, repeatX, repeatY]);

  const normalMapRef = useRef(textures.normalMap);
  const roughnessMapRef = useRef(textures.roughnessMap);
  const aoMapRef = useRef(textures.aoMap);

  useEffect(() => {
    normalMapRef.current.colorSpace = "srgb" as never;
    roughnessMapRef.current.channel = 1;
    if (aoMapRef.current) aoMapRef.current.channel = 0;
  }, [textures.normalMap, textures.roughnessMap, textures.aoMap]);

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2.05, 0, 0]}
      receiveShadow
      castShadow={false}
    >
      <planeGeometry args={[plane.width, plane.height, plane.segments, plane.segments]} />
      <meshStandardMaterial
        map={textures.map}
        roughnessMap={textures.roughnessMap as Texture}
        roughness={material.roughnessScale}
        normalMap={textures.normalMap as Texture}
        normalScale={[material.normalScale, material.normalScale]}
        metalnessMap={(textures.metalnessMap ?? null) as Texture | null}
        metalness={material.metalness}
        displacementMap={textures.displacementMap as Texture}
        displacementScale={0.1}
        aoMap={(textures.aoMap ?? null) as Texture | null}
        aoMapIntensity={material.aoScale}
      />
    </mesh>
  );
}