import { getProducts, getProduct } from "./services/api";
import { Product, Cart, OrderResponse } from "./services/interfaces";
import { handleOrderSubmission } from "./services/order";
import { showLoadingSpinner, hideLoadingSpinner } from "./services/loading-spinner";
import { carousel } from "./services/carousel";

// HOME PAGE
const homePageContainer = document.querySelector(".home-page-container")! as HTMLElement;

// CART
const redBallCountEl = document.querySelector(".red-ball")! as HTMLElement;
const cartContentContainer = document.querySelector(".cart-content")!;
const shoppingCartBtn = document.querySelector(".shopping-cart")!;
const cartPopupContainer = document.querySelector(".cart-popup")! as HTMLElement;

// ANIMATION HAMBURGER MENU
const hamburgerBtn = document.querySelector(".hamburger")!;
const bar1El = document.querySelector(".bar1")!;
const bar2El = document.querySelector(".bar2")!;
const bar3El = document.querySelector(".bar3")!;
const mobileNavbar = document.querySelector(".mobile-navbar")!;

// CARD CONTAINERS
const allCardsContainer = document.querySelector("#cards-container")!;
const onSaleCardsContainer = document.querySelector(".on-sale-cards")!;
const popularCardsContainer = document.querySelector(".popular-cards")!;
const sweetsCardsContainer = document.querySelector(".sweets-cards")!;
const viewMoreProductsBtn = document.querySelector(".show-more-products-btn")! as HTMLButtonElement;
const productsShownPara = document.querySelector(".number-of-products-shown")! as HTMLParagraphElement;
const stockShownPara = document.querySelector(".number-of-products-in-stock")! as HTMLParagraphElement;

// POP UP CONTAINER
const showMoreContainer = document.querySelector(".show-more-container")!;
const popupContainer = document.querySelector(".popup")!;
const overlayEl = document.createElement("div")!;
overlayEl.className = "popup-overlay";
document.body.appendChild(overlayEl);

// CHECKOUT SECTION
const checkoutWrapper = document.querySelector(".checkout-wrapper")! as HTMLElement;
const checkoutCardContainer = document.querySelector(".checkout-cards")!;
const goBackArrowBtn = document.querySelector(".back-arrow")! as HTMLElement;
const submitBtn = document.querySelector(".submit-button")! as HTMLButtonElement;

// FORM
const formEl = document.querySelector<HTMLFormElement>("form");

// THANK YOU PAGE
const orderDetailsWrapper = document.querySelector(".order-details-wrapper")! as HTMLElement;
const orderDetailsContainer = document.querySelector(".order-details")! as HTMLElement;
const homePageBtn = document.querySelector(".home-page-btn")! as HTMLElement;

// VARIABLES AND OBJECTS FOR KEEPING TRACK OF STATES 📃

let productsArr: Product[] = [];

const productsToDisplay = {
    allProducts: 0,
    shownProducts: 0,
    productsInStock: 0,
};

let cartObject: Cart = {
    products: [],
    totalPrice: 0,
};

let dataCountValue: number = 0;

// ==== HELPER FUNCTIONS 🚑 ====

const toggleVisibility = (element: HTMLElement | null) => {
    if (element) {
        element.classList.toggle("hide");
    } else {
        console.error("Could not toggle visiblity of HTMLElement");
    }
};

const updateDataCountValue = () => (dataCountValue = cartObject.products.length);

const clearCart = () => {
    cartObject.products = [];
    cartObject.totalPrice = 0;
    dataCountValue = 0;
    redBallCountEl.classList.remove("show-ball");
    submitBtn.disabled = false;
    createCardInCartHTML();
    saveCartToLocalStorage();
};

const updateTotalPrice = () => {
    cartObject.totalPrice = cartObject.products.reduce((total, product) => total + product.price, 0);
};

const filterProductsInStock = (product: Product[]) => (productsToDisplay.productsInStock = product.filter((product) => product.stock_quantity > 0).length);

const displayInfoParas = () => {
    stockShownPara.innerHTML = `We currently have <span class="bold-style">${filterProductsInStock(productsArr)}</span> out of <span class="bold-style">${productsToDisplay.allProducts}</span> products in stock`;
    productsShownPara.innerHTML = `Showing <span class="bold-style">${productsToDisplay.shownProducts}</span> out of <span class="bold-style">${productsToDisplay.allProducts}</span> products`;
};

const displayRedBallCount = () => {
    redBallCountEl.dataset.count = dataCountValue.toString();
    if (dataCountValue !== 0) {
        redBallCountEl.classList.add("show-ball");
    } else {
        redBallCountEl.classList.remove("show-ball");
    }
};

const getProductById = (productID: number): Product | undefined => productsArr.find((product) => product.id === productID);

const findProduct = (target: HTMLElement, className: string) => {
    const productCard = target.closest(className) as HTMLElement;
    const productID = Number(productCard.dataset.id);
    return getProductById(productID);
};

const checkProductStockStatus = (product: Product) => {
    const quantitiesInCart = checkProductQuantities();
    const inCart = quantitiesInCart[product.id] || 0;
    return product.stock_quantity > inCart;
};

const openPopup = () => {
    showMoreContainer.classList.add("show-more-container-open");
    popupContainer.classList.add("open-popup");
    overlayEl.classList.add("show-overlay");
};
const closePopup = () => {
    showMoreContainer.classList.remove("show-more-container-open");
    popupContainer.classList.remove("open-popup");
    overlayEl.classList.remove("show-overlay");
};

const checkProductQuantities = () => {
    const productQuantities: { [key: number]: number } = {};

    cartObject.products.forEach((product) => {
        if (productQuantities[product.id]) {
            productQuantities[product.id]++;
        } else {
            productQuantities[product.id] = 1;
        }
    });

    return productQuantities;
};

const disableAddToCartBtn = (target: HTMLButtonElement) => {
    target.disabled = true;
};

const updateInfoParas = (arr: Product[]) => {
    productsToDisplay.shownProducts += arr.length;
    displayInfoParas();
};

const updateCardButtonState = () => {
    const allBtns = document.querySelectorAll(".add-to-cart-btn")!;

    allBtns.forEach((button) => {
        const product = findProduct(button as HTMLElement, ".card");

        if (!product) return;

        const isProductInStock = checkProductStockStatus(product);
        if (!isProductInStock) {
            (button as HTMLButtonElement).disabled = true;
        } else {
            (button as HTMLButtonElement).disabled = false;
        }
    });
};

// ==== LOCALSTORAGE FUNCTIONS 🏦 ====

const loadCartFromLocalStorage = () => {
    const storedCart = localStorage.getItem("cartObject");
    if (storedCart) {
        cartObject = JSON.parse(storedCart);
        displayProductsInCheckoutCart();
        createCardInCartHTML();
        updateDataCountValue();
        displayRedBallCount();
    }
};

const saveCartToLocalStorage = () => {
    localStorage.setItem("cartObject", JSON.stringify(cartObject));
};

// ==== ADDING AND REMOVING PRODUCTS FROM CART 🛒 ====

const addProductToCart = (product: Product) => {
    cartObject.products.push(product);
    updateTotalPrice();
    createCardInCartHTML();
    displayProductsInCheckoutCart();
    saveCartToLocalStorage();
    updateDataCountValue();
    displayRedBallCount();
    updateCardButtonState();
};

const removeProductFromCart = (productToRemove: Product) => {
    const itemIndex = cartObject.products.findIndex((product) => product.id === productToRemove.id);
    if (itemIndex === -1) return;

    cartObject.products.splice(itemIndex, 1);
    updateTotalPrice();
    createCardInCartHTML();
    displayProductsInCheckoutCart();
    saveCartToLocalStorage();
    updateDataCountValue();
    displayRedBallCount();
    updateCardButtonState();
};

// ==== RETRIEVING DATA FROM API 🪝 ====

const fetchProducts = async () => {
    showLoadingSpinner();
    try {
        const products = await getProducts();

        sortProducts(products);

        productsArr = products;
    } catch (error: unknown) {
        allCardsContainer.innerHTML = `
            <div class="error-message">
                <p>Could not fetch products. ☹️<br>Error message:<br>"${error}"</p>
            </div>`;
    } finally {
        hideLoadingSpinner();
    }
};

// ==== FUNCTIONS FOR DISPLAYING THINGS IN DOM 🖥️ ====

const createCardHTML = (product: Product): string => {
    const productIsInStock = checkProductStockStatus(product);
    return `<div class="card-container">
        <div class="card" data-id="${product.id}">
            ${product.on_sale ? `<div class="red-ball-price">${product.price} kr</div>` : ""}
            <div class="card-image-container">
                <img src="https://www.bortakvall.se/${product.images.thumbnail}" alt="${product.name}">
                ${!product.stock_quantity ? `<div class="out-of-stock-overlay"></div>` : ""}
            </div>
            <span class="product-name">${product.name}</span>
            <div class="product-info">
                <p>Price: ${product.price} kr</p>
                <p>${!product.stock_quantity ? "Out of stock" : "In stock: " + product.stock_quantity}</p>
            </div>
            <div class="button-container">
                <button class="add-to-cart-btn" ${!productIsInStock ? "disabled" : ""}>Add to Cart <i class="fa-solid fa-cart-shopping"></i></button>
                <button class="read-more-btn">Read More</button>
            </div>
        </div>
    </div>`;
};

const createCardInCartHTML = () => {
    cartContentContainer.innerHTML = "";

    if (cartObject.products.length === 0) {
        cartContentContainer.innerHTML = "<p class='empty-cart'>Your cart is empty 😔</p>";
        submitBtn.disabled = true;
    } else {
        submitBtn.disabled = false;
    }

    const amountOfItems = checkProductQuantities();

    cartObject.products.forEach((product) => {
        const isProductInStock = checkProductStockStatus(product);
        if (amountOfItems[product.id] > 0) {
            const amount = amountOfItems[product.id];
            cartContentContainer.innerHTML += `
                <div class="cart-item" data-id="${product.id}">
                    <img src="https://www.bortakvall.se${product.images.thumbnail}" alt="${product.name}" class="cart-item-image">
                    <div class="cart-item-details">
                        <h4>${product.name}</h4>
                        <p>Price: ${product.price * amount} kr</p>
                        <div class="cart-btn-container">
                            <button class="amount-btn delete-btn">-</button>
                            <span class="cart-amount">${amount}</span>
                            <button class="amount-btn add-btn" ${isProductInStock ? "" : "disabled"}>+</button>
                        </div>
                    </div>
                </div>`;
            amountOfItems[product.id] = 0;
        }
    });

    cartContentContainer.innerHTML += `
        <div class="bottom">
            <div class="cart-total">
            <strong>Total Price: ${cartObject.totalPrice} kr</strong>
            </div>
            <div>
                <button class="checkout-btn" ${cartObject.products.length === 0 ? "disabled" : ""}>Checkout</button>
            </div>
        </div>`;
};

const displayCards = (products: Product[], container: HTMLElement, increment: number = 28) => {
    let initialCount: number = 28;

    const sortByName = [...products].sort((a: Product, b: Product) => a.name.localeCompare(b.name));
    const productSlice = sortByName.slice(0, initialCount);

    updateInfoParas(productSlice);

    container.innerHTML = productSlice.map(createCardHTML).join("");

    if (products.length > initialCount) {
        viewMoreProductsBtn.addEventListener("click", async () => {
            showLoadingSpinner();

            await new Promise((resolve) => setTimeout(resolve, 500));

            const nextSetOfProducts = sortByName.slice(initialCount, initialCount + increment);
            updateInfoParas(nextSetOfProducts);

            nextSetOfProducts.forEach((product) => {
                const newCardHTML = createCardHTML(product);
                container.insertAdjacentHTML("beforeend", newCardHTML);
            });

            initialCount += increment;

            if (initialCount >= sortByName.length) {
                toggleVisibility(viewMoreProductsBtn);
            }
            hideLoadingSpinner();
        });
    }
};

const sortProducts = (products: Product[]) => {
    productsArr = [...products];
    productsToDisplay.allProducts = productsArr.length;

    const onSaleProducts = products.filter((product) => product.on_sale);
    const popularProducts = products.filter((product) => !product.on_sale && product.stock_quantity <= 2 && product.stock_quantity);
    const sweetsProducts = products.filter((product) => (!product.on_sale && product.stock_quantity > 2) || !product.stock_quantity);

    displayCards(onSaleProducts, onSaleCardsContainer as HTMLElement, 28);
    displayCards(popularProducts, popularCardsContainer as HTMLElement, 28);
    displayCards(sweetsProducts, sweetsCardsContainer as HTMLElement, 28);
};

const displayReadMoreInfo = async (product: Product) => {
    showLoadingSpinner();
    try {
        const productWithInfo = await getProduct(product.id);

        popupContainer.innerHTML = `
            <div class="popup-image-container">
                <img id="popup-image" src="https://www.bortakvall.se/${productWithInfo.images.large}" alt="${productWithInfo.name}">
            </div>
            <div class="product-description">
                ${productWithInfo.description}
                <p>${!productWithInfo.stock_quantity ? "Out of stock" : "In stock: " + productWithInfo.stock_quantity}</p>
            </div>
            <span class="product-price">
                Price: ${productWithInfo.price} SEK
            </span>
            <button class="close-popup-btn">Close Read More</button>`;

        document.querySelector(".close-popup-btn")!.addEventListener("click", closePopup);
    } catch (error: unknown) {
        popupContainer.innerHTML = `
            <div class="error-message">
                <p>Could not display product info. ☹️<br>Error message:<br>"${error}"</p>
            </div>`;
    } finally {
        hideLoadingSpinner();
    }
};

const displayProductsInCheckoutCart = () => {
    checkoutCardContainer.innerHTML = "";

    if (cartObject.products.length === 0) {
        checkoutCardContainer.innerHTML = "<p class='empty-cart'>Your cart is empty 😔</p>";
    }

    const numberOfProducts = checkProductQuantities();

    cartObject.products.forEach((product) => {
        if (numberOfProducts[product.id] > 0) {
            const quantity = numberOfProducts[product.id];
            const isProductInStock = checkProductStockStatus(product);
            checkoutCardContainer.innerHTML += `
                <div class="form-item-card" data-id="${product.id}">
                    <div class="form-item-header"><span>${quantity}</span> Item(s)</div>
                    <div class="form-item-body">
                        <img src="https://www.bortakvall.se/${product.images.thumbnail}" alt="${product.name}" class="form-item-image" />
                        <div class="form-item-title-price">
                            <p class="item-name">${product.name}</p>
                            <p class="price">${quantity > 1 ? product.price * quantity : product.price} SEK</p>
                            <p class="unit-price">Unit price: ${product.price} SEK</p>
                        </div>
                    </div>
                    ${!isProductInStock ? "<span class='product-out-of-stock-text'>No more products left in stock to add</span>" : ""}
                    <div class="checkout-card-btn-container">
                        <button type="button" class="checkout-card-remove-btn">-</button>
                        <button type="button" class="checkout-card-add-btn"  ${!isProductInStock ? "disabled" : ""}>+</button>
                    </div>
                </div>
            `;

            numberOfProducts[product.id] = 0;
        }
    });

    checkoutCardContainer.innerHTML += `
        <div class="form-item-footer">
            <span>Total to pay</span>
            <span class="total-price">${cartObject.totalPrice} SEK</span>
        </div>
    `;
};

export const displayOrderDetails = (orderData: OrderResponse) => {
    if (orderData.status !== "success") {
        orderDetailsContainer.innerHTML = `
            <h3>Something went wrong with your order! Please try again.</h3>
            <p>Error message: ${orderData.message}</p>`;
        return;
    }

    orderDetailsContainer.innerHTML = "";

    const thankYouMessage = document.createElement("h3");
    thankYouMessage.innerHTML = `
        Thank you ${orderData.data.customer_first_name} for shopping at Candy Store!
        <span><i class="fa-regular fa-heart"></i></span>`;

    const orderID = document.createElement("p");
    orderID.innerHTML = `Your order id is: <span class="order-id">${orderData.data.id}</span>`;

    const customerInfo = document.createElement("div");
    customerInfo.classList.add("customer-info");
    customerInfo.innerHTML = `
        <strong>Your information:</strong><br>
        <p>Name: ${orderData.data.customer_first_name} ${orderData.data.customer_last_name}<br>
        ${orderData.data.customer_phone ? "Phone: " + orderData.data.customer_phone : ""}<br>
        Shipping address: ${orderData.data.customer_address}<br>
        Post code: ${orderData.data.customer_postcode}<br>
        Email: ${orderData.data.customer_email}</p>
    `;

    const orderInfo = document.createElement("div");
    orderInfo.classList.add("order-info");

    orderInfo.innerHTML = "<strong>Your order:</strong>";

    const orderList = document.createElement("ul");

    const numberOfProducts = checkProductQuantities();

    cartObject.products.forEach((product) => {
        if (numberOfProducts[product.id] > 0) {
            const listItem = document.createElement("li");
            const quantity = numberOfProducts[product.id];
            listItem.innerText = `${quantity > 1 ? "(" + quantity + ")" : ""} ${product.name}: ${quantity > 1 ? product.price * quantity : product.price} SEK`;
            orderList.appendChild(listItem);
            numberOfProducts[product.id] = 0;
        }
    });

    const confirmationEmailMessage = document.createElement("p");

    confirmationEmailMessage.innerText = `A confirmation email will be sent to your email adress: ${orderData.data.customer_email}`;

    orderInfo.appendChild(orderList);
    orderDetailsContainer.append(thankYouMessage, orderID, customerInfo, orderInfo, confirmationEmailMessage);

    clearCart();
};

// ==== EVENTLISTENERS ==== 👂

hamburgerBtn.addEventListener("click", () => {
    bar1El.classList.toggle("animateBar1");
    bar2El.classList.toggle("animateBar2");
    bar3El.classList.toggle("animateBar3");
    mobileNavbar.classList.toggle("openDrawer");
    if (!cartPopupContainer.classList.contains("hide")) {
        cartPopupContainer.classList.add("hide");
    }
});

allCardsContainer.addEventListener("click", (e) => {
    const target = e.target as HTMLButtonElement;
    if (target.tagName === "BUTTON" && target.classList.contains("read-more-btn")) {
        const product = findProduct(target, ".card");
        openPopup();
        if (product) {
            displayReadMoreInfo(product);
        }
    } else if (target.tagName === "BUTTON" && target.classList.contains("add-to-cart-btn")) {
        const product = findProduct(target, ".card");
        if (product) {
            addProductToCart(product);
            if (checkProductStockStatus(product)) {
                displayProductsInCheckoutCart();
            } else {
                disableAddToCartBtn(target);
            }
        }
    }
});

overlayEl.addEventListener("click", closePopup);

shoppingCartBtn.addEventListener("click", (e) => {
    e.preventDefault();
    toggleVisibility(cartPopupContainer);
});

cartContentContainer.addEventListener("click", (e) => {
    const target = e.target as HTMLButtonElement;
    if (target.tagName === "BUTTON" && target.classList.contains("delete-btn")) {
        const product = findProduct(target, ".cart-item");
        if (product) {
            removeProductFromCart(product);
        }
    }
    if (target.tagName === "BUTTON" && target.classList.contains("add-btn")) {
        const product = findProduct(target, ".cart-item");
        if (product) {
            if (checkProductStockStatus(product)) {
                addProductToCart(product);
            } else {
                disableAddToCartBtn(target);
            }
        }
    }
});

checkoutCardContainer.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (target.closest(".checkout-card-add-btn")) {
        const productCard = target.closest(".form-item-card") as HTMLElement;
        if (!productCard) return;

        const productID = Number(productCard.dataset.id);
        const product = getProductById(productID);

        if (product) {
            const productIsInStock = checkProductStockStatus(product);
            if (productIsInStock) {
                addProductToCart(product);
            } else {
                const button = target as HTMLButtonElement;
                button.disabled = true;
            }
        }
    }

    if (target.closest(".checkout-card-remove-btn")) {
        const productCard = target.closest(".form-item-card") as HTMLElement;
        if (!productCard) return;

        const productID = Number(productCard.dataset.id);
        const product = getProductById(productID);

        if (product) {
            removeProductFromCart(product);
        }
    }
});

formEl?.addEventListener("submit", (e) => {
    e.preventDefault();
    handleOrderSubmission(e, cartObject);
    toggleVisibility(orderDetailsWrapper);
    toggleVisibility(checkoutWrapper);
});

cartContentContainer.addEventListener("click", (e) => {
    const target = e.target as HTMLButtonElement;
    if (target.tagName === "BUTTON" && target.classList.contains("checkout-btn")) {
        toggleVisibility(homePageContainer);
        toggleVisibility(checkoutWrapper);
        toggleVisibility(cartPopupContainer);
    }
});

goBackArrowBtn.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains("back-arrow")) {
        toggleVisibility(checkoutWrapper);
        toggleVisibility(homePageContainer);
    }
});

homePageBtn.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains("home-page-btn")) {
        toggleVisibility(orderDetailsWrapper);
        toggleVisibility(homePageContainer);
    }
});

// INITIALIZING 💨

loadCartFromLocalStorage();
fetchProducts();
carousel();
