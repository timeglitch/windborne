import { useState, useEffect } from "react";
import "./App.css";
import { Canvas } from "react-three-fiber";
import { OrbitControls } from "@react-three/drei";
//import Box from "./components/Box";
import Earth from "./components/Earth";

import SetBackground from "./components/SetBackground";
import Slider from "./components/Slider";
import SatelliteManager from "./components/SatelliteManager";

//TODO: change this to the actual backend server URL
const isDev = import.meta.env.MODE === "development";
const backendServerURL = isDev
    ? "http://localhost:4000"
    : "https://windborne-nu.vercel.app/api";

function App() {
    const [time, setTime] = useState(0);

    const [interpolatedSatellites, setInterpolatedSatellites] = useState<
        Array<Array<number>>
    >([]);

    const [satellites, setSatellites] = useState<Array<Array<Array<number>>>>(
        [...Array(24)].map(() => [])
    );

    // Fetch and cache satellite data for a given hour
    const getSatelliteData = async (n: number) => {
        if (n < 0 || n > 23) return;
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
        if (
            !Array.isArray(data) ||
            !data.every(
                (item: any) =>
                    Array.isArray(item) &&
                    item.every((v: any) => typeof v === "number")
            )
        ) {
            console.error(
                "Satellite data for hour " + n + " is not of type number[][]"
            );
            //return empty array of the right shape
            return [];
        }
        return data;
    };

    const interpolateSatelliteData = async (n: number) => {
        if (n < 0 || n > 23) return;
        const t0 = Math.floor(n);
        const t1 = Math.ceil(n);
        if (t0 === t1) {
            return getSatelliteData(t0);
        }
        const data0 = await getSatelliteData(t0);
        const data1 = await getSatelliteData(t1);
        if (!data0 && !data1) {
            return [];
        }
        if (!data0) return data1;
        if (!data1) return data0;

        // Simple linear interpolation based on altitude
        const interpolated = data0.map((sat, i) => {
            if (i >= data1.length) return sat;
            const alt0 = sat[2];
            const alt1 = data1[i][2];
            const alt = alt0 + (alt1 - alt0) * (n - t0);
            return [sat[0], sat[1], alt];
        });
        return interpolated;
    };

    useEffect(() => {
        // Get satellite data for the current time, then update state
        interpolateSatelliteData(time).then((result) => {
            if (result !== undefined) {
                setInterpolatedSatellites(result);
            }
        });
    }, [time]);

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
                    <span className="navbar-brand mb-0 h1">
                        Windborne Satellite Viewer
                    </span>
                </div>
            </header>
            <Canvas style={{ width: "100vw", height: "80vh" }}>
                <Earth size={1} hour={time} />
                <ambientLight />
                <pointLight position={[10, 10, 10]} />
                <SatelliteManager satellites={interpolatedSatellites} />
                <OrbitControls />
                <SetBackground />
            </Canvas>
            <Slider value={time} setValue={setTime} step={0.1}>
                Time:
            </Slider>
        </>
    );
}

export default App;
