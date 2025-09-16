This is made for https://gist.github.com/dkafayi/5334e8a3f1fc317d0f8b33141964df05

This shows the locations of Windborne's satellites and the locations of active wildfires reported in the last year from NASA's Earth Observatory Natural Event Tracker (EONET).

Locations of the satellites are interpolated from the hourly values reported at https://a.windbornesystems.com/treasure/[00-23].json.
For visibility, their altitudes are greatly exaggerated.

Locations of the fires are scaled to size.

This project is built with React and uses a serverless proxy to redirect requests to Windborne's data endpoints; all other processing is handled client-side.
The 3D visualization is implemented using Three.js via the React-three-fiber library.

Project is a little rough, but I'm pretty happy with how it looks for slapping it together quickly.

TODO:

-   Make fires instances or anything more efficient than just 1000 meshes
-   Make the UI a little better
-   Refactor a little for readability, App.tsx is getting a little crowded.
-   Make the lighting look good (adding sun and shade? could get good textures from NASAA)
-   Make the satellites look like balloons.

## Run this yourself

1. Install dependencies:
    ```
    npm install
    ```
2. Start the development server:
    ```
    npm run dev
    ```
3. Open [http://localhost:5173](http://localhost:5173) or whatever the terminal tells you to open in your browser.

Alternatively, just run `vercel dev`

## Data Sources

-   [NASA EONET](https://eonet.gsfc.nasa.gov/)
-   [Windborne Systems](https://windbornesystems.com/)
-   earth_texture.jpg from https://www.deviantart.com/fargetanik/art/Earth-Truecolor-Texture-Map-12k-819032851
-   starmap from https://svs.gsfc.nasa.gov/4851
