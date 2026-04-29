// Entidade de domínio Cart
// Representa o carrinho de compras de um usuário

export class Cart {
  id: number
  userId: number
  items: CartItem[]

  constructor(props: { id?: number; userId: number; items?: CartItem[] }) {
    Object.assign(this, props)
  }

  // TODO: Método para calcular total do carrinho
  // getTotal(): number { ... }
}

export class CartItem {
  id: number
  productId: number
  quantity: number

  constructor(props: { id?: number; productId: number; quantity: number }) {
    // TODO: Validar se quantity > 0
    Object.assign(this, props)
  }
}
