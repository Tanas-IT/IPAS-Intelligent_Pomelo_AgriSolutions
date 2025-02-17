import React, { useEffect, useRef, useState } from "react";
import style from "./MapLandPlot.module.scss";
import mapboxgl from "mapbox-gl";
import MapboxDraw, {
  DrawCreateEvent,
  DrawDeleteEvent,
  DrawUpdateEvent,
} from "@mapbox/mapbox-gl-draw";
import { createRoot } from "react-dom/client";
import { Feature, Polygon } from "geojson";
import "mapbox-gl/dist/mapbox-gl.css";
import { Icons } from "@/assets";
import { MAP_BOX_KEY } from "@/constants";
import { PolygonInit } from "@/types";
import { Popover } from "antd";
import PolygonPopup from "./PolygonPopup";
import { GetLandPlot } from "@/payloads";

interface MapLandPlotProps {
  latitude: number;
  longitude: number;
  isEditing?: boolean;
  landPlots: GetLandPlot[];

  //   setMarkerPosition: React.Dispatch<React.SetStateAction<CoordsState>>;
}

const MapLandPlot: React.FC<MapLandPlotProps> = ({
  latitude,
  longitude,
  isEditing = false,
  landPlots,
  //   setMarkerPosition,
}) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null); // Lưu trữ marker
  const popupRef = useRef<mapboxgl.Popup | null>(null);

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

    if (landPlots.length > 0) {
      map.on("load", () => {
        map.addSource("polygon-layer", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: landPlots.map((landPlot) => ({
              type: "Feature",
              geometry: {
                type: "Polygon",
                coordinates: [
                  landPlot.landPlotCoordinations.map((coord) => [coord.longitude, coord.latitude]),
                ],
              },
              properties: {
                id: landPlot.landPlotId,
                landPlotId: landPlot.landPlotId,
                landPlot: landPlot,
              },
            })) as Feature<Polygon>[],
          },
        });

        map.addLayer({
          id: "polygon-fill",
          type: "fill",
          source: "polygon-layer",
          layout: {},
          paint: {
            "fill-color": "#e8c048",
            "fill-opacity": 0.5,
          },
        });
        map.on("click", "polygon-fill", (e) => {
          const feature = e.features?.[0];

          if (feature) {
            const polygon = feature.geometry as Polygon;
            const coordinates = polygon.coordinates[0]; // Tọa độ của polygon
            // Tính trọng tâm của polygon (centroid)
            const centroid: [number, number] = [
              coordinates.reduce((sum, coord) => sum + coord[0], 0) / coordinates.length,
              coordinates.reduce((sum, coord) => sum + coord[1], 0) / coordinates.length,
            ];
            // const landPlotId = feature.properties?.landPlotId;
            // const landPlot = landPlots.find((lp) => lp.landPlotId === landPlotId);

            // // Xóa popup cũ nếu có
            if (popupRef.current) {
              popupRef.current.remove();
            }

            // Tạo popup mới
            popupRef.current = new mapboxgl.Popup({ closeOnClick: true })
              .setLngLat(centroid)
              .setHTML(
                `<div class="popup-container">
      <h3>Chi tiết Lô đất</h3>
      <div class="popup-content">
        ${JSON.stringify(feature.properties?.landPlot, null, 2)}
      </div>
    </div>`,
              )
              .addTo(map);
          }
        });
      });
    }

    map.addControl(new mapboxgl.NavigationControl(), "bottom-right");

    if (isEditing) {
      map.on("click", (e) => {
        const { lng, lat } = e.lngLat;
        const newCoords = { longitude: lng, latitude: lat };
        // setMarkerPosition(newCoords); // Cập nhật state
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
    root.render(
      <div className={style.markerWithLabel}>
        <div className={style.markerLabelWrapper}>
          <label className={style.markerLabel}>Your Farm Address Here</label>
        </div>
        <Icons.marker className={style.customIcon} />
      </div>,
    );

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

  return <div ref={mapContainer} className={style.customMap}></div>;
};

export default MapLandPlot;
