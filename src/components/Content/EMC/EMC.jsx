import React from 'react';
import EChartsControl from "./EChartsControl";

const EMC = props => {
    const type = props.EType;
    return (
        <>
            {type !== 'DataTable' && <EChartsControl id={props.ID} />}
        </>
    )
}
export default EMC;