import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import "./App.css";
import type { FeatureCollection, Point } from "geojson";
import {
  NearestShelterSearch,
  type ShelterFeature,
  type ShelterProperties,
} from "./components/NearestShelterSearch"; // 緯度軽度の入力を受け、最も近い避難所を割り出すコンポーネント
import { ShelterMap } from "./components/ShelterMap"; // 避難所のマップを表示するコンポーネント

type LatLon = { lat: number; lon: number };
type ShelterFeatureCollection = FeatureCollection<Point, ShelterProperties>;

function getShelterName(feature: ShelterFeature): string {
  return feature.properties?.["施設・場所名"]?.toString() ?? "不明";
}

const EARTH_RADIUS_KM = 6371.0088;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function haversineDistanceKm(a: LatLon, b: LatLon): number {
  const lat1 = toRad(a.lat);
  const lon1 = toRad(a.lon);
  const lat2 = toRad(b.lat);
  const lon2 = toRad(b.lon);

  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;

  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);

  const h =
    sinDLat * sinDLat +
    Math.cos(lat1) * Math.cos(lat2) * (sinDLon * sinDLon);

  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return EARTH_RADIUS_KM * c;
}

function findNearestShelter(
  latlon: LatLon,
  geojsonData: ShelterFeatureCollection
): { feature: ShelterFeature; distanceKm: number } | null {
  let nearest: { feature: ShelterFeature; distanceKm: number } | null = null;

  for (const feature of geojsonData.features) {
    if (feature.geometry.type !== "Point") continue;
    const [lon, lat] = feature.geometry.coordinates;
    const distanceKm = haversineDistanceKm(latlon, { lat, lon });
    if (!nearest || distanceKm < nearest.distanceKm) {
      nearest = { feature: feature as ShelterFeature, distanceKm };
    }
  }

  return nearest;
}

function AppMap(): ReactElement {
  const [latlon, setLatlon] = useState<LatLon | null>(null);
  const [searchedLatlon, setSearchedLatlon] = useState<LatLon | null>(null);
  const [nearestShelter, setNearestShelter] = useState<ShelterFeature | null>(
    null
  );
  const [nearestDistanceKm, setNearestDistanceKm] = useState<number | null>(null);

  const [geojsonData, setGeojsonData] = useState<ShelterFeatureCollection | null>(
    null
  );

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}13000_2.geojson`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch GeoJSON");
        return res.json();
      })
      .then((data) => setGeojsonData(data))
      .catch((err) => console.error(err));
  }, []);

  const [mapCenter, setMapCenter] = useState<[number, number]>([
    35.681236, 139.767125,
  ]);
  const [mapZoom, setMapZoom] = useState<number>(14);

  useEffect(() => {
    if (!nearestShelter) {
      setMapZoom(14);
      return;
    }
    const [lon, lat] = nearestShelter.geometry.coordinates;
    setMapCenter([lat, lon]);
    setMapZoom(16);
  }, [nearestShelter]);

  const nearestName = nearestShelter ? getShelterName(nearestShelter) : "";

  const onSearch = (): void => {
    if (!latlon || !geojsonData) {
      setNearestShelter(null);
      setSearchedLatlon(null);
      setNearestDistanceKm(null);
      return;
    }
    setSearchedLatlon(latlon);
    const nearest = findNearestShelter(latlon, geojsonData);
    setNearestShelter(nearest?.feature ?? null);
    setNearestDistanceKm(nearest?.distanceKm ?? null);
  };

  return (
    <div className="container">
      <NearestShelterSearch
        latlon={latlon}
        onLatLonChange={(next) => setLatlon(next)}
        onSearch={onSearch}
        nearestName={nearestName}
        distanceKm={nearestDistanceKm}
      />

      <ShelterMap
        center={mapCenter}
        zoom={mapZoom}
        geojsonData={geojsonData}
        nearestShelter={nearestShelter}
        inputLatlon={searchedLatlon}
      />

      <p className="read-the-docs">
        React + TypeScript + Leaflet + OpenStreetMap + GeoJSON
      </p>
    </div>
  );
}

export default AppMap;
