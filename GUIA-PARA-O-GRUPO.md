# Bazar Solidário Casa Azul — guia para rodar no computador

Atualizado em 15/09/2026. Orientações para Windows, com banco local separado para cada integrante.

## 1. Programas necessários

- **Node.js 24 LTS**, que inclui o npm: [download oficial](https://nodejs.org/en/download).
- **PostgreSQL 18**, incluindo o pgAdmin: [instalador oficial para Windows](https://www.postgresql.org/download/windows/).
- Navegador atualizado. Um editor como o VS Code é opcional para editar o projeto.

Não é necessário instalar React, Vite ou Express separadamente: eles são instalados pelos comandos deste guia. Cloudflare também não é necessário para acesso local.

Durante a instalação do PostgreSQL, anote a senha que você escolher para o usuário `postgres`. Ela pertence ao banco do seu computador, não é a senha de login do site. Mantenha a porta padrão `5432`, se disponível. Feche e abra novamente o terminal depois de instalar os programas.

## 2. Preparar o ZIP para enviar ao grupo

Inclua as pastas `src`, `public` e `backend` (sem os itens excluídos abaixo), os arquivos `package.json`, `package-lock.json`, `index.html`, `vite.config.ts` e os demais arquivos de configuração, guias e checkpoint da raiz.

**Deixe fora do ZIP:**

- `node_modules` e `backend/node_modules` — cada pessoa instalará as dependências.
- `dist` — pode ser gerado novamente.
- `.env` e qualquer `.env.*`, na raiz ou no backend — contêm senhas/configurações da máquina original.
- `.git`, arquivos de log e outros arquivos `.zip`/`.rar` antigos.
- Cópias de banco com usuários, senhas ou dados pessoais.

Este guia contém um modelo de configuração sem credenciais reais. O `.gitignore` não protege um ZIP feito pelo Explorador: exclua os arquivos indicados da cópia que será compactada. Não apague esses arquivos da instalação original em uso.

**O banco não vai automaticamente dentro do ZIP.** Os 21 produtos, fotos salvas no banco, usuários, vendas e reservas não estão nos arquivos React. Seguindo este guia, o colega começará com um banco vazio e poderá cadastrar seus próprios produtos de teste. Para distribuir o catálogo de demonstração também, será necessário preparar uma exportação específica dos produtos; ela não acompanha este guia.

## 3. Extrair e instalar as dependências

Extraia o ZIP para uma pasta local, por exemplo `C:\Projetos\BazarCasaAzul`. Não execute de dentro do ZIP. Abra o PowerShell nessa pasta — é a pasta que contém o `package.json` principal.

```powershell
cd "C:\Projetos\BazarCasaAzul"
npm.cmd ci
cd backend
npm.cmd ci
cd ..
```

Substitua o caminho pelo local onde extraiu. A instalação requer internet. Usamos `npm.cmd` para evitar o bloqueio de scripts `npm.ps1` que pode ocorrer no PowerShell, sem alterar a política de segurança do Windows.

## 4. Criar o banco de dados

1. Abra o **pgAdmin** e conecte ao PostgreSQL local com a senha definida na instalação.
2. Clique com o botão direito em **Databases → Create → Database**.
3. Use o nome `bazar_solidario` e salve.
4. Selecione esse banco e abra **Tools → Query Tool**.
5. Abra o arquivo `backend/src/schema.sql` no Query Tool e execute o arquivo inteiro.

O arquivo cria as tabelas atualizadas, incluindo galeria de fotos e troca obrigatória de senha. Não cria contas nem produtos.

Para banco novo, basta `schema.sql`. Para um banco antigo, não basta repetir o schema: aplique as migrações faltantes da pasta `backend/migrations`, depois de fazer backup. Não restaure um banco antigo por cima de dados de trabalho sem revisão.

## 5. Configurar o backend

Crie um arquivo chamado exatamente `.env` dentro da pasta `backend`. No Bloco de Notas, use “Todos os arquivos” para não salvar como `.env.txt`.

Conteúdo do arquivo:

```dotenv
PORT=3001
DATABASE_URL=postgresql://postgres:SUA_SENHA_DO_POSTGRES@localhost:5432/bazar_solidario
JWT_SECRET=COLE_AQUI_UMA_CHAVE_ALEATORIA_GERADA
```

Troque `SUA_SENHA_DO_POSTGRES` pela senha do banco da sua máquina. Se ela contiver caracteres como `@`, `#`, `%`, `/` ou `:`, será necessário codificá-los para URL; peça ajuda ao grupo para montar a conexão corretamente, sem publicar a senha.

Para gerar sua chave de sessão, execute no terminal:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Copie o resultado para `JWT_SECRET`. Cada computador deve usar sua própria chave. Não envie esse arquivo ao GitHub ou ao grupo.

O frontend usa o proxy `/api` do Vite. Para a instalação local padrão, não crie `VITE_API_URL` e não copie arquivos `.env` do frontend de outro computador.

## 6. Iniciar o projeto

Mantenha **dois terminais** abertos.

**Terminal 1 — backend:**

```powershell
cd "C:\Projetos\BazarCasaAzul\backend"
npm.cmd run dev
```

Deve aparecer `Servidor rodando em http://localhost:3001`.

**Terminal 2 — site:**

```powershell
cd "C:\Projetos\BazarCasaAzul"
npm.cmd run dev -- --port 5173 --strictPort
```

Abra [http://localhost:5173](http://localhost:5173). O PostgreSQL precisa continuar em execução. Para parar o site/backend, pressione `Ctrl+C` nos respectivos terminais.

## 7. Criar o primeiro administrador local

1. No site, clique em **Criar Conta** e cadastre seu próprio nome, telefone, e-mail e senha de teste.
2. No pgAdmin, selecione o banco `bazar_solidario` e abra o Query Tool.
3. Execute o comando abaixo, trocando o e-mail pelo endereço que acabou de cadastrar:

```sql
UPDATE usuarios
SET tipo = 'admin'
WHERE email = 'seu-email-de-teste@exemplo.com'
RETURNING id, nome, email, tipo;
```

O resultado deve mostrar somente sua conta. Se não retornar nenhuma linha, confira o e-mail. Esse procedimento serve apenas para criar o administrador inicial no banco local de desenvolvimento.

4. Saia da conta no site e entre novamente pela **Área Administrativa**.
5. Cadastre produtos em **Produtos → Adicionar Produto**. Outros usuários podem ser criados pelo painel.
6. Confira as configurações do WhatsApp antes de testar os botões de contato. Envie mensagens somente quando tiver combinado com os destinatários.

**Não existe senha padrão de administrador neste pacote.** O administrador pode gerar uma senha temporária para outra conta em **Usuários → Editar → Redefinir senha**. A pessoa precisará trocar essa senha no próximo acesso; não há envio automático por SMS.

## 8. Conferir se funcionou

- [Saúde do backend](http://localhost:3001/api/health): deve retornar JSON com `status: ok`.
- [Catálogo pelo proxy](http://localhost:5173/api/produtos): deve retornar `[]` no banco vazio ou a lista de produtos cadastrados.
- O catálogo vazio é esperado antes de cadastrar produtos.
- Crie um produto, atualize a página e confira se os dados e a foto continuam disponíveis.

Para executar os testes de integração:

```powershell
cd "C:\Projetos\BazarCasaAzul\backend"
npm.cmd test
```

Os testes precisam do PostgreSQL e do `.env`. Criam um esquema temporário isolado e o removem ao terminar; o usuário do banco precisa de permissão para criar esquemas. Execute no banco local de desenvolvimento.

Para verificar a compilação do site:

```powershell
cd "C:\Projetos\BazarCasaAzul"
npm.cmd run build
```

O build não inicia os servidores e não substitui testes de navegação. Há um aviso conhecido sobre tamanho do JavaScript, descrito no relatório de revisão.

## 9. Problemas frequentes

| Problema | O que conferir |
|---|---|
| `npm` não encontrado | Instale Node.js e reabra o terminal. |
| Erro `ENOENT` / `package.json` não encontrado | Abra o terminal na pasta correta do projeto ou do backend. |
| Porta 5173 ou 3001 ocupada | Feche a execução anterior. Mantenha as portas deste guia para o proxy funcionar. |
| `password authentication failed` | Confira a senha do PostgreSQL e a codificação da URL no `.env`. |
| `ECONNREFUSED` na porta 5432 | Inicie o serviço do PostgreSQL e confira a porta. |
| Tabela/coluna inexistente | Confira se executou o schema no banco correto; banco antigo pode precisar de migração. |
| Site abre, mas não carrega dados | Confira o terminal do backend e `/api/produtos` pelo proxy. |
| Foto externa não carrega | Confira a internet e o endereço da imagem; fotos enviadas localmente ficam no banco. |
| Usuário não entra no painel | Confirme o perfil `admin`, saia da conta e faça novo login administrativo. |

## 10. Como colaborar

Cada integrante terá um banco independente: cadastrar algo em uma máquina não altera as demais. Para compartilhar alterações de código, prefiram o repositório GitHub com uma branch por integrante. Pelo ZIP, combinem quais arquivos cada pessoa editará para evitar sobrescrever trabalho.

Ao devolver arquivos, não envie `.env`, `node_modules` nem cópias do banco com dados pessoais. Para entender pendências antes de documentar o projeto, leiam `CHECKPOINT-RETOMADA.md` e `RELATORIO-REVISAO-2026-09-11.md`.

O sistema é um ambiente de desenvolvimento/demonstração. Recuperação por SMS está adiada para reunião com a Casa Azul; o envio automático não está ativo.
