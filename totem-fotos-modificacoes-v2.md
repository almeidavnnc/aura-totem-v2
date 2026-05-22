# 🔧 MODIFICAÇÕES V2 — Totem de Fotos AURA

> Correções baseadas na **Ficha Técnica AURA Totem V4 (PDF oficial)**
> Comparação item a item: V1 (nosso projeto) × PDF (referência oficial)

---

## RESUMO DAS DIVERGÊNCIAS ENCONTRADAS

| #  | Área                    | Status     |
|----|-------------------------|------------|
| 01 | Altura total            | CORRIGIR   |
| 02 | Base principal          | CORRIGIR   |
| 03 | Coluna principal        | CORRIGIR   |
| 04 | Módulo óptico (cabeça)  | CORRIGIR   |
| 05 | Tela — detalhes         | CORRIGIR   |
| 06 | Câmera — modelo e medidas | CORRIGIR |
| 07 | LED perimetral          | CORRIGIR   |
| 08 | Módulo impressora       | CORRIGIR   |
| 09 | Impressora — modelo     | NOVO       |
| 10 | Portas técnicas         | NOVO       |
| 11 | Estrutura tubular       | NOVO       |
| 12 | Peso estimado           | NOVO       |
| 13 | Recálculo de peças      | RECALCULAR |
| 14 | Recálculo de m²         | RECALCULAR |

---

---

## MOD 01 — Altura Total

| Item            | V1 (nosso)    | PDF (oficial)  | Ação         |
|-----------------|---------------|----------------|--------------|
| Altura total    | 1600 mm       | **1620 mm**    | **CORRIGIR** |

A diferença de 20 mm deve ser distribuída. Verificando:
- Base: 60 mm (PDF) + Coluna: 1060 mm (PDF) + Cabeça: 480 mm (PDF) = **1600 mm**
- O PDF diz 162 cm. A soma das partes dá 160 cm. Os 20 mm extras provavelmente são a **sobreposição/encaixe** da cabeça na coluna ou folga de projeto.

**Decisão:** Adotar **1620 mm** como altura total. A cabeça encaixa 20 mm sobre o topo da coluna.

---

## MOD 02 — Base Principal

| Item                 | V1 (nosso)         | PDF (oficial)       | Ação         |
|----------------------|---------------------|---------------------|--------------|
| Formato              | Circular ⌀ 400 mm  | **40 × 40 cm**      | **CORRIGIR → QUADRADA** |
| Espessura            | 40 mm (2 discos)    | **60 mm**           | **CORRIGIR** |
| Altura útil interna  | —                   | **40 mm**           | NOVO         |
| Contrapeso           | ~3 kg               | **3–5 kg**          | OK (ajustar range) |
| Estrutura            | —                   | **Oca**             | OK (já era oco) |

### Impacto crítico: A base é QUADRADA, não circular!

Olhando o mockup novamente, a base parece arredondada mas a ficha técnica diz 40 × 40 cm. Provavelmente é um **quadrado com cantos bem arredondados** (raio ~80-100 mm).

### Novas peças da base (substituem A1, A2, A3):

| Código | Peça                      | Material    | Dimensões (mm)                          | Qtd |
|--------|---------------------------|-------------|-----------------------------------------|-----|
| A1     | Tampo da base             | MDF 18 mm   | 400 × 400, cantos R80, furo central 120×130 | 1   |
| A2     | Fundo da base             | MDF 18 mm   | 400 × 400, cantos R80, furo cabo ⌀25   | 1   |
| A3     | Paredes laterais da base  | MDF 15 mm   | Tira(s) perímetro interno, altura 24 mm | 4   |

**Espessura total:** 18 (tampo) + 24 (espaço interno/paredes) + 18 (fundo) = **60 mm** ✓

**Nota:** A peça A3 agora são **4 réguas retas** (não mais tira curva), pois a base é quadrada. Comprimentos:
- 2× régua de 370 mm (400 - 2×15 espessura parede)
- 2× régua de 340 mm (370 - 2×15)
- Todas com 24 mm de altura × 15 mm de espessura

---

## MOD 03 — Coluna Principal

| Item                   | V1 (nosso)     | PDF (oficial)    | Ação         |
|------------------------|----------------|------------------|--------------|
| Altura                 | 1000 mm        | **1060 mm**      | **CORRIGIR** |
| Largura                | 120 mm         | **120 mm**       | OK ✓         |
| Profundidade           | 160 mm (v1)    | **130 mm**       | **CORRIGIR** |
| Espaço interno útil    | 90 × 130 mm    | **60 × 60 mm**   | **CORRIGIR** |

### Impacto nas peças da coluna:

| Código | Peça                      | V1                     | V2 (corrigido)                  |
|--------|---------------------------|------------------------|---------------------------------|
| B1     | Frontal coluna            | 120 × 1000 mm         | **120 × 1060 mm**              |
| B2     | Traseiro coluna           | 120 × 1000 mm         | **120 × 1060 mm**              |
| B3     | Laterais coluna (×2)      | 130 × 1000 mm         | **100 × 1060 mm** (130-15-15=100) |

**Profundidade corrigida:** 130 mm (não 160 mm como na V1).
O espaço interno de 60×60 mm indica que as paredes são mais grossas ou há reforços internos. Verificando: 120 - 2×15 = 90mm e 130 - 2×15 = 100mm. O útil de 60×60 sugere que há **estrutura tubular interna** (ver MOD 11) que ocupa parte do espaço.

---

## MOD 04 — Módulo Óptico (Cabeça)

| Item                   | V1 (nosso)     | PDF (oficial)    | Ação         |
|------------------------|----------------|------------------|--------------|
| Altura                 | 600 mm         | **480 mm**       | **CORRIGIR** |
| Largura                | 280 mm         | **320 mm**       | **CORRIGIR** |
| Profundidade           | 200 mm         | **180 mm**       | **CORRIGIR** |

### Impacto nas peças da cabeça:

| Código | Peça                      | V1                     | V2 (corrigido)                  |
|--------|---------------------------|------------------------|---------------------------------|
| C1     | Frontal cabeça (stadium)  | 280 × 600 mm          | **320 × 480 mm**, raio 160 mm  |
| C2     | Traseiro cabeça           | 280 × 600 mm          | **320 × 480 mm**, raio 160 mm  |
| C3-P   | Pele lateral              | 1500 × 200 mm         | **~1296 × 180 mm**             |
| H1-H5  | Hastes estruturais        | 164 × 40 mm           | **144 × 40 mm** (180-18-18=144)|

**Raio dos cantos:** 160 mm (metade de 320 mm)

**Perímetro stadium:** 2 × (π × 160) + 2 × (480 - 2×160) = 1005 + 320 = **~1296 mm**

### Novo layout frontal (C1):

```
        ╭━━━━━━━━━━━━╮
       ╱              ╲       Raio: 160 mm
      ┃                ┃
      ┃   ○ ⌀68mm     ┃      ← Câmera (aro 95mm, furo 68mm)
      ┃  (aro ⌀95mm)  ┃
      ┃  ┌──────────┐  ┃
      ┃  │  200mm   │  ┃
      ┃  │          │  ┃
      ┃  │ MONITOR  │  ┃  350mm  ← Tela VERTICAL
      ┃  │  TOUCH   │  ┃
      ┃  │          │  ┃
      ┃  └──────────┘  ┃
       ╲              ╱
        ╰━━━━━━━━━━━━╯

      |←── 320 mm ──→|
      ↕ 480 mm total
```

### Posições Y recalculadas (do chão):

| Componente             | Y (mm do chão)                              |
|------------------------|---------------------------------------------|
| Fundo da base          | 0                                           |
| Topo da base           | 60                                          |
| Base da coluna         | 60                                          |
| Topo da coluna         | 1120 (60 + 1060)                            |
| Base da cabeça         | 1100 (1120 - 20mm encaixe)                  |
| Topo da cabeça         | 1580 (1100 + 480)                           |
| **Altura total**       | **~1620 mm** ✓ (com arredondamentos)        |
| Centro do monitor      | ~1300 (estimado)                            |
| Centro da câmera       | ~1500 (estimado)                            |

---

## MOD 05 — Tela (detalhes adicionais)

| Item                   | V1 (nosso)     | PDF (oficial)    | Ação         |
|------------------------|----------------|------------------|--------------|
| Tamanho                | 15.6"          | **15.6"**        | OK ✓         |
| Área visível           | 200 × 350 mm   | **200 × 350 mm** | OK ✓         |
| Orientação             | Vertical       | **Vertical**     | OK ✓         |
| Rebaixo da tela        | —              | **4 mm**         | **NOVO**     |
| Recuo da tela          | —              | **2–3 mm**       | **NOVO**     |

### O que significa:
- **Rebaixo (4 mm):** O recorte no painel C1 tem um degrau/rebaixo de 4 mm de profundidade para a tela ficar embutida, não saliente.
- **Recuo (2–3 mm):** A tela fica 2–3 mm recuada da superfície frontal, criando uma sombra sutil.

### Impacto na peça C1:
O recorte do monitor em C1 precisa de **fresagem em 2 níveis**:
1. Recorte passante (furo completo): **200 × 350 mm** (tamanho da área visível)
2. Rebaixo ao redor: **210 × 360 mm** × 4 mm de profundidade (para apoiar a moldura do monitor)

---

## MOD 06 — Câmera (modelo e medidas)

| Item                   | V1 (nosso)           | PDF (oficial)              | Ação         |
|------------------------|----------------------|----------------------------|--------------|
| Modelo                 | Genérico             | **Canon EOS Rebel T7**     | **CORRIGIR** |
| Lente                  | Genérico             | **Canon EF-S 18–55mm IS** | **CORRIGIR** |
| Furo da lente          | ⌀ 60 mm             | **⌀ 68 mm**               | **CORRIGIR** |
| Aro frontal            | —                    | **⌀ 95 mm**               | **NOVO**     |
| Profundidade rebaixo aro | —                  | **8 mm**                   | **NOVO**     |

### O que significa:
- O furo passante em C1 é de **⌀ 68 mm** (para a lente)
- Ao redor do furo, há um **rebaixo circular ⌀ 95 mm × 8 mm** de profundidade (para o aro decorativo/protetor da câmera, que fica embutido)

### Impacto na peça C1:
Fresar em C1 na zona da câmera:
1. Furo passante: **⌀ 68 mm**
2. Rebaixo circular: **⌀ 95 mm × 8 mm** de profundidade (concêntrico ao furo)

---

## MOD 07 — LED Perimetral

| Item                   | V1 (nosso)     | PDF (oficial)    | Ação         |
|------------------------|----------------|------------------|--------------|
| Tipo                   | COB            | **COB**          | OK ✓         |
| Temperatura            | 3000K          | **3000K**        | OK ✓         |
| Canal do LED           | 10 mm          | **10 mm**        | OK ✓         |
| Profundidade do canal  | 8 mm           | **8 mm**         | OK ✓         |
| Distância da borda     | 5 mm           | **18 mm**        | **CORRIGIR** |

### Impacto crítico na peça C1:

O canal LED fica a **18 mm da borda externa**, não 5 mm como estimamos. Isso muda significativamente o visual — o LED fica mais para dentro, criando uma moldura mais larga.

```
  Corte transversal da borda de C1 (18mm espessura):

  Borda externa
  │←18mm→│←10mm→│  restante...
  │MOLDURA│ CANAL│
  │       │ LED  │
  │       │ 8mm  │
  │       │prof. │
  ├───────┼──────┤
          18mm total espessura MDF

  * O canal é fresado pela TRASEIRA (face interna),
    deixando 10mm de MDF como fundo + difusor
```

**Recálculo:** Com 18mm de distância da borda, o perímetro do canal LED é menor que o perímetro externo. O canal segue uma forma stadium interna de ~(320 - 2×18) × (480 - 2×18) = **284 × 444 mm**, raio interno ~142 mm.

Perímetro do canal LED: 2 × (π × 142) + 2 × (444 - 2×142) = **~1053 mm**

---

## MOD 08 — Módulo Impressora (todas as dimensões)

| Item                       | V1 (nosso)     | PDF (oficial)    | Ação         |
|----------------------------|----------------|------------------|--------------|
| **Altura total**           | 800 mm         | **920 mm**       | **CORRIGIR** |
| **Base largura**           | ⌀ 300 mm       | **350 × 350 mm** | **CORRIGIR → QUADRADA** |
| **Base espessura**         | 40 mm          | **60 mm**        | **CORRIGIR** |
| **Coluna altura**          | 400 mm         | **610 mm**       | **CORRIGIR** |
| **Coluna seção**           | 100 × 80 mm    | **120 × 120 mm** | **CORRIGIR** |
| **Caixa altura**           | 320 mm         | **250 mm**       | **CORRIGIR** |
| **Caixa largura**          | 320 mm         | **320 mm**       | OK ✓         |
| **Caixa profundidade**     | 250 mm         | **400 mm**       | **CORRIGIR** |

### Verificação de altura: 60 + 610 + 250 = **920 mm** ✓

### Impacto — a caixa é muito mais PROFUNDA (400 mm!)

A impressora ASK-400 é um equipamento grande. A caixa com 400 mm de profundidade faz sentido para acomodá-la com folga para manutenção frontal.

### Novas peças do módulo impressora:

| Código | Peça                      | Material    | Dimensões V2 (mm)                        | Qtd |
|--------|---------------------------|-------------|------------------------------------------|-----|
| D1     | Tampo base                | MDF 18 mm   | 350 × 350, cantos R80, furo 120×120      | 1   |
| D2     | Fundo base                | MDF 18 mm   | 350 × 350, cantos R80, furo cabo ⌀25     | 1   |
| D3     | Paredes laterais base     | MDF 15 mm   | 4 réguas, altura 24 mm                    | 4   |
| E1     | Frontal coluna (+LED)     | MDF 15 mm   | 120 × 610                                 | 1   |
| E1-L   | Lâmina frontal coluna     | Lâmina      | 120 × 610                                 | 1   |
| E2     | Traseiro coluna           | MDF 15 mm   | 120 × 610                                 | 1   |
| E3     | Laterais coluna (×2)      | MDF 15 mm   | 90 × 610 (120-15-15=90)                   | 2   |
| F1     | Frontal caixa (+slot)     | MDF 18 mm   | 320 × 250, cantos R40                     | 1   |
| F1-L   | Lâmina frontal caixa      | Lâmina      | 320 × 250                                 | 1   |
| F2     | Traseiro caixa            | MDF 15 mm   | 320 × 250, cantos R40                     | 1   |
| F3     | Laterais caixa (×2)       | MDF 15 mm   | 364 × 250 (400-18-18=364)                 | 2   |
| F4     | Topo caixa                | MDF 15 mm   | 284 × 364                                  | 1   |
| F5     | Fundo caixa               | MDF 15 mm   | 284 × 364, furo 120×120                    | 1   |

---

## MOD 09 — Impressora (modelo específico)

| Item                   | V1 (nosso)     | PDF (oficial)              |
|------------------------|----------------|----------------------------|
| Modelo                 | Genérico       | **ASK-400**                |
| Tipo                   | —              | **Fotográfica profissional** |
| Manutenção             | Traseira       | **Frontal**                |

### Impacto:
A manutenção é **FRONTAL**, não traseira. Isso significa que a porta de acesso principal da caixa da impressora deve ser na frente (peça F1), não atrás.

---

## MOD 10 — Portas Técnicas (NOVO)

Informação que não existia nos documentos anteriores:

| Porta                           | Dimensões (mm)  | Sistema             |
|---------------------------------|-----------------|---------------------|
| Traseira módulo superior (C2)   | 260 × 400       | Magnético + fechadura |
| Frontal impressora (F1)         | 280 × 220       | Magnético + fechadura |
| Traseira impressora (F2)        | 240 × 280       | Magnético + fechadura |

### Impacto:
- **C2** não é mais "removível com parafusos" — usa **imãs + fechadura**. Mais prático para manutenção em campo.
- **F1** precisa de uma **porta frontal** (280 × 220 mm) com dobradiça magnética. A porta pode ser uma seção recortada do próprio painel F1, com dobradiça oculta.
- **F2** precisa de uma **porta traseira** (240 × 280 mm) igualmente magnética.

### Material adicional necessário:

| Item                                  | Qtd    |
|---------------------------------------|--------|
| Imã neodímio ⌀ 10 × 3 mm             | 16     |
| Fechadura tipo push-lock ou trava     | 3      |
| Dobradiça oculta (piano ou embutida)  | 6      |

---

## MOD 11 — Estrutura Tubular (NOVO)

O PDF menciona:

| Item                   | Especificação        |
|------------------------|----------------------|
| Estrutura tubular      | **20 × 20 mm**       |

### O que isso significa:
O totem usa **tubo de aço/alumínio 20 × 20 mm** como esqueleto estrutural interno, especialmente na coluna. Isso explica por que o espaço interno útil da coluna é de apenas 60 × 60 mm mesmo com dimensões externas maiores — o tubo ocupa espaço.

### Impacto:
- A coluna NÃO é feita apenas de painéis MDF colados. Há um **esqueleto tubular interno** que dá rigidez.
- Os painéis de MDF (B1, B2, B3) são **revestimento** ao redor do tubo.
- O tubo provavelmente vai da base até a cabeça, servindo como eixo estrutural.

### Material adicional:

| Item                                    | Dimensões                | Qtd |
|-----------------------------------------|--------------------------|-----|
| Tubo metálico quadrado 20 × 20 mm      | Comprimento ~1600 mm     | 2   |
| Tubo metálico quadrado 20 × 20 mm      | Comprimento ~850 mm      | 2   |
| Cantoneira/suporte para fixar tubo      | —                        | 8   |
| Parafuso auto-atarraxante p/ metal      | 4.2 × 13 mm             | 20  |

**Nota:** Os tubos do módulo principal correm da base até dentro da cabeça. Os do módulo impressora correm da base até dentro da caixa.

---

## MOD 12 — Peso Estimado (NOVO)

| Módulo            | Peso estimado   |
|-------------------|-----------------|
| Totem principal   | **25–30 kg**    |
| Módulo impressora | **12–15 kg**    |

Isso confirma que a estrutura é robusta. Os 25-30 kg incluem: MDF + tubos metálicos + contrapeso + eletrônicos.

---

## MOD 13 — Tabela Consolidada de Peças V2

### Módulo Principal

| Código | Peça                           | Material       | Dimensões V2 (mm)                    | Qtd |
|--------|--------------------------------|----------------|--------------------------------------|-----|
| A1     | Tampo base                     | MDF 18 mm      | 400 × 400, cantos R80, furo 120×130  | 1   |
| A2     | Fundo base                     | MDF 18 mm      | 400 × 400, cantos R80, furo ⌀25      | 1   |
| A3a    | Paredes laterais base (longas) | MDF 15 mm      | 370 × 24                              | 2   |
| A3b    | Paredes laterais base (curtas) | MDF 15 mm      | 340 × 24                              | 2   |
| B1     | Frontal coluna (+canaleta LED) | MDF 15 mm      | 120 × 1060                            | 1   |
| B1-L   | Lâmina madeira frontal coluna  | Lâmina 0.6 mm  | 120 × 1060                            | 1   |
| B2     | Traseiro coluna (removível)    | MDF 15 mm      | 120 × 1060                            | 1   |
| B3     | Laterais coluna (×2)           | MDF 15 mm      | 100 × 1060                            | 2   |
| C1     | Frontal cabeça (stadium)       | MDF 18 mm      | 320 × 480, R160, furos+canal LED      | 1   |
| C2     | Traseiro cabeça (porta magnética) | MDF 15 mm   | 260 × 400 (porta) ou 320 × 480 (total) | 1   |
| C3-P   | Pele lateral cabeça            | MDF flex 3-6mm | ~1296 × 180                            | 1   |
| H1-H5  | Hastes estruturais             | MDF 15 mm      | 144 × 40                              | 5   |
| C4     | Suporte interno monitor (×2)   | MDF 15 mm      | 220 × 20                              | 2   |
| C5     | Suporte interno câmera         | MDF 15 mm      | 160 × 80                              | 1   |
| T1     | Tubo estrutural coluna princ.  | Tubo 20×20 mm  | 1600 mm comprimento                   | 2   |

**Total módulo principal: 18 peças MDF + 1 lâmina + 2 tubos metálicos**

### Módulo Impressora

| Código | Peça                           | Material       | Dimensões V2 (mm)                    | Qtd |
|--------|--------------------------------|----------------|--------------------------------------|-----|
| D1     | Tampo base                     | MDF 18 mm      | 350 × 350, cantos R80, furo 120×120  | 1   |
| D2     | Fundo base                     | MDF 18 mm      | 350 × 350, cantos R80, furo ⌀25      | 1   |
| D3a    | Paredes laterais base (longas) | MDF 15 mm      | 320 × 24                              | 2   |
| D3b    | Paredes laterais base (curtas) | MDF 15 mm      | 290 × 24                              | 2   |
| E1     | Frontal coluna (+LED)          | MDF 15 mm      | 120 × 610                             | 1   |
| E1-L   | Lâmina frontal coluna          | Lâmina 0.6 mm  | 120 × 610                             | 1   |
| E2     | Traseiro coluna                | MDF 15 mm      | 120 × 610                             | 1   |
| E3     | Laterais coluna (×2)           | MDF 15 mm      | 90 × 610                              | 2   |
| F1     | Frontal caixa (porta magnética + slot) | MDF 18 mm | 320 × 250, cantos R40               | 1   |
| F1-L   | Lâmina frontal caixa           | Lâmina 0.6 mm  | 320 × 250                             | 1   |
| F2     | Traseiro caixa (porta magnética) | MDF 15 mm    | 320 × 250, cantos R40                 | 1   |
| F3     | Laterais caixa (×2)            | MDF 15 mm      | 364 × 250                             | 2   |
| F4     | Topo caixa                     | MDF 15 mm      | 284 × 364                             | 1   |
| F5     | Fundo caixa                    | MDF 15 mm      | 284 × 364, furo 120×120               | 1   |
| T2     | Tubo estrutural coluna impr.   | Tubo 20×20 mm  | 850 mm comprimento                    | 2   |

**Total módulo impressora: 16 peças MDF + 2 lâminas + 2 tubos metálicos**

---

## MOD 14 — Recálculo de Materiais (m²)

### MDF 18 mm

| Peça   | Dimensões brutas (mm)  | Área (m²)  | Qtd | Total (m²) |
|--------|------------------------|------------|-----|------------|
| A1     | 400 × 400              | 0.160      | 1   | 0.160      |
| A2     | 400 × 400              | 0.160      | 1   | 0.160      |
| C1     | 320 × 480              | 0.154      | 1   | 0.154      |
| D1     | 350 × 350              | 0.123      | 1   | 0.123      |
| D2     | 350 × 350              | 0.123      | 1   | 0.123      |
| F1     | 320 × 250              | 0.080      | 1   | 0.080      |
| **Subtotal MDF 18mm**  |            |     | **0.800 m²** |

### MDF 15 mm

| Peça    | Dimensões brutas (mm) | Área (m²)  | Qtd | Total (m²) |
|---------|-----------------------|------------|-----|------------|
| A3a     | 370 × 24              | 0.009      | 2   | 0.018      |
| A3b     | 340 × 24              | 0.008      | 2   | 0.016      |
| B1      | 120 × 1060            | 0.127      | 1   | 0.127      |
| B2      | 120 × 1060            | 0.127      | 1   | 0.127      |
| B3      | 100 × 1060            | 0.106      | 2   | 0.212      |
| C2      | 320 × 480             | 0.154      | 1   | 0.154      |
| C4      | 220 × 20              | 0.004      | 2   | 0.009      |
| C5      | 160 × 80              | 0.013      | 1   | 0.013      |
| H1-H5   | 144 × 40              | 0.006      | 5   | 0.029      |
| D3a     | 320 × 24              | 0.008      | 2   | 0.015      |
| D3b     | 290 × 24              | 0.007      | 2   | 0.014      |
| E1      | 120 × 610             | 0.073      | 1   | 0.073      |
| E2      | 120 × 610             | 0.073      | 1   | 0.073      |
| E3      | 90 × 610              | 0.055      | 2   | 0.110      |
| F2      | 320 × 250             | 0.080      | 1   | 0.080      |
| F3      | 364 × 250             | 0.091      | 2   | 0.182      |
| F4      | 284 × 364             | 0.103      | 1   | 0.103      |
| F5      | 284 × 364             | 0.103      | 1   | 0.103      |
| **Subtotal MDF 15mm** |             |     | **1.458 m²** |

### MDF Flexível 3-6 mm

| Peça   | Dimensões brutas (mm)  | Área (m²)  | Qtd | Total (m²) |
|--------|------------------------|------------|-----|------------|
| C3-P   | 1300 × 180             | 0.234      | 1   | 0.234      |
| **Subtotal MDF flex**  |            |     | **0.234 m²** |

### Lâmina de Madeira (Carvalho/Freijó 0.6 mm)

| Peça   | Dimensões (mm)         | Área (m²)  | Qtd | Total (m²) |
|--------|------------------------|------------|-----|------------|
| B1-L   | 120 × 1060             | 0.127      | 1   | 0.127      |
| E1-L   | 120 × 610              | 0.073      | 1   | 0.073      |
| F1-L   | 320 × 250              | 0.080      | 1   | 0.080      |
| **Subtotal lâmina**    |            |     | **0.280 m²** |

### Tubo Metálico 20 × 20 mm

| Peça   | Comprimento | Qtd | Total (m) |
|--------|-------------|-----|-----------|
| T1     | 1600 mm     | 2   | 3.20 m    |
| T2     | 850 mm      | 2   | 1.70 m    |
| **Total tubo**        |     | **4.90 m** |

---

### RESUMO FINAL DE COMPRAS V2

```
┌──────────────────────────────────────────────────────┐
│            LISTA DE COMPRA — VERSÃO FINAL            │
├──────────────────────────────────────────────────────┤
│                                                      │
│  CHAPAS MDF:                                         │
│  1× Chapa MDF 18 mm (2750 × 1830)  →  usa 0.92 m²  │
│  1× Chapa MDF 15 mm (2750 × 1830)  →  usa 1.68 m²  │
│  1× Chapa MDF Flex 3-6mm (2750×1220) → usa 0.27 m²  │
│                                                      │
│  LÂMINA:                                             │
│  0.32 m² Lâmina de Carvalho/Freijó                  │
│                                                      │
│  TUBO METÁLICO:                                      │
│  5 metros de tubo quadrado 20 × 20 mm               │
│                                                      │
│  FERRAGENS EXTRAS (ver MOD 10):                      │
│  16× Imã neodímio ⌀10×3mm                           │
│  3× Fechadura push-lock                              │
│  6× Dobradiça oculta                                 │
│                                                      │
│  CONTAGEM DE PEÇAS:                                  │
│  Módulo principal: 18 peças MDF + 1 lâmina + 2 tubos│
│  Módulo impressora: 16 peças MDF + 2 lâminas + 2 tubos│
│  TOTAL: 34 peças MDF + 3 lâminas + 4 tubos          │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

> **Este documento substitui as Modificações V1.**
> Todas as medidas agora refletem a Ficha Técnica AURA Totem V4 (PDF oficial).
> Próximo passo: consolidar tudo num documento final único de planta de corte + montagem.
