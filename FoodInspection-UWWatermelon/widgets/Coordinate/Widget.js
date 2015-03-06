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

define([
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/html',
    'dojo/sniff',
    'dijit/_WidgetsInTemplateMixin',
    "esri/geometry/Point",
    'esri/SpatialReference',
    'jimu/BaseWidget',
    'jimu/utils',
    'dojo/_base/lang',
    'dojo/on',
    'dojo/number',
    "dojo/dom-style",
    "dojo/dom-class",
    "dojo/dom-construct",
    "dijit/DropDownMenu",
    "dijit/MenuItem",
    "dijit/CheckedMenuItem",
    "dojo/aspect",
    "dojo/Deferred",
    "esri/request",
    "esri/tasks/ProjectParameters",
    "esri/tasks/GeometryService",
    "esri/geometry/webMercatorUtils",
    "jimu/portalUtils",
    "esri/config",
    "libs/usng/usng",
    "jimu/SpatialReference/unitUtils"
  ],
  function(
    declare,
    array,
    html,
    has,
    _WidgetsInTemplateMixin,
    Point,
    SpatialReference,
    BaseWidget,
    utils,
    lang,
    on,
    dojoNumber,
    domStyle,
    domClass,
    domConstruct,
    DropDownMenu,
    MenuItem,
    CheckedMenuItem,
    aspect,
    Deferred,
    esriRequest,
    ProjectParameters,
    GeometryService,
    webMercatorUtils,
    portalUtils,
    esriConfig,
    usng,
    unitUtils
  ) {
    var dictionary = {
      "INCHES": "Inches",
      "FOOT": "Foot",
      "FEET": "Foot",
      "YARDS": "Yards",
      "MILES": "Miles",
      "NAUTICAL_MILES": "Nautical_Miles",
      "MILLIMETERS": "Millimeters",
      "CENTIMETERS": "Centimeters",
      "METER": "Meter",
      "METERS": "Meter",
      "KILOMETERS": "Kilometers",
      "DECIMETERS": "Decimeters",
      "DEGREE": "Decimal_Degrees",
      "DECIMAL_DEGREES": "Decimal_Degrees",
      "DEGREE_MINUTE_SECONDS": "Degree_Minutes_Seconds",
      "MGRS": "MGRS",
      "USNG": "USNG"
    };
    var esriUnits = {
      "esriCentimeters": "CENTIMETERS",
      "esriDecimalDegrees": "DECIMAL_DEGREES",
      "esriDegreeMinuteSeconds": "DEGREE_MINUTE_SECONDS",
      "esriDecimeters": "DECIMETERS",
      "esriFeet": "FEET",
      "esriInches": "INCHES",
      "esriKilometers": "KILOMETERS",
      "esriMeters": "METERS",
      "esriMiles": "MILES",
      "esriMillimeters": "MILLIMETERS",
      "esriNauticalMiles": "NAUTICAL_MILES",
      "esriPoints": "POINTS",
      "esriUnknownUnits": "UNKNOWN",
      "esriYards": "YARDS"
    };
    /**
     * The Coordinate widget displays the current mouse coordinates.
     * If the map's spatial reference is geographic or web mercator,
     * the coordinates can be displayed as
     * decimal degrees or as degree-minute-seconds.
     * Otherwise, the coordinates will show in map units.
     *
     * @module widgets/Coordinate
     */
    var clazz = declare([BaseWidget, _WidgetsInTemplateMixin], {
      /**
       * realtime: {
       *   102100: all unit,
       *   4326: geoUnit,usng,mgrs,
       *   projCS: projUnit,
       *   geoCS: geoUnit,usng,mgrs,
       * }
       * click: {
       *   projectCS: {
       *     geoUnit:  convert to ellipsoidal coordinates,
       *     projUnit: convert on client,
       *     usng、mgrs: get longtitude and latitude, then convert to usng/mgrs on client,
       *   },
       *   geoCS: {
       *     geoUnit: convert to ellipsoidal coordinates,
       *     usng、mgrs: get longtitude and latitude, then convert to usng/mgrs on client
       *   }
       * }
       */

      baseClass: 'jimu-widget-coordinate',
      name: 'Coordinate',
      popMenu: null,
      selectedWkid: null,
      selectedItem: null,
      selectedTfWkid: null,
      forward: true,
      enableRealtime: false,
      geoServiceUrl: null,

      _mapWkid: null,
      _configured: false,

      postMixInProperties: function() {
        this.nls.enableClick = this.nls.enableClick ||
          "Click to enable clicking map to get coordinates";
        this.nls.disableClick = this.nls.disableClick ||
          "Click to disable clicking map to get coordinates";
      },

      startup: function() {
        this.inherited(arguments);
        this._mapWkid = this.map.spatialReference.isWebMercator() ?
          3857 : this.map.spatialReference.wkid;
        this.selectedWkid = this._mapWkid;

        if (!(this.config.spatialReferences && this.config.spatialReferences.length)) {
          html.setStyle(this.foldableNode, 'display', 'none');
        } else {
          html.setStyle(this.foldableNode, 'display', 'inline-block');
        }
      },

      onOpen: function() {
        domClass.add(this.coordinateBackground, "coordinate-background");
        this.own(on(this.map, "mouse-move", lang.hitch(this, this.onMouseMove)));
        this.own(on(this.map, "click", lang.hitch(this, this.onMapClick)));
        this.own(on(this.locateButton, "click", lang.hitch(this, this.onLocateButtonClick)));
        
        if (has('ie') && has('ie') < 9) {
          // coordinateBackground
          this.own(on(this.coordinateBackground, "mouseover", lang.hitch(this, this.onMouseOver)));
          this.own(on(this.coordinateBackground, "mouseout", lang.hitch(this, this.onMouseOut)));
        } else {
          this.own(on(this.foldContainer, "mouseover", lang.hitch(this, this.onMouseOver)));
          this.own(on(this.foldContainer, "mouseout", lang.hitch(this, this.onMouseOut)));
        }

        this.own(on(
          this.coordinateMenuContainer,
          "mouseover",
          lang.hitch(this, this.onMouseOverMenu)
        ));
        this.own(on(
          this.coordinateMenuContainer,
          "mouseout",
          lang.hitch(this, this.onMouseOutMenu)
        ));

        this._processData().then(lang.hitch(this, function(spatialReferences) {
          this.initPopMenu(spatialReferences);
        }), lang.hitch(this, function(err) {
          console.error(err);
        }));
      },

      _processData: function() {
        var def = new Deferred();

        var basemap = this.map.itemInfo.itemData.baseMap.baseMapLayers[0];
        if (!(this.config.spatialReferences && this.config.spatialReferences.length)) {
          portalUtils.getUnits(this.appConfig.portalUrl).then(lang.hitch(this, function(units) {
            var isBingMap = basemap && (basemap.type === "BingMapsRoad" ||
              basemap.type === "BingMapsHybrid" || basemap.type === "BingMapsAerial");
            var isWebTiled = basemap && basemap.type === 'WebTiledLayer';
            if (basemap && basemap.url) {
              esriRequest({
                url: basemap.url,
                handleAs: "json",
                callbackParamName: "callback",
                content: {
                  f: "json"
                }
              }).then(lang.hitch(this, function(mapData) {
                var unitOptions = this._getUnconfiguredUnitOptions(mapData.units, units);

                var json = {
                  wkid: mapData.spatialReference.latestWkid || mapData.spatialReference.wkid,
                  label: "",
                  outputUnit: unitOptions.outputUnit
                };
                var _options = {
                  sameSRWithMap: true,
                  defaultUnit: esriUnits[mapData.units],
                  isGeographicUnit: unitOptions.isGeographicUnit,
                  isGeographicCS: unitOptions.isGeographicCS,
                  isProjectUnit: unitOptions.isProjectUnit,
                  isProjectedCS: unitOptions.isProjectedCS,
                  unitRate: unitOptions.unitRate
                };
                json.options = _options;

                this._configured = false;
                def.resolve(json);
              }), lang.hitch(this, function(err) {
                console.error(err);
                def.reject(err);
              }));
            } else if (basemap && (basemap.type === "OpenStreetMap" || isBingMap || isWebTiled)) {
              var unitOptions = this._getUnconfiguredUnitOptions("esriMeters", units);
              var json = {
                wkid: 3857,
                label: "",
                outputUnit: unitOptions.outputUnit
              };
              var _options = {
                sameSRWithMap: true,
                defaultUnit: esriUnits.esriMeters,
                isGeographicUnit: unitOptions.isGeographicUnit,
                isGeographicCS: unitOptions.isGeographicCS,
                isProjectUnit: unitOptions.isProjectUnit,
                isProjectedCS: unitOptions.isProjectedCS,
                unitRate: unitOptions.unitRate
              };
              json.options = _options;

              this._configured = false;
              def.resolve(json);
            } else {
              def.reject(new Error("no baseMap"));
            }
          }));
        } else {
          this._configured = true;
          def.resolve(this.config.spatialReferences);
        }

        return def;
      },

      _getUnconfiguredUnitOptions: function(mapUnits, localeUnits) {
        var dicUnits = dictionary[esriUnits[mapUnits]],
          _outputUnit = "",
          _unitRate = 1,
          _isGeographicCS = "",
          _isGeographicUnit = "",
          _isProjectedCS = "",
          _isProjectUnit = "";

        if (unitUtils.isProjectUnit(dicUnits)) {
          _isProjectUnit = true;
          _isProjectedCS = true;
          _isGeographicUnit = false;
          _isGeographicCS = false;
          _outputUnit = localeUnits === "english" ?
            dictionary[esriUnits.esriFeet].toUpperCase() :
            dictionary[esriUnits.esriMeters].toUpperCase();
          _unitRate = unitUtils.getUnitRate(
            dictionary[esriUnits[mapUnits]].toUpperCase(),
            _outputUnit
          );
        } else if (unitUtils.isGeographicUnit(dicUnits)) {
          _isProjectUnit = false;
          _isProjectedCS = false;
          _isGeographicUnit = true;
          _isGeographicCS = true;
          _outputUnit = esriUnits[mapUnits].toUpperCase();
        }

        //default show mercator is degrees.
        if (this.map.spatialReference.isWebMercator()) {
          _outputUnit = esriUnits.esriDecimalDegrees;
          _isGeographicUnit = true;
          _isProjectUnit = false;
          _unitRate = 1;
        }

        return {
          outputUnit: _outputUnit,
          unitRate: _unitRate,
          isGeographicUnit: _isGeographicUnit,
          isGeographicCS: _isGeographicCS,
          isProjectUnit: _isProjectUnit,
          isProjectedCS: _isProjectedCS
        };
      },

      initPopMenu: function(spatialReferences) {
        this.popMenu = new DropDownMenu({}, this.coordinateMenu);
        aspect.after(this.popMenu, "onItemClick", lang.hitch(this, this.onClickMenu), true);

        //if configured spatialReferences use
        //the first sr as defalut else add the map sr as default.
        if (Object.prototype.toString.call(spatialReferences) !== "[object Array]") {
          this.selectedWkid = parseInt(spatialReferences.wkid, 10);
          this.addMenuItem(
            '',
            this.selectedWkid,
            spatialReferences.outputUnit,
            null,
            null,
            spatialReferences.options
          );
          this.selectedItem = this.popMenu.getChildren()[0];
        } else {
          this.selectedWkid = parseInt(spatialReferences[0].wkid, 10);
          this.selectedTfWkid = spatialReferences[0].transformationWkid &&
            parseInt(spatialReferences[0].transformationWkid, 10);
          this._addAllMenuItems();
          this.selectedItem = this.popMenu.getChildren()[0];
        }

        this._adjustCoordinateInfoUI(this.selectedWkid);
        this.popMenu.startup();
      },

      _addAllMenuItems: function() {
        var len = this.config.spatialReferences.length;
        for (var i = 0; i < len; i++) {
          this.addMenuItem(
            this.config.spatialReferences[i].label,
            this.config.spatialReferences[i].wkid,
            this.config.spatialReferences[i].outputUnit,
            this.config.spatialReferences[i].transformationWkid,
            this.config.spatialReferences[i].transformForward,
            this.config.spatialReferences[i].options
          );
        }
      },

      _isWebMercator: function(wkid) {
        // true if this spatial reference is web mercator
        if (SpatialReference.prototype._isWebMercator) {
          return SpatialReference.prototype._isWebMercator.apply({
            wkid: parseInt(wkid, 10)
          }, []);
        } else {
          var sr = new SpatialReference(parseInt(wkid, 10));
          return sr.isWebMercator();
        }
      },

      canShowInClient: function(wkid) {
        var specialCase = (this._mapWkid === 4326 && this._isWebMercator(wkid)) ||
          (this._isWebMercator(this._mapWkid) && parseInt(wkid, 10) === 4326);
        var option = this.selectedItem.get('options');
        if ((option && option.sameSRWithMap) || specialCase) {
          return true;
        } else {
          return false;
        }
      },

      onClickMenu: function(event) {
        this.selectedItem.set({
          label: this.getStatusString(
            false,
            this.selectedItem.params.name,
            this.selectedItem.params.wkid
          )
        });
        this.selectedWkid = parseInt(event.params.wkid, 10);
        this.selectedTfWkid = event.params.tfWkid;
        this.forward = event.params.forward;
        event.set({
          label: this.getStatusString(true, event.params.name, event.params.wkid)
        });
        this.selectedItem = event;

        this._adjustCoordinateInfoUI(this.selectedWkid);
      },

      _adjustCoordinateInfoUI: function(selectedWkid) {
        if (this.canShowInClient(selectedWkid)) {
          this.enableRealtime = true;
          this.coordinateInfo.innerHTML = this.nls.realtimeLabel;
          html.setStyle(this.locateContainer, 'display', 'block');
          html.removeClass(this.locateContainer, 'coordinate-locate-container-active');
          html.setAttr(this.locateButton, 'title', this.nls.enableClick);
        } else {
          this.enableRealtime = false;
          this.coordinateInfo.innerHTML = this.nls.hintMessage;
          html.setStyle(this.locateContainer, 'display', 'none');
          html.setAttr(this.locateButton, 'title', this.nls.disableClick);
        }

        if (has('ios') || has('android')) {
          html.setStyle(this.locateContainer, 'display', 'none');
        }
      },

      onLocateButtonClick: function() {
        html.toggleClass(this.locateContainer, 'coordinate-locate-container-active');
        if (this.enableRealtime) {
          this.enableRealtime = false;
          this.coordinateInfo.innerHTML = this.nls.hintMessage;
          html.setAttr(this.locateButton, 'title', this.nls.disableClick);
        } else {
          this.enableRealtime = true;
          this.coordinateInfo.innerHTML = this.nls.realtimeLabel;
          html.setAttr(this.locateButton, 'title', this.nls.enableClick);
        }
      },

      getStatusString: function(selected, name, wkid) {
        var label = "";
        var mapWkid = this._mapWkid;
        wkid = parseInt(wkid, 10);

        if (selected) {
          label = "&nbsp;&nbsp;&bull;&nbsp;&nbsp;" + "<b>" +
            label + name + "</b>&nbsp;(" + wkid + ")&lrm;&nbsp;";
        } else {
          label = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" +
            label + name + "&nbsp;&nbsp;(" + wkid + ")&lrm;&nbsp;";
        }
        if (wkid === mapWkid) {
          label += this.nls.defaultLabel;
        }
        return label;
      },

      addMenuItem: function(name, wkid, outputUnit, tfWkid, forward, _options) {
        var label = this.getStatusString(false, name, wkid);
        if (this.selectedWkid === parseInt(wkid, 10)) {
          label = this.getStatusString(true, name, wkid);
        }
        var item = {
          label: label || "",
          name: name || "",
          wkid: wkid || "",
          outputUnit: outputUnit || "",
          tfWkid: tfWkid || "",
          options: _options
        };
        if (item.tfWkid) {
          item.forward = forward;
        }

        this.popMenu.addChild(new MenuItem(item));
      },

      _toFormat: function(num) {
        var decimalPlaces = isFinite(parseInt(this.config.decimalPlaces, 10)) ?
          parseInt(this.config.decimalPlaces, 10) : 3;
        var decimalStr = num.toString().split('.')[1] || "",
          decimalLen = decimalStr.length,
          patchStr = "",
          fix = decimalLen < decimalPlaces ? decimalLen : decimalPlaces;

        if (decimalLen < decimalPlaces) {
          patchStr = Array.prototype.join.call({
            length: decimalPlaces - decimalLen + 1
          }, '0');
        }

        num = num.toFixed(fix) + patchStr;

        return this.separator(num, decimalPlaces);
      },

      onProjectComplete: function(wkid, geometries) {
        if (!this.selectedWkid || wkid !== this.selectedWkid) {
          return;
        }
        var point = geometries[0],

          x = point.x,
          y = point.y;
        var outputUnit = this.selectedItem.get('outputUnit');
        var options = this.selectedItem.get('options');

        if ("MGRS" === outputUnit || "USNG" === outputUnit) {
          this._displayUsngOrMgrs(outputUnit, y, x);
        } else if (options.isGeographicUnit) {
          this._displayDegOrDms(outputUnit, y, x);
        } else {
          this._displayProject(outputUnit, y, x);
        }
      },

      _unitToNls: function(outUnit) {
        var nlsLabel = dictionary[outUnit.toUpperCase()];
        return this.nls[nlsLabel] || this.nls[outUnit] || outUnit;
      },

      onError: function(msg) {
        alert(msg);
      },

      onMapClick: function(evt) {
        if (this.enableRealtime || !this.selectedItem) {
          return;
        }

        if (this.canShowInClient(this.selectedWkid)) {
          this._displayOnClient(evt.mapPoint);
          return;
        }

        var point = new Point(evt.mapPoint.x, evt.mapPoint.y, this.map.spatialReference);
        var params = new ProjectParameters();
        var outWkid = null;
        var options = this.selectedItem.get('options');
        params.geometries = [point];

        if (options.isProjectedCS) {
          if (options.isProjectUnit) {
            outWkid = this.selectedWkid;
          } else { // geoUnit or USNG, MGRS
            outWkid = options.spheroidCS;
          }
        } else if (options.isGeographicCS) {
          outWkid = this.selectedWkid;
        }

        if (this.selectedTfWkid) {
          params.transformation = new SpatialReference(parseInt(this.selectedTfWkid, 10));
          params.transformForward = JSON.parse(this.forward);
        }

        params.outSR = new SpatialReference(parseInt(outWkid, 10));

        this.coordinateInfo.innerHTML = this.nls.computing;
        // console.log(params.toJson());
        esriConfig.defaults.geometryService.project(params,
          lang.hitch(this, this.onProjectComplete, this.selectedWkid),
          lang.hitch(this, this.onError)
        );
      },

      _displayOnClient: function(mapPoint) {
        var outUnit = this.selectedItem.get('outputUnit');

        var x = mapPoint.x,
          y = mapPoint.y;

        var normalizedPoint = null;
        var convertInClient = (this._mapWkid === 4326 && this._isWebMercator(this.selectedWkid)) ||
          (this._isWebMercator(this._mapWkid) && this.selectedWkid === 4326);
        var options = this.selectedItem.get('options');

        // make sure longitude values stays within -180/180
        normalizedPoint = mapPoint.normalize();
        if (options.isGeographicUnit) {
          x = normalizedPoint.getLongitude() || x;
        }
        if (options.isGeographicUnit) {
          y = normalizedPoint.getLatitude() || y;
        }

        if (convertInClient) {
          // process special case
          if (mapPoint.spatialReference.wkid === 4326 && this._isWebMercator(this.selectedWkid)) {
            if ("MGRS" === outUnit || "USNG" === outUnit) {
              this._displayUsngOrMgrs(
                outUnit,
                normalizedPoint.getLatitude(),
                normalizedPoint.getLongitude()
              );
            } else if (options.isGeographicUnit) {
              this._displayDegOrDms(outUnit, y, x);
            } else if (options.isProjectUnit) {
              var mCoord = webMercatorUtils.lngLatToXY(x, y);
              this._displayProject(outUnit, mCoord[1], mCoord[0]);
            }
          } else if (mapPoint.spatialReference.isWebMercator() &&
            this.selectedWkid === 4326) {
            if ("MGRS" === outUnit || "USNG" === outUnit) {
              this._displayUsngOrMgrs(
                outUnit,
                normalizedPoint.getLatitude(),
                normalizedPoint.getLongitude()
              );
            } else if (options.isGeographicUnit) {
              this._displayDegOrDms(outUnit, y, x);
            }
          }
        } else {
          // use default units
          if (options.defaultUnit === outUnit) {
            this.coordinateInfo.innerHTML = this._toFormat(x) +
              "&nbsp;&nbsp;" + this._toFormat(y);
            this.coordinateInfo.innerHTML += " " + this._unitToNls(outUnit);
            return;
          }
          // setting display units
          if (mapPoint.spatialReference.wkid === 4326 ||
            mapPoint.spatialReference.isWebMercator()) {
            if ("MGRS" === outUnit || "USNG" === outUnit) {
              this._displayUsngOrMgrs(
                outUnit,
                normalizedPoint.getLatitude(),
                normalizedPoint.getLongitude()
              );
            } else if (options.isGeographicUnit) {
              this._displayDegOrDms(outUnit, y, x);
            } else if (options.isProjectedCS) {
              this._displayProject(outUnit, y, x);
            }
          } else { // proj or geo
            if (options.isProjectedCS) {
              this._displayProject(outUnit, y, x);
            } else if (options.isGeographicCS) {
              if ("MGRS" === outUnit || "USNG" === outUnit) {
                this._displayUsngOrMgrs(outUnit, y, x);
              } else if (options.isGeographicUnit) {
                this._displayDegOrDms(outUnit, y, x);
              }
            }
          }
        }
      },

      onMouseMove: function(evt) {
        if (!this.enableRealtime || !this.selectedItem) {
          return;
        }

        this._displayOnClient(evt.mapPoint);
      },

      _displayUsngOrMgrs: function(outUnit, y, x) {
        if ("MGRS" === outUnit) {
          this.coordinateInfo.innerHTML = usng.LLtoMGRS(y, x, 5);
        } else if ("USNG" === outUnit) {
          this.coordinateInfo.innerHTML = usng.LLtoUSNG(y, x, 5);
        }

        this.coordinateInfo.innerHTML += " " + this._unitToNls(outUnit);
      },

      _displayDegOrDms: function(outUnit, y, x) {
        var lat_string = "";
        var lon_string = "";
        var options = this.selectedItem.get('options');

        x = x * options.unitRate;
        y = y * options.unitRate;

        if ("DEGREE_MINUTE_SECONDS" === outUnit) {
          lat_string = this.degToDMS(y, 'LAT');
          lon_string = this.degToDMS(x, 'LON');
          this.coordinateInfo.innerHTML = lat_string + "&nbsp;&nbsp;&nbsp;" + lon_string;
        } else {
          this.coordinateInfo.innerHTML = this._toFormat(y) +
            "&nbsp;&nbsp;" + this._toFormat(x);

          this.coordinateInfo.innerHTML += " " + this._unitToNls(outUnit);
        }
      },

      _displayProject: function(outUnit, y, x) {
        var options = this.selectedItem.get('options');
        x = x * options.unitRate;
        y = y * options.unitRate;

        this.coordinateInfo.innerHTML = this._toFormat(x) +
          "&nbsp;&nbsp;" + this._toFormat(y);

        this.coordinateInfo.innerHTML += " " + this._unitToNls(outUnit);
      },

      onMouseOver: function() {
        if (this._configured) {
          domStyle.set(this.coordinateMenuContainer, "display", "block");
          var textBox = html.getMarginBox(this.coordinateInfoMenu);
          var box = html.getContentBox(this.coordinateBackground);
          // var pbExtents = html.getPadBorderExtents(this.domNode);
          if (box.w - textBox.w > 0) {
            html.setStyle(this.foldContainer, 'width', (box.w - textBox.w) + 'px');
          }
        }
      },
      onMouseOut: function() {
        domStyle.set(this.coordinateMenuContainer, "display", "none");
        html.setStyle(this.foldContainer, 'width', '10px');
      },
      onMouseOverMenu: function() {
        domStyle.set(this.coordinateMenuContainer, "display", "block");
      },
      onMouseOutMenu: function() {
        domStyle.set(this.coordinateMenuContainer, "display", "none");
        html.setStyle(this.foldContainer, 'width', '10px');
      },

      /**
       * Helper function to prettify decimal degrees into DMS (degrees-minutes-seconds).
       *
       * @param {number} decDeg The decimal degree number
       * @param {string} decDir LAT or LON
       *
       * @return {string} Human-readable representation of decDeg.
       */
      degToDMS: function(decDeg, decDir) {
        /** @type {number} */
        var d = Math.abs(decDeg);
        /** @type {number} */
        var deg = Math.floor(d);
        d = d - deg;
        /** @type {number} */
        var min = Math.floor(d * 60);
        /** @type {number} */
        var sec = Math.floor((d - min / 60) * 60 * 60);
        if (sec === 60) { // can happen due to rounding above
          min++;
          sec = 0;
        }
        if (min === 60) { // can happen due to rounding above
          deg++;
          min = 0;
        }
        /** @type {string} */
        var min_string = min < 10 ? "0" + min : min;
        /** @type {string} */
        var sec_string = sec < 10 ? "0" + sec : sec;
        /** @type {string} */
        var dir = (decDir === 'LAT') ? (decDeg < 0 ? "S" : "N") : (decDeg < 0 ? "W" : "E");

        return (decDir === 'LAT') ?
          deg + "&deg;" + min_string + "&prime;" + sec_string + "&Prime;" + dir :
          deg + "&deg;" + min_string + "&prime;" + sec_string + "&Prime;" + dir;
      },

      separator: function(nStr, places) {
        if (this.config.addSeparator && JSON.parse(this.config.addSeparator)) {
          return utils.localizeNumber(nStr, {
            places: places
          });
        }
        return nStr;
      }
    });

    return clazz;
  });