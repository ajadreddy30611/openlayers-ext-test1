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
  const mapInstance = useRef();
  const swipeRef = useRef(new Swipe());
  const [swipeEnabled, setSwipeEnabled] = useState(false);
  const [layerChangeTrigger, setLayerChangeTrigger] = useState(0);
  const [layerGroups, setLayerGroups] = useState({
    AOI1: [
      { id: '2019', group: null },
      { id: '2021', group: null },
      { id: '2024', group: null },
    ],
    AOI2: [
      { id: '2022', group: null },
      { id: '2024', group: null },
    ],
  });

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
  // const [t_pos,settpos] = useState(1)
  // const [st_pos,setstpos] = useState(2)
  const [tl,setTl] = useState("Layer 3")
  const [stl,setStl] = useState("Layer 2")
  useEffect(()=>{
    console.log(tl,stl)
  },[tl,stl])
  const createTileLayer = (title, layerName) =>
    new TileLayer({
      title,
      source: new TileWMS({
        url: 'http://localhost:8080/geoserver/Tiff_Layers/wms',
        params: { LAYERS: layerName, TILED: true },
        ratio: 1,
        serverType: 'geoserver',
      }),
    });

  const createImageLayer = (title, layerName) =>
    new ImageLayer({
      title,
      source: new ImageWMS({
        url: 'http://localhost:8080/geoserver/Tiff_Layers/wms',
        params: { LAYERS: layerName },
        ratio: 1,
        serverType: 'geoserver',
      }),
    });

  // Define AOI1 groups
  const AOI1Layers = {
    '2019': new LayerGroup({
      title: '2019',
      layers: [
        createTileLayer('Layer 1', 'Tiff_Layers:AOI_1_2_2019'),
        createImageLayer('Roads', 'Tiff_Layers:2_2019_road'),
        createImageLayer('Buildings', 'Tiff_Layers:2_2019_building'),
      ],
    }),
    '2021': new LayerGroup({
      title: '2021',
      layers: [
        createTileLayer('Layer 2', 'Tiff_Layers:AOI_1_7_2021'),
        createImageLayer('Roads', 'Tiff_Layers:7_2021_road'),
        createImageLayer('Buildings', 'Tiff_Layers:7_2021_building'),
      ],
    }),
    '2024': new LayerGroup({
      title: '2024',
      layers: [
        createTileLayer('Layer 3', 'Tiff_Layers:AOI_1_2_2024'),
        createImageLayer('Roads', 'Tiff_Layers:2_2024_road'),
        createImageLayer('Buildings', 'Tiff_Layers:2_2024_building'),
      ],
    }),
  };

  // Define AOI2 groups
  const AOI2Layers = {
    '2022': 
    new LayerGroup({
      title: '2022',
      layers: [
        createTileLayer('Layer 1', 'Tiff_Layers:AOI_2_12_2022'),
        createImageLayer('Roads', 'Tiff_Layers:12_2022_road'),
        createImageLayer('Buildings', 'Tiff_Layers:12_2022_building'),
      ],
    }),
    '2024': new LayerGroup({
      title: '2024',
      layers: [
        createTileLayer('Layer 2', 'Tiff_Layers:AOI_2_10_2024'),
        createImageLayer('Roads', 'Tiff_Layers:10_2024_road'),
        createImageLayer('Buildings', 'Tiff_Layers:10_2024_building'),
      ],
    }),
  };

  // Initialize AOI LayerGroups
  const AOI1 = new LayerGroup({
    title: 'AOI 1',
    layers: layerGroups.AOI1.map(({ id }) => AOI1Layers[id]),
  });

  const AOI2 = new LayerGroup({
    title: 'AOI 2',
    layers: layerGroups.AOI2.map(({ id }) => AOI2Layers[id]),
  });
  useEffect(() => {
    mapRef.current = new Map({
      target: mapInstance.current,
      layers: [
        new LayerGroup({
          title: 'Base Maps',
          layers: [baseLayer],
        }),
        // AOI2,
        AOI1
      ],
      view: new View({
        center: [0, 0],
        zoom: 2,
        // projection:"EPSG:4326"
      }),
    });
      // Initialize the LayerShop control
    // const layerShop = new LayerShop({
    //   openOnClick: true, // Click to open the shop
    //   displayInLayerSwitcher: true, // Display layers in the layer switcher
    //   extent: true, // Allow users to fit to layer extent
    // });
    // map.addControl(layerShop);

    // Store the map instance
    // mapInstance.current = map;
    // mapRef.current = map;

    return () => {
      // swipe.setMap(null);
      mapRef.current.setTarget(null); // Cleanup the map on unmount
    };
  }, []);
  // State to track layer order changes

  useEffect(() => {
    const layerShop = new LayerShop({
      openOnClick: true, // Click to open the shop
      displayInLayerSwitcher: true, // Display layers in the layer switcher
      extent: true, // Allow users to fit to layer extent
    });
  
    // Add LayerShop control to the map
    mapRef.current.addControl(layerShop);
  
    // Initialize the LayerShop control
  
    layerShop.on('reorder-end', (event) => {
      // Get the AOI1 layer group
      if (mapRef.current.getControls().getArray().includes(swipeRef.current)) {
        mapRef.current.removeControl(swipeRef.current);
      }
      swipeRef.current.removeLayers();
      const aoi1LayerGroup = mapRef.current.getLayers().getArray().find(layer => 
        layer.get('title') === 'AOI 1'
      );
      
      // Get the top layer in the AOI1 layer group
      if (aoi1LayerGroup && aoi1LayerGroup.getLayers) {
        const topLayer = aoi1LayerGroup.getLayers().getArray().at(-1).get('title');
        const secondTopLayer = aoi1LayerGroup.getLayers().getArray().at(-2).get('title');
        const layerTitleMap = {
          '2019': 'Layer 1',
          '2021': 'Layer 2',
          '2024': 'Layer 3',
        };
  
        // Use the map to get the titles
        const top_layer_title = layerTitleMap[topLayer] || '';
        const sec_top_layer_title = layerTitleMap[secondTopLayer] || '';
        setTl(top_layer_title)
        setStl(sec_top_layer_title)
        // console.log(top_layer_title,sec_top_layer_title)
      }
      setLayerChangeTrigger((prev) => prev + 1)
    });
  }, []);
  const [act_lay,setActLay] = useState(null)

  useEffect(() => {
    // Handle swipe logic when layers are rearranged
    // if(layerChangeTrigger!==0){
      const layersAOI1 = AOI1.getLayers().getArray();
      const groupLayers = layersAOI1.map(groupLayer => groupLayer.getLayers().getArray());
      const allLayers = groupLayers.flat();
      
      // Filter for TileLayers
      const tileLayers = allLayers.filter(layer => layer instanceof TileLayer);
      // console.log(tileLayers)
      const layerTitleMap = {
        'Layer 1': '3',
        'Layer 2': '2',
        'Layer 3': '1',
      };
      const t_pos = layerTitleMap[tl]
      const st_pos = layerTitleMap[stl]
      // console.log(t_pos,st_pos)
      // Get top and second top layers
      const topLayerAOI1 = tileLayers[tileLayers.length - t_pos];
      const secondTopLayerAOI1 = tileLayers[tileLayers.length - st_pos];
      // swipeRef.current.removeLayers();
      // mapRef.current.removeControl(swipeRef.current);
      setActLay(topLayerAOI1)
      console.log(topLayerAOI1)
  }, [layerChangeTrigger]);

  useEffect(()=>{
    console.log(swipeRef.current)
  },[act_lay,swipeEnabled])
  useEffect(() => {
    if (swipeEnabled && act_lay && swipeRef.current) {
      // Remove and re-add the swipe control to ensure it reflects the new layer
      mapRef.current.removeControl(swipeRef.current);
      swipeRef.current.removeLayers();
      swipeRef.current.addLayer(act_lay); // Add the updated active layer
      mapRef.current.addControl(swipeRef.current);
  
      // Refresh the map to apply changes
      mapRef.current.render();
    }
  }, [act_lay, swipeEnabled]);
  
  
  const toggleSwipe = () => {
    if (swipeEnabled) {
      // Disable swipe
      swipeRef.current.removeLayers();
      mapRef.current.removeControl(swipeRef.current);
    } else {
      // Enable swipe
      if (act_lay) {
        if (!mapRef.current.getControls().getArray().includes(swipeRef.current)) {
          mapRef.current.addControl(swipeRef.current); // Add the control
        }
        swipeRef.current.layers = []; // Clear existing layers
        swipeRef.current.addLayer(act_lay); // Add the updated active layer
  
        // Force the map to refresh the swipe control
        mapRef.current.render();
      }
    }
    setSwipeEnabled(!swipeEnabled); // Toggle state
  };
  

  const zoomAOI1 = () => {
    if (mapRef.current) {
      const view = mapRef.current.getView();
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
      <div ref={mapInstance} className="map" style={{ width: '100%', height: '100vh' }} />
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
        {/* {swipeEnabled ? 'disable Swipe' : 'Swipe'} */}
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
    </>
  );
};

export default LayerShopControl;
