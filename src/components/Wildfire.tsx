import * as THREE from "three";
import React, { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { latLongAltToVector3, EARTH_RADIUS } from "../App";

const enableSmoke = false;

interface Props {
    size?: number;
    latitude: number;
    longitude: number;
    altitude: number;
    title?: string;
    setHoveringText?: (text: string) => void;
}
const SMOKE_PARTICLE_COUNT = 16;
const Wildfire: React.FC<Props> = ({
    size = 1,
    latitude,
    longitude,
    altitude,
    title,
    setHoveringText,
}: Props) => {
    // Selection state
    const [selected, setSelected] = useState(false);

    // Smoke particles state: each has lat/lon/alt offset from base
    const smokeParticles = useMemo(() => {
        return Array.from({ length: SMOKE_PARTICLE_COUNT }, () => ({
            latOffset: (Math.random() - 0.5) * size * 8, // degrees
            lonOffset: (Math.random() - 0.5) * size * 8, // degrees
            altOffset: size * 4, // initial altitude offset
            speed: 0.2 + Math.random() * 0.3,
            offset: Math.random() * Math.PI * 2,
        }));
    }, []);

    // Store a ref for the smoke group
    const smokeGroupRef = useRef<THREE.Group>(null);
    const meshRefInner = useRef<THREE.Mesh>(null);
    const meshRefOuter = useRef<THREE.Mesh>(null);

    // Store a base scale for flicker
    const baseScale = useRef(size);

    useFrame((state, delta) => {
        if (meshRefInner.current && meshRefOuter.current) {
            // Flicker: randomize scale a bit each frame
            const flicker = 0.9 + Math.random() * 0.1;
            meshRefInner.current.scale.set(
                baseScale.current * flicker,
                baseScale.current * flicker,
                baseScale.current * flicker
            );
            meshRefOuter.current.scale.set(
                baseScale.current * flicker,
                baseScale.current * flicker,
                baseScale.current * flicker
            );
            meshRefInner.current.rotation.y += 0.5 * delta;
        }

        //get global position of fire
        const firePosition = latLongAltToVector3(
            latitude,
            longitude,
            altitude,
            EARTH_RADIUS
        );
        // Animate smoke particles
        if (smokeGroupRef.current) {
            const time = state.clock.getElapsedTime();
            smokeGroupRef.current.children.forEach((child, i) => {
                // Each particle rises and fades, then resets
                const p = smokeParticles[i];
                const t = (time * p.speed + p.offset) % 1;
                // Smoke rises in altitude
                const particleLat =
                    latitude + p.latOffset * size * 4 * (1 + t * 0.5);
                const particleLon =
                    longitude + p.lonOffset * size * 4 * (1 + t * 0.5);
                const particleAlt = altitude + p.altOffset + t * size * 10; // smoke rises
                const pos = latLongAltToVector3(
                    particleLat,
                    particleLon,
                    particleAlt,
                    EARTH_RADIUS
                );
                const correctedPos = new THREE.Vector3().subVectors(
                    pos,
                    firePosition
                );
                child.position.copy(correctedPos);
                // Fade out as it rises
                const mesh = child as THREE.Mesh;
                if (mesh.material && "opacity" in mesh.material) {
                    (mesh.material as THREE.MeshStandardMaterial).opacity =
                        0.5 * (1 - t);
                }
            });
        }
    });

    // Main fire position
    const firePosition = latLongAltToVector3(
        latitude,
        longitude,
        altitude,
        EARTH_RADIUS
    );
    return (
        <group position={firePosition}>
            {/* Inner fire mesh */}
            <mesh
                ref={meshRefInner}
                onPointerOver={() => {
                    setSelected((s) => true);
                    if (setHoveringText) {
                        const hoverText =
                            (title || "Wildfire") +
                            " at " +
                            latitude.toFixed(2) +
                            "°, " +
                            longitude.toFixed(2) +
                            "°";
                        setHoveringText(hoverText);
                    }
                }}
                onPointerOut={() => {
                    setSelected((s) => false);
                }}
            >
                <sphereGeometry args={[size * 0.6, 16, 16]} />
                <meshStandardMaterial
                    color={selected ? "purple" : "yellow"}
                    emissive={selected ? "purple" : "yellow"}
                    emissiveIntensity={selected ? 2 : 1.5}
                    roughness={0.3}
                    metalness={0.1}
                />
            </mesh>
            {/* Translucent red outer layer */}
            <mesh ref={meshRefOuter}>
                <sphereGeometry args={[size * 0.8, 16, 16]} />
                <meshStandardMaterial
                    color="red"
                    transparent={true}
                    opacity={0.25}
                    emissive="red"
                    emissiveIntensity={0.5}
                    roughness={0.7}
                    metalness={0.0}
                    depthWrite={false}
                />
            </mesh>
            {/* Smoke particles */}
            {enableSmoke && (
                <group ref={smokeGroupRef}>
                    {smokeParticles.map((_, i) => (
                        <mesh key={i}>
                            <sphereGeometry
                                args={[size * 0.1, 4, 4]}
                                rotateY={Math.random() * Math.PI * 2}
                            />
                            <meshStandardMaterial
                                color="#888"
                                transparent={true}
                                opacity={0.25}
                                roughness={1}
                                metalness={0}
                                depthWrite={false}
                            />
                        </mesh>
                    ))}
                </group>
            )}
        </group>
    );
};

export default Wildfire;
