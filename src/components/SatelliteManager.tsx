import * as THREE from "three";
import React from "react";
import { Instances, Instance } from "@react-three/drei";
//import Satellite from "./Satellite"; //TODO: actually use this?

interface Props {
    satellites: number[][];
}

const colorsArray = [
    //TODO: colors broke somehow
    "#ff0000", // red
    "#ffa500", // orange
    "#ffff00", // yellow
    "#008000", // green
    "#0000ff", // blue
    "#4b0082", // indigo
    "#ee82ee", // violet
    "#00ffff", // cyan
    "#ff00ff", // magenta
    "#ffffff", // white
    "#808080", // gray
    // Add more colors as needed
];

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
            {/* Default material, overridden per instance */}
            <meshStandardMaterial color={"white"} emissive={"white"} />
            {satellites.map((sat, i) => {
                if (sat.length !== 3) {
                    console.warn(`Invalid satellite data at index ${i}:`, sat);
                    return null;
                }
                const [lat, lon, alt] = sat;
                const color = colorsArray[i % colorsArray.length];
                return (
                    <Instance
                        key={i}
                        position={latLongAltToVector3(lat, lon, alt, 1)}
                        color={color}
                    />
                );
            })}
        </Instances>
    );
};

export default SatelliteManager;
