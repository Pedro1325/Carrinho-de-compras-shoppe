/**
 * ENTIDADE COUPON - Cupom de desconto
 * 
 * Regras de negócio:
 * - Cupom pode ser porcentagem (ex: 10%) ou valor fixo (ex: R$20)
 * - Cupom pode ter data de expiração
 * - Cupom pode ser exclusivo para um usuário
 * - Cupom pode ser ativado/desativado
 */

export class Coupon {
  id: string
  code: string
  discount: number
  isPercentage: boolean
  expiresAt: Date | null
  isActive: boolean
  userId: string | null
  createdAt: Date

  constructor(
    props: {
      id?: string
      code: string
      discount: number
      isPercentage?: boolean
      expiresAt?: Date | null
      isActive?: boolean
      userId?: string | null
      createdAt?: Date
    }
  ) {
    this.id = props.id ?? crypto.randomUUID()
    this.code = props.code.toUpperCase().trim()
    this.discount = props.discount
    this.isPercentage = props.isPercentage ?? true
    this.expiresAt = props.expiresAt ?? null
    this.isActive = props.isActive ?? true
    this.userId = props.userId ?? null
    this.createdAt = props.createdAt ?? new Date()
  }

  /**
   * Verifica se o cupom é válido e pode ser usado
   * Regra de negócio: cupom deve estar ativo e não expirado
   */
  isValid(): boolean {
    if (!this.isActive) return false
    if (this.expiresAt && this.expiresAt < new Date()) return false
    return true
  }

  /**
   * Verifica se o cupom expirou
   */
  isExpired(): boolean {
    if (!this.expiresAt) return false
    return this.expiresAt < new Date()
  }

  /**
   * Verifica se o cupom é exclusivo de um usuário
   * Regra de negócio: se userId está preenchido, só aquele usuário pode usar
   */
  isForUser(targetUserId: string): boolean {
    if (!this.userId) return true // Cupom público, qualquer um pode usar
    return this.userId === targetUserId
  }

  /**
   * Calcula o desconto a ser aplicado no total do carrinho
   * 
   * Se isPercentage = true: desconto = total × (discount / 100)
   * Ex: total R$100, discount 10 → desconto R$10
   * 
   * Se isPercentage = false: desconto = discount (valor fixo)
   * Ex: total R$100, discount 20 → desconto R$20
   * 
   * Regra de negócio: desconto não pode ser maior que o total
   */
  calculateDiscount(cartTotal: number): number {
    if (!this.isValid()) {
      return 0
    }

    let discountValue: number

    if (this.isPercentage) {
      // Porcentagem: 10% de R$100 = R$10
      discountValue = cartTotal * (this.discount / 100)
    } else {
      // Valor fixo: R$20 de desconto
      discountValue = this.discount
    }

    // Desconto não pode ser maior que o total (não dá para ter total negativo)
    return Math.min(discountValue, cartTotal)
  }

  /**
   * Calcula o total do carrinho após aplicar o cupom
   */
  calculateTotalAfterDiscount(cartTotal: number): number {
    const discount = this.calculateDiscount(cartTotal)
    return cartTotal - discount
  }

  /**
   * Ativa ou desativa o cupom
   */
  toggleActive(): void {
    this.isActive = !this.isActive
  }

  /**
   * Formata o desconto para exibição
   */
  formattedDiscount(): string {
    if (this.isPercentage) {
      return `${this.discount}% de desconto`
    }
    return `R$ ${this.discount.toFixed(2)} de desconto`
  }

  toObject(): Record<string, unknown> {
    return {
      id: this.id,
      code: this.code,
      discount: this.discount,
      isPercentage: this.isPercentage,
      expiresAt: this.expiresAt,
      isActive: this.isActive,
      userId: this.userId,
      isValid: this.isValid(),
      createdAt: this.createdAt,
    }
  }

  static fromDatabase(data: {
    id: string
    code: string
    discount: number
    isPercentage: boolean
    expiresAt: Date | null
    isActive: boolean
    userId: string | null
    createdAt: Date
  }): Coupon {
    return new Coupon({
      id: data.id,
      code: data.code,
      discount: data.discount,
      isPercentage: data.isPercentage,
      expiresAt: data.expiresAt,
      isActive: data.isActive,
      userId: data.userId,
      createdAt: data.createdAt,
    })
  }
}
