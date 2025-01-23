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
  const swipeRef = useRef(new Swipe());
  const [swipeEnabled, setSwipeEnabled] = useState(false);
  const [layersVisibility, setLayersVisibility] = useState({
    'Layer 1': true,
    'Road Shapefile 1': true,
    'Building Shapefile 1': true,
    'Layer 2': true,
    'Road Shapefile 2': true,
    'Building Shapefile 2': true,
    'Layer 3': true,
    'Road Shapefile 3': true,
    'Building Shapefile 3': true,
  });
  
  const [baseLayersVisibility, setBaseLayersVisibility] = useState({
    'OSM': true,
    'Satellite': true,
  });
  // const [topLayer, setTopLayer] = useState(layer1);
  // const [secondTopLayer, setSecondTopLayer] = useState(null);
  
  const baseLayer = new TileLayer({
    title: 'OSM',
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
      params: { 'LAYERS': 'Tiff_Layers:AOI_1_2_2019', 'TILED': true },
      ratio: 1,
      serverType: 'geoserver',
    }),
  });
  
  const layer2 = new TileLayer({
    title: 'Layer 2',
    source: new TileWMS({
      url: 'http://localhost:8080/geoserver/Tiff_Layers/wms',
      params: { 'LAYERS': 'Tiff_Layers:AOI_1_7_2021', 'TILED': true },
      ratio: 1,
      serverType: 'geoserver',
    }),
  });
  
  const layer3 = new TileLayer({
    title: 'Layer 3', // Ensure this title is unique
    source: new TileWMS({
      url: 'http://localhost:8080/geoserver/Tiff_Layers/wms',
      params: { 'LAYERS': 'Tiff_Layers:AOI_1_2_2024', 'TILED': true },
      ratio: 1,
      serverType: 'geoserver',
    }),
  });
  
  const shp_road_1 = new ImageLayer({
    title: 'Road Shapefile 1', // Unique title
    source: new ImageWMS({
      url: 'http://localhost:8080/geoserver/Tiff_Layers/wms',
      params: { 'LAYERS': 'Tiff_Layers:2_2019_road' },
      ratio: 1,
      serverType: 'geoserver',
    }),
  });
  
  const shp_road_2 = new ImageLayer({
    title: 'Road Shapefile 2', // Unique title
    source: new ImageWMS({
      url: 'http://localhost:8080/geoserver/Tiff_Layers/wms',
      params: { 'LAYERS': 'Tiff_Layers:7_2021_road' },
      ratio: 1,
      serverType: 'geoserver',
    }),
  });
  
  const shp_road_3 = new ImageLayer({
    title: 'Road Shapefile 3', // Unique title
    source: new ImageWMS({
      url: 'http://localhost:8080/geoserver/Tiff_Layers/wms',
      params: { 'LAYERS': 'Tiff_Layers:2_2024_road' },
      ratio: 1,
      serverType: 'geoserver',
    }),
  });
  
  const shp_building_1 = new ImageLayer({
    title: 'Building Shapefile 1', // Unique title
    source: new ImageWMS({
      url: 'http://localhost:8080/geoserver/Tiff_Layers/wms',
      params: { 'LAYERS': 'Tiff_Layers:2_2019_building' },
      ratio: 1,
      serverType: 'geoserver',
    }),
  });
  
  const shp_building_2 = new ImageLayer({
    title: 'Building Shapefile 2', // Unique title
    source: new ImageWMS({
      url: 'http://localhost:8080/geoserver/Tiff_Layers/wms',
      params: { 'LAYERS': 'Tiff_Layers:7_2021_building' },
      ratio: 1,
      serverType: 'geoserver',
    }),
  });
  
  const shp_building_3 = new ImageLayer({
    title: 'Building Shapefile 3', // Unique title
    source: new ImageWMS({
      url: 'http://localhost:8080/geoserver/Tiff_Layers/wms',
      params: { 'LAYERS': 'Tiff_Layers:2_2024_building' },
      ratio: 1,
      serverType: 'geoserver',
    }),
  });
  const [topLayer, setTopLayer] = useState(layer1);
  const [secondTopLayer, setSecondTopLayer] = useState(layer2);
  useEffect(() => {
    
    // Initialize the map
    const map = new Map({
      target: mapRef.current,
      layers: [baseLayer, satelliteLayer,layer3, layer2, layer1, shp_road_1,shp_road_2,shp_road_3,shp_building_1,shp_building_2,shp_building_3],
      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
    });

    // Store the map instance
    mapInstance.current = map;

    // Initialize Swipe interaction
    // const swipe = new Swipe({
    //   layers: [topLayer],
    //   rightLayer: secondTopLayer,
    // });
    // swipeRef.current = swipe;

    return () => {
      swipeRef.current.setMap(null);
      map.setTarget(null); // Cleanup the map on unmount
    };
  }, []);

  useEffect(() => {
    if (!swipeEnabled || !mapInstance.current) return;
  
    // Remove existing Swipe control
    swipeRef.current.setMap(null);
  
    // Create a new Swipe control with updated layers
    const newSwipe = new Swipe({
      layers: [topLayer],
      rightLayer: secondTopLayer,
    });
  
    // Update the Swipe reference and add it to the map
    swipeRef.current = newSwipe;
    console.log(swipeRef.current)
    mapInstance.current.addControl(newSwipe);
  }, [topLayer, secondTopLayer]);

  const updateTopLayers = () => {
    if (!mapInstance.current) {
      console.error('Map instance is not initialized');
      return;
    }
  
    // Define the priority layers
    const priorityLayers = ['Layer 1', 'Layer 2', 'Layer 3'];
  
    // Get the list of checked priority layers
    const checkedLayers = priorityLayers.filter(layer => layersVisibility[layer]);
    if(checkedLayers.includes("Layer 1") && checkedLayers.includes("Layer 2")) {
      setTopLayer(layer1);
      setSecondTopLayer(layer2)
    }
    else if(checkedLayers.includes("Layer 1") && checkedLayers.includes("Layer 3")){
      setTopLayer(layer1);
      setSecondTopLayer(layer3)
    }
    else if(checkedLayers.includes("Layer 2") && checkedLayers.includes("Layer 3")){
      setTopLayer(layer2);
      setSecondTopLayer(layer3)
    }
    if(swipeEnabled){
      mapInstance.current.addControl(swipeRef.current)
      swipeRef.current.addLayer(topLayer)
    }
  };
  
  useEffect(() => {
    updateTopLayers();
    console.log(swipeRef.current)
  }, [layersVisibility]);
  
  // To debug, you can log the states:
  useEffect(() => {
    console.log(topLayer, secondTopLayer);
  }, [topLayer, secondTopLayer]);

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
      // Disable swipe
      swipeRef.current.setMap(null);
    } else {
      // Enable swipe with current layers
      const newSwipe = new Swipe({
        layers: [topLayer],
        rightLayer: secondTopLayer,
      });

      swipeRef.current = newSwipe;
      console.log(swipeRef.current)
      mapInstance.current.addControl(newSwipe);
    }
    setSwipeEnabled(!swipeEnabled);
  };

  const zoomAOI1 = () => {
    if (mapInstance.current) {
      const view = mapInstance.current.getView();
      view.setCenter([1043563.0960158349480480,61531.2254863339621807]);
      view.setZoom(14);
    } else {
      console.error('Map instance is not initialized');
    }
  };
  const zoomAOI2 = () => {
    if (mapInstance.current) {
      const view = mapInstance.current.getView();
      view.setCenter([1044055.8794657050166279,56167.7732248630782124]);
      view.setZoom(14);
    } else {
      console.error('Map instance is not initialized');
    }
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
      <button
        onClick={zoomAOI1}
        style={{
          position: 'absolute',
          top: '10px',
          right: '220px',
          zIndex: 1000,
          padding: '4px 13px',
          background: 'white',
          color: 'black',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Zoom to AOI 1
      </button>
      <button
        onClick={zoomAOI2}
        style={{
          position: 'absolute',
          top: '10px',
          right: '100px',
          zIndex: 1000,
          padding: '4px 13px',
          background: 'white',
          color: 'black',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Zoom to AOI 2
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
        height: "500px",
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
