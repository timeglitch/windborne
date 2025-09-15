import * as THREE from "three";
import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";

interface Props {
    size?: number;
}
const Box: React.FC<Props> = ({ size = 3 }: Props) => {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.x += 1 * delta;
            meshRef.current.rotation.y += 1 * delta;
        }
    });

    return (
        <mesh ref={meshRef} scale={size}>
            <boxGeometry args={[size, size, size]} />
            <meshStandardMaterial color="orange" />
        </mesh>
    );
};

export default Box;
