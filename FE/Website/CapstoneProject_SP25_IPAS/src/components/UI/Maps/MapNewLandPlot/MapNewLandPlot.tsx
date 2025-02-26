import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import style from "./MapNewLandPlot.module.scss";
import mapboxgl from "mapbox-gl";
import MapboxDraw, {
  DrawCreateEvent,
  DrawDeleteEvent,
  DrawUpdateEvent,
} from "@mapbox/mapbox-gl-draw";
import * as turf from "@turf/turf";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import { createRoot } from "react-dom/client";
import { Feature, GeoJsonProperties, Polygon } from "geojson";
import { MAP_BOX_KEY } from "@/constants";
import { GetLandPlot } from "@/payloads";
import MapMarker from "../MapMarker/MapMarker";
import { PolygonInit } from "@/types";
import { useMapStore } from "@/stores";
import { toast } from "react-toastify";

interface MapLandPlotProps {
  latitude: number;
  longitude: number;
  landPlots: GetLandPlot[];
  addNewPolygon: (polygon: PolygonInit) => void;
}

interface MapLandPlotRef {
  startDrawingPolygon: () => void;
  clearAllPolygons: () => void;
}

const MapNewLandPlot = forwardRef<MapLandPlotRef, MapLandPlotProps>(
  ({ latitude, longitude, landPlots, addNewPolygon }, ref) => {
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const markerRef = useRef<mapboxgl.Marker | null>(null); // Lưu trữ marker
    const {
      setMapRef,
      setDrawRef,
      clearPolygons,
      startDrawingPolygon,
      newPolygon,
      setPolygonDimensions,
    } = useMapStore();

    const DEFAULT_COORDINATES: [number, number] = [106.6825, 10.7626]; // TP. HCM
    const center: [number, number] =
      longitude && latitude ? ([longitude, latitude] as [number, number]) : DEFAULT_COORDINATES;

    useImperativeHandle(ref, () => ({
      startDrawingPolygon,
      clearAllPolygons: clearPolygons,
    }));

    const calculateDimensions = (
      polygon: Feature<Polygon>,
    ): { area: number; width: number; length: number } => {
      // Tính diện tích
      const area = turf.area(polygon); // Diện tích tính bằng mét vuông
      const bbox = turf.bbox(polygon);

      // Tính khoảng cách giữa các cạnh
      const length = turf.distance([bbox[0], bbox[1]], [bbox[2], bbox[1]], { units: "meters" });
      const width = turf.distance([bbox[0], bbox[1]], [bbox[0], bbox[3]], { units: "meters" });

      return {
        area: Math.round(area * 100) / 100, // Diện tích m²
        length: Math.round(length * 100) / 100, // Chiều dài m
        width: Math.round(width * 100) / 100, // Chiều rộng m
      };
    };

    const checkPolygonOverlap = (
      newPolygonFeature: Feature<Polygon, GeoJsonProperties>,
      landPlots: GetLandPlot[],
      excludedId?: string,
    ) => {
      const { setIsOverlapping } = useMapStore.getState();

      const isOverlapping = landPlots.some((existingPlot) => {
        // Bỏ qua polygon hiện tại nếu nó trùng với excludedId (trong trường hợp update)
        if (existingPlot.landPlotId === excludedId) return false;

        const existingPolygon = turf.polygon([
          existingPlot.landPlotCoordinations.map((coord) => [coord.longitude, coord.latitude]),
        ]);

        return (
          turf.booleanOverlap(newPolygonFeature, existingPolygon) ||
          turf.booleanIntersects(newPolygonFeature, existingPolygon)
        );
      });
      setIsOverlapping(isOverlapping);
    };

    const handlePolygonEvents = (
      draw: MapboxDraw,
      e: DrawCreateEvent | DrawDeleteEvent | DrawUpdateEvent,
    ) => {
      const data = draw.getAll();
      if (data.features.length > 0) {
        data.features.forEach((feature) => {
          if (feature.geometry.type === "Polygon") {
            const dimensions = calculateDimensions(feature as Feature<Polygon>);
            const { area, width, length } = dimensions;
            setPolygonDimensions(area, width, length);
          }
        });

        // Cập nhật lại state polygons tùy thuộc vào loại sự kiện
        switch (e.type) {
          case "draw.create":
            draw.deleteAll();
            const feature = e.features[0]; // Chỉ lấy polygon đầu tiên được tạo
            const id = feature.id as string;

            if (!feature.properties) feature.properties = {}; // Khởi tạo properties nếu chưa có
            feature.properties.id = id; // Gán id vào properties của polygon

            // Kiểm tra xem có bị vẽ đè lên thửa cũ không
            const newPolygonFeature = turf.polygon((feature.geometry as Polygon).coordinates);
            checkPolygonOverlap(newPolygonFeature, landPlots);

            draw.add(feature); // Thêm polygon mới vào bản đồ
            const newPolygonData = {
              id: id,
              coordinates: (feature.geometry as Polygon).coordinates,
            };

            // e.features.forEach((feature) => {
            //   if (feature.geometry.type === "Polygon") {
            //     const dimensions = calculateDimensions(feature as Feature<Polygon>);
            //   }
            // });

            addNewPolygon(newPolygonData);
            break;
          case "draw.update":
            const updatedFeature = e.features[0];
            const updatedId = updatedFeature.id as string;

            if (updatedFeature.geometry.type === "Polygon") {
              const updatedPolygonFeature = turf.polygon(
                (updatedFeature.geometry as Polygon).coordinates,
              );
              checkPolygonOverlap(updatedPolygonFeature, landPlots, updatedId);

              const updatedPolygonData = {
                id: updatedId,
                coordinates: (updatedFeature.geometry as Polygon).coordinates,
              };

              addNewPolygon(updatedPolygonData);
              const updatedDimensions = calculateDimensions(updatedFeature as Feature<Polygon>);
              const { area, width, length } = updatedDimensions;
              setPolygonDimensions(area, width, length);
              // setRoundedArea(Math.round(updatedDimensions.area * 100) / 100);
            }
            break;
          default:
            break;
        }
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
          const features =
            landPlots.map((landPlot) => ({
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
              },
            })) || [];

          map.addSource("polygon-layer", {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: features as Feature<Polygon>[],
            },
          });

          (features as Feature<Polygon>[]).forEach((feature) => {
            if (!feature.properties?.landPlotId) {
              draw.add(feature); // Chỉ thêm các polygon được đánh dấu là mới
            }
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
            filter: ["has", "landPlotId"],
          });
        });
      }

      const draw = new MapboxDraw({
        displayControlsDefault: false,
        // controls: {
        //   polygon: true,
        //   trash: true,
        //   point: true,
        //   combine_features: true,
        //   uncombine_features: true,
        // },
        defaultMode: "simple_select",
      });

      map.addControl(draw);
      map.on("draw.create", (e) => handlePolygonEvents(draw, e));
      map.on("draw.update", (e) => handlePolygonEvents(draw, e));

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

      setMapRef(map);
      setDrawRef(draw);

      if (newPolygon) {
        draw.add({
          id: newPolygon.id,
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: newPolygon.coordinates,
          },
          properties: {},
        });
      }

      return () => {
        map.remove();
        setMapRef(null);
        setDrawRef(null);
      };
    }, [latitude, longitude]);

    return <div ref={mapContainer} className={style.customMap}></div>;
  },
);

export default MapNewLandPlot;
