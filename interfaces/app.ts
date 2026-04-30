/**
 * CONFIGURAÇÃO DO APP EXPRESS
 * 
 * Este arquivo CONFIGURA o servidor Express:
 * - Middlewares globais (json parser, CORS, etc.)
 * - Rotas
 * - Middleware de erro (DEVE ser o último)
 * 
 * POR QUE separar app.ts do server.ts?
 * - app.ts = configuração (pode ser testada sem iniciar o servidor)
 * - server.ts = iniciar o servidor (só em produção)
 * - Testes podem importar app.ts sem abrir uma porta real
 */

import express from 'express'
import cors from 'cors'
import { PrismaUserRepository } from '../infrastructure/database/PrismaUserRepository'
import { PrismaProductRepository } from '../infrastructure/database/PrismaProductRepository'
import { PrismaCartRepository } from '../infrastructure/database/PrismaCartRepository'
import { PrismaCouponRepository } from '../infrastructure/database/PrismaCouponRepository'
import {
  CreateUserUseCase,
  LoginUserUseCase,
  CreateProductUseCase,
  ListProductsUseCase,
  AddToCartUseCase,
  RemoveFromCartUseCase,
  UpdateCartItemQuantityUseCase,
  GetCartUseCase,
  CalculateCartTotalUseCase,
  FinalizeCartUseCase,
  CreateCouponUseCase,
} from '../application/use-cases'
import {
  userRoutes,
  productRoutes,
  cartRoutes,
  couponRoutes,
} from './routes'
import { UserController } from './controllers/UserController'
import { ProductController } from './controllers/ProductController'
import { CartController } from './controllers/CartController'
import { CouponController } from './controllers/CouponController'
import { errorMiddleware } from './middleware/errorMiddleware'

// Cria o app Express
const app = express()

// ============================================================
// MIDDLEWARES GLOBAIS
// ============================================================

// Permite que o servidor receba requisições de outros domínios
// Em produção, substituir * pelos domínios permitidos
app.use(cors())

// Permite receber JSON no body (req.body)
// Sem isso, req.body seria undefined
app.use(express.json())

// ============================================================
// DEPENDENCY INJECTION (Injeção de Dependência)
// ============================================================
// Aqui criamos TODAS as dependências e as conectamos.
// Este padrão facilita testes (podemos trocar repositórios por mocks).

// Repositórios (camada de dados)
const userRepository = new PrismaUserRepository()
const productRepository = new PrismaProductRepository()
const cartRepository = new PrismaCartRepository()
const couponRepository = new PrismaCouponRepository()

// Use Cases (camada de regras de negócio)
const createUserUseCase = new CreateUserUseCase(userRepository)
const loginUserUseCase = new LoginUserUseCase(userRepository)
const createProductUseCase = new CreateProductUseCase(productRepository)
const listProductsUseCase = new ListProductsUseCase(productRepository)
const addToCartUseCase = new AddToCartUseCase(cartRepository, productRepository, userRepository)
const removeFromCartUseCase = new RemoveFromCartUseCase(cartRepository)
const updateCartItemQuantityUseCase = new UpdateCartItemQuantityUseCase(
  cartRepository,
  productRepository
)
const getCartUseCase = new GetCartUseCase(cartRepository)
const calculateCartTotalUseCase = new CalculateCartTotalUseCase(cartRepository, couponRepository)
const finalizeCartUseCase = new FinalizeCartUseCase(cartRepository)
const createCouponUseCase = new CreateCouponUseCase(couponRepository)

// Controllers (camada HTTP)
const userController = new UserController(createUserUseCase, loginUserUseCase)
const productController = new ProductController(createProductUseCase, listProductsUseCase)
const cartController = new CartController(
  addToCartUseCase,
  removeFromCartUseCase,
  updateCartItemQuantityUseCase,
  getCartUseCase,
  calculateCartTotalUseCase,
  finalizeCartUseCase
)
const couponController = new CouponController(createCouponUseCase, couponRepository)

// ============================================================
// ROTAS
// ============================================================

// Agrupa rotas por domínio
app.use(userRoutes(userController))
app.use(productRoutes(productController))
app.use(cartRoutes(cartController))
app.use(couponRoutes(couponController))

// Rota de saúde (health check) - útil para saber se o servidor está rodando
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
})

// ============================================================
// MIDDLEWARE DE ERRO (DEVE SER O ÚLTIMO)
// ============================================================
// O Express usa o último middleware que recebe 4 argumentos
// como handler de erros. Qualquer erro nas rotas acima
// será capturado aqui automaticamente.
app.use(errorMiddleware)

export { app }
