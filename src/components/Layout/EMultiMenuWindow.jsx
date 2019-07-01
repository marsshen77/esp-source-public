import React, { useEffect, useState, useContext } from 'react';
import { PathContext } from '../Context/PathContext';
import { useFetch } from '../Hooks/ToolsHooks';
import ImageButtons from './ImageButtons';
import EMenu from './EMenu';
import EDockWindows from './EDockWindows';
import { useTitleControl, useFootControl, UserInfo } from '../Hooks/MemberHooks';
const EMultiMenuWindow = (props) => {
    const context = useContext(PathContext);
    const [content, setContent] = useState({ menuItemID: null, multiLayoutCode: null });
    const project = props.project;
    useEffect(() => {
        esp.goto = context.dispatch;
    }, [])
    const updateContent = (item) => {
        if (item.OpenUrl){
            window.open(item.OpenUrl, item.OpenUrlMode || '_abank');
            return;
        }
        const menuItemID = item.ID;
        const multiLayoutCode = item.MultiLayoutCode;
        setContent({ menuItemID, multiLayoutCode });
    }
    const title = useTitleControl(project);
    const footer = useFootControl(project);
    const setMenuPath = (items, rootPath) => {
        if (!items) return;
        for (let index = 0; index < items.length; index++) {
            const element = items[index];
            element.menuPath = rootPath ? rootPath + '-' + element.Title : element.Title;
            if (element.Children) setMenuPath(element.Children, element.menuPath);
        }
        return items;
    }
    const getEMenuItems = (menus) => {
        if (!menus) return null;
        const items = [];
        for (let index = 0; index < menus.length; index++) {
            const element = menus[index];
            if (element.Children) {
                items.push(...element.Children)
            }
        }
        return items;
    }
    const menus = useFetch(`${esp.url}api/Menu/GetMenusDebug?projectID=${project.ID}`);
    setMenuPath(menus);
    const imageButtonItems = menus;
    const eMenuItems = getEMenuItems(menus);
    return (
        <div className='mainWindow'>
            <div className='header'>
                <div className='title'>
                    {title}
                </div>
                <div className='menu1'>
                    {<ImageButtons items={imageButtonItems} updateContent={updateContent} />}
                </div>
            </div>
            <div className='menu2'>
                {<EMenu items={eMenuItems} maxLevel={100} updateContent={updateContent} />}
                {esp.config.options.hideUserInfo !== 'true' &&
                    <div className='info-div'>
                        <button className='btn quit' onClick={() => esp.backToLogin()}>退出</button>
                        <a className='btn env' target='_blank' href={project ? project.HelpUrl : '#'}>运行环境</a>
                        <a className='btn help' target='_blank' href={project ? project.HelpUrl : '#'}>帮助</a>
                        <UserInfo />
                    </div>
                }
                {esp.config.options.showMenuPath === 'true' &&
                    <EMenuPath />
                }
            </div>
            <div className='content'>
                {<EDockWindows menuItemID={content.menuItemID} multiLayoutCode={content.multiLayoutCode} />}
            </div>
            <div className='footer'>
                {footer}
            </div>
        </div>
    )
}
export default EMultiMenuWindow