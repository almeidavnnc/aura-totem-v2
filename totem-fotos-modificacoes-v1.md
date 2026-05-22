# 🔧 MODIFICAÇÕES V1 — Totem de Fotos

> Correções aplicadas sobre a planta de corte original
> Data: 20/05/2026

---

## MODIFICAÇÃO 1 — Orientação da Tela Vertical

### Problema
A tela estava especificada na horizontal (paisagem). O correto é **vertical (retrato)**, como mostrado no mockup AURA.

### Antes × Depois

| Item                  | ANTES (errado)         | DEPOIS (correto)        |
|-----------------------|------------------------|-------------------------|
| Orientação            | Horizontal (paisagem)  | **Vertical (retrato)**  |
| Área visível monitor  | 345 mm (L) × 194 mm (A) | **194 mm (L) × 345 mm (A)** |
| Recorte na moldura C1 | 300 mm (L) × 200 mm (A) | **200 mm (L) × 350 mm (A)** |

### Impacto na Cabeça

Com a tela vertical, a cabeça precisa ser **mais estreita e mais alta**:

| Dimensão da cabeça   | ANTES          | DEPOIS                  |
|-----------------------|----------------|-------------------------|
| Largura externa       | 340 mm         | **280 mm**              |
| Altura externa        | 520 mm         | **600 mm**              |
| Raio dos cantos       | 170 mm         | **140 mm** (metade da largura) |

### Novo layout frontal da cabeça (C1)

```
        ╭━━━━━━━━━━╮
       ╱            ╲         Raio: 140 mm
      ┃              ┃
      ┃   ○ ⌀60mm   ┃        ← Câmera (centro a 80mm do topo)
      ┃              ┃
      ┃  ┌────────┐  ┃
      ┃  │ 200mm  │  ┃
      ┃  │        │  ┃
      ┃  │MONITOR │  ┃  350mm  ← Tela VERTICAL
      ┃  │ TOUCH  │  ┃
      ┃  │        │  ┃
      ┃  └────────┘  ┃
      ┃              ┃
       ╲            ╱
        ╰━━━━━━━━━━╯

      |←── 280 mm ──→|
      ↕ 600 mm total
```

### Posições Y atualizadas (a partir do chão)

| Componente          | Y centro (do chão)  |
|---------------------|----------------------|
| Topo da cabeça      | 1600 mm              |
| Base da cabeça      | 1000 mm              |
| Centro da câmera    | 1520 mm              |
| Centro do monitor   | 1260 mm              |
| Topo do monitor     | 1435 mm              |
| Base do monitor     | 1085 mm              |

---

## MODIFICAÇÃO 2 — Profundidade da Cabeça (não cabe tudo)

### Problema
A profundidade da cabeça estava em 120 mm. Com monitor (~35mm) + mini PC (~50mm) + câmera (~80mm de corpo) + espaçamento e cabos, **120 mm é insuficiente**.

### Solução: Aumentar profundidade para 200 mm

| Item                  | ANTES          | DEPOIS                  |
|-----------------------|----------------|-------------------------|
| Profundidade cabeça   | 120 mm         | **200 mm**              |
| Aro lateral C3        | 84 mm largura  | **164 mm largura** (200 - 18 frontal - 18 traseiro) |

### Distribuição interna (corte lateral da cabeça, 200 mm de profundidade)

```
  ← FRENTE                              TRÁS →

  ┌──────────────────────────────────────────┐
  │C1│  LED  │MONITOR│  espaço  │MINI PC│ C2│
  │18│  10   │  35   │   49     │  50   │ 18│ = 180mm útil
  │mm│  mm   │  mm   │   mm     │  mm   │ mm│   (200 - 2×18 = 164mm)
  └──────────────────────────────────────────┘
        ↑                           ↑
     difusor                   fixo na traseira
     LED + gap                 (suporte VESA)
```

### Zona da câmera (parte superior, mesmo corte lateral)

```
  ← FRENTE                              TRÁS →

  ┌──────────────────────────────────────────┐
  │C1│  furo  │       CÂMERA CORPO          │C2│
  │18│  lente │       150 × 100 × 80mm      │18│
  │mm│  ⌀60   │       + suporte 1/4"        │mm│
  └──────────────────────────────────────────┘
```

**Agora cabe tudo com folga** para circulação de ar e organização de cabos.

### Impacto na coluna

A coluna também precisa ser mais profunda para acompanhar:

| Item                  | ANTES          | DEPOIS                  |
|-----------------------|----------------|-------------------------|
| Profundidade coluna   | 100 mm         | **160 mm**              |
| Laterais B3           | 70 mm largura  | **130 mm largura** (160 - 15 - 15) |

---

## MODIFICAÇÃO 3 — Sistema de Fixação C1 + C2 (Hastes + Revestimento Flexível)

### Problema
A cabeça no formato stadium com frontal C1 e traseiro C2 precisa de uma estrutura rígida que os conecte. O aro C3 em MDF flexível é frágil sozinho e difícil de curvar com 200mm de profundidade.

### Solução: Hastes estruturais + Revestimento em MDF flexível (3mm)

**Conceito:** Substituir o aro C3 por um sistema de **hastes de MDF 15mm** que atravessam de C1 a C2 nas bordas, criando uma gaiola rígida. O contorno externo é feito com **MDF flexível 3mm** (ou compensado flexível) apenas como revestimento/pele.

### Novas peças da cabeça:

```
  Vista explodida (de cima):

         C1 (frontal)
         ━━━━━━━━━━━━
         ┃ H1      H2 ┃  ← hastes laterais (esquerda/direita)
         ┃            ┃
         ┃ H3      H4 ┃  ← hastes inferiores (reforço)
         ━━━━━━━━━━━━
         C2 (traseiro)

  + C3-PELE (MDF 3mm flexível) envolvendo por fora
```

### Peças substituídas/adicionadas:

| Código | Peça                          | Material     | Dimensões                    | Qtd |
|--------|-------------------------------|--------------|------------------------------|-----|
| ~~C3~~ | ~~Aro lateral MDF 6mm~~       | ~~removido~~ | —                            | 0   |
| **H1** | Haste lateral esquerda        | MDF 15 mm    | 164 mm (C) × 40 mm (A)      | 1   |
| **H2** | Haste lateral direita         | MDF 15 mm    | 164 mm (C) × 40 mm (A)      | 1   |
| **H3** | Haste inferior esquerda       | MDF 15 mm    | 164 mm (C) × 40 mm (A)      | 1   |
| **H4** | Haste inferior direita        | MDF 15 mm    | 164 mm (C) × 40 mm (A)      | 1   |
| **H5** | Haste superior (arco)         | MDF 15 mm    | 164 mm (C) × 40 mm (A)      | 1   |
| **C3-P** | Pele lateral (revestimento) | MDF flexível 3 mm | ~1500 mm (C) × 200 mm (A) | 1   |

**Nota:** 164 mm = profundidade interna (200 - 18 - 18)

### Como funciona a montagem:

```
  Passo 1: Parafusar hastes H1-H5 em C1 (frontal)

  Vista por trás de C1:

        ╭━━━━━━━━━━╮
       ╱    [H5]    ╲        ← haste superior (no arco)
      ┃              ┃
      ┃[H1]    [H2]  ┃       ← hastes laterais (meia altura)
      ┃              ┃
      ┃[H3]    [H4]  ┃       ← hastes inferiores
       ╲            ╱
        ╰━━━━━━━━━━╯

  Passo 2: Encaixar C2 (traseiro) nas pontas das hastes e parafusar

  Passo 3: Envolver toda a lateral com C3-P (MDF flexível 3mm)
           Cola + grampos/pregos sem cabeça
           A pele se curva facilmente nos arcos stadium

  Passo 4: Lixar e laquear a pele por fora
```

### Vantagens desta solução:
- Estrutura muito mais rígida (hastes sólidas de 15mm)
- MDF 3mm curva facilmente sem vapor ou cortes
- Fácil de montar e desmontar (C2 continua removível — basta desparafusar)
- O acabamento externo fica liso e uniforme após laqueamento

---

## MODIFICAÇÃO 4 — Quantidade Total de Material (m²)

### Cálculo por tipo de material

---

#### MDF 18 mm

| Peça   | Dimensões brutas (mm)       | Área (m²)  |
|--------|-----------------------------|------------|
| A1     | 400 × 400 (disco ⌀400)     | 0.160      |
| C1     | 280 × 600 (stadium)        | 0.168      |
| D1     | 300 × 300 (disco ⌀300)     | 0.090      |
| F1     | 320 × 320                  | 0.102      |
| **Subtotal MDF 18mm**       |            | **0.520 m²** |

> Nota: discos circulares são cortados de peças retangulares, por isso a área bruta é maior.

---

#### MDF 15 mm

| Peça   | Dimensões brutas (mm)       | Área (m²)  | Qtd | Total (m²) |
|--------|-----------------------------|------------|-----|------------|
| A2     | 400 × 400 (disco)          | 0.160      | 1   | 0.160      |
| B1     | 120 × 1000                 | 0.120      | 1   | 0.120      |
| B2     | 120 × 1000                 | 0.120      | 1   | 0.120      |
| B3     | 130 × 1000                 | 0.130      | 2   | 0.260      |
| C2     | 280 × 600 (stadium)        | 0.168      | 1   | 0.168      |
| C4     | 210 × 20                   | 0.004      | 2   | 0.008      |
| C5     | 160 × 80                   | 0.013      | 1   | 0.013      |
| H1-H5  | 164 × 40                   | 0.007      | 5   | 0.033      |
| D2     | 300 × 300 (disco)          | 0.090      | 1   | 0.090      |
| E1     | 100 × 400                  | 0.040      | 1   | 0.040      |
| E2     | 100 × 400                  | 0.040      | 1   | 0.040      |
| E3     | 50 × 400                   | 0.020      | 2   | 0.040      |
| F2     | 320 × 320                  | 0.102      | 1   | 0.102      |
| F3     | 214 × 320                  | 0.068      | 2   | 0.137      |
| F4     | 284 × 214                  | 0.061      | 1   | 0.061      |
| F5     | 284 × 214                  | 0.061      | 1   | 0.061      |
| **Subtotal MDF 15mm**       |            |     | **1.453 m²** |

---

#### MDF Flexível 3 mm

| Peça     | Dimensões brutas (mm)     | Área (m²)  | Qtd | Total (m²) |
|----------|---------------------------|------------|-----|------------|
| C3-P     | 1500 × 200                | 0.300      | 1   | 0.300      |
| A3       | 1260 × 25                 | 0.032      | 1   | 0.032      |
| D3       | 945 × 25                  | 0.024      | 1   | 0.024      |
| **Subtotal MDF flexível 3mm** |         |     | **0.356 m²** |

---

#### Lâmina de Madeira (Carvalho/Freijó 0.6 mm)

| Peça   | Dimensões (mm)              | Área (m²)  | Qtd | Total (m²) |
|--------|-----------------------------|------------|-----|------------|
| B1-L   | 120 × 1000                 | 0.120      | 1   | 0.120      |
| E1-L   | 100 × 400                  | 0.040      | 1   | 0.040      |
| F1-L   | 320 × 320                  | 0.102      | 1   | 0.102      |
| **Subtotal lâmina**         |            |     | **0.262 m²** |

---

### RESUMO TOTAL DE MATERIAIS

| Material                    | Área necessária | Com 15% de folga |
|-----------------------------|-----------------|-------------------|
| **MDF 18 mm**               | 0.520 m²        | **0.60 m²**       |
| **MDF 15 mm**               | 1.453 m²        | **1.67 m²**       |
| **MDF Flexível 3 mm**       | 0.356 m²        | **0.41 m²**       |
| **Lâmina Carvalho 0.6 mm**  | 0.262 m²        | **0.30 m²**       |

### Conversão para chapas comerciais

| Material          | Chapa padrão (mm)      | Área chapa | Chapas necessárias |
|-------------------|------------------------|------------|--------------------|
| MDF 18 mm         | 2750 × 1830 (5.03 m²) | 5.03 m²    | **1 chapa** (sobra bastante) |
| MDF 15 mm         | 2750 × 1830 (5.03 m²) | 5.03 m²    | **1 chapa** (sobra bastante) |
| MDF Flexível 3 mm | 2750 × 1220 (3.36 m²) | 3.36 m²    | **1 chapa** (sobra bastante) |
| Lâmina Carvalho   | Vendida por m²         | —          | **0.30 m²**        |

### Resumo de compra para o marceneiro:

```
  ┌─────────────────────────────────────────────┐
  │          LISTA DE COMPRA DE CHAPAS          │
  ├─────────────────────────────────────────────┤
  │  1× Chapa MDF 18 mm  (2750 × 1830)         │
  │  1× Chapa MDF 15 mm  (2750 × 1830)         │
  │  1× Chapa MDF Flexível 3 mm (2750 × 1220)  │
  │  0.30 m² Lâmina de Carvalho/Freijó         │
  └─────────────────────────────────────────────┘
```

---

## TABELA CONSOLIDADA — Todas as Peças Atualizadas

### Módulo Principal (14 peças MDF + 1 lâmina)

| Código | Peça                           | Material      | Dimensões (mm)               | Qtd |
|--------|--------------------------------|---------------|------------------------------|-----|
| A1     | Tampo base (disco)             | MDF 18 mm     | ⌀ 400, furo 120×160          | 1   |
| A2     | Fundo base (disco)             | MDF 15 mm     | ⌀ 400, furo cabo ⌀25        | 1   |
| A3     | Aro lateral base               | MDF flex 3 mm | 1260 × 25 (tira curva)       | 1   |
| B1     | Frontal coluna (+canaleta LED) | MDF 15 mm     | 120 × 1000                   | 1   |
| B1-L   | Lâmina madeira frontal coluna  | Lâmina 0.6 mm | 120 × 1000                   | 1   |
| B2     | Traseiro coluna (removível)    | MDF 15 mm     | 120 × 1000                   | 1   |
| B3     | Laterais coluna                | MDF 15 mm     | 130 × 1000                   | 2   |
| C1     | Frontal cabeça (stadium)       | MDF 18 mm     | 280 × 600, furo+recorte+canal| 1   |
| C2     | Traseiro cabeça (removível)    | MDF 15 mm     | 280 × 600 (stadium), grelhas | 1   |
| C3-P   | Pele lateral cabeça            | MDF flex 3 mm | 1500 × 200                   | 1   |
| H1–H5  | Hastes estruturais             | MDF 15 mm     | 164 × 40                     | 5   |
| C4     | Suporte interno monitor        | MDF 15 mm     | 210 × 20                     | 2   |
| C5     | Suporte interno câmera         | MDF 15 mm     | 160 × 80                     | 1   |

### Módulo Impressora (13 peças MDF + 2 lâminas)

| Código | Peça                           | Material      | Dimensões (mm)               | Qtd |
|--------|--------------------------------|---------------|------------------------------|-----|
| D1     | Tampo base (disco)             | MDF 18 mm     | ⌀ 300, furo 100×80           | 1   |
| D2     | Fundo base (disco)             | MDF 15 mm     | ⌀ 300, furo cabo ⌀25        | 1   |
| D3     | Aro lateral base               | MDF flex 3 mm | 945 × 25 (tira curva)        | 1   |
| E1     | Frontal coluna (+canaleta LED) | MDF 15 mm     | 100 × 400                    | 1   |
| E1-L   | Lâmina madeira frontal coluna  | Lâmina 0.6 mm | 100 × 400                    | 1   |
| E2     | Traseiro coluna (removível)    | MDF 15 mm     | 100 × 400                    | 1   |
| E3     | Laterais coluna                | MDF 15 mm     | 50 × 400                     | 2   |
| F1     | Frontal caixa (+slot)          | MDF 18 mm     | 320 × 320, cantos R40        | 1   |
| F1-L   | Lâmina madeira frontal caixa   | Lâmina 0.6 mm | 320 × 320                    | 1   |
| F2     | Traseiro caixa (removível)     | MDF 15 mm     | 320 × 320, cantos R40        | 1   |
| F3     | Laterais caixa                 | MDF 15 mm     | 214 × 320                    | 2   |
| F4     | Topo da caixa                  | MDF 15 mm     | 284 × 214                    | 1   |
| F5     | Fundo da caixa                 | MDF 15 mm     | 284 × 214, furo 100×80       | 1   |

---

### TOTAL GERAL

| Contagem                        | Valor          |
|---------------------------------|----------------|
| **Peças MDF (todos os tipos)**  | **27 peças**   |
| **Lâminas de madeira**          | **3 peças**    |
| **Chapas a comprar**            | **3 chapas MDF + 0.30m² lâmina** |

---

> Este documento deve ser lido junto com o arquivo principal de especificações (v2) e a planta de corte/montagem. As medidas aqui substituem as anteriores onde houver conflito.
