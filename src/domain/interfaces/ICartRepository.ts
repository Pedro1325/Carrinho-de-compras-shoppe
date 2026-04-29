// Interface do repositório de Cart

export interface ICartRepository {
  create(userId: number): Promise<any>
  findByUserId(userId: number): Promise<any | null>
  addItem(cartId: number, productId: number, quantity: number): Promise<any>
  removeItem(cartId: number, productId: number): Promise<any>
  // TODO: Implementar métodos para atualizar quantidade, limpar carrinho
}
