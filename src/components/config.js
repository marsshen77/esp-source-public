
const esp = {
    init: config => {
        esp.url = config.url;
    },
    url: '',
    config: {
        options: {
            echarts: {}
        }
    },
    setProject: data => {
        esp.config.variables = data.Variables;
        if (data.Options) {
            for (let index = 0; index < data.Options.length; index++) {
                esp.config.options[data.Options[index].Key] = data.Options[index].Value;
            }
        }
        const themeStr = esp.config.options.echarts_theme;
        if (themeStr) {
            const reg = /.js$/;
            if (reg.test(themeStr)) {
                esp.loadScriptFile(themeStr);
                const themeTemp = themeStr.match(/\w*\.js$/)[0];
                esp.config.options.echarts.theme = themeTemp.split('.')[0];
            } else {
                esp.config.options.echarts.theme = themeStr;
            }
        }
        if (data.ProjectFunction) {
            esp.loadScript(data.ProjectFunction);
        }
        if (data.CssFile) {
            esp.loadStyleFile(data.CssFile);
        }
        if (data.JsFile) {
            esp.loadScriptFile(data.JsFile);
        }
        esp.projectID = data.Project.ID;
        document.title = data.Project.Title;
    },
    loadScriptFile: (url, callback) => {
        if (~esp.defaultRS.indexOf(url)) {
            if (callback) callback();
        }
        else {
            const script = document.createElement("script")
            script.type = "text/javascript";
            if (script.readyState) { //IE
                script.onreadystatechange = () => {
                    if (script.readyState == "loaded" || script.readyState == "complete") {
                        script.onreadystatechange = null;
                        esp.defaultRS.push(url);
                        if (callback) callback();
                    }
                };
            } else { //Others
                script.onload = () => {
                    esp.defaultRS.push(url);
                    if (callback) callback();
                };
            }
            script.src = url;
            document.getElementsByTagName("head")[0].appendChild(script);
        }
    },
    loadStyleFile: (url, callback) => {
        if (~esp.defaultRS.indexOf(url)) {
            if (callback) callback();
        }
        else {
            const style = document.createElement("link")
            style.type = "text/css";
            style.rel = 'stylesheet';
            if (style.readyState) { //IE
                style.onreadystatechange = () => {
                    if (style.readyState == "loaded" || style.readyState == "complete") {
                        style.onreadystatechange = null;
                        esp.defaultRS.push(url);
                        if (callback) callback();
                    }
                };
            } else { //Others
                style.onload = () => {
                    esp.defaultRS.push(url);
                    if (callback) callback();
                };
            }
            style.href = url;
            document.getElementsByTagName("head")[0].appendChild(style);
        }
    },
    defaultRS: []
};
window.esp = esp;

export default esp;