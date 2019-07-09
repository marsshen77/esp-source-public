
import Enumerable from 'linq';
const EChartSourceCreator = function () {
    /**
     * 加载饼状图
     * @param {any} dataSource
     */
    this.CreatePieDataSource = function (dataSource) {
        if (!dataSource)
            return null;

        var columns = Enumerable.from(dataSource).groupJoin("$.name").select("$.name").distinct().toArray();//所有不重复的Name
        var categoryResult = Enumerable.from(dataSource).groupJoin("$.category").select("$.category").distinct().toArray();//所有不重复的Category

        var series = [];
        var categorySource = [];
        var data = [];
        for (var j = 0; j < dataSource.length; j++) {
            if (categoryResult[0] == dataSource[j].category) {
                categorySource.push(dataSource[j]);
            }
        }
        for (var n = 0; n < columns.length; n++) {
            var categoryData = {};
            var value = null;
            for (var m = 0; m < categorySource.length; m++) {
                if (categorySource[m].name == columns[n]) {
                    value = categorySource[m].value;
                }
            }
            categoryData = {
                name: columns[n],
                value: value
            }
            data.push(categoryData);
        }
        var seriesData = {
            name: categoryResult[0],
            data: data
        }
        series.push(seriesData);

        var result = {
            axisData: columns,
            series: series
        };
        return result;
    }
    /**
     * 加载字符云
     * @param {any} dataSource
     */
    this.CreateWordCloudDataSource = function (dataSource) {
        if (!dataSource)
            return null;

        var columns = Enumerable.from(dataSource).groupJoin("$.name").select("$.name").distinct().toArray();//所有不重复的Name
        var categoryResult = Enumerable.from(dataSource).groupJoin("$.category").select("$.category").distinct().toArray();//所有不重复的Category

        var series = [];
        var categorySource = [];
        var data = [];
        for (var j = 0; j < dataSource.length; j++) {
            if (categoryResult[0] == dataSource[j].category) {
                categorySource.push(dataSource[j]);
            }
        }
        for (var n = 0; n < columns.length; n++) {
            var categoryData = {};
            var value = null;
            for (var m = 0; m < categorySource.length; m++) {
                if (categorySource[m].name == columns[n]) {
                    value = categorySource[m].value;
                }
            }
            categoryData = {
                name: columns[n],
                value: value
            }
            data.push(categoryData);
        }
        var seriesData = {
            name: categoryResult[0],
            data: data
        }
        series.push(seriesData);

        var result = {
            axisData: columns,
            series: series
        };
        return result;
    }
    /**
     * 加载南丁格尔玫瑰图
     * @param {any} dataSource
     */
    this.CreateRosePieDataSource = function (dataSource) {
        if (!dataSource)
            return null;

        var columns = Enumerable.from(dataSource).groupJoin("$.name").select("$.name").distinct().toArray();//所有不重复的Name
        var categoryResult = Enumerable.from(dataSource).groupJoin("$.category").select("$.category").distinct().toArray();//所有不重复的Category

        var series = [];
        var categorySource = [];
        var data = [];
        for (var j = 0; j < dataSource.length; j++) {
            if (categoryResult[0] == dataSource[j].category) {
                categorySource.push(dataSource[j]);
            }
        }
        for (var n = 0; n < columns.length; n++) {
            var categoryData = {};
            var value = null;
            for (var m = 0; m < categorySource.length; m++) {
                if (categorySource[m].name == columns[n]) {
                    value = categorySource[m].value;
                }
            }
            categoryData = {
                name: columns[n],
                value: value
            }
            data.push(categoryData);
        }
        var seriesData = {
            name: categoryResult[0],
            data: data
        }
        series.push(seriesData);

        var result = {
            axisData: columns,
            series: series
        };
        return result;
    }
    /**
     * 加载柱状图
     * @param {any} dataSource
     */
    this.CreateBarDataSource = function (dataSource) {
        if (!dataSource)
            return null

        var columns = Enumerable.from(dataSource).groupJoin("$.name").select("$.name").distinct().toArray();//所有不重复的Name
        var categoryResult = Enumerable.from(dataSource).groupJoin("$.category").select("$.category").distinct().toArray();//所有不重复的Category
        var series = [];
        for (var i = 0; i < categoryResult.length; i++) {
            var categorySource = [];
            var data = [];
            for (var j = 0; j < dataSource.length; j++) {
                if (categoryResult[i] == dataSource[j].category) {
                    categorySource.push(dataSource[j]);
                }
            }
            for (var n = 0; n < columns.length; n++) {
                var categoryData = {};
                var value = null;
                for (var m = 0; m < categorySource.length; m++) {
                    if (categorySource[m].name == columns[n]) {
                        value = categorySource[m].value;
                    }
                }
                categoryData = {
                    name: columns[n],
                    value: value
                }
                data.push(categoryData);
            }
            var seriesData = {
                name: categoryResult[i],
                data: data
            }
            series.push(seriesData);
        }
        var result = {
            axisData: columns,
            series: series
        };
        return result;
    }
    /**
     * 加载象形柱状图
     * @param {any} dataSource
     */
    this.CreatePictorialBarDataSource = function (dataSource) {
        if (!dataSource)
            return null

        var columns = Enumerable.from(dataSource).groupJoin("$.name").select("$.name").distinct().toArray();//所有不重复的Name
        var categoryResult = Enumerable.from(dataSource).groupJoin("$.category").select("$.category").distinct().toArray();//所有不重复的Category
        var series = [];
        for (var i = 0; i < categoryResult.length; i++) {
            var categorySource = [];
            var data = [];
            for (var j = 0; j < dataSource.length; j++) {
                if (categoryResult[i] == dataSource[j].category) {
                    categorySource.push(dataSource[j]);
                }
            }
            for (var n = 0; n < columns.length; n++) {
                var categoryData = {};
                var value = null;
                for (var m = 0; m < categorySource.length; m++) {
                    if (categorySource[m].name == columns[n]) {
                        value = categorySource[m].value;
                    }
                }
                categoryData = {
                    name: columns[n],
                    value: value
                }
                data.push(categoryData);
            }
            var seriesData = {
                name: categoryResult[i],
                data: data
            }
            series.push(seriesData);
        }
        var result = {
            axisData: columns,
            series: series
        };
        return result;
    }
    /**
     * 加载折线图
     * @param {any} dataSource
     */
    this.CreateLineDataSource = function (dataSource) {
        if (!dataSource)
            return null

        var columns = Enumerable.from(dataSource).groupJoin("$.name").select("$.name").distinct().toArray();//所有不重复的Name
        var categoryResult = Enumerable.from(dataSource).groupJoin("$.category").select("$.category").distinct().toArray();//所有不重复的Category
        var series = [];
        for (var i = 0; i < categoryResult.length; i++) {
            var categorySource = [];
            var data = [];
            for (var j = 0; j < dataSource.length; j++) {
                if (categoryResult[i] == dataSource[j].category) {
                    categorySource.push(dataSource[j]);
                }
            }
            for (var n = 0; n < columns.length; n++) {
                var categoryData = {};
                var value = null;
                for (var m = 0; m < categorySource.length; m++) {
                    if (categorySource[m].name == columns[n]) {
                        value = categorySource[m].value;
                    }
                }
                categoryData = {
                    name: columns[n],
                    value: value
                }
                data.push(categoryData);
            }
            var seriesData = {
                name: categoryResult[i],
                data: data
            }
            series.push(seriesData);
        }
        var result = {
            axisData: columns,
            series: series
        };
        return result;
    }
    /**
     * 加载漏斗图
     * @param {any} dataSource
     */
    this.CreateFunnelDataSource = function (dataSource) {
        if (!dataSource)
            return null

        var columns = Enumerable.from(dataSource).groupJoin("$.name").select("$.name").distinct().toArray();//所有不重复的Name
        var categoryResult = Enumerable.from(dataSource).groupJoin("$.category").select("$.category").distinct().toArray();//所有不重复的Category

        var series = [];
        var categorySource = [];
        var data = [];
        for (var j = 0; j < dataSource.length; j++) {
            if (categoryResult[0] == dataSource[j].category) {
                categorySource.push(dataSource[j]);
            }
        }
        for (var n = 0; n < columns.length; n++) {
            var categoryData = {};
            var value = null;
            for (var m = 0; m < categorySource.length; m++) {
                if (categorySource[m].name == columns[n]) {
                    value = categorySource[m].value;
                }
            }
            categoryData = {
                name: columns[n],
                value: value
            }
            data.push(categoryData);
        }
        var seriesData = {
            name: categoryResult[0],
            data: data
        }
        series.push(seriesData);

        var result = {
            axisData: columns,
            series: series
        };
        return result;
    }
    /**
     * 加载仪表盘
     * @param {any} dataSource
     */
    this.CreateGaugeDataSource = function (dataSource) {
        if (!dataSource)
            return null

        var series = [];
        var data = [];
        var categoryData = {
            name: dataSource[0].name,
            value: dataSource[0].value
        }
        data.push(categoryData);
        var seriesData = {
            name: dataSource[0].name,
            data: data
        }
        series.push(seriesData);
        var result = {
            series: series
        };
        return result;
    }
    /**
     * 加载折线区域图
     * @param {any} dataSource
     */
    this.CreateLineAreaDataSource = function (dataSource) {
        if (!dataSource)
            return null

        var columns = Enumerable.from(dataSource).groupJoin("$.name").select("$.name").distinct().toArray();//所有不重复的Name
        var categoryResult = Enumerable.from(dataSource).groupJoin("$.category").select("$.category").distinct().toArray();//所有不重复的Category
        var series = [];
        for (var i = 0; i < categoryResult.length; i++) {
            var categorySource = [];
            var data = [];
            for (var j = 0; j < dataSource.length; j++) {
                if (categoryResult[i] == dataSource[j].category) {
                    categorySource.push(dataSource[j]);
                }
            }
            for (var n = 0; n < columns.length; n++) {
                var categoryData = {};
                var value = null;
                for (var m = 0; m < categorySource.length; m++) {
                    if (categorySource[m].name == columns[n]) {
                        value = categorySource[m].value;
                    }
                }
                categoryData = {
                    name: columns[n],
                    value: value
                }
                data.push(categoryData);
            }
            var seriesData = {
                name: categoryResult[i],
                data: data
            }
            series.push(seriesData);
        }
        var result = {
            axisData: columns,
            series: series
        };
        return result;
    }
    /**
     * 加载散点图
     * @param {any} dataSource
     */
    this.CreateScatterDataSource = function (dataSource) {
        if (!dataSource)
            return null
        var categoryResult = Enumerable.from(dataSource).groupJoin("$.category").select("$.category").distinct().toArray();//所有不重复的Category
        var timeLineName = Enumerable.from(dataSource).groupJoin("$.timelinename").select("$.timelinename").distinct().toArray();//所有不重复的timeLineName
        var scatterPointName = Enumerable.from(dataSource).groupJoin("$.name").select("$.name").distinct().toArray();//所有不重复的散点名
        var series = [];
        for (var i = 0; i < categoryResult.length; i++) {
            var categorySource = [];
            var data = [];
            for (var j = 0; j < dataSource.length; j++) {
                if (categoryResult[i] == dataSource[j].category) {
                    categorySource.push(dataSource[j]);
                }
            }
            for (var n = 0; n < timeLineName.length; n++) {
                var timeline = [];
                for (var m = 0; m < categorySource.length; m++) {
                    if (timeLineName[n] == categorySource[m].timelinename) {
                        timeline.push([categorySource[m].x, categorySource[m].y, categorySource[m].value, categorySource[m].name, categorySource[m].timelinename.substring(0, 10)])
                    }
                }
                series.push(timeline);
            }
        }
        var result = {
            series: series,
            timeline: timeLineName,
            scatterPointName: scatterPointName
        };
        return result;
    }
    /**
     * 加载堆积柱状图
     * @param {any} dataSource
     */
    this.CreateStackBarDataSource = function (dataSource) {
        if (!dataSource)
            return null

        var columns = Enumerable.from(dataSource).groupJoin("$.name").select("$.name").distinct().toArray();//所有不重复的Name
        var categoryResult = Enumerable.from(dataSource).groupJoin("$.category").select("$.category").distinct().toArray();//所有不重复的Category
        var series = [];
        for (var i = 0; i < categoryResult.length; i++) {
            var categorySource = [];
            var data = [];
            for (var j = 0; j < dataSource.length; j++) {
                if (categoryResult[i] == dataSource[j].category) {
                    categorySource.push(dataSource[j]);
                }
            }
            for (var n = 0; n < columns.length; n++) {
                var categoryData = {};
                var value = null;
                for (var m = 0; m < categorySource.length; m++) {
                    if (categorySource[m].name == columns[n]) {
                        value = categorySource[m].value;
                    }
                }
                categoryData = {
                    name: columns[n],
                    value: value
                }
                data.push(categoryData);
            }
            var seriesData = {
                name: categoryResult[i],
                stack: categorySource[0].stack,
                data: data
            }
            series.push(seriesData);
        }
        var result = {
            axisData: columns,
            series: series
        };
        return result;
    }
    /**
     * 加载堆积折线图
     * @param {any} dataSource
     */
    this.CreateStackLineDataSource = function (dataSource) {
        if (!dataSource)
            return null

        var columns = Enumerable.from(dataSource).groupJoin("$.name").select("$.name").distinct().toArray();//所有不重复的Name
        var categoryResult = Enumerable.from(dataSource).groupJoin("$.category").select("$.category").distinct().toArray();//所有不重复的Category
        var series = [];
        for (var i = 0; i < categoryResult.length; i++) {
            var categorySource = [];
            var data = [];
            for (var j = 0; j < dataSource.length; j++) {
                if (categoryResult[i] == dataSource[j].category) {
                    categorySource.push(dataSource[j]);
                }
            }
            for (var n = 0; n < columns.length; n++) {
                var categoryData = {};
                var value = null;
                for (var m = 0; m < categorySource.length; m++) {
                    if (categorySource[m].name == columns[n]) {
                        value = categorySource[m].value;
                    }
                }
                categoryData = {
                    name: columns[n],
                    value: value
                }
                data.push(categoryData);
            }
            var seriesData = {
                name: categoryResult[i],
                stack: categorySource[0],
                data: data
            }
            series.push(seriesData);
        }
        var result = {
            axisData: columns,
            series: series
        };
        return result;
    }
    /**
     * 加载韦恩图
     * @param {any} dataSource
     */
    this.CreateVennDiagramDataSource = function (dataSource) {
        if (!dataSource)
            return null

        //var series = [];
        var data = [];
        for (var i = 0; i < dataSource.length; i++) {
            var categoryData = {
                value: dataSource[i].value,
                name: dataSource[i].name
            }
            data.push(categoryData);
        }
        var seriesData = {
            name: '韦恩图',
            data: data
        }
        //series.push(seriesData);
        var result = {
            series: seriesData
        };
        return result;
    }
    /**
     * 加载雷达图
     * @param {any} dataSource
     */
    this.CreateRadarDataSource = function (dataSource) {
        if (!dataSource)
            return null

        var columns = Enumerable.from(dataSource).groupJoin("$.name").select("$.name").distinct().toArray();//所有不重复的Name
        var categoryResult = Enumerable.from(dataSource).groupJoin("$.category").select("$.category").distinct().toArray();//所有不重复的Category
        var sourceName = Enumerable.from(dataSource).groupJoin("$.sourceName").select("$.sourceName").distinct().toArray();
        var series = [];
        var indicator = [];
        var data = [];
        for (var i = 0; i < categoryResult.length; i++) {
            var categorySource = [];
            for (var j = 0; j < dataSource.length; j++) {
                if (categoryResult[i] == dataSource[j].category) {
                    categorySource.push(dataSource[j]);
                }
            }
            var value = [];
            for (var n = 0; n < columns.length; n++) {
                for (var m = 0; m < categorySource.length; m++) {
                    if (categorySource[m].name == columns[n]) {
                        value.push(categorySource[m].value);
                    }
                }
            }
            data[i] = {
                name: categoryResult[i],
                value: value
            }
            for (var a = 0; a < categorySource.length; a++) {
                if (i == 0) {
                    var indicatorData = {
                        name: categorySource[a].name,
                        max: categorySource[a].max
                    }
                    indicator.push(indicatorData);
                }
            }
        }
        var data = {
            data: data,
            sourceName: sourceName
        }
        series.push(data);
        var result = {
            indicator: indicator,
            series: series
        };
        return result;
    }
    /**
     * 加载树形图
     * @param {any} dataSource
     */
    this.CreateTreeDataSource = function (dataSource) {
        if (!dataSource)
            return null

        var parentName = Enumerable.from(dataSource).where("x=>x.parentName == ''").select('$.name').distinct().toArray();

        var series = [];
        for (var i = 0; i < parentName.length; i++) {
            var data = [];
            data = this.assembleSource(dataSource, parentName[i]);

            var parentSource = {
                name: parentName[i],
                children: data
            }
            var seriesData = {
                name: parentName[i],
                data: parentSource
            };
            series.push(seriesData);
        }
        var result = {
            series: series,
        }
        return result;
    }
    this.assembleSource = function (data, parentName) {
        var childrenSource = [];
        for (var i = 0; i < data.length; i++) {
            var node = data[i];
            if (node.parentName == parentName) {
                var newNode = {};
                newNode.name = node.name;
                if (node.value == '') {
                    newNode.children = this.assembleSource(data, node.name);
                } else {
                    newNode.value = node.value;
                }
                childrenSource.push(newNode);
            }
        }
        return childrenSource;
    }
}
export default EChartSourceCreator;