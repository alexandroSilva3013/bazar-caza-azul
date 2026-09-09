ATUALIZAÇÃO DO PROTÓTIPO EXISTENTE – VITRINE DIGITAL / BAZAR SOLIDÁRIO CASA AZUL

IMPORTANTE:
Não recrie o projeto do zero e não altere o design, identidade visual, estrutura ou funcionalidades que já estão prontas.

Atualize o protótipo EXISTENTE, adicionando somente as funcionalidades que estão faltando abaixo.

Mantenha:

* Identidade visual da Casa Azul;
* Cores atuais;
* Logo;
* Layout atual;
* Catálogo;
* Cadastro do usuário;
* Login do usuário;
* Navegação existente;
* Produtos;
* Reservas;
* WhatsApp;
* Todos os componentes já criados.

As novas funcionalidades devem ser integradas visualmente ao protótipo existente.

==================================================

1. ÁREA DO USUÁRIO – CARRINHO / RESERVAS
==================================================

Adicionar ao catálogo uma funcionalidade de seleção de produtos.

Quando o usuário selecionar um produto, permitir que ele seja adicionado ao carrinho/lista de reserva.

Criar uma tela ou painel de "Carrinho" contendo:

* Foto do produto;
* Nome do produto;
* Categoria;
* Valor individual;
* Quantidade;
* Subtotal;
* Botão para remover o produto;
* Botão para continuar navegando no catálogo;
* Valor total de todos os produtos selecionados.

IMPORTANTE:

O usuário deve conseguir retirar roupas/produtos da reserva antes de finalizar.

Exemplo:

Produto A – R$ 20,00
Produto B – R$ 30,00
Produto C – R$ 15,00

Total: R$ 65,00

Se o usuário remover o Produto B, o total deve ser atualizado visualmente para:

Total: R$ 35,00

Criar interação visual para adicionar e remover produtos.

==================================================
2. FINALIZAÇÃO DA COMPRA
===

O sistema deverá permitir que o usuário finalize a compra dos produtos adicionados ao carrinho.

Adicionar botão:

"Finalizar compra"

Antes da finalização, apresentar uma tela de resumo contendo:

* Dados básicos do usuário logado;
* Produtos selecionados;
* Quantidade;
* Valor individual;
* Valor total;
* Opção de remover produtos;
* Botão "Confirmar compra".

IMPORTANTE:

Não criar pagamento online.

A compra será finalizada presencialmente na Casa Azul.

Após clicar em "Confirmar compra", mostrar uma tela de confirmação informando que a solicitação foi registrada e que o pagamento/retirada será realizado presencialmente.

==================================================
3. WHATSAPP
===

Após a confirmação da compra, criar um botão:

"Enviar pedido pelo WhatsApp"

Ao clicar, simular o redirecionamento para o WhatsApp da Casa Azul.

A mensagem deverá conter:

* Nome do usuário;
* Telefone;
* Lista de todos os produtos selecionados;
* Quantidade de cada produto;
* Valor individual;
* Valor total;
* Data da solicitação.

Exemplo visual da mensagem:

"Olá, Casa Azul!
Gostaria de confirmar minha compra/reserva.

Cliente: \[Nome]
Telefone: \[Telefone]

Produtos:

* Camiseta azul – R$ 20,00
* Calça jeans – R$ 30,00
* Livro – R$ 15,00

Valor total: R$ 65,00

Aguardo confirmação."

O pagamento NÃO deverá ser realizado pelo site.

==================================================
4. HISTÓRICO DE COMPRAS
===

Adicionar ao menu do usuário a opção:

"Histórico de Compras"

Criar uma tela contendo compras anteriores.

Cada registro deve apresentar:

* Número da compra;
* Data;
* Produtos;
* Quantidade;
* Valor total;
* Status.

Exemplos de status:

* Pendente;
* Reservada;
* Confirmada;
* Finalizada;
* Cancelada.

O usuário deverá conseguir visualizar os detalhes de cada compra.

==================================================
5. ÁREA ADMINISTRATIVA
===

CRIAR UMA ÁREA ADMINISTRATIVA COMPLETA E SEPARADA DA ÁREA DO USUÁRIO.

As funcionalidades administrativas NÃO podem aparecer para usuários comuns.

O usuário comum NÃO deve conseguir acessar:

* Dashboard administrativo;
* Cadastro de produtos;
* Edição de produtos;
* Exclusão de produtos;
* Cadastro de categorias;
* Relatórios;
* Controle administrativo;
* Informações internas de vendas.

==================================================
6. LOGIN ADMINISTRATIVO
===

Criar uma tela exclusiva:

"Login Administrativo"

Adicionar uma forma clara de acessar essa tela a partir da área de login, com o texto:

"Área Administrativa"

O acesso deverá exigir credenciais específicas.

Credenciais de demonstração do protótipo:

E-mail:
admin@exemplo.com

Senha:
1 a 8

IMPORTANTE:

Criar o fluxo de protótipo para que essas credenciais sejam utilizadas para entrar na área administrativa.

Após o login correto:

LOGIN ADMINISTRATIVO
↓
DASHBOARD ADMINISTRATIVO

Se as credenciais estiverem incorretas, mostrar mensagem:

"E-mail ou senha incorretos."

Não permitir acesso às telas administrativas sem autenticação.

==================================================
7. DASHBOARD ADMINISTRATIVO
===

Após o login administrativo, criar um Dashboard exclusivo.

Menu lateral:

* Dashboard;
* Produtos;
* Categorias;
* Reservas/Vendas;
* Usuários;
* Relatórios;
* Sair.

Adicionar cards informativos:

* Total de produtos;
* Produtos disponíveis;
* Produtos reservados;
* Produtos vendidos;
* Total de vendas;
* Usuários cadastrados.

O dashboard deve possuir aparência profissional e seguir a identidade visual da Casa Azul.

==================================================
8. GERENCIAMENTO DE PRODUTOS
===

Na área administrativa, criar:

"Gerenciar Produtos"

O administrador deverá conseguir:

* Cadastrar produto;
* Atualizar produto;
* Remover produto;
* Alterar disponibilidade.

Criar botão:

"+ Adicionar Produto"

Campos:

* Nome do produto;
* Categoria;
* Descrição;
* Valor;
* Estado de conservação;
* Imagem;
* Status/disponibilidade.

Status:

* Disponível;
* Reservado;
* Vendido;
* Indisponível.

Criar fluxo de protótipo:

Adicionar Produto
→ preencher formulário
→ Salvar Produto
→ produto aparece no catálogo.

Criar fluxo:

Editar
→ formulário preenchido
→ alterar informação
→ salvar alteração
→ produto atualizado.

Criar fluxo:

Excluir
→ confirmação:
"Tem certeza que deseja excluir este produto?"
→ Cancelar / Confirmar.

==================================================
9. GERENCIAMENTO DE CATEGORIAS
===

Criar área:

"Gerenciar Categorias"

O administrador poderá:

* Adicionar categoria;
* Editar categoria;
* Excluir categoria.

Exemplos:

* Roupas;
* Calçados;
* Livros;
* Brinquedos;
* Acessórios.

==================================================
10. CONTROLE DE DISPONIBILIDADE
===

O administrador deverá conseguir alterar a disponibilidade dos produtos.

Quando um produto for reservado:

Status:
"Reservado"

Quando a venda for concluída:

Status:
"Vendido"

Produtos vendidos não devem aparecer como disponíveis para novos usuários.

Atualizar visualmente o catálogo de acordo com o status.

==================================================
11. GERENCIAMENTO DE RESERVAS / VENDAS
===

Criar área administrativa:

"Reservas e Vendas"

Mostrar:

* Cliente;
* Telefone;
* Produto;
* Quantidade;
* Valor;
* Valor total;
* Data;
* Status.

Permitir ao administrador atualizar o status.

Status:

* Pendente;
* Reservado;
* Confirmado;
* Finalizado;
* Cancelado.

Criar visualização detalhada de cada reserva/compra.

==================================================
12. RELATÓRIO DE VENDAS
===

Adicionar no menu administrativo:

"Relatório de Vendas"

Criar uma tela visual com informações sobre as vendas realizadas.

Mostrar:

* Total de vendas;
* Quantidade de produtos vendidos;
* Valor total das vendas;
* Produtos vendidos;
* Data das vendas;
* Status.

Adicionar tabela e gráficos simples.

==================================================
13. RELATÓRIO GERAL
===

Criar:

"Relatório Geral"

O administrador deverá visualizar informações gerais sobre:

* Produtos;
* Usuários;
* Reservas;
* Vendas.

Adicionar cards, tabelas e gráficos simples.

Exemplos:

Total de usuários
Total de produtos
Produtos disponíveis
Produtos reservados
Produtos vendidos
Total de vendas

==================================================
14. RESTRIÇÃO DE ACESSO
===

MUITO IMPORTANTE:

Separar completamente os dois tipos de acesso:

USUÁRIO COMUM:

* Cadastro;
* Login;
* Catálogo;
* Pesquisa;
* Filtros;
* Carrinho;
* Reserva/compra;
* Histórico;
* WhatsApp.

ADMINISTRADOR:

* Login administrativo;
* Dashboard;
* Produtos;
* Categorias;
* Reservas/vendas;
* Usuários;
* Relatórios;
* Controle de disponibilidade.

As informações e funcionalidades administrativas não devem aparecer no menu do usuário comum.

==================================================
15. PROTOTIPAÇÃO E NAVEGAÇÃO
===

Criar todas as conexões necessárias para que o protótipo possa ser demonstrado.

Fluxo do usuário:

HOME
↓
LOGIN/CADASTRO
↓
CATÁLOGO
↓
DETALHES DO PRODUTO
↓
ADICIONAR AO CARRINHO
↓
CARRINHO
↓
REMOVER/ALTERAR PRODUTOS
↓
TOTAL
↓
FINALIZAR COMPRA
↓
CONFIRMAÇÃO
↓
WHATSAPP
↓
HISTÓRICO DE COMPRAS

Fluxo administrativo:

HOME
↓
ÁREA ADMINISTRATIVA
↓
LOGIN ADMIN
↓
DASHBOARD
↓
PRODUTOS
↓
ADICIONAR / EDITAR / EXCLUIR
↓
CATEGORIAS
↓
RESERVAS/VENDAS
↓
RELATÓRIO DE VENDAS
↓
RELATÓRIO GERAL

IMPORTANTE:

Criar todas essas telas e conexões no protótipo.

Não remover funcionalidades que já existem.

Não alterar desnecessariamente o design existente.

Apenas complementar o protótipo com as funcionalidades descritas acima.

O objetivo é que, ao apresentar o protótipo, seja possível demonstrar visualmente tanto o fluxo completo do usuário quanto o fluxo completo do administrador.

