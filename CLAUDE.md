# App de Conteúdo (Conteúdo NEIA): instruções do projeto

App de criação de conteúdo do Método 2Life em https://conteudo.metodo2life.com, instalada a partir do pacote Conteúdo Negócio Enxuto com IA. Corre na VPS, em `/var/www/conteudo.metodo2life.com` (PM2 "conteudo", Node 22 isolado). As instruções pessoais da Simone em `C:\Users\fsimo\CLAUDE.md` também valem aqui.

## O que está nesta pasta

Repositório privado `github.com/311968/conteudo-2life` (ramo `main`). "Guarda" = commit + push para este repositório.

| Pasta | Conteúdo |
|---|---|
| `pacote-analisado/` | Pacote original da app, tal como foi analisado e instalado (15/10/2026) |
| `alteracoes-2026-11-10/` | Scripts das alterações já em produção (português de Portugal, letras e cores da marca) |
| `identidade-2026-11-10/` | Origem dos 7 blocos de identidade gravados na app |
| `proposta-reels-2026-11-15/` | Proposta dos reels (aberturas, R3, legendas); `base/` é cópia exata de produção; ainda não publicada |
| `proposta-visual-2026-11-15/` | Layout "Modelo 2Life" (BRAND.md v1.2), script da EB Garamond e testes; ainda não publicado |
| `mapa-fontes-app-2life-2026-11-15.html` | Cópia do Mapa das Fontes 2Life |

Nada nas pastas `proposta-*` está em produção até a Simone dizer "sim". Antes de aplicar, confirmar no servidor (só em leitura) que as impressões digitais coincidem com as da cópia `base/`; os scripts `aplicar_*.py` param sozinhos se não coincidirem. O `.gitattributes` (`* -text`) mantém os ficheiros byte a byte: não o retirar.

## Memória

A memória deste projeto (carrega sozinha) tem tudo o que a app precisa: decisões e fases da instalação, chaves e modelos de IA, segurança da VPS, e também as regras partilhadas com outros projetos (autorizações para produção, servidor, segurança com pacotes de terceiros, regras de escrita e de comunicação da marca).

- Notas novas sobre a app vão para a memória deste projeto.
- As notas marcadas "cópia partilhada" existem também noutras memórias, indicadas na própria marca. Ao alterar uma, atualizar todas as cópias.
- Para temas fora da app, consultar o índice da memória geral em `C:\Users\fsimo\.claude\projects\C--Users-fsimo\memory\MEMORY.md`.

## Ligação ao negócio

A identidade e os textos que a app usa vêm de `C:\Users\fsimo\meu-negocio\sistema-2life\fontes-oficiais\` e de `C:\Users\fsimo\meu-negocio\CLAUDE.md` (só leitura), nunca da página de vendas. Cores e fontes: ler sempre o BRAND.md.

## Regras deste projeto

- Nada é alterado na VPS sem um "sim" explícito da Simone, fase a fase.
- Credenciais e chaves nunca se pedem nem se mostram na conversa. A Simone escreve-as no terminal.
- Nunca voltar a correr o instalador nem descarregar o pacote de novo pelo link.
- Sem dados clínicos, de pacientes ou de alunos, sem contexto privado e sem depoimentos não autorizados no conteúdo.
