import React, { useEffect, useContext, useRef } from 'react';
import { PathContext } from '../Context/PathContext';
const EAccordion = (props) => {
    const items = props.items;
    const context = useContext(PathContext);
    const getItems = (items) => {
        const filter = props.filter;
        const fItems = searchFilter(filter, items);
        return createItems(fItems);
    }
    const searchFilter = (filter, items) => {
        if (!filter) return items;
        const results = [];
        for (let index = 0; index < items.length; index++) {
            const element = { ...items[index] };
            if (element.Children && element.Children.length > 0) {
                element.Children = this.itemsFilter(filter, element.Children);
                if (element.Children.length > 0 || ~element.Title.indexOf(filter))
                    results.push(element);
            } else if (~element.Title.indexOf(filter)) {
                results.push(element);
            }
        }
        return results;
    }
    const itemsFilter = (items) => {
        if (!items) return null;
        const result = [];
        for (let index = 0; index < items.length; index++) {
            const element = items[index];
            if (element.menuPath.split('-').slice(0, 2).toString() === context.currentPath.split('-').slice(0, 2).toString())
                result.push(element);
        }
        return result;
    }

    const createItems = (items, level) => {
        if (!level) level = 0;
        level++;
        return items.map((item) => {
            let childItems = null;
            let tip = null;
            if (item.Children && item.Children.length > 0) {
                const display = (level === 1 && esp.config.options.acc_expandFirstLevel === 'true') || props.filter ? 'block' : 'none';
                childItems = (
                    <ul className="submenu" style={{ display: display }}>
                        {createItems(item.Children, level)}
                    </ul>
                );
                tip = (
                    <span className="jquery-accordion-menu-label">
                        {item.Children.length}
                    </span>
                );
            }
            const getIcon = (icon) => {
                if (!icon)
                    return null;

                if (icon.indexOf('/') > -1) {
                    var style = {
                        backgroundImage: 'url(' + icon + ')'
                    };
                    return <i style={style}></i>;
                }
                else {
                    return <i className={icon}></i>;
                }
            };
            return (
                <li key={item.ID}>
                    <EAccordionItems item={item} updateContent={props.updateContent}>
                        {getIcon(item.Icon)}
                        {item.Title}
                    </EAccordionItems>
                    {tip}
                    {childItems}
                </li>
            );
        });
    }
    if (!items) return null;
    return (
        <div className="jquery-accordion-container">
            <div id="jquery-accordion-menu" className="jquery-accordion-menu black">
                <ul id="demo-list">
                    {
                        getItems(itemsFilter(items))
                    }
                </ul>
            </div>
        </div>
    )
}
const EAccordionItems = (props) => {
    const context = useContext(PathContext);
    const item = props.item;
    const ownClick = useRef(false);
    useEffect(() => {
        if (ownClick.current) {
            ownClick.current = false;
            return;
        }
        if (context.currentPath === item.menuPath) onClick();
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
        <a href="#" onMouseDown={onClick} className={className} >
            {props.children}
        </a>
    )
}
export default EAccordion;