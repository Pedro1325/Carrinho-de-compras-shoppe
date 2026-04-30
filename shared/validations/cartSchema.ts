/**
 * VALIDAÇÃO DE CARRINHO COM ZOD
 * 
 * Aqui validamos tudo relacionado ao carrinho:
 * - Adicionar item (com validação de quantidade e variação)
 * - Atualizar quantidade
 * - Aplicar cupom de desconto
 * 
 * REGRA IMPORTANTE:
 * A quantidade deve ser positiva e ter um limite razoável
 * (ninguém compra 99999 unidades do mesmo produto)
 */

import { z } from 'zod'

// ============================================================
// SCHEMA PARA ADICIONAR ITEM AO CARRINHO
// ============================================================
export const addToCartSchema = z.object({
  // UUID do usuário dono do carrinho
  userId: z
    .string()
    .uuid('ID do usuário deve ser um UUID válido'),

  // UUID do produto a ser adicionado
  productId: z
    .string()
    .uuid('ID do produto deve ser um UUID válido'),

  // UUID da variação (opcional - nem todo produto tem variação)
  // Ex: Se o produto é uma camiseta, pode escolher "Azul M"
  variationId: z
    .string()
    .uuid('ID da variação deve ser um UUID válido')
    .optional(),

  // Quantidade do item
  // .min(1) = pelo menos 1 unidade
  // .max(100) = limite máximo por item (evite estoque infinito)
  quantity: z
    .number()
    .int('Quantidade deve ser um número inteiro')
    .min(1, 'Quantidade deve ser pelo menos 1')
    .max(100, 'Quantidade máxima por item é 100'),
})

export type AddToCartData = z.infer<typeof addToCartSchema>

// ============================================================
// SCHEMA PARA ATUALIZAR QUANTIDADE DE UM ITEM
// ============================================================
export const updateCartItemSchema = z.object({
  // UUID do carrinho
  cartId: z
    .string()
    .uuid('ID do carrinho deve ser um UUID válido'),

  // UUID do item dentro do carrinho
  itemId: z
    .string()
    .uuid('ID do item deve ser um UUID válido'),

  // Nova quantidade
  quantity: z
    .number()
    .int('Quantidade deve ser um número inteiro')
    .min(1, 'Quantidade deve ser pelo menos 1')
    .max(100, 'Quantidade máxima por item é 100'),
})

export type UpdateCartItemData = z.infer<typeof updateCartItemSchema>

// ============================================================
// SCHEMA PARA REMOVER ITEM DO CARRINHO
// ============================================================
export const removeFromCartSchema = z.object({
  cartId: z
    .string()
    .uuid('ID do carrinho deve ser um UUID válido'),
  itemId: z
    .string()
    .uuid('ID do item deve ser um UUID válido'),
})

export type RemoveFromCartData = z.infer<typeof removeFromCartSchema>

// ============================================================
// SCHEMA PARA APLICAR CUPOM DE DESCONTO
// ============================================================
export const applyCouponSchema = z.object({
  // UUID do carrinho
  cartId: z
    .string()
    .uuid('ID do carrinho deve ser um UUID válido'),

  // Código do cupom (ex: "DESCONTO10", "FRETEGRATIS")
  // .toUpperCase() = converte para maiúsculas (evita "desconto10" vs "DESCONTO10")
  couponCode: z
    .string()
    .min(1, 'Código do cupom é obrigatório')
    .max(50, 'Código do cupom deve ter no máximo 50 caracteres')
    .trim()
    .toUpperCase(),
})

export type ApplyCouponData = z.infer<typeof applyCouponSchema>

// ============================================================
// SCHEMA PARA CALCULAR TOTAL DO CARRINHO
// ============================================================
export const calculateCartTotalSchema = z.object({
  cartId: z
    .string()
    .uuid('ID do carrinho deve ser um UUID válido'),
})

export type CalculateCartTotalData = z.infer<typeof calculateCartTotalSchema>
