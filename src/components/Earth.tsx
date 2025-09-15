import * as THREE from "three";
import React, { useRef } from "react";
import { useFrame } from "react-three-fiber";

//TODO: orient it correctly

interface Props {
    size?: number;
    hour?: number;
}
const earth_texture = new THREE.TextureLoader().load("/earth_texture.jpg");

const Earth: React.FC<Props> = ({ size = 1, hour = 0 }: Props) => {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame(() => {
        if (meshRef.current) {
            meshRef.current.rotation.y = (hour % 24) * (Math.PI / 12); // Rotate based on hour
        }
    });

    return (
        <mesh ref={meshRef} scale={size}>
            <sphereGeometry args={[size, 32, 32]} />
            <meshStandardMaterial map={earth_texture} />
        </mesh>
    );
};

export default Earth;
