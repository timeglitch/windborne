import { useState, useEffect } from "react";
import "./App.css";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Box from "./components/Box";
import Earth from "./components/Earth";

import SetBackground from "./components/SetBackground";
import Slider from "./components/Slider";
import SatelliteManager, {latLongAltToVector3} from "./components/SatelliteManager";
import { lerp } from "three/src/math/MathUtils.js";

const backendServerURL = "https://windborne-nu.vercel.app/api";

function App() {
    const [time, setTime] = useState(0);

    const [showNullIsland, setShowNullIsland] = useState(false);

    const [interpolatedSatellites, setInterpolatedSatellites] = useState<
        Array<Array<number>>
    >([]);

    const [satellites, setSatellites] = useState<Array<Array<Array<number>>>>(
        [...Array(24)].map(() => [])
    );

    const [wildfires, setWildfires] = useState<Array<Array<number>>>([]);

    const wildfireAPIURL ="https://eonet.gsfc.nasa.gov/api/v3/categories/wildfires?days=14";
    useEffect(() => {
        // Fetch wildfire data once on mount
        const fetchWildfires = async () => {
            const res = await fetch(wildfireAPIURL);
            const data = await res.json();
            console.log("Wildfire data fetched:", data);
            setWildfires(data);
        };
        fetchWildfires();
    }, []);

    // Fetch and cache satellite data for a given hour
    const getSatelliteData = async (n: number) => {
        if (n < 0 || n > 23) return;
        if (satellites[n] && satellites[n].length > 0) return satellites[n]; // Return cached data if available

        //TODO: will make a lot of requests before the data is cached, need to debounce or something
        const res = await fetch(
            `${backendServerURL}/treasure?id=${n.toString().padStart(2, "0")}`
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
                "Satellite data for hour " + n + " is not of type number[][]",
                data
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

        const delta = n - t0;

        // Simple linear interpolation based on altitude
        const interpolated = data0.map((sat, i) => {
            if (i >= data1.length) return sat;

            const lat = lerp(sat[0], data1[i][0], delta);
            const lon = lerp(sat[1], data1[i][1], delta);
            const alt = lerp(sat[2], data1[i][2], delta);
            return [lat, lon, alt];
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
                {showNullIsland && <Box size={0.3} position={latLongAltToVector3(0, 0, 0, 1)} />}
                <OrbitControls />
                <SetBackground />
            </Canvas>
            <Slider value={time} setValue={setTime} step={0.05}>
                Time:
            </Slider>
            <div style={{ display: "flex", alignItems: "center", marginTop: "1rem" }}>
                <input
                    type="checkbox"
                    id="showNullIsland"
                    checked={showNullIsland}
                    onChange={(e) => setShowNullIsland(e.target.checked)}
                    style={{ marginRight: "0.5rem" }}
                />
                <label htmlFor="showNullIsland">Show <a href="https://en.wikipedia.org/wiki/Null_Island" target="_blank">Null Island</a> (for orienting coordinates)</label>
            </div>
        </>
    );
}

export default App;
