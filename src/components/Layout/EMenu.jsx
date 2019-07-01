import React, { useEffect, useContext, useRef } from 'react';
import { PathContext } from '../Context/PathContext';
import './EMenu.less';
const EMenu = (props) => {
    const context = useContext(PathContext);
    const getToolbarItemIcon = (item) => {
        const getIcon = (icon) => {
            if (!icon)
                return null;

            if (icon.indexOf('/') > -1) {
                const style = {
                    backgroundImage: 'url(' + icon + ')'
                };
                return <i style={style}></i>;
            }
            else {
                return <i className={icon}></i>;
            }
        };
        return getIcon(item.Icon);
    }
    const getToolbarItems = (toolbarItems, level) => {
        if (!toolbarItems) return null;
        toolbarItems.sort((a, b) => Number(a.OrderText) - Number(b.OrderText));
        const maxLevel = props.maxLevel || 1;
        if (level > maxLevel) return null;
        const getLength = (str) => {
            if (str == null) return 0;
            if (typeof str != "string") {
                str += "";
            }
            return str.replace(/[^\x00-\xff]/g, "01").length;
        };
        let width = 0;
        toolbarItems.map((item) => {
            let w = getLength(item.Title) * 9 + 64;
            if (w < 150)
                w = 150;

            if (width < w)
                width = w;
        });
        const menuArray = toolbarItems.map((item) => {
            return (
                <li key={item.ID} style={{ width: width }}>
                    <EMenuItem item={item} updateContent={props.updateContent}>
                        {getToolbarItemIcon(item)}
                        <span>{item.Title}</span>
                    </EMenuItem>
                    {/* 添加子集目录 */}
                    {getToolbarItems(item.Children, level + 1)}
                </li >
            );
        });
        return (
            <ul>
                {menuArray}
            </ul>
        );
    }
    const itemsFilter = (items) => {
        if (!items) return null;
        const result = [];
        for (let index = 0; index < items.length; index++) {
            const element = items[index];
            if (element.menuPath.split('-')[0] === context.currentPath.split('-')[0]) result.push(element);
        }
        return result;
    }
    const toolbarItems = getToolbarItems(itemsFilter(props.items), 1);
    return (
        <nav className="menu">
            {toolbarItems}
        </nav>
    )
}
const EMenuItem = (props) => {
    const context = useContext(PathContext);
    const item = props.item;
    const ownClick = useRef(false);
    useEffect(() => {
        if (item.AutoClick == 'true') {
            if (item.menuPath.split('-').length - context.currentPath.split('-').length === 1)
                onClick(item);
        }
    }, [])
    useEffect(() => {
        if (ownClick.current) {
            ownClick.current = false;
            return;
        }
        if (context.currentPath === item.menuPath) onItemClick();
    }, [context.currentPath])
    const onItemClick = () => {
        context.dispatch(item.menuPath);
        props.updateContent(item);
    }
    const onClick = () => {
        ownClick.current = true;
        onItemClick();
    }
    const className = ~context.currentPath.indexOf(item.menuPath) ? 'selected' : null;
    return (
        <a onClick={onClick} className={className}>
            {props.children}
        </a>
    )
}
export default EMenu;