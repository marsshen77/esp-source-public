
import { loadModules } from 'esri-loader';
const options = { url: `http://172.16.9.121:8078/arcgis_js_api/library/4.8/init.js` };
const mapExtensions = function (map) {
    var globalMap = map;
    var _this = this;

    /**
     * 添加配置图层（多个）
     * @param {any} layersSource
     */
    this.addLayers = function (layersSource, callBack) {
        if (!layersSource || layersSource.length < 1) {
            return null;
        }
        _this.convertToLayers(layersSource, function (layers) {
            globalMap.addMany(layers);
            if (callBack)
                callBack(layers);
        });
    }

    /**
     * 添加配置图层（单个）
     * @param {any} layerSource
     */
    this.addLayer = function (layerSource, callBack) {
        _this.convertToLayers([layerSource], function (layers) {
            globalMap.addMany(layers);
            if (callBack)
                callBack(layers);
        });
    }
    this.createMap = function (mapID, option, callBack) {
        loadModules([
            "esri/Basemap",
            "esri/layers/TileLayer",
            "esri/Map",
            "esri/views/MapView",
            "esri/geometry/SpatialReference",
            "esri/geometry/Extent",
            "dojo/domReady!"
        ], options).then(function ([Basemap, TileLayer, Map, MapView, SpatialReference, Extent]) {
            var map = new Map({
                basemap: null,
            });

            var viewOption = option || {
                constraints: {
                    //控制地图旋转
                    rotationEnabled: false
                }
            };
            viewOption.container = mapID;
            viewOption.map = map;
            var mapView = new MapView(viewOption);
            if (callBack) {
                callBack({
                    map: map,
                    mapView: mapView
                });
            }
            mapView.when(function () {
            });
        });
    };
    this.createLayerTree = function (mapView, containerID, callBack) {
        loadModules([
            "esri/widgets/LayerList", "dojo/domReady!"
        ], options).then(function ([LayerList]) {
            var layerList = new LayerList({
                view: mapView,
                container: containerID
            });
            mapView.ui.add(layerList, "top-left");
            if (callBack)
                callBack(layerList);
        });
    }
    this.createLayerLegend = function (mapView, layerID, callBack) {
        loadModules([
            "esri/widgets/Legend",
            "dojo/domReady!"
        ], options).then(function ([Legend]) {
            //// 添加图例
            var layer = mapView.map.findLayerById(layerID)
            if (layer) {
                var legend = new Legend({
                    view: mapView,
                    layerInfos: [{
                        layer: layer,
                        title: ""
                    }]
                });

                mapView.ui.add(legend, "bottom-left");
                if (callBack)
                    callBack(legend);
            }
        });
    }
    this.createGaoDeMapLayer = function (callBack) {
        loadModules([
            "esri/Map",
            "esri/config",
            "esri/request",
            "esri/Color",
            "esri/views/SceneView",
            "esri/layers/BaseTileLayer",
            "dojo/domReady!"
        ], options).then(function ([Map, esriConfig, esriRequest, Color, SceneView, BaseTileLayer]) {
            var TintLayer = BaseTileLayer.createSubclass({
                properties: {
                    urlTemplate: null,
                    tint: {
                        value: null,
                        type: Color
                    }
                },

                // generate the tile url for a given level, row and column
                getTileUrl: function (level, row, col) {
                    var url = 'http://webrd0' + (col % 4 + 1) + '.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x=' + col + '&y=' + row + '&z=' + level;
                    return url;
                    //return this.urlTemplate.replace("{z}", level).replace("{x}",
                    //  col).replace("{y}", row);
                },
                fetchTile: function (level, row, col) {

                    // call getTileUrl() method to construct the URL to tiles
                    // for a given level, row and col provided by the LayerView
                    var url = this.getTileUrl(level, row, col);

                    // request for tiles based on the generated url
                    // set allowImageDataAccess to true to allow
                    // cross-domain access to create WebGL textures for 3D.
                    return esriRequest(url, {
                        responseType: "image",
                        allowImageDataAccess: true
                    })
                        .then(function (response) {
                            // when esri request resolves successfully
                            // get the image from the response
                            var image = response.data;
                            var width = this.tileInfo.size[0];
                            var height = this.tileInfo.size[0];

                            // create a canvas with 2D rendering context
                            var canvas = document.createElement("canvas");
                            var context = canvas.getContext("2d");
                            canvas.width = width;
                            canvas.height = height;


                            // Draw the blended image onto the canvas.
                            context.drawImage(image, 0, 0, width, height);

                            return canvas;
                        }.bind(this));
                }
            });
            esriConfig.request.corsEnabledServers.push("webrd01.is.autonavi.com");
            esriConfig.request.corsEnabledServers.push("webrd02.is.autonavi.com");
            esriConfig.request.corsEnabledServers.push("webrd03.is.autonavi.com");
            esriConfig.request.corsEnabledServers.push("webrd04.is.autonavi.com");

            var stamenTileLayer = new TintLayer({
                urlTemplate: "http://webst01.is.autonavi.com/appmaptile?style=7&x={x}&y={y}&z={z}",
                tint: new Color("#004FBB"),
                title: "高德"
            });
            if (callBack)
                callBack(stamenTileLayer);
        });
    }
    this.convertToLayers = function (models, callBack) {
        loadModules([
            "esri/layers/GroupLayer",
            "esri/config",
            "esri/request",
            "esri/layers/MapImageLayer",
            "esri/layers/FeatureLayer",
            "esri/layers/TileLayer",
            "esri/layers/BaseTileLayer",
            "esri/layers/CSVLayer",
            "esri/layers/WebTileLayer",
            "esri/layers/support/TileInfo",
            "esri/geometry/SpatialReference",
            "esri/Color",
            "dojo/domReady!"
        ], options).then(function (
            [GroupLayer, esriConfig, esriRequest, MapImageLayer, FeatureLayer, TileLayer, BaseTileLayer, CSVLayer,
            WebTileLayer, TileInfo, SpatialReference, Color]) {

            var TintLayer = BaseTileLayer.createSubclass({
                properties: {
                    urlTemplate: null,
                    tint: {
                        value: null,
                        type: Color
                    }
                },
                getTileUrl: function (level, row, col) {
                    var url = 'http://webrd0' + (col % 4 + 1) + '.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x=' + col + '&y=' + row + '&z=' + level;
                    return url;
                },
                fetchTile: function (level, row, col) {
                    var url = this.getTileUrl(level, row, col);
                    return esriRequest(url, {
                        responseType: "image",
                        allowImageDataAccess: true
                    })
                        .then(function (response) {
                            var image = response.data;
                            var width = this.tileInfo.size[0];
                            var height = this.tileInfo.size[0];
                            var canvas = document.createElement("canvas");
                            var context = canvas.getContext("2d");
                            canvas.width = width;
                            canvas.height = height;
                            context.drawImage(image, 0, 0, width, height);

                            return canvas;
                        }.bind(this));
                }
            });
            esriConfig.request.corsEnabledServers.push("webrd01.is.autonavi.com");
            esriConfig.request.corsEnabledServers.push("webrd02.is.autonavi.com");
            esriConfig.request.corsEnabledServers.push("webrd03.is.autonavi.com");
            esriConfig.request.corsEnabledServers.push("webrd04.is.autonavi.com");

            var createLayer = function (model) {
                if (model.Url) {
                    if (esp && esp.convert && esp.convert.convertMapLayerUrl) {
                        model.Url = esp.convert.convertMapLayerUrl(model.Url) || model.Url;
                    }

                    var startIndex = model.Url.indexOf('//') + 2;
                    var endIndex = model.Url.indexOf(':', startIndex);
                    if (endIndex == -1)
                        endIndex = model.Url.indexOf('/', startIndex);
                    var host = model.Url.substring(startIndex, endIndex);
                    esriConfig.request.corsEnabledServers.push(host);
                    var layer = null;
                    var option = {
                        id: model.ID,
                        url: model.Url,
                        visible: model.IsChecked == undefined ? true : model.IsChecked,
                        listMode: model.ListMode == undefined ? true : model.ListMode,
                        title: model.Name == undefined ? 'layer' : model.Name
                    };

                    if (model.PopupTemplate) {
                        option.popupTemplate = model.PopupTemplate
                    }

                    //添加渲染样式
                    if (model.Renderer) {
                        option.renderer = model.Renderer;
                    }

                    //增加透明度
                    if (model.Opacity) {
                        option.opacity = model.Opacity
                    }

                    //增加outFields
                    if (model.OutFields) {
                        option.outFields = model.OutFields;
                    }

                    //增加是否显示
                    if (typeof model.Visible != 'undefined') {
                        option.visible = model.Visible;
                    }

                    var layerOption = model.LayerOption || model.Option;
                    if (layerOption) {
                        var otherOption = JSON.parse(layerOption || {});
                        for (var k in otherOption) {
                            option[k] = otherOption[k];
                        }
                    }

                    esriConfig.request.corsEnabledServers.push(model.Url);
                    if (model.LayerType == 'dynamic') {
                        layer = new MapImageLayer(option);
                    }
                    else if (model.LayerType == 'feature') {
                        layer = new FeatureLayer(option);
                    }
                    else if (model.LayerType == 'tile') {
                        layer = new TileLayer(option);
                    }
                    else if (model.LayerType == 'gaode') {
                        layer = new TintLayer({
                            urlTemplate: "http://webst01.is.autonavi.com/appmaptile?style=7&x={x}&y={y}&z={z}",
                            tint: new Color("#004FBB"),
                            title: model.Name,
                            visible: model.IsChecked || true,
                            listMode: model.ListMode == undefined ? true : model.ListMode,
                        });
                    }
                    else if (model.LayerType == 'tdt_tile') {
                        const tileInfo = new TileInfo({
                            dpi: 90.71428571427429,
                            rows: 256,
                            cols: 256,
                            compressionQuality: 0,
                            origin: {
                                x: -180,
                                y: 90
                            },
                            spatialReference: {
                                wkid: 4326
                            },
                            lods: [
                                {
                                    level: 2,
                                    levelValue: 2,
                                    resolution: 0.3515625,
                                    scale: 147748796.52937502
                                },
                                {
                                    level: 3,
                                    levelValue: 3,
                                    resolution: 0.17578125,
                                    scale: 73874398.264687508
                                },
                                {
                                    level: 4,
                                    levelValue: 4,
                                    resolution: 0.087890625,
                                    scale: 36937199.132343754
                                },
                                {
                                    level: 5,
                                    levelValue: 5,
                                    resolution: 0.0439453125,
                                    scale: 18468599.566171877
                                },
                                {
                                    level: 6,
                                    levelValue: 6,
                                    resolution: 0.02197265625,
                                    scale: 9234299.7830859385
                                },
                                {
                                    level: 7,
                                    levelValue: 7,
                                    resolution: 0.010986328125,
                                    scale: 4617149.8915429693
                                },
                                {
                                    level: 8,
                                    levelValue: 8,
                                    resolution: 0.0054931640625,
                                    scale: 2308574.9457714846
                                },
                                {
                                    level: 9,
                                    levelValue: 9,
                                    resolution: 0.00274658203125,
                                    scale: 1154287.4728857423
                                },
                                {
                                    level: 10,
                                    levelValue: 10,
                                    resolution: 0.001373291015625,
                                    scale: 577143.73644287116
                                },
                                {
                                    level: 11,
                                    levelValue: 11,
                                    resolution: 0.0006866455078125,
                                    scale: 288571.86822143558
                                },
                                {
                                    level: 12,
                                    levelValue: 12,
                                    resolution: 0.00034332275390625,
                                    scale: 144285.93411071779
                                },
                                {
                                    level: 13,
                                    levelValue: 13,
                                    resolution: 0.000171661376953125,
                                    scale: 72142.967055358895
                                },
                                {
                                    level: 14,
                                    levelValue: 14,
                                    resolution: 8.58306884765625e-5,
                                    scale: 36071.483527679447
                                },
                                {
                                    level: 15,
                                    levelValue: 15,
                                    resolution: 4.291534423828125e-5,
                                    scale: 18035.741763839724
                                },
                                {
                                    level: 16,
                                    levelValue: 16,
                                    resolution: 2.1457672119140625e-5,
                                    scale: 9017.8708819198619
                                },
                                {
                                    level: 17,
                                    levelValue: 17,
                                    resolution: 1.0728836059570313e-5,
                                    scale: 4508.9354409599309
                                },
                                {
                                    level: 18,
                                    levelValue: 18,
                                    resolution: 5.3644180297851563e-6,
                                    scale: 2254.4677204799655
                                },
                                {
                                    level: 19,
                                    levelValue: 19,
                                    resolution: 2.68220901489257815e-6,
                                    scale: 1127.23386023998275
                                },
                                {
                                    level: 20,
                                    levelValue: 2,
                                    resolution: 1.341104507446289075e-6,
                                    scale: 563.616930119991375
                                }
                            ]
                        });
                        layer = new WebTileLayer({
                            id: model.ID,
                            title: model.Name == undefined ? 'layer' : model.Name,
                            urlTemplate: model.Url,
                            tileInfo: tileInfo,
                            visible: model.IsChecked || true,
                            listMode: model.ListMode == undefined ? true : model.ListMode,
                            spatialReference: new SpatialReference({ wkid: 4326 })
                        });
                    }
                    else if (model.LayerType == 'csv') {
                        layer = new CSVLayer(model.Url, option);
                    }
                    return layer;
                } else if (model.LayerType == 'gaode') {
                    var layer = new TintLayer({
                        urlTemplate: "http://webst01.is.autonavi.com/appmaptile?style=7&x={x}&y={y}&z={z}",
                        tint: new Color("#004FBB"),
                        title: model.Name,
                        visible: model.IsChecked || true,
                        listMode: model.ListMode,
                    });
                    return layer;
                } else if (model.Children) {
                    var childLayers = model.Children.map(function (childModel) {
                        return createLayer(childModel);
                    });
                    var groupLayer = new GroupLayer({
                        title: model.Name,
                        visible: model.IsChecked,
                        visibilityMode: "independent",
                        layers: childLayers,
                        opacity: 0.75
                    });
                    return groupLayer;
                }
            }

            var layers = models.map(function (model) {
                return createLayer(model);
            });
            if (callBack) {
                callBack(layers);
            }
        });
    }
}
export default mapExtensions;
