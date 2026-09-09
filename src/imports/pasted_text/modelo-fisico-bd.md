IMPORTANTE: NÃO ALTERE O PROTÓTIPO EXISTENTE.

Quero que você crie, em uma NOVA PÁGINA/ÁREA SEPARADA do arquivo do Figma, o MODELO FÍSICO DO BANCO DE DADOS do projeto “Vitrine Digital – Bazar Solidário Casa Azul”.

O modelo físico será utilizado como documentação acadêmica do projeto. Ele deve ser baseado diretamente no DIAGRAMA DE CLASSES e no DIAGRAMA DE CASOS DE USO já existentes no projeto.

NÃO altere nenhuma tela, frame, componente, layout, cor, fluxo de navegação ou funcionalidade do protótipo atual.

NÃO coloque o modelo físico dentro do fluxo navegável do protótipo.

NÃO transforme o modelo físico em uma tela do site.

Crie somente uma nova página/área separada chamada:

“Modelo Físico – Banco de Dados”

==================================================
1. FONTE PRINCIPAL: DIAGRAMA DE CLASSES
==================================================

O modelo físico deve ser construído principalmente com base nas classes que já aparecem no diagrama de classes entregue ao professor.

As classes existentes são:

- Pessoa
- Cliente
- Vendedor
- Administrador
- Endereço
- Item
- Produto
- Compra
- RelatórioVendas
- RelatórioGeral
- WhatsApp

O diagrama de classes apresenta as seguintes informações e relações que devem ser consideradas na transformação para o modelo físico:

PESSOA:
- idUsuario: int
- nome: String
- email: String
- senha: String
- telefone: String

Possui operações relacionadas a:
- realizarCadastro()
- realizarLogin()

ENDEREÇO:
- idEndereco: int
- logradouro: String
- numero: String
- complemento: String
- bairro: String
- cidade: String
- estado: String
- cep: String

CLIENTE:
herda de Pessoa e possui:
- buscarProduto()
- comprar()
- cancelarCompra()

VENDEDOR:
herda de Cliente/Pessoa conforme a estrutura de generalização apresentada no diagrama e possui:
- cadastrarProd()
- editarProd()
- excluirProd()

ADMINISTRADOR:
herda da estrutura de usuário apresentada no diagrama e possui:
- gerenciarPessoas()
- gerarRelatorios()
- gerenciarSistema()

PRODUTO:
- idProduto: int
- nome: String
- descricao: String
- preco: double
- categoria: String
- estado: String
- foto: String
- status: String

ITEM:
- idItem: int
- quantidade: int
- valorUnit: double
- subtotal: double

Possui operação:
- calcSubtotal()

COMPRA:
- idCompra: int
- dataCompra: Date
- valorTotal: double
- status: String

Possui operações:
- confirmar()
- cancelar()

RELATÓRIO DE VENDAS:
- idRelatorio: int
- dataGeracao: Date
- tipo: String

Possui operação:
- exportar()

RELATÓRIO GERAL:
- idRelatorio: int
- dataGeracao: Date
- tipo: String

Possui operação:
- exportar()

WHATSAPP:
- numero: String
- msgPadrao: String

Possui operação:
- abrirConversa()

ENDEREÇO está relacionado a PESSOA.

CLIENTE está relacionado a ITEM/COMPRA.

ITEM está relacionado a PRODUTO.

ITEM está relacionado a COMPRA.

VENDEDOR está relacionado ao gerenciamento/cadastro de PRODUTOS.

ADMINISTRADOR está relacionado ao gerenciamento do sistema e à geração de relatórios.

COMPRA está relacionada ao WHATSAPP para a comunicação/confirmação externa.

RELATÓRIOS estão relacionados ao gerenciamento administrativo.

==================================================
2. RELAÇÃO COM O DIAGRAMA DE CASOS DE USO
==================================================

Utilize também o diagrama de casos de uso para verificar se o modelo físico contempla os dados necessários para as funcionalidades do sistema.

Os casos de uso existentes incluem:

USUÁRIO:
- criar conta
- fazer login
- recuperar senha
- editar perfil
- visualizar produto

CLIENTE:
- buscar produto
- adicionar carrinho
- realizar compra

A realização da compra inclui:
- confirmar compra

A confirmação da compra possui integração com:
- WhatsApp, como sistema externo

VENDEDOR:
- cadastrar produto
- gerenciar produto

ADMINISTRADOR:
- gerenciar usuários
- gerenciar categorias
- gerar relatórios

Gerar relatórios inclui:
- exportar relatório

O modelo físico deve ser coerente com essas funcionalidades.

==================================================
3. TABELAS DO MODELO FÍSICO
==================================================

Crie as tabelas necessárias para representar os dados do sistema.

No mínimo, considere as seguintes entidades/tabelas:

1. PESSOA/USUARIO
2. ENDERECO
3. CLIENTE
4. VENDEDOR
5. ADMINISTRADOR
6. PRODUTO
7. ITEM
8. COMPRA
9. RELATORIO_VENDAS
10. RELATORIO_GERAL
11. WHATSAPP

Além dessas, se for necessário para representar corretamente o relacionamento entre PRODUTO e CATEGORIA, crie a tabela:

12. CATEGORIA

A tabela CATEGORIA deve representar a organização/classificação dos produtos, pois o sistema possui gerenciamento de categorias no diagrama de casos de uso.

==================================================
4. CHAVES PRIMÁRIAS
==================================================

Cada tabela deve possuir uma chave primária claramente identificada como PK.

Exemplo:

PESSOA
- id_usuario INT PK

ENDERECO
- id_endereco INT PK

PRODUTO
- id_produto INT PK

ITEM
- id_item INT PK

COMPRA
- id_compra INT PK

CATEGORIA
- id_categoria INT PK

RELATORIO_VENDAS
- id_relatorio_vendas INT PK

RELATORIO_GERAL
- id_relatorio_geral INT PK

WHATSAPP
- id_whatsapp INT PK

Para CLIENTE, VENDEDOR e ADMINISTRADOR, mantenha a coerência com a estrutura de generalização do diagrama de classes. Caso sejam implementados como especializações de PESSOA, utilize a chave de PESSOA como PK/FK, deixando visualmente claro o relacionamento de herança.

==================================================
5. CHAVES ESTRANGEIRAS
==================================================

Identifique claramente todas as FK necessárias.

O modelo deve representar, no mínimo:

PESSOA → ENDERECO

PESSOA/CLIENTE → COMPRA

COMPRA → ITEM

ITEM → PRODUTO

PRODUTO → CATEGORIA

VENDEDOR → PRODUTO

ADMINISTRADOR → RELATÓRIOS

COMPRA → WHATSAPP

As chaves estrangeiras devem estar identificadas com “FK”.

Não crie relacionamentos aleatórios. Os relacionamentos devem ser derivados dos diagramas apresentados.

==================================================
6. DADOS DE PRODUTO
==================================================

A tabela PRODUTO deve permitir armazenar as informações necessárias para o catálogo digital:

- id_produto
- nome
- descricao
- preco
- categoria
- estado
- foto
- status/disponibilidade

O campo de status/disponibilidade deve permitir representar se o produto está disponível ou não para compra/reserva.

==================================================
7. CARRINHO E ITEM
==================================================

Como o diagrama de casos de uso possui “Adicionar carrinho” e “Realizar compra”, represente corretamente a relação entre produtos, itens e compra.

Um cliente poderá possuir uma compra composta por um ou mais itens.

Cada ITEM deve identificar:
- qual produto está sendo selecionado;
- quantidade;
- valor unitário;
- subtotal.

O subtotal deve representar:

quantidade × valor unitário

A COMPRA deve armazenar:
- data da compra;
- valor total;
- status;
- cliente responsável.

O valor total deve representar a soma dos itens pertencentes à compra.

==================================================
8. CATEGORIA
==================================================

Como o sistema possui gerenciamento de categorias, crie a tabela CATEGORIA contendo pelo menos:

- id_categoria PK
- nome_categoria
- descricao_categoria

Cada produto deve estar associado a uma categoria.

==================================================
9. USUÁRIO, CLIENTE, VENDEDOR E ADMINISTRADOR
==================================================

Mantenha a estrutura de usuários coerente com o diagrama de classes.

O sistema possui diferentes perfis:

- Usuário/Cliente
- Vendedor
- Administrador

O ADMINISTRADOR possui acesso restrito às funções administrativas.

O modelo deve permitir diferenciar o usuário comum dos perfis administrativos.

Não disponibilize informações administrativas como se fossem dados públicos do cliente.

==================================================
10. RELATÓRIOS
==================================================

O sistema possui dois tipos de relatório representados no diagrama:

RELATORIO_VENDAS:
- id_relatorio_vendas PK
- data_geracao
- tipo

RELATORIO_GERAL:
- id_relatorio_geral PK
- data_geracao
- tipo

Os relatórios devem estar relacionados ao ADMINISTRADOR responsável pela geração.

==================================================
11. WHATSAPP
==================================================

O WhatsApp é um SISTEMA EXTERNO no diagrama de casos de uso.

Não trate o WhatsApp como se fosse um usuário comum do sistema.

A estrutura deve representar somente os dados necessários para a integração/comunicação, como:

- id_whatsapp
- numero
- mensagem_padrao

A compra poderá gerar uma comunicação para o WhatsApp contendo informações relacionadas à compra.

==================================================
12. TIPOS DE DADOS
==================================================

Utilize tipos de dados compatíveis com um banco de dados relacional.

Preferencialmente:

INT para identificadores e quantidades.

VARCHAR para nomes, e-mails, telefones, status, categorias e textos curtos.

TEXT para descrições maiores.

DECIMAL(10,2) para valores monetários.

DATE ou DATETIME para datas.

Não utilize “String” ou “double” no modelo físico final. Esses termos pertencem ao modelo de classes. No modelo físico, utilize tipos SQL apropriados.

==================================================
13. RELACIONAMENTOS E CARDINALIDADES
==================================================

Mostre visualmente os relacionamentos entre as tabelas utilizando PK e FK.

Utilize cardinalidades coerentes com o diagrama de classes existente.

Exemplos esperados:

PESSOA 1:N COMPRA

PESSOA 1:1 ENDERECO, caso seja mantida a cardinalidade apresentada no diagrama de classes.

COMPRA 1:N ITEM

PRODUTO 1:N ITEM

CATEGORIA 1:N PRODUTO

ADMINISTRADOR 1:N RELATORIO_VENDAS

ADMINISTRADOR 1:N RELATORIO_GERAL

VENDEDOR 1:N PRODUTO

Não invente novas cardinalidades sem necessidade.

==================================================
14. FORMATO VISUAL
==================================================

Crie um modelo físico visualmente organizado e profissional, adequado para apresentação acadêmica.

Cada tabela deve aparecer como uma caixa contendo:

NOME DA TABELA

Campo | Tipo | Chave

Exemplo:

PRODUTO

id_produto | INT | PK
nome | VARCHAR(150) |
descricao | TEXT |
preco | DECIMAL(10,2) |
id_categoria | INT | FK
estado | VARCHAR(100) |
foto | VARCHAR(255) |
status | VARCHAR(30) |

As PK devem estar claramente identificadas.

As FK devem estar claramente identificadas.

As linhas de relacionamento devem conectar corretamente as PKs às respectivas FKs.

==================================================
15. COERÊNCIA COM A DOCUMENTAÇÃO
==================================================

O modelo físico deve ser compatível com:

- Diagrama de Classes entregue ao professor;
- Diagrama de Casos de Uso entregue ao professor;
- Funcionalidades atuais do projeto;
- Cadastro de usuários;
- Login;
- Catálogo de produtos;
- Categorias;
- Carrinho;
- Compra;
- Histórico/registro de compras;
- Gerenciamento de produtos;
- Gerenciamento de usuários;
- Gerenciamento de categorias;
- Relatórios;
- Integração com WhatsApp.

Não remova nenhuma entidade importante já presente nos diagramas.

Não crie funcionalidades que não existam no projeto apenas para aumentar o modelo.

==================================================
16. IMPORTANTE SOBRE O PROTÓTIPO
==================================================

NÃO ALTERE O PROTÓTIPO.

NÃO MODIFIQUE:
- telas;
- componentes;
- cores;
- textos;
- imagens;
- navegação;
- layout;
- funcionalidades;
- frames;
- páginas existentes do protótipo.

O único objetivo desta solicitação é criar uma NOVA ÁREA/PÁGINA SEPARADA para o MODELO FÍSICO DO BANCO DE DADOS.

Nome da nova página:

“MODELO FÍSICO – BANCO DE DADOS”

O modelo deve ficar completamente separado do protótipo navegável.

Antes de finalizar, verifique se todas as tabelas possuem PK, se todas as FK estão corretamente conectadas e se os relacionamentos são coerentes com os diagramas fornecidos.