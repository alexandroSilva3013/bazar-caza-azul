# Checkpoint — Bazar Solidário Casa Azul

## Atualização — 15/09/2026

- SMS adiado por decisão do usuário até a reunião com a Casa Azul.
- Implementada alternativa: Área Administrativa → Usuários → Editar → Redefinir senha. Confirmação explícita no painel, geração aleatória de senha temporária e exibição apenas na resposta, sem guardar o texto em histórico local.
- Senha temporária precisa ser entregue diretamente ao titular pela equipe. O site não envia SMS/e-mail.
- Troca obrigatória no próximo login (cliente, vendedor ou administrador); backend bloqueia operações autenticadas até concluir a troca. Senhas e sessões anteriores são invalidadas. Após trocar, entrar novamente.
- Administrador não redefine a própria senha por esse botão.
- Migração `backend/migrations/20260915_senha_temporaria.sql` aplicada no banco local sem alterar senhas existentes.
- Testes de integração aprovados para restrição ao administrador, rejeição da senha antiga, invalidação dos tokens, troca obrigatória e acesso com a nova senha.
- Nenhuma senha de conta real foi redefinida na validação: testes usam esquema isolado.
- As demais pendências abaixo continuam abertas. Recuperação por SMS/e-mail permanece adiada; não bloquear os demais trabalhos por esse item.

Salvo em 11/09/2026 a pedido do responsável. Trabalho pausado para retomada posterior.

## Onde estamos

- Projeto: `C:\Users\user\Desktop\Bazar Solidário Casa Azul (2)`.
- GitHub: https://github.com/alexandroSilva3013/bazar-caza-azul — branch `main`.
- Último commit de implementação: `82e4cdd`, enviado ao GitHub.
- Revisão detalhada: `RELATORIO-REVISAO-2026-09-11.md` neste diretório.
- Não declarar o projeto totalmente concluído: ainda há pendências abaixo.
- A documentação acadêmica fica para depois das correções. O usuário providenciará o modelo exigido pela faculdade.

## Implementado e verificado na última revisão

- Suporte a uma foto principal e duas adicionais por produto: cadastro/edição, persistência e miniaturas nos detalhes.
- Migração `backend/migrations/20260911_galeria.sql` aplicada ao banco local. Não executar limpeza de dados ao retomar.
- `npm test` configurado no backend; suíte aprovada em esquema PostgreSQL isolado, incluindo estoque, concorrência, permissões, cadastro/login, galeria e validação de conteúdo.
- Build do frontend aprovado; permanece aviso de pacote JavaScript grande.
- Voltar, avançar e recarregar produto verificados no navegador com Jaqueta Leve. Categoria e produto são guardados no histórico.
- Falha de conexão ao verificar sessão não apaga mais o token.
- Painel de conteúdo com período e ordem; filtragem de rascunhos e validação de links HTTP/HTTPS.
- Vite restringe hosts: domínio temporário conhecido ou `BAZAR_TUNNEL_HOST`.
- Tela de recuperação corrigida para ajuda por e-mail, sem falsa confirmação de envio automático.
- As 20 URLs externas responderam HTTP 200. Jaqueta Leve já tem foto local enviada; preservar essa foto.

## Afazeres para a retomada

1. **Recuperação de senha:** confirmar com o usuário qual serviço de envio de e-mail será usado. Pergunta feita, sem resposta registrada neste checkpoint. Implementar token temporário de uso único, expiração, redefinição e teste de entrega. Não solicitar senhas pelo chat. A tela atual oferece somente contato para ajuda.
2. **Fotos:** completar e conferir visualmente duas fotos adicionais para cada um dos 21 produtos fictícios. O suporte existe, mas as 63 fotos NÃO foram cadastradas. Conferir se imagens correspondem aos nomes; resposta HTTP 200 não prova isso. Preservar uploads feitos pelo usuário.
3. **Celular:** testar seleção de três fotos, câmera, retorno ao formulário, gravação e recarga. Validar navegação autenticada, carrinho, compra e reserva no navegador sem criar registros definitivos desnecessários.
4. **Conteúdo institucional:** ajustar facilidade de manutenção com a equipe. Hoje banners/mensagens/campanhas aparecem no início da página inicial; pop-ups em sobreposição. Posicionamento livre ainda não existe. Conferir agendamento, fuso horário, ordenação e edição.
5. **Termos e privacidade:** obter textos aprovados pela instituição e disponibilizá-los ao usuário antes da concordância no cadastro.
6. **Publicação:** revisar credenciais, backups/restauração, configuração de produção e desempenho. Cloudflare temporário não substitui hospedagem definitiva. Checar se processos e link ainda estão ativos; não presumir disponibilidade.
7. **Validação final:** executar novamente testes após mudanças, validar interface e emitir relatório honesto do que passou e do que faltar. Build sozinho não comprova funcionalidade completa nem checagem TypeScript.
8. **Documentação acadêmica:** somente após ajustes, preparar documentos separados de extensão, banco/DER, backend/API, frontend, diagramas, funcionalidades e instalação. Representar a estrutura real do código, sem inventar classes. Aguardar modelo da faculdade.

## Como retomar

Pedido sugerido: “Continue a partir do CHECKPOINT-RETOMADA.md do Bazar Solidário Casa Azul. Leia também o relatório de revisão e resolva os afazeres antes de preparar a documentação.”

Ao retomar, conferir `git status`, este arquivo e o relatório. Preservar alterações locais e dados existentes; não repetir a limpeza antiga. Para testes: `npm test` dentro de `backend`; para build: `npm run build` na raiz.

## Observações sobre o acesso temporário

Frontend local: porta 5173. Backend: porta 3001, acessado pelo proxy `/api`. PostgreSQL não deve ser exposto pelo túnel.
Último domínio conhecido: `ringtones-escape-talent-merger.trycloudflare.com`. Pode ter expirado. Um novo domínio exige ajustar `BAZAR_TUNNEL_HOST` antes de iniciar o Vite. Nenhuma credencial deve ser incluída no checkpoint ou no repositório.
