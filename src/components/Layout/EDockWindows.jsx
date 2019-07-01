import React from 'react';
import { useFetch } from '../Hooks/ToolsHooks';
import EMultiLayout from './EMultiLayout';
import EMC from '../Content/EMC/EMC';
import './EDockWindows.less';

const EDockWindows = React.memo(props => {
    if (!props.menuItemID) return null;
    const configs = useFetch(`${esp.url}api/Menu/GetDockWindowsDebug?menuItemID=${props.menuItemID}`);
    if (!configs) return null;
    const items = configs.map(item => <EDockWindow key={item.ID} {...item} />);
    return (
        <EMultiLayout code={props.multiLayoutCode}>
            {items}
        </EMultiLayout>
    )
})
const EDockWindow = props => {
    const configs = useFetch(`${esp.url}api/DockWindow/GetContents?dockWindowID=${props.ID}`)
    if (!configs) return null;
    const contentItems = [];
    const headerItems = [];
    const footerItems = [];
    for (let config of configs) {
        const item = <EDockWindowContent key={config.ID} {...config} />
        if (config.Position == 'Content') contentItems.push(item);
        if (config.Position == 'Header') headerItems.push(item);
        if (config.Position == 'Footer') footerItems.push(item);
    }
    const contentStyle = { height: `calc(100% - ${(props.HideTitle === 1 ? 0 : 35) + (props.HideFoot === 1 ? 0 : 30)}px)` }
    return (
        <div className='dockwindow' id={props.ID} >
            {props.HideTitle !== 1 && <EDockWindowHeader items={headerItems} title={props.Title} icon={props.Icon} />}
            <div className='content' style={contentStyle}>
                <EMultiLayout code={props.multiLayoutCode}>
                    {contentItems}
                </EMultiLayout>
            </div>
            {props.HideFoot !== 1 && <EDockWindowFooter items={footerItems} />}
        </div >
    )
}

const EDockWindowContent = props => {
    const type = props.Type;
    return (
        <>
            {type === 'EMC' && <EMC {...props}/>}
        </>
    )
}
const EDockWindowHeader = props => {
    const icon = props.icon ? {
        backgroundImage: "url(" + props.Icon + ")"
    } : {};
    return (
        <div className='header'>
            <div className='icon' style={icon}></div>
            <div className='title'>{props.title}</div>
            {props.items}
        </div>
    )
}
const EDockWindowFooter = props => {
    return (
        <div className='foot'>
            {props.items}
        </div>
    )
}
export default EDockWindows