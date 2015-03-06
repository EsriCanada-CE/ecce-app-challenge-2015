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
    "dojo/_base/lang",
    'dojo/_base/html',
    "dojo/Deferred",
    'dojo/on',
    'dojo/sniff',
    'dijit/_WidgetsInTemplateMixin',
    'dijit/Editor',
    'dijit/_editor/plugins/LinkDialog',
    'dijit/_editor/plugins/ViewSource',
    'dijit/_editor/plugins/FontChoice',
    'dojox/editor/plugins/Preview',
    'dijit/_editor/plugins/TextColor',
    'dojox/editor/plugins/ToolbarLineBreak',
    'dijit/ToolbarSeparator',
    'dojox/editor/plugins/FindReplace',
    'dojox/editor/plugins/PasteFromWord',
    'dojox/editor/plugins/InsertAnchor',
    'dojox/editor/plugins/Blockquote',
    'dojox/editor/plugins/UploadImage',
    './ChooseImage',
    'jimu/BaseWidgetSetting'
  ],
  function(
    declare,
    lang,
    html,
    Deferred,
    on,
    has,
    _WidgetsInTemplateMixin,
    Editor,
    LinkDialog,
    ViewSource,
    FontChoice,
    Preview,
    TextColor,
    ToolbarLineBreak,
    ToolbarSeparator,
    FindReplace,
    PasteFromWord,
    InsertAnchor,
    Blockquote,
    UploadImage,
    ChooseImage,
    BaseWidgetSetting) {
    return declare([BaseWidgetSetting, _WidgetsInTemplateMixin], {
      //these two properties is defined in the BaseWidget
      baseClass: 'jimu-widget-about-setting',

      postCreate: function() {
        this.initEditor();
      },

      startup: function() {
        this.inherited(arguments);
        if (!this.config.about) {
          this.config.about = {};
        }

        this.setConfig(this.config);
      },

      initEditor: function() {
        this.editor = new Editor({
          plugins: [
            'bold', 'italic', 'underline', 'foreColor', 'hiliteColor',
            '|', 'justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull',
            '|', 'insertOrderedList', 'insertUnorderedList', 'indent', 'outdent'
          ],
          extraPlugins: [
            '|', 'createLink', 'unlink', 'pastefromword', '|', 'undo', 'redo',
            '|', 'chooseImage', 'uploadImage', 'toolbarlinebreak',
            'fontName', 'fontSize', 'formatBlock'
          ]
        }, this.editor);
        html.setStyle(this.editor.domNode, {
          width: '100%',
          height: '100%'
        });
        this.editor.startup();

        if (has('ie') !== 8) {
          this.editor.resize({
            w: '100%',
            h: '100%'
          });
        }
      },

      setConfig: function(config) {
        this.config = config;

        this.editor.set('value', config.about.aboutContent || this.nls.defaultContent);
      },

      getConfig: function() {
        this.config.about.aboutContent = this.editor.get('value');
        return this.config;
      }
    });
  });