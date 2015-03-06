import {Model} from 'backbone';

let model;
let lat = 43.4668, lng = -80.5164, zoom = 9;

navigator.geolocation.getCurrentPosition(pose => {
    lat = pose.coords.latitude;
    lng = pose.coords.longitude;
    if (model) model.triggerUpdate();
});

export default class Route extends Model {
    triggerUpdate() {
        if (!this.triggered) {
            this.trigger('update');
        }
        this.triggered = true;
    }

    get location() {
        return [lat, lng];
    }

    get zoom() {
        return zoom;
    }
}
