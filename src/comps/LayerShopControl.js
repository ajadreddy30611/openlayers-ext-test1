import React, { useState, useEffect, useRef } from 'react';
import 'ol/ol.css';
import 'ol-ext/dist/ol-ext.css';
import 'ol-ext/control/LayerShop.css';
import 'ol-ext/control/Swipe.css';
import LayerShop from 'ol-ext/control/LayerShop';
import Swipe from 'ol-ext/control/Swipe';
import Map from 'ol/Map';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import View from 'ol/View';
import LayerGroup from 'ol/layer/Group';
import { ImageWMS, TileWMS, XYZ } from 'ol/source';
import ImageLayer from 'ol/layer/Image';

const LayerShopControl = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const swipeRef = useRef(null);
  const [swipeEnabled, setSwipeEnabled] = useState(false);
  const [layersVisibility, setLayersVisibility] = useState({
    'Layer 1': true,
    'Layer 2': true,
    'Shapefile 1': true,
  });
  const [baseLayersVisibility, setBaseLayersVisibility] = useState({
    'OSM': true,
    'Satellite': true,
  });

  useEffect(() => {
    const baseLayer = new TileLayer({
      title: 'OpenStreetMap',
      type: 'base',
      source: new OSM(),
    });

    const satelliteLayer = new TileLayer({
      title: 'Satellite',
      type: 'base',
      source: new XYZ({
        url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
      }),
    });

    const layer1 = new TileLayer({
      title: 'Layer 1',
      source: new TileWMS({
        url: 'http://localhost:8080/geoserver/Tiff_Layers/wms',
        params: { 'LAYERS': 'Tiff_Layers:CD_Karachi CD 1', 'TILED': true },
        ratio: 1,
        serverType: 'geoserver',
      }),
    });

    const layer2 = new TileLayer({
      title: 'Layer 2',
      source: new TileWMS({
        url: 'http://localhost:8080/geoserver/Tiff_Layers/wms',
        params: { 'LAYERS': 'Tiff_Layers:CD_Karachi CD 2', 'TILED': true },
        ratio: 1,
        serverType: 'geoserver',
      }),
    });

    const shp1 = new ImageLayer({
      title: 'Shapefile 1',
      source: new ImageWMS({
        url: 'http://localhost:8080/geoserver/Tiff_Layers/wms',
        params: { 'LAYERS': 'Tiff_Layers:tif_Karachi CD 1_shp_08_06-12_59_47' },
        ratio: 1,
        serverType: 'geoserver',
      }),
    });

    // Initialize the map
    const map = new Map({
      target: mapRef.current,
      layers: [baseLayer, satelliteLayer, layer2, layer1, shp1],
      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
    });

    // Store the map instance
    mapInstance.current = map;

    // Initialize Swipe interaction
    const swipe = new Swipe({
      layers: [layer1],
      rightLayer: layer2,
    });
    swipeRef.current = swipe;

    return () => {
      swipe.setMap(null);
      map.setTarget(null); // Cleanup the map on unmount
    };
  }, []);

  // Toggle layer visibility
  const handleLayerToggle = (layerName) => {
    setLayersVisibility((prevState) => {
      const newVisibility = { ...prevState, [layerName]: !prevState[layerName] };
      const layer = mapInstance.current.getLayers().getArray().find(layer => layer.get('title') === layerName);
      if (layer) {
        layer.setVisible(newVisibility[layerName]);
      }
      return newVisibility;
    });
  };

  // Toggle base layer visibility
  const handleBaseLayerToggle = (baseLayerName) => {
    setBaseLayersVisibility((prevState) => {
      const newVisibility = { ...prevState, [baseLayerName]: !prevState[baseLayerName] };
      const baseLayer = mapInstance.current.getLayers().getArray().find(layer => layer.get('title') === baseLayerName);
      if (baseLayer) {
        baseLayer.setVisible(newVisibility[baseLayerName]);
      }
      return newVisibility;
    });
  };

  const toggleSwipe = () => {
    if (swipeEnabled) {
      swipeRef.current.setMap(null); // Disable swipe
    } else {
      swipeRef.current.setMap(mapInstance.current); // Enable swipe
    }
    setSwipeEnabled(!swipeEnabled);
  };

  return (
    <>
      <div ref={mapRef} className="map" style={{ width: '100%', height: '100vh' }} />
      <button
        onClick={toggleSwipe}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 1000,
          padding: '4px 13px',
          background: swipeEnabled ? 'black' : 'white',
          color: swipeEnabled ? 'white' : 'black',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Swipe
      </button>
      <div style={{
        position: 'absolute',
        top: '60px',
        right: '10px',
        zIndex: 1000,
        padding: '4px 13px',
        background: 'white',
        color: 'black',
        border: 'none',
        borderRadius: '5px',
        height: "300px",
        width: "300px",
        opacity: "0.7",
        overflowY: "auto",  // Allows scrolling if the content exceeds the div height
      }}>
        <h4>Layer Visibility</h4>
        {Object.keys(layersVisibility).map((layerName) => (
          <div key={layerName} style={{ marginBottom: '10px' }}>
            <label>
              <input
                type="checkbox"
                checked={layersVisibility[layerName]}
                onChange={() => handleLayerToggle(layerName)}
              />
              {layerName}
            </label>
          </div>
        ))}

        <h4>Base Layers</h4>
        {Object.keys(baseLayersVisibility).map((baseLayerName) => (
          <div key={baseLayerName} style={{ marginBottom: '10px' }}>
            <label>
              <input
                type="checkbox"
                checked={baseLayersVisibility[baseLayerName]}
                onChange={() => handleBaseLayerToggle(baseLayerName)}
              />
              {baseLayerName}
            </label>
          </div>
        ))}
      </div>
    </>
  );
};

export default LayerShopControl;
