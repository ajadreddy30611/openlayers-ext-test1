import React, { useEffect, useRef } from 'react';
import 'ol/ol.css';
// import 'ol-ext/dist/ol-ext.css';
import 'ol-layerswitcher/dist/ol-layerswitcher.css'
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import XYZ from 'ol/source/XYZ';
import LayerGroup from 'ol/layer/Group';
import LayerSwitcher  from 'ol-layerswitcher';
import { TileWMS } from 'ol/source';

const LayerSwitcherMap = () => {
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
          url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'
        }),
        background : 'white'
      });

    const overlayLayer = new TileLayer({
      title: 'Overlay',
      source: new XYZ({
        url: 'https://tile.openweathermap.org/{z}/{x}/{y}.png?appid=your_api_key',
      }),
    });
    const layer1 = new TileLayer({
        title:"layer1",
        source: new TileWMS({
          url: 'http://localhost:8080/geoserver/Tiff_Layers/wms',
          params: {'LAYERS': 'Tiff_Layers:CD_Karachi_Img','TILED':true},
          ratio: 1,
          serverType: 'geoserver',
        }),
      })
    const layer2 = new TileLayer({
        title:"layer2",
        source: new TileWMS({
          url: 'http://localhost:8080/geoserver/Tiff_Layers/wms',
          params: {'LAYERS': 'Tiff_Layers:CD_Karachi CD 2','TILED':true},
          ratio: 1,
          serverType: 'geoserver',
        }),
      })
    const map = new Map({
      target: mapRef.current,
      layers: [
        new LayerGroup({
          title: 'Base Maps',
          layers: [baseLayer, satelliteLayer],
        }),
        new LayerGroup({
          title: 'Layer1',
          layers: [layer2,layer1],
        }),
      ],
      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
    });

    const layerSwitcher = new LayerSwitcher({
      activationMode: 'click', // Options: 'mouseover' | 'click'
      startActive: true,
      tipLabel: 'Layers', // Optional label for the button
      groupSelectStyle: 'group', // Can be 'children' or 'group'
      reordering:true,
      extent:true,
    // reverse: true,
    });
    map.addControl(layerSwitcher);
    
    return () => map.setTarget(null); // Cleanup
  }, []);

  return <div ref={mapRef} style={{ width: '100%', height: '100vh' }} />;
};

export default LayerSwitcherMap;
