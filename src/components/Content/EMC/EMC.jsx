import React from 'react';
import EChartsControl from "./EChartsControl";
import DataTable from './DataTableControl';

const mapTypes = ['Migration', 'Scatter', 'Density', 'HeatMap'];
const EMC = props => {
    const type = props.EType;
    const getControl = () => {
        if (type === 'DataTable') return <DataTable />;
        else if (~mapTypes.indexOf(type)) return <></>;
        else return <EChartsControl id={props.ID} />
    }
    return (
        <>
            {getControl()}
        </>
    )
}
export default EMC;