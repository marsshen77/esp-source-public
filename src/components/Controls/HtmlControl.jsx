import React from 'react';
class HtmlControl extends React.Component {
    constructor(props) {
        super(props);
        this.triggerOnLoad = this.triggerOnLoad.bind(this);
    }
    componentDidMount() {
        this.triggerOnLoad();
    }
    componentDidUpdate() {
        this.triggerOnLoad();
    }
    triggerOnLoad() {
        var id = 'html_' + this.props.id;
        id = this.escapeJquery(id);
        $('#' + id + '>div:first-child').trigger('onload');
    }
    refresh() {
    }

    escapeJquery(srcString) {
        // 转义之后的结果
        var escapseResult = srcString;

        // javascript正则表达式中的特殊字符
        var jsSpecialChars = ["\\", "^", "$", "*", "?", ".", "+", "(", ")", "[",
            "]", "|", "{", "}"];

        // jquery中的特殊字符,不是正则表达式中的特殊字符
        var jquerySpecialChars = ["~", "`", "@", "#", "%", "&", "=", "'", "\"",
            ":", ";", "<", ">", ",", "/"];

        for (var i = 0; i < jsSpecialChars.length; i++) {
            escapseResult = escapseResult.replace(new RegExp("\\"
                    + jsSpecialChars[i], "g"), "\\"
                + jsSpecialChars[i]);
        }

        for (var i = 0; i < jquerySpecialChars.length; i++) {
            escapseResult = escapseResult.replace(new RegExp(jquerySpecialChars[i],
                "g"), "\\" + jquerySpecialChars[i]);
        }

        return escapseResult;
    }

    render() {
        var contentStyle = {
            width: '100%',
            height: '100%',
            overflow:'hidden'
        };
        var htmlText = this.props.html;
        var id = 'html_' + this.props.id;
        return (
            <div style={contentStyle} id={id} dangerouslySetInnerHTML={{ __html: htmlText }}>

            </div>
        );
    }
};

export default HtmlControl;