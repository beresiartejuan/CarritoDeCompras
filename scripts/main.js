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

// Se detecta cuando se agrega un producto al carrito
carrito.addEventListener(
    eventos_carrito.ADD_PRODUCT,
    (producto_nuevo) => {
        // Esto se ejecuta cuando agregas un producto al carrito
        // data es el producto nuevo que se agrego
        console.log(`Se ha agregado un ${producto_nuevo.title} al carrito`);

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

    let real_counter = parseInt(counter.innerHTML);

    counter.innerHTML = (real_counter > 0) ? real_counter - 1 : 0;

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

    const productElement = document.createElement("section");

    const fragment = document.createDocumentFragment();

    productElement.classList.add("product");

    productElement.setAttribute("id", product.SKU || "");

    productElement.innerHTML = `
    <div class="header">
        <h2>${product.title}</h2>
        <span>Ref: ${product.SKU}</span>
    </div>
    <div class="quantity"></div>
    <div class="price">
        <span>${product.price} ${CURRENCY}</span>
    </div>
    <div>
        <span class="local_price">0 ${CURRENCY}</span>
    </div>`;

    fragment.appendChild(productElement);

    document.querySelector("#products").appendChild(fragment);

    addButtonsToProductField(product.SKU);

}