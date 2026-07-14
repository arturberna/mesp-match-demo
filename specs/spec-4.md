# SPEC-D04 -- Tela Famílias: parametrização e conferência de especialista

## Objetivo

O coração político da demo: mostrar que as regras do sistema são **um catálogo que a
especialista da SNEAELIS governa**, não código. Esta tela materializa o "meta-projeto":
a interface de parametrização sobre `familias.yaml`/`sinonimos.yaml` e a fila de
conferência que promove famílias (e seus itens) de Compatível para Confirmado.

É a tela que transforma a servidora de auditada em autora. Tudo aqui é simulado
client-side (DD2), mas sobre o catálogo REAL exportado (SPEC-D01, `familias.json`).

---

## Visão geral (grid de famílias)

Cards por família (como no mockup v0, aba Famílias, mas dirigidos por dado real):

- Nome da família + estado: `Validada` (verde, na lista confiaveis) |
  `Aguardando especialista` (azul) | `Em estudo` (âmbar, fora do catálogo).
- "O detalhe que não pode errar": os atributos críticos como chips editáveis.
- Contadores reais: quantos itens da SNEAELIS pertencem à família, quantos em cada nível.
- **O número de ouro:** nas famílias aguardando, o botão
  `Validar esta família -> promove N itens` (N = `n_promoviveis` do export).
- Filtros: por estado, por volume de itens, busca por nome.
- Ordenação padrão: maior `n_promoviveis` primeiro (a fila de maior retorno no topo).

## Detalhe de família (drawer ou rota própria)

1. **Regras da família** (edição simulada):
   - atributos críticos / secundários / informativos como listas arrastáveis ou chips
     com adicionar/remover;
   - sinônimos reconhecidos (de `sinonimos.yaml`) com adicionar/remover;
   - toda edição mostra pré-visualização do efeito em linguagem leiga:
     "Com 'tamanho' como detalhe crítico, camisa M nunca casará com camisa G."
2. **Amostra de conferência**: 5-8 itens reais da família com o encontro proposto
   (descrição SNEAELIS x descrição da base, lado a lado) e botões Confere / Não confere.
3. **O momento de cerimônia**: ao concluir a conferência, o botão
   `Promover família a Validada` dispara a transição -- os N itens da família mudam de
   selo azul para verde com animação sóbria (SPEC-D07), o painel (SPEC-D06) atualiza,
   e um registro aparece: "Família X validada por [nome da especialista] em [data]".
   O campo de nome fica pré-preenchível -- é a assinatura dela no sistema.
4. Aviso discreto e permanente de protótipo: "edições de demonstração -- nada é gravado".

## Caso especial: vestuário

A família mais importante (143 itens) ganha tratamento dedicado no card: além do fluxo
normal, uma `<NotaHonesta>` explica que a base pública tem pouca compra de vestuário e
apresenta o caminho: "a pesquisa da SNEAELIS, rotulada e datada, entra como fonte
complementar oficial". Um mock de formulário "registrar pesquisa própria" (fonte, data,
critério, valores) pode aparecer como visão de futuro -- claramente marcado como tal.

## Critérios de aceitação

1. O grid reflete o `familias.yaml` real: as famílias `confiaveis` aparecem como
   Validadas; contagens batem com o relatório.
2. Promover uma família muda, na mesma sessão, o selo dos itens dela na tela Consulta
   e as contagens do Painel (estado global client-side).
3. Recarregar a página restaura o estado original (nada persiste), sem quebrar.
4. O fluxo completo (abrir família -> conferir amostra -> promover -> ver o efeito)
   é executável em menos de 2 minutos numa demo ao vivo.
