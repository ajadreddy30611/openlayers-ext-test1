import React, { useEffect, useRef } from 'react';
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
      background: 'white',
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
        params: { 'LAYERS': 'Tiff_Layers:tif_Karachi CD 1_shp_08_06-12_59_47'},
        ratio: 1,
        serverType: 'geoserver',
      }),
    });

    // Initialize the map
    const map = new Map({
      target: mapRef.current,
      layers: [
        new LayerGroup({
          title: 'Base Maps',
          layers: [baseLayer, satelliteLayer],
        }),
        new LayerGroup({
          title: 'Overlay Layers',
          layers: [layer2, layer1,shp1],
        }),
      ],
      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
    });

    // Initialize the LayerShop control
    const layerShop = new LayerShop({
      openOnClick: true, // Click to open the shop
      displayInLayerSwitcher: true, // Display layers in the layer switcher
      extent: true, // Allow users to fit to layer extent
    });

    // Add the control to the map
    map.addControl(layerShop);

    // Add Swipe interaction
    const swipe = new Swipe({
      layers: [layer1], // Specify layers for swipe
      rightLayer: layer2, // Set the layer to display on the right
    });
    swipe.setMap(map);
    // map.addInteraction(swipe);

    return () => {
      swipe.setMap(null);
      map.setTarget(null); // Cleanup the map on unmount
    };
  }, []);

  return (
    <div ref={mapRef} className="map" style={{ width: '100%', height: '100vh' }} />
  );
};

export default LayerShopControl;
