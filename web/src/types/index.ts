export interface Customer {
  id: string;
  name: string;
  phone: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: number;
  total: number;
  status: "PENDING" | "WASHING" | "DRYING" | "IRONING" | "READY" | "DELIVERED";
  createdAt: string;
  customer: Customer;
  items: OrderItem[];
}
