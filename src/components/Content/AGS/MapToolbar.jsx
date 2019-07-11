import React from 'react';
const current = {};
class BaseToolbarItem extends React.Component {
    constructor(props) {
        super(props);
        this.mapControl = null;
    }
    componentDidMount() {
        //将本实例添加到MapControl中，以便MapControl中可以查询到该组件实例，从而调用该图层树实例中的函数进行交互
        if (this.props.onLoaded)
            this.props.onLoaded(this);
        if (this.props.mapControl && this.props.mapControl.onElementLoaded)
            this.props.mapControl.onElementLoaded(this);
    }
    itemClick(toolBarItemModel) {
    }
    onToolbarClick(toolBarItemModel) {
        var toolbar = this.props.parent;
        toolbar.onItemClick(this);
        this.itemClick(toolBarItemModel);
    }
    close() {

    }
    getClass() {
        if (!this.props.itemModel.GroupName)
            return null;

        var toolbar = this.props.parent;
        if (!toolbar.state || !toolbar.state.groupItems)
            return null;

        var groupItems = toolbar.state.groupItems;
        var _this = this;
        var target = groupItems.first(function (item) {
            return item.toolBarItem == _this;
        });
        if (!target)
            return null;

        return target.toolBarItem.props.itemModel.isChecked ? 'selected' : null;
    }
    render() {
        var itemModel = this.props.itemModel;
        this.mapControl = this.props.mapControl;

        var className = this.getClass();
        return (
            <div className={className} onClick={this.onToolbarClick.bind(this, itemModel)}>
                <img title={itemModel.Name} src={itemModel.Icon} />
            </div>
        );
    }
};

class ShowLayerToolbarItem extends BaseToolbarItem {
    constructor(props) {
        super(props);
        this.layerControl = null;
        this.itemClick = (toolBarItemModel) => {
            if (this.layerControl == null) {
                this.layerControl = this.createLayerTool(toolBarItemModel);
                this.mapControl.showWindows([this.layerControl]);
            }
            else {
                if (toolBarItemModel.isChecked)
                    $('#mapListTree').slideDown();
                else
                    $('#mapListTree').slideUp();
            }
        };
        this.close = () => {
            $('#mapListTree').slideUp();
        };
    }

    createLayerTool(toolBarItemModel) {
        var layersSource = this.mapControl.mapModel.EMapLayer.select(function (layer) {
            return layer.IsBaseLayer != true;
        });

        var treeView = <EMapLayer showIcon={true} map={this.mapControl.map} mapView={this.mapControl.mapView} dataSource={layersSource} checked={true} />;
        return treeView;
    }
    onCloseLayer(sender) {
        $('#mapListTree').hide();
    }

};

class IdentifyToolbarItem extends BaseToolbarItem {
    constructor(props) {
        super(props);
        this.layerControl = null;
        this.isActive = false;
        this.itemClick = (toolBarItemModel) => {
            console.log(toolBarItemModel);
            console.log(this.props.mapControl);
            this.toogleActive(toolBarItemModel.isChecked);
        };

    }

    toogleActive(isChecked) {
        if (isChecked) {
            this.props.mapControl.listenAllLayer();
        }
        else {
            this.props.mapControl.unListenAllLayer();
        }
    }

};

class EMapViewToolbar extends React.Component {
    constructor(props) {
        super(props);
        this.groupItems = [];
    }
    addGroup(groupName, target) {
        groupName = groupName || 'default';
        var groupItem = this.groupItems.first(function (item) {
            return item.toolBarItem == target;
        });
        if (groupItem)
            return;

        this.groupItems.push({
            groupName: groupName,
            toolBarItem: target
        }
        );
    }
    onItemLoaded(sender) {
        if (sender.props.itemModel.GroupName) {
            this.addGroup(sender.props.itemModel.GroupName, sender);
        } else {
            console.warn("Can't find groupname");
        }
    }
    createItems() {
        var mapControl = this.props.mapControl;
        if (!mapControl.mapModel)
            return null;

        if (!mapControl.mapModel.EMapToolItem)
            return null;
        var toolBarItems = mapControl.mapModel.EMapToolItem.select(function (item) {
            return item.ToolType == 'Toolbar';
        });

        var _this = this;
        var result = toolBarItems.map(function (item) {
            var Control = current[item.ToolName] || window[item.ToolName];
            var content = <Control key={item.ID} itemModel={item} mapControl={mapControl} parent={_this} onLoaded={_this.onItemLoaded.bind(_this)} />;
            return content;
        });

        return result;
    }
    onItemClick(sender) {
        var groupItem = this.groupItems.first(function (item) {
            return item.toolBarItem == sender;
        });
        if (!groupItem)
            return;

        var _groupItems = this.groupItems.map(function (item) {
            if (item.groupName == groupItem.groupName && item.toolBarItem != sender) {
                if (item.toolBarItem.close)
                    item.toolBarItem.close();

                item.toolBarItem.props.itemModel.isChecked = false;
            }

            if (item.toolBarItem == sender) {
                item.toolBarItem.props.itemModel.isChecked = !item.toolBarItem.props.itemModel.isChecked;
                if (!item.toolBarItem.props.itemModel.isChecked && item.toolBarItem.close)
                    item.toolBarItem.close();
            }

            return item;
        });

        this.setState({
            groupItems: _groupItems
        });
    }
    render() {
        return (
            <div className='Toolbar'>
                <div className='IconToolbar'>
                    {this.createItems()}
                </div>
            </div>
        );
    }
};
current.ShowLayerToolbarItem = ShowLayerToolbarItem;
current.IdentifyToolbarItem = IdentifyToolbarItem;
export default EMapViewToolbar;


