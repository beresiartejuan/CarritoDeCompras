export default class ProductDatabase {

    constructor() {

        this.data = {};
        this.listeners = {};
        this.defaultsEvents = {
            ADD_PRODUCT: "add",
            DELETE_PRODUCT: "delete",
            EDIT_PRODUCT: "edit"
        };

    }

    findBySKU(sku) {

        return this.data[sku];

    }

    addProduct(id, product) {
        this.data[id] = product;
        this.lauchEvent(this.defaultsEvents.ADD_PRODUCT, product);
    }

    getEvents() {
        return this.defaultsEvents;
    }

    lauchEvent(event, data) {
        if (!Object.keys(this.listeners).includes(event)) return;

        this.listeners[event].forEach(callback => callback(data));
    }

    addEventListener(event, callback) {
        if (event in this.listeners) {
            this.listeners[event].push(callback);
            return;
        }

        this.listeners[event] = [callback];
    }

}