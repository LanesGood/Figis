import { h } from "preact";
import { useState, useEffect, useRef } from "preact/hooks";
import L, { Map, MapOptions, TileLayer } from "leaflet";
import leafletImage from "leaflet-image";
import "!leaflet/dist/leaflet.css";
import { Dispatch, SetStateAction } from "preact/compat";

const MapComponent = ({ setMapImage }: Dispatch<SetStateAction<string>>) => {
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

  useEffect(() => {
    mapRef.current = L.map("map", mapParams as unknown as MapOptions);
    setMapInstance(mapRef.current);
  }, []);

  useEffect(() => {
    if (!mapInstance) return;
    if (mapInstance) {
      mapInstance.whenReady(() => {
        leafletImage(mapInstance, (_err: any, canvas: HTMLCanvasElement) =>
          setMapImage(canvas.toDataURL())
        );
      });
      mapInstance.on("moveend", () => {
        leafletImage(mapInstance, (_err: any, canvas: HTMLCanvasElement) =>
          setMapImage(canvas.toDataURL())
        );
      });
    }
  }, [mapInstance]);
  return <div id="map" style={mapStyles} />;
};

export default MapComponent;
