import React, { useEffect } from 'react';
import EMultiLayout from '../../Layout/EMultiLayout';
import { useFetch } from '../../Hooks/ToolsHooks';
import EChartsFactory from './EChartsFactory';
const MapControl = props => {
    const config = useFetch(`${esp.url}api/EMC/GetDataSource?id=${props.id}`);
    if (!config) return null;
    const groups = {};
    config.DataSource.forEach(item => {
        const groupName = item.groupname || 'default';
        if (groups[groupName]) {
            groups[groupName].push(item);
        } else {
            groups[groupName] = [item];
        }
    });
    const items = [];
    for(let groupName in groups){
        items.push(<MapItem key={groupName} ID={config.ID+'_'+groupName} option={config.Option} data={groups[groupName]} title={groupName}/>)
    }
    return (
        <EMultiLayout code={config.MultiLayoutCode}>
            {items}
        </EMultiLayout>
    )
}

const MapItem = props => {
    useEffect(() => {
        const factory = new EChartsFactory();
        const funName = 'Load' + props.option.EType;
        factory[funName](props.ID, props.data, props.option);
    })
    return <div style={{height:'100%',width:'100%'}} id={props.ID}></div>
}
export default MapControl;