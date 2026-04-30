/**
 * USE CASE: CRIAR USUÁRIO
 * 
 * O que é um Use Case?
 * É UMA ÚNICA operação de negócio. Pense assim:
 * - "Criar usuário" = um use case
 * - "Fazer login" = outro use case
 * - "Adicionar ao carrinho" = outro use case
 * 
 * POR QUE separar em use cases?
 * - Cada use case tem UMA responsabilidade (Single Responsibility Principle)
 * - Fácil de testar (um teste por use case)
 * - Fácil de entender (o nome do arquivo diz o que faz)
 * 
 * FLUXO DESTE USE CASE:
 * 1. Valida se email já não existe
 * 2. Criptografa a senha (bcrypt)
 * 3. Cria o usuário no banco
 * 4. Retorna o usuário criado (sem a senha)
 */

import { hash } from 'bcrypt'
import { IUserRepository } from '../../src/domain/interfaces/IUserRepository'
import { AppError } from '../../shared/AppError'

// Dados de entrada (o que o controller/envia)
type CreateUserRequest = {
  email: string
  name?: string
  password: string
}

// Dados de saída (o que o use case retorna)
type CreateUserResponse = {
  id: string
  email: string
  name: string | null
  createdAt: Date
  updatedAt: Date
}

export class CreateUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(data: CreateUserRequest): Promise<CreateUserResponse> {
    // PASSO 1: Verifica se email já está em uso
    const existingUser = await this.userRepository.findByEmail(data.email)
    if (existingUser) {
      throw AppError.conflict('Email já cadastrado')
    }

    // PASSO 2: Criptografa a senha
    // hash(senha, saltRounds) - quanto maior o saltRounds, mais lento e seguro
    // 12 é um bom equilíbrio entre segurança e performance
    const hashedPassword = await hash(data.password, 12)

    // PASSO 3: Cria o usuário no banco com senha criptografada
    const user = await this.userRepository.create({
      email: data.email,
      name: data.name,
      password: hashedPassword,
    })

    // PASSO 4: Retorna os dados do usuário (SEM a senha!)
    // NUNCA retorne a senha, mesmo criptografada
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }
}
