class EMapViewControl extends React.Component {
    constructor(props) {
        super(props);
        this.mapModel = null;
        this.floatElements = [];
        this.state = {
        };

        this.map = null;
        this.mapView = null;
        this.mapClickEvent = null;
        this.layerLength = 0;
        this.mapLayers = [];//通过递归获取的所有图层
        this.identifyResults = [];
    }
    onElementLoaded(element) {
        var target = this.floatElements.first(function (item) {
            return item == element;
        });
        if (target)
            return;
        else {
            this.floatElements.push(element);
        }
    }
    onElementRemoved(element) {
        var target = this.floatElements.first(function (item) {
            return item == element;
        });
        if (!target)
            return;
        else {
            this.floatElements = removeAll(this.floatElements, function (item) {
                return item == element;
            });
        }
    }
    findElementByID(func) {
        var target = this.floatElements.first(function (item) {
            return func(item);
        });

        return target;
    }
    componentDidMount() {
        var _this = this;
        this.mapModel = this.props.mapModel;
        this.mapLayers = this.getLayersByEMapLayer(this.mapModel.EMapLayer);
        if (!this.mapModel)
            return;

        var mapEx = new mapExtensions();
        var mapID = 'eMap_' + _this.props.mapModel.ID;
        var mapViewOption = this.mapModel.MapOption ? JSON.parse(this.mapModel.MapOption) : null;
        mapEx.createMap(mapID, mapViewOption, function (e) {
            _this.map = e.map;
            _this.mapView = e.mapView;
            _this.setState({
                map: e.map,
                mapView: e.mapView
            });
            _this.initLayers();
        });
    }
    componentWillUnmount() {

    }
    initLayers() {
        if (!this.state || !this.map)
            return;

        if (this.mapModel.EMapLayer) {
            this.addBaseLayers();
            this.addCustomrLayers();
        }
    }
    addBaseLayers() {
        var baseLayers = this.mapModel.EMapLayer.select(function (layer) {
            return layer.IsBaseLayer;
        });
        var orderedBaseLayers = baseLayers.sort(function (first, second) {
            if (first.LayerOrder && second.LayerOrder)
                return first.LayerOrder.localeCompare(second.LayerOrder);
            else
                return true;
        });
        var _this = this;
        var mapFactory = new mapExtensions();
        mapFactory.convertToLayers(orderedBaseLayers, function (layers) {
            _this.map.addMany(layers);
        });
    }

    addCustomrLayers() {
        var customerLayers = this.mapModel.EMapLayer.select(function (layer) {
            return layer.IsBaseLayer != true;
        });
        var treeView = <EMapLayer map={this.map} mapView={this.mapView} dataSource={customerLayers} />;
        this.showWindows([treeView]);
    }
    showWindows(controls) {
        var windows = this.state.floatWindows;
        if (windows) {
            var newWindows = windows.select(function (item) {
                var target = controls.first(function (c) {
                    return c.type.name == item.type.name;
                });
                return !target;
            });
            for (var index = 0; index < controls.length; index++) {
                var control = controls[index];
                newWindows.push(control);
            }

            this.setState({
                floatWindows: newWindows
            });
        }
        else {
            this.setState({
                floatWindows: controls
            });
        }
    }
    removeWindow(control) {
        var windows = this.state.floatWindows;
        if (!windows)
            return;
        var newWindows = windows.select(function (item) {
            return item != control;
        });
        this.setState({
            floatWindows: newWindows
        });

        this.onElementRemoved(control);
    }
    removeAllWindows() {
        this.setState({
            floatWindows: null
        });
    }
    createToolbar() {
        if (!this.mapModel || !this.mapModel.EMapToolItem || this.mapModel.EMapToolItem.length == 0)
            return null;

        return <EMapViewToolbar mapControl={this} />
    }
    createCustomerTools() {
        if (!this.mapModel || !this.mapModel.EMapToolItem || this.mapModel.EMapToolItem.length == 0)
            return null;

        var toolBarItems = this.mapModel.EMapToolItem.select(function (item) {
            return !item.ToolType;
        });
        var _this = this;
        var result = toolBarItems.map(function (item) {
            var Control = window[item.ToolName];
            var content = <Control itemModel={item} mapControl={_this} />;
            return content;
        });
        return result;
    }

    //构造信息窗口内容
    createPopupTemplate(identifyGeometry, features) {
        var _this = this;
        var template = {
            title: "未选中要素",
            location: identifyGeometry,
            features: features,

        };
        return template;
    }

    //监听所有图层
    listenAllLayer() {
        var mapView = this.mapView;
        var _this = this;
        _this.mapClickEvent = mapView.on("click", function (event) {
            _this.mapClick(event.mapPoint);
        });
    }

    //移除监听
    unListenAllLayer() {
        this.mapClickEvent.remove();
    }

    //地图点击
    mapClick(mapPoint) {
        this.identifyResults = [];//清空
        //过滤切片、未勾选
        var layers = this.map.allLayers.items.select(function (item) {
            return item.visible && item.type != "tile" && item.url != null;
        });
        this.layerLength = layers.length;
        for (var i = 0; i < layers.length; i++) {
            this.identifyFeatureLayer(layers[i], mapPoint);
        }

    }


    setFeaturePopupTemplate(results) {
        var features = [];
        var _this = this;
        for (var i = 0; i < results.length; i++) {
            var feature = results[i].feature;
            var layerName = results[i].layerName;
            var layerOption = _this.getLayerOptionBylayerName(results[i].layerId, layerName);
            feature.popupTemplate = {
                title: layerOption.title,
                content: layerOption.content
            };
            features.push(feature);
        }
        return features;
    }

    getLayerOptionBylayerName(layerId, layerName) {
        var layerOption = {};
        for (var i = 0; i < this.mapLayers.length; i++) {
            if (this.mapLayers[i].ID == layerId) {
                var Converts = this.mapLayers[i].Converts;
                for (var j = 0; j < Converts.length; j++) {
                    var layerNameArr = Converts[j].LayerName.split(",");
                    if (layerNameArr.indexOf(layerName) >= 0) {
                        layerOption.title = Converts[j].Title;
                        var ContentOptionJS = "(function (){return" + Converts[j].ContentOption + "})()";
                        layerOption.content = eval(ContentOptionJS);
                    }
                }
            }
        }
        return layerOption;
    }

    getLayersByEMapLayer(EMapLayer) {
        var Layers = [];
        function loopEMapLayer(EMapLayer) {
            EMapLayer.map(function (EMapLayerItem) {
                if (EMapLayerItem.Children.length > 0) {
                    loopEMapLayer(EMapLayerItem.Children);
                }
                else {
                    Layers.push(EMapLayerItem);
                }

            })
        };
        loopEMapLayer(EMapLayer);
        return Layers;
    }



    identifyFeatureLayer(layer, identifyGeometry) {
        var _this = this;
        require([
            "esri/tasks/IdentifyTask", "esri/tasks/support/IdentifyParameters", "esri/Graphic", "dojo/domReady!"], function (IdentifyTask, IdentifyParameters, Graphic) {
                var identifyTask = new IdentifyTask(layer.url);
                var params = new IdentifyParameters();
                params.tolerance = 10;
                params.geometry = identifyGeometry;
                params.layerIds = [layer.layerId];
                params.layerOption = "top";
                params.width = _this.mapView.width;
                params.height = _this.mapView.height;
                params.mapExtent = _this.mapView.extent;
                identifyTask.execute(params).then(function (response) {
                    for (var i = 0; i < response.results.length; i++) {
                        response.results[i].layerId = layer.id;
                    }
                    var results = _this.identifyResults.concat(response.results);
                    _this.identifyResults = results;
                    if (--_this.layerLength <= 0) {
                        //到最后一个
                        var features = _this.setFeaturePopupTemplate(_this.identifyResults);
                        _this.createPopup(identifyGeometry, features);

                    }
                });
            });
    }

    createPopup(identifyGeometry, features) {
        var _this = this;
        _this.mapView.popup.open(_this.createPopupTemplate(identifyGeometry, features));
    }

    identifyDynamicLayer(QueryDynamicLayerUrl, drawFrameGeometry) {
        var _this = this;
        require(["esri/tasks/IdentifyParameters", "esri/tasks/IdentifyTask", "esri/layers/ArcGISDynamicMapServiceLayer",
            "dojo/domReady!"
        ], function (IdentifyParameters, IdentifyTask, ArcGISDynamicMapServiceLayer) {
            var identifyParams = new IdentifyParameters();
            identifyParams.geometry = drawFrameGeometry
            identifyParams.tolerance = 3;
            identifyParams.returnGeometry = true;
            identifyParams.width = _this.mapControl.map.width;
            identifyParams.height = _this.mapControl.map.height;
            identifyParams.mapExtent = _this.mapControl.map.extent;//必须
            identifyParams.layerOption = IdentifyParameters.LAYER_OPTION_ALL;
            var identify = new IdentifyTask(QueryDynamicLayerUrl);
            identify.execute(identifyParams).addCallback(function (result) {
                _this.layerFeatures.features = result.map(function (item) { return item.feature });
                _this.layerFeatures.layerName = layerName;
                _this.setState({ queryCompleted: true })//搜索完成
            });
        });
    }

    //选中的要素高亮

    render() {
        var imgStyle = {
            width: '100%',
            height: '100%'
        };
        console.log("mapModel");
        console.log(this.props.mapModel);
        var mapID = 'eMap_' + this.props.mapModel.ID;
        return (
            <div className='mapViewContainer'>
                <div id={mapID} style={imgStyle}>
                </div>
                {this.state ? this.state.floatWindows : null}
                {this.createToolbar()}
                {this.createCustomerTools()}
            </div>
        );
    }
};

class EMapContainer extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        let id = this.props.id;
        let content;
        $.ajax({
            url: esp.url + 'api/Map/Get?id=' + id,
            type: 'get',
            success: e => {
                this.setState({
                    mapModel: e.Data
                });
            },
            error: function (e) {
                console.log(e);
            }
        });
    }
    render() {
        if (!this.state || !this.state.mapModel)
            return null;

        var controlName = this.state.mapModel.ControlName || 'EMapViewControl';
        var Control = window[controlName];
        var content = <Control mapModel={this.state.mapModel} />;
        return content;
    }
};

class AutoMiniWindow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    componentDidMount() {
        var _this = this;
    }
    onClose() {
        if (this.props.onClose)
            this.props.onClose(this);
    }
    render() {
        return (
            <div className='autoMiniWindow'>
                <div className='title'>
                    <img src={this.props.icon} />
                    <span>{this.props.title}</span>
                    <div className='close' onClick={this.onClose.bind(this)}></div>
                </div>
                <div className='content'>
                    <div>
                        {this.props.content}
                    </div>
                </div>
            </div>
        );
    }
};
