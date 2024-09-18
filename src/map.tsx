import { h } from "preact";
import { useState, useEffect, useRef } from "preact/hooks";
import L, { Map, MapOptions, TileLayer } from "leaflet";
import leafletImage from "leaflet-image";
import geojsonValidation from "geojson-validation";
import "!leaflet/dist/leaflet.css";
import { Dispatch, SetStateAction } from "preact/compat";

type Props = {
  setMapImage: Dispatch<SetStateAction<string>>;
  uploads: Array<File>
}
const MapComponent = ({ setMapImage, uploads }: Props) => {
  // Following https://stackoverflow.com/questions/69697017/use-leaflet-map-object-outside-useeffect-in-react
  // Map state:
  const [mapInstance, setMapInstance] = useState<Map>();

  // Map refs:
  const mapRef = useRef<Map>(null);
  const tileRef = useRef<TileLayer>(null);

  // Base tile for the map:
  tileRef.current = L.tileLayer(
    `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`,
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }
  );
  const layersControl = L.control.layers({}, {});

  const mapStyles = {
    overflow: "hidden",
    width: "100%",
    height: "90vh",
  };

  // Options for our map instance:
  const mapParams = {
    center: [37.0902, -95.7129], // USA
    zoom: 3,
    zoomControl: true,
    zoomSnap: 0.75,
    layers: [tileRef.current], // Start with just the base layer
  };

  // Set up initial map
  useEffect(() => {
    mapRef.current = L.map("map", mapParams as unknown as MapOptions);
    setMapInstance(mapRef.current);
  }, []);

  // Set canvasDataURL as state variable to pass up to parent
  useEffect(() => {
    if (!mapInstance) return;
    if (mapInstance) {
      // Sets canvasDataURL on first load
      mapInstance.whenReady(() => {
        leafletImage(mapInstance, (_err: any, canvas: HTMLCanvasElement) =>
          setMapImage(canvas.toDataURL())
      );
      });
      // Sets canvasDataURL each time map zooms or moves
      mapInstance.on("moveend", () => {
        leafletImage(mapInstance, (_err: any, canvas: HTMLCanvasElement) =>
          setMapImage(canvas.toDataURL())
        );
      });
    }
  }, [mapInstance]);

  // Adds uploaded data files to map as geojson
  useEffect(() => {
    try {
      uploads.map(async (file) => {
        const filename = file.name;
        // File type checking - likely redundant of allowed files
        if (!filename.endsWith(".json") && !filename.endsWith(".geojson")) {
          alert(`Invalid file extension, please upload a valid file.`);
          return;
        }
        // Parse JSON
        const geojson = JSON.parse(await file.text());

        // Validate with geojson-validation module
        if (!geojsonValidation.valid(geojson)) {
          alert(`GeJSON is not valid, please upload a valid file.`);
          return;
        }
        
        // Add geojson to map as geoJson layer
        const layer = L.geoJson(geojson, {
          pointToLayer(_geojsonPoint, latlng) {
            return L.circleMarker(latlng, { radius: 3 });
          },
        });
        (layer as any).name = filename;
        layer.addTo(mapInstance as Map);
        layersControl.addOverlay(layer, filename);
        layersControl.addTo(mapInstance as Map);
      });
    } catch (error) {
      alert(
        "An unexpected error occurred, please upload a valid GeoJSON file or try again later."
      );
    }
  }, [uploads, mapInstance])

  return <div id="map" style={mapStyles} />;
};

export default MapComponent;
