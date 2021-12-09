/*
For communications between the components.
https://segmentfault.com/a/1190000023585646
 */

class EventBus {
    constructor() {
        this.bus = document.createElement('fakeElement');
    }

    addEventListener(event, callback) {
        this.bus.addEventListener(event, callback);
    }

    removeEventListener(event, callback) {
        this.bus.removeEventListener(event, callback);
    }

    dispatchEvent(event, detail = {}){
        this.bus.dispatchEvent(new CustomEvent(event, { detail }));
    }
}

export default new EventBus();
