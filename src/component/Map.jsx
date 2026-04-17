import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const defaultIcon = new L.Icon({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41],
});

const Map = ({ users, mySocketId, route, selectedUser, selectedUserId }) => {
    
    const [currentLocation, setCurrentLocation] = useState(null);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            setCurrentLocation([latitude, longitude]);
        });
    }, []);

    function FitBounds({ me, selectedUser }) {
        const map = useMap();
        useEffect(() => {
            if (me && selectedUser && me.lat && me.lng && selectedUser.lat && selectedUser.lng) {
                const bounds = L.latLngBounds([
                    [me.lat, me.lng],
                    [selectedUser.lat, selectedUser.lng]
                ]);
                map.fitBounds(bounds, { padding: [80, 80] });
            } else if (me && me.lat && me.lng) {
                map.setView([me.lat, me.lng], 17);
            }
        }, [me, selectedUser, map]);
        return null;
    }

    // Find yourself in the users array
    const me = users.find(u => u.userId === mySocketId);

    // Extract polyline coordinates from GeoJSON
    let polylineCoords = [];
    if (route && route.features && route.features[0]) {
        polylineCoords = route.features[0].geometry.coordinates.map(
            ([lng, lat]) => [lat, lng]
        );
    }

    return (
        <MapContainer
            center={currentLocation || [51.505, -0.09]}
            zoom={18}
            style={{ height: '100vh', width: '100%' }}
            className="shadow-lg"
        >
            <FitBounds me={me} selectedUser={selectedUser} />
            <TileLayer
                attribution='slrTech'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
            {/* Your marker */}
            {me && me.lat && me.lng && (
                <Marker
                    position={[me.lat, me.lng]}
                    icon={defaultIcon}
                >
                    <Popup>You are here</Popup>
                </Marker>
            )}
            {/* Other users */}
            {users.filter(user => user.userId !== mySocketId).map((user) => (
                user.lat && user.lng && (
                    <Marker
                        key={user.userId}
                        position={[user.lat, user.lng]}
                        icon={defaultIcon}
                    >
                        <Popup>
                            <span className={selectedUserId === user.userId ? "font-bold text-green-600" : ""}>
                                User: {user.userId}
                            </span>
                            <br />
                            Distance: {user.distance ?? 'N/A'} km <br />
                            ETA: {user.eta ?? 'N/A'} min
                        </Popup>
                    </Marker>
                )
            ))}
            {polylineCoords.length > 0 && (
                <Polyline positions={polylineCoords} color="blue" weight={6} opacity={0.8} />
            )}
        </MapContainer>
    );
};

export default Map;