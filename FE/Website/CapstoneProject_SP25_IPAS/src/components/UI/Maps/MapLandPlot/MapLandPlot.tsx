import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import style from "./MapLandPlot.module.scss";
import mapboxgl, { DataDrivenPropertyValueSpecification } from "mapbox-gl";
import MapboxDraw, {
  DrawCreateEvent,
  DrawDeleteEvent,
  DrawUpdateEvent,
} from "@mapbox/mapbox-gl-draw";
import * as turf from "@turf/turf";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import { createRoot } from "react-dom/client";
import { Feature, Polygon } from "geojson";
import { MAP_BOX_KEY } from "@/constants";
import { GetLandPlot } from "@/payloads";
import PopupContent from "./PopupContent";
import MapMarker from "../MapMarker/MapMarker";
import { PolygonInit } from "@/types";

interface MapLandPlotProps {
  latitude: number;
  longitude: number;
  landPlots: GetLandPlot[];
  highlightedPlots?: string[];
  isShowInfo?: boolean;
}

export interface MapLandPlotRef {
  startDrawingPolygon: () => void;
}

const MapLandPlot = forwardRef<MapLandPlotRef, MapLandPlotProps>(
  ({ latitude, longitude, landPlots, highlightedPlots = [], isShowInfo = true }, ref) => {
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const drawRef = useRef<MapboxDraw | null>(null);
    const markerRef = useRef<mapboxgl.Marker | null>(null); // Lưu trữ marker
    const popupRef = useRef<mapboxgl.Popup | null>(null);
    const [roundedArea, setRoundedArea] = useState<number | undefined>();
    const [polygons, setPolygons] = useState<PolygonInit[]>([]);

    const DEFAULT_COORDINATES: [number, number] = [106.6825, 10.7626]; // TP. HCM
    const center: [number, number] =
      longitude && latitude ? ([longitude, latitude] as [number, number]) : DEFAULT_COORDINATES;

    useImperativeHandle(ref, () => ({
      startDrawingPolygon: () => {
        if (drawRef.current) {
          drawRef.current.changeMode("draw_polygon");
        }
      },
    }));

    const calculateDimensions = (polygon: Feature<Polygon>): { area: number } => {
      // Tính diện tích
      const area = turf.area(polygon); // Diện tích tính bằng mét vuông
      return { area };
    };

    const handlePolygonEvents = (
      draw: MapboxDraw,
      e: DrawCreateEvent | DrawDeleteEvent | DrawUpdateEvent,
    ) => {
      const data = draw.getAll();
      if (data.features.length > 0) {
        const area = data.features
          // .filter((feature) => feature.geometry.type === "Polygon")
          .reduce((acc, feature) => acc + turf.area(feature), 0);
        setRoundedArea(Math.round(area * 100) / 100);

        // Cập nhật lại state polygons tùy thuộc vào loại sự kiện
        switch (e.type) {
          case "draw.create":
            const newPolygons = e.features.map((feature) => {
              const id = feature.id as string; // Lấy id từ feature
              if (!feature.properties) feature.properties = {}; // Khởi tạo properties nếu chưa có
              feature.properties.id = id; // Lưu id vào properties
              draw.add(feature);
              return {
                id: id,
                coordinates: (feature.geometry as Polygon).coordinates,
              };
            });

            e.features.forEach((feature) => {
              if (feature.geometry.type === "Polygon") {
                const dimensions = calculateDimensions(feature as Feature<Polygon>);
                // console.log(dimensions);
              }
            });
            // console.log(draw.getAll());

            setPolygons((prevPolygons) => [...prevPolygons, ...newPolygons]);
            break;

          case "draw.delete":
            console.log(e.features);

            const deletedIds = e.features.map((feature) => feature.properties?.id as string);
            setPolygons((prevPolygons) =>
              prevPolygons.filter((polygon) => !deletedIds.includes(polygon.id)),
            );
            break;

          case "draw.update":
            const updatedPolygons = e.features.map((feature) => {
              const id = feature.properties?.id as string; // Lấy id từ properties
              return {
                id: id,
                coordinates: (feature.geometry as Polygon).coordinates,
              };
            });
            console.log(updatedPolygons);

            setPolygons((prevPolygons) => {
              // Cập nhật các polygon đã chỉnh sửa
              const updatedPolygonIds = updatedPolygons.map((p) => p.id);
              const unchangedPolygons = prevPolygons.filter(
                (polygon) => !updatedPolygonIds.includes(polygon.id),
              );

              return [...unchangedPolygons, ...updatedPolygons];
            });
            break;

          default:
            break;
        }
      } else {
        setRoundedArea(undefined);
        if (e.type !== "draw.delete") alert("Click the map to draw a polygon.");
      }
    };

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
                    landPlot.landPlotCoordinations.map((coord) => [
                      coord.longitude,
                      coord.latitude,
                    ]),
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

          if (isShowInfo) {
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
                  if (removePopup) popup.remove();

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
                };

                // Tạo popup mới
                const popupContainer = document.createElement("div");
                createRoot(popupContainer).render(
                  <PopupContent plot={landPlot} onClose={closePopup} />,
                );

                const popup = new mapboxgl.Popup({ closeOnClick: true })
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
          }
        });
      }

      const draw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: true,
          trash: true,
          point: true,
          combine_features: true,
          uncombine_features: true,
        },
        defaultMode: "simple_select",
      });

      map.addControl(draw);
      map.on("draw.create", (e) => handlePolygonEvents(draw, e));
      // map.on("draw.delete", (e) => handlePolygonEvents(draw, e));
      // map.on("draw.update", (e) => handlePolygonEvents(draw, e));

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

      drawRef.current = draw;
      mapRef.current = map;
      return () => map.remove();
    }, [latitude, longitude, highlightedPlots]);

    return <div ref={mapContainer} className={style.customMap}></div>;
  },
);

export default MapLandPlot;
