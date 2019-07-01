class MapLayerEditorButton extends React.Component {
    constructor(props) {
        super(props);
        this.editBarVisible = false;
        this.editToolbar = null;
    }
    componentDidMount() {
        var map = this.props.mapControl.map;
        this.init(map);
        this.setVisible(false);
    }
    switchVisible() {
        this.editBarVisible = !this.editBarVisible;
        this.setVisible(this.editBarVisible);
    }
    getMapLayerControl() {
        var target = ep.floatWindowContents.first(function (content) {
            return content.props.dockFormInfo && content.props.dockFormInfo.ContentType == 'EMapViewer';
        });
        var layerButton = target.findElementByToolName('ShowLayerToolbarItem');
        return layerButton.childWindows.length > 0 ? layerButton.childWindows[0] : null;
    }
    startEditLayer(featureLayer) {
        this.editToolbar.getEditor("templateDiv", "editorDiv", "editBar", featureLayer);
        this.initFeatureTable(featureLayer);
        $('[widgetid=btnDelete2]>span>span').click(function (e) {
            if (!confirm('您确定要删除该元素吗？')) {
                if (e && e.stopPropagation)
                    e.stopPropagation();
                else
                    window.event.cancelBubble = true;

                return false;
            }
        });
        this.setState({
            'currentLayer': featureLayer
        });
    }
    refreshLayers() {
        if (!this.editToolbar)
            return;


        var editLayerLists = this.editToolbar.getEditableFeatureLayer();
        if (!editLayerLists || editLayerLists.length == 0) {
            $('#editBar').slideUp();
            $('.editFeatureTableContainer').slideUp();
            $('.LayerEditorButton .filterWindow').slideUp();
            return;
        }

        this.setState({
            'layers': editLayerLists
        });

        this.startEditLayer(editLayerLists[0]);
        return editLayerLists;
    }
    setVisible(visible) {
        var _this = this;
        this.editBarVisible = visible;

        var editLayerLists = this.refreshLayers();

        var layerControl = this.getMapLayerControl();
        if (this.editBarVisible && editLayerLists && editLayerLists.length > 0) {
            $('#editBar').slideDown();
            $('.editFeatureTableContainer').show();
            this.startEditLayer(editLayerLists[0]);
            if (layerControl) {
                layerControl.bind('onItemChecked', function (e) {
                    _this.refreshLayers();
                });
            }
        }
        else {
            $('#editBar').slideUp();
            $('.editFeatureTableContainer').slideUp();
            $('.LayerEditorButton .filterWindow').slideUp();
            this.editBarVisible = false;
            if (layerControl) {
                layerControl.unbind('onItemChecked');
            }
        }
    }
    onLayerChanged(ev) {
        this.editToolbar.cancel();
        if (!this.editBarVisible)
            return;

        var layerName = ev.target.value;
        var layer = this.state.layers.first(function (layer) {
            return layer.name == layerName;
        });

        this.startEditLayer(layer);
    }
    createFilters() {
        if (!this.state || !this.state.currentLayer)
            return null;

        var result = this.state.currentLayer.fields.map(function (item) {
            return <div>{item.alias}</div>;
        });

        return result;
    }
    layerUpdated(sender) {
        if (this.myFeatureTable)
            this.initFeatureTable(this.state.currentLayer);
    }
    filterWindowClosed() {
        $('.LayerEditorButton .filterWindow').slideUp();
    }
    render() {
        console.log(this.props.itemModel);
        console.log(this.props.mapControl);
        var fitlers = this.createFilters();
        var items = null;
        if (this.state && this.state.layers) {
            console.log('layers:');
            console.log(this.state.layers);
            var items = this.state.layers.map(function (layer) {
                var name = layer.name;
                return <option>{name}</option>;
            });
        }

        var filterPanel = this.state && this.state.currentLayer ? <LayerFilterPanel layerUpdated={this.layerUpdated.bind(this)} featureLayer={this.state.currentLayer} /> : null;
        return (
            <div className='LayerEditorButton'>
                <span onClick={this.switchVisible.bind(this)}>图层编辑</span>
                <div id="editBar" className='EditToolbar'>
                    <div class="selectLayer">
                        <select onChange={this.onLayerChanged}>
                            {items}
                        </select>
                    </div>
                    <div class="selectStyle" id="templateDiv">
                    </div>
                    <div class="toolbar " id="editorDiv">
                    </div>
                    <div className='refreshButton' onClick={this.refreshLayers.bind(this)}>
                        刷新
                    </div>
                </div>
                <div className='editFeatureTableContainer'>
                </div>
                <div className='filterWindow'>
                    <div className='title'>
                        <span>图层筛选条件</span>
                        <a className='closeButton' onClick={this.filterWindowClosed.bind(this)}>关闭</a>
                    </div>
                    <div className='content'>
                        {filterPanel}
                    </div>
                </div>
            </div>
        );
    }
    init(map) {
        var _this = this;
        require([
            "esri/ccw/editTools",
            "dojo/domReady!"
        ],
            function (
                editTools
            ) {
                console.debug('init toolbar');
                _this.editToolbar = new editTools(map, "http://content.china-ccw.com:6080/arcgis/rest/services/Utilities/Geometry/GeometryServer");
                _this.editToolbar.isEditing = true;
            }
        );
    }
    myFeatureTable = null;
    initFeatureTable(featureLayer) {
        var _this = this;
        var map = this.props.mapControl.map;
        if (_this.myFeatureTable) {
            _this.myFeatureTable.destroy();
            _this.myFeatureTable = null;
        }
        $('.editFeatureTableContainer').html('<div id="featureTableDiv"></div>');
        require([
            "esri/dijit/FeatureTable",
            "dojo/on",
            "dijit/layout/ContentPane",
            "dijit/layout/BorderContainer",
            "esri/geometry/jsonUtils",
            "dojo/domReady!"
        ],
            function (
                FeatureTable, on, ContentPane, BorderContainer, geometryJsonUtils
            ) {
                var createFunctions = function () {
                    var functions = [
                        {
                            label: "筛选条件",
                            callback(evt) {
                                $('.LayerEditorButton .filterWindow').slideDown();
                            }
                        },
                        {
                            label: "更新坐标",
                            callback(evt) {
                                var features = featureLayer.getSelectedFeatures();
                                if (features.length == 0)
                                    return;

                                var value = prompt("请输入坐标串", '');
                                if (!value) {
                                    return;
                                }
                                var wkt = '';
                                if (featureLayer.geometryType == 'esriGeometryPolygon')
                                    wkt = 'POLYGON((' + value + '))';
                                else if (featureLayer.geometryType == 'esriGeometryPoint')
                                    wkt = 'POINT(' + value + ')';
                                else if (featureLayer.geometryType == 'esriGeometryPolyline')
                                    wkt = 'LINESTRING(' + value + ')';
                                else
                                    return;
                                var primitive = Terraformer.WKT.parse(wkt);
                                // convert the geojson object to a arcgis json representation
                                var arcgis = Terraformer.ArcGIS.convert(primitive);
                                // create a new geometry object from json
                                var geometry = geometryJsonUtils.fromJson(arcgis);

                                var targetFeature = features[0];
                                targetFeature.setGeometry(geometry);
                                featureLayer.applyEdits(null, [targetFeature], null);
                            }
                        }
                    ];
                    if (featureLayer.geometryType == 'esriGeometryPoint') {
                        functions.push({
                            label: "导出",
                            callback(evt) {
                                if (ep && ep.mapConfig && ep.mapConfig.exportFeatures)
                                    ep.mapConfig.exportFeatures(featureLayer);
                            }
                        });
                    }
                    return functions;
                };
                _this.myFeatureTable = new FeatureTable({
                    featureLayer: featureLayer,
                    map: map,
                    editable: true,
                    syncSelection: true,
                    dateOptions: {
                        datePattern: 'M/d/y',
                        timeEnabled: true,
                        timePattern: 'H:mm',
                    },
                    menuFunctions: createFunctions()
                }, 'featureTableDiv');

                _this.myFeatureTable.startup();
                _this.myFeatureTable.on("refresh", function (evt) {
                    console.log("refresh event - ", evt);
                });
            }
        );
    }
};

class ShowLayerFilterPanel extends React.Component {
    constructor(props) {
        super(props);
        this.editBarVisible = false;
    }
    componentDidMount() {
    }
    switchVisible() {
        this.editBarVisible = !this.editBarVisible;
        this.setVisible(this.editBarVisible);
    }
    setVisible(visible) {
        var _this = this;
        this.editBarVisible = visible;
        var layer = this.props.mapControl.map.selectedLayer;
        if (this.refs.LayerFilterPanel.createFilters(layer).length == 0)
            return;

        if (this.editBarVisible && layer) {
            $('.ShowLayerFilterButton .filterWindow').slideDown();
            this.refs.LayerFilterPanel.refresh(layer);
        }
        else {
            $('.ShowLayerFilterButton .filterWindow').slideUp();
        }
    }
    layerUpdated(sender) {
        this.setVisible(false);
    }
    render() {
        var layer = this.props.mapControl.map.selectedLayer;

        var filterPanel = <LayerFilterPanel map={this.props.mapControl.map} ref='LayerFilterPanel' layerUpdated={this.layerUpdated.bind(this)} featureLayer={layer} />;

        return (
            <div className='ShowLayerFilterButton'>
                <span onClick={this.switchVisible.bind(this)}>图层筛选</span>
                <div className='filterWindow' style={{ display: 'none' }}>
                    <div className='title'>
                        <span>图层筛选条件</span>
                        <a className='closeButton' onClick={this.setVisible.bind(this, false)}>关闭</a>
                    </div>
                    <div className='content'>
                        {filterPanel}
                    </div>
                </div>
            </div>
        );
    }
};

class LayerFilterPanel extends React.Component {
    constructor(props) {
        super(props);
        this.filterItems = [];
    }
    componentDidMount() {
        var layer = this.getLayer();
        if (!layer)
            return;

        this.refresh(layer);
    }
    onLayerFilterItemLoaded(sender) {
        this.filterItems.push(sender);
    }
    refresh(layer) {
        var filters = this.createFilters(layer);
        this.setState({
            layer: layer,
            filters: filters
        });
    }
    createFilters(layer) {
        var result = [];

        for (var index = 0; index < layer.fields.length; index++) {
            var item = layer.fields[index];
            if (ep.mapConfig.layerFilter && !ep.mapConfig.layerFilter.getFilterFieldsConfig(layer, item.alias))
                continue;

            var needRelTypes = (index < layer.fields.length - 1);

            var filterItem = <LayerFilterItem onLoaded={this.onLayerFilterItemLoaded.bind(this)} fieldItem={item} needRelTypes={needRelTypes}>{item.alias}</LayerFilterItem>;
            result.push(filterItem);
        }

        return result;
    }
    getLayer() {
        if (!this.state || !this.state.layer)
            return null;

        var layer = this.state.layer;
        return layer;

    }
    updateLayer() {
        console.log('---------------');
        if (!this.filterItems)
            return;

        var layer = this.getLayer();
        if (!layer)
            return;


        var filters = [];
        for (var index = 0; index < this.filterItems.length; index++) {
            var filterItem = this.filterItems[index];
            var command = filterItem.getCommand();
            if (!command)
                continue;

            filters.push(command);
        }
        var map = this.props.map;
        if (filters.length == 0) {
            layer.setDefinitionExpression('');
            layer.refresh();

            if (layer.fullExtent)
                map.setExtent(layer.fullExtent);
            else if (layer.initialExtent)
                map.setExtent(layer.initialExtent);
        }
        else {
            var commandText = '';
            for (var index = 0; index < filters.length; index++) {
                var filter = filters[index];
                if (index < filters.length - 1) {
                    commandText = commandText + ' ' + filter.commandText + ' ' + filter.relation;
                }
                else {
                    commandText = commandText + ' ' + filter.commandText;
                }
            }
            layer.setDefinitionExpression(commandText);
            layer.refresh();
            if (layer.fullExtent)
                map.setExtent(layer.fullExtent);
            else if (layer.initialExtent)
                map.setExtent(layer.initialExtent);

        }

        if (this.props.layerUpdated) {
            this.props.layerUpdated(this);
        }
    }
    render() {
        return (
            <div className='layerFitlerPanel'>
                <div className='toolbar'>
                    <div className='updateButton' onClick={this.updateLayer.bind(this)}>
                        刷新
                    </div>
                </div>
                <div className='filters'>
                    {this.state ? this.state.filters : null}
                </div>
            </div>
        );
    }
};

class LayerFilterItem extends React.Component {
    constructor(props) {
        super(props);
        this.equals = null;
    }
    componentDidMount() {
        if (this.props.onLoaded)
            this.props.onLoaded(this);
    }
    createEquals(type) {
        this.equals = [
            {
                'type': 'esriFieldTypeOID',
                'filters': [
                    {
                        'name': '等于',
                        'value': '=',
                        'command': '{0}={1}'
                    }, {
                        'name': '大于',
                        'value': '>',
                        'command': '{0}>{1}'
                    }, {
                        'name': '小于',
                        'value': '<',
                        'command': '{0}<{1}'
                    }, {
                        'name': '不等于',
                        'value': '<>',
                        'command': '{0}<>{1}'
                    }
                ]
            },
            {
                'type': 'esriFieldTypeString',
                'filters': [
                    {
                        'name': '等于',
                        'value': '=',
                        'command': '{0}=\'{1}\''
                    }, {
                        'name': '包含',
                        'value': '包含',
                        'command': '{0} like \'%{1}%\''
                    }
                ]
            }
        ];
        var target = this.equals.first(function (item) {
            return item.type == type;
        });
        if (!target)
            return null;

        var options = target.filters.map(function (item) {
            return <option value={item.command}>{item.name}</option>;
        });

        return options;
    }
    createRelTypes() {
        if (!this.props.needRelTypes) {
            return null;
        }

        var fieldItem = this.props.fieldItem;
        var relID = fieldItem.alias + '_RelType';

        return (
            <div className='fRelType'>
                <select id={relID}>
                    <option value='and'>并且</option>
                    <option value='or'>或者</option>
                </select>
            </div>
        );
    }
    format(source, params) {
        if (arguments.length == 1)
            return function () {
                var args = $.makeArray(arguments);
                args.unshift(source);
                return $.format.apply(this, args);
            };
        if (arguments.length > 2 && params.constructor != Array) {
            params = $.makeArray(arguments).slice(1);
        }
        if (params.constructor != Array) {
            params = [params];
        }
        $.each(params, function (i, n) {
            source = source.replace(new RegExp("\\{" + i + "\\}", "g"), n);
        });
        return source;
    }
    getCommand() {
        var fieldItem = this.props.fieldItem;

        var equalID = fieldItem.alias + '_equal';
        var valueID = fieldItem.alias + '_value';
        var relID = fieldItem.alias + '_RelType';

        var value = $('#' + valueID).val();
        if (!value)
            return null;

        var commandTemplate = $('#' + equalID).val();
        var command = this.format(commandTemplate, fieldItem.alias, value);

        var relValue = $('#' + relID).val();

        return {
            'commandText': command,
            'relation': relValue
        };
    }
    createFilterItem(fieldItem) {
        if (!fieldItem || !fieldItem)
            return null;

        var relType = this.createRelTypes();

        var equalID = fieldItem.alias + '_equal';
        var valueID = fieldItem.alias + '_value';
        return (
            <div className='layerFitlerItem'>
                <div className='fName'>{fieldItem.alias}</div>
                <div className='fEqual'>
                    <select id={equalID}>
                        {this.createEquals(fieldItem.type)}
                    </select>
                </div>
                <div className='fValue'>
                    <input type='text' id={valueID} />
                </div>
                {relType}
            </div>
        );
    }
    render() {
        return this.createFilterItem(this.props.fieldItem);
    }
};

class MapMouseXYPanel extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        this.listenEvent();
    }
    listenEvent() {
        var _this = this;
        require([
            "dojo/_base/declare",
            "esri/map",
            "dojo/domReady!"
        ], function (
            declare, Map) {
                var map = _this.props.mapControl.map;
                map.on("mouse-move", function (e) {
                    var text = '经度: ' + e.mapPoint.x.toFixed(8) + '  纬度: ' + e.mapPoint.y.toFixed(8);
                    $('.xyPanel').html(text);
                });
            });
    }
    render() {
        return (
            <div className='xyPanel'>

            </div>
        );
    }
};