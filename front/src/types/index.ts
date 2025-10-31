export interface Product {
  id: number
  title: string
  description: string
  price: number
  category: string
  image: string
  colors: string[]
  colorImages?: Record<string, string>
  inStock?: boolean
}

export interface CartItem extends Product {
  quantity: number
  selectedColor?: string
}

export interface OrderForm {
  name: string
  phone: string
  address: string
  comment?: string
}

export interface Category {
  id: string
  name: string
  slug: string
}


