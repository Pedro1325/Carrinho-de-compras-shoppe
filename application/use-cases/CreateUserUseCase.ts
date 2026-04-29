// Use-case: Caso de uso para criar um usuário
// Responsabilidade única (S do SOLID): Apenas cria o usuário
// Depende da interface IUserRepository (D do SOLID)

import { IUserRepository } from '../../domain/interfaces/IUserRepository'

export class CreateUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(data: { email: string; senha: string }) {
    // TODO: 1. Validar se email já existe
    // TODO: 2. Criptografar senha (bcrypt)
    // TODO: 3. Gerar UUID
    // TODO: 4. Chamar userRepository.create()
    throw new Error('TODO: Implementar')
  }
}
