/**
 * USE CASE: CALCULAR TOTAL DO CARRINHO COM CUPOM
 * 
 * FLUXO:
 * 1. Busca carrinho do usuário
 * 2. Calcula total bruto (soma dos items)
 * 3. Se cupom fornecido, valida e calcula desconto
 * 4. Retorna total bruto, desconto e total final
 * 
 * POR QUE separar do GetCart?
 * Porque calcular total com cupom é uma operação diferente.
 * O GetCart só retorna os dados do carrinho.
 * Este use case aplica lógica de desconto.
 */

import { ICartRepository } from '../../src/domain/interfaces/ICartRepository'
import { ICouponRepository } from '../../src/domain/interfaces/ICouponRepository'
import { AppError } from '../../../shared/AppError'

type CalculateCartTotalRequest = {
  userId: string
  couponCode?: string
}

type CalculateCartTotalResponse = {
  subtotal: number
  discount: number
  total: number
  couponApplied: string | null
  totalItems: number
}

export class CalculateCartTotalUseCase {
  constructor(
    private cartRepository: ICartRepository,
    private couponRepository: ICouponRepository
  ) {}

  async execute(data: CalculateCartTotalRequest): Promise<CalculateCartTotalResponse> {
    // Busca carrinho ativo
    const cart = await this.cartRepository.findActiveByUserId(data.userId)
    if (!cart) {
      throw AppError.notFound('Carrinho não encontrado')
    }

    if (cart.isEmpty()) {
      throw AppError.validation('Carrinho está vazio')
    }

    // Calcula subtotal
    const subtotal = cart.getTotal()
    let discount = 0
    let couponApplied: string | null = null

    // Se cupom foi fornecido, valida e calcula desconto
    if (data.couponCode) {
      const coupon = await this.couponRepository.findByCode(data.couponCode)
      if (!coupon) {
        throw AppError.notFound('Cupom não encontrado')
      }

      if (!coupon.isValid()) {
        if (!coupon.isActive) {
          throw AppError.validation('Cupom não está mais ativo')
        }
        if (coupon.isExpired()) {
          throw AppError.validation('Cupom expirado')
        }
      }

      // Verifica se cupom é para este usuário
      if (!coupon.isForUser(data.userId)) {
        throw AppError.forbidden('Este cupom não é válido para sua conta')
      }

      // Calcula desconto
      discount = coupon.calculateDiscount(subtotal)
      couponApplied = coupon.code
    }

    const total = subtotal - discount

    return {
      subtotal,
      discount,
      total,
      couponApplied,
      totalItems: cart.getTotalItems(),
    }
  }
}
