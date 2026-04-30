/**
 * SEED DO BANCO DE DADOS
 * 
 * O seed popula o banco com dados de exemplo para desenvolvimento.
 * Rode com: npx tsx prisma/seed.ts
 * 
 * ISTO É ÚTIL PARA:
 * - Testar a API sem criar dados manualmente
 * - Demonstrar o projeto funcionando
 * - Ter dados consistentes para desenvolvimento
 */

import { PrismaClient } from '@prisma/client'
import { hash } from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Populando banco de dados...')

  // Limpa dados existentes (ordem inversa das dependências)
  await prisma.cartItem.deleteMany()
  await prisma.cart.deleteMany()
  await prisma.productVariation.deleteMany()
  await prisma.product.deleteMany()
  await prisma.coupon.deleteMany()
  await prisma.user.deleteMany()

  // ====== USUÁRIOS ======
  const hashedPassword = await hash('senha123', 12)

  const user1 = await prisma.user.create({
    data: {
      email: 'joao@email.com',
      name: 'João Silva',
      password: hashedPassword,
    },
  })

  const user2 = await prisma.user.create({
    data: {
      email: 'maria@email.com',
      name: 'Maria Santos',
      password: hashedPassword,
    },
  })

  console.log('✅ Usuários criados')

  // ====== PRODUTOS ======
  const product1 = await prisma.product.create({
    data: {
      name: 'iPhone 15 Pro',
      description: 'Apple iPhone 15 Pro 256GB - Titânio Natural',
      price: 7499.90,
      imageUrl: 'https://example.com/iphone15.jpg',
      stock: 50,
      category: 'eletronicos',
    },
  })

  const product2 = await prisma.product.create({
    data: {
      name: 'Camiseta Básica',
      description: 'Camiseta 100% algodão, confortável e durável',
      price: 49.90,
      imageUrl: 'https://example.com/camiseta.jpg',
      stock: 200,
      category: 'roupas',
    },
  })

  const product3 = await prisma.product.create({
    data: {
      name: 'Fone Bluetooth',
      description: 'Fone de ouvido sem fio com cancelamento de ruído',
      price: 199.90,
      imageUrl: 'https://example.com/fone.jpg',
      stock: 100,
      category: 'eletronicos',
    },
  })

  const product4 = await prisma.product.create({
    data: {
      name: 'Tênis Esportivo',
      description: 'Tênis para corrida com amortecimento premium',
      price: 299.90,
      imageUrl: 'https://example.com/tenis.jpg',
      stock: 75,
      category: 'calçados',
    },
  })

  console.log('✅ Produtos criados')

  // ====== VARIAÇÕES DE PRODUTO ======
  // Camiseta - cores e tamanhos
  await prisma.productVariation.createMany({
    data: [
      { productId: product2.id, name: 'Azul - P', price: 49.90, stock: 50 },
      { productId: product2.id, name: 'Azul - M', price: 49.90, stock: 60 },
      { productId: product2.id, name: 'Azul - G', price: 49.90, stock: 40 },
      { productId: product2.id, name: 'Preto - P', price: 54.90, stock: 20 },
      { productId: product2.id, name: 'Preto - M', price: 54.90, stock: 30 },
    ],
  })

  // Tênis - cores e tamanhos
  await prisma.productVariation.createMany({
    data: [
      { productId: product4.id, name: 'Preto - 38', price: 299.90, stock: 10 },
      { productId: product4.id, name: 'Preto - 40', price: 299.90, stock: 15 },
      { productId: product4.id, name: 'Preto - 42', price: 299.90, stock: 20 },
      { productId: product4.id, name: 'Branco - 38', price: 319.90, stock: 10 },
      { productId: product4.id, name: 'Branco - 40', price: 319.90, stock: 12 },
    ],
  })

  console.log('✅ Variações criadas')

  // ====== CARRINHO ======
  const cart1 = await prisma.cart.create({
    data: {
      userId: user1.id,
      isActive: true,
    },
  })

  // Adiciona itens ao carrinho do João
  await prisma.cartItem.createMany({
    data: [
      {
        cartId: cart1.id,
        productId: product1.id,
        quantity: 1,
        unitPrice: 7499.90,
      },
      {
        cartId: cart1.id,
        productId: product3.id,
        quantity: 2,
        unitPrice: 199.90,
      },
    ],
  })

  console.log('✅ Carrinho criado')

  // ====== CUPONS ======
  await prisma.coupon.createMany({
    data: [
      {
        code: 'PRIMEIRACOMPRA',
        discount: 15,
        isPercentage: true,
        expiresAt: new Date('2027-12-31'),
        isActive: true,
      },
      {
        code: 'DESCONTO20',
        discount: 20,
        isPercentage: false,
        expiresAt: new Date('2027-06-30'),
        isActive: true,
      },
      {
        code: 'FRETEGRATIS',
        discount: 30,
        isPercentage: true,
        expiresAt: new Date('2027-03-31'),
        isActive: true,
        userId: user1.id, // Cupom exclusivo do João
      },
    ],
  })

  console.log('✅ Cupons criados')

  console.log('\n🎉 Banco populado com sucesso!')
  console.log('\n📋 Dados de teste:')
  console.log('   Usuário: joao@email.com / senha123')
  console.log('   Usuário: maria@email.com / senha123')
  console.log('   Cupom: PRIMEIRACOMPRA (15%)')
  console.log('   Cupom: DESCONTO20 (R$20)')
  console.log('   Cupom: FRETEGRATIS (30%, exclusivo do João)')
}

main()
  .catch((e) => {
    console.error('Erro ao popular banco:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
