/**
 * USE CASE: ADICIONAR ITEM AO CARRINHO
 * 
 * Este é o use case mais importante do projeto!
 * 
 * FLUXO:
 * 1. Verifica se usuário existe
 * 2. Busca ou cria o carrinho ativo do usuário
 * 3. Verifica se produto existe e tem estoque
 * 4. Se tem variação, verifica se a variação existe e tem estoque
 * 5. Determina o preço (do produto ou da variação)
 * 6. Adiciona o item ao carrinho (com snapshot do preço)
 * 
 * POR QUE salvar o unitPrice?
 * Se o produto custa R$50 hoje e amanhã sobe para R$60,
 * o carrinho deve manter R$50 (preço no momento da adição).
 */

import { ICartRepository } from '../../src/domain/interfaces/ICartRepository'
import { IProductRepository } from '../../src/domain/interfaces/IProductRepository'
import { IUserRepository } from '../../src/domain/interfaces/IUserRepository'
import { AppError } from '../../../shared/AppError'

type AddToCartRequest = {
  userId: string
  productId: string
  variationId?: string
  quantity: number
}

type AddToCartResponse = {
  cartId: string
  itemId: string
  productId: string
  variationId: string | null
  quantity: number
  unitPrice: number
  subtotal: number
}

export class AddToCartUseCase {
  constructor(
    private cartRepository: ICartRepository,
    private productRepository: IProductRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(data: AddToCartRequest): Promise<AddToCartResponse> {
    // PASSO 1: Verifica se usuário existe
    const user = await this.userRepository.findById(data.userId)
    if (!user) {
      throw AppError.notFound('Usuário não encontrado')
    }

    // PASSO 2: Busca ou cria carrinho ativo do usuário
    let cart = await this.cartRepository.findActiveByUserId(data.userId)
    if (!cart) {
      cart = await this.cartRepository.create(data.userId)
    }

    // PASSO 3: Verifica se produto existe e tem estoque
    const product = await this.productRepository.findById(data.productId)
    if (!product) {
      throw AppError.notFound('Produto não encontrado')
    }

    let unitPrice: number

    // PASSO 4: Se tem variação, usa preço e estoque da variação
    if (data.variationId) {
      const variation = await this.productRepository.findVariationById(data.variationId)
      if (!variation) {
        throw AppError.notFound('Variação do produto não encontrada')
      }
      if (!variation.hasStock(data.quantity)) {
        throw AppError.validation(
          `Estoque insuficiente para ${variation.name}. Disponível: ${variation.stock}`
        )
      }
      unitPrice = variation.price
    } else {
      // Sem variação: usa preço e estoque do produto
      if (!product.hasStock(data.quantity)) {
        throw AppError.validation(
          `Estoque insuficiente. Disponível: ${product.stock}`
        )
      }
      unitPrice = product.price
    }

    // PASSO 5: Adiciona item ao carrinho
    const item = await this.cartRepository.addItem(cart.id, {
      productId: data.productId,
      variationId: data.variationId ?? null,
      quantity: data.quantity,
      unitPrice,
    })

    return {
      cartId: cart.id,
      itemId: item.id,
      productId: item.productId,
      variationId: item.variationId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.getSubtotal(),
    }
  }
}
