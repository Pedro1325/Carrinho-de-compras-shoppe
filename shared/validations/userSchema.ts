/**
 * VALIDAÇÃO DE USUÁRIO COM ZOD
 * 
 * Zod é uma biblioteca de validação TypeScript-first.
 * Ele permite criar schemas que VALIDAM dados em tempo de execução
 * e também INFEREM os tipos TypeScript automaticamente.
 * 
 * POR QUE validar?
 * - Nunca confie em dados que vêm de fora (formulários, APIs, etc.)
 * - Zod garante que os dados estão no formato ANTES de chegar no banco
 * - Se algo estiver errado, retorna um erro claro dizendo exatamente o que falhou
 * 
 * ESTRUTURA:
 * 1. Schema = as regras de validação
 * 2. Type = o tipo TypeScript inferido automaticamente do schema
 * 3. Uso = schema.parse(dados) -> retorna os dados validados OU lança erro
 */

import { z } from 'zod'

// ============================================================
// SCHEMA PARA CRIAR USUÁRIO
// ============================================================
export const createUserSchema = z.object({
  // z.string() = espera uma string
  // .email() = valida se é um email válido (tem @, domínio, etc.)
  // .min(1) = não pode ser vazio
  // .max(255) = limite máximo de caracteres
  // .trim() = remove espaços do início e fim automaticamente
  // .toLowerCase() = converte para minúsculas (evita "Email@Gmail.com" vs "email@gmail.com")
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Formato de email inválido')
    .max(255, 'Email deve ter no máximo 255 caracteres')
    .trim()
    .toLowerCase(),

  // .min(6) = senha precisa ter pelo menos 6 caracteres
  // .regex() = valida se tem pelo menos uma letra e um número (senha forte)
  // Isso evita senhas fracas como "123456" ou "aaaaaa"
  senha: z
    .string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres')
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d)/,
      'Senha deve conter pelo menos uma letra e um número'
    ),

  // z.string().optional() = campo é opcional (pode ser undefined)
  // .max(100) = se preenchido, tem limite de tamanho
  name: z
    .string()
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .optional(),
})

// z.infer cria o tipo TypeScript automaticamente a partir do schema
// Não precisa redefinir o tipo manualmente - se mudar o schema, o tipo muda junto!
export type CreateUserData = z.infer<typeof createUserSchema>

// ============================================================
// SCHEMA PARA LOGIN (apenas email e senha)
// ============================================================
export const loginUserSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Formato de email inválido')
    .trim()
    .toLowerCase(),
  senha: z
    .string()
    .min(1, 'Senha é obrigatória'),
})

export type LoginUserData = z.infer<typeof loginUserSchema>

// ============================================================
// SCHEMA PARA ATUALIZAR USUÁRIO
// ============================================================
// .partial() = todos os campos se tornam opcionais
// Isso permite atualizar APENAS o nome, APENAS o email, etc.
export const updateUserSchema = createUserSchema.partial()

export type UpdateUserData = z.infer<typeof updateUserSchema>
