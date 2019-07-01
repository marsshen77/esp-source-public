(function () {
    var EspConfig = function () {
        this.url = '';
        this.config = {
            debug: true,
            variables: [],
            options: {},
            getVariable: function (key) {
                return this.variables.filter(result => result.Key == key)[0].Value;
            },
            arcgis: {
                root: '',
                version: '4.8'
            }
        };
        this.convert = {
        };
        this.backToLogin = function(){
            const host = this.config.options.EWFUrl||`${window.location.protocol}//${window.location.host}`;
            const url = `${host}/Home/UIServiceQuit?returnUrl=${window.location.href}`;
            window.location.assign(url);
        }
        this.getProject = function (projectID, callback) {
            $.ajax({
                url: esp.url + 'api/Project/GetProject?projectID=' + projectID,
                success: e => {
                    if (e.State) {
                        esp.config.variables = e.Data.Variables;
                        if (e.Data.Options) {
                            for (let index = 0; index < e.Data.Options.length; index++) {
                                esp.config.options[e.Data.Options[index].Key] = e.Data.Options[index].Value;
                            }
                        }
                        const themeStr = esp.config.options.echarts_theme;
                        esp.config.options.echarts = {};
                        if (themeStr) {
                            const reg = /.js$/;
                            if (reg.test(themeStr)) {
                                this.loadScriptFile(themeStr);
                                const themeTemp = themeStr.match(/\w*\.js$/)[0];
                                esp.config.options.echarts.theme = themeTemp.split('.')[0];
                            } else {
                                esp.config.options.echarts.theme = themeStr;
                            }
                        }
                        if (e.Data.ProjectFunction) {
                            esp.loadScript(e.Data.ProjectFunction);
                        }
                        esp.projectID = projectID;
                        document.title = e.Data.Project.Title;
                        if (callback) callback(e.Data.Project);
                    }
                }
            });
        }
        this.setConfig = function (config) {
            if (!config)
                return;
            for (var key in config) {
                this.config[key] = config[key];
            }
            if (!this.config.debug) {
                if (!window.console)
                    window.console = {};
                var methods = ["log", "debug", "warn", "info"];
                for (var i = 0; i < methods.length; i++) {
                    console[methods[i]] = function () { };
                }
            }
        };
        this.defaultRS = [];
        this.msgListeners = [];
        this.msgReceived = function (msg) {
            for (var i = 0; i < this.msgListeners.length; i++) {
                var args = msg.split('_');
                var data = {
                    token: args[1],
                    messageType: args[2],
                    message: args[3]
                };
                this.msgListeners[i](data);
            }
        }
        this.addMsgListener = function (callBack) {
            for (var i = 0; i < this.msgListeners.length; i++) {
                if (callBack == this.msgListeners[i])
                    return;
            }
            this.msgListeners.push(callBack);
        }
        this.requreJs = function (resources, callBack) {
            if (resources[0].indexOf('/') > -1) {
                var callBackCount = 0;
                for (var i = 0; i < resources.length; i++) {
                    var res = resources[i].toLowerCase();
                    if (res.indexOf('.js') == res.length - 3 || res.indexOf('.jsx') == res.length - 4) {
                        this.loadScriptFile(resources[i], function () {
                            callBackCount++;
                            if (callBackCount == resources.length) {
                                callBack();
                            }
                        });
                    }
                    else {
                    }
                }
            }
            else {
                var files = resources.join(",");
                for (var i = 0; i < this.defaultRS.length; i++) {
                    if (this.defaultRS[i].key == files)
                        callBack();
                }
                var type = '';
                var firstItem = resources[0].toLowerCase();
                if (firstItem.indexOf('.js') == firstItem.length - 3) {
                    type = '.js';
                }
                else if (firstItem.indexOf('.css') == firstItem.length - 4) {
                    type = '.css';
                }
                else
                    return;

                var url = esp.url + 'api/RSFile/MergeFilesToText?files=' + files;
                $.ajax({
                    url: url,
                    type: 'post',
                    success: content => {
                        if (type == '.js') {
                            this.loadScript(content);
                            callBack();
                        }
                        else if (type == '.css') {
                            this.loadStyle(content);
                            callBack();
                        }
                    }
                });
            }
        }

        this.loadScriptFile = function (url, callback) {
            var _this = this;
            var index = this.defaultRS.indexOf(url);
            if (index > -1) {
                callback();
            }
            else {
                var script = document.createElement("script")
                script.type = "text/javascript";
                if (script.readyState) { //IE
                    script.onreadystatechange = function () {
                        if (script.readyState == "loaded" || script.readyState == "complete") {
                            script.onreadystatechange = null;
                            _this.defaultRS.push(url);
                            if (callback)
                                callback();
                        }
                    };
                } else { //Others
                    script.onload = function () {
                        _this.defaultRS.push(url);
                        if (callback)
                            callback();
                    };
                }
                script.src = url;
                document.getElementsByTagName("head")[0].appendChild(script);
            }
        }

        this.loadStyleFile = function (url, callback) {
            var _this = this;
            var index = this.defaultRS.indexOf(url);
            if (index > -1) {
                callback();
            }
            else {
                var style = document.createElement("link")
                style.type = "text/css";
                style.rel = 'stylesheet';
                if (style.readyState) { //IE
                    style.onreadystatechange = function () {
                        if (style.readyState == "loaded" || style.readyState == "complete") {
                            style.onreadystatechange = null;
                            _this.defaultRS.push(url);
                            if (callback)
                                callback();
                        }
                    };
                } else { //Others
                    style.onload = function () {
                        _this.defaultRS.push(url);
                        if (callback)
                            callback();
                    };
                }
                style.href = url;
                document.getElementsByTagName("head")[0].appendChild(style);
            }
        }

        this.loadScript = function (code) {
            var script = document.createElement("script");
            script.type = "text/javascript";
            try {
                // firefox、safari、chrome and Opera
                script.appendChild(document.createTextNode(code));
            } catch (ex) {
                // IE
                script.text = code;
            }
            document.getElementsByTagName("head")[0].appendChild(script);
        }

        this.loadStyle = function (cssText) {
            var style = document.createElement("style");
            style.type = "text/css";
            try {
                // firefox、safari、chrome and Opera
                style.appendChild(document.createTextNode(cssText));
            } catch (ex) {
                // IE
                style.styleSheet.cssText = cssText;
            }
            document.getElementsByTagName("head")[0].appendChild(style);
        }

        this.init = function (config) {
            this.setConfig(config);
            var espUrl = document.getElementById('espConfig').src;
            var rootUrl = espUrl.substring(0, espUrl.toLowerCase().indexOf('/scripts/') + 1);
            this.url = espRootUrl;
            var addScripts = function (relativeURLArray, isAsync) {
                if (!relativeURLArray || relativeURLArray.length == 0)
                    return;
                var urls = '';
                for (var index = 0; index < relativeURLArray.length; index++) {

                    var url = relativeURLArray[index].indexOf('http:') >= 0 ? relativeURLArray[index] : (esp.url + relativeURLArray[index]);
                    urls += "<script " + (isAsync ? " async " : "") + " src='" + url + "'><\/script>";
                }
                document.write(urls);
            }

            var addStyles = function (relativeURLArray) {
                if (!relativeURLArray || relativeURLArray.length == 0)
                    return;
                var links = '';
                for (var index = 0; index < relativeURLArray.length; index++) {
                    var item = relativeURLArray[index];
                    var link = '';
                    var url = item.url.indexOf('http:') >= 0 ? item.url : (esp.url + item.url);

                    if (item.id)
                        link = "<link id='" + item.id + "' rel='stylesheet' type='text/css' href='" + url + "'>";
                    else
                        link = "<link rel='stylesheet' type='text/css' href='" + url + "'>";
                    links += link;
                }
                document.write(links);
            }

            var arcgisRoot = this.config.arcgis.root || rootUrl + 'arcgis_js_api';
            var arcgisVersion = this.config.arcgis.version || '4.8';
            var epScripts = [
                //EP通用扩展库
                'Scripts/Base/Jquery/3.3.1/linq.min.js',
                'Scripts/Base/ArcGIS/' + arcgisVersion + '/bundle.js',
                'Scripts/Base/ArcGIS/' + arcgisVersion + '/echarts4/bundle.js',
                'Scripts/Base/React/react.16.8.min.js',
                'Scripts/Base/React/react-dom.16.8.min.js',
                'Scripts/Base/React/browser.min.js',
                'Scripts/Base/ECharts/4/core/echarts.min.js',
                'Scripts/Base/ECharts/4/charts/bundle.js',
                'Scripts/ESP/base.js?v=1.95',
                'Scripts/Base/resizable/dist/bundle.js',
                'Scripts/Base/vmenu/js/jquery-accordion-menu.min.js',
                'Scripts/Base/DataTable/core/jquery.dataTables.min.js',
                'Scripts/Base/DataTable/bundle.js',
            ];

            var epStyles = [
                {
                    url: 'Scripts/Base/vmenu/css/jquery-accordion-menu.min.css'
                },
                {
                    url: 'Scripts/Base/vmenu/css/font-awesome.min.css'
                },
                {
                    url: 'Scripts/Base/DataTable/core/jquery.dataTables.min.css'
                },
                {
                    url: this.config.arcgis.root + '/esri/css/main.css'
                }
            ];
            addScripts(epScripts);
            addStyles(epStyles);
            window.dojoConfig = {
                has: {
                    "esri-featurelayer-webgl": 1
                },
                parseOnLoad: true,
                packages: [{
                    "name": "src",
                    "location": rootUrl + "Scripts/Base/ArcGIS/4/echarts3"
                }]
            };
            var _this = this;
            addScripts([
                rootUrl + 'Scripts/Base/ArcGIS/4/echarts3/bundle.min.js',
                arcgisRoot + '/init.js'
            ]);

            var _ajax = $.ajax;
            $.ajax = function (options) {
                options.error = function (XMLHttpRequest, msg, e) {
                    console.error(msg);
                };
                options.beforeSend = function (xhr) {
                    if (_this.config.token && _this.config.token)
                        xhr.setRequestHeader("token", _this.config.token);
                    else
                        xhr.setRequestHeader("token", window.getQueryString('token'));
                };
                options.complete = function (httpRequest, status) {
                    if (httpRequest.responseJSON && httpRequest.responseJSON.Code) {
                        const code = httpRequest.responseJSON.Code;
                        if (code === 2) {
                            this.backToLogin();
                        }
                    }
                };
                _ajax(options);
            }
        };

        this.load = function (name, domName) {
            var control = window[name];
            ReactDOM.render(control, document.getElementById(domName));
        }
    };
    window.EspConfig = EspConfig;
    window.esp = new EspConfig();
}());