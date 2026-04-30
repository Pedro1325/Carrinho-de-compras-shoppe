/**
 * USE CASE: OBTER CARRINHO DO USUÁRIO
 * 
 * FLUXO:
 * 1. Busca carrinho ativo do usuário
 * 2. Retorna com todos os items e totais
 */

import { ICartRepository } from '../../src/domain/interfaces/ICartRepository'
import { AppError } from '../../shared/AppError'

type GetCartRequest = {
  userId: string
}

type GetCartResponse = {
  id: string
  isActive: boolean
  items: Array<{
    id: string
    productId: string
    variationId: string | null
    quantity: number
    unitPrice: number
    subtotal: number
    createdAt: Date
    updatedAt: Date
  }>
  total: number
  totalItems: number
  createdAt: Date
  updatedAt: Date
}

export class GetCartUseCase {
  constructor(private cartRepository: ICartRepository) {}

  async execute(data: GetCartRequest): Promise<GetCartResponse> {
    const cart = await this.cartRepository.findActiveByUserId(data.userId)
    if (!cart) {
      throw AppError.notFound('Carrinho não encontrado')
    }

    return {
      id: cart.id,
      isActive: cart.isActive,
      items: cart.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        variationId: item.variationId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.getSubtotal(),
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
      total: cart.getTotal(),
      totalItems: cart.getTotalItems(),
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    }
  }
}
