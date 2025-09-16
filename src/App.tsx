import { useState, useEffect } from "react";
import "./App.css";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Box from "./components/Box";
import Wildfire from "./components/Wildfire";
import Earth from "./components/Earth";

import SetBackground from "./components/SetBackground";
import Slider from "./components/Slider";
import SatelliteManager from "./components/SatelliteManager";
import { lerp } from "three/src/math/MathUtils.js";
import * as THREE from "three";

const backendServerURL = "https://windborne-nu.vercel.app/api";
const EARTH_RADIUS = 1;

function App() {
    const [time, setTime] = useState(0);

    const [showNullIsland, setShowNullIsland] = useState(false);

    const [interpolatedSatellites, setInterpolatedSatellites] = useState<
        Array<Array<number>>
    >([]);

    const [satellites, setSatellites] = useState<Array<Array<Array<number>>>>(
        [...Array(24)].map(() => [])
    );

    //Fill the satellites array by getting data for each hour
    useEffect(() => {
        for (let i = 0; i < 24; i++) {
            //First set the entry to an empty array to avoid multiple fetches
            setSatellites((prev) => {
                const updated = [...prev];
                updated[i] = [];
                return updated;
            });
            //Fetch data for hour i
            fetch(
                `${backendServerURL}/treasure?id=${i
                    .toString()
                    .padStart(2, "0")}`
            )
                .then((res) => res.json())
                .then((data) => {
                    setSatellites((prev) => {
                        const updated = [...prev];
                        updated[i] = data;
                        return updated;
                    });
                    console.log("data fetched for hour " + i);
                })
                .catch((err) => {
                    console.error("Error fetching data for hour " + i, err);
                });
        }
    }, []);

    const [wildfires, setWildfires] = useState<Array<any>>([]);

    /**
     * example entry:
     * {
        "id": "EONET_15437",
        "title": "SMR Unit 21-138 Rx 0910 Prescribed Fire, Jefferson, Florida",
        "description": null,
        "link": "https://eonet.gsfc.nasa.gov/api/v3/events/EONET_15437",
        "closed": null,
        "categories": [
            {
            "id": "wildfires",
            "title": "Wildfires"
            }
        ],
        "sources": [
            {
            "id": "IRWIN",
            "url": "https://irwin.doi.gov/observer/incidents/fba8a097-04ec-4dcc-bbf2-aa8fd604c16a"
            }
        ],
        "geometry": [
            {
            "magnitudeValue": 9793,
            "magnitudeUnit": "acres",
            "date": "2025-09-10T10:06:00Z",
            "type": "Point",
            "coordinates": [
                -84.046317,
                30.1314
            ]
            }
        ]
        }
     */

    const wildfireAPIURL =
        "https://eonet.gsfc.nasa.gov/api/v3/events?category=wildfires&magID=ac&magMin=5000&limit=5"; // Fetch ongoing wildfires with at least 5000 acres
    useEffect(() => {
        // Fetch wildfire data once on mount
        const fetchWildfires = async () => {
            const res = await fetch(wildfireAPIURL);
            const data = await res.json();
            console.log("Wildfire data fetched:", data);

            // Process the wildfire data into a flat array of useful objects
            const scalingFactor = 0.00001; // Adjust this value to scale the size of the wildfires
            const geomToSize = (geom: any) => {
                const unit = geom.magnitudeUnit;
                const value = geom.magnitudeValue;
                if (unit === "acres") {
                    return value * scalingFactor;
                } else {
                    console.warn("Unknown magnitude unit:", unit);
                    console.warn("for geom:", geom);
                }
                return 0;
            };
            // EONET v3 returns { events: [...] }
            const events = data.events || [];
            const processed = events.flatMap((event: any) => {
                return event.geometry.map((geom: any) => ({
                    id: event.id,
                    title: event.title,
                    date: geom.date,
                    latitude: geom.coordinates[1],
                    longitude: geom.coordinates[0],
                    altitude: 0, // EONET wildfires are surface events
                    size: geomToSize(geom),
                }));
            });
            setWildfires(processed);
        };
        fetchWildfires();
    }, []);

    useEffect(() => {
        console.log("Wildfires updated:", wildfires);
    }, [wildfires]);

    // Fetch and cache satellite data for a given hour
    const getSatelliteData = async (n: number) => {
        if (n < 0 || n > 23) return;
        return satellites[n]; // Return cached data if available

        /**
        //FIXED: will make a lot of requests before the data is cached, need to debounce or something -- we pre-fetch all data now --
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
        return data;*/
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
                <Earth size={EARTH_RADIUS} hour={time} />
                <ambientLight />
                <pointLight position={[10, 10, 10]} />
                <SatelliteManager satellites={interpolatedSatellites} />
                {showNullIsland && (
                    <Box
                        size={0.3}
                        position={latLongAltToVector3(0, 0, 0, 1)}
                    />
                )}
                {wildfires.map((fire, index) => (
                    <Wildfire
                        key={index}
                        size={0.3}
                        latitude={fire.latitude}
                        longitude={fire.longitude}
                        altitude={fire.altitude}
                        title={fire.title}
                    />
                ))}
                <OrbitControls />
                <SetBackground />
            </Canvas>
            <Slider value={time} setValue={setTime} step={0.05} max={23}>
                Time:
            </Slider>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    marginTop: "1rem",
                }}
            >
                <input
                    type="checkbox"
                    id="showNullIsland"
                    checked={showNullIsland}
                    onChange={(e) => setShowNullIsland(e.target.checked)}
                    style={{ marginRight: "0.5rem" }}
                />
                <label htmlFor="showNullIsland">
                    Show{" "}
                    <a
                        href="https://en.wikipedia.org/wiki/Null_Island"
                        target="_blank"
                    >
                        Null Island
                    </a>{" "}
                    (for orienting coordinates)
                </label>
            </div>
        </>
    );
}

export default App;

const altitudeScale = 0.03; // Scale down altitude for visualization

function latLongAltToVector3(
    lat: number,
    lon: number,
    alt: number,
    radius: number
): THREE.Vector3 {
    const phi = THREE.MathUtils.degToRad(90 - lat);
    const theta = THREE.MathUtils.degToRad(-lon);

    const r = radius + alt * altitudeScale;
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.cos(phi);
    const z = r * Math.sin(phi) * Math.sin(theta);

    return new THREE.Vector3(x, y, z);
}

export { latLongAltToVector3 };
export { EARTH_RADIUS };
