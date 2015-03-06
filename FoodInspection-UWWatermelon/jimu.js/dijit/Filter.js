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
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  'dojo/text!./templates/Filter.html',
  'jimu/filterUtils',
  'dijit/registry',
  'dojo/_base/lang',
  'dojo/_base/html',
  'dojo/_base/array',
  'dojo/on',
  'dojo/aspect',
  'dojo/query',
  'dojo/Deferred',
  'esri/request',
  './LoadingIndicator',
  './_SingleFilter',
  './_FilterSet'
],
function(declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin,
  template, filterUtils, registry, lang, html, array, on, aspect,
  query, Deferred, esriRequest, LoadingIndicator, SingleFilter, FilterSet) {
  return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, filterUtils], {
    templateString: template,
    baseClass: 'jimu-filter',
    declaredClass: 'jimu.dijit.Filter',
    nls: null,

    //test urls:
    //http://discomap.eea.europa.eu/arcgis/rest/services/
    //NoiseWatch/NoiseWatch_Overview_WM/MapServer/3

    //http://discomap.eea.europa.eu/arcgis/rest/services/
    //NoiseWatch/NoiseWatch_Overview_WM/MapServer/8

    //http://ec2-50-16-225-130.compute-1.amazonaws.com/arcgis/rest/services/
    //Agriculture/Inspection_history/MapServer/0

    //http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/
    //Demographics/ESRI_Census_USA/MapServer/5

    //http://sampleserver6.arcgisonline.com/arcgis/rest/services/
    //SampleWorldCities/MapServer/0

    _validOptions: false,
    _layerDefinition: null,
    _def: null,

    //options:
    noFilterTip: '',
    enableAskForValues: false,

    //public methods:
    //buildByExpr: expr->UI
    //buildByFilterObj: partsObj->UI
    //toJson: UI->partsObj
    //getFilterObjByExpr(inherited): expr->partsObj
    //getExprByFilterObj(inherited): partsObj->expr

    //attributes:
    //url: null, //required
    //expr: null,//optional
    //partsObj: null,//optional

    postMixInProperties:function(){
      this.nls = window.jimuNls.filterBuilder;
      var a = "${any_or_all}";
      var splits = this.nls.matchMsg.split(a);
      this.nls.strMatchMsgPart1 = splits[0] || '';
      this.nls.strMatchMsgPart2 = splits[1] || '';
      this.inherited(arguments);
    },

    postCreate: function(){
      this.inherited(arguments);
      if(this.noFilterTip && typeof this.noFilterTip === 'string'){
        this.noFilterTipSection.innerHTML = this.noFilterTip;
      }
    },

    reset: function(){
      if(!this.isBuilding()){
        this.removeAllFilters();
        this.url = null;
        this._layerDefinition = null;
        this.expr = null;
        this.partsObj = null;
      }
    },

    isBuilding: function(){
      return this._def && !this._def.isFulfilled();
    },

    buildByExpr: function(url, expr, /*optional*/ layerDefinition){
      var def = new Deferred();

      if(this.isBuilding()){
        def.reject('Filter is already building.');
      }
      else{
        this._def = null;
        this.reset();
        this.url = url;
        this.expr = expr || '1=1';
        this._layerDefinition = layerDefinition;
        this._def = this._init("expr");
        def = this._def;
      }
      
      return def;
    },

    //partsObj:{logicalOperator,parts,expr}
    buildByFilterObj: function(url, partsObj, /*optional*/ layerDefinition){
      var def = new Deferred();

      if(this.isBuilding()){
        def.reject('Filter is already building.');
      }
      else{
        this._def = null;
        this.reset();
        this.url = url;
        this.partsObj = partsObj;
        this._layerDefinition = layerDefinition;
        this._def = this._init("partsObj");
        def = this._def;
      }
      
      return def;
    },

    removeAllFilters: function(){
      this._destroyAllFilters();
    },

    _validateLayerDefinition: function(_layerDefinition){
      return this._isObject(_layerDefinition);
    },

    //return Deferred
    _init: function(mode){
      var def = new Deferred();

      if(!this._isString(this.url)){
        def.reject();
        return def;
      }

      var resolveDef = lang.hitch(this, function(){
        setTimeout(lang.hitch(this, function() {
          def.resolve();
        }), 1500);
      });

      var callback = lang.hitch(this, function() {
        html.setStyle(this.contentSection, 'display', 'block');
        html.setStyle(this.errorSection, 'display', 'none');
        this.removeAllFilters();
        var fields = this._layerDefinition.fields;
        if (!(fields && fields.length > 0)) {
          def.reject();
          return;
        }

        fields = array.filter(fields, lang.hitch(this, function(fieldInfo) {
          return this._supportFieldTypes.indexOf(fieldInfo.type) >= 0;
        }));
        var invalidFields = fields && fields.length > 0;
        if (!invalidFields) {
          this._showErrorOptions(this.nls.error.noFilterFields);
          def.reject();
          return;
        }
        this._validOptions = true;
        html.addClass(this.btnAddSet, 'enable');
        html.addClass(this.btnAddExp, 'enable');
        this.createFieldsStore();

        if (mode === 'expr') {
          if (this._isString(this.expr)) {
            var expression = this.expr.replace(/\s/gi, '');
            if (expression === '1=1') {
              this.removeAllFilters();
            }
            this._parseExpr(this.expr);
            resolveDef();
          }
          else{
            def.reject();
          }
        } else if (mode === 'partsObj') {
          if (this._validatePartsObj(this.partsObj)) {
            this._parsePartsObj(this.partsObj);
            resolveDef();
          }
          else{
            def.reject();
          }
        } else{
          if (this._validatePartsObj(this.partsObj)) {
            this._parsePartsObj(this.partsObj);
          } else if (this._isString(this.expr)) {
            this._parseExpr(this.expr);
          }
          else{
            //default is '1=1'
            this.removeAllFilters();
          }
          resolveDef();
        }
      });

      if(this._validateLayerDefinition(this._layerDefinition)){
        callback();
      }
      else{
        this.loading.show();
        esriRequest({
          url: this.url,
          content: {f:'json'},
          handleAs: 'json',
          callbackParamName: 'callback'
        }).then(lang.hitch(this, function(response){
          if(!this.domNode){
            def.reject();
            return;
          }
          this.loading.hide();
          this._layerDefinition = response;
          callback();
        }), lang.hitch(this, function(err){
          console.error(err);
          def.reject();
          if(!this.domNode){
            return;
          }
          this.loading.hide();
        }));
      }

      return def;
    },

    /**************************************************/
    /****  stringify                               ****/
    /**************************************************/
    toJson:function(){
      var json = {
        logicalOperator: this.allAnySelect.value,
        parts: []
      };
      var filters = this._getAllSingleFiltersAndFilterSets();
      if(filters.length === 0){
        json.expr = '1=1';
        return json;
      }
      array.forEach(filters,lang.hitch(this,function(filter){
        var part = filter.toJson();
        json.parts.push(part);
      }));
      var validParts = array.every(json.parts,lang.hitch(this,function(part){
        return part;
      }));
      if(validParts && json.parts.length > 0){
        json.expr = this.getExprByFilterObj(json);
        return json;
      }
      else{
        return null;
      }
    },

    /**************************************************/
    /****  lists                                   ****/
    /**************************************************/
    
    createFieldsStore: function(){
      if(!this._layerDefinition.fields || this._layerDefinition.fields.length === 0){
        this._showErrorOptions(this.nls.error.noFilterFields);
        return;
      }
      
      var copyLayerInfo = lang.mixin({},this._layerDefinition);
      var layerInfoFields = copyLayerInfo.fields;
      // layerInfoFields = layerInfoFields.sort(function(a, b){
      //   a.label = a.alias || a.name;
      //   b.label = b.alias || b.name;
      //   return a.label < b.label ? -1 : a.label > b.label ? 1 : 0;
      // });

      var validFieldCount = this.setFieldsStoreByFieldInfos(layerInfoFields);

      if(validFieldCount === 0){
        this._showErrorOptions(this.nls.error.noFilterFields);
      }
    },

    /**************************************************/
    /****  parse                                   ****/
    /**************************************************/
    _parsePartsObj:function(partsObj){
      if(!this._validatePartsObj(partsObj)){
        return;
      }
      this.removeAllFilters();
      this._buildEditUIByPartsObj(partsObj);
    },

    _parseExpr:function(expr){
      if(!this._validateLayerDefinition(this._layerDefinition)){
        return;
      }
      this._destroyAllFilters();
      if(!expr || typeof expr !== 'string'){
        this._showErrorOptions(this.nls.error.invalidSQL);
        return;
      }
      var partsObj = this.getFilterObjByExpr(expr);
      if(!partsObj){
        this._showErrorOptions(this.nls.error.cantParseSQL);
        return;
      }
      this._buildEditUIByPartsObj(partsObj);
    },

    _buildEditUIByPartsObj:function(partsObj){
      if(!partsObj){
        return;
      }
      this._destroyAllFilters();
      this.allAnySelect.value = partsObj.logicalOperator;
      array.forEach(partsObj.parts,lang.hitch(this,function(item){
        if(item.parts){
          //FilterSet
          this._addFilterSet(item);
        }
        else if(item.fieldObj && item.operator && item.valueObj){
          //SingleFilter
          this._addSingleFilter(item);
        }
      }));
    },

    /**************************************************/
    /****  edit                                    ****/
    /**************************************************/

    _addSingleFilter:function(/*optional*/ part){
      var args = {
        url: this.url,
        layerInfo: this._layerDefinition,
        stringFieldType: this._stringFieldType,
        dateFieldType: this._dateFieldType,
        numberFieldTypes: this._numberFieldTypes,
        part: part,
        OPERATORS: lang.mixin({}, this.OPERATORS),
        enableAskForValues: this.enableAskForValues
      };
      var singleFilter = new SingleFilter(args);
      singleFilter.placeAt(this.allExpsBox);
      singleFilter.startup();
      this.own(aspect.after(singleFilter,'_destroySelf',lang.hitch(this,this._checkFilterNumbers)));
      this._checkFilterNumbers();
    },

    _addFilterSet:function(/*optional*/ partsObj){
      var args = {
        url: this.url,
        layerInfo: this._layerDefinition,
        stringFieldType: this._stringFieldType,
        dateFieldType: this._dateFieldType,
        numberFieldTypes: this._numberFieldTypes,
        partsObj: partsObj,
        OPERATORS: lang.mixin({}, this.OPERATORS),
        enableAskForValues: this.enableAskForValues
      };
      var filterSet = new FilterSet(args);
      filterSet.placeAt(this.allExpsBox);
      filterSet.startup();
      this.own(aspect.after(filterSet,'_destroySelf',lang.hitch(this,this._checkFilterNumbers)));
      this._checkFilterNumbers();
    },

    _destroyAllFilters:function(){
      var filters = this._getAllSingleFiltersAndFilterSets();
      while(filters.length > 0){
        var f = filters[0];
        f.destroy();
        filters.splice(0,1);
      }
      this._checkFilterNumbers();
    },

    _getAllSingleFiltersAndFilterSetsDoms: function(){
      return query('.allExpsBox>.jimu-single-filter,.allExpsBox>.jimu-filter-set',
                   this.contentSection);
    },

    _getAllSingleFiltersAndFilterSets:function(){
      var nodes = this._getAllSingleFiltersAndFilterSetsDoms();
      var filters = array.map(nodes,lang.hitch(this,function(node){
        return registry.byNode(node);
      }));
      return filters;
    },

    _checkFilterNumbers:function(){
      var filterDoms = this._getAllSingleFiltersAndFilterSetsDoms();
      if(filterDoms.length > 1){
        html.setStyle(this.matchMsg,'display','block');
      }
      else{
        html.setStyle(this.matchMsg,'display','none');
      }

      if(filterDoms.length > 0){
        html.setStyle(this.noFilterTipSection, 'display', 'none');
      }
      else{
        html.setStyle(this.noFilterTipSection, 'display', 'block');
      }

      array.forEach(filterDoms, lang.hitch(this, function(filterDom, index){
        html.removeClass(filterDom, 'even-filter');
        html.removeClass(filterDom, 'odd-filter');
        var cName = index % 2 === 0 ? "even-filter" : "odd-filter";
        html.addClass(filterDom, cName);
      }));
    },

    _showErrorOptions:function(strError){
      html.setStyle(this.contentSection,'display','none');
      html.setStyle(this.errorSection,'display','none');//block
      this.errorTip.innerHTML = strError;
      this.loading.hide();
    },

    _onBtnAddSetClick:function(){
      if(!this._layerDefinition || !this._validOptions){
        return;
      }
      this._addFilterSet();
    },

    _onBtnAddExpClick:function(){
      if(!this._layerDefinition || !this._validOptions){
        return;
      }
      this._addSingleFilter();
    }
  });
});