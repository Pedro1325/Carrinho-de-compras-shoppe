/**
 * INTERFACE DO REPOSITÓRIO DE CUPOM
 * 
 * Define operações para criar, buscar e validar cupons de desconto.
 */

import { Coupon } from '../entities/Coupon'

export interface ICouponRepository {
  // Cria um novo cupom
  create(coupon: {
    code: string
    discount: number
    isPercentage?: boolean
    expiresAt?: Date | null
    userId?: string | null
  }): Promise<Coupon>

  // Busca cupom por código (usado para aplicar desconto)
  findByCode(code: string): Promise<Coupon | null>

  // Busca cupom por ID
  findById(id: string): Promise<Coupon | null>

  // Lista todos os cupons de um usuário
  findByUserId(userId: string): Promise<Coupon[]>

  // Lista todos os cupons (públicos + de um usuário específico)
  findAll(): Promise<Coupon[]>

  // Atualiza um cupom
  update(id: string, data: {
    code?: string
    discount?: number
    isPercentage?: boolean
    expiresAt?: Date | null
    isActive?: boolean
  }): Promise<Coupon>

  // Deleta um cupom
  delete(id: string): Promise<void>
}
