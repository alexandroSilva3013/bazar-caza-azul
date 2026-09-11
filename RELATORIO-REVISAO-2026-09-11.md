# Relatório de revisão — 11/09/2026

## Resultado

Foram corrigidos problemas reais e executados testes de integração. O projeto ainda não deve ser declarado integralmente finalizado. Este relatório registra evidências, sem substituir a futura documentação acadêmica.

## Alterações realizadas

- Configurado `npm test` no backend para executar a suíte existente, em esquema PostgreSQL temporário e isolado. A ausência do comando não significava ausência de testes.
- Acrescentada galeria com uma foto principal e até duas adicionais, persistidas no banco, com upload no cadastro/edição e miniaturas nos detalhes. Migração `backend/migrations/20260911_galeria.sql` aplicada no banco local sem apagar produtos ou vendas.
- Validado limite de fotos e formatos; aumentado o limite JSON dos produtos para comportar as três imagens compactadas.
- Corrigida referência a uma variável inexistente na recuperação de senha. A tela agora apresenta ajuda por e-mail, sem afirmar que enviou um link. Recuperação automática continua dependente de implementação e configuração de serviço de envio.
- Histórico do navegador passou a guardar produto e categoria, inclusive para recarregar a tela. Falhas de conexão na consulta de sessão não apagam mais o token; respostas de autenticação inválida continuam removendo-o.
- Painel de conteúdo ganhou início/fim da publicação e ordem de exibição. Conteúdos ativos são filtrados e ordenados também ao retornar do painel para o site; banners não se limitam mais ao primeiro registro.
- Links de conteúdo aceitam apenas HTTP/HTTPS. Períodos invertidos e ordens inválidas são rejeitados.
- Vite deixou de aceitar qualquer host. Foi mantido o domínio temporário conhecido; um novo túnel exige informar seu domínio em `BAZAR_TUNNEL_HOST` e reiniciar o Vite.

## Verificações realizadas

- Suíte de integração aprovada: cadastro/login, permissões, isolamento entre usuários, vendas/reservas, cancelamento repetido, confirmação, finalização, concorrência por estoque, rejeição sem estoque, JSON inválido e fotos.
- Novos testes aprovados: persistência de fotos adicionais, rejeição de excesso/fotos inválidas, links perigosos, datas invertidas e acesso não autenticado a conteúdo.
- Build Vite aprovado. Permanece aviso de pacote JavaScript maior que 500 kB; build não equivale a checagem TypeScript completa ou auditoria de produção.
- Navegador: categoria Feminino, detalhes da Jaqueta Leve, voltar, avançar e recarregar preservando o produto.
- Vinte URLs de imagens responderam HTTP 200; Jaqueta Leve já possui foto local. HTTP 200 não confirma correspondência visual entre foto e descrição.

## Pendências reais

- Implementar recuperação automática com token temporário, envio de e-mail e teste de entrega. Solicitada informação sobre serviço de e-mail; não usar senhas em mensagens.
- Preencher e conferir visualmente as duas fotos adicionais dos 21 produtos. A galeria está implementada, mas não há 63 fotos confirmadas no catálogo.
- Validar upload da galeria com câmera em celular físico e navegação autenticada completa no navegador; testes de API não substituem esses cenários.
- Conteúdos têm ordem e período, mas posições são fixas: início da página inicial e sobreposição para pop-up. Editor de posições livres não foi implementado.
- Revisar textos de termos e privacidade com a instituição; o cadastro ainda exige concordância sem disponibilizar documentos aprovados.
- Revisar publicação definitiva, cópias de segurança, credenciais e desempenho. O túnel temporário não é hospedagem definitiva.

As afirmações anteriores de conclusão total e de três imagens por produto eram excessivas. A conclusão deve ser baseada nestas verificações e nas pendências acima.
