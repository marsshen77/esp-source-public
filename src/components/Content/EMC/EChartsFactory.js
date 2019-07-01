
import EChartOptionCreator from './EChartOptionCreator';
import EChartSourceCreator from './EChartSourceCreator';
const EChartFactory = function (themeName) {
    this.themeName = themeName || esp.config.options.echarts.theme || 'default';
    /**
     * 加载图表 
     * @param {any} chartID
     * @param {any} option
     */
    this.InitChart = function (chartID, option) {
        if (document.getElementById(chartID)) {
            document.getElementById(chartID).innerHTML = '';
        }
        var chartDom = document.getElementById(chartID);
        echarts4.dispose(chartDom);
        var chart = echarts4.init(chartDom, this.themeName);
        chart.setOption(option, true);
        return chart;
    };
    /**
     * 加载饼状图
     * @param {any} chartID
     * @param {any} dataSource
     */
    this.LoadPie = function (chartID, dataSource, optionConfig) {
        var _this = this;

        var optionCreator = new EChartOptionCreator();
        optionCreator.GetOptionEx(optionConfig, 'BasePieChart', function (optionModel) {
            var esCreator = new EChartSourceCreator();
            var eChartDataSource = esCreator.CreatePieDataSource(dataSource);
            optionModel = optionCreator.SetPieDataToOption(eChartDataSource, optionModel);
            _this.InitChart(chartID, optionModel);
        });
    };
    /**
     * 加载字符云
     * @param {any} chartID
     * @param {any} dataSource
     */
    this.LoadWordCloud = function (chartID, dataSource, optionConfig) {
        var _this = this;

        var optionCreator = new EChartOptionCreator();
        optionCreator.GetOptionEx(optionConfig, 'WordCloudChart', function (optionModel) {
            var esCreator = new EChartSourceCreator();
            var eChartDataSource = esCreator.CreateWordCloudDataSource(dataSource);
            optionModel = optionCreator.SetWordCloudDataToOption(eChartDataSource, optionModel);
            _this.InitChart(chartID, optionModel);
        });
    };
    /**
    * 加载南丁格尔玫瑰图
    * @param {any} chartID
    * @param {any} dataSource
    */
    this.LoadRosePie = function (chartID, dataSource, optionConfig) {
        var _this = this;

        var optionCreator = new EChartOptionCreator();
        optionCreator.GetOptionEx(optionConfig, 'BaseRosePieChart', function (optionModel) {
            var esCreator = new EChartSourceCreator();
            var eChartDataSource = esCreator.CreateRosePieDataSource(dataSource);
            optionModel = optionCreator.SetRosePieDataToOption(eChartDataSource, optionModel);
            console.log(optionModel);
            _this.InitChart(chartID, optionModel);
        });
    };
    /**
     * 加载柱状图
     * @param {any} chartID
     * @param {any} dataSource
     */
    this.LoadBar = function (chartID, dataSource, optionConfig) {
        var _this = this;

        var optionCreator = new EChartOptionCreator();
        optionCreator.GetOptionEx(optionConfig, 'BaseBarChart', function (optionModel) {
            var esCreator = new EChartSourceCreator();
            var eChartDataSource = esCreator.CreateBarDataSource(dataSource);
            optionModel = optionCreator.SetBarDataToOption(eChartDataSource, optionModel);
            _this.InitChart(chartID, optionModel);
        });
    };
    /**
     * 加载象形柱状图
     * @param {any} chartID
     * @param {any} dataSource
     * @param {any} optionConfig
     */
    this.LoadPictorialBar = function (chartID, dataSource, optionConfig) {
        var _this = this;

        var optionCreator = new EChartOptionCreator();
        optionCreator.GetOptionEx(optionConfig, 'BasePictorialBarChart', function (optionModel) {
            var esCreator = new EChartSourceCreator();
            var eChartDataSource = esCreator.CreatePictorialBarDataSource(dataSource);
            optionModel = optionCreator.SetPictorialBarDataToOption(eChartDataSource, optionModel);
            console.log(optionModel);
            _this.InitChart(chartID, optionModel);
        });
    };
    /**
     * 加载折线图
     * @param {any} chartID
     * @param {any} dataSource
     */
    this.LoadLine = function (chartID, dataSource, optionConfig) {
        var _this = this;

        var optionCreator = new EChartOptionCreator();
        optionCreator.GetOptionEx(optionConfig, 'BaseLineChart', function (optionModel) {
            var esCreator = new EChartSourceCreator();
            var eChartDataSource = esCreator.CreateLineDataSource(dataSource);
            optionModel = optionCreator.SetLineDataToOption(eChartDataSource, optionModel);
            _this.InitChart(chartID, optionModel);
        });
    };
    /**
     * 加载力导向图
     * @param {any} chartID
     * @param {any} dataSource
     */
    this.LoadForce = function (chartID, dataSource, optionConfig) {
        var _this = this;
        var load = function () {
            var esCreator = new EChartSourceCreator();
            var eChartDataSource = esCreator.CreateForceDataSource(dataSource);

            var optionCreator = new EChartOptionCreator();
            var option = optionCreator.GetOption(dataSource.option || 'BaseForceChart');
            option = optionCreator.SetForceDataToOption(eChartDataSource, option);
            _this.InitChart(chartID, option);
        };
        if (!dataSource.option) {
            esp.requreJs(['BaseForceChart.js'], function (result) {
                load();
            });
        }
        else
            load();
    };
    /**
     * 加载漏斗图
     * @param {any} chartID
     * @param {any} dataSource
     */
    this.LoadFunnel = function (chartID, dataSource, optionConfig) {
        var _this = this;

        var optionCreator = new EChartOptionCreator();
        optionCreator.GetOptionEx(optionConfig, 'BaseFunnelChart', function (optionModel) {
            var esCreator = new EChartSourceCreator();
            var eChartDataSource = esCreator.CreateFunnelDataSource(dataSource);
            optionModel = optionCreator.SetFunnelDataToOption(eChartDataSource, optionModel);
            _this.InitChart(chartID, optionModel);
        });
    };
    /**
     * 加载仪表盘
     * @param {any} chartID
     * @param {any} dataSource
     */
    this.LoadGauge = function (chartID, dataSource, optionConfig) {
        var _this = this;

        var optionCreator = new EChartOptionCreator();
        optionCreator.GetOptionEx(optionConfig, 'BaseGaugeChart', function (optionModel) {
            var esCreator = new EChartSourceCreator();
            var eChartDataSource = esCreator.CreateGaugeDataSource(dataSource);
            optionModel = optionCreator.SetGaugeDataToOption(eChartDataSource, optionModel);
            _this.InitChart(chartID, optionModel);
        });
    };
    /**
     * 加载面积折线图
     * @param {any} chartID
     * @param {any} dataSource
     */
    this.LoadLineArea = function (chartID, dataSource, optionConfig) {
        var _this = this;

        var optionCreator = new EChartOptionCreator();
        optionCreator.GetOptionEx(optionConfig, 'BaseLineAreaChart', function (optionModel) {
            var esCreator = new EChartSourceCreator();
            var eChartDataSource = esCreator.CreateLineAreaDataSource(dataSource);
            optionModel = optionCreator.SetLineAreaDataToOption(eChartDataSource, optionModel);
            _this.InitChart(chartID, optionModel);
        });
    };
    /**
     * 加载堆积折线图
     * @param {any} chartID
     * @param {any} dataSource
     */
    this.LoadStackLine = function (chartID, dataSource, optionConfig) {
        var _this = this;

        var optionCreator = new EChartOptionCreator();
        optionCreator.GetOptionEx(optionConfig, 'BaseStackLineChart', function (optionModel) {
            var esCreator = new EChartSourceCreator();
            var eChartDataSource = esCreator.CreateStackLineDataSource(dataSource);
            optionModel = optionCreator.SetStackLineDataToOption(eChartDataSource, optionModel);
            _this.InitChart(chartID, optionModel);
        });
    };
    /**
     * 加载堆积柱状图
     * @param {any} chartID
     * @param {any} dataSource
     */
    this.LoadStackBar = function (chartID, dataSource, optionConfig) {
        var _this = this;

        var optionCreator = new EChartOptionCreator();
        optionCreator.GetOptionEx(optionConfig, 'BaseStackBarChart', function (optionModel) {
            var esCreator = new EChartSourceCreator();
            var eChartDataSource = esCreator.CreateStackBarDataSource(dataSource);
            optionModel = optionCreator.SetStackBarDataToOption(eChartDataSource, optionModel);
            _this.InitChart(chartID, optionModel);
        });
    };
    /**
     * 加载韦恩图
     * @param {any} chartID
     * @param {any} dataSource
     */
    this.LoadVennDiagram = function (chartID, dataSource, optionConfig) {
        var _this = this;

        var optionCreator = new EChartOptionCreator();
        optionCreator.GetOptionEx(optionConfig, 'BaseVennDiagramChart', function (optionModel) {
            var esCreator = new EChartSourceCreator();
            var eChartDataSource = esCreator.CreateVennDiagramDataSource(dataSource);
            optionModel = optionCreator.SetVennDiagramDataToOption(eChartDataSource, optionModel);
            _this.InitChart(chartID, optionModel);
        });
    };
    /**
     * 加载雷达图
     * @param {any} chartID
     * @param {any} dataSource
     * @param {any} optionConfig
     */
    this.LoadRadar = function (chartID, dataSource, optionConfig) {
        var _this = this;

        var optionCreator = new EChartOptionCreator();
        optionCreator.GetOptionEx(optionConfig, 'BaseRadarChart', function (optionModel) {
            var esCreator = new EChartSourceCreator();
            var eChartDataSource = esCreator.CreateRadarDataSource(dataSource);
            optionModel = optionCreator.SetRadarDataToOption(eChartDataSource, optionModel);
            _this.InitChart(chartID, optionModel);
        });
    };
    /**
     * 加载树形图
     * @param {any} chartID
     * @param {any} dataSource
     * @param {any} optionConfig
     */
    this.LoadTree = function (chartID, dataSource, optionConfig) {
        var _this = this;

        var optionCreator = new EChartOptionCreator();
        optionCreator.GetOptionEx(optionConfig, 'BaseTreeChart', function (optionModel) {
            var esCreator = new EChartSourceCreator();
            var eChartDataSource = esCreator.CreateTreeDataSource(dataSource);
            optionModel = optionCreator.SetTreeDataToOption(eChartDataSource, optionModel);
            console.log(optionModel);
            _this.InitChart(chartID, optionModel);
        });
    };
    /**
     * 加载和弦图
     * @param {any} chartID
     * @param {any} dataSource
     */
    this.LoadChord = function (chartID, dataSource, optionConfig) {
        var _this = this;
        var load = function () {
            var esCreator = new EChartSourceCreator();
            var eChartDataSource = esCreator.CreateChordDataSource(dataSource);

            var optionCreator = new EChartOptionCreator();
            var option = optionCreator.GetOption(dataSource.option || 'ChordChart');
            option = optionCreator.SetChordDataToOption(eChartDataSource, option);
            _this.InitChart(chartID, option);
        };
        if (!dataSource.option) {
            esp.requreJs(['ChordChart.js'], function (result) {
                load();
            });
        }
        else
            load();
    };
    /**
     * 加载散点图
     * @param {any} chartID
     * @param {any} dataSource
     */
    this.LoadScatter = function (chartID, dataSource, optionConfig) {
        var _this = this;

        var optionCreator = new EChartOptionCreator();
        optionCreator.GetOptionEx(optionConfig, 'BaseScatterChart', function (optionModel) {
            var esCreator = new EChartSourceCreator();
            var eChartDataSource = esCreator.CreateScatterDataSource(dataSource);
            optionModel = optionCreator.SetScatterDataToOption(eChartDataSource, optionModel);
            console.log(optionModel)
            _this.InitChart(chartID, optionModel);
        });
    };
    /**
     * 加载字符云
     * @param {any} chartID
     * @param {any} dataSource
     */
    this.LoadWordCloud = function (chartID, dataSource, optionConfig) {
        var _this = this;
        var load = function () {
            var esCreator = new EChartSourceCreator();
            var eChartDataSource = esCreator.CreateWordCloudDataSource(dataSource);

            var optionCreator = new EChartOptionCreator();
            var option = optionCreator.GetOption(dataSource.option || 'WordCloudChart');
            option = optionCreator.SetWordCloudDataToOption(eChartDataSource, option);
            _this.InitChart(chartID, option);
        };
        if (!dataSource.option) {
            esp.requreJs(['WordCloudChart.js'], function (result) {
                load();
            });
        }
        else
            load();
    };
}
export default EChartFactory;