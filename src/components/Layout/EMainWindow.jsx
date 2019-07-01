import React, { useEffect, useState } from 'react';
import { PathProvider } from '../Context/PathContext';
import { useFetch } from '../Hooks/ToolsHooks';
import EMultiMenuWindow from './EMultiMenuWindow';
//import ESingleMenuWindow from './ESingleMenuWindow';
import './EMainWindow.less';
const EMainWindow = (props) => {
    const data = useFetch(`${esp.url}api/Project/GetProject?projectID=${props.projectID}`);
    if (!data) return null;
    esp.setProject(data);
    const project = data.Project;
    //const controlName = project.ControlName || 'EMultiMenuWindow';
    return (
        <PathProvider>
            {project.ControlName === 'EMultiMenuWindow' &&
                <EMultiMenuWindow project={project} />}
            {project.ControlName === 'ESingleMenuWindow' &&
                <EMultiMenuWindow project={project} />}
        </PathProvider>
    )
}
export default EMainWindow;