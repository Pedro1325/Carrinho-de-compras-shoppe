// Controller: Recebe a requisição HTTP, chama o use-case e retorna a resposta
// Não deve conter regras de negócio

import { CreateUserUseCase } from '../../application/use-cases/CreateUserUseCase'
import { PrismaUserRepository } from '../../infrastructure/database/PrismaUserRepository'

const userRepository = new PrismaUserRepository()
const createUserUseCase = new CreateUserUseCase(userRepository)

export class UserController {
  async create(req: any, res: any) {
    // TODO: Validar body com Zod ou class-validator
    // TODO: Chamar createUserUseCase.execute(req.body)
    // TODO: Tratar erros e retornar status apropriado
    throw new Error('TODO: Implementar')
  }
}
