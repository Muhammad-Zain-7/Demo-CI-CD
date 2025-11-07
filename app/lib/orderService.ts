// Order service for backend integration
const BACKEND_URL = "https://mythicmuses-backend.vercel.app";

      // const BACKEND_URL = "http://localhost:3001"

export interface CreateOrderData {
  nftId: string;
  customerName: string;
  customerEmail: string;
  walletAddress?: string;
}

export interface Order {
  _id: string;
  nftId: {
    _id: string;
    title: string;
    priceCrypto: number;
    currency: string;
    network: string;
  };
  collectionId: {
    _id: string;
    name: string;
    network: string;
  };
  nftTitle: string;
  customerName: string;
  customerEmail: string;
  walletAddress?: string;
  priceCrypto: number;
  currency: string;
  network: string;
  priceUSD: number;
  amount: number;
  status: string;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
}

export class OrderService {
  // Create a new order
  static async createOrder(data: CreateOrderData): Promise<Order> {
    const response = await fetch(`${BACKEND_URL}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create order");
    }

    return response.json();
  }

  // Get order by ID
  static async getOrder(orderId: string): Promise<Order> {
    const response = await fetch(`${BACKEND_URL}/api/orders/${orderId}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch order");
    }

    return response.json();
  }

  // Update order
  static async updateOrder(
    orderId: string,
    updates: Partial<Order>
  ): Promise<Order> {
    const response = await fetch(`${BACKEND_URL}/api/orders/${orderId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to update order");
    }

    return response.json();
  }

  // Get orders with optional filtering
  static async getOrders(filters?: {
    status?: string;
    customerEmail?: string;
    limit?: number;
    offset?: number;
  }): Promise<Order[]> {
    const params = new URLSearchParams();

    if (filters?.status) params.append("status", filters.status);
    if (filters?.customerEmail)
      params.append("customerEmail", filters.customerEmail);
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.offset) params.append("offset", filters.offset.toString());

    const response = await fetch(
      `${BACKEND_URL}/api/orders?${params.toString()}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch orders");
    }

    return response.json();
  }

  // Create PayPal order for existing order
  static async createPayPalOrder(orderId: string): Promise<{
    success: boolean;
    orderId: string;
    approvalUrl: string;
  }> {
    const response = await fetch(
      `${BACKEND_URL}/api/paypal/create-order-for-order`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create PayPal order");
    }

    return response.json();
  }

  // Create PayPal order for widget
  static async createPayPalOrderWidget(
    orderId: string,
    amount: number,
    paymentMethod = "card"
  ): Promise<{
    success: boolean;
    paypalOrderId: string;
  }> {
    const response = await fetch(
      `${BACKEND_URL}/api/paypal/create-order-widget`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId, amount, paymentMethod }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create PayPal order");
    }

    return response.json();
  }

  // Capture PayPal payment
  static async capturePayPalPayment(
    orderId: string,
    token: string,
    ourOrderId?: string,
    paymentMethod = "paypal"
  ): Promise<{
    success: boolean;
    orderId: string;
    paypalOrderId: string;
    paymentMethod: string;
    status: string;
  }> {
    const response = await fetch(`${BACKEND_URL}/api/paypal/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderId: token, ourOrderId, paymentMethod }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to capture payment");
    }

    return response.json();
  }
}
