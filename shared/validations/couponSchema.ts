/**
 * VALIDAÇÃO DE CUPOM COM ZOD
 * 
 * Cupons de desconto são comuns em e-commerce (Shopee, Amazon, etc.)
 * Validamos tanto a criação quanto o uso de cupons.
 * 
 * TIPOS DE CUPOM:
 * - Porcentagem: "10% de desconto"
 * - Valor fixo: "R$20 de desconto"
 */

import { z } from 'zod'

// ============================================================
// SCHEMA PARA CRIAR CUPOM
// ============================================================
export const createCouponSchema = z.object({
  // Código único do cupom (ex: "NAVIDAD2024")
  // Só letras maiúsculas, números e underscore
  // .regex() = pattern que força formato válido
  code: z
    .string()
    .min(1, 'Código do cupom é obrigatório')
    .max(50, 'Código deve ter no máximo 50 caracteres')
    .trim()
    .toUpperCase()
    .regex(
      /^[A-Z0-9_]+$/,
      'Código deve conter apenas letras maiúsculas, números e underscore'
    ),

  // Valor do desconto
  // Se for porcentagem: deve ser entre 1 e 100
  // Se for valor fixo: deve ser positivo
  discount: z
    .number()
    .positive('Desconto deve ser maior que zero'),

  // isPercentage = true → desconto é porcentagem (10 = 10%)
  // isPercentage = false → desconto é valor fixo (10 = R$10)
  isPercentage: z.boolean(),

  // Data de expiração (opcional)
  // Cupom sem expiry = válido para sempre
  // .refine() = validação customizada: não pode ser uma data no passado
  expiresAt: z
    .string()
    .datetime('Formato de data inválido (use ISO 8601)')
    .optional()
    .refine(
      (date) => {
        if (!date) return true // opcional, então undefined é válido
        return new Date(date) > new Date() // não pode ser data passada
      },
      { message: 'Data de expiração deve ser no futuro' }
    ),

  // Se userId for preenchido = cupom exclusivo para aquele usuário
  // Se null = cupom público (qualquer um pode usar)
  userId: z
    .string()
    .uuid('ID do usuário deve ser um UUID válido')
    .optional(),
})

export type CreateCouponData = z.infer<typeof createCouponSchema>

// ============================================================
// SCHEMA PARA ATUALIZAR CUPOM
// ============================================================
export const updateCouponSchema = createCouponSchema.partial()

export type UpdateCouponData = z.infer<typeof updateCouponSchema>
