import React from "react";
import type { Feature, FeatureCollection, Point } from "geojson";

type LatLon = { lat: number; lon: number };

export type ShelterProperties = {
  "施設・場所名"?: string;
  住所?: string;
  [key: string]: unknown;
};

export type ShelterFeature = Feature<Point, ShelterProperties>;
export type ShelterFeatureCollection = FeatureCollection<Point, ShelterProperties>;

export const NearestShelterSearch: React.FC<{
  latlon: LatLon | null;
  onLatLonChange: (next: LatLon | null) => void;
  onSearch: () => void;
  nearestName: string;
  distanceKm: number | null;
}> = ({ latlon, onLatLonChange, onSearch, nearestName, distanceKm }) => {

  const setLat = (value: string): void => {
    const lat = Number.parseFloat(value);
    onLatLonChange({
      lat: Number.isFinite(lat) ? lat : NaN,
      lon: latlon?.lon ?? NaN,
    });
  };

  const setLon = (value: string): void => {
    const lon = Number.parseFloat(value);
    onLatLonChange({
      lat: latlon?.lat ?? NaN,
      lon: Number.isFinite(lon) ? lon : NaN,
    });
  };

  return (
    <div className="input-section">
      緯度：
      <input
        type="number"
        value={latlon ? latlon.lat : ""}
        onChange={(e) => setLat(e.target.value)}
        placeholder="緯度"
        className="custom-input"
      />
      経度：
      <input
        type="number"
        value={latlon ? latlon.lon : ""}
        onChange={(e) => setLon(e.target.value)}
        placeholder="経度"
        className="custom-input"
      />
      <button type="button" onClick={onSearch}>
        検索
      </button>
      <div>最も近い避難所：{nearestName}</div>
      <div>
        距離：
        {distanceKm == null || !Number.isFinite(distanceKm)
          ? "-"
          : `${distanceKm.toFixed(2)} km`}
      </div>
    </div>
  );
};

