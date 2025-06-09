import { CreateOrderData, OrderResponse, Product, ProductData, ProductResponse, ProductsResponse } from "./interfaces";

export const getProducts = async (): Promise<Product[]> => {
    const res = await fetch("https://www.bortakvall.se/api/v2/products");
    if (!res.ok) {
        throw new Error(`Could not get candy (${res.status} ${res.statusText})`);
    }

    const response: ProductsResponse = await res.json();
    return response.data;
};

export const getProduct = async (id: number): Promise<ProductData> => {
    const res = await fetch(`https://www.bortakvall.se/api/v2/products/${id}`);
    if (!res.ok) {
        throw new Error(`Could not get candy (${res.status} ${res.statusText})`);
    }

    const response: ProductResponse = await res.json();
    return response.data;
};

export const createOrder = async (newOrder: CreateOrderData): Promise<OrderResponse> => {
    const res = await fetch("https://www.bortakvall.se/api/v2/users/66/orders", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(newOrder),
    });

    if (!res.ok) {
        throw new Error(`Could not create Order. Status code was: ${res.status} ${res.statusText}`);
    }

    const data: OrderResponse = await res.json();
    return data;
};
