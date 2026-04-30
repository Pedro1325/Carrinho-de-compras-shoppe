# Carrinho de Compras - Clone Shopee

Projeto de estudo que implementa um **carrinho de compras** inspirado na Shopee, usando **Clean Architecture** e **DDD** (Domain-Driven Design).

---

## O que este projeto ensina

| Conceito | O que é | Onde está no código |
|----------|---------|---------------------|
| **Clean Architecture** | Separação em camadas: Domain → Application → Infrastructure → Interface | Pastas `src/domain/`, `application/`, `infrastructure/`, `interfaces/` |
| **Inversão de Dependência (SOLID)** | Use cases dependem de INTERFACES, não de implementação concreta | `domain/interfaces/IUserRepository.ts` |
| **Validação com Zod** | Validação de dados em runtime com tipos TypeScript automáticos | `shared/validations/` |
| **Prisma ORM** | Type-safe database queries com migrations | `prisma/schema.prisma` |
| **API REST** | Endpoints HTTP com Express | `interfaces/routes/` |
| **Bcrypt** | Criptografia de senhas (nunca salvar senha em texto puro) | Use case `CreateUserUseCase` |
| **Tratamento de Erros** | Middleware global + erros customizados | `shared/AppError.ts` |

---

## Arquitetura do Projeto

```
┌─────────────────────────────────────────────────────────┐
│                    CAMADAS DO PROJETO                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐   Requisição HTTP (POST, GET, etc.)    │
│  │  INTERFACE   │   ◄── Controllers + Routes            │
│  │  (Entrada)   │   ◄── Validação com Zod               │
│  └──────┬──────┘                                       │
│         │ chama                                        │
│  ┌──────▼──────┐   Regras de negócio                    │
│  │ APPLICATION │   ◄── Use Cases (casos de uso)        │
│  │  (Regras)   │   ◄── Orquestra repositórios          │
│  └──────┬──────┘                                       │
│         │ usa                                          │
│  ┌──────▼──────┐   Entidades puras (sem dependências)   │
│  │   DOMAIN    │   ◄── User, Product, Cart, Coupon     │
│  │  (Core)     │   ◄── Interfaces de repositório       │
│  └──────┬──────┘                                       │
│         │ implementada por                             │
│  ┌──────▼──────┐   Acesso ao banco de dados             │
│  │INFRASTRUCTURE│  ◄── PrismaUserRepository            │
│  │  (Dados)    │   ◄── PrismaProductRepository         │
│  └─────────────┘                                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Por que separar em camadas?

1. **Domain** = Regras de negócio PURAS. Não depende de NENHUMA biblioteca externa. Se trocar o banco de dados ou framework, essa camada NÃO muda.
2. **Application** = Casos de uso. Cada use case faz UMA coisa (ex: criar usuário, adicionar ao carrinho).
3. **Infrastructure** = Detalhes técnicos (banco de dados, emails, etc). Implementa as interfaces do domain.
4. **Interface** = Entrada do sistema (HTTP, CLI). Recebe requisições, valida, chama use cases.

---

## Estrutura de Pastas

```
├── prisma/
│   └── schema.prisma          # Modelo do banco de dados (tabelas e relações)
├── src/
│   ├── domain/
│   │   ├── entities/          # Entidades de domínio (User, Product, Cart)
│   │   └── interfaces/        # Contratos dos repositórios (IUserRepository, etc.)
│   ├── cli.ts                 # Interface de linha de comando (Inquirer)
│   └── cli-test.ts            # Teste do Inquirer
├── application/
│   └── use-cases/             # Casos de uso (CreateUser, AddToCart, etc.)
├── infrastructure/
│   └── database/              # Implementações Prisma dos repositórios
├── interfaces/
│   ├── controllers/           # Controllers HTTP
│   └── routes/                # Rotas Express
├── shared/
│   ├── AppError.ts            # Classe de erro customizada
│   └── validations/           # Schemas de validação Zod
├── .env.example               # Exemplo de variáveis de ambiente
└── package.json
```

---

## Modelagem do Banco de Dados

```
┌──────────┐       ┌──────────┐       ┌───────────┐       ┌──────────────┐
│   User   │──1:N──│   Cart   │──1:N──│ CartItem  │──N:1──│   Product    │
├──────────┤       ├──────────┤       ├───────────┤       ├──────────────┤
│ id (PK)  │       │ id (PK)  │       │ id (PK)   │       │ id (PK)      │
│ email    │       │ userId   │       │ cartId    │       │ name         │
│ name     │       │ isActive │       │ productId │       │ price        │
│ password │       │ createdAt│       │ variationId│      │ stock        │
│ createdAt│       └──────────┘       │ quantity  │       │ category     │
└──────────┘                          │ unitPrice │       │ imageUrl     │
       │                              └───────────┘       └──────────────┘
       │ 1:N                               │                    │
       ▼                                   │                    │ 1:N
┌──────────┐                               │                    ▼
│  Coupon  │                               │           ┌──────────────────┐
├──────────┤                               │           │ProductVariation  │
│ id (PK)  │                               │           ├──────────────────┤
│ code     │                               └───────────│ id (PK)          │
│ discount │                                           │ productId        │
│ expiresAt│                                           │ name             │
│ userId   │                                           │ price            │
└──────────┘                                           │ stock            │
                                                       └──────────────────┘
```

### Decisões importantes do schema:

| Decisão | Motivo |
|---------|--------|
| UUID como ID | Mais seguro que números sequenciais (não expõe quantidade de registros) |
| `unitPrice` no CartItem | Snapshot do preço no momento da adição. Se o produto mudar de preço depois, o carrinho não é afetado |
| `ProductVariation` | Modela variações como cor/tamanho (igual Shopee) |
| `isActive` no Cart | Carrinho pode ser "finalizado" sem ser deletado |
| `@@unique([cartId, productId, variationId])` | Impede duplicar o mesmo item+variação no carrinho |
| Senha como `password` | Nunca armazenar senha em texto puro (usar bcrypt) |

---

## Instalação e Configuração

### Pré-requisitos

- **Node.js** >= 20
- **PostgreSQL** rodando localmente ou em serviço remoto

### Passo a passo

```bash
# 1. Instalar dependências
npm install

# 2. Configurar banco de dados
# Copie o exemplo e edite com suas credenciais
cp .env.example .env

# 3. Criar tabelas no banco
npx prisma db push

# 4. (Opcional) Abrir Prisma Studio para visualizar o banco
npx prisma studio
```

### Arquivo `.env`

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/carrinho_shoppe?schema=public"
PORT=3000
JWT_SECRET=sua-chave-secreta-aqui
```

---

## Como usar as validações com Zod

### Exemplo básico

```typescript
import { createUserSchema } from './shared/validations'

// Dados que vieram de um formulário (podem estar errados!)
const bodyDaRequisicao = {
  email: 'email-invalido',      // email sem @
  senha: '123',                 // senha muito curta
  name: 'João'
}

// Forma 1: parse() - LANÇA ERRO se inválido
try {
  const dadosValidados = createUserSchema.parse(bodyDaRequisicao)
  // Se chegou aqui, os dados estão válidos!
} catch (error) {
  // error.errors contém detalhes de cada campo inválido
  console.log(error.errors)
  // [
  //   { message: "Formato de email inválido", path: ["email"] },
  //   { message: "Senha deve ter no mínimo 6 caracteres", path: ["senha"] }
  // ]
}

// Forma 2: safeParse() - NÃO lança erro, retorna objeto com sucesso/falha
const resultado = createUserSchema.safeParse(bodyDaRequisicao)

if (!resultado.success) {
  // Acessar erros sem try/catch
  console.log(resultado.error.errors)
} else {
  // TypeScript SABE que resultado.data está validado
  console.log(resultado.data.email)
}
```

### Por que Zod e não validar manualmente?

| Sem Zod | Com Zod |
|---------|---------|
| `if (!email.includes('@')) throw error` | `.email('Formato inválido')` |
| Precisa definir interface TS manualmente | Tipo inferido automaticamente |
| Validações espalhadas pelo código | Schema centralizado em um lugar |
| Fácil esquecer validações | Schema documenta TODAS as regras |

---

## Conceitos de Estudo

### 1. Clean Architecture

A ideia é: **regras de negócio NÃO dependem de ferramentas**.

```
SEU CÓDIGO DEVE PENSAR ASSIM:

"Para criar um usuário, preciso:"
1. Validar os dados (Zod)
2. Verificar se email não existe (repositório)
3. Criptografar a senha (bcrypt)
4. Salvar no banco (repositório)

SEU CÓDIGO NÃO DEVE PENSAR ASSIM:

"Para criar um usuário, preciso:"
1. Pegar o req.body do Express
2. Usar Prisma para salvar
```

A diferença é que na primeira abordagem, se trocar Express por Fastify ou Prisma por MongoDB, a **regra de negócio não muda**.

### 2. Inversão de Dependência

```typescript
// ERRADO: Use case depende diretamente do Prisma
class CreateUserUseCase {
  async execute(data: any) {
    const prisma = new PrismaClient() // Acoplado ao Prisma!
    return prisma.user.create({ data })
  }
}

// CERTO: Use case depende de uma INTERFACE
class CreateUserUseCase {
  constructor(private userRepository: IUserRepository) {}
  
  async execute(data: CreateUserData) {
    return this.userRepository.create(data) // Não sabe se é Prisma, MongoDB, etc.
  }
}
```

### 3. Repositório

Repositório é um **padrão que abstrai o acesso a dados**. O use case não sabe se os dados vêm do PostgreSQL, MongoDB, ou um arquivo JSON. Ele só sabe que existe um `IUserRepository` com métodos `create`, `findById`, etc.

---

## Próximos Passos (Roadmap de Estudo)

Siga esta ordem para aprender gradualmente:

### Fase 1: Fundamentos ✅
- [x] Modelagem do banco com Prisma
- [x] Validações com Zod
- [ ] Implementar repositórios Prisma (User, Product, Cart, Coupon)
- [ ] Implementar use cases com TODOs removidos

### Fase 2: API REST
- [ ] Configurar servidor Express
- [ ] Criar rotas CRUD para usuários
- [ ] Criar rotas CRUD para produtos
- [ ] Criar rotas do carrinho (add, remove, update, total)
- [ ] Criar rotas de cupons
- [ ] Middleware de tratamento de erros

### Fase 3: Segurança
- [ ] Criptografar senhas com bcrypt
- [ ] Autenticação com JWT
- [ ] Middleware de autenticação (rotas protegidas)

### Fase 4: Testes
- [ ] Testes unitários dos use cases
- [ ] Testes de integração da API
- [ ] Mock de repositórios

### Fase 5: Avançado
- [ ] Paginação e filtros
- [ ] Upload de imagens
- [ ] WebSockets (carrinho em tempo real)
- [ ] Docker

---

## Tecnologias

| Tecnologia | Versão | Para que serve |
|------------|--------|----------------|
| TypeScript | 6.0+ | Tipagem estática |
| Prisma | 7.8+ | ORM para banco de dados |
| PostgreSQL | - | Banco de dados relacional |
| Express | - | Servidor HTTP |
| Zod | - | Validação de dados |
| Bcrypt | - | Criptografia de senhas |
| Inquirer | - | Interface de linha de comando |
| Vitest | - | Framework de testes |

---

## Licença

Criri o projeto para estudos estudando pela dio 
