import * as THREE from "three";
import React, { useRef } from "react";

//TODO: orient it correctly

interface Props {
    size?: number;
    hour?: number;
}
const earth_texture = new THREE.TextureLoader().load("/earth_texture.jpg");

const Earth: React.FC<Props> = ({ size = 1 }: Props) => {
    const meshRef = useRef<THREE.Mesh>(null);

    const rotationVal = 0; //This orients the texture correctly

    return (
        <mesh ref={meshRef} scale={size} rotation={[0, rotationVal, 0]}>
            <sphereGeometry args={[size, 32, 32]} />
            <meshStandardMaterial map={earth_texture} />
        </mesh>
    );
};

export default Earth;
