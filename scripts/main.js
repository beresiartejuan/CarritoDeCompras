import Carrito from "./carrito.js";
import ProductDatabase from "./productDatabase.js";

// Link a la base de datos
const REAL_DATABASE_LINK = "https://jsonblob.com/api/jsonBlob/1122267371845992448";
// Moneda por defecto que se va a usar
let CURRENCY = "$";

// Emulación de una base de datos que almacena todos los productos
const database = new ProductDatabase();
// Eventos de la base de datos
const database_events = database.getEvents();

// Carrito de compras
const carrito = new Carrito();
// Eventos del carrito de compras
const eventos_carrito = carrito.getEvents();

// Elemento que muestra el precio final
const final_price = document.querySelector("#final-price");

function setFinalPrice(callback) {
    const final_price_content = final_price.innerHTML;
    const final_price_parsed = parseFloat(
        final_price_content.split(" ")[0]
    );

    final_price.innerHTML = `${callback(final_price_parsed).toFixed(2)} ${CURRENCY}`
}

function setLocalPrice(SKU, callback) {
    const local_price = document.querySelector(`[id="${SKU}"] .local_price`);
    const final_price_content = local_price.innerHTML;
    const final_price_parsed = parseFloat(
        final_price_content.split(" ")[0]
    );

    let result = callback(final_price_parsed);

    if (result <= 0) result = 0;

    local_price.innerHTML = `${result.toFixed(2)} ${CURRENCY}`
}

function updateProductInList(product) {

    const list = document.querySelector("#list");

    const old_element = document.querySelector(`#list [sku="${product.SKU}"]`);

    const style_numer = "margin-left: .5rem; font-size: 1.1rem";

    if (!old_element) {

        const fragment = document.createDocumentFragment();
        const p = document.createElement("p");

        p.style = "margin-bottom: 1vh";
        p.setAttribute("sku", product.SKU);
        p.innerHTML = `${product.title} <strong style="${style_numer}">x${product.quantity}</strong>`;

        fragment.appendChild(p);

        list.appendChild(fragment);

        return;

    }

    if (product.quantity <= 0) {
        old_element.remove();
        return;
    }

    old_element.innerHTML = `${product.title} <strong style="${style_numer}">x${product.quantity}</strong>`;



}


// Se detecta cuando se agrega un producto al carrito
carrito.addEventListener(
    eventos_carrito.ADD_PRODUCT,
    (producto_nuevo) => {
        // Esto se ejecuta cuando agregas un producto al carrito
        // data es el producto nuevo que se agrego
        console.log(`Se ha agregado un ${producto_nuevo.title} al carrito`);

        updateProductInList(producto_nuevo);

        setFinalPrice(final_price => final_price + producto_nuevo.price);
    }
);

// Se detecta cuando se quita un solo producto al carrito
carrito.addEventListener(
    eventos_carrito.REMOVE_PRODUCT,
    (producto_eliminado) => {
        // Esto se ejecuta cuando agregas un producto al carrito
        // data es el producto nuevo que se agrego
        console.log(`Se ha quitado un ${producto_eliminado.title} del carrito`);

        console.log(producto_eliminado);

        updateProductInList(producto_eliminado);

        setFinalPrice(final_price => final_price - producto_eliminado.price);
    }
);

// Cuando se guarda un producto nuevo en la base de datos
// se renderiza en el DOM
database.addEventListener(database_events.ADD_PRODUCT, (product) => {
    addProductToDOM(product);
});

fetch(REAL_DATABASE_LINK)
    .then(res => res.json())
    .then(response => {

        CURRENCY = response.currency ? response.currency : "$";

        final_price.innerHTML = `0 ${CURRENCY}`;

        response.products.forEach(
            product => database.addProduct(product.SKU, {
                ...product, price: parseFloat(product.price)
            })
        );

    });

function onMinusButtonClick(event) {
    const button = event.target;

    const sku = button.getAttribute("for-product");

    const product = database.findBySKU(sku);

    carrito.removeProduct(product.SKU);

    const counter = document.querySelector(`[id="${product.SKU}"] [counter]`);

    const new_product = carrito.getProductInfo(product.SKU);

    counter.innerHTML = (new_product) ? new_product.quantity : 0;

    /*

    let real_counter = parseInt(counter.innerHTML);

    counter.innerHTML = (real_counter > 0) ? real_counter - 1 : 0;*/

    setLocalPrice(product.SKU, final_price => final_price - product.price);
}

function onPlusButtonClick(event) {
    const button = event.target;

    const sku = button.getAttribute("for-product");

    const product = database.findBySKU(sku);

    carrito.addProduct(product.SKU, product.title, product.price);

    const counter = document.querySelector(`[id="${product.SKU}"] [counter]`);

    counter.innerHTML = parseInt(counter.innerHTML) + 1;

    setLocalPrice(product.SKU, final_price => final_price + product.price);
}

function addButtonsToProductField(sku) {

    const quantity = document.querySelector(`[id="${sku}"] .quantity`);
    const fragment = document.createDocumentFragment();

    const minusButton = document.createElement("button");
    const plusButton = document.createElement("button");
    const counter = document.createElement("span");

    minusButton.innerText = "-";
    plusButton.innerText = "+";
    counter.innerText = "0";

    minusButton.setAttribute("for-product", sku);
    plusButton.setAttribute("for-product", sku);
    counter.setAttribute("counter", true);

    minusButton.addEventListener("click", onMinusButtonClick);
    plusButton.addEventListener("click", onPlusButtonClick);

    fragment.appendChild(minusButton);
    fragment.appendChild(counter);
    fragment.appendChild(plusButton);

    quantity.appendChild(fragment);

}

function addProductToDOM(product) {

    /*
        Esta función genera la estructura del producto
        Se puede editar sin problemas, pero se debe mantener la siguiente estructura para
        que el js pueda continuar funcionando:
        
        .#final-price
        
        #products
            #SKU-producto-1
                .quantity
                .local_price
            #SKU-producto-2
            ...etc

        En el elemento que quenga la clase quantity se agregará la siguiente estructura

        <button>-</button>
        <span>CONTADOR SIMBOLO_MONEDA</span>
        <button>+</button>
    */

    const productElement = document.createElement("tr");

    const fragment = document.createDocumentFragment();

    productElement.classList.add("product");

    productElement.setAttribute("id", product.SKU || "");

    productElement.innerHTML = `
    <td class="header">
        <h2>${product.title}</h2>
        <span>Ref: ${product.SKU}</span>
    </td>
    <td class="quantity"></td>
    <td class="price">
        <span>${product.price} ${CURRENCY}</span>
    </td>
    <td>
        <span class="local_price">0.00 ${CURRENCY}</span>
    </td>`;

    fragment.appendChild(productElement);

    document.querySelector("#products").appendChild(fragment);

    addButtonsToProductField(product.SKU);

}
