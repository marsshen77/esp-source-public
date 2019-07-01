import echarts from 'echarts';
import React, { useEffect } from 'react';
import { useFetch } from '../../Hooks/ToolsHooks';
const EChartsControl = props => {
    const data = useFetch(`${esp.url}api/EMC/GetDataSource?id=${props.id}`);
    useEffect(()=>{
        
    },[data]);
    if (!data) return null;
    return (
        <div id={"echarts_" + props.id}></div>
    )
}
export default EChartsControl;