/**
 * INTERFACE DO REPOSITÓRIO DE CARRINHO
 * 
 * Define todas as operações do carrinho:
 * - Criar/buscar carrinho do usuário
 * - Adicionar/remover/atualizar itens
 * - Calcular total
 * 
 * Note que algumas operações retornam Cart completo com items,
 * enquanto outras retornam apenas o item modificado.
 */

import { Cart, CartItem } from '../entities/Cart'

export interface ICartRepository {
  // Cria um novo carrinho para um usuário
  create(userId: string): Promise<Cart>

  // Busca o carrinho ativo de um usuário (com os items)
  findActiveByUserId(userId: string): Promise<Cart | null>

  // Busca carrinho por ID (com os items)
  findById(id: string): Promise<Cart | null>

  // Lista todos os carrinhos de um usuário (ativos e finalizados)
  findAllByUserId(userId: string): Promise<Cart[]>

  // ====== OPERAÇÕES COM ITENS ======

  // Adiciona um item ao carrinho
  addItem(cartId: string, item: {
    productId: string
    variationId?: string | null
    quantity: number
    unitPrice: number
  }): Promise<CartItem>

  // Busca um item específico no carrinho
  findItemById(cartId: string, itemId: string): Promise<CartItem | null>

  // Atualiza a quantidade de um item
  updateItemQuantity(cartId: string, itemId: string, quantity: number): Promise<CartItem>

  // Remove um item do carrinho
  removeItem(cartId: string, itemId: string): Promise<void>

  // Limpa todos os itens do carrinho
  clearItems(cartId: string): Promise<void>

  // ====== OPERAÇÕES DO CARRINHO ======

  // Finaliza o carrinho (marca como inativo)
  finalize(cartId: string): Promise<Cart>

  // Calcula o total do carrinho (soma de unitPrice × quantity)
  calculateTotal(cartId: string): Promise<number>

  // Deleta o carrinho e todos os seus itens
  delete(cartId: string): Promise<void>
}
