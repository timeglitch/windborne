import * as THREE from "three";
import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";

interface Props {
    size?: number;
    position?: THREE.Vector3;
}
const Box: React.FC<Props> = ({ size = 3, position }: Props) => {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((_, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.x += 1 * delta;
            meshRef.current.rotation.y += 1 * delta;
        }
    });

    return (
        <mesh ref={meshRef} scale={size} position={position}>
            <boxGeometry args={[size, size, size]} />
            <meshStandardMaterial color="orange" />
        </mesh>
    );
};

export default Box;
