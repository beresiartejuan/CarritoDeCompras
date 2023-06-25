export default class Carrito {

    constructor() {
        this.productos = [];
        this.listeners = {};
        this.defaultsEvents = {
            REMOVE_PRODUCT: "delete",
            ADD_PRODUCT: "add",
        }
    }

    getProductos() {
        return this.productos;
    }

    getProductInfo(SKU) {
        return this.productos.find(p => p.SKU === SKU) ?? null;
    }

    clearUndefinedProducts() {
        this.productos = this.productos.filter(p => typeof p !== "undefined");
    }

    addProduct(SKU, title, price) {

        this.clearUndefinedProducts();

        const index = this.productos.findIndex(producto => {
            return producto.SKU === SKU
        });

        if (index === -1) {

            this.productos.push({ SKU, title, price, quantity: 1 });
            this.lauchEvent(this.defaultsEvents.ADD_PRODUCT, {
                SKU, title, price, quantity: 1
            });
            return;

        }

        this.productos[index].quantity += 1;

        this.lauchEvent(this.defaultsEvents.ADD_PRODUCT, this.productos[index]);

        this.clearUndefinedProducts();
    }

    removeProduct(SKU) {

        this.clearUndefinedProducts();

        this.productos = this.productos.map(producto => {

            if (producto.SKU !== SKU) return producto;

            const producto_actualizado = {
                ...producto,
                quantity: producto.quantity - 1
            };

            this.lauchEvent(this.defaultsEvents.REMOVE_PRODUCT, producto_actualizado);

            if (producto_actualizado.quantity >= 1) return producto_actualizado;

        })

        this.clearUndefinedProducts();

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