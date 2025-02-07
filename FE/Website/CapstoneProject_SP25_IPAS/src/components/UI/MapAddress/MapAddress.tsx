import React, { useEffect, useRef } from "react";
import style from "./MapAddress.module.scss";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { createRoot } from "react-dom/client";
import { Icons } from "@/assets";
import { MAP_BOX_KEY } from "@/constants";

interface MapAddressProps {
  latitude: number;
  longitude: number;
}

const MapAddress: React.FC<MapAddressProps> = ({ latitude, longitude }) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);

  const DEFAULT_COORDINATES: [number, number] = [106.6825, 10.7626]; // TP. HCM
  const center: [number, number] =
    longitude && latitude ? ([longitude, latitude] as [number, number]) : DEFAULT_COORDINATES;

  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = MAP_BOX_KEY.ACCESS_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/satellite-streets-v11",
      center: center,
      zoom: 17,
    });

    const markerElement = document.createElement("div");
    markerElement.className = "custom-marker";

    const root = createRoot(markerElement);
    root.render(
      <div className={style.markerWithLabel}>
        <Icons.farms className={style.customIcon} />
        <div className={style.markerLabel}>Farm Address Here</div>
      </div>,
    );

    new mapboxgl.Marker().setLngLat([longitude, latitude]).addTo(map);

    map.on("load", () => {
      const attributionControl = document.querySelector(".mapboxgl-ctrl-attrib-inner");
      const attributionButton = document.querySelector(".mapboxgl-ctrl-attrib-button");

      if (attributionControl) attributionControl.remove();
      if (attributionButton) attributionButton.remove();
    });
    return () => {
      map.remove();
    };
  }, [latitude, longitude]);

  return <div ref={mapContainer} style={{ height: "400px", width: "100%" }} />;
};

export default MapAddress;
