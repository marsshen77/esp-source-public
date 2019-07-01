import React,{useReducer} from 'react';
const PathContext = React.createContext();
const pathReducer = function(state, action) {
    return action;
}

const PathProvider = function (props) {
    const [currentPath, dispatch] = useReducer(pathReducer, '');
    return (
        <PathContext.Provider value={{ currentPath, dispatch }}>
            {props.children}
        </PathContext.Provider>
    );
};
export {PathContext,PathProvider};