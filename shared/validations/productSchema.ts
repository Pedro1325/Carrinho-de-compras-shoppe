/**
 * VALIDAÇÃO DE PRODUTO COM ZOD
 * 
 * Mesma lógica do userSchema, mas focada nas regras de produto.
 * Note como cada validação tem uma REGRA DE NEGÓCIO por trás:
 * - preço não pode ser negativo
 * - estoque não pode ser negativo
 * - nome é obrigatório
 */

import { z } from 'zod'

// ============================================================
// SCHEMA PARA CRIAR PRODUTO
// ============================================================
export const createProductSchema = z.object({
  // Nome é obrigatório e tem limite de tamanho
  name: z
    .string()
    .min(1, 'Nome do produto é obrigatório')
    .max(200, 'Nome deve ter no máximo 200 caracteres')
    .trim(),

  // Descrição é opcional, mas se preenchida tem limite
  description: z
    .string()
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres')
    .optional(),

  // z.number() = espera um número
  // .positive() = deve ser maior que zero (preço não pode ser 0 ou negativo)
  // Isso impede bugs como criar produto com preço -10 ou 0
  price: z
    .number()
    .positive('Preço deve ser maior que zero')
    .max(999999.99, 'Preço excede o limite máximo'),

  // URL da imagem é opcional, mas se preenchida deve ser uma URL válida
  // .url() = valida se começa com http:// ou https://
  imageUrl: z
    .string()
    .url('Formato de URL inválido')
    .max(500)
    .optional(),

  // Estoque: número inteiro não negativo
  // .int() = não aceita decimais (não faz sentido ter 2.5 unidades em estoque)
  // .nonnegative() = pode ser 0 (produto sem estoque) mas não negativo
  stock: z
    .number()
    .int('Estoque deve ser um número inteiro')
    .nonnegative('Estoque não pode ser negativo'),

  // Categoria é opcional
  category: z
    .string()
    .max(100, 'Categoria deve ter no máximo 100 caracteres')
    .optional(),
})

export type CreateProductData = z.infer<typeof createProductSchema>

// ============================================================
// SCHEMA PARA ATUALIZAR PRODUTO
// ============================================================
// .partial() = todos os campos opcionais (pode atualizar só o preço, só o nome, etc.)
export const updateProductSchema = createProductSchema.partial()

export type UpdateProductData = z.infer<typeof updateProductSchema>

// ============================================================
// SCHEMA PARA VARIAÇÃO DE PRODUTO (cor, tamanho, etc.)
// ============================================================
export const createVariationSchema = z.object({
  // productId = qual produto essa variação pertence
  productId: z
    .string()
    .uuid('ID do produto deve ser um UUID válido'),

  // Nome da variação (ex: "Azul - Tamanho M")
  name: z
    .string()
    .min(1, 'Nome da variação é obrigatório')
    .max(100, 'Nome da variação deve ter no máximo 100 caracteres')
    .trim(),

  // Preço da variação (pode ser diferente do preço base do produto)
  // Ex: Camiseta P custa R$50, mas GG custa R$55
  price: z
    .number()
    .positive('Preço deve ser maior que zero'),

  // Estoque específico desta variação
  stock: z
    .number()
    .int('Estoque deve ser um número inteiro')
    .nonnegative('Estoque não pode ser negativo'),
})

export type CreateVariationData = z.infer<typeof createVariationSchema>
