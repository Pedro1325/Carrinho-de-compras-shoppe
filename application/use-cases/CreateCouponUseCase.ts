/**
 * USE CASE: CRIAR CUPOM
 * 
 * FLUXO:
 * 1. Valida dados de entrada
 * 2. Verifica se código já existe
 * 3. Cria cupom
 */

import { ICouponRepository } from '../../src/domain/interfaces/ICouponRepository'
import { AppError } from '../../../shared/AppError'

type CreateCouponRequest = {
  code: string
  discount: number
  isPercentage?: boolean
  expiresAt?: string // Data ISO 8601 (ex: "2025-12-31T23:59:59Z")
  userId?: string
}

type CreateCouponResponse = {
  id: string
  code: string
  discount: number
  isPercentage: boolean
  expiresAt: Date | null
  isActive: boolean
  userId: string | null
  createdAt: Date
}

export class CreateCouponUseCase {
  constructor(private couponRepository: ICouponRepository) {}

  async execute(data: CreateCouponRequest): Promise<CreateCouponResponse> {
    // Valida desconto
    if (data.discount <= 0) {
      throw AppError.validation('Desconto deve ser maior que zero')
    }
    if (data.isPercentage && data.discount > 100) {
      throw AppError.validation('Desconto percentual não pode ser maior que 100%')
    }

    const coupon = await this.couponRepository.create({
      code: data.code,
      discount: data.discount,
      isPercentage: data.isPercentage ?? true,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      userId: data.userId ?? null,
    })

    return {
      id: coupon.id,
      code: coupon.code,
      discount: coupon.discount,
      isPercentage: coupon.isPercentage,
      expiresAt: coupon.expiresAt,
      isActive: coupon.isActive,
      userId: coupon.userId,
      createdAt: coupon.createdAt,
    }
  }
}
