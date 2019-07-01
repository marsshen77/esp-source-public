import React, { useEffect, useContext, useRef } from 'react';
import { PathContext } from '../Context/PathContext';
import './ImageButtons.less';
const ImageButtons = (props) => {
    const createButtons = () => {
        if (!props.items) return null;
        return props.items.map((item) => {
            return <ImageButton key={item.ID} item={item} updateContent={props.updateContent} />;
        });
    }
    const buttons = createButtons();
    return (
        <div className='imageButtons'>
            {buttons}
        </div>
    )
}
const ImageButton = (props) => {
    const context = useContext(PathContext);
    const item = props.item;
    const ownClick = useRef(false);
    useEffect(() => {
        if (item.AutoClick === 'true') {
            onClick();
        }
    }, [])
    useEffect(() => {
        if (ownClick.current) {
            ownClick.current = false;
            return;
        }
        if (context.currentPath === item.Title) onItemClick();
    }, [context.currentPath])
    const onItemClick = () => {
        context.dispatch(item.Title);
        props.updateContent(item);
    }
    const onClick = () => {
        ownClick.current = true;
        onItemClick();
    }
    const className = context.currentPath.split('-')[0] === item.Title ? 'imageButton selected' : 'imageButton';
    return (
        <div className={className} onClick={onClick}>
            <img className='image' src={item.Icon} />
            <div className='title' >
                {item.Title}
            </div>
        </div>
    )
}
export default ImageButtons;