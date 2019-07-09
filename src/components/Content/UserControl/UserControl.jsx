import React, { useEffect } from 'react';
import { useFetch, useLoadScriptFile } from '../../Hooks/ToolsHooks';
import HtmlControl from '../../Controls/HtmlControl';

const UserControl = props => {
    const config = useFetch(`${esp.url}api/DockWindow/GetUserControl?userControlID=${props.ID}`);
    if (!config) return null;
    const style = config.UserStyle ? $.parseJSON(config.UserStyle) : { width: '100%', height: '100%', overflowY: 'none' };
    return (
        <div style={style}>
            {config.EType === 'Control' && <CommonControl {...config} />}
            {config.EType === 'WebpackControl' && <WebpackControl {...config} />}
            {config.EType === 'Html' && <HtmlControl html={config.Content} id={config.ID} />}
        </div >
    )
}
const WebpackControl = props => {
    return (
        <div></div>
    )
}

const CommonControl = props => {
    const loaded = useLoadScriptFile(props.Url);
    const getControl = () => {
        const Control = window[props.Content];
        return Control ? <Control config={props} /> : null;
    }
    return (
        <>
            {loaded && getControl()}
        </>
    )
}
export default UserControl;
