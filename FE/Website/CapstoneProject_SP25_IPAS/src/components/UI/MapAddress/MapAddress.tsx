import React, { useEffect, useRef } from "react";
import style from "./MapAddress.module.scss";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { createRoot } from "react-dom/client";
import { Icons } from "@/assets";

interface MapAddressProps {
  latitude: number;
  longitude: number;
}

const MapAddress: React.FC<MapAddressProps> = ({ latitude, longitude }) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken =
      "pk.eyJ1IjoicXVhbmdkdW5nIiwiYSI6ImNtNTB1ajVlaTBtcm8ycXB3Z2JkMXh2bHYifQ.4aMt-liLPV9nYB1YvUFuOA";
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/satellite-streets-v11",
      center: [longitude, latitude],
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

    new mapboxgl.Marker(markerElement).setLngLat([longitude, latitude]).addTo(map);

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
