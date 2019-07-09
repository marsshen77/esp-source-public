
/*
 * @findFirst 从数组中找符合条件的项
 * @arr 数组
 * @func 比较函数
 * 
 * @return 返回数组中第一个符合条件的项
 */
window.findFirst = function findFirst(arr, func) {
    for (var index = 0; index < arr.length; index++) {
        if (func(arr[index]))
            return arr[index];
    }

    return null;
}

/*
 * @findFirst 从数组中找符合条件的项
 * @arr 数组
 * @func 比较函数
 * 
 * @return 返回数组中第一个符合条件的项
 */
window.findAll = function findAll(arr, func) {
    var arrs = [];
    for (var index = 0; index < arr.length; index++) {
        if (func(arr[index]))
            arrs.push(arr[index]);
    }

    return arrs;
}

/**
 * 拷贝数组
 * @param {any} 
 */
window.copyArr = function copyArr(obj) {
    // Handle the 3 simple types, and null or undefined or function
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        var copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }
    // Handle Array or Object
    if (obj instanceof Array | obj instanceof Object) {
        var copy = (obj instanceof Array) ? [] : {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr))
                copy[attr] = copyArr(obj[attr]);
        }
        return copy;
    }
    throw new Error("Unable to clone obj! Its type isn't supported.");
}

/*
 * @findFirstFromIndex 从数组指定位置开始找符合条件的项
 * @fromIndex 起始位置
 * @arr 数组
 * @func 比较函数
 * 
 * @return 返回数组中第一个符合条件的项
 */
window.findFirstFromIndex = function findFirstFromIndex(fromIndex, arr, func) {
    for (var index = fromIndex; index < arr.length; index++) {
        if (func(arr[index]))
            return arr[index];
    }
    return null;
}
/*
 * @findFirstFromIndex 从数组指定位置-终止位置开始找符合条件的项
 * @fromIndex 起始位置
 * @fromIndex 终止位置
 * @arr 数组
 * @func 比较函数
 * 
 * @return 返回数组中第一个符合条件的项
 */
window.findFirstFromToIndex = function findFirstFromToIndex(fromIndex, toIndex, arr, func) {
    if (fromIndex > toIndex) return null;
    for (var index = fromIndex; index < toIndex; index++) {
        if (func(arr[index]))
            return arr[index];
    }
    return null;
}

/*
 * @findFirstFromIndex 从数组指定位置-终止位置开始找符合条件的项
 * @fromIndex 起始位置
 * @fromIndex 终止位置
 * @arr 数组
 * @func 比较函数
 * 
 * @return 返回数组中所有符合条件的项
 */
window.findFromToIndex = function findFromToIndex(fromIndex, toIndex, arr, func) {
    if (fromIndex > toIndex) return null;
    var arrs = [];
    for (var index = fromIndex; index < toIndex; index++) {
        if (func(arr[index]))
            arrs.push(arr[index]);
    }
    return arrs;
}

/*
 * @removeAll 从数组中移除符合条件的项目
 * @arr 数组
 * @func 比较函数
 * 
 * @return 
 */
window.removeAll = function removeAll(arr, func) {
    for (var index = 0; index < arr.length; index++) {
        if (func(arr[index])) {
            arr.remove(index, index);
            index--;
        }
    }
}

/*
 * @reBuildSeries 通过最大值重建Series
 * @object series
 * @number maxValue最大值
 * 
 * @return object 重建好的Series
 */
window.rebuildSeries = function rebuildSeries(series, maxValue) {
    if (series && series.symbolSize && (typeof series.symbolSize == 'function')) {
        series.symbolSize = function (val) {
            return 6 + val[2] / maxValue * 4;
        };
    }
}

/*
 * @rebuildScatter 通过最大值重建Series
 * @object series
 * @number maxValue最大值
 * 
 * @return object 重建好的Series
 */
window.rebuildScatter = function rebuildScatter(series, maxValue) {
    if (series && series.symbolSize && (typeof series.symbolSize == 'function')) {
        series.symbolSize = function (val) {
            return 8 + val[2] / maxValue * 5;
        };
    } else if (series && series.symbolSize && (typeof series.symbolSize != 'function')) {
        var symbolSize = series.symbolSize;
        series.symbolSize = function (val) {
            return symbolSize + val[2] / maxValue * 5;
        };
    }
}

/*
 * 扩展Array的remove属性
 *
 */
Array.prototype.remove = function (from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};
Array.prototype.select = function (func) {
    var result = [];
    this.map(function (item) {
        if (func(item))
            result.push(item);
    });
    return result;
};
Array.prototype.first = function (func) {
    for (var i = 0; i < this.length; i++) {
        if (func(this[i]))
            return this[i];
    }

    return null;
};

/*
 * 扩展String的replaceAll属性
 *
 */
String.prototype.replaceAll = function (s1, s2) {
    return this.replace(new RegExp(s1, "gm"), s2);
}

String.prototype.endWith = function (str) {
    if (str == null || str == "" || this.length == 0 || str.length > this.length)
        return false;
    if (this.substring(this.length - str.length) == str)
        return true;
    else
        return false;
    return true;
}
String.prototype.startWith = function (str) {
    if (str == null || str == "" || this.length == 0 || str.length > this.length)
        return false;
    if (this.substr(0, str.length) == str)
        return true;
    else
        return false;
    return true;
}
/*
 * 对Date的扩展，将 Date 转化为指定格式的String
 * 年(y)、月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符， 
 * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) 
 * 例子： 
 * (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423 
 * (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18 
 */
Date.prototype.format = function (fmt) { //author: meizz 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

window.getQueryString = function (name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
    var r = window.location.search.substr(1).match(reg);
    if (r != null) {
        return unescape(r[2]);
    }
    return null;
}
