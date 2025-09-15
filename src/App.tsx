import { useState, type SetStateAction, type Dispatch } from "react";
import "./App.css";
import { Canvas } from "react-three-fiber";
import * as THREE from "three";
import { OrbitControls } from "@react-three/drei";
import Box from "./components/Box";
import Earth from "./components/Earth";

import SetBackground from "./components/SetBackground";
import Slider from "./components/Slider";
import SatelliteManager from "./components/SatelliteManager";

//TODO: change this to the actual backend server URL
const backendServerURL = "http://localhost:4000";

function App() {
    const [time, setTime] = useState(0);

    const [satellites, setSatellites] = useState<Array<Array<Array<number>>>>(
        [...Array(24)].map(() => [])
    );

    // Fetch and cache satellite data for a given hour
    const getSatelliteData = async (n: number) => {
        if (n < 0 || n >= 24) return;
        if (satellites[n] && satellites[n].length > 0) return satellites[n];
        const res = await fetch(
            `${backendServerURL}/treasure/${n.toString().padStart(2, "0")}.json`
        );
        const data = await res.json();
        setSatellites((prev) => {
            const updated = [...prev];
            updated[n] = data;
            return updated;
        });
        console.log("data fetched for hour " + n);
        console.log(data);
        return data;
    };

    return (
        <>
            <header
                className="navbar navbar-dark bg-dark mb-4"
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <div
                    className="container-fluid"
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                    }}
                >
                    <span className="navbar-brand mb-0 h1">Windborne</span>
                </div>
            </header>
            <Canvas style={{ width: "80vw", height: "80vh" }}>
                <Earth size={1} />
                <ambientLight />
                <pointLight position={[10, 10, 10]} />
                <SatelliteManager satellites={satellites[time]} />
                <OrbitControls />
                <SetBackground />
            </Canvas>
            <Slider value={time} setValue={setTime} onchange={getSatelliteData}>
                Time:
            </Slider>
        </>
    );
}

export default App;
