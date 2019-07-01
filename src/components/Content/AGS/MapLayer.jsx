class EMapLayer extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        //var models = this.state.dataSource;
        var map = this.props.map;
        var mapView = this.props.mapView;
        if (map.mapLayerControl)
            return;

        var _this = this;
        var mapExtensions = new window.mapExtensions();
        mapExtensions.convertToLayers(this.props.dataSource, function (layers) {
            map.addMany(layers);
            mapExtensions.createLayerTree(mapView, document.getElementById('mapListTree'), function (layerList) {
                console.log(layerList);
                map.mapLayerControl = _this;
            });
        });
        if (this.props.onLoaded)
            this.props.onLoaded(this);
    }
    render() {
        var style = {
            width: '100%',
            height: '100%',
            minWidth:'250px'
        };
        return (
            <div id='mapListTree' style={style}>
                <div style={{ background: 'gray', height: '35px', lineHeight: '35px', width: '100%', color: 'white', paddingLeft:'10px' }}>图层管理</div>
            </div>
        );
    }
}