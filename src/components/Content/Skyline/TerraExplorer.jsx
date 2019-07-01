var sgWorld = null;
var GPS = {
    PI: 3.14159265358979324,
    x_pi: 3.14159265358979324 * 3000.0 / 180.0,
    delta: function (lat, lon) {
        // Krasovsky 1940
        //
        // a = 6378245.0, 1/f = 298.3
        // b = a * (1 - f)
        // ee = (a^2 - b^2) / a^2;
        var a = 6378245.0; //  a: 卫星椭球坐标投影到平面地图坐标系的投影因子。
        var ee = 0.00669342162296594323; //  ee: 椭球的偏心率。
        var dLat = this.transformLat(lon - 105.0, lat - 35.0);
        var dLon = this.transformLon(lon - 105.0, lat - 35.0);
        var radLat = lat / 180.0 * this.PI;
        var magic = Math.sin(radLat);
        magic = 1 - ee * magic * magic;
        var sqrtMagic = Math.sqrt(magic);
        dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * this.PI);
        dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * this.PI);
        return { 'lat': dLat, 'lon': dLon };
    },

    //WGS-84 to GCJ-02
    gcj_encrypt: function (wgsLat, wgsLon) {
        if (this.outOfChina(wgsLat, wgsLon))
            return { 'lat': wgsLat, 'lon': wgsLon };

        var d = this.delta(wgsLat, wgsLon);
        return { 'lat': wgsLat + d.lat, 'lon': wgsLon + d.lon };
    },
    //GCJ-02 to WGS-84
    gcj_decrypt: function (gcjLat, gcjLon) {
        if (this.outOfChina(gcjLat, gcjLon))
            return { 'lat': gcjLat, 'lon': gcjLon };

        var d = this.delta(gcjLat, gcjLon);
        return { 'lat': gcjLat - d.lat, 'lon': gcjLon - d.lon };
    },
    //GCJ-02 to WGS-84 exactly
    gcj_decrypt_exact: function (gcjLat, gcjLon) {
        var initDelta = 0.01;
        var threshold = 0.000000001;
        var dLat = initDelta, dLon = initDelta;
        var mLat = gcjLat - dLat, mLon = gcjLon - dLon;
        var pLat = gcjLat + dLat, pLon = gcjLon + dLon;
        var wgsLat, wgsLon, i = 0;
        while (1) {
            wgsLat = (mLat + pLat) / 2;
            wgsLon = (mLon + pLon) / 2;
            var tmp = this.gcj_encrypt(wgsLat, wgsLon)
            dLat = tmp.lat - gcjLat;
            dLon = tmp.lon - gcjLon;
            if ((Math.abs(dLat) < threshold) && (Math.abs(dLon) < threshold))
                break;

            if (dLat > 0) pLat = wgsLat; else mLat = wgsLat;
            if (dLon > 0) pLon = wgsLon; else mLon = wgsLon;

            if (++i > 10000) break;
        }
        //console.log(i);
        return { 'lat': wgsLat, 'lon': wgsLon };
    },
    //GCJ-02 to BD-09
    bd_encrypt: function (gcjLat, gcjLon) {
        var x = gcjLon, y = gcjLat;
        var z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * this.x_pi);
        var theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * this.x_pi);
        var bdLon = z * Math.cos(theta) + 0.0065;
        var bdLat = z * Math.sin(theta) + 0.006;
        return { 'lat': bdLat, 'lon': bdLon };
    },
    //BD-09 to GCJ-02
    bd_decrypt: function (bdLat, bdLon) {
        var x = bdLon - 0.0065, y = bdLat - 0.006;
        var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * this.x_pi);
        var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * this.x_pi);
        var gcjLon = z * Math.cos(theta);
        var gcjLat = z * Math.sin(theta);
        return { 'lat': gcjLat, 'lon': gcjLon };
    },
    //WGS-84 to Web mercator
    //mercatorLat -> y mercatorLon -> x
    mercator_encrypt: function (wgsLat, wgsLon) {
        var x = wgsLon * 20037508.34 / 180.;
        var y = Math.log(Math.tan((90. + wgsLat) * this.PI / 360.)) / (this.PI / 180.);
        y = y * 20037508.34 / 180.;
        return { 'lat': y, 'lon': x };
        /*
        if ((Math.abs(wgsLon) > 180 || Math.abs(wgsLat) > 90))
            return null;
        var x = 6378137.0 * wgsLon * 0.017453292519943295;
        var a = wgsLat * 0.017453292519943295;
        var y = 3189068.5 * Math.log((1.0 + Math.sin(a)) / (1.0 - Math.sin(a)));
        return {'lat' : y, 'lon' : x};
        //*/
    },
    // Web mercator to WGS-84
    // mercatorLat -> y mercatorLon -> x
    mercator_decrypt: function (mercatorLat, mercatorLon) {
        var x = mercatorLon / 20037508.34 * 180.;
        var y = mercatorLat / 20037508.34 * 180.;
        y = 180 / this.PI * (2 * Math.atan(Math.exp(y * this.PI / 180.)) - this.PI / 2);
        return { 'lat': y, 'lon': x };
        /*
        if (Math.abs(mercatorLon) < 180 && Math.abs(mercatorLat) < 90)
            return null;
        if ((Math.abs(mercatorLon) > 20037508.3427892) || (Math.abs(mercatorLat) > 20037508.3427892))
            return null;
        var a = mercatorLon / 6378137.0 * 57.295779513082323;
        var x = a - (Math.floor(((a + 180.0) / 360.0)) * 360.0);
        var y = (1.5707963267948966 - (2.0 * Math.atan(Math.exp((-1.0 * mercatorLat) / 6378137.0)))) * 57.295779513082323;
        return {'lat' : y, 'lon' : x};
        //*/
    },
    // two point's distance
    distance: function (latA, lonA, latB, lonB) {
        var earthR = 6371000.;
        var x = Math.cos(latA * this.PI / 180.) * Math.cos(latB * this.PI / 180.) * Math.cos((lonA - lonB) * this.PI / 180);
        var y = Math.sin(latA * this.PI / 180.) * Math.sin(latB * this.PI / 180.);
        var s = x + y;
        if (s > 1) s = 1;
        if (s < -1) s = -1;
        var alpha = Math.acos(s);
        var distance = alpha * earthR;
        return distance;
    },
    outOfChina: function (lat, lon) {
        if (lon < 72.004 || lon > 137.8347)
            return true;
        if (lat < 0.8293 || lat > 55.8271)
            return true;
        return false;
    },
    transformLat: function (x, y) {
        var ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
        ret += (20.0 * Math.sin(6.0 * x * this.PI) + 20.0 * Math.sin(2.0 * x * this.PI)) * 2.0 / 3.0;
        ret += (20.0 * Math.sin(y * this.PI) + 40.0 * Math.sin(y / 3.0 * this.PI)) * 2.0 / 3.0;
        ret += (160.0 * Math.sin(y / 12.0 * this.PI) + 320 * Math.sin(y * this.PI / 30.0)) * 2.0 / 3.0;
        return ret;
    },
    transformLon: function (x, y) {
        var ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
        ret += (20.0 * Math.sin(6.0 * x * this.PI) + 20.0 * Math.sin(2.0 * x * this.PI)) * 2.0 / 3.0;
        ret += (20.0 * Math.sin(x * this.PI) + 40.0 * Math.sin(x / 3.0 * this.PI)) * 2.0 / 3.0;
        ret += (150.0 * Math.sin(x / 12.0 * this.PI) + 300.0 * Math.sin(x / 30.0 * this.PI)) * 2.0 / 3.0;
        return ret;
    }
};
var sgWorldContext = {
    default: null,
    selectedFeature: null,
    extension: {
        cordinate: {
            createWGS84: function () {
                return sgWorld.CoordServices.CreateCoordinateSystem("GEOGCS[‘WGS84 Coordinate System‘,DATUM[‘WGS 1984‘,SPHEROID[‘WGS1984‘,6378137,298.257223563],TOWGS84[0,0,0,0,0,0,0],AUTHORITY[‘EPSG‘,‘6326‘]],PRIMEM[‘Greenwich‘,0],UNIT[‘degree‘,0.0174532925199433],AUTHORITY[‘EPSG‘,‘4326‘],AUTHORITY[‘SBMG‘,‘LAT-LONG,LAT-LONG,WGS84,METERS‘]]");
            },
            toBaiDu: function (x, y) {
                var wgs84 = sgWorldContext.extension.cordinate.toWGS84(x, y);
                var google = GPS.gcj_encrypt(wgs84.Y, wgs84.X);
                var baidu = GPS.bd_encrypt(google['lat'], google['lon']);
                return {
                    X: baidu['lon'],
                    Y: baidu['lat']
                };
            },
            toWGS84: function (x, y) {
                var wgs = sgWorldContext.extension.cordinate.createWGS84();
                var orgin = sgWorld.CoordServices.SourceCoordinateSystem;
                var result = sgWorld.CoordServices.Reproject(orgin, wgs, x, y);
                return result;
            },
            wgs84ToCurrent: function (x, y) {
                var wgs = sgWorldContext.extension.cordinate.createWGS84();
                var orgin = sgWorld.CoordServices.SourceCoordinateSystem;
                var result = sgWorld.CoordServices.Reproject(wgs, orgin, x, y);
                return result;
            }
        }
    }

};
function getRootPath() {
    if (esp && esp.url)
        return esp.url;

    var pathName = window.location.pathname.substring(1);
    var webName = pathName == '' ? '' : pathName.substring(0, pathName.indexOf('/'));
    return window.location.protocol + '//' + window.location.host + '/' + webName + '/';
}
function SGWorldFactory(_sgWorld) {
    this._sgWorld = _sgWorld;
    this.findOrCreateGroup = function (path) {
        var id = this._sgWorld.ProjectTree.FindItem(path);
        if (id && this._sgWorld.ProjectTree.IsGroup(id))
            return id;

        return this.createGroup(path);
    }

    this.findGroup = function (groupName, parentID) {
        var projectTree = this._sgWorld.ProjectTree;
        var itemID = projectTree.GetNextItem(parentID, 11);
        while (itemID) {
            if (projectTree.IsGroup(itemID)) {
                var name = projectTree.GetItemName(itemID);
                if (name == groupName) {
                    return itemID;
                }
            }
            itemID = projectTree.GetNextItem(itemID, 13);
        }
        return '';
    }

    this.createGroup = function (fullPath) {
        var projectTree = this._sgWorld.ProjectTree;

        var group = '';
        if (!fullPath)
            return group;

        var groupNames = fullPath.split('\\');
        for (var i = 0; i < groupNames.length; i++) {
            var item = groupNames[i];
            var currentGroupID = this.findGroup(item, group);
            if (!currentGroupID)
                currentGroupID = projectTree.CreateGroup(item, group);
            group = currentGroupID;
        }
        return group;
    }

    this.reCreateGroup = function (path) {
        var projectTree = this._sgWorld.ProjectTree;
        var id = projectTree.FindItem(path);
        if (id && projectTree.IsGroup(id))
            projectTree.DeleteItem(id);

        return this.findOrCreateGroup(path);
    }
}

class TerraWindow extends React.Component {
    constructor(props) {
        super(props);
        sgWorldContext.default = this;
    }
    componentDidMount() {
        var queryUrl = JSON.parse(this.props.config.Parmeters).addressQueryUrl || (getRootPath() + 'api/Map/QueryPoi');

        var tabs = [
            {
                header: '首页',
                tabItem: null
            }, {
                header: '图层管理',
                tabItem: <TerraExplorerTree />
            }, {
                header: '信息查询',
                tabItem: <SearchBar queryUrl={queryUrl}/>
            }
        ];
        this.setState({
            tabs: tabs,
            selectedTabItem: tabs[0]
        });
        esp.addMsgListener(function (msg) {
            if (!msg || msg.messageType != 'flyTo')
                return;
            var xyz = msg.message.split(' ');
            var x = parseFloat(xyz[0]);
            var y = parseFloat(xyz[1]);
            var z = xyz.length > 2 ? parseFloat(xyz[2]) : 1000;
            var position = sgWorld.Creator.CreatePosition(x, y, z, 0, 0, -90, 0, 400);
            sgWorld.Navigate.FlyTo(position);
        });
    }

    onLoadFinished(sender, state) {
        if (!state)
            return;

        this.terraExplorer = sender;
        this.setState({
            loaded: true
        });

        this.showWindow({
            header: '首页',
            tabItem: <FavoratePOI />
        });
    }

    tabItemClick(item) {
        this.setState({
            selectedTabItem: item
        });
    }
    executeCommand(commandID) {
        switch (commandID) {
            case 'search':
                this.showWindow({
                    header: '信息查询'
                });
                break;
            case 'infoTree':
                this.showWindow({
                    header: '图层管理'
                });
                break;
            case 'streetmap':
                if (!this.streeMapOpened) {
                    var worldInfo = sgWorld.Window.CenterPixelToWorld();
                    var carema = sgWorld.Navigate.GetPosition();
                    var url = '../UIService/Resource/StreetMap/Baidu/index.html?x=' + worldInfo.Position.X + '&y=' + worldInfo.Position.Y + '&heading=' + carema.Yaw + '&pitch=' + carema.Pitch;
                    this.terraExplorer.showTwoScreen(<StreetMap url={url} onLoaded={this.onStreeMapLoaded.bind(this)}/>);
                }
                else {
                    if (this.onLButtonDown) {
                        sgWorld.DetachEvent('OnLButtonDown', this.onLButtonDown);
                        this.onLButtonDown = null;
                    }
                    this.terraExplorer.hideTwoScreen();
                }
                this.streeMapOpened = !this.streeMapOpened;
                break;
            case 'clear':
                this.clear();
                break;
            case 'info':
                this.queryTipInfo();
                break;
            case 'zoomIn':
                sgWorld.Navigate.ZoomIn(sgWorld.Navigate.GetPosition().Distance / 5);
                break;
            case 'zoomOut':
                sgWorld.Navigate.ZoomOut(sgWorld.Navigate.GetPosition().Distance / 5);
                break;
            case '2DMap':
                var position = sgWorld.Window.CenterPixelToWorld(-1).Position;
                position.Yaw = 0;
                position.Pitch = -90;
                position.Roll = 0;
                position.Altitude = 2000;
                sgWorld.Navigate.FlyTo(position);
                break;
            case 'H_Distance':
                sgWorld.Command.Execute(1034, 0);
                break;
            case 'V_Distance':
                sgWorld.Command.Execute(1036, 0);
                break;
            case 'A_Distance':
                sgWorld.Command.Execute(1035, 0);
                break;
            case 'Area':
                sgWorld.Command.Execute(1165, 0);
                break;
            case 'underground':
                sgWorld.Command.Execute(1027, 0);
                break;
            case 'exitFrame':
                break;

            default:
        }
    }
    onStreeMapLoaded(sender) {
        this.streetMap = sender;
        this.onLButtonDown = function (Flags, X, Y) {
            var worldInfo = sgWorld.Window.CenterPixelToWorld();
            var carema = sgWorld.Navigate.GetPosition();
            sender.goTo(worldInfo.Position.X, worldInfo.Position.Y, carema.Yaw, carema.Pitch);
            return false;
        };
        sgWorld.AttachEvent('OnLButtonDown', this.onLButtonDown);
    }
    clear() {
        if (sgWorldContext.selectedFeature) {
            sgWorldContext.selectedFeature.Tint = sgWorld.Creator.CreateColor(255, 255, 255, 0);
            sgWorldContext.selectedFeature = null;
        }
        if (this.onLButtonDown) {
            sgWorld.DetachEvent('OnLButtonDown', this.onLButtonDown);
            this.onLButtonDown = null;
        }
        this.showWindow({
            header: '首页',
            tabItem: <FavoratePOI />
        });
    }
    queryTipInfo() {
        this.clear();
        var mapping = [
            { engField: 'WTDH', chField: '物探点号', unit: '' },
            { engField: 'GDGC', chField: '管点高程', unit: '米' },
            { engField: 'DTZ', chField: '点特征', unit: '' },
            { engField: 'PMHZB', chField: '平面横坐标', unit: '米' },
            { engField: 'PMZZB', chField: '平面纵坐标', unit: '米' },
            { engField: 'Yaw', chField: '水平旋转', unit: '度' },
            { engField: 'Pitch', chField: '垂直翻转', unit: '度' },
            { engField: 'Roll', chField: '中轴旋转', unit: '度' },
            { engField: 'ScaleX', chField: 'X方向缩放', unit: '' },
            { engField: 'ScaleY', chField: 'Y方向缩放', unit: '' },
            { engField: 'ScaleZ', chField: 'Z方向缩放', unit: '' },
            { engField: 'FileName', chField: '模型文件', unit: '' },
            { engField: 'GXBH', chField: '管线编码', unit: '' },
            { engField: 'QDDH', chField: '起点点号', unit: '' },
            { engField: 'QDGC', chField: '起点高程', unit: '米' },
            { engField: 'QDHZB', chField: '起点横坐标', unit: '米' },
            { engField: 'QDZZB', chField: '起点纵坐标', unit: '米' },
            { engField: 'ZDDH', chField: '终点点号', unit: '' },
            { engField: 'ZDGC', chField: '终点高程', unit: '米' },
            { engField: 'ZDDZB', chField: '终点横坐标', unit: '米' },
            { engField: 'ZDZZB', chField: '终点纵坐标', unit: '米' },
            { engField: 'GJ', chField: '管径', unit: '米' },
            { engField: 'GC', chField: '管长', unit: '米' },
            { engField: 'CZ', chField: '材质', unit: '' },
            { engField: 'MSFS', chField: '埋设方式', unit: '' },
            { engField: 'DLM', chField: '道路名', unit: '' },
            { engField: 'QSDWM', chField: '权属单位名', unit: '' },
            { engField: 'WTDH', chField: '物探点号', unit: '' },
            { engField: 'JDGC', chField: '井底高程', unit: '米' },
            { engField: 'FSW', chField: '附属物', unit: '' },
            { engField: 'DMGC', chField: '地面高程', unit: '米' },
            { engField: 'JS', chField: '井深', unit: '米' },
            { engField: 'PMHZB', chField: '平面横坐标', unit: '米' },
            { engField: 'PMZZB', chField: '平面纵坐标', unit: '米' }
        ];
        var _this = this;
        var filterFields = function (layerID, fieldName, value) {
            for (var i = 0; i < mapping.length; i++) {
                var map = mapping[i];
                if (map.engField.toLowerCase() == fieldName.toLowerCase()) {
                    if (typeof (value) == typeof (1.2)) {
                        value = Math.round(value * 10000) / 10000
                    }
                    return {
                        name: map.chField,
                        value: value,
                        unit: map.unit
                    };
                }
            }
            return {
                name: fieldName + ':',
                value: value,
                unit: ''
            };
        }
        this.onLButtonDown = function (Flags, X, Y) {
            var worldInfo = sgWorld.Window.PixelToWorld(X, Y);
            if (worldInfo && worldInfo.ObjectID) {
                var target = sgWorld.Creator.GetObject(worldInfo.ObjectID);
                var type = target.ObjectType;
                if (type == 33) {
                    var attributes = target.FeatureAttributes;
                    var properties = [];
                    if (sgWorldContext.selectedFeature) {
                        sgWorldContext.selectedFeature.Tint = sgWorld.Creator.CreateColor(255, 255, 255, 0);;
                    }
                    sgWorldContext.selectedFeature = target;
                    sgWorldContext.selectedFeature.Tint = sgWorld.Creator.CreateColor(224, 211, 21, 200);
                    for (var i = 0; i < attributes.Count; i++) {
                        var attribute = attributes.Item(i);
                        var field = filterFields(target.LayerID, attribute.Name, attribute.Value);
                        if (field) {
                            properties.push({
                                name: field.name,
                                value: field.value,
                                unit: ''
                            });
                        }
                    }
                    _this.showWindow({
                        header: '属性信息',
                        tabItem: <PropertyInfo dataSource={properties} />
                    });
                }
            }

            return false;
        };
        sgWorld.AttachEvent('OnLButtonDown', this.onLButtonDown);
    }
    createToolbarItems() {
        var items = [
            {
                toolTip: '搜索',
                icon: 'Images/search.png',
                groupName: 'leftGroup',
                commandID: 'search'
            },
            {
                toolTip: '图层树',
                groupName: 'leftGroup',
                icon: 'Images/layer.png',
                commandID: 'infoTree'
            },
            {
                toolTip: '信息查询',
                icon: 'Images/info.png',
                commandID: 'info'
            },
            {
                toolTip: '街景',
                icon: 'Images/streetMap.png',
                commandID: 'streetmap'
            },
            {
                toolTip: '放大',
                icon: 'Images/zoom_in.png',
                commandID: 'zoomIn'
            },
            {
                toolTip: '缩小',
                icon: 'Images/zoom_out.png',
                commandID: 'zoomOut'
            },
            {
                toolTip: '二维地图',
                icon: 'Images/map2D.png',
                commandID: '2DMap'
            },
            {
                toolTip: '水平距离',
                icon: 'Images/水平距离.png',
                commandID: 'H_Distance'
            },
            {
                toolTip: '垂直距离',
                icon: 'Images/垂直距离.png',
                commandID: 'V_Distance'
            },
            {
                toolTip: '空间距离',
                icon: 'Images/空间距离.png',
                commandID: 'A_Distance'
            },
            {
                toolTip: '面积测量',
                icon: 'Images/面积.png',
                commandID: 'Area'
            },
            {
                toolTip: '地下模式',
                icon: 'Images/bottom.png',
                commandID: 'underground'
            },
            {
                toolTip: '清空',
                icon: 'Images/clear.png',
                commandID: 'clear'
            }
        ];
        var _this = this;
        return items.map(function (item) {
            var toolbarItem = (
                <div onClick={_this.executeCommand.bind(_this, item.commandID)} title={item.toolTip} style={{ backgroundImage: 'url(' + getRootPath() + item.icon + ')' }}>

                </div>
            );
            return toolbarItem;
        });
    }
    showWindow(window) {
        var tabs = this.state.tabs;
        var selectedTabItem = this.state.selectedTabItem;
        for (var index = 0; index < tabs.length; index++) {
            var tab = tabs[index];
            if (window.header == tab.header) {
                if (window.tabItem && window.tabItem != tab.tabItem)
                    tab.tabItem = window.tabItem;
                this.setState({
                    selectedTabItem: tab
                });
                return;
            }
        }

        tabs.push(window);
        this.setState({
            tabs: tabs,
            selectedTabItem: window
        });
    }
    createTabs() {
        if (!this.state || !this.state.tabs)
            return null;
        var selectedItem = this.state.selectedTabItem;
        var tabHeaders = this.state.tabs.map(item => {
            var className = selectedItem.header == item.header ? 'selected' : null;
            return (
                <div onClick={this.tabItemClick.bind(this, item)} className={className}>
                    {item.header}
                </div>
            );
        });
        var tabItems = this.state.tabs.map(item => {
            var className = selectedItem.header == item.header ? 'selected' : null;
            return (
                <div id={item.header} className={className}>
                    {className ? item.tabItem : null}
                </div>
            );
        });

        return (
            <div className='tabs'>
                <div className='headers'>
                    {tabHeaders}
                </div>
                <div className='items'>
                    {tabItems}
                </div>
            </div>
        );
    }
    render() {
        var flyFile = JSON.parse(this.props.config.Parmeters).fly;

        return (
            <div className='teWindow'>
                {this.createTabs()}
                <div className='content'>
                    {
                        this.state && this.state.loaded ? null : <span>三维地理信息平台采用ActiveX组件，请采用IE内核浏览器打开</span>
                    }
                    <TerraExplorer onLoadFinished={this.onLoadFinished.bind(this)} flyFile={flyFile}/>
                </div>
                <div className='toolbar'>
                    {this.createToolbarItems()}
                </div>
            </div>
        );
    }

}

class HomeWindow extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className='home'>
                <FavoratePOI />
            </div>
        );
    }
}

class TerraExplorer extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        var fileName = this.props.flyFile;

        this.init3D('sgWindow', fileName);
    }
    init3D(containerID, flyFile) {
        var _this = this;
        try {
            var container = window.document.getElementById(containerID);
            var sgWindow = this.createSGWindow();
            container.appendChild(sgWindow);
            setTimeout(function () {
                _this.openFly(flyFile);
            }, 500);
        }
        catch (e) {
        }
    }
    openFly(flyFile) {
        var _this = this;
        sgWorld = this.createSGWorld();
        sgWorld.AttachEvent('OnLoadFinished', function (state) {
            setTimeout(function () {
                if (_this.props.onLoadFinished)
                    _this.props.onLoadFinished(_this, state);
            }, 500);
        });
        sgWorld.Open(flyFile);
    }
    createSGWorld() {
        try {
            var obj = window.document.getElementById("SGWorld");
            if (obj == null) {
                obj = TerraExplorer3DWindow.CreateInstance("{3a4f919a-65a8-11d5-85c1-0001023952c1}");
            }
            return obj;
        }
        catch (e) {
        }
    }
    createSGWindow() {
        try {
            var obj = window.document.getElementById("TerraExplorer3DWindow");
            if (obj == null) {
                obj = document.createElement('object');
                obj.name = "TerraExplorer3DWindow";
                obj.id = "TerraExplorer3DWindow";
                obj.style.width = "100%";
                obj.style.height = "100%";
                obj.classid = "CLSID:3a4f9196-65a8-11d5-85c1-0001023952c1";
                obj.style.zIndex = -10000;
            }
            return obj;
        }
        catch (e) {
        }
    }
    showTwoScreen(otherContent) {
        this.setState({
            twoScreen: true,
            otherContent: otherContent
        });
    }
    hideTwoScreen() {
        this.setState({
            twoScreen: false,
            otherContent: null
        });
    }
    render() {
        var twoScreen = this.state && this.state.twoScreen == true;
        var leftStyle = {
            width: twoScreen ? '50%' : '100%'
        };
        var rightStyle = {
            width: twoScreen ? '50%' : '0px',
            display: twoScreen ? 'inline' : 'none'
        };
        return (
            <div className='sgContainer'>
                <div className='left' style={leftStyle}>
                    <div id='sgWindow'>

                    </div>
                </div>
                <div className='right' style={rightStyle}>
                    {twoScreen ? this.state.otherContent : null}
                </div>
            </div>
        );
    }
}
class TerraExplorerTree extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        this.initProjectTree();
    }
    initProjectTree() {
        var _this = this;
        var projecttree = window.document.getElementById("sgWindowInfoTree");
        var obj2 = this.createProjectTree();
        projecttree.appendChild(obj2);
        setTimeout(function () {
            TerraExplorerInformationWindow.AttachTo3dWindow(TerraExplorer3DWindow);
            sgWorld.SetParam(9893, 0);
        }, 500);
    }
    createProjectTree() {
        try {
            var obj = window.document.getElementById("TerraExplorerInformationWindow");
            if (obj == null) {
                obj = document.createElement('object');
                obj.name = "TerraExplorerInformationWindow";
                obj.id = "TerraExplorerInformationWindow";
                obj.style.width = "100%";
                obj.style.height = "100%";
                obj.classid = "clsid:3a4f919b-65a8-11d5-85c1-0001023952c1";
            }
            return obj;
        }
        catch (e) {
        }
    }
    render() {
        return (
            <div id='sgWindowInfoTree' className='popup'>
            </div>
        );
    }
}
class SearchBar extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
    }
    search(pageIndex) {
        var keywords = $('#searchInput').val();
        if (!keywords)
            return;

        var data = {
            keywords: keywords,
            pageIndex: pageIndex,
            pageSize: 10
        };
        var _this = this;
        $('.popupTip').show();
        var queryUrl = this.props.queryUrl;
        $.ajax({
            url: queryUrl,
            data: data,
            type: 'post',
            success: function (result) {
                $('.popupTip').hide();
                _this.setState({
                    pageIndex: pageIndex,
                    searchResult: result
                });
                _this.createPoiIcons(result.Result);
            },
            error: function (e) {
                $('.popupTip').hide();
                _this.setState({
                    pageIndex: 1,
                    searchResult: null
                });
            }
        });
    }
    createPoiIcons(poiItems) {
        var factory = new SGWorldFactory(sgWorld);
        var id = factory.reCreateGroup('临时图层\\地名地址');
        var image = getRootPath() + '/Images/poi.png';
        for (var index = 0; index < poiItems.length; index++) {
            var item = poiItems[index];
            var position = sgWorld.Creator.CreatePosition(item.X, item.Y, 100, 0, 0, 0, 0, 1000);
            var labelStyle = sgWorld.Creator.CreateLabelStyle(0);
            sgWorld.Creator.CreateImageLabel(position, image, labelStyle, id, item.Name);
        }

    }
    flyTo(item) {
        var position = sgWorld.Creator.CreatePosition(item.X, item.Y, 1000, 0, 0, 0, 0, 3000);
        sgWorld.Navigate.FlyTo(position);
    }
    pageChanged(sender, pageIndex) {
        if (pageIndex <= 0)
            pageIndex = 1;
        else if (pageIndex)
            this.search(pageIndex);
    }
    createSearchTipPanel() {
        return (
            <div>
                搜索
            </div>
        );
    }
    createSearchResult() {
        if (!this.state || !this.state.searchResult)
            return null;

        var searchResult = this.state.searchResult;
        var totalCount = searchResult.TotalCount;
        if (totalCount == 0)
            return null;

        var pageIndex = this.state.pageIndex;
        var _this = this;

        var icon = 'url(' + getRootPath() + 'Images/poi.png' + ')';
        var items = searchResult.Result.map(function (item) {
            return (
                <div className='item' onClick={_this.flyTo.bind(_this, item)}>
                    <div></div>
                    <span>
                        {item.Name}
                    </span>
                </div>
            );
        });
        return (
            <div className='result'>
                <div>
                    为您搜索到<span>{totalCount}</span>条记录
                </div>
                {items}
                <PageNavigation pageIndex={pageIndex} pageSize={10} totalCount={totalCount} pageChanged={this.pageChanged.bind(this)} />
            </div>
        );

    }
    render() {
        return (
            <div id='searchBar'>
                <div className='panel'>
                    <input id='searchInput' placeholder='请输入地名搜索..' />
                    <div className='button' onClick={this.search.bind(this, 1)}>搜索</div>

                    {this.createSearchResult()}
                </div>
                <div className='popupTip'>
                    <div></div>
                    <div>
                        正在搜索，请稍后..
                    </div>
                </div>
            </div>
        );
    }
}

class FavoratePOI extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        var items = [
            {
                name: '拙政园',
                toolTip: '拙政园',
                data: '演示试点\\拙政园3'
            },
            {
                name: '尚雅苑',
                toolTip: '尚雅苑',
                data: '热点定位\\尚雅苑'
            },
            {
                name: '狮子林',
                toolTip: '狮子林',
                data: '演示试点\\狮子林2'
            },
            {
                name: '太平天国忠王府',
                toolTip: '太平天国忠王府',
                data: '演示试点\\太平天国忠王府'
            },
            {
                name: '苏州博物馆',
                toolTip: '苏州博物馆',
                data: '演示试点\\苏州博物馆'
            },
            {
                name: '北寺塔',
                toolTip: '北寺塔',
                data: '演示试点\\北寺塔2'
            },
            {
                name: '双塔',
                toolTip: '双塔',
                data: '演示试点\\双塔'
            },
            {
                name: '寒山寺',
                toolTip: '寒山寺',
                data: '演示试点\\寒山寺'
            },
            {
                name: '虎丘景区',
                toolTip: '虎丘景区',
                data: '演示试点\\虎丘景区'
            },
            {
                name: '北寺塔',
                toolTip: '北寺塔',
                data: '演示试点\\北寺塔2'
            },
            {
                name: '双塔',
                toolTip: '双塔',
                data: '演示试点\\双塔'
            },
            {
                name: '寒山寺',
                toolTip: '寒山寺',
                data: '演示试点\\寒山寺'
            },
            {
                name: '虎丘景区',
                toolTip: '虎丘景区',
                data: '演示试点\\虎丘景区'
            },
            {
                name: '北寺塔',
                toolTip: '北寺塔',
                data: '演示试点\\北寺塔2'
            },
            {
                name: '双塔',
                toolTip: '双塔',
                data: '演示试点\\双塔'
            },
            {
                name: '寒山寺',
                toolTip: '寒山寺',
                data: '演示试点\\寒山寺'
            },
            {
                name: '虎丘景区',
                toolTip: '虎丘景区',
                data: '演示试点\\虎丘景区'
            },
            {
                name: '盘门景区',
                toolTip: '盘门景区',
                data: '演示试点\\盘门景区3'
            },
            {
                name: '平江路',
                toolTip: '平江路',
                data: '演示试点\\平江路'
            },
            {
                name: '七里山塘',
                toolTip: '七里山塘',
                data: '演示试点\\七里山塘'
            },
            {
                name: '观前街',
                toolTip: '观前街',
                data: '演示试点\\观前街'
            },
            {
                name: '苏州漫游',
                toolTip: '苏州漫游',
                data: '演示路径\\场景漫游',
                type: 'path'
            },
            {
                name: '观前街',
                toolTip: '观前街',
                data: '演示路径\\观前街',
                type: 'path'
            }
        ];
        this.setState({
            items: items
        });
    }

    getIcon(item) {
        var image = 'poi.png';
        var projectTreeItemsIcon = [
            {
                objectType: 34,
                icon: 'route.png'
            }
        ]

        switch (item.type) {
            case 'path':
                if (!item.data)
                    return null;
                var id = sgWorld.ProjectTree.FindItem(item.data);
                if (!id)
                    return null;
                var target = sgWorld.Creator.GetObject(id);
                if (!target)
                    return null;

                for (var index = 0; index < projectTreeItemsIcon.length; index++) {
                    var itemIcon = projectTreeItemsIcon[index];
                    if (itemIcon.objectType == target.ObjectType) {
                        image = itemIcon.icon;
                        break;
                    }
                }
                break;
            case 'overView':
                image = '全景.png';
                break;
            default:
        }
        return 'url(' + getRootPath() + 'Images/' + image + ')';
    }
    flyTo(item) {
        if (item.type == 'overView') {
            sgWorldContext.default.showPopupFrame(JSON.parse(item.data));
        }
        else {
            if (!item.data)
                return;
            var id = sgWorld.ProjectTree.FindItem(item.data);
            if (!id)
                return;

            var target = sgWorld.Creator.GetObject(id);
            if (!target)
                return;

            if (target.ObjectType == 34) {
                target.Play(1);
            }
            else
                sgWorld.Navigate.FlyTo(id);
        }
    }
    createItems() {
        if (!this.state || !this.state.items)
            return null;

        var count = this.state.items.length;
        if (count == 0)
            return null;

        var _this = this;
        var items = this.state.items.map(function (item) {
            var img = _this.getIcon(item);
            var toolTip = item.toolTip || item.name;
            var dom = (
                <div>
                    <div className='icon' style={{ backgroundImage: img }} title={item.type}>
                    </div>
                    <div className='text' title={toolTip} onClick={_this.flyTo.bind(_this, item)}>
                        {item.name}
                    </div>
                </div>
            );
            return dom;
        });

        return items;
    }
    render() {
        if (!sgWorld)
            return null;
        return (
            <div className='favorate'>
                <div className='title'>
                    城市地标
                </div>
                <div className='items'>
                    {this.createItems()}
                </div>
            </div>
        );
    }
}

class PageNavigation extends React.Component {
    constructor(props) {
        super(props);
        this.pageSize = this.props.pageSize;//每页显示的记录条数
        this.totalCount = this.props.totalCount;//总计记录条数

        //计算总计页数
        this.pageCount = this.totalCount % this.pageSize == 0 ? this.totalCount / this.pageSize : parseInt(this.totalCount / this.pageSize) + 1;
        this.state = {
            pageIndex: this.props.pageIndex || 1
        }
    }
    componentDidMount() {
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.pageIndex) {
            this.setState({
                pageIndex: nextProps.pageIndex
            });
        }
    }
    createFirstPage() {
        if (!this.state)
            return null;

        //当前页数
        var pageIndex = this.props.pageIndex;
        if (!pageIndex || pageIndex <= 1)
            return null;

        return (<div onClick={this.onPageChanged.bind(this, 1)}> 首页</div>);
    }
    createLastPage() {
        //当前页数
        var pageIndex = this.props.pageIndex;
        if (!pageIndex || pageIndex >= this.pageCount)
            return null;

        return (<div onClick={this.onPageChanged.bind(this, this.pageCount)}>尾页</div>);
    }
    createPreviousPage() {
        //当前页数
        var pageIndex = this.props.pageIndex;
        if (!pageIndex || pageIndex <= 1)
            return null;

        return (<div onClick={this.onPageChanged.bind(this, pageIndex - 1)}>前页</div>);
    }
    createNextPage() {
        //当前页数
        var pageIndex = this.props.pageIndex;
        if (!pageIndex || pageIndex >= this.pageCount)
            return null;

        return (<div onClick={this.onPageChanged.bind(this, pageIndex + 1)}>后页</div>);
    }
    isInteger(x) {
        return (typeof x === 'number') && (x % 1 === 0);
    }
    handleChange(event) {
        var value = parseInt(event.target.value);
        if (this.isInteger(value)) {
            this.setState({
                pageIndex: value
            });
        }
    }
    inputKeyPress(event) {
        if (event.key == 'Enter') {
            this.onPageChanged(parseInt(event.target.value));
        }
    }
    onPageChanged(pageIndex) {
        if (!this.isInteger(pageIndex))
            pageIndex = 1;
        if (pageIndex <= 0)
            pageIndex = 1;
        else if (pageIndex > this.pageCount)
            pageIndex = this.pageCount;

        if (this.props.pageChanged)
            this.props.pageChanged(this, pageIndex);
    }
    render() {
        if (!this.state)
            return null;

        var pageIndex = this.state.pageIndex;
        var pageCount = this.pageCount;
        return (
            <div className='page'>
                {this.createFirstPage()}
                {this.createPreviousPage()}
                <input value={pageIndex} onChange={this.handleChange.bind(this)} onKeyPress={this.inputKeyPress.bind(this)} />
                {this.createNextPage()}
                {this.createLastPage()}
                <div>总计：{pageCount} 页</div>
            </div>
        );
    }
}

class TerraIntroInfo extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div>
            </div>
        );
    }
}

class TerraHomePage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            navTab: 0
        }
    }
    select() {
        $(".HTerraRSShare-content div").click(function () {
            $(this).siblings('div').removeClass('selected');  // 删除其他兄弟元素的样式
            $(this).addClass('selected');                   // 添加当前元素的样式
        });
    }
    //点击平台介绍
    threeDClick() {
        this.select();
        this.setState({
            navTab: 0
        })
    };
    //点击平台特点
    shareClick() {
        this.select();
        this.setState({
            navTab: 1
        })
    };
    //点击应用案例
    platformClick() {
        this.select();
        this.setState({
            navTab: 2
        })
    };
    switchComponent() {
        var _this = this;
        var content = null;
        switch (this.state.navTab) {
            case 0:
                content = (<HomePlatformInfoComponent />);
                break;
            case 1:
                content = (<HomePlatformFeatureComponent />);
                break;
            case 2:
                content = (<HomeApplicationCaseComponent />);
                break;
            default:
                content = null;
                break;
        }
        return content
    }
    render() {
        var navStyle1 = {
            position: "relative",
            left: "46%",
            top: "13%"
        }
        var navStyle2 = {
            position: "relative",
            left: "37%",
            top: "15%"
        }
        var navStyle3 = {
            position: "relative",
            left: "28%",
            top: "18%"
        }
        return (
            <div className="HTerraRSShare">

                <div className="HTerraRSShare-content">
                    <div className="HnavStyle1" style={navStyle1} onClick={this.threeDClick.bind(this)}>
                        <img className="HnavImg" src="../Images/skyline/introInfo/三维资源类型_icon.png" />
                        <span className="HnavSpan1">平台介绍</span>
                    </div>
                    <div className="HnavStyle1" style={navStyle2} onClick={this.shareClick.bind(this)}>
                        <img className="HnavImg" src="../Images/skyline/introInfo/共享接入条件_icon.png" />
                        <span className="HnavSpan1">平台特点</span>
                    </div>
                    <div className="HnavStyle2" style={navStyle3} onClick={this.platformClick.bind(this)}>
                        <img className="HnavImg" src="../Images/skyline/introInfo/平台接入_icon.png" />
                        <span className="HnavSpan2">应用案例</span>
                    </div>
                    <div className="HswitchComponent">
                        {this.switchComponent()}
                    </div>
                </div>
            </div>
            )
    }
}
class HomePlatformInfoComponent extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="HthreeDStyle">
                <div className="HthreeDStyle-content1">
                    &nbsp; &nbsp; &nbsp; &nbsp;苏州市三位共享服务平台市苏州市政务空间大数据支撑平台的组成部分，将苏州市重点区域的地上建筑、
                    地面地形通过三维地理信息技术进行了无缝的融合。采用卫星影像、DEM高程、三维建模、金字塔三维场景构建、
                    地理信息、高空全景、城市道路街景等多种技术手段，结合苏州市基础地理信息，实现了苏州市真三维立体化的
                    场景表达方式，能够为城市规划、国土监测、城市应急、消防救援等各种领域提供基础三维地理服务；此外，结
                    合城市人口、房屋、土地、税务、社保等部门专题数据，可以实现“人-地-房”的深度关联，通过三维地理信息
                    技术能够提供更加直观和高效的分析及展示手段。
                </div>
            </div>
        );
    }
}
class HomePlatformFeatureComponent extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="HshareStyle">
                <div className="HshareStyle-text">
                    1.大场景的真三维城市立体化呈现;<br />
                    2.可涵盖地下、地面和地上多维度立体空间要素的一体化展示;<br />
                    3.高效的三维场景浏览技术，提供海量数据的集成和读取能力;<br />
                    4.可实现各类三维数据的共享，为部门业务应用的提升提供技术支撑;<br />
                    5.依托于苏州市政务基础资源平台，可提供可靠的访问能力;<br />
                    6.已经在城市规划、森林防火、城市应急等多个领域提供了三维地理信息支撑;<br />
                </div>
            </div>
        );
    }
}
class HomeApplicationCaseComponent extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="HthreeDStyle">
                <div className="HthreeDStyle-text">
                    <p>
                     (1)森林防火指挥决策
                    </p>
                    <p>
                      (2)规划建设辅助决策
                    </p>
                    <p>
                        (3)苏州应急管理平台
                    </p>
                    <p>
                        (4)气象三维仿真系统
                    </p>
                    <p>
                        (5)楼宇经济分析系统
                    </p>
                </div>
            </div>
        );
    }
}

class TerraRSShare extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            navTab: 0
        }
    }
    select() {
        $(".TerraRSShare-content div").click(function () {
            $(this).siblings('div').removeClass('selected');  // 删除其他兄弟元素的样式
            $(this).addClass('selected');                   // 添加当前元素的样式
        });
    } 
    //点击三维资源
    threeDClick() {
        this.select();
        this.setState({
            navTab: 0
        })
    };
    //点击共享接入
    shareClick() {
        this.select();
        this.setState({
            navTab: 1
        })
    };
    //点击平台接入
    platformClick() {
        this.select();
        this.setState({
            navTab: 2
        })
    };
    switchComponent() {
        var _this = this;
        var content = null;
        switch (this.state.navTab) {
            case 0:
                content = (<ThreeDComponent />);
                break;
            case 1:
                content = (<ShareComponent />);
                break;
            case 2:
                content = (<PlatformComponent />);
                break;
            default:
                content = null;
                break;
        }
        return content
    }
    render() {
        var navStyle1 = {
            position: "relative",
            left: "46%",
            top: "13%"
        }
        var navStyle2 = {
            position: "relative",
            left: "37%",
            top: "15%"
        }
        var navStyle3 = {
            position: "relative",
            left: "28%",
            top: "18%"
        }
        return (
            <div className="TerraRSShare">
               
                <div className="TerraRSShare-content">
                    <div className="navStyle1" style={navStyle1} onClick={this.threeDClick.bind(this)}>
                        <img className="navImg" src="../Images/skyline/introInfo/三维资源类型_icon.png" />
                        <span className="navSpan1">三维资源类型</span>
                    </div>
                    <div className="navStyle1" style={navStyle2} onClick={this.shareClick.bind(this)}>
                        <img className="navImg" src="../Images/skyline/introInfo/共享接入条件_icon.png" />
                        <span className="navSpan1">共享接入条件</span>
                    </div>
                    <div className="navStyle2" style={navStyle3} onClick={this.platformClick.bind(this)}>
                        <img className="navImg" src="../Images/skyline/introInfo/平台接入_icon.png" />
                        <span className="navSpan2">平台接入</span>
                    </div>
                    <div className="switchComponent">
                        {this.switchComponent()}
                    </div>
                </div>
            </div>
        );
    }
}
class ThreeDComponent extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="threeDStyle">
                <div className="threeDStyle-content1">
                    <span className="content1-span">三维场景</span>
                    <div className="content1-div"></div>
                </div>
                <div className="threeDStyle-content2">
                    <span className="content2-span">卫星影像</span>
                    <div className="content2-div"></div>
                </div>
                <div className="threeDStyle-content3">
                    <span className="content3-span">三维模型</span>
                    <div className="content3-div"></div>
                </div>
            </div>
        );
    }
}
class ShareComponent extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="shareStyle">
                <div className="shareStyle-text">
                    1.面向用户：苏州市各委办局<br />
                    2.网络环境：苏州市政务内网<br />
                    3.使用用途：苏州市各委办局内部业务分析、管理或其他政务类需求<br />
                    4.平台要求：三维场景基于国产SmartEarth软件系列<br />
                </div>
            </div>
        );
    }
}
class PlatformComponent extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="threeDStyle">
                <div className="threeDStyle-text">
                    1、向苏州市发改委申请苏州市地理空间大数据支撑平台访问账户；<br />
                    2、登录苏州市地理空间大数据支撑平台的空间资源目录系统提交资源申请；<br />
                    3、等待相关部门人员的审核结果；<br />
                    4、审核过程可登录平台查看；<br />
                    5、申请通过后平台会将资源使用地理及使用方式发送到申请用户；<br />
                </div>
            </div>
        );
    }
}
class PropertyInfo extends React.Component {
    constructor(props) {
        super(props);
    }
    createItems() {
        if (!this.props.dataSource) {
            return null;
        }
        return this.props.dataSource.map(function (item) {
            return (
                <div>
                    <span>{item.name}</span>
                    <span>{item.value}</span>
                    <span>{item.unit}</span>
                </div>
            );
        });
    }
    render() {
        return (
            <div className='propList'>
                {this.createItems()}
            </div>
        );
    }
}

class StreetMap extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        if (this.props.onLoaded)
            this.props.onLoaded(this);
    }
    goTo(x, y, yaw, pitch) {
        var cor = sgWorldContext.extension.cordinate.toBaiDu(x, y);
        console.log(cor.X + ',' + cor.Y + ',' + yaw + ',' + pitch);

        document.getElementById('streetMap').contentWindow.linkStreetMap(cor.X, cor.Y, yaw, 0);
    }
    render() {
        var url = this.props.url;
        return <iframe id='streetMap' style={{ border: 0, width: "100%", height: "100%" }} src={url} />
    }
}
