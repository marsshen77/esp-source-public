import React, { useState, useEffect } from 'react';
import { useFetch } from './ToolsHooks';
import HtmlControl from '../Controls/HtmlControl';
const current = {};
const useTitleControl = (project) => {
    const titleConfig = {
        ID: project.ID,
        Content: project.Header,
        Type: 'Control',
        Logo: project.Icon,
        Title: project.Title
    };
    const title = useCreateControl(titleConfig);
    return title;
}
const useFootControl = (project) => {
    const foot = <HtmlControl html={project.footContent} id={project.ID + '_footer'} />
    return foot;
}
const useContentControl = (item) => {
    const [content, setContent] = useState({ items: null, code: null });
    useEffect(() => {
        if (item)
            updateContent();
    }, [item])
    const updateContent = () => {
        if (item.OpenUrl)
            window.open(item.OpenUrl, item.OpenUrlMode || '_abank');
        const menuItemID = item.ID;
        const code = item.MultiLayoutCode;
        $.ajax({
            url: esp.url + 'api/Menu/GetDockWindows?menuItemID=' + menuItemID,
            success: e => {
                if (e.State && e.Data && e.Data.length > 0) {
                    setContent({ items: e.Data, code })
                };
            }
        });
    }
    return <EDockWindowHooks items={content.items} code={content.code} />
}
const useCreateControl = (config) => {
    const [control, setControl] = useState(null);
    useEffect(() => {
        if (config.Url) {
            esp.loadScriptFile(config.Url, () => {
                createControl();
            });
        } else {
            createControl();
        }
    }, [])
    const createControl = () => {
        const Control = current[config.Content] || window[config.Content];
        const control = <Control config={config}/>
        setControl(control);
    }
    return control;
}
const UserInfo = () => {
    const info = useFetch(`${esp.url}api/Authen/GetUserInfoByToken?token=${esp.config.token}`);
    if (!info) return null;
    return (
        <div className='userInfo'>
            <span className='dept'>{info.DeptName ? (info.DeptName + ':') : null}</span>
            <span className='name'>{info.Name}</span>
        </div>
    )
}
const EHeaderBase = props => {
    var logoStyle = null;
    if (props.config.Logo) {
        logoStyle = {
            backgroundImage: 'url(' + props.config.Logo + ')'
        };
    }

    var className = props.config.ClassName ? props.config.ClassName : 'e_title';
    return (
        <div className={className} id={props.config.ID || 'ddd'}>
            <div style={logoStyle} className='logo'>
            </div>
            <div className='text'>
                {props.config.Title}
            </div>
        </div>
    )
}

current.EHeaderBase = EHeaderBase;
current.HtmlControl = HtmlControl;
export { useTitleControl, useFootControl, useContentControl, useCreateControl, UserInfo };