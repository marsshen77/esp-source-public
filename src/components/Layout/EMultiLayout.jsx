
import React from 'react';
import './EMultiLayout.less';

const EMultiLayout = props => {
    let code = props.code || 'M_11';
    const showSelect = code === 'M_SELECT';
    const showTabs = code === 'M_TABS';
    if (showSelect || showTabs) code = 'M_11';
    //多布局
    const calcItemsStyle = () => {
        let [, rowcol, connectStr, outerPadStr, innerPadStr] = code.split('_');
        let row, col;
        outerPadStr = outerPadStr || '0';
        innerPadStr = innerPadStr || '0';
        const outPadList = outerPadStr.split('$').map(p => Number(p));
        let topP, rightP, bottomP, leftP;
        if (outPadList.length === 4) {
            [topP, rightP, bottomP, leftP] = outPadList;
        }
        if (outPadList.length === 2) {
            topP = bottomP = outPadList[0];
            rightP = leftP = outPadList[1];
        }
        if (outPadList.length === 1) {
            topP = rightP = bottomP = leftP = outPadList[0];
        }
        const innerP = Number(innerPadStr);
        if (rowcol.length === 2) {
            [row, col] = rowcol.split('');
        }
        if (rowcol.length === 4) {
            row = rowcol.slice(0, 2);
            col = rowcol.slice(2);
        }
        row = Number(row);
        col = Number(col);
        const matrix = new Array(); /*数字和行列号对应map*/
        for (let i = 1; i <= row; i++) {
            for (let j = 1; j <= col; j++) {
                let top, left, width, height;
                const reduce_i_row = (row - 1) / row * innerP;  //由于内间距产生的行top偏移
                const reduce_i_col = (col - 1) / col * innerP;  //由于内间距产生的列left偏移
                const reduce_o_row = topP - (topP + bottomP) / row * (i - 1); //由于外边距产生的行top偏移
                const reduce_o_col = leftP - (leftP + rightP) / col * (j - 1); //由于外边距产生的行left偏移
                const basic_row = 100 / row * (i - 1); //原始top
                const basic_col = 100 / col * (j - 1); //原始left
                if (i === 1) top = `calc(${basic_row}% + ${reduce_o_row}px)`;
                else if (i === row) top = `calc(${basic_row}% + ${reduce_i_row + reduce_o_row}px)`;
                else top = `calc(${basic_row}% + ${reduce_i_row * 0.5 + reduce_o_row}px)`;
                if (j === 1) left = `calc(${basic_col}% + ${reduce_o_col}px)`;
                else if (j === col) left = `calc(${basic_col}% + ${reduce_i_col + reduce_o_col}px)`;
                else left = `calc(${basic_col}% + ${reduce_i_col * 0.5 + reduce_o_col}px)`;

                width = `calc(${100 / col}% - ${(leftP + rightP) / col + reduce_i_col}px)`;
                height = `calc(${100 / row}% - ${(topP + bottomP) / row + reduce_i_row}px)`;
                let border = esp.config.options.multi_border || 'none';
                if (code === 'M_11') border = 'none';
                const style = {
                    width,
                    height,
                    position: 'absolute',
                    top,
                    left,
                    border
                };
                const item = {
                    i: i,
                    j: j,
                    continue: false,
                    style: style
                };
                matrix.push(item);
            }
        }
        const connects = (typeof (connectStr) == 'undefined' || connectStr == '') ? [] : connectStr.split('$');
        for (let i = 0; i < connects.length; i++) {
            const item = connects[i];
            let start, end;
            if (matrix.length > 9) {
                start = Number(item.slice(0, 2));
                end = Number(item.slice(2));
            } else {
                start = Number(item.slice(0, 1));
                end = Number(item.slice(1));
            }
            const x1 = matrix[start - 1].i;
            const y1 = matrix[start - 1].j;
            const x2 = matrix[end - 1].i;
            const y2 = matrix[end - 1].j;
            if (y1 > y2 || x1 > x2) [start, end] = [end, start];
            const xFactor = Math.abs(x2 - x1) + 1; /*每一个合并块起始数字对应的行列号减去最后一个数字对应的行列号*/
            const yFactor = Math.abs(y2 - y1) + 1;
            const width = `calc(${100 / col * yFactor}% - ${(leftP + rightP) / col * yFactor + (col - 1) / col * innerP * yFactor - innerP * (yFactor - 1)}px)`;
            const height = `calc(${100 / row * xFactor}% - ${(topP + bottomP) / row * xFactor + (row - 1) / row * innerP * xFactor - innerP * (xFactor - 1)}px)`;
            matrix[start - 1].style.width = width;
            matrix[start - 1].style.height = height;
            for (let j = 0; j < matrix.length; j++) {
                const value = matrix[j];
                if (j + 1 !== start &&
                    value.i >= Math.min(x1, x2) &&
                    value.i <= Math.max(x1, x2) &&
                    value.j >= Math.min(y1, y2) &&
                    value.j <= Math.max(y1, y2)) {
                    value.continue = true;
                }
            }
        }

        const styles = []; /*保存每个合并块样式*/
        for (var i = 0; i < matrix.length; i++) {
            const value = matrix[i];
            if (!value.continue) {
                styles.push(value.style);
            }
        }
        if (code !== 'M_11' && code !== 'M_TABS' && styles.length < props.children.length) {
            console.error('多布局配置异常，Children过多');
            const appendStyle = [];
            for (let i = 0; i < props.children.length - styles.length; i++) {
                const style = {
                    display: 'none'
                }
                appendStyle.push(style);
            }
            styles.push(...appendStyle);
        }
        return styles;
    }

    //浮动布局
    const calcFloatItemsStyle = () => {
        let [, rowcol, connectStr, outerPadStr, innerPadStr] = code.split('_');
        let row, col;
        outerPadStr = outerPadStr || '40$10$40$10';
        innerPadStr = innerPadStr || '10';
        const outPadList = outerPadStr.split('$').map(p => Number(p));
        let topP, rightP, bottomP, leftP;
        if (outPadList.length === 4) {
            [topP, rightP, bottomP, leftP] = outPadList;
        }
        if (outPadList.length === 2) {
            topP = bottomP = outPadList[0];
            rightP = leftP = outPadList[1];
        }
        if (outPadList.length === 1) {
            topP = rightP = bottomP = leftP = outPadList[0];
        }
        const innerP = Number(innerPadStr);
        if (rowcol.length === 2) {
            [row, col] = rowcol.split('');
        }
        if (rowcol.length === 4) {
            row = rowcol.slice(0, 2);
            col = rowcol.slice(2);
        }
        row = Number(row);
        col = Number(col);
        const matrix = new Array(); /*数字和行列号对应map*/
        for (let i = 1; i <= row; i++) {
            for (let j = 1; j <= col; j++) {
                let top, left, width, height;
                const reduce_i_row = (row - 1) / row * innerP;  //由于内间距产生的行top偏移
                const reduce_i_col = (col - 1) / col * innerP;  //由于内间距产生的列left偏移
                const reduce_o_row = topP - (topP + bottomP) / row * (i - 1); //由于外边距产生的行top偏移
                const reduce_o_col = leftP - (leftP + rightP) / col * (j - 1); //由于外边距产生的行left偏移
                const basic_row = 100 / row * (i - 1); //原始top
                const basic_col = 100 / col * (j - 1); //原始left
                if (i === 1) top = `calc(${basic_row}% + ${reduce_o_row}px)`;
                else if (i === row) top = `calc(${basic_row}% + ${reduce_i_row + reduce_o_row}px)`;
                else top = `calc(${basic_row}% + ${reduce_i_row * 0.5 + reduce_o_row}px)`;
                if (j === 1) left = `calc(${basic_col}% + ${reduce_o_col}px)`;
                else if (j === col) left = `calc(${basic_col}% + ${reduce_i_col + reduce_o_col}px)`;
                else left = `calc(${basic_col}% + ${reduce_i_col * 0.5 + reduce_o_col}px)`;

                width = `calc(${100 / col}% - ${(leftP + rightP) / col + reduce_i_col}px)`;
                height = `calc(${100 / row}% - ${(topP + bottomP) / row + reduce_i_row}px)`;
                const style = {
                    width,
                    height,
                    position: 'absolute',
                    top,
                    left,
                    'z-index': 9
                };
                const item = {
                    i: i,
                    j: j,
                    continue: true,
                    style: style
                };
                matrix.push(item);
            }
        }
        let connects = (typeof (connectStr) == 'undefined' || connectStr == '') ? [] : connectStr.split('$');
        for (let i = 0; i < connects.length; i++) {
            let item = connects[i];
            let start, end;
            if (matrix.length > 9) {
                if (item.length == 2) {
                    start = end = Number(item);
                }
                if (item.length == 4) {
                    start = Number(item.slice(0, 2));
                    end = Number(item.slice(2));
                }
            } else {
                if (item.length == 1) {
                    start = end = Number(item);
                }
                if (item.length == 2) {
                    start = Number(item.slice(0, 1));
                    end = Number(item.slice(1));
                }
            }
            const x1 = matrix[start - 1].i;
            const y1 = matrix[start - 1].j;
            const x2 = matrix[end - 1].i;
            const y2 = matrix[end - 1].j;
            if (y1 > y2 || x1 > x2) [start, end] = [end, start];
            const xFactor = Math.abs(x2 - x1) + 1; /*每一个合并块起始数字对应的行列号减去最后一个数字对应的行列号*/
            const yFactor = Math.abs(y2 - y1) + 1;
            const width = `calc(${100 / col * yFactor}% - ${(leftP + rightP) / col * yFactor + (col - 1) / col * innerP * yFactor - innerP * (yFactor - 1)}px)`;
            const height = `calc(${100 / row * xFactor}% - ${(topP + bottomP) / row * xFactor + (row - 1) / row * innerP * xFactor - innerP * (xFactor - 1)}px)`;
            matrix[start - 1].style.width = width;
            matrix[start - 1].style.height = height;
            matrix[start - 1].continue = false;
        }

        const styles = []; /*保存每个合并块样式*/
        styles.push({
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            'z-index': 0
        });
        for (var i = 0; i < matrix.length; i++) {
            let value = matrix[i];
            if (!value.continue) {
                styles.push(value.style);
            }
        }
        if (styles.length < props.contents.length) {
            console.error('浮动布局配置异常，Children过多');
            const appendStyle = [];
            for (let i = 0; i < props.children.length - styles.length; i++) {
                const style = {
                    display: 'none'
                }
                appendStyle.push(style);
            }
            styles.push(...appendStyle);
        }
        return styles;
    }
    const createItems = () => {
        const [type] = code.split('_');
        let styles;
        if (type == 'M') {
            styles = calcItemsStyle();
        }
        if (type == 'F' || type == 'FH') {
            styles = calcFloatItemsStyle();
        }
        const count = props.children.length;
        const items = [];

        for (let index = 0; index < count; index++) {
            const className = 'p' + (index + 1);
            const styleIndex = index;
            const showMin = (type === 'FH' && index !== 0) ? true : false;
            const item =
                <EMultiLayoutItem key={props.children[index].props.ID} className={className} style={styles[styleIndex]} content={props.children[index]} showMin={showMin} minCallback={minCallback} />
            items.push(item);
        }
        return items;
    }
    const minCallback = () => {

    }
    const changeItem = () => {

    }
    const layoutCode = code;
    const childrenItems = createItems();
    const getOptionItems = () => {
        return props.children.map((item, index) => {
            //由于EMC表中Name字段用于区分不同菜单中同名EMC导致EMC名字过长，暂时取最后一个'-'后面的内容当做名字表示
            const title = item.props.title.split('-').pop();
            return {
                value: 'p' + (index + 1),
                text: title
            }
        });
    }
    return (
        <div className={layoutCode}>
            <div className={'multiContent'}>
                {showSelect &&
                    <EMultiLayoutSelect className={'multiSelect'} changeFunc={changeItem} optionItems={getOptionItems()} />
                }
                {showTabs &&
                    <EMultiLayoutTabS className={'multiTabs'} changeFunc={changeItem} optionItems={getOptionItems()} />}
                {childrenItems}
            </div>
        </div>
    )
}

const EMultiLayoutItem = (props) => {
    return (
        <div className={props.className} style={props.style}>
            {props.content}
        </div>
    )
}
class EMultiLayoutSelect extends React.Component {
    constructor(props) {
        super(props);
        this.changeFunc = this.changeFunc.bind(this);
        let top = 20;
        this.style = { top };
    }

    changeFunc(e) {
        this.props.changeFunc($(e.target).val());
    }

    setStyle() {
        let list = $('.multiSelect');
        for (let i = 0; i < list.length; i++) {
            for (let j = i + 1; j < list.length; j++) {
                if (this.isOverlapping(list[i], list[j])) {
                    let top = $(list[i]).css('top');
                    top = Number(top.slice(0, top.length - 2)) + 30 + 'px';
                    $(list[j]).css('top', top)
                }
            }
        }
    }

    isOverlapping(node1, node2) {
        const rect1 = node1.getBoundingClientRect();
        const rect2 = node2.getBoundingClientRect();
        let overlap = !(rect1.right < rect2.left || rect1.left > rect2.right || rect1.bottom < rect2.top || rect1.top > rect2.bottom);
        return overlap;
    }

    componentDidMount() {
        this.setStyle();
    }

    render() {
        const optionItems = this.props.optionItems.map((item) => <option key={item.value} value={item.value}>{item.text}</option>);
        return (
            <select style={this.style} className={this.props.className} onChange={this.changeFunc}>{optionItems}</select>
        );
    }
}

class EMultiLayoutTabS extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            current: props.optionItems[0].value
        };
        this.changeFunc = this.changeFunc.bind(this);
    }

    changeFunc(e) {
        this.setState({
            current: $(e.target).attr('value')
        });
        this.props.changeFunc($(e.target).attr('value'));
    }

    render() {
        let current = this.state.current;
        const optionItems = this.props.optionItems.map((item) =>
            <li key={item.value}  value={item.value} className={current === item.value ? 'currentTab' : ''} onClick={this.changeFunc}>{
                item.text}</li>);
        return (
            <div className={this.props.className}>
                <ul> {optionItems}</ul>
            </div>
        );
    }
}

export default EMultiLayout;