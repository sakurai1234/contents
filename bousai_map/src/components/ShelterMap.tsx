import React, { useEffect, useMemo } from "react";
import {
  GeoJSON,
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { Feature, Point } from "geojson";
import type {
  ShelterFeature,
  ShelterFeatureCollection,
  ShelterProperties,
} from "./NearestShelterSearch";

// Leaflet デフォルトアイコン問題の対策（Marker を使う場合）
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function getShelterName(feature: Feature<Point, ShelterProperties>): string {
  return feature.properties?.["施設・場所名"]?.toString() ?? "不明";
}

function getShelterAddress(feature: Feature<Point, ShelterProperties>): string {
  return feature.properties?.["住所"]?.toString() ?? "";
}

function featureKey(feature: ShelterFeature): string {
  const [lon, lat] = feature.geometry.coordinates;
  return `${lat},${lon},${getShelterName(feature)}`;
}

function shelterDivIcon(isNearest: boolean): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `<div class="shelter-marker${
      isNearest ? " shelter-marker--nearest" : ""
    }"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
  });
}

function inputDivIcon(): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `<div class="shelter-marker shelter-marker--input"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
  });
}

const MapViewUpdater: React.FC<{ center: [number, number]; zoom: number }> = ({
  center,
  zoom,
}) => {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [map, center, zoom]);

  return null;
};

export const ShelterMap: React.FC<{
  center: [number, number];
  zoom: number;
  geojsonData: ShelterFeatureCollection | null;
  nearestShelter: ShelterFeature | null;
  inputLatlon: { lat: number; lon: number } | null;
}> = ({ center, zoom, geojsonData, nearestShelter, inputLatlon }) => {
  const nearestKey = useMemo(
    () => (nearestShelter ? featureKey(nearestShelter) : ""),
    [nearestShelter]
  );

  const inputToNearestLine = useMemo(() => {
    if (!inputLatlon || !nearestShelter) return null;
    if (!Number.isFinite(inputLatlon.lat) || !Number.isFinite(inputLatlon.lon)) {
      return null;
    }
    const [lon, lat] = nearestShelter.geometry.coordinates;
    return [
      [inputLatlon.lat, inputLatlon.lon] as [number, number],
      [lat, lon] as [number, number],
    ];
  }, [inputLatlon, nearestShelter]);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: "90vh", width: "100%", marginTop: "16px" }}
    >
      <MapViewUpdater center={center} zoom={zoom} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {inputLatlon && Number.isFinite(inputLatlon.lat) && Number.isFinite(inputLatlon.lon) && (
        <Marker
          position={[inputLatlon.lat, inputLatlon.lon]}
          icon={inputDivIcon()}
        >
          <Popup>
            入力地点<br />
            緯度: {inputLatlon.lat}, 経度: {inputLatlon.lon}
          </Popup>
        </Marker>
      )}

      {inputToNearestLine && (
        <Polyline
          positions={inputToNearestLine}
          pathOptions={{ color: "#6b7280", weight: 3, dashArray: "6 6" }}
        />
      )}

      {geojsonData && (
        <GeoJSON
          key={nearestKey || "no-nearest"}
          data={geojsonData}
          pointToLayer={(feature, latlng) => {
            const f = feature as ShelterFeature;
            const isNearest = nearestKey !== "" && featureKey(f) === nearestKey;
            const name = getShelterName(f);
            const address = getShelterAddress(f);
            return L.marker(latlng, { icon: shelterDivIcon(isNearest) }).bindPopup(
              `施設: ${name}<br>住所: ${address}`
            );
          }}
        />
      )}
    </MapContainer>
  );
};

