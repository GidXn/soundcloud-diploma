import React from "react";
import { Station, stationInitials } from "./radioStations";

// Station tile: glass square with the station logo (Figma «Radio», 151 x 152, logo 113 x 116)
const RadioTile: React.FC<{ station: Station; active?: boolean; onClick?: () => void }> = ({ station, active, onClick }) => (
    <button
        className={`radio_tile ${active ? "active" : ""}`}
        onClick={onClick}
        title={station.name}
        aria-pressed={active}
    >
        {station.logo ? (
            <img className="radio_logo radio_logo_img" src={station.logo} alt={station.name} />
        ) : (
            <span className="radio_logo" style={{ background: station.bg, color: station.color }}>
                <span className="radio_logo_mark">{stationInitials(station.name)}</span>
                <span className="radio_logo_name">{station.name}</span>
            </span>
        )}
    </button>
);

export default RadioTile;
