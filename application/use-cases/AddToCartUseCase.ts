// Use-case: Adicionar item ao carrinho
// Orquestra a lógica entre User, Product e Cart

import { ICartRepository } from '../../domain/interfaces/ICartRepository'
import { IProductRepository } from '../../domain/interfaces/IProductRepository'

export class AddToCartUseCase {
  constructor(
    private cartRepository: ICartRepository,
    private productRepository: IProductRepository
  ) {}

  async execute(data: { userId: number; productId: number; quantity: number }) {
    // TODO: 1. Verificar se usuário existe
    // TODO: 2. Verificar se produto existe e tem estoque
    // TODO: 3. Buscar ou criar carrinho do usuário
    // TODO: 4. Adicionar item ao carrinho
    throw new Error('TODO: Implementar')
  }
}
