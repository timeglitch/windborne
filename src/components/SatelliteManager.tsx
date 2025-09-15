import * as THREE from "three";
import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Instances, Instance } from "@react-three/drei";
import Satellite from "./Satellite";

interface Props {
    satellites: number[][];
}

const satColor = new THREE.Color("blue");

const altitudeScale = 0.03; // Scale down altitude for visualization
function latLongAltToVector3(
    lat: number,
    lon: number,
    alt: number,
    radius: number
): THREE.Vector3 {
    const phi = THREE.MathUtils.degToRad(90 - lat);
    const theta = THREE.MathUtils.degToRad(lon);

    const x = -(radius + alt * altitudeScale) * Math.sin(phi) * Math.cos(theta);
    const y = (radius + alt * altitudeScale) * Math.cos(phi) * Math.cos(theta);
    const z = (radius + alt * altitudeScale) * Math.sin(theta);

    return new THREE.Vector3(x, y, z);
}

const SatelliteManager: React.FC<Props> = ({ satellites }: Props) => {
    if (!satellites || satellites.length === 0) {
        return null;
    }
    return (
        <Instances>
            <sphereGeometry args={[0.01, 16, 16]} />
            <meshStandardMaterial
                color={satColor}
                emissive={satColor}
                emissiveIntensity={1}
            />
            {satellites.map((sat, i) => {
                if (sat.length !== 3) {
                    console.warn(`Invalid satellite data at index ${i}:`, sat);
                    return null;
                }
                const [lat, lon, alt] = sat;
                return (
                    <Instance
                        key={i}
                        position={latLongAltToVector3(lat, lon, alt, 1)}
                    />
                );
            })}
        </Instances>
    );
};

export default SatelliteManager;
