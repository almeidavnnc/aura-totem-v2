# 🔧 MODIFICAÇÕES V3 — Totem de Fotos AURA

> **STATUS: PROPOSTA PARA VALIDAÇÃO** — nada foi implementado no código ainda.
> Atualizado com as decisões do cliente (pontos 1–5) + análise das impressoras (ponto 6).
> Depois da sua confirmação do MOD 04, implementamos no `totem.js` (peças +
> plantas) e no `totem-3d.js` (modelo 3D).

---

## RESUMO DAS MUDANÇAS

| #  | Mudança                                              | Onde                        | Tipo        |
|----|-----------------------------------------------------|-----------------------------|-------------|
| 01 | **3º "C": painel ESTRUTURAL** + porta traseira na cabeça | Cabeça do totem         | ESTRUTURAL  |
| 02 | **Modularização em 3** (cabeça · corpo · base)       | Totem **e** impressora      | MONTAGEM    |
| 03 | **"F" ESTRUTURAL**: caixa da impressora abre pela frente | Caixa da impressora      | ESTRUTURAL  |
| 04 | **Impressora DNP DS620A / Fujifilm ASK-400**         | Caixa da impressora         | DIMENSIONAL |

**Princípio comum:** separar a **"casca/acabamento"** da **"estrutura que
sustenta + abre para manutenção"**, e garantir um **duto vertical contínuo de
cabos** escondido do chão até a cabeça.

---

# MOD 01 — O 3º "C": Estrutural + porta traseira ✅ DEFINIDO

## Decisões do cliente aplicadas
- **Câmera e tela ficam FIXAS no C1** (frontal não abre — mantém enquadramento).
- A **porta é a traseira**, abre **por trás** com dobradiça.
- O **Mini PC fica montado na porta traseira** (sai junto quando abre).

## Os TRÊS "C" (frente → trás)

```
   FRENTE (fixa)                                   TRÁS (abre)
   ┌──────┐        ┌────────────┐        ┌──────┐
   │  C1  │========│     CE     │hinge((((│  C2  │
   │FRONTAL│ fixo  │ ESTRUTURAL │        │TRASEIRO│
   │ FIXO │        │  (quadro   │  trava │ PORTA │
   │câmera│        │   vazado,  │        │MiniPC │
   │ +tela│        │  fixo col.)│        │ abre↺ │
   └──────┘        └────────────┘        └──────┘
   não abre         OSSO da cabeça,       gira p/ trás,
   câmera+tela+LED  fixa na coluna        leva o Mini PC
```

| Código | Peça                    | Material   | Era      | Função                                                   |
|--------|-------------------------|------------|----------|----------------------------------------------------------|
| **C1** | Frontal (FIXO)          | MDF 18 mm  | C1 (igual) | Câmera + tela + LED perimetral. **Não abre** — mantém o enquadramento da câmera |
| **CE** ⭐NOVO | **Estrutural** (quadro vazado) | MDF 18 mm | — | **Osso** da cabeça. Stadium 340×600 vazado (janela ~260×520, caixilho 40 mm). Fixa na coluna (flange G3), segura o C1 na frente e recebe a dobradiça da porta traseira |
| **C2** | Traseiro / **Porta** (basculante) | MDF 15 mm | C2 (vira porta) | Abre **por trás** numa dobradiça lateral fixada no CE. **Mini PC montado nela** |

⭐ = peça nova (CE). O **C1 e o C2 mantêm os nomes**; o que entra é o **CE
estrutural** no meio, exatamente "entre o C2 e a estrutura que prende o C1".

### Por que o CE é um QUADRO VAZADO
- Caixilho stadium de **40 mm** de borda, janela interna ~260×520 vazada.
- Dá rigidez e oferece superfície para:
  - parafusar o **C1** na frente (fixo);
  - parafusar a **dobradiça** da porta traseira C2 (borda lateral);
  - parafusar a **trava/fecho** da porta C2 (borda oposta);
  - fixar a cabeça no **flange da coluna** (G3 — ver MOD 02).
- A janela vazada deixa o **corpo da câmera (75 mm, no C1)** projetar para trás
  e o **chicote de cabos** atravessar até o Mini PC na porta.

### Como abre (manutenção pela traseira)
1. Solta a trava → o **C2 (porta traseira)** gira ~95° numa dobradiça lateral
   fixada no CE.
2. O **Mini PC sai junto** com a porta (acesso fácil a HDMI/USB/força).
3. Pela abertura traseira você acessa as costas da câmera, a fixação 1/4", as
   costas do monitor e todo o chicote — **sem desmontar a cabeça da coluna**.
4. O **C1 frontal permanece intacto** → a câmera **não desregula**.

### Orçamento de profundidade (cabeça = 180 mm)

| Camada (frente → trás)                       | Profundidade | z aprox. (centro = 0) |
|----------------------------------------------|--------------|-----------------------|
| C1 frontal (FIXO) — câmera + tela            | 18 mm        | +90 … +72             |
| Cavidade interna: corpo câmera (75) / monitor (28) + hastes | ~129 mm | +72 … −57 |
| **CE estrutural** (caixilho 40 mm) — na TRASEIRA, encostado no C2 | 18 mm | −57 … −75 |
| C2 porta traseira (Mini PC montado nela)     | 15 mm        | −75 … −90             |

> **CE fica na traseira, colado ao C2.** A porta C2 prende no CE pelas
> dobradiças; o Mini PC vai montado na porta. Ao abrir o C2, a janela vazada
> do CE dá acesso ao interior (câmera/monitor/cabos).

### Peças/ferragens novas — MOD 01
| Item                                          | Qtd | Obs                                    |
|-----------------------------------------------|-----|----------------------------------------|
| **CE** Estrutural stadium 340×600 R170, janela 260×520 | 1 | MDF 18 mm — peça nova            |
| Dobradiça (piano oculta ou 2× caneco)         | 1–2 | Na porta traseira C2 (~3 kg c/ Mini PC) |
| Fecho magnético + trava push                  | 1   | Lado oposto à dobradiça                 |
| Batente de borracha                           | 2   | Amortece o fechamento                   |

---

# MOD 02 — Modularização: Cabeça · Corpo · Base ✅ DEFINIDO

Totem **e** impressora se dividem em **3 módulos** que montam/desmontam:

```
   TOTEM                          IMPRESSORA
   ┌─────────┐ ← CABEÇA           ┌─────────┐ ← CAIXA
   └────┬────┘                    └────┬────┘
        │ flange G2/G3 (4× M6)         │ flange G2/G3
   ┌────┴────┐ ← CORPO            ┌────┴────┐ ← CORPO
   └────┬────┘                    └────┬────┘
        │ flange G1 (4× M6)            │ flange G1
   ┌────┴────┐ ← BASE             ┌────┴────┐ ← BASE
   └─────────┘                    └─────────┘
```

## 2.1 — Fixação entre módulos (flanges "G")
Cada junção usa uma **flange de união** em MDF com **insertos roscados M6** +
**parafuso-conector M6** (aperta e solta sem estragar a madeira).

| Código | Peça                      | Onde                | Material  | Função                                    |
|--------|---------------------------|---------------------|-----------|-------------------------------------------|
| **G1** | Flange base ↔ coluna      | Topo base / pé coluna | MDF 18 mm | Centra a coluna no soquete 120×130; 4× M6 |
| **G2** | Flange topo da coluna     | Topo coluna         | MDF 18 mm | Placa-tampa, furo cabo ⌀30, 4 insertos M6 |
| **G3** | Flange base cabeça/caixa  | Base cabeça/caixa   | MDF 18 mm | **Placa de transição** retângulo→stadium; casa com G2, 4× M6 |

> Ponto 3 confirmado: **G3 = placa de transição** (retângulo da coluna 120×130 →
> caixilho stadium da cabeça), parafusada com 4× M6.

## 2.2 — Duto de cabos contínuo (escondido)

```
  Corte vertical (esquemático)

  CABEÇA   ┌───────────────┐
           │ MiniPC ─┐     │
           │ câmera ─┤     │  chicote único (HDMI+USB+força)
           │ monitor─┘     │
  flange G3├───────╫───────┤  ← passa-cabo ⌀30 (grommet)
  flange G2│       ║       │
  CORPO    │  ┌────╫────┐  │  ← canal 60×60 interno da coluna (já existe)
           │  └────╫────┘  │
  flange G1├───────╫───────┤  ← soquete 120×130
  BASE     │   ────╨──→ ⌀25 saída traseira (A2/D2), rente ao chão
           └───────────────┘
```

- Coluna já tem **60×60 mm** vazios → vira o **duto vertical**.
- Cada flange tem **furo ⌀30 + grommet** alinhado ao canal.
- Sai pelo **⌀25 traseiro** da base, rente ao chão.
- **Folga de serviço:** ~150 mm de cabo extra por junta (abraçadeira).

### Ferragens — MOD 02 (cada módulo, ×2)
| Item                                  | Qtd | Obs                    |
|---------------------------------------|-----|------------------------|
| G1 / G2 / G3 (flanges)                | 3   | MDF 18 mm              |
| Inserto roscado M6                    | 12  | 4 × 3 juntas           |
| Parafuso-conector / minifix M6        | 12  | união aperta-solta     |
| Grommet borracha ⌀30                  | 3   | 1 por flange           |
| Abraçadeira passa-cabo                | 6   | folga de serviço       |

---

# MOD 03 — "F" ESTRUTURAL: impressora abre pela frente ✅ DEFINIDO

Mesma lógica do MOD 01, mas o painel **F1 inteiro** vira porta e gira num
quadro **FE** (F estrutural) fixo na caixa. Acesso frontal total à impressora.

| Código | Peça                    | Material  | Era       | Função                                              |
|--------|-------------------------|-----------|-----------|-----------------------------------------------------|
| **F1** | Frontal (porta cheia)   | MDF 18 mm | F1 (vira porta inteira) | Painel frontal abre todo numa dobradiça lateral. **Mantém o slot da foto** (ponto 4 confirmado) |
| **FE** ⭐NOVO | **F Estrutural** (quadro vazado) | MDF 18 mm | — | Quadro fixo na caixa, recebe a dobradiça do F1 e a trava |

> Ponto 4 confirmado: o **slot da foto continua no F1** (abre junto com a porta).

### Ferragens — MOD 03
| Item                          | Qtd | Obs               |
|-------------------------------|-----|-------------------|
| FE F Estrutural (quadro)      | 1   | MDF 18 mm         |
| Dobradiça (caneco/piano)      | 1–2 | Lado da porta F1  |
| Fecho magnético + trava       | 1   | Lado oposto       |

---

# MOD 04 — Impressora: DNP DS620A / Fujifilm ASK-400 ⚠️ PRECISA DECISÃO

## A boa notícia: é a MESMA impressora
A **Fujifilm ASK-400 é a DNP DS620A rebatizada** (mesma mecânica e carcaça).
Logo **um único projeto de caixa atende as duas** — **não precisa escolher**.

| Spec            | DNP DS620A  | Fujifilm ASK-400 | Usar no projeto |
|-----------------|-------------|------------------|-----------------|
| Largura (W)     | ~275 mm     | 275 mm           | **275 mm**      |
| Profundidade (D)| ~366 mm     | 366 mm           | **366 mm**      |
| Altura (H)      | ~170 mm     | 170 mm           | **170 mm**      |
| Peso            | ~12 kg      | ~12 kg           | **12 kg**       |

## O problema: a caixa atual NÃO comporta a impressora

Caixa V2 — **interior útil**: 284 (L) × 220 (A) × **364 (P)**.

| Eixo          | Impressora | Interior caixa V2 | Situação                          |
|---------------|------------|-------------------|-----------------------------------|
| Largura       | 275 mm     | 284 mm            | Cabe, mas **apertado** (4,5 mm/lado) |
| Altura        | 170 mm     | 220 mm            | OK (50 mm de sobra)               |
| **Profundidade** | 366 mm  | 364 mm            | **NÃO CABE** (falta 2 mm só no corpo) |

E tem um detalhe crítico das impressoras **dye-sub** (sublimação): durante a
impressão o **papel sai e volta pela TRASEIRA** várias vezes (uma passada por
cor + verniz). Ou seja, além do corpo de 366 mm é preciso **folga traseira**
para o papel transitar e para ventilação/calor.

## Proposta de correção da caixa

Aumentar a caixa para caber o corpo **+ folga traseira do papel + ventilação**:

| Dimensão caixa | V2 (atual) | **V3 (final)** | Por quê                                   |
|----------------|------------|----------------|-------------------------------------------|
| Largura        | 320 mm     | **360 mm**     | Interior ~324 → ~25 mm/lado p/ ar e cabos |
| Altura         | 250 mm     | **250 mm**     | OK, mantém                                |
| Profundidade   | 400 mm     | **420 mm**     | Interior ~384 = corpo 366 (~37 cm) + folga; traseira F2 ventilada dá saída ao papel |

Com isso a **traseira F2 fica removível e ventilada** (grelha), permitindo a
passada do papel e a dissipação de calor.

> **DECISÃO 6 — ✅ FINAL: 360 × 250 × 420 mm**
> O corpo da DS620A/ASK-400 tem **366 mm (~37 cm)** de profundidade. 420 mm dá
> a folga necessária com a traseira F2 ventilada — sem o exagero dos 560 mm.
> **Bônus:** 420 sobre base de 350 deixa só ~35 mm de balanço (a estabilidade
> deixa de ser problema).

---

## TABELA CONSOLIDADA — peças que mudam na V3

### Novas / renomeadas
| V2      | V3        | Observação                                |
|---------|-----------|-------------------------------------------|
| —       | **CE**    | NOVO: estrutural da cabeça (quadro vazado) |
| C2      | **C2**    | passa a ser a **porta traseira** (Mini PC) |
| F1      | **F1**    | vira **porta frontal inteira** (mantém slot) |
| —       | **FE**    | NOVO: estrutural da caixa                   |
| —       | **G1/G2/G3** | NOVO: flanges de união (×2 módulos)     |
| caixa   | **caixa** | redimensionada (ver MOD 04)                |

### Peças novas (resumo)
| Código | Peça                          | Material  | Dimensões (mm)              | Qtd | Módulo     |
|--------|-------------------------------|-----------|-----------------------------|-----|------------|
| CE     | Estrutural cabeça (vazado)    | MDF 18 mm | 340×600 R170, janela 260×520 | 1  | Totem      |
| G1     | Flange base↔coluna            | MDF 18 mm | ~140×150                    | 1   | Totem      |
| G2     | Flange topo coluna            | MDF 18 mm | ~140×150, furo ⌀30          | 1   | Totem      |
| G3     | Flange base cabeça (transição)| MDF 18 mm | retângulo→stadium, furo ⌀30 | 1   | Totem      |
| FE     | F Estrutural (vazado)         | MDF 18 mm | conforme caixa nova, janela vazada | 1 | Impressora |
| G1/G2/G3 | Flanges impressora          | MDF 18 mm | (versão menor)              | 3   | Impressora |

### Ferragens adicionais totais (V3)
| Item                    | Qtd | Para quê                       |
|-------------------------|-----|--------------------------------|
| Dobradiça oculta/caneco | 4–6 | C2 traseira + F1 frontal       |
| Fecho magnético + trava | 2   | C2 + F1                        |
| Inserto roscado M6      | 24  | 12 totem + 12 impressora       |
| Parafuso-conector M6    | 24  | uniões dos módulos             |
| Grommet borracha ⌀30    | 6   | passa-cabos das flanges        |
| Abraçadeira passa-cabo  | 12  | folga de serviço               |

---

## STATUS DAS DECISÕES

| # | Tema                              | Decisão                                                |
|---|-----------------------------------|--------------------------------------------------------|
| 1 | Câmera/tela                       | ✅ FIXAS no C1; Mini PC na porta traseira C2            |
| 2 | Como abre a cabeça                | ✅ Pela **traseira** (porta C2 com dobradiça)          |
| 3 | Flange coluna↔cabeça (G3)         | ✅ Placa de transição retângulo→stadium, 4× M6         |
| 4 | Slot da foto                      | ✅ Permanece no F1 (abre junto)                        |
| 5 | Caixilho dos quadros (CE/FE)      | ✅ 40 mm                                                |
| 6 | Tamanho da caixa da impressora    | ✅ Caixa **360 × 250 × 420 mm** (corpo 37 cm + folga, F2 ventilada) |

---

## PRÓXIMO PASSO
Você responde a **Decisão 6** → eu implemento:
- **`totem.js`**: peças CE, G1–G3, FE; caixa redimensionada; plantas de corte; m².
- **`totem-3d.js`**: cabeça com 3 painéis + **porta traseira animável** (Mini PC
  na porta), quadro vazado CE, porta frontal da impressora, flanges e duto de
  cabos visível no modo raio-X.

> Este documento **não substitui a V2** — é o caderno de mudanças por cima dela.
> Após aprovação total, vira a base do `planta-de-corte-e-montagem` atualizado.
