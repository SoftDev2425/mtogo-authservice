export interface Restaurant {
  name: string;
  email: string;
  phone: string;
  password: string;
  address: Address;
  regNo: string;
  accountNo: string;
}

interface Address {
  street: string;
  city: string;
  zip: string;
  x: number;
  y: number;
}
