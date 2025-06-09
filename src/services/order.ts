import { Cart, CreateOrderData } from "./interfaces";
import { createOrder } from "./api";
import { displayOrderDetails } from "../main";
import { showLoadingSpinner, hideLoadingSpinner } from "./loading-spinner";

export const handleOrderSubmission = async (e: Event, cartObject: Cart) => {
    const customerFirstName = document.querySelector<HTMLInputElement>("#username")?.value.trim() || "";
    const customerLastName = document.querySelector<HTMLInputElement>("#lastname")?.value.trim() || "";
    const customerAddress = document.querySelector<HTMLInputElement>("#address")?.value.trim() || "";
    const customerPostcode = document.querySelector<HTMLInputElement>("#postalcode")?.value.trim() || "";
    const customerCity = document.querySelector<HTMLInputElement>("#district")?.value.trim() || "";
    const customerPhone = document.querySelector<HTMLInputElement>("#telephone")?.value.trim() || "";
    const customerEmail = document.querySelector<HTMLInputElement>("#email")?.value.trim() || "";

    e.preventDefault();

    const orderItems = cartObject.products.map((product) => ({
        id: product.id,
        product_id: product.id,
        qty: product.stock_quantity,
        item_price: product.price,
        item_total: product.price * product.stock_quantity,
    }));

    const orderTotal = orderItems.reduce((total, item) => total + Number(item.item_total), 0);

    const newOrder: CreateOrderData = {
        customer_first_name: customerFirstName,
        customer_last_name: customerLastName,
        customer_address: customerAddress,
        customer_postcode: customerPostcode,
        customer_city: customerCity,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        order_total: orderTotal,
        order_items: orderItems,
    };

    try {
        showLoadingSpinner();
        const response = await createOrder(newOrder);
        displayOrderDetails(response);
    } catch (error: unknown) {
        console.error("Error creating order:", error);
        document.querySelector(".thank-you-page-wrapper")!.innerHTML = `
            <div class="error-message">
                <p>Could not create order. ☹️<br>Error message:<br>"${error}"</p>
            </div>`;
    } finally {
        hideLoadingSpinner();
    }
};
