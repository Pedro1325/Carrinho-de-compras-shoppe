/**
 * USE CASE: ATUALIZAR QUANTIDADE DE ITEM NO CARRINHO
 * 
 * FLUXO:
 * 1. Busca carrinho do usuário
 * 2. Verifica se item existe
 * 3. Verifica estoque (produto ou variação)
 * 4. Atualiza quantidade
 */

import { ICartRepository } from '../../src/domain/interfaces/ICartRepository'
import { IProductRepository } from '../../src/domain/interfaces/IProductRepository'
import { AppError } from '../../shared/AppError'

type UpdateCartItemQuantityRequest = {
  userId: string
  itemId: string
  quantity: number
}

type UpdateCartItemQuantityResponse = {
  itemId: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export class UpdateCartItemQuantityUseCase {
  constructor(
    private cartRepository: ICartRepository,
    private productRepository: IProductRepository
  ) {}

  async execute(data: UpdateCartItemQuantityRequest): Promise<UpdateCartItemQuantityResponse> {
    // Valida quantidade
    if (data.quantity < 1) {
      throw AppError.validation('Quantidade deve ser pelo menos 1')
    }
    if (data.quantity > 100) {
      throw AppError.validation('Quantidade máxima por item é 100')
    }

    // Busca carrinho ativo do usuário
    const cart = await this.cartRepository.findActiveByUserId(data.userId)
    if (!cart) {
      throw AppError.notFound('Carrinho não encontrado')
    }

    // Busca item no carrinho
    const item = cart.findItem(data.itemId)
    if (!item) {
      throw AppError.notFound('Item não encontrado no carrinho')
    }

    // Verifica estoque
    if (item.variationId) {
      const variation = await this.productRepository.findVariationById(item.variationId)
      if (!variation || !variation.hasStock(data.quantity)) {
        throw AppError.validation('Estoque insuficiente para esta variação')
      }
    } else {
      const product = await this.productRepository.findById(item.productId)
      if (!product || !product.hasStock(data.quantity)) {
        throw AppError.validation('Estoque insuficiente')
      }
    }

    // Atualiza quantidade
    const updatedItem = await this.cartRepository.updateItemQuantity(
      cart.id,
      data.itemId,
      data.quantity
    )

    return {
      itemId: updatedItem.id,
      quantity: updatedItem.quantity,
      unitPrice: updatedItem.unitPrice,
      subtotal: updatedItem.getSubtotal(),
    }
  }
}
