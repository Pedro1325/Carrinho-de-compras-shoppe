/**
 * BARREL EXPORT - Atalho para importar todos os schemas de uma vez
 * 
 * Em vez de fazer:
 *   import { createUserSchema } from '../../shared/validations/userSchema'
 *   import { createProductSchema } from '../../shared/validations/productSchema'
 * 
 * Você faz:
 *   import { createUserSchema, createProductSchema } from '../../shared/validations'
 */

export * from './userSchema'
export * from './productSchema'
export * from './cartSchema'
export * from './couponSchema'
