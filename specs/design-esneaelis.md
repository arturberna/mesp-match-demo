# Design system extraído do e-SNEAELIS (tela de login)

Documento de referência visual extraído do print da tela de login do sistema
e-SNEAELIS oficial (jul/2026). Objetivo: instruções para alinhar o visual da demo
ao "look" do sistema que a SNEAELIS já usa, para que o MESP Preços pareça um
módulo da mesma família de produtos.

> **Atenção -- conflito com a identidade atual:** `specs/context.md` define uma
> identidade verde institucional (`#0B5340`) com serifa para preços. Este documento
> descreve a identidade AZUL do e-SNEAELIS. Antes de implementar, decidir:
> (a) substituir a identidade da demo por esta; (b) usar esta apenas em telas de
> "casca" (login/navegação) e manter a identidade MESP no conteúdo; ou
> (c) mesclar (azul como primário, mantendo os 4 níveis de confiança como estão).
> Os valores de cor abaixo são estimados do print -- conferir com conta-gotas
> no arquivo original antes de fixar nos tokens.

## 1. Impressão geral

- Estética **Bootstrap 5 clássica de sistema de governo**: sóbria, funcional,
  sem gradientes, sem sombras dramáticas, muito espaço em branco.
- Fundo da página branco puro; conteúdo em **cartão** com borda sutil.
- Tema claro apenas (o sistema real não tem tema escuro visível).
- Densidade média: campos grandes (~40px de altura), respiros generosos.

## 2. Tokens

### 2.1 Cores

| Token | Valor (estimado) | Uso observado |
|---|---|---|
| `page-bg` | `#FFFFFF` | fundo da página |
| `navbar-bg` | `#F8F9FA` | barra superior, com borda inferior `#DEE2E6` |
| `card-bg` | `#FFFFFF` | cartão de login |
| `border` | `#DEE2E6` | bordas de cartão, divisores `<hr>` |
| `input-border` | `#CED4DA` | borda dos campos de formulário |
| `text` | `#212529` | texto principal, labels |
| `text-muted` | `#6C757D` | textos de apoio, links da navbar, placeholders |
| `primary` (azul marinho institucional) | `~#1B3E6F` | botão "Entrar", títulos em destaque das opções de rádio |
| `radio-accent` | `#0D6EFD` (azul Bootstrap) | círculo do rádio selecionado |
| `link-warning` (âmbar) | `~#F0A92E` | link "Esqueci minha senha" + ícone "?" circular |
| `link-success` (teal/verde) | `~#1FA588` | link "Registre-se" |
| Acessos rápidos | roxo `~#6F42C1`, azul `~#0D6EFD`, teal `~#1FA588`, laranja `~#FD7E14`, marinho `~#1B3E6F` | links "Acesso Coordenador / Gestor / Visitante / Precificador / DIE", cada perfil com uma cor + ícone |

Observações:
- O azul do botão é bem mais escuro que o azul Bootstrap padrão -- é um marinho
  institucional. Não usar `#0D6EFD` no botão primário.
- Cores dos acessos rápidos funcionam como **cor por perfil de usuário** --
  padrão útil para a demo (ex.: cor por papel: precificadora, gestor, visitante).

### 2.2 Tipografia

- Família única: **stack de sistema** ("Segoe UI", system-ui, sans-serif) --
  sem serifa em lugar nenhum do print.
- Título do cartão ("Login"): ~28px, peso 500-600, centralizado, cor `text`,
  com divisor fino abaixo.
- Labels de formulário: ~16px, peso 400, cor `text`.
- Títulos das opções de rádio: peso 700, cor `primary`.
- Textos de apoio (helper text): ~13-14px, cor `text-muted`.
- Logotipo: "e-" branco em bloco preto + "SNEAELIS" caixa alta pesada; abaixo,
  régua horizontal e "SECRETARIA NACIONAL" em caixa alta com letter-spacing
  largo (~0.3em), tamanho pequeno.

### 2.3 Forma e espaçamento

| Token | Valor | Uso |
|---|---|---|
| `radius-card` | ~8px | cartão de login |
| `radius-input` | ~6px | inputs, botão |
| `shadow-card` | nenhuma ou muito sutil (`0 1px 2px rgba(0,0,0,.05)`) | cartão |
| altura de input/botão | ~40-44px | todos os campos |
| padding do cartão | ~24-32px | interno |
| gap entre grupos de formulário | ~16-20px | vertical |

## 3. Componentes observados

### 3.1 Navbar

- Fundo `#F8F9FA`, borda inferior 1px `#DEE2E6`, altura ~56px.
- Links à direita ("Entrar", "Registrar") em `text-muted`, sem botão destacado.
- Sem logo na navbar (o logo fica no corpo da página de login).

### 3.2 Layout da página de login

- Duas colunas: logo grande centralizado verticalmente à esquerda (~50% da
  largura), cartão de login à direita (~480-520px de largura).
- Em telas pequenas, presumir empilhamento (logo acima do cartão).

### 3.3 Cartão de login

Ordem interna dos elementos:
1. Título centralizado + divisor.
2. Grupo de rádio "Tipo de Usuário" em 3 colunas: cada opção tem título em
   negrito azul + descrição curta em `text-muted` embaixo. **Padrão relevante:**
   seleção de perfil como primeiro passo do formulário.
3. Campo e-mail com label dinâmico refletindo o perfil escolhido
   ("E-mail (Proponente -- SNEAELIS)") + helper text abaixo.
4. Campo senha.
5. Checkbox "Lembrar de mim".
6. Bloco captcha: label ("Confirme que você não é um robô:"), imagem distorcida
   à esquerda + input curto à direita.
7. Botão primário **full-width** marinho, texto branco, "Entrar".
8. Link centralizado âmbar com ícone "?" ("Esqueci minha senha").
9. Grade de acessos rápidos: 4 links na primeira linha + 1 centralizado abaixo,
   cada um com ícone + rótulo em duas linhas, cor própria por perfil.
10. Divisor + rodapé "Não tem uma conta? Registre-se" (link teal).

### 3.4 Formulários

- Inputs Bootstrap padrão: borda `#CED4DA`, radius ~6px, placeholder muted,
  foco presumido com anel azul.
- Helper text sempre ABAIXO do campo, nunca placeholder como única instrução.
- Labels sempre visíveis acima do campo (não flutuantes).

## 4. Instruções de implementação na demo

1. **Decidir o item do aviso inicial** (substituir / casca / mesclar) e registrar
   a decisão no PLANNING.md e, se mudar a identidade, atualizar
   `specs/context.md` (seção "Identidade visual estabelecida").
2. Criar os tokens acima no tema do front (`app/`): se Tailwind, estender
   `theme.colors` com `sneaelis.primary`, `sneaelis.warning`, `sneaelis.success`
   e as cores por perfil; conferir os hex no print antes.
3. Componentes a criar/ajustar seguindo a seção 3:
   - `Navbar` claro com borda inferior (hoje inexistente ou diferente).
   - `Card` com borda `#DEE2E6`, radius 8px, sombra mínima.
   - Botão primário marinho full-width nas ações principais.
   - Padrão "seleção de perfil com título bold + descrição muted" -- candidato
     para a escolha de papel na entrada da demo (precificadora / gestor /
     visitante), reutilizando a cor-por-perfil dos acessos rápidos.
4. **O que NÃO copiar:** o captcha (a demo é estática, sem autenticação real --
   se houver tela de login, é simulada e o captcha só atrapalha); a ausência de
   tema escuro (a demo já tem paleta dupla definida); o logotipo e-SNEAELIS
   (não imitar marca de sistema real -- usar a marca própria "MESP Preços",
   podendo citar "para a SNEAELIS" em texto).
5. Manter as regras inegociáveis do CLAUDE.md: vocabulário leigo, honestidade
   visível e `tabular-nums` em colunas numéricas continuam valendo com qualquer
   paleta.
6. Acessibilidade: se adotar as cores por perfil, garantir contraste AA sobre
   branco e nunca usar cor como único diferenciador (mesma regra dos selos de
   nível de confiança).
