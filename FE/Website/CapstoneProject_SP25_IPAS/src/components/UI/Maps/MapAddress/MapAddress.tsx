import React, { useEffect, useRef } from "react";
import style from "./MapAddress.module.scss";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { createRoot } from "react-dom/client";
import { Icons } from "@/assets";
import { MAP_BOX_KEY } from "@/constants";
import { CoordsState } from "@/types";
import MapMarker from "../MapMarker/MapMarker";

interface MapAddressProps {
  latitude: number;
  longitude: number;
  isEditing?: boolean;
  setMarkerPosition: React.Dispatch<React.SetStateAction<CoordsState>>;
}

const MapAddress: React.FC<MapAddressProps> = ({
  latitude,
  longitude,
  isEditing = false,
  setMarkerPosition,
}) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null); // Lưu trữ marker

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
      scrollZoom: false,
    });

    map.addControl(new mapboxgl.NavigationControl(), "bottom-right");

    if (isEditing) {
      map.on("click", (e) => {
        const { lng, lat } = e.lngLat;
        const newCoords = { longitude: lng, latitude: lat };
        setMarkerPosition(newCoords); // Cập nhật state
        markerRef.current?.setLngLat([lng, lat]); // Cập nhật vị trí marker
      });
    }

    // Thay đổi con trỏ
    map.getCanvas().style.cursor = "pointer";
    map.on("mousedown", () => (map.getCanvas().style.cursor = "grabbing"));
    map.on("mouseup", () => (map.getCanvas().style.cursor = "pointer"));

    const markerElement = document.createElement("div");
    markerElement.className = "custom-marker";

    const root = createRoot(markerElement);
    root.render(<MapMarker />);

    markerRef.current = new mapboxgl.Marker(markerElement)
      .setLngLat([longitude, latitude])
      .addTo(map);

    map.on("load", () => {
      const attributionControl = document.querySelector(".mapboxgl-ctrl-attrib-inner");
      const attributionButton = document.querySelector(".mapboxgl-ctrl-attrib-button");

      if (attributionControl) attributionControl.remove();
      if (attributionButton) attributionButton.remove();
    });
    return () => map.remove();
  }, [latitude, longitude, isEditing]);

  return <div ref={mapContainer} className={style.customMap} />;
};

export default MapAddress;
