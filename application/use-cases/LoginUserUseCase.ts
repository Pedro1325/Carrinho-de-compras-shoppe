/**
 * USE CASE: LOGIN DE USUÁRIO
 * 
 * FLUXO:
 * 1. Busca usuário pelo email
 * 2. Compara a senha fornecida com a senha criptografada no banco
 * 3. Se válida, retorna os dados do usuário
 * 
 * POR QUE usar bcrypt.compare?
 * Porque bcrypt usa um salt aleatório. Você NÃO PODE comparar strings diretamente.
 * bcrypt.compare(senhaDigitada, senhaCriptografada) faz a comparação correta.
 */

import { compare } from 'bcrypt'
import { IUserRepository } from '../../src/domain/interfaces/IUserRepository'
import { AppError } from '../../shared/AppError'

type LoginUserRequest = {
  email: string
  password: string
}

type LoginUserResponse = {
  id: string
  email: string
  name: string | null
  createdAt: Date
  updatedAt: Date
}

export class LoginUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(data: LoginUserRequest): Promise<LoginUserResponse> {
    // PASSO 1: Busca usuário pelo email
    const user = await this.userRepository.findByEmail(data.email)
    if (!user) {
      // Mensagem genérica para não revelar se email existe ou não
      throw AppError.unauthorized('Email ou senha inválidos')
    }

    // PASSO 2: Compara a senha fornecida com a senha criptografada
    const passwordMatches = await compare(data.password, user.password)
    if (!passwordMatches) {
      throw AppError.unauthorized('Email ou senha inválidos')
    }

    // PASSO 3: Retorna dados do usuário (sem senha)
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }
}
