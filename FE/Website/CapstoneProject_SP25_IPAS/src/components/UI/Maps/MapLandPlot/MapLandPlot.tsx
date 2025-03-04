import React, { useEffect, useRef, useState } from "react";
import style from "./MapLandPlot.module.scss";
import mapboxgl, { DataDrivenPropertyValueSpecification } from "mapbox-gl";
import { createRoot } from "react-dom/client";
import { Feature, Polygon } from "geojson";
import "mapbox-gl/dist/mapbox-gl.css";
import { MAP_BOX_KEY } from "@/constants";
import { GetLandPlot } from "@/payloads";
import PopupContent from "./PopupContent";
import MapMarker from "../MapMarker/MapMarker";

interface MapLandPlotProps {
  latitude: number;
  longitude: number;
  landPlots: GetLandPlot[];
  highlightedPlots?: string[];
  onViewRows?: (plotId: number) => void;
  onUpdatePlot?: (plot: GetLandPlot) => void;
  onDeletePlot?: (plotId: number) => void;
}

const MapLandPlot: React.FC<MapLandPlotProps> = ({
  latitude,
  longitude,
  landPlots,
  highlightedPlots = [],
  onViewRows = () => {},
  onUpdatePlot = () => {},
  onDeletePlot = () => {},
}) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
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
                ...landPlot,
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

        if (highlightedPlots && highlightedPlots.length > 0) {
          const fillColor: DataDrivenPropertyValueSpecification<string> = [
            "match",
            ["get", "id"],
            ...highlightedPlots.flatMap((id) => [id, "#ff9800"]),
            "#e8c048", // Màu mặc định
          ];
          map.setPaintProperty("polygon-fill", "fill-color", fillColor);
        }

        map.on("click", "polygon-fill", (e) => {
          const feature = e.features?.[0];

          if (feature) {
            const landPlot = feature.properties as GetLandPlot;
            const polygon = feature.geometry as Polygon;
            const coordinates = polygon.coordinates[0]; // Tọa độ của polygon
            // Tính trọng tâm của polygon (centroid)
            const centroid: [number, number] = [
              coordinates.reduce((sum, coord) => sum + coord[0], 0) / coordinates.length,
              coordinates.reduce((sum, coord) => sum + coord[1], 0) / coordinates.length,
            ];

            // // Xóa popup cũ nếu có
            if (popupRef.current) popupRef.current.remove();

            const closePopup = (removePopup: boolean = true) => {
              if (!mapRef.current) return;
              if (removePopup) popup.remove();
              if (map.getStyle() && map.getLayer("polygon-fill")) {
                const fillColor: DataDrivenPropertyValueSpecification<string> =
                  highlightedPlots.length > 0
                    ? [
                        "match",
                        ["get", "id"],
                        ...highlightedPlots.flatMap((id) => [id, "#ff9800"]), // Màu cam cho các thửa đất trong highlightedPlots
                        "#e8c048", // Màu mặc định
                      ]
                    : "#e8c048"; // Nếu không có thửa đất nào được highlight, dùng màu mặc định

                map.setPaintProperty("polygon-fill", "fill-color", fillColor);
              }
            };
            // Tạo popup mới
            const popupContainer = document.createElement("div");
            createRoot(popupContainer).render(
              <PopupContent
                plot={landPlot}
                onClose={closePopup}
                onViewRows={onViewRows}
                onUpdatePlot={onUpdatePlot}
                onDeletePlot={onDeletePlot}
              />,
            );

            const popup = new mapboxgl.Popup({ closeOnClick: true, maxWidth: "400px" })
              .setLngLat(centroid)
              .setDOMContent(popupContainer)
              .addTo(map);

            const fillColor: DataDrivenPropertyValueSpecification<string> =
              highlightedPlots.length > 0
                ? [
                    "case",
                    ["==", ["get", "id"], landPlot.landPlotId],
                    "#00AEEF", // Màu xanh nếu được chọn
                    [
                      "match",
                      ["get", "id"],
                      ...highlightedPlots.flatMap((id) => [id, "#ff9800"]),
                      "#e8c048", // Màu mặc định nếu không có trong highlightedPlots
                    ],
                  ]
                : [
                    "case",
                    ["==", ["get", "id"], landPlot.landPlotId],
                    "#00AEEF", // Màu xanh nếu được chọn
                    "#e8c048", // Màu mặc định nếu không được chọn
                  ];
            map.setPaintProperty("polygon-fill", "fill-color", fillColor);

            const closeButton = document.querySelector(
              ".mapboxgl-popup-close-button",
            ) as HTMLButtonElement;
            closeButton.style.display = "none";
            closeButton.blur();

            popup.on("close", () => closePopup(false));
          }
        });
      });
    }

    map.addControl(new mapboxgl.NavigationControl(), "bottom-right");

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
    mapRef.current = map;
    return () => map.remove();
  }, [latitude, longitude, highlightedPlots]);

  return <div ref={mapContainer} className={style.customMap}></div>;
};

export default MapLandPlot;
