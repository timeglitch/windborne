import * as THREE from "three";
import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";

interface Props {
    size?: number;
}
const Satellite: React.FC<Props> = ({ size = 1 }: Props) => {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((_, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 100 * delta;
        }
    });

    return (
        <mesh ref={meshRef} scale={size}>
            <boxGeometry args={[size, size, size]} />
            <meshStandardMaterial color="orange" />
        </mesh>
    );
};

export default Satellite;
