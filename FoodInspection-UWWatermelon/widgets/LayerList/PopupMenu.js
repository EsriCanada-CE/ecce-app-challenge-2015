define([
  'dojo/_base/declare',
  'dojo/_base/array',
  'dojo/_base/html',
  'dojo/_base/lang',
  'dojo/query',
  'dojo/on',
  'jimu/dijit/DropMenu',
  'dijit/_TemplatedMixin',
  'dijit/form/HorizontalSlider',
  'dijit/form/HorizontalRuleLabels',
  'dojo/text!./PopupMenu.html',
  'dojo/dom-style',
  './NlsStrings'
], function(declare, array, html, lang, query, on, DropMenu,
_TemplatedMixin, HorizSlider, HorzRuleLabels, template, domStyle, NlsStrings) {
  return declare([DropMenu, _TemplatedMixin], {
    templateString: template,
    _deniedItems: null,

    constructor: function() {
      this.nls = NlsStrings.value;
      this._deniedItems = [];
    },

    _getDropMenuPosition: function(){
      return {
        top: "15px",
        //left: "-107px"
        left: 12 - html.getStyle(this.dropMenuNode, 'width') + 'px'
      };
    },

    _getTransNodePosition: function() {
      return {
        top: "15px",
        //left: "-107px"
        left: -174 - html.getStyle(this.dropMenuNode, 'width') + 'px'
      };
    },

    _onBtnClick: function(){
      if(!this.dropMenuNode){
        this._createDropMenuNode();
        this.own(on(this.dropMenuNode, 'click', lang.hitch(this, function(evt){
          evt.stopPropagation();
        })));
      }
    },

    // will call after openDropMenu 
    _refresh: function() {
      this._denyItems();
    },

    _denyItems: function() {
      var itemNodes = query("div[class~='menu-item']", this.dropMenuNode)
      .forEach(function(itemNode){
        html.removeClass(itemNode, "menu-item-dissable");
      });
      array.forEach(this._deniedItems, function(itemKey) {
        itemNodes.forEach(function(itemNode){
          if (html.getAttr(itemNode, 'itemId') === itemKey) {
            html.addClass(itemNode, "menu-item-dissable");
            if(itemKey === 'description' || itemKey === 'download') {
              query(".menu-item-description", itemNode).forEach(function(itemA){
                html.setAttr(itemA, 'href', '#');
                html.removeAttr(itemA, 'target');
              });
            }
          }
        });
      }, this);
    },

    selectItem: function(item){
      var index = this._deniedItems.indexOf(item.key);
      if (index === -1) {
        this.emit('onMenuClick', item);
      }
    },

    openDropMenu: function(deniedItemsDef){
      // if (deniedItems) {
      //   this._deniedItems = deniedItems;
      // } else {
      //   this._deniedItems = [];
      // }
      deniedItemsDef.then(lang.hitch(this, function(deniedItems) {
        this._deniedItems = deniedItems;
        this._refresh();
      }));
      this.inherited(arguments);
    },

    closeDropMenu: function(){
      this.inherited(arguments);
      this.hideTransNode();
    },

    // about transparcency
    _onTransparencyDivClick: function(evt) {
      // summary:
      //    response to click transparency in popummenu.
      evt.stopPropagation();
    },

    showTransNode: function(transValue) {
      /* global isRTL */
      if (!this.transHorizSlider) {
        this._createTransparencyWidget();
        this.transHorizSlider.set("value", 1 - transValue);
      }
      domStyle.set(this.transparencyDiv, "top", this._getTransNodePosition().top);
      if(isRTL) {
        domStyle.set(this.transparencyDiv, "right", this._getTransNodePosition().left);
      } else {
        domStyle.set(this.transparencyDiv, "left", this._getTransNodePosition().left);
      }
      domStyle.set(this.transparencyDiv, "display", "block");
    },

    hideTransNode: function() {
      domStyle.set(this.transparencyDiv, "display", "none");
    },

    _createTransparencyWidget: function() {
      this.transHorizSlider= new HorizSlider({
        minimum: 0,
        maximum: 1,
        intermediateChanges: true
      }, this.transparencyBody);

      this.own(this.transHorizSlider.on("change", lang.hitch(this, function(newTransValue){
        var data = {newTransValue: newTransValue};
        this.emit('onMenuClick', {key: 'transparencyChanged'}, data);
      })));

      new HorzRuleLabels({
        container: "bottomDecoration"
      }, this.transparencyRule);
    }
    

  });
});
