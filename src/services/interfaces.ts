export interface ProductsResponse {
    status: string;
    data: Product[];
}

export interface ProductResponse {
    status: string;
    data: ProductData;
}

export interface Product {
    id: number;
    name: string;
    price: number;
    on_sale: boolean;
    images: {
        thumbnail: string;
        large: string;
    };
    stock_status: "instock" | "outofstock" | "backorder";
    stock_quantity: number;
    tags: Tag[];
}

export type ProductData = Product & { description: string };

export interface Tag {
    id: number;
    name: string;
    slug: string;
}

export interface Cart {
    products: Product[];
    totalPrice: number;
}

export interface OrderResponse {
    status: string;
    message?: string;
    data: CreateOrderData;
}

interface OrderItem {
    id?: number;
    order_id?: number;
    product_id: number;
    qty: number;
    item_price: number;
    item_total: number;
}

export interface CreateOrderData {
    id?: number;
    user_id?: number;
    order_date?: string;
    customer_first_name: string;
    customer_last_name: string;
    customer_address: string;
    customer_postcode: string;
    customer_city: string;
    customer_email: string;
    customer_phone?: string;
    order_total: number;
    created_at?: string;
    updated_at?: string;
    order_items?: OrderItem[]; // Request
    items?: OrderItem[]; // Response
}
