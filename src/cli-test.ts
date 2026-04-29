// Arquivo de teste para entender o inquirer
// Rode com: npx ts-node src/cli-test.ts

import inquirer from 'inquirer'

async function main() {
  // O inquirer.prompt faz perguntas ao usuário
  const resposta = await inquirer.prompt([
    {
      type: 'list',        // tipo: lista de opções
      name: 'produtos',       // nome da variável que vai receber o valor
      message: 'Carrinho Shopee',
      choices: [
        'Iphone 11',
        'Fazer login',
        'Sair'
      ]
    }
  ])

  console.log('Preço final produtos:', resposta.opcao)
}

main()
