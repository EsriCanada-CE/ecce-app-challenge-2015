import Marionette from 'backbone.marionette';
import _ from 'lodash';
import $ from 'jquery';

import L from 'leaflet';
import esri from 'esri-leaflet';
require('leaflet-hash');
require('leaflet-panel-layers/dist/leaflet-panel-layers.src');
require('leaflet.markercluster');
require('esri-leaflet-clustered-feature-layer');

import popupTemplate from './popup.hbs';
import layers from './layers.json';
import WindyLayer from './wind/WindyLayer';

// Create a view for the map part of the app
export default Marionette.ItemView.extend({
    template: false,
    id: 'map',
    events: {
        'change :checkbox': 'radioIt'
    },
    modelEvents: {
        'update': 'updateView'
    },

    onShow() {
        global.map = this;
        this.map = L.map(this.el);
        // Set the extents
        this.updateView();
        // Start keeping track of the extent in the hash for linkable
        // urls.
        L.hash(this.map);

        this.baseLayers = _.map(layers.baseLayers, (layer, index) => {
            let name = _.words(layer);
            return {
                // Put a space between words (disable for mobile due to size constraints).
                name: L.Browser.mobile ? name[0] : name.join(' '),
                // Make a feature layer
                layer: esri.basemapLayer(layer),
                // Mark the first one active
                active: !index
            };
        });

        this.stationLayers = _.map(layers.stationLayers, (config, index) => {
            let layer = L.esri.clusteredFeatureLayer(config.url, {
                pointToLayer(geojson, latlng) {
                    return L.marker(latlng, {
                        icon: L.icon({
                            iconUrl: 'http://rawgit.com/fivehourshower/Zephyr/master/src/map/pollution-icon.svg',
                            iconSize: [32, 32]
                        })
                    });
                }
            });

            // Register the popup template
            layer.bindPopup(feature => popupTemplate({config, properties: feature.properties}));

            return {
                group: 'station',
                name: config.abbr,
                layer: layer,
                active: !index
            };
        });

        let stationLayers = _.pluck(this.stationLayers, 'layer');
        this.windLayer = new WindyLayer({
            url: 'gfs.json',
            opacity: 0.50,
            // Helper to get the station layer so we can
            // query the visible stations for wind vectors
            // Should probably be a service instead :/
            // This functionality went unused :'(
            getStation: () => {
                return _.find(stationLayers, this.map.hasLayer, this.map);
            }
        });
        this.windLayer.addTo(this.map);

        //Make menuControl responsible for adding the layers to the map
        this.menuControl = new L.Control.PanelLayers(this.baseLayers, this.stationLayers);
        this.map.addControl( this.menuControl );

        // Map abbreviations to a object for easy lookup
        let abbr = _.transform(layers.stationLayers, (memo, layer) => memo[layer.abbr] = layer.name, {});
        // We use setInterval cause tile layers will change periodically
        setInterval(() => {
            // Set titles (should of forked panel view for this)
            this.$('.leaflet-panel-layers-item span')
                // Setup tooltips
                .attr('data-toggle', 'tooltip')
                .attr('data-placement', 'left')
                .attr('title', function() {
                    return abbr[_.trim($(this).text())];
                })
                .tooltip({ container: 'body' });
        }, 1000);
    },

    // Update the view from the model if the hash isn't set (indicating the requested pose)
    updateView() {
        if (!location.hash) {
            this.map.setView(this.model.location, this.model.zoom);
        }
    },

    // Hacky radioizer for the checkboxs so one layer is enabled at a time
    radioIt(event) {
        $(':checkbox', this.menuControl._container).not(event.target)
            .prop('checked', false);
    }
});
