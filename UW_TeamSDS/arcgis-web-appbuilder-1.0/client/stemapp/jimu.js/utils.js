///////////////////////////////////////////////////////////////////////////
// Copyright © 2014 Esri. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////

define(['dojo/_base/lang',
    'dojo/_base/array',
    'dojo/_base/html',
    'dojo/_base/sniff',
    'dojo/_base/config',
    'dojo/io-query',
    'dojo/query',
    'dojo/NodeList-traverse',
    'dojo/Deferred',
    'dojo/on',
    'dojo/json',
    'dojo/cookie',
    'dojo/request/xhr',
    'dojo/i18n',
    'dojo/number',
    'dojo/date/locale',
    'esri/arcgis/utils',
    'esri/SpatialReference',
    'esri/geometry/Extent',
    'esri/geometry/webMercatorUtils',
    'esri/tasks/GeometryService',
    'esri/tasks/ProjectParameters',
    'jimu/portalUrlUtils',
    'esri/urlUtils',
    'esri/request',
    './shared/utils'
  ],

function(lang, array, html, has, config, ioQuery, query, nlt, Deferred, on, json, cookie,
  xhr, i18n, dojoNumber, dateLocale, arcgisUtils,
  SpatialReference, Extent, webMercatorUtils, GeometryService, ProjectParameters,
  portalUrlUtils, esriUrlUtils, esriRequest, sharedUtils) {
  /* global esriConfig, dojoConfig, ActiveXObject */
  var mo = {};

  var servicesObj = {
    geometryService: 'http://utility.arcgisonline.com/arcgis/rest/services/Geometry/GeometryServer'
  };

  lang.mixin(mo, sharedUtils);

  //if no beforeId, append to head tag, or insert before the id
  function loadStyleLink(id, href, beforeId) {
    var def = new Deferred(), styleNode, styleLinkNode;

    var hrefPath = require(mo.getRequireConfig()).toUrl(href);
    //the cache will use the baseUrl + module as the key
    if(require.cache['url:' + hrefPath]){
      //when load css file into index.html as <style>, we need to fix the
      //relative path used in css file
      var cssStr = require.cache['url:' + hrefPath];
      var fileName = hrefPath.split('/').pop();
      var rpath = hrefPath.substr(0, hrefPath.length - fileName.length);
      cssStr = addRelativePathInCss(cssStr, rpath);
      if (beforeId) {
        styleNode = html.create('style', {
          id: id,
          type: "text/css"
        }, html.byId(beforeId), 'before');
      } else {
        styleNode = html.create('style', {
          id: id,
          type: "text/css"
        }, document.getElementsByTagName('head')[0]);
      }
    
      if(styleNode.styleSheet && !styleNode.sheet){
        //for IE
        styleNode.styleSheet.cssText=cssStr;
      }else{
        styleNode.appendChild(html.toDom(cssStr));
      }
      def.resolve('load');
      return def;
    }
    
    if (beforeId) {
      styleLinkNode = html.create('link', {
        id: id,
        rel: "stylesheet",
        type: "text/css",
        href: hrefPath
      }, html.byId(beforeId), 'before');
    } else {
      styleLinkNode = html.create('link', {
        id: id,
        rel: "stylesheet",
        type: "text/css",
        href: hrefPath
      }, document.getElementsByTagName('head')[0]);
    }

    on(styleLinkNode, 'load', function() {
      def.resolve('load');
    });

    //for the browser which doesn't fire load event
    //safari update documents.stylesheets when style is loaded.
    var ti = setInterval(function() {
      var loadedSheet;
      if (array.some(document.styleSheets, function(styleSheet) {
        if (styleSheet.href && styleSheet.href.substr(styleSheet.href.indexOf(href),
          styleSheet.href.length) === href) {
          loadedSheet = styleSheet;
          return true;
        }
      })) {
        if (!def.isFulfilled() && (loadedSheet.cssRules && loadedSheet.cssRules.length ||
          loadedSheet.rules && loadedSheet.rules.length)) {
          def.resolve('load');
        }
        clearInterval(ti);
      }
    }, 50);
    return def;
  }
  
  function addRelativePathInCss(css, rpath){
    var m = css.match(/url\([^)]+\)/gi), i, m2;

    if (m === null || rpath === '') {
      return css;
    }
    for (i = 0; i < m.length; i++) {
      m2 = m[i].match(/(url\(["|']?)(.*)((?:['|"]?)\))/i);
      if(m2.length >= 4){
        var path = m2[2];
        if(!rpath.endWith('/')){
          rpath = rpath + '/';
        }
        css = css.replace(m2[1] + path + m2[3], m2[1] + rpath + path + m2[3]);
      }
    }
    return css;
  }

  var errorCheckLists = [];
  require.on("error", function(err) {
    array.forEach(errorCheckLists, function(o) {
      if (err.info[0] && err.info[0].indexOf(o.resKey) > -1) {
        o.def.reject(err);
      }
      for (var p in err.info) {
        if (p.indexOf(o.resKey) > -1) {
          o.def.reject(err);
        }
      }
    });
  });

  mo.checkError = function(resKey, def) {
    //when resKey match a error, def will be reject
    errorCheckLists.push({
      resKey: resKey,
      def: def
    });
  };

  /**
   * Repalce the placeholders in the obj Object properties with the props Object values,
   * return the replaced object
   * The placeholder syntax is: ${prop}
   */
  mo.replacePlaceHolder = function(obj, props) {
    var str = JSON.stringify(obj),
      m = str.match(/\$\{(\w)+\}/g),
      i;

    if (m === null) {
      return obj;
    }
    for (i = 0; i < m.length; i++) {
      var p = m[i].match(/(\w)+/g)[0];
      if (props[p]) {
        str = str.replace(m[i], props[p]);
      }
    }
    return JSON.parse(str);
  };

  /***
   * change latitude/longitude to degree, minute, second
   **/
  mo.changeUnit = function(val) {
    var abs = Math.abs(val),
      text, d, m, s;
    d = Math.floor(abs);
    m = Math.floor((abs - d) * 60);
    s = (((abs - d) * 60 - m) * 60).toFixed(2);
    //00B0 id degree character    
    text = d + '\u00B0' + ((m < 10) ? ('0' + m) : m) + '\'' + ((s < 10) ? ('0' + s) : s) + '"';
    return text;
  };

  /**
   * the formated format is: mm:ss.ms
   **/
  mo.formatTime = function(time) {
    var s = time / 1000,
      m = Math.floor(s / 60),
      s2 = Number(s - m * 60).toFixed(1),
      text = ((m < 10) ? '0' + m : m) + ':' + ((s2 < 10) ? '0' + s2 : s2);
    return text;
  };

  mo.parseTime = function(text) {
    var p = /(\d{2,})\:(\d{2})\.(\d{1})/,
      m, t;
    if (!p.test(text)) {
      console.log('wrong time format.');
      return -1;
    }
    m = text.match(p);
    t = (parseInt(m[1], 10) * 60 + parseInt(m[2], 10) + parseInt(m[3], 10) / 10) * 1000;
    return t;
  };

  mo.preloadImg = function(imgs, rpath) {
    var imgArray = [];
    if (typeof imgs === 'string') {
      imgArray = [imgs];
    } else {
      imgArray = imgs;
    }
    array.forEach(imgArray, function(imgUrl) {
      var img = new Image();
      if (rpath) {
        img.src = rpath + imgUrl;
      } else {
        img.src = imgUrl;
      }
    });
  };

  /**
   * get style object from position
   * the position can contain 6 property: left, top, right, bottom, width, height
   * please refer to AbstractModule
   */
  mo.getPositionStyle = function(_position) {
    var style = {};
    if(!_position){
      return style;
    }
    var position = lang.clone(_position);
    if(window.isRTL){
      if(typeof position.left !== 'undefined' && typeof position.right !== 'undefined'){
        var temp = position.left;
        position.left = position.right;
        position.right = temp;
      }else if(typeof position.left !== 'undefined'){
        position.right = position.left;
        delete position.left;
      }else if(typeof position.right !== 'undefined'){
        position.left = position.right;
        delete position.right;
      }
    }

    var ps = ['left', 'top', 'right', 'bottom', 'width', 'height'];
    for (var i = 0; i < ps.length; i++) {
      var p = ps[i];
      if (typeof position[p] === 'number') {
        style[p] = position[p] + 'px';
      } else if (typeof position[p] !== 'undefined') {
        style[p] = position[p];
      }else{
        style[p] = 'auto';
      }
    }
    return style;
  };

  /**
   * compare two object/array recursively
   */
  function isEqual(o1, o2) {
    var leftChain, rightChain;

    function compare2Objects(x, y) {
      var p;
      // remember that NaN === NaN returns false
      // and isNaN(undefined) returns true
      if (isNaN(x) && isNaN(y) && typeof x === 'number' && typeof y === 'number') {
        return true;
      }
      // Compare primitives and functions.     
      // Check if both arguments link to the same object.
      // Especially useful on step when comparing prototypes
      if (x === y) {
        return true;
      }
      // Works in case when functions are created in constructor.
      // Comparing dates is a common scenario. Another built-ins?
      // We can even handle functions passed across iframes
      if ((typeof x === 'function' && typeof y === 'function') ||
        (x instanceof Date && y instanceof Date) ||
        (x instanceof RegExp && y instanceof RegExp) ||
        (x instanceof String && y instanceof String) ||
        (x instanceof Number && y instanceof Number)) {
        return x.toString() === y.toString();
      }
      // check for infinitive linking loops
      if (leftChain.indexOf(x) > -1 || rightChain.indexOf(y) > -1) {
        return false;
      }
      // Quick checking of one object beeing a subset of another.
      // todo: cache the structure of arguments[0] for performance
      if (y !== null) {
        for (p in y) {
          if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
            return false;
          } else if (typeof y[p] !== typeof x[p]) {
            return false;
          }
        }
        for (p in x) {
          if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
            return false;
          } else if (typeof y[p] !== typeof x[p]) {
            return false;
          }
          switch (typeof(x[p])) {
          case 'object':
          case 'function':
            leftChain.push(x);
            rightChain.push(y);
            if (!compare2Objects(x[p], y[p])) {
              return false;
            }
            leftChain.pop();
            rightChain.pop();
            break;
          default:
            if (x[p] !== y[p]) {
              return false;
            }
            break;
          }
        }
      }

      return true;
    }

    leftChain = []; //todo: this can be cached
    rightChain = [];
    if (!compare2Objects(o1, o2)) {
      return false;
    }
    return true;
  }

  mo.isEqual = isEqual;

  //merge the target and src object/array, return the merged object/array.
  function merge(target, src) {
    var array = Array.isArray(src);
    var dst = array && [] || {};

    if (array) {
      target = target || [];
      dst = dst.concat(target);
      src.forEach(function(e, i) {
        if (typeof target[i] === 'undefined') {
          dst[i] = e;
        } else if (typeof e === 'object') {
          dst[i] = merge(target[i], e);
        } else {
          if (target.indexOf(e) === -1) {
            dst.push(e);
          }
        }
      });
    } else {
      if (target && typeof target === 'object') {
        Object.keys(target).forEach(function(key) {
          dst[key] = target[key];
        });
      }
      Object.keys(src).forEach(function(key) {
        if (typeof src[key] !== 'object' || !src[key]) {
          dst[key] = src[key];
        } else {
          if (!target[key]) {
            dst[key] = src[key];
          } else {
            dst[key] = merge(target[key], src[key]);
          }
        }
      });
    }

    return dst;
  }

  function setVerticalCenter(contextNode) {
    function doSet() {
      var nodes = query('.jimu-vcenter-text', contextNode),
        h, ph;
      array.forEach(nodes, function(node) {
        h = html.getContentBox(node).h;
        html.setStyle(node, {
          lineHeight: h + 'px'
        });
      }, this);

      nodes = query('.jimu-vcenter', contextNode);
      array.forEach(nodes, function(node) {
        h = html.getContentBox(node).h;
        ph = html.getContentBox(query(node).parent()[0]).h;
        html.setStyle(node, {
          marginTop: (ph - h) / 2 + 'px'
        });
      }, this);
    }

    //delay sometime to let browser update dom
    setTimeout(doSet, 10);
  }

  /**
   * get uri info from the configured uri property,
   * the info contains: folderUrl, name
   */
  function getUriInfo(uri) {
    var pos, firstSeg, info = {},
      amdFolder;

    pos = uri.indexOf('/');
    firstSeg = uri.substring(0, pos);

    //config using package
    amdFolder = uri.substring(0, uri.lastIndexOf('/') + 1);
    info.folderUrl = require(mo.getRequireConfig()).toUrl(amdFolder);
    info.amdFolder = amdFolder;
    return info;
  }

  mo.file = {
    supportHTML5: function() {
      if (window.File && window.FileReader && window.FileList && window.Blob) {
        return true;
      } else {
        return false;
      }
    },
    supportFileAPI: function() {
      if (has('safari') && has('safari') < 6) {
        return false;
      }
      if (window.FileAPI && window.FileAPI.readAsDataURL) {
        return true;
      }
      return false;
    },
    isEnabledFlash: function(){
      var swf = null;
      if (document.all) {
        try{
          swf = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
        }catch(e) {
          swf = null;
        }
      } else {
        if (navigator.plugins && navigator.plugins.length > 0) {
          swf = navigator.plugins["Shockwave Flash"];
        }
      }
      return !!swf;
    },
    containSeparator: function(path) {
      if (path.indexOf("/") >= 0) {
        return true;
      } else {
        if (path.indexOf("\\") >= 0) {
          return true;
        } else {
          return false;
        }
      }
    },
    getNameFromPath: function(path) {
      var separator = "";
      if (path.indexOf("/") >= 0) {
        separator = "/";
      } else {
        separator = "\\";
      }
      var segment = path.split(separator);
      if (segment.length > 0) {
        return segment[segment.length - 1];
      } else {
        return null;
      }

    },
    getFolderFromPath: function(path) {
      return path.substr(0, path.length - mo.file.getNameFromPath(path).length);
    },
    /********
     * read file by HTML5 API.
     *
     * parameters:
     * file: the file will be read.
     * filter: file type filter, files which don't match the filter will not be read and
       return false.
     * maxSize: file size which exceeds the size will return false;
     * cb: the callback function when file is read completed, signature: (err, fileName, fileData)
     */
    readFile: function(fileEvt, filter, maxSize, cb) {
      if (this.supportHTML5()) {
        var file = fileEvt.target.files[0];
        if (!file) {
          return;
        }
        // Only process image files.
        if (!file.type.match(filter)) {
          // cb("Invalid file type.");
          cb({
            errCode: "invalidType"
          });
          return;
        }

        if (file.size >= maxSize) {
          // cb("File size cannot exceed  " + Math.floor(maxSize / 1024) + "KB.");
          cb({
            errCode: "exceed"
          });
          return;
        }

        var reader = new FileReader();
        // Closure to capture the file information.
        reader.onload = function(e) {
          cb(null, file.name, e.target.result);
        };
        // Read in the image file as a data URL.
        reader.readAsDataURL(file);
      } else if (this.supportFileAPI()) {
        var files = window.FileAPI.getFiles(fileEvt);

        // Only process image files.
        if (!files[0].type.match(filter)) {
          // cb("Invalid file type.");
          cb({
            errCode: "invalidType"
          });
          return;
        }

        if (files[0].size >= maxSize) {
          // cb("File size cannot exceed  " + Math.floor(maxSize / 1048576) + "M.");
          cb({
            errCode: "exceed"
          });
          return;
        }

        window.FileAPI.readAsDataURL(files[0], function(evt) {
          if (evt && evt.result) {
            cb(null, files[0].name, evt.result);
          } else {
            cb({
              errCode: "readError"
            });
          }
        });
      }
    }
  };

  mo.processWidgetSetting = function(setting) {
    if (!setting.uri) {
      return setting;
    }
    lang.mixin(setting, getUriInfo(setting.uri));

    if (!setting.icon) {
      setting.icon = setting.amdFolder + 'images/icon.png';
    }
    if (!setting.thumbnail) {
      setting.thumbnail = setting.amdFolder + 'images/thumbnail.png';
    }

    //setting.label has been processed when loading config.      
    return setting;
  };

  mo.getRequireConfig = function() {
    /* global jimuConfig */
    if (jimuConfig) {
      var packages = [];
      if (jimuConfig.widgetsPackage) {
        packages = packages.concat(jimuConfig.widgetsPackage);
      }
      if (jimuConfig.themesPackage) {
        packages = packages.concat(jimuConfig.themesPackage);
      }
      if (jimuConfig.configsPackage) {
        packages = packages.concat(jimuConfig.configsPackage);
      }
      return {
        packages: packages
      };
    } else {
      return {};
    }
  };

  mo.getTypeByGeometryType = function(esriType) {
    var type = null;
    var _pointTypes = ['esriGeometryPoint', 'esriGeometryMultipoint'];
    var _lineTypes = ['esriGeometryLine', 'esriGeometryCircularArc', 'esriGeometryEllipticArc',
    'esriGeometryBezier3Curve', 'esriGeometryPath', 'esriGeometryPolyline'];
    var _polygonTypes = ['esriGeometryRing', 'esriGeometryPolygon', 'esriGeometryEnvelope'];
    if (_pointTypes.indexOf(esriType) >= 0) {
      type = 'point';
    } else if (_lineTypes.indexOf(esriType) >= 0) {
      type = 'polyline';
    } else if (_polygonTypes.indexOf(esriType) >= 0) {
      type = 'polygon';
    }
    return type;
  };

  mo.getSymbolTypeByGeometryType = function(esriType){
    var symbolType = null;
    var geoType = mo.getTypeByGeometryType(esriType);
    if(geoType === 'point'){
      symbolType = 'marker';
    }
    else if(geoType === 'polyline'){
      symbolType = 'line';
    }
    else if(geoType === 'polygon'){
      symbolType = 'fill';
    }
    return symbolType;
  };

  mo.getServices = function() {
    return servicesObj;
  };

  mo.getArcGISDefaultGeometryService = function() {
    var url = servicesObj.geometryService;
    var gs = new GeometryService(url);
    return gs;
  };

  mo.restoreToDefaultWebMapExtent = function(map, webMapResponse, geoServiceUrl) {
    var def = new Deferred();
    var isMapValid = map && map.declaredClass === 'esri.Map';
    if (!isMapValid) {
      setTimeout(function() {
        def.reject('Invalid map.');
      }, 0);
      return def;
    }
    var itemInfo = webMapResponse && webMapResponse.itemInfo;
    if (!itemInfo) {
      setTimeout(function() {
        def.reject('Invalid itemInfo');
      }, 0);
      return def;
    }

    var points = itemInfo.item && itemInfo.item.extent;

    if (!points) {
      setTimeout(function() {
        def.reject('Invalid itemInfo.item.extent');
      });
      return def;
    }

    var spatialRef = new SpatialReference({
      wkid: 4326
    });
    var extent = new Extent(points[0][0], points[0][1], points[1][0], points[1][1], spatialRef);

    var mapWkid = parseInt(map.spatialReference.wkid, 10);

    if (mapWkid === 4326) {
      return map.setExtent(extent);
    } else {
      if (map.spatialReference.isWebMercator()) {
        extent = webMercatorUtils.geographicToWebMercator(extent);
        return map.setExtent(extent);
      } else {
        var params = new ProjectParameters();
        params.geometries = [extent];
        params.outSR = map.spatialReference;

        var gs = esriConfig && esriConfig.defaults && esriConfig.defaults.geometryService;
        var existGS = gs && gs.declaredClass === "esri.tasks.GeometryService";
        if (!existGS) {
          var validGeoService = geoServiceUrl && typeof geoServiceUrl === 'string' &&
          lang.trim(geoServiceUrl);
          if (validGeoService) {
            geoServiceUrl = lang.trim(geoServiceUrl);
            gs = new GeometryService(geoServiceUrl);
          } else {
            gs = mo.getArcGISDefaultGeometryService();
          }
        }

        gs.project(params).then(function(geometries) {
          var projectedExt = geometries && geometries[0];
          if (projectedExt) {
            return map.setExtent(projectedExt);
          } else {
            def.reject('Invalid projected geometry.');
            return def;
          }
        }, function(err) {
          console.error(err);
          def.reject(err);
          return def;
        });
      }
    }

    return def;
  };

  mo.getAncestorWindow = function() {
    var w = window;
    while (w && w.parent && w !== w.parent) {
      w = w.parent;
    }
    return w;
  };

  mo.getAncestorDom = function(child, verifyFunc,
    /*HTMLElement|Number optional */ maxLoopSizeOrDom) {
    if (child && child.nodeType === 1) {
      if (verifyFunc && typeof verifyFunc === 'function') {
        var maxLoopSize = 100;
        var maxLoopDom = document.body;

        if (maxLoopSizeOrDom) {
          if (typeof maxLoopSizeOrDom === 'number') {
            //Number
            maxLoopSizeOrDom = parseInt(maxLoopSizeOrDom, 10);
            if (maxLoopSizeOrDom > 0) {
              maxLoopSize = maxLoopSizeOrDom;
            }
          } else if (maxLoopSizeOrDom.nodeType === 1) {
            //HTMLElement
            maxLoopDom = maxLoopSizeOrDom;
          }
        }

        var loop = 0;
        while (child.parentNode && loop < maxLoopSize &&
          html.isDescendant(child.parentNode, maxLoopDom)) {
          if (verifyFunc(child.parentNode)) {
            return child.parentNode;
          }
          child = child.parentNode;
          loop++;
        }
      }
    }
    return null;
  };

  mo.bindClickAndDblclickEvents = function(dom, clickCallback, dblclickCallback,
    /* optional */ _timeout) {
    var handle = null;
    var isValidDom = dom && dom.nodeType === 1;
    var isValidClick = clickCallback && typeof clickCallback === 'function';
    var isValidDblclick = dblclickCallback && typeof dblclickCallback === 'function';
    var isValid = isValidDom && isValidClick && isValidDblclick;
    if (isValid) {
      var timeout = 200;
      if (_timeout && typeof _timeout === 'number') {
        var t = parseInt(_timeout, 10);
        if (t > 0) {
          timeout = t;
        }
      }

      var clickCount = 0;
      handle = on(dom, 'click', function(evt) {
        clickCount++;
        if (clickCount === 1) {
          setTimeout(function() {
            if (clickCount === 1) {
              clickCount = 0;
              clickCallback(evt);
            }
          }, timeout);
        } else if (clickCount === 2) {
          clickCount = 0;
          dblclickCallback(evt);
        }
      });
    }
    return handle;
  };

  mo.isScrollToBottom = function(dom) {
    var box = html.getContentBox(dom);
    var a = dom.scrollTop + box.h;
    var b = dom.scrollHeight - a;
    return b === 0;
  };

  mo.getAllItemTypes = function() {
    var allTypes = [];
    //Web Content
    var maps1 = ['Web Map','Web Scene', 'CityEngine Web Scene'];
    var layers1 = ['Feature Service', 'Map Service', 'Image Service', 'KML', 'WMS',
    'Feature Collection', 'Feature Collection Template', 'Geodata Service', 'Globe Service'];
    var tools1 = ['Geometry Service', 'Geocoding Service', 'Network Analysis Service',
    'Geoprocessing Service'];
    var applications1 = ['Web Mapping Application', 'Mobile Application', 'Code Attachment',
    'Operations Dashboard Add In', 'Operation View'];
    var datafiles1 = ['Symbol Set', 'Color Set', 'Shapefile', 'CSV', 'Service Definition',
    'Document Link', 'Microsoft Word', 'Microsoft PowerPoint', 'Microsoft Excel', 'PDF',
    'Image', 'Visio Document'];
    //Desktop Content
    var maps2 = ['Map Document', 'Map Package', 'Tile Package', 'ArcPad Package',
    'Explorer Map', 'Globe Document', 'Scene Document', 'Published Map', 'Map Template',
    'Windows Mobile Package'];
    var layers2 = ['Layer', 'Layer Package', 'Explorer Layer'];
    var tools2 = ['Geoprocessing Package', 'Geoprocessing Sample', 'Locator Package',
    'Rule Package'];
    var applications2 = ['Workflow Manager Package', 'Desktop Application',
    'Desktop Application Template', 'Code Sample', 'Desktop Add In', 'Explorer Add In'];

    allTypes = allTypes.concat(maps1).concat(layers1).concat(tools1)
    .concat(applications1).concat(datafiles1);
    allTypes = allTypes.concat(maps2).concat(layers2).concat(tools2).concat(applications2);
    return allTypes;
  };

  mo.getItemQueryStringByTypes = function(itemTypes) {
    var queryStr = '';
    var allTypes = mo.getAllItemTypes();
    if (itemTypes && itemTypes.length > 0) {
      if (itemTypes.length > 0) {
        var validStr = '';
        array.forEach(itemTypes, function(type, index) {
          var s = ' type:"' + type + '" ';
          validStr += s;
          if (index !== itemTypes.length - 1) {
            validStr += ' OR ';
          }
        });
        queryStr = ' ( ' + validStr + ' ) ';
        var sumAllTypes = itemTypes.concat(allTypes);
        var removedTypes = array.filter(sumAllTypes, function(removedType){
          return array.every(itemTypes, function(itemType){
            return itemType.toLowerCase().indexOf(removedType.toLowerCase()) < 0;
          });
        });

        array.forEach(removedTypes, function(type) {
          var s = ' -type:"' + type + '" ';
          queryStr += s;
        });
      }
    }
    return queryStr;
  };

  mo.getItemQueryStringByTypeKeywords = function(typeKeywords){
    var queryStr = '';
    //must use double quotation marks around typeKeywords
    //typekeywords:"Web AppBuilder" or typekeywords:"Web AppBuilder,Web Map"
    if(typeKeywords && typeKeywords.length > 0){
      queryStr = ' typekeywords:"'+typeKeywords.join(',')+'" ';
    }
    return queryStr;
  };

  mo.isNotEmptyString = function(str, /* optional */ trim) {
    var b = str && typeof str === 'string';
    if (b) {
      if (trim) {
        return b && lang.trim(str);
      } else {
        return true;
      }
    } else {
      return false;
    }
  };

  mo.isObject = function(o) {
    return o && typeof o === 'object';
  };

  mo.createWebMap = function(portalUrl, itemId, mapDiv, /* optional */ options) {
    //var arcgisUrlOld = arcgisUtils.arcgisUrl;
    portalUrl = portalUrlUtils.getStandardPortalUrl(portalUrl);
    var itemUrl = portalUrlUtils.getBaseItemUrl(portalUrl);
    arcgisUtils.arcgisUrl = itemUrl;
    var def = arcgisUtils.createMap(itemId, mapDiv, options);
    return def;
  };

  mo.getRandomString = function() {
    var str = Math.random().toString();
    str = str.slice(2, str.length);
    return str;
  };

  mo._getDomainsByServerName= function(serverName){
    var splits = serverName.split('.');
    var length = splits.length;
    var domains = array.map(splits, lang.hitch(this, function(v, index){
      var arr = splits.slice(index, length);
      var str = "";
      var lastIndex = arr.length - 1;
      array.forEach(arr, lang.hitch(this, function(s, idx){
        str += s;
        if(idx !== lastIndex){
          str += '.';
        }
      }));
      return str;
    }));
    return domains;
  };

  mo.removeCookie = function(cookieName, path){
    var domains = this._getDomainsByServerName(window.location.hostname);

    array.forEach(domains, lang.hitch(this, function(domainName){
      cookie(cookieName, null, {
        expires: -1,
        path: path
      });

      cookie(cookieName, null, {
        expires: -1,
        path: path,
        domain: domainName
      });

      cookie(cookieName, null, {
        expires: -1,
        path: path,
        domain: '.' + domainName
      });
    }));
  };

  mo.isLocaleChanged = function(oldLocale, newLocale){
    return !oldLocale.startWith(newLocale);
  };

  mo.hashToObject = function(hashStr){
    hashStr = hashStr.replace('#', '');
    var hashObj = ioQuery.queryToObject(hashStr);
    for (var p in hashObj) {
      if (hashObj.hasOwnProperty(p)) {
        try {
          hashObj[p] = json.parse(hashObj[p]);
        } catch (err) {
          continue;
        }
      }
    }
    return hashObj;
  };

  mo.reCreateObject = function(obj) {
    //summary:
    //  because of dojo's lang.isArray issue, we need re-create the array properties
    var ret;

    function copyArray(_array) {
      var retArray = [];
      _array.forEach(function(a) {
        if (Array.isArray(a)) {
          retArray.push(copyArray(a));
        } else if (typeof a === 'object') {
          retArray.push(copyObject(a));
        } else {
          retArray.push(a);
        }
      });
      return retArray;
    }

    function copyObject(_obj) {
      var ret = {};
      for (var p in _obj) {
        if (!_obj.hasOwnProperty(p)) {
          continue;
        }
        if(_obj[p] === null){
          ret[p] = null;
        }else if (Array.isArray(_obj[p])) {
          ret[p] = copyArray(_obj[p]);
        } else if (typeof _obj[p] === 'object') {
          ret[p] = copyObject(_obj[p]);
        } else {
          ret[p] = _obj[p];
        }
      }
      return ret;
    }

    if (Array.isArray(obj)) {
      ret = copyArray(obj);
    } else {
      ret = copyObject(obj);
    }
    return ret;
  };

  mo.setVerticalCenter = setVerticalCenter;
  mo.merge = merge;
  mo.loadStyleLink = loadStyleLink;

  mo.changeLocation = function(newUrl){
    // debugger;
    if (window.history.pushState) {
      window.history.pushState({path:newUrl},'',newUrl);
    }/*else{
      window.location.href = newUrl;
    }*/
  };

  mo.urlToObject = function(url){
    var ih = url.indexOf('#'),
    obj = null;
    if (ih === -1){
      obj = esriUrlUtils.urlToObject(url);
      obj.hash = null;
    }else {
      var urlParts = url.split('#');
      obj = esriUrlUtils.urlToObject(urlParts[0]);
      obj.hash = urlParts[1] ?
        (urlParts[1].indexOf('=') > -1 ? ioQuery.queryToObject(urlParts[1]) : urlParts[1]): null;
    }
    return obj;
  };

  // reset some field of config by template config.
  mo.setConfigByTemplate = function(config, key, value) {
    //config: Object
    //  the destination config object
    //key: String
    //  the key value relative to the config object, like this: app_p1_p2[0], app_p1_p2[1]--

    var keyArray = convertToKeyArray(key);

    var obj = config;
    for (var i = 1; i < keyArray.length - 1; i++) {
      obj = getSubObj(obj, keyArray[i]);
      if (!obj) {
        return;
      }
    }

    if (keyArray[keyArray.length - 1].deleteFlag) {
      if (value === true) {
        if (lang.isArray(obj[keyArray[keyArray.length - 1].key])) {
          delete obj[keyArray[keyArray.length - 1].key][keyArray[keyArray.length - 1].index];
        } else {
          delete obj[keyArray[keyArray.length - 1].key];
        }
      }
    } else {
      if (lang.isArray(obj[keyArray[keyArray.length - 1].key])) {
        obj[keyArray[keyArray.length - 1].key][keyArray[keyArray.length - 1].index] = value;
      } else {
        obj[keyArray[keyArray.length - 1].key] = value;
      }
    }

    function getSubObj(obj, keyInfo) {
      if (lang.isArray(obj[keyInfo.key])) {
        return obj[keyInfo.key][keyInfo.index];
      } else {
        return obj[keyInfo.key];
      }
    }

    function convertToKeyArray(str) {
      var arrayKey = [];
      str.split('_').forEach(function(str) {
        var deleteFlag = false;
        var pos;
        if (str.slice(str.length - 2) === "--") {
          deleteFlag = true;
          str = str.slice(0, str.length - 2);
        }
        pos = str.search(/\[[0-9]+\]/);
        if (pos === -1) {
          (pos = str.length);
        }
        arrayKey.push({
          "key": str.slice(0, pos),
          "index": Number(str.slice(pos + 1, -1)),
          "deleteFlag": deleteFlag
        });
      });
      return arrayKey;
    }
  };

  // reset some field of config by template config.
  mo.setConfigByTemplateWithId = function(config, key, value) {
    //config: Object
    //  the destination config object
    //key: String
    //  the key value relative to the config object, like this: app_p1_p2[0], app_p1_p2[1]--
    //  howover, if the key is a wiget element, the key like this: app_p1_p2[widgetId]

    // section means widget or group
    var groupSearchStr  = "groups\\[.+\\]";
    var widgetSearchStr = "widgets\\[.+\\]";
    var sectionConfig = config;
    var sectionKey    = key;
    
    // Do not merge fields that in the widget config,
    // beacuse widgetConfig has not been loaded before open
    // widget if the widget has not been edited yet.
    // Merge it when first open widget(In Widgetmanager.js).
    if(key.search("widgets\\[.+\\]_config") >= 0) {
      return;
    }

    // handle groups
    var groupInfo = getSectionObject(groupSearchStr);
    if (groupInfo.state === "deleted") {
      return;
    } else if (groupInfo.state === "isSection") {
      sectionConfig = groupInfo.object;
      sectionKey = groupInfo.key;
    }

    // handle widgets
    var widgetInfo = getSectionObject(widgetSearchStr);
    if (widgetInfo.state === "delete") {
      return;
    } else if (widgetInfo.state === "isSection") {
      sectionConfig = widgetInfo.object;
      sectionKey = widgetInfo.key;
    }

    mo.setConfigByTemplate(sectionConfig, sectionKey, value);

    function getSectionObject(sectionSearchStr) {
      var sectionRange = getSearchRange(key, sectionSearchStr, "]");
      var sectionStr   = key.slice(sectionRange.firstPos, sectionRange.lastPos);// section[abcd]
      // It's section node.
      if (sectionRange.firstPos !== -1) {
        var sectionId = key.slice(sectionRange.firstPos + sectionStr.indexOf('[') + 1,
          sectionRange.lastPos - 1);
        var subKey   = key.slice(sectionRange.lastPos + 1);
        var sectionObject = config.getConfigElementById(sectionId);
        if (sectionObject) {
          return {
            object: sectionObject,
            key:  "section_" + subKey,
            state: "isSection"
          };
        } else {
          // means the section had been deleted.
          return {
            state: "deleted"
          };
        }
      } else {
        //It is not a section node.
        return {
          state: "isNotSection"
        };
      }
    }

    function getSearchRange(srcStr, searchStr, lastString) {
      // return last position;
      var posResult = -1, regExp, pos1, pos2, tempStr;
      regExp = new RegExp(searchStr);
      pos1 = srcStr.search(regExp);
      if (pos1 >= 0 ) {
        tempStr = srcStr.slice(pos1, srcStr.length);
        pos2 = tempStr.indexOf(lastString);
        posResult = pos1 + pos2 + lastString.length;
      }
      return {
        firstPos: pos1,
        lastPos: posResult
      };
    }
  };

  mo.addManifestProperies = function(manifest) {
    manifest.icon = manifest.url + 'images/icon.png';

    if(manifest.category === "theme") {
      addThemeManifestProperies(manifest);
    } else {
      addWidgetManifestProperties(manifest);
    }
  };

  mo.getUniqueValues = function(url, fieldName){
    var def = new Deferred();
    var reqUrl = url.replace(/\/*$/g, '') + "/generateRenderer";
    var classificationDef = {"type":"uniqueValueDef","uniqueValueFields":[fieldName]};
    var str = json.stringify(classificationDef);
    esriRequest({
      url: reqUrl,
      content: {
        classificationDef: str,
        f: 'json'
      },
      handleAs: 'json',
      callbackParamName:'callback'
    }).then(lang.hitch(this, function(response){
      var values = [];
      var uniqueValueInfos = response && response.uniqueValueInfos;
      if(uniqueValueInfos && uniqueValueInfos.length > 0){
        values = array.map(uniqueValueInfos, lang.hitch(this, function(info){
          return info.value;
        }));
      }
      def.resolve(values);
    }), lang.hitch(this, function(err){
      def.reject(err);
    }));
    return def;
  };

  mo.combineRadioCheckBoxWithLabel = function(inputDom,labelDom){
    var isValidInput = false;
    if(inputDom && inputDom.nodeType === 1 && inputDom.tagName.toLowerCase() === 'input'){
      var inputType = inputDom.getAttribute('type')||'';
      inputType = inputType.toLowerCase();
      if(inputType === 'radio' || inputType === 'checkbox'){
        isValidInput = true;
      }
    }
    var isValidLabel = false;
    if(labelDom && labelDom.nodeType === 1 && labelDom.tagName.toLowerCase() === 'label'){
      isValidLabel = true;
    }
    if(isValidInput && isValidLabel){
      var inputId = inputDom.getAttribute('id');
      if(!inputId){
        inputId = "input_" + mo.getRandomString();
        inputDom.setAttribute('id', inputId);
      }
      labelDom.setAttribute('for', inputId);
      html.setStyle(labelDom, 'cursor', 'pointer');
    }
  };

  function addThemeManifestProperies(manifest) {
    manifest.panels.forEach(function(panel) {
      panel.uri = 'panels/' + panel.name + '/Panel.js';
    });

    manifest.styles.forEach(function(style) {
      style.uri = 'styles/' + style.name + '/style.css';
    });

    manifest.layouts.forEach(function(layout) {
      layout.uri = 'layouts/' + layout.name + '/config.json';
      layout.icon = 'layouts/' + layout.name + '/icon.png';
      layout.RTLIcon = 'layouts/' + layout.name + '/icon_rtl.png';
    });
  }

  function addWidgetManifestProperties(manifest) {
    //because tingo db engine doesn't support 2D, 3D property, so, change here
    if (typeof manifest['2D'] !== 'undefined') {
      manifest.support2D = manifest['2D'];
    }
    if (typeof manifest['3D'] !== 'undefined') {
      manifest.support3D = manifest['3D'];
    }

    if (typeof manifest['2D'] === 'undefined' && typeof manifest['3D'] === 'undefined') {
      manifest.support2D = true;
    }

    delete manifest['2D'];
    delete manifest['3D'];

    if (typeof manifest.properties === 'undefined') {
      manifest.properties = {};
    }

    sharedUtils.processWidgetProperties(manifest);
  }

  mo.processManifestLabel = function(manifest, locale){
    manifest.label = manifest.i18nLabels && (manifest.i18nLabels[locale] ||
      manifest.i18nLabels.defaultLabel) ||
      manifest.label ||
      manifest.name;
    if(manifest.layouts){
      array.forEach(manifest.layouts, function(layout){
        var key = 'i18nLabels_layout_' + layout.name;
        layout.label = manifest[key] && (manifest[key][locale] ||
          manifest[key].defaultLabel) ||
          layout.label ||
          layout.name;
      });
    }
    if(manifest.styles){
      array.forEach(manifest.styles, function(_style){
        var key = 'i18nLabels_style_' + _style.name;
        _style.label = manifest[key] && (manifest[key][locale] ||
          manifest[key].defaultLabel) ||
          _style.label ||
          _style.name;
      });
    }
  };

  mo.addManifest2WidgetJson = function(widgetJson, manifest){
    lang.mixin(widgetJson, manifest.properties);
    widgetJson.name = manifest.name;
    if(!widgetJson.label){
      widgetJson.label = manifest.label;
    }
    widgetJson.manifest = manifest;
  };

  mo.addI18NLabel = function(manifest){
    var def = new Deferred();
    if(manifest.i18nLabels){
      def.resolve(manifest);
      return def;
    }
    manifest.i18nLabels = {};

    if(manifest.properties && manifest.properties.hasLocale === false){
      def.resolve(manifest);
      return def;
    }
    
    //theme or widget label
    var key = manifest.category === 'widget'? '_widgetLabel': '_themeLabel';
    require(mo.getRequireConfig(), ['dojo/i18n!' + manifest.amdFolder + '/nls/strings'],
      function(localeStrings){
      manifest.i18nLabels[dojoConfig.locale] = localeStrings[key];

      //theme's layout and style label
      if(manifest.category === 'theme'){
        if(manifest.layouts){
          manifest.layouts.forEach(function(layout){
            manifest['i18nLabels_layout_' + layout.name] = {};
            manifest['i18nLabels_layout_' + layout.name][dojoConfig.locale] =
            localeStrings['_layout_' + layout.name];
          });
        }

        if(manifest.styles){
          manifest.styles.forEach(function(style){
            manifest['i18nLabels_style_' + style.name] = {};
            manifest['i18nLabels_style_' + style.name][dojoConfig.locale] =
            localeStrings['_style_' + style.name];
          });
        }
      }
      def.resolve(manifest);
    });

    return def;
  };

  /*
  *Optional
  *An object with the following properties:
  *pattern (String, optional):
  *override formatting pattern with this string. Default value is based on locale.
   Overriding this property will defeat localization. Literal characters in patterns
   are not supported.
  *type (String, optional):
  *choose a format type based on the locale from the following: decimal, scientific
   (not yet supported), percent, currency. decimal by default.
  *places (Number, optional):
  *fixed number of decimal places to show. This overrides any information in the provided pattern.
  *round (Number, optional):
  *5 rounds to nearest .5; 0 rounds to nearest whole (default). -1 means do not round.
  *locale (String, optional):
  *override the locale used to determine formatting rules
  *fractional (Boolean, optional):
  *If false, show no decimal places, overriding places and pattern settings.
  */
  mo.localizeNumber = function(num, options){
    var decimalStr = num.toString().split('.')[1] || "",
          decimalLen = decimalStr.length;
    var _pattern = "";
    if (decimalLen > 0) {
      var patchStr = Array.prototype.join.call({
        length: decimalLen
      }, '0');
      _pattern = "#,###,###,##0.0" + patchStr;
    }else {
      _pattern = "#,###,###,##0";
    }
    
    var _options = {
      locale: config.locale,
      pattern: _pattern
    };
    lang.mixin(_options, options || {});
    return dojoNumber.format(num, _options);
  };

  /*
  *Optional
  *An object with the following properties:
  *pattern (String, optional):
  *override formatting pattern with this string. Default value is based on locale. 
   Overriding this property will defeat localization. Literal characters in patterns
   are not supported.
  *type (String, optional):
  *choose a format type based on the locale from the following: decimal,
   scientific (not yet supported), percent, currency. decimal by default.
  *locale (String, optional):
  *override the locale used to determine formatting rules
  *strict (Boolean, optional):
  *strict parsing, false by default. Strict parsing requires input as produced by the
   format() method. Non-strict is more permissive, e.g. flexible on white space, omitting
   thousands separators
  *fractional (Boolean|Array, optional):
  *Whether to include the fractional portion, where the number of decimal places are
   implied by pattern or explicit 'places' parameter. The value [true,false] makes the
   fractional portion optional.
  */
  mo.parseNumber = function(numStr, options){
    var _options = {
      locale: config.locale
    };
    lang.mixin(_options, options || {});
    return dojoNumber.parse(numStr, _options);
  };

  /*
  *Optional
  *An object with the following properties:
  *selector (String):
  *choice of 'time','date' (default: date and time)
  *formatLength (String):
  *choice of long, short, medium or full (plus any custom additions). Defaults to 'short'
  *datePattern (String):
  *override pattern with this string
  *timePattern (String):
  *override pattern with this string
  *am (String):
  *override strings for am in times
  *pm (String):
  *override strings for pm in times
  *locale (String):
  *override the locale used to determine formatting rules
  *fullYear (Boolean):
  *(format only) use 4 digit years whenever 2 digit years are called for
  *strict (Boolean):
  *(parse only) strict parsing, off by default
  */
  mo.localizeDate = function(d, options){
    var _options = {
      locale: config.locale,
      fullYear: true
    };
    lang.mixin(_options, options || {});
    return dateLocale.format(d, _options);
  };

  mo.addRelativePathInCss = addRelativePathInCss;

  mo.url = {
    isAbsolute: function(url){
      if(!url){
        return false;
      }
      return url.startWith('http') || url.startWith('/');
    }
  };

  mo.processUrlInWidgetConfig = function(url, widgetFolderUrl){
    if(!url){
      return;
    }
    if(url.startWith('data:') || url.startWith('http') || url.startWith('/')){
      return url;
    }else if(url.startWith('${appPath}')){
      return url.replace('${appPath}', window.appPath);
    }else{
      return widgetFolderUrl + url;
    }
  };

  mo.processUrlInAppConfig = function(url){
    if(!url){
      return;
    }
    if(url.startWith('data:') || url.startWith('http') || url.startWith('/')){
      return url;
    }else{
      return window.appPath + url;
    }
  };

  mo.getLocationUrlWithoutHashAndQueryParams = function(){
    //url:https://gallery.chn.esri.com:3344/webappbuilder/?action=setportalurl
    //result:https://gallery.chn.esri.com:3344/webappbuilder/
    var loc = window.location;
    return loc.protocol + "//" + loc.host + loc.pathname;
  };

  return mo;
});