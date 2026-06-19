const map = new maplibregl.Map({
    container: 'map',
    style: 'https://tiles.openfreemap.org/styles/liberty',
    center: [-123.1207, 49.2827],
    zoom: 12
});

const geolocate = new maplibregl.GeolocateControl({
    positionOptions: {
        enableHighAccuracy: true
    },
    trackUserLocation: true
});

map.addControl(geolocate);
map.addControl(new maplibregl.NavigationControl());

map.on('load', () => {
    geolocate.trigger();
});

geolocate.on('geolocate', async (e) => {
    const lat = e.coords.latitude;
    const lon = e.coords.longitude;

    await loadSportsFacilities(lat, lon);
});

