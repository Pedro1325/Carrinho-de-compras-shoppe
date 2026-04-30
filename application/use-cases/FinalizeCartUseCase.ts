/**
 * USE CASE: FINALIZAR CARRINHO
 * 
 * FLUXO:
 * 1. Busca carrinho ativo do usuário
 * 2. Verifica se tem items
 * 3. Marca carrinho como finalizado (isActive = false)
 * 
 * POR QUE não deletar o carrinho?
 * Porque em um sistema real, finalizar = criar um pedido.
 * O histórico de carrinhos finalizados é útil para:
 * - Análise de vendas
 * - Recomendar produtos
 * - Reutilizar carrinhos ("comprar novamente")
 */

import { ICartRepository } from '../../src/domain/interfaces/ICartRepository'
import { AppError } from '../../shared/AppError'

type FinalizeCartRequest = {
  userId: string
}

type FinalizeCartResponse = {
  id: string
  total: number
  totalItems: number
  finalizedAt: Date
}

export class FinalizeCartUseCase {
  constructor(private cartRepository: ICartRepository) {}

  async execute(data: FinalizeCartRequest): Promise<FinalizeCartResponse> {
    const cart = await this.cartRepository.findActiveByUserId(data.userId)
    if (!cart) {
      throw AppError.notFound('Carrinho não encontrado')
    }

    const finalizedCart = await this.cartRepository.finalize(cart.id)

    return {
      id: finalizedCart.id,
      total: finalizedCart.getTotal(),
      totalItems: finalizedCart.getTotalItems(),
      finalizedAt: finalizedCart.updatedAt,
    }
  }
}
