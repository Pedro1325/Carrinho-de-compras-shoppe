/**
 * USE CASE: REMOVER ITEM DO CARRINHO
 * 
 * FLUXO:
 * 1. Busca carrinho do usuário
 * 2. Verifica se item existe no carrinho
 * 3. Remove o item
 */

import { ICartRepository } from '../../src/domain/interfaces/ICartRepository'
import { AppError } from '../../shared/AppError'

type RemoveFromCartRequest = {
  userId: string
  itemId: string
}

export class RemoveFromCartUseCase {
  constructor(private cartRepository: ICartRepository) {}

  async execute(data: RemoveFromCartRequest): Promise<void> {
    const cart = await this.cartRepository.findActiveByUserId(data.userId)
    if (!cart) {
      throw AppError.notFound('Carrinho não encontrado')
    }

    const item = cart.findItem(data.itemId)
    if (!item) {
      throw AppError.notFound('Item não encontrado no carrinho')
    }

    await this.cartRepository.removeItem(cart.id, data.itemId)
  }
}
