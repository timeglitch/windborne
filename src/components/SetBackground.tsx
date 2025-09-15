import { useEffect } from "react";
import { useThree } from "react-three-fiber";
import * as THREE from "three";

const SetBackground: React.FC = () => {
    const { scene } = useThree();
    useEffect(() => {
        const loader = new THREE.TextureLoader();
        loader.load("/starmap.png", (texture) => {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            scene.background = texture;
        });
    }, [scene]);
    return null;
};

export default SetBackground;
