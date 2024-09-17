import { Fragment, h } from "preact";
import { useState, useEffect, useRef } from "preact/hooks";
import L, { LayerGroup, Map, MapOptions, Marker, TileLayer } from "leaflet";
import leafletImage from "leaflet-image";
import "!leaflet/dist/leaflet.css";

const MapComponent = () => {
  // Map state:
  const [mapInstance, setMapInstance] = useState<Map>();
  const [marker, setMarker] = useState<Marker>();

  // Map refs:
  const mapRef = useRef<Map>(null);
  const tileRef = useRef<TileLayer>(null);
  const markerRef = useRef<Marker>(null);

  // Base tile for the map:
  tileRef.current = L.tileLayer(
    `https://tile.openstreetmap.org/{z}/{x}/{y}.png`,
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }
  );

  const mapStyles = {
    overflow: "hidden",
    width: "100%",
    height: "100vh",
  };

  // Options for our map instance:
  const mapParams = {
    center: [37.0902, -95.7129], // USA
    zoom: 3,
    zoomControl: true,
    zoomSnap: 0.75,
    layers: [tileRef.current], // Start with just the base layer
  };

  // Map creation:
  useEffect(() => {
    mapRef.current = L.map("map", mapParams as unknown as MapOptions);
    // Add an event listener:
    mapRef.current.on("click", () => {
      alert("map clicked");
    });
    // Set map instance to state:
    setMapInstance(mapRef.current);
  }, []); // <- Empty dependency array, so it only runs once on the first render.

  // If you want to use the mapInstance in a useEffect hook,
  // you first have to make sure the map exists. Then, you can add your logic.
  useEffect(() => {
    // Check for the map instance before adding something (ie: another event listener).
    // If no map, return:
    if (!mapInstance) return;
    if (mapInstance) {
      mapInstance.on("zoomstart", () => {
        console.log("Zooming!!!");
      });
    }
  }, [mapInstance]);

  // Render leaflet map as image, then pass image to main code file
  if (mapInstance) {
    leafletImage(mapInstance, function (_err: any, canvas: HTMLCanvasElement) {
      // now you have canvas
      // example thing to do with that canvas:
      try {
        const img = document.createElement("img");
        const dimensions = mapInstance.getSize();
        img.width = dimensions.x;
        img.height = dimensions.y;
        img.src = canvas.toDataURL();
        parent.postMessage({ pluginMessage: img.src }, "*");
      } catch (err) {
        console.log(err);
      }
    });
  }
  return <div id="map" style={mapStyles} />;
};

export default MapComponent;
