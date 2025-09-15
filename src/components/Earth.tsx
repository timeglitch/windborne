import * as THREE from "three";
import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import earthTexture from "/earth_texture.jpg";

interface Props {
    size?: number;
    hour?: number;
}
const Earth: React.FC<Props> = ({ size = 1, hour = 0 }: Props) => {
    const meshRef = useRef<THREE.Mesh>(null);

    return (
        <mesh ref={meshRef} scale={size}>
            <sphereGeometry args={[size, 32, 32]} rotateY={(hour * 260) / 24} />
            <meshStandardMaterial
                map={new THREE.TextureLoader().load("/earth_texture.jpg")}
            />
        </mesh>
    );
};

export default Earth;
