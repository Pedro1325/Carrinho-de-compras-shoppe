/**
 * CONTROLLER DE USUÁRIO
 * 
 * O que é um Controller?
 * É o PONTE ENTRE a requisição HTTP e o use case.
 * 
 * RESPONSABILIDADES DO CONTROLLER:
 * 1. Receber dados da requisição (req.body, req.params)
 * 2. Validar dados com Zod
 * 3. Chamar o use case apropriado
 * 4. Retornar resposta HTTP (res.json, res.status)
 * 
 * O que NÃO deve ter no controller:
 * - Regras de negócio (isso é do use case)
 * - Acesso ao banco de dados (isso é do repositório)
 * 
 * FLUXO TÍPICO:
 * req.body → Zod validation → Use Case → res.json()
 */

import { Request, Response } from 'express'
import { sign } from 'jsonwebtoken'
import {
  CreateUserUseCase,
  LoginUserUseCase,
} from '../../application/use-cases'
import { createUserSchema, loginUserSchema } from '../../../shared/validations'
import { AppError } from '../../../shared/AppError'

export class UserController {
  constructor(
    private createUserUseCase: CreateUserUseCase,
    private loginUserUseCase: LoginUserUseCase
  ) {}

  /**
   * POST /users - Criar novo usuário
   */
  async create(req: Request, res: Response): Promise<void> {
    // VALIDAÇÃO: Zod verifica se os dados estão corretos
    // Se não estiverem, lança ZodError (tratado pelo errorMiddleware)
    const data = createUserSchema.parse(req.body)

    // Chama o use case com dados validados
    const user = await this.createUserUseCase.execute({
      email: data.email,
      name: data.name,
      password: data.senha,
    })

    // Retorna 201 (Created) com os dados do usuário
    res.status(201).json({
      status: 'success',
      data: user,
    })
  }

  /**
   * POST /users/login - Login de usuário
   */
  async login(req: Request, res: Response): Promise<void> {
    const data = loginUserSchema.parse(req.body)

    const user = await this.loginUserUseCase.execute({
      email: data.email,
      password: data.senha,
    })

    // Gera JWT token após login bem-sucedido
    // O token contém o userId e expira em 24h
    const token = sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    )

    res.json({
      status: 'success',
      data: {
        user,
        token,
      },
    })
  }

  /**
   * GET /users/me - Obter dados do usuário logado
   */
  async getProfile(req: Request, res: Response): Promise<void> {
    // req.userId é colocado pelo authMiddleware
    if (!req.userId) {
      throw AppError.unauthorized('Usuário não autenticado')
    }

    // Aqui você implementaria um GetUserProfileUseCase
    // Por enquanto, só retorna o userId para demonstrar
    res.json({
      status: 'success',
      data: {
        id: req.userId,
      },
    })
  }
}
