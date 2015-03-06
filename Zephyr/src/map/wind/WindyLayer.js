import _ from 'lodash';
import L from 'leaflet';

import CanvasOverlay from './CanvasOverlay'
import Windy from './windy'
import $ from 'jquery';

export default class WindyLayer extends CanvasOverlay {
    initialize({url = ''} = {}) {
        super.initialize(...arguments);

        // Load the GFS data
        $.getJSON(url, data => {
            this.data = data;
            // Start rendering if the layers active
            if (this._map) {
                this.onAdd(this._map);
            }
        });
    }

    onAdd(map) {
        this._map = map;
        // Defer for data
        if (!this.data) return;

        super.onAdd(...arguments);
        this.windy = new Windy({
            canvas: this.canvas(),
            data: this.data
        });
    }

    onRemove() {
        super.onRemove(...arguments);
        this.windy.stop();
        this.windy = null;
    }

    render({bounds, size, zoomScale}) {
        this.windy.stop();
        let {x: width, y: height} = size;
        let {lng: xmax, lat: ymax} = bounds.getNorthEast(),
            {lng: xmin, lat: ymin} = bounds.getSouthWest();
        this.windy.start([[0, 0], [width, height]],
            width, height,
            [[xmin, ymin], [xmax, ymax]],
            zoomScale);
    }
};
