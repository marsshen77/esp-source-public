
const EChartOptionCreator = function () {
    this.GetOption = function (optionName, parmeters) {
        var target = new window[optionName];
        var option = parmeters ? target.getOption(parmeters) : target.getOption();

        return option;
    };

    this.GetOptionEx = function (optionConfig, defaultOptionName, callBack) {
        var _this = this;
        var getOptionModel = function (optionName) {
            var option = _this.GetOption(optionName, optionConfig.Parmeters);
            if (callBack)
                callBack(option);
        };
        if (!optionConfig) {
            esp.requreJs([defaultOptionName + '.js'], function (result) {
                getOptionModel(defaultOptionName);
            });
        }
        else if (optionConfig.Url) {
            esp.loadScriptFile(optionConfig.Url, function () {
                getOptionModel(optionConfig.Name);
            });
        }
        else if (optionConfig.OptionJs) {
            esp.loadScript(optionConfig.OptionJs);
            getOptionModel(optionConfig.Name);
        }
        else {
            if (optionConfig.Name) {
                getOptionModel(optionConfig.Name);
            }
            else {
                esp.requreJs([defaultOptionName + '.js'], function (result) {
                    getOptionModel(defaultOptionName);
                });
            }
        }
    }
    /**
     * 加载饼状图
     * @param {any} dataSource
     * @param {any} option
     */
    this.SetPieDataToOption = function (dataSource, option) {
        var seriesLength = option.series.length;
        var templateIndex = 0;//设置初始值为0，未使用任何template
        for (var i = 0, j = dataSource.series.length; i < j; i++) {
            var namedSeriesItem = null;
            var templateItem = null;
            //当前数据项
            var currentItem = dataSource.series[i];
            //先查找已配置模板的seriesItem
            namedSeriesItem = findFirst(option.series, function (item) {
                return item.name == currentItem.name;
            });
            console.log(namedSeriesItem)
            //再查找未配置模板的seriesItem
            templateItem = findFirstFromToIndex(templateIndex, seriesLength, option.series, function (item) {
                return item.name == "";
            });
            console.log(templateItem)
            var series = null;
            if (namedSeriesItem) {//找到对应名称的
                series = namedSeriesItem;
            } else if (templateItem) {//找到名称为空的(模板)
                series = $.extend(true, {}, templateItem);
                templateIndex = templateIndex + 1;//匹配后面的template
                //seriesLength++;
            } else {//新建模板
                series = {
                    name: '',
                    type: 'pie',
                    radius: ['0%', '50%'],
                    selectedMode: 'single',
                    selectedOffset: 10,
                    center: ['50%', '60%'],
                    data: []
                };
            }
            $.each(currentItem.data, function () {
                option.legend.data.push(this.name);
            });
            series.name = currentItem.name;
            series.data = currentItem.data;
            if (!namedSeriesItem) {
                option.series.push(series);
            }

        }
        removeAll(option.series, function (item) {
            return item.name == "";
        });
        return option;
    };
    /**
     * 加载南丁格尔玫瑰图
     * @param {any} dataSource
     * @param {any} option
     */
    this.SetRosePieDataToOption = function (dataSource, option) {
        var seriesLength = option.series.length;
        var templateIndex = 0;//设置初始值为0，未使用任何template
        for (var i = 0, j = dataSource.series.length; i < j; i++) {
            var namedSeriesItem = null;
            var templateItem = null;
            //当前数据项
            var currentItem = dataSource.series[i];
            //先查找已配置模板的seriesItem
            namedSeriesItem = findFirst(option.series, function (item) {
                return item.name == currentItem.name;
            });
            console.log(namedSeriesItem)
            //再查找未配置模板的seriesItem
            templateItem = findFirstFromToIndex(templateIndex, seriesLength, option.series, function (item) {
                return item.name == "";
            });
            console.log(templateItem)
            var series = null;
            if (namedSeriesItem) {//找到对应名称的
                series = namedSeriesItem;
            } else if (templateItem) {//找到名称为空的(模板)
                series = $.extend(true, {}, templateItem);
                templateIndex = templateIndex + 1;//匹配后面的template
                //seriesLength++;
            } else {//新建模板
                series = {
                    name: '',
                    type: 'pie',
                    radius: ['10%', '50%'],
                    center: ['50%', '60%'],
                    roseType: 'radius',
                    data: []
                };
            }
            $.each(currentItem.data, function () {
                option.legend.data.push(this.name);
            });
            series.name = currentItem.name;
            series.data = currentItem.data;
            if (!namedSeriesItem) {
                option.series.push(series);
            }

        }
        removeAll(option.series, function (item) {
            return item.name == "";
        });
        return option;
    };
    /**
     * 加载柱状图
     * @param {any} dataSource
     * @param {any} option
     */
    this.SetBarDataToOption = function (dataSource, option) {
        if (option.xAxis && option.xAxis[0].data)
            option.xAxis[0].data = dataSource.axisData;
        else if (option.yAxis && option.yAxis[0].data)
            option.yAxis[0].data = dataSource.axisData;
        var seriesLength = option.series.length;
        var templateIndex = 0;//设置初始值为0，未使用任何template
        for (var i = 0, j = dataSource.series.length; i < j; i++) {
            var namedSeriesItem = null;
            var templateItem = null;
            //当前数据项
            var currentItem = dataSource.series[i];
            //先查找已配置模板的seriesItem
            namedSeriesItem = findFirst(option.series, function (item) {
                return item.name == currentItem.name;
            });
            //再查找未配置模板的seriesItem
            templateItem = findFirstFromToIndex(templateIndex, seriesLength, option.series, function (item) {
                return item.name == "";
            });
            var series = null;
            if (namedSeriesItem) {//找到对应名称的
                series = namedSeriesItem;
            } else if (templateItem) {//找到名称为空的(模板)
                series = $.extend(true, {}, templateItem);
                templateIndex = templateIndex + 1;//匹配后面的template
                //seriesLength++;
            } else {//新建模板
                series = {
                    name: '',
                    type: 'bar',
                    smooth: true,
                    data: []
                };
            }
            option.legend.data.push(currentItem.name);
            series.name = currentItem.name;
            series.data = currentItem.data;
            if (!namedSeriesItem) {
                option.series.push(series);
            }
        }
        removeAll(option.series, function (item) {
            return item.name == "";
        });
        return option;
    };
    /**
     * 加载象形柱状图
     * @param {any} dataSource
     * @param {any} option
     */
    this.SetPictorialBarDataToOption = function (dataSource, option) {
        var seriesLength = option.series.length;
        var templateIndex = 0;//设置初始值为0，未使用任何template
        for (var i = 0, j = dataSource.series.length; i < j; i++) {
            var namedSeriesItem = null;
            var templateItem = null;
            //当前数据项
            var currentItem = dataSource.series[i];
            //先查找已配置模板的seriesItem
            namedSeriesItem = findFirst(option.series, function (item) {
                return item.name == currentItem.name;
            });
            //再查找未配置模板的seriesItem
            templateItem = findFirstFromToIndex(templateIndex, seriesLength, option.series, function (item) {
                return item.name == "";
            });
            var series = null;
            if (namedSeriesItem) {//找到对应名称的
                series = namedSeriesItem;
            } else if (templateItem) {//找到名称为空的(模板)
                series = $.extend(true, {}, templateItem);
                templateIndex = templateIndex + 1;//匹配后面的template
                //seriesLength++;
            }
            option.legend.data.push(currentItem.name);
            series.name = currentItem.name;
            for (var n = 0; n < currentItem.data.length; n++) {
                series.data.push(currentItem.data[n].value);
                if (i == 0) {
                    option.xAxis[0].data.push(currentItem.data[n].name);
                }
            }
            if (!namedSeriesItem) {
                option.series.push(series);
            }
        }
        removeAll(option.series, function (item) {
            return item.name == "";
        });
        return option;
    };
    /**
     * 加载折线图
     * @param {any} dataSource
     * @param {any} option
     */
    this.SetLineDataToOption = function (dataSource, option) {
        if (option.xAxis && option.xAxis[0].data)
            option.xAxis[0].data = dataSource.axisData;
        else if (option.yAxis && option.yAxis[0].data)
            option.yAxis[0].data = dataSource.axisData;
        var seriesLength = option.series.length;
        var templateIndex = 0;//设置初始值为0，未使用任何template
        for (var i = 0, j = dataSource.series.length; i < j; i++) {
            var namedSeriesItem = null;
            var templateItem = null;
            //当前数据项
            var currentItem = dataSource.series[i];
            //先查找已配置模板的seriesItem
            namedSeriesItem = findFirst(option.series, function (item) {
                return item.name == currentItem.name;
            });
            //再查找未配置模板的seriesItem
            templateItem = findFirstFromToIndex(templateIndex, seriesLength, option.series, function (item) {
                return item.name == "";
            });
            var series = null;
            if (namedSeriesItem) {//找到对应名称的
                series = namedSeriesItem;
            } else if (templateItem) {//找到名称为空的(模板)
                series = $.extend(true, {}, templateItem);
                templateIndex = templateIndex + 1;//匹配后面的template
                //seriesLength++;
            } else {//新建模板
                series = {
                    name: '',
                    type: 'line',
                    smooth: true,
                    data: []
                };
            }
            option.legend.data.push(currentItem.name);
            series.name = currentItem.name;
            series.data = currentItem.data;
            if (!namedSeriesItem) {
                option.series.push(series);
            }
        }
        removeAll(option.series, function (item) {
            return item.name == "";
        });
        return option;
    };
    /**
     * 加载力导向图
     * @param {any} dataSource
     * @param {any} option
     */
    this.SetForceDataToOption = function (dataSource, option) {
        var templateItem = findFirst(option.series, function (item) {
            return item.name == "";
        });

        $.each(dataSource.series, function () {
            var currentItem = this;
            var series = null;
            series = findFirst(option.series, function (item) {
                return item.name == currentItem.name;
            });
            if (series == null)
                series = $.extend(true, {}, templateItem);

            option.legend.data = currentItem.categories.map(function (category) {
                return category.name;
            });

            series.name = "人物关系";
            series.categories = currentItem.categories;
            series.nodes = currentItem.nodes;
            series.links = currentItem.links;

            option.series.push(series);
        });

        removeAll(option.series, function (item) {
            return item.name == "";
        });

        return option;
    };
    /**
     * 加载漏斗图
     * @param {any} option
     * @param {any} dataSource
     */
    this.SetFunnelDataToOption = function (dataSource, option) {
        var templateItem = findFirst(option.series, function (item) {
            return item.name == "";
        });
        $.each(dataSource.series, function () {
            var currentItem = this;
            var series = null;
            series = findFirst(option.series, function (item) {
                return item.name == currentItem.name;
            });
            if (series == null)
                series = $.extend(true, {}, templateItem);

            option.legend.data.push(this.name);
            series.name = this.name;
            series.data = this.data;
            option.series.push(series);
        });
        removeAll(option.series, function (item) {
            return item.name == "";
        });

        return option;
    };
    /**
     * 加载仪表盘
     * @param {any} dataSource
     * @param {any} option
     */
    this.SetGaugeDataToOption = function (dataSource, option) {
        var templateItem = findFirst(option.series, function (item) {
            return item.name == "";
        });
        $.each(dataSource.series, function () {
            var currentItem = this;
            var series = null;
            series = findFirst(option.series, function (item) {
                return item.name == currentItem.name;
            });
            if (series == null)
                series = $.extend(true, {}, templateItem);

            series.name = this.name;
            series.data = this.data;
            option.series.push(series);
        });
        removeAll(option.series, function (item) {
            return item.name == "";
        });
        return option;
    };
    /**
     * 加载折线区域图
     * @param {any} dataSource
     * @param {any} option
     */
    this.SetLineAreaDataToOption = function (dataSource, option) {
        if (option.xAxis && option.xAxis[0].data)
            option.xAxis[0].data = dataSource.axisData;
        else if (option.yAxis && option.yAxis[0].data)
            option.yAxis[0].data = dataSource.axisData;
        var seriesLength = option.series.length;
        var templateIndex = 0;//设置初始值为0，未使用任何template
        for (var i = 0, j = dataSource.series.length; i < j; i++) {
            var namedSeriesItem = null;
            var templateItem = null;
            //当前数据项
            var currentItem = dataSource.series[i];
            //先查找已配置模板的seriesItem
            namedSeriesItem = findFirst(option.series, function (item) {
                return item.name == currentItem.name;
            });
            //再查找未配置模板的seriesItem
            templateItem = findFirstFromToIndex(templateIndex, seriesLength, option.series, function (item) {
                return item.name == "";
            });
            var series = null;
            if (namedSeriesItem) {//找到对应名称的
                series = namedSeriesItem;
            } else if (templateItem) {//找到名称为空的(模板)
                series = $.extend(true, {}, templateItem);
                templateIndex = templateIndex + 1;//匹配后面的template
                //seriesLength++;
            } else {//新建模板
                series = {
                    name: '',
                    type: 'line',
                    itemStyle: {
                        normal: {
                            areaStyle: {
                                type: 'default'
                            }
                        }
                    },
                    smooth: true,
                    data: []
                };
            }
            option.legend.data.push(currentItem.name);
            series.name = currentItem.name;
            series.data = currentItem.data;
            if (!namedSeriesItem) {
                option.series.push(series);
            }
        }
        removeAll(option.series, function (item) {
            return item.name == "";
        });
        return option;
    };
    /**
     * 加载堆积折线图
     * @param {any} dataSource
     * @param {any} option
     */
    this.SetStackLineDataToOption = function (dataSource, option) {
        if (option.xAxis && option.xAxis[0].data)
            option.xAxis[0].data = dataSource.axisData;
        else if (option.yAxis && option.yAxis[0].data)
            option.yAxis[0].data = dataSource.axisData;
        var seriesLength = option.series.length;
        var templateIndex = 0;//设置初始值为0，未使用任何template
        for (var i = 0, j = dataSource.series.length; i < j; i++) {
            var namedSeriesItem = null;
            var templateItem = null;
            //当前数据项
            var currentItem = dataSource.series[i];
            //先查找已配置模板的seriesItem
            namedSeriesItem = findFirst(option.series, function (item) {
                return item.name == currentItem.name;
            });
            //再查找未配置模板的seriesItem
            templateItem = findFirstFromToIndex(templateIndex, seriesLength, option.series, function (item) {
                return item.name == "";
            });
            var series = null;
            if (namedSeriesItem) {//找到对应名称的
                series = namedSeriesItem;
            } else if (templateItem) {//找到名称为空的(模板)
                series = $.extend(true, {}, templateItem);
                templateIndex = templateIndex + 1;//匹配后面的template
                //seriesLength++;
            } else {//新建模板
                series = {
                    name: '',
                    stack: '',
                    type: 'line',
                    smooth: true,
                    data: []
                };
            }
            option.legend.data.push(currentItem.name);
            series.name = currentItem.name;
            series.data = currentItem.data;
            if (!series.stack) {
                series.stack = currentItem.stack;
            }
            if (!namedSeriesItem) {
                option.series.push(series);
            }
        }
        removeAll(option.series, function (item) {
            return item.name == "";
        });

        return option;
    };
    /**
     * 加载堆积柱状图
     * @param {any} dataSource
     * @param {any} option
     */
    this.SetStackBarDataToOption = function (dataSource, option) {
        if (option.xAxis && option.xAxis[0].data)
            option.xAxis[0].data = dataSource.axisData;
        else if (option.yAxis && option.yAxis[0].data)
            option.yAxis[0].data = dataSource.axisData;
        var seriesLength = option.series.length;
        var templateIndex = 0;//设置初始值为0，未使用任何template
        for (var i = 0, j = dataSource.series.length; i < j; i++) {
            var namedSeriesItem = null;
            var templateItem = null;
            //当前数据项
            var currentItem = dataSource.series[i];
            //先查找已配置模板的seriesItem
            namedSeriesItem = findFirst(option.series, function (item) {
                return item.name == currentItem.name;
            });
            //再查找未配置模板的seriesItem
            templateItem = findFirstFromToIndex(templateIndex, seriesLength, option.series, function (item) {
                return item.name == "";
            });
            var series = null;
            if (namedSeriesItem) {//找到对应名称的
                series = namedSeriesItem;
            } else if (templateItem) {//找到名称为空的(模板)
                series = $.extend(true, {}, templateItem);
                templateIndex = templateIndex + 1;//匹配后面的template
                //seriesLength++;
            } else {//新建模板
                series = {
                    name: '',
                    type: 'bar',
                    stack: '',
                    smooth: true,
                    data: []
                };
            }
            option.legend.data.push(currentItem.name);
            series.name = currentItem.name;
            series.data = currentItem.data;
            if (!series.stack) {
                series.stack = currentItem.stack;
            }
            if (!namedSeriesItem) {
                option.series.push(series);
            }
        }
        removeAll(option.series, function (item) {
            return item.name == "";
        });
        return option;
    };
    /**
     * 加载韦恩图
     * @param {any} dataSource
     * @param {any} option
     */
    this.SetVennDiagramDataToOption = function (dataSource, option) {
        var series = {
            name: '韦恩图',
            type: 'venn',
            itemStyle: {
                normal: {
                    label: {
                        show: true,
                        textStyle: {
                            fontFamily: 'Arial, Verdana, sans-serif',
                            fontSize: 16,
                            fontStyle: 'italic',
                            fontWeight: 'bolder'
                        }
                    },
                    labelLine: {
                        show: false,
                        length: 10,
                        lineStyle: {
                            // color: 各异,
                            width: 1,
                            type: 'solid'
                        }
                    }
                },
                emphasis: {
                    color: '#cc99cc',
                    borderWidth: 3,
                    borderColor: '#996699'
                }
            },
            data: [
                { value: 100, name: '访问' },
                { value: 50, name: '咨询' },
                { value: 20, name: '公共' }
            ]
        }
        //series.name = dataSource.series.name;
        //series.data = dataSource.series.data;
        option.series.push(series);
        removeAll(option.series, function (item) {
            return item.name == "";
        });
        return option;
    };
    /**
     * 加载和弦图
     * @param {any} dataSource
     * @param {any} option
     */
    this.SetChordDataToOption = function (dataSource, option) {
        var seriesLength = option.series.length;
        var templateIndex = 0;//设置初始值为0，未使用任何template
        for (var i = 0, j = dataSource.series.length; i < j; i++) {
            var namedSeriesItem = null;
            var templateItem = null;
            //当前数据项
            var currentItem = dataSource.series[i];
            //先查找已配置模板的seriesItem,在和弦图下，默认为单系列，不支持多系列，故返回空
            namedSeriesItem = findFirst(option.series, function (item) {
                return item.name == currentItem.name;
            });
            //再查找未配置模板的seriesItem
            templateItem = findFirstFromToIndex(templateIndex, seriesLength, option.series, function (item) {
                return item.name == "";
            });
            var series = null;
            if (namedSeriesItem) {//找到对应名称的
                series = namedSeriesItem;
            } else if (templateItem) {//找到名称为空的(模板)
                series = $.extend(true, {}, templateItem);
                templateIndex = templateIndex + 2;//后面会push一个
                //seriesLength++;
            } else {//新建模板
                series = {
                    name: '',
                    type: 'chord',
                    sort: 'ascending',
                    sortSub: 'descending',
                    showScale: true,
                    showScaleText: true,
                    nodes: [],//data和nodes一样
                    itemStyle: {
                        normal: {
                            label: {
                                show: false
                            }
                        }
                    },
                    links: []//links和matrix二选一
                };
            }
            option.legend.data = dataSource.series[i].nodes.map(function (nodeitem) {
                return nodeitem.name;
            });
            series.name = currentItem.name || '和弦图系列' + i;
            series.nodes = currentItem.nodes;
            series.links = currentItem.links;
            if (!namedSeriesItem) {
                option.series.push(series);
            }

        }
        removeAll(option.series, function (item) {
            return item.name == "";
        });
        return option;
    };
    /**
     * 加载散点图
     * @param {any} dataSource
     * @param {any} option
     */
    this.SetScatterDataToOption = function (dataSource, option) {
        console.log(dataSource, option)
        if (option.baseOption) {
            //时间离散点
            option.baseOption.title.text = dataSource.timeline[0].substring(0, 10);
            option.baseOption.visualMap.categories = dataSource.scatterPointName;
            var sizeFunction = function (x) {
                //var y = Math.sqrt(x/100) + 0.1;
                return x * 150;
            };
            for (var n = 0; n < dataSource.timeline.length; n++) {
                option.baseOption.timeline.data.push(dataSource.timeline[n].substring(0, 10));
                option.options.push({
                    title: {
                        show: true,
                        'text': dataSource.timeline[n].substring(0, 10) + ''
                    },
                    series: {
                        name: dataSource.timeline[n].substring(0, 10),
                        type: 'scatter',
                        itemStyle: {
                            normal: {
                                opacity: 0.8,
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowOffsetY: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        },
                        symbolSize: function (val) {
                            return sizeFunction(val[1]);
                        },
                        data: dataSource.series[n],
                    }
                });
            }

        }
        else {
            //普通散点图

            //$.each(option.options, function () {
            //    var optionItem = this;
            //    var templateItem = findFirst(optionItem.series, function (item) {
            //        return item.name == "";
            //    });
            //    $.each(dataSource.series, function () {
            //        var currentItem = this;
            //        var series = null;
            //        series = findFirst(optionItem.series, function (item) {
            //            return item.name == currentItem.name;
            //        });
            //        if (series == null)
            //            series = $.extend(true, {}, templateItem);
            //        optionItem.legend.data.push(this.optionName);
            //        series.name = this.name;
            //        series.data = this.data;
            //        optionItem.series.push(series);
            //    });
            //    removeAll(optionItem.series, function (item) {
            //        return item.name == "";
            //    });
            //    option.timeline.data = dataSource.timeLineName;
            //})
        }
        return option;
    };
    /**
     * 加载字符云
     * @param {any} dataSource
     * @param {any} option
     */
    this.SetWordCloudDataToOption = function (dataSource, option) {
        var createRandomItemStyle = function () {
            return {
                normal: {
                    color: 'rgb(' + [
                        Math.round(Math.random() * 160),
                        Math.round(Math.random() * 160),
                        Math.round(Math.random() * 160)
                    ].join(',') + ')'
                }
            };
        };
        var seriesLength = option.series.length;
        var templateIndex = 0;//设置初始值为0，未使用任何template
        for (var i = 0, j = dataSource.series.length; i < j; i++) {
            var namedSeriesItem = null;
            var templateItem = null;
            //当前数据项
            var currentItem = dataSource.series[i];
            //先查找已配置模板的seriesItem,在字符云下，默认为单系列，不支持多系列，故返回空
            namedSeriesItem = findFirst(option.series, function (item) {
                return item.name == currentItem.name;
            });
            //再查找未配置模板的seriesItem
            templateItem = findFirstFromToIndex(templateIndex, seriesLength, option.series, function (item) {
                return item.name == "";
            });
            var series = null;
            if (namedSeriesItem) {//找到对应名称的
                series = namedSeriesItem;
            } else if (templateItem) {//找到名称为空的(模板)
                series = $.extend(true, {}, templateItem);
                templateIndex = templateIndex + 2;//后面会push一个
                //seriesLength++;
            } else {//新建模板
                series = {
                    name: '',
                    type: 'wordCloud',
                    size: ['80%', '80%'],
                    textRotation: [0, 45, 90, -45],
                    textPadding: 0,
                    autoSize: {
                        enable: true,
                        minSize: 14
                    },
                    data: []
                };
            }
            series.name = currentItem.name || '字符云系列' + i;
            series.data = currentItem.data.map(function (dataItem) {
                return {
                    name: dataItem.name,
                    value: dataItem.value,
                    itemStyle: createRandomItemStyle(),
                };
            });
            if (!namedSeriesItem) {
                option.series.push(series);
            }

        }
        removeAll(option.series, function (item) {
            return item.name == "";
        });
        return option;
    };
    /**
     * 加载雷达图
     * @param {any} dataSource
     * @param {any} option
     */
    this.SetRadarDataToOption = function (dataSource, option) {
        var seriesLength = option.series.length;
        var templateIndex = 0;//设置初始值为0，未使用任何template
        for (var i = 0, j = dataSource.series.length; i < j; i++) {
            var namedSeriesItem = null;
            var templateItem = null;
            //当前数据项
            var currentItem = dataSource.series[i];
            //先查找已配置模板的seriesItem
            namedSeriesItem = findFirst(option.series, function (item) {
                return item.name == currentItem.name;
            });
            //再查找未配置模板的seriesItem
            templateItem = findFirstFromToIndex(templateIndex, seriesLength, option.series, function (item) {
                return item.name == "";
            });
            var series = null;
            if (namedSeriesItem) {//找到对应名称的
                series = namedSeriesItem;
            } else if (templateItem) {//找到名称为空的(模板)
                series = $.extend(true, {}, templateItem);
                templateIndex = templateIndex + 1;//匹配后面的template
                //seriesLength++;
            } else {//新建模板
                series = {
                    name: '',
                    type: 'radar',
                    data: []
                };
            }
            $.each(currentItem.data, function () {
                option.legend.data.push(this.name);
            });
            series.name = currentItem.sourceName;
            series.data = currentItem.data;
            if (!namedSeriesItem) {
                option.series.push(series);
            }
        }
        option.radar.indicator = dataSource.indicator;
        removeAll(option.series, function (item) {
            return item.name == "";
        });
        return option;
    };
    /**
     * 加载树形图
     * @param {any} dataSource
     * @param {any} option
     */
    this.SetTreeDataToOption = function (dataSource, option) {
        var seriesLength = option.series.length;
        var templateIndex = 0;//设置初始值为0，未使用任何template
        for (var i = 0, j = dataSource.series.length; i < j; i++) {
            var namedSeriesItem = null;
            var templateItem = null;
            //当前数据项
            var currentItem = dataSource.series[i];
            //先查找已配置模板的seriesItem
            namedSeriesItem = findFirst(option.series, function (item) {
                return item.name == currentItem.name;
            });
            //再查找未配置模板的seriesItem
            templateItem = findFirstFromToIndex(templateIndex, seriesLength, option.series, function (item) {
                return item.name == "";
            });
            var series = null;
            if (namedSeriesItem) {//找到对应名称的
                series = namedSeriesItem;
            } else if (templateItem) {//找到名称为空的(模板)
                series = $.extend(true, {}, templateItem);
                templateIndex = templateIndex + 1;//匹配后面的template
                //seriesLength++;
            } else {//新建模板
                series = {
                    type: 'tree',
                    name: '',
                    data: [],
                    symbolSize: 12,
                    label: {
                        normal: {
                            position: 'left',
                            verticalAlign: 'middle',
                            align: 'right',
                            fontSize: 20,
                            color: '#35f5ff'
                        }
                    },
                    leaves: {
                        label: {
                            normal: {
                                position: 'right',
                                verticalAlign: 'middle',
                                align: 'left'
                            }
                        }
                    },
                }
            }
            option.legend.data.push(currentItem.name);
            series.name = currentItem.name;
            series.data.push(currentItem.data);
            if (!namedSeriesItem) {
                option.series.push(series);
            }
        }
        removeAll(option.series, function (item) {
            return item.name == "";
        });
        return option;
    };
};
export default EChartOptionCreator;
