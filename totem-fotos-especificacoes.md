# 🖼️ TOTEM DE FOTOS — Especificações Técnicas do Projeto

---

## 1. Visão Geral

| Item               | Valor                          |
|--------------------|--------------------------------|
| **Tipo**           | Totem de chão (corpo inteiro)  |
| **Altura total**   | 1600 mm (160 cm do chão até o topo) |
| **Módulo principal** | Corpo do totem (foco deste documento) |
| **Módulo secundário** | Encaixe para impressora (será definido depois) |

---

## 2. Componentes Internos

### 2.1 Monitor Touch 15.6"

| Especificação        | Valor                          |
|----------------------|--------------------------------|
| **Diagonal da tela** | 15.6" (396 mm)                |
| **Área visível aprox.** | 345 mm (L) × 194 mm (A)   |
| **Recorte no painel frontal** | 350 mm (L) × 200 mm (A) — com 2.5 mm de folga por lado |
| **Profundidade média** | 25–40 mm (depende do modelo) |
| **Posição sugerida**  | Centralizado horizontalmente, centro vertical a ~1200 mm do chão (ergonomia de uso em pé) |
| **Inclinação sugerida** | 10°–15° para trás (melhor visibilidade e toque) |

### 2.2 Mini PC

| Especificação        | Valor                          |
|----------------------|--------------------------------|
| **Dimensões típicas** | 130 mm (L) × 130 mm (P) × 50 mm (A) |
| **Fixação**           | Suporte VESA 75/100 ou prateleira interna |
| **Posição sugerida**  | Zona traseira interna, abaixo do monitor |
| **Ventilação**        | Prever aberturas/grelhas na parte traseira (mín. 80 × 40 mm) |
| **Alimentação**       | Fonte externa — prever passagem de cabo |

### 2.3 Câmera Fotográfica Profissional

| Especificação        | Valor                          |
|----------------------|--------------------------------|
| **Espaço reservado (corpo)** | 150 mm (L) × 120 mm (P) × 100 mm (A) |
| **Posição sugerida**  | Acima do monitor, centralizada |
| **Centro da lente**   | ~1350–1400 mm do chão |
| **Abertura no painel** | Furo circular ⌀ 80 mm (para a lente) |
| **Fixação**           | Parafuso 1/4" (padrão tripé) em suporte interno |
| **Conexão**           | USB para o Mini PC (tethering) |

---

## 3. Dimensões Externas do Corpo Principal

```
            ┌──────────────┐
            │   400 mm     │  ← Largura
            │              │
    1600 mm │   FRONTAL    │
            │              │
            │              │
            └──────────────┘
                 │
             Profundidade: 350 mm
```

| Dimensão           | Valor     | Observação                        |
|---------------------|-----------|-----------------------------------|
| **Altura total**    | 1600 mm   | Do chão ao topo                   |
| **Largura**         | 400 mm    | Suficiente para monitor 15.6" + margens |
| **Profundidade**    | 350 mm    | Espaço para câmera + mini PC + cabeamento |
| **Espessura painel**| 18 mm     | MDF 18mm (padrão para estrutura)  |

---

## 4. Layout Frontal (Vista Frontal)

Medidas de **baixo para cima** (Y = 0 no chão):

| Zona                  | Y inicial | Y final | Altura da zona | Largura | Descrição |
|-----------------------|-----------|---------|-----------------|---------|-----------|
| **Base / Pé**         | 0 mm      | 100 mm  | 100 mm          | 400 mm  | Base de apoio (pode ser mais larga: 450–500 mm para estabilidade) |
| **Corpo inferior**    | 100 mm    | 1050 mm | 950 mm          | 400 mm  | Área fechada — espaço para cabeamento, fonte, futuro módulo impressora |
| **Zona do Monitor**   | 1050 mm   | 1300 mm | 250 mm          | 400 mm  | Recorte para monitor touch 15.6" |
| **Zona da Câmera**    | 1300 mm   | 1500 mm | 200 mm          | 400 mm  | Furo para lente + espaço interno para corpo da câmera |
| **Topo / Acabamento** | 1500 mm   | 1600 mm | 100 mm          | 400 mm  | Fechamento superior + possível iluminação LED |

---

## 5. Layout Lateral (Vista Lateral)

```
  Frente ←───── 350mm ─────→ Trás

  ┌─────────────────────────────┐ 1600mm
  │          TOPO               │
  ├─────────────────────────────┤ 1500mm
  │    [CÂMERA]                 │
  ├─────────────────────────────┤ 1300mm
  │   [MONITOR 10°~15°]  ╲     │
  ├─────────────────────────────┤ 1050mm
  │                             │
  │   Espaço interno            │
  │   [Mini PC - fixo atrás]    │
  │   [Cabeamento]              │
  │   [Fontes]                  │
  │                             │
  ├─────────────────────────────┤ 100mm
  │         BASE                │
  └─────────────────────────────┘ 0mm
```

---

## 6. Vista Superior

```
        ┌──────── 400mm ────────┐
        │                       │
 350mm  │   ● Lente (centro)    │
        │                       │
        └───────────────────────┘
```

---

## 7. Aberturas e Recortes

| Abertura               | Posição                  | Dimensões            | Formato    |
|------------------------|--------------------------|----------------------|------------|
| **Recorte do monitor** | Frontal, centro Y=1175mm | 350 × 200 mm        | Retangular |
| **Furo da lente**      | Frontal, centro Y=1400mm | ⌀ 80 mm             | Circular   |
| **Grelha ventilação**  | Traseira, Y=700–800mm    | 80 × 40 mm (×2)     | Grade      |
| **Passagem de cabos**  | Traseira, Y=50mm         | 60 × 30 mm          | Retangular |
| **Porta de acesso**    | Traseira (porta inteira) | 900 × 340 mm        | Porta com dobradiça |

---

## 8. Base de Estabilidade

| Especificação        | Valor                          |
|----------------------|--------------------------------|
| **Largura da base**  | 450–500 mm (maior que o corpo) |
| **Profundidade base** | 400–450 mm                    |
| **Altura da base**   | 100 mm                         |
| **Material**         | MDF 18mm ou metalon            |
| **Pés reguláveis**   | 4 unidades (nivelamento)       |
| **Peso recomendado** | Adicionar contrapeso se necessário (2–5 kg na base) |

---

## 9. Estrutura para Projeto HTML

Abaixo estão as variáveis e coordenadas-chave para renderizar as vistas no HTML:

### 9.1 Constantes Globais

```javascript
const TOTEM = {
  // Dimensões externas (mm)
  altura: 1600,
  largura: 400,
  profundidade: 350,
  espessura_painel: 18,

  // Base
  base: {
    largura: 500,
    profundidade: 450,
    altura: 100
  },

  // Monitor 15.6"
  monitor: {
    largura_recorte: 350,
    altura_recorte: 200,
    centro_x: 200,   // metade da largura
    centro_y: 1175,   // centro vertical do recorte
    inclinacao_graus: 12,
    profundidade_modulo: 40
  },

  // Câmera
  camera: {
    furo_diametro: 80,
    centro_x: 200,
    centro_y: 1400,
    espaco_interno: { l: 150, p: 120, a: 100 }
  },

  // Mini PC
  mini_pc: {
    largura: 130,
    profundidade: 130,
    altura: 50,
    posicao_y: 800  // centro, fixo na traseira
  },

  // Ventilação
  ventilacao: [
    { x: 160, y: 750, l: 80, a: 40 },  // grelha 1
    { x: 160, y: 700, l: 80, a: 40 }   // grelha 2
  ],

  // Passagem de cabos
  passagem_cabos: { x: 170, y: 50, l: 60, a: 30 },

  // Porta traseira
  porta_acesso: {
    y_inicio: 100,
    largura: 340,
    altura: 900
  }
};
```

### 9.2 Escala para Renderização

```javascript
// Para renderizar em tela, use um fator de escala:
// Exemplo: escala 0.4 → 1600mm vira 640px na tela
const ESCALA = 0.4; // px por mm

function mm2px(mm) {
  return mm * ESCALA;
}
```

### 9.3 Vistas a Implementar

| Vista      | Mostra                                     | Canvas sugerido (px, escala 0.4) |
|------------|---------------------------------------------|----------------------------------|
| **Frontal** | Largura × Altura + recortes (monitor, lente) | 200 × 640 |
| **Lateral** | Profundidade × Altura + posições internas    | 140 × 640 |
| **Superior** | Largura × Profundidade + posição da lente   | 200 × 140 |

### 9.4 Cores Sugeridas para o Desenho Técnico

```css
:root {
  --cor-estrutura: #2c3e50;     /* corpo do totem */
  --cor-recorte: #3498db;       /* aberturas/recortes */
  --cor-componente: #e74c3c;    /* componentes internos */
  --cor-cota: #7f8c8d;          /* linhas de cota */
  --cor-texto: #ecf0f1;         /* texto sobre fundo escuro */
  --cor-fundo: #f8f9fa;         /* fundo do canvas */
  --cor-grade: #dee2e6;         /* grid de referência */
}
```

---

## 10. Checklist de Montagem

- [ ] Cortar painéis MDF 18mm conforme dimensões
- [ ] Fazer recorte frontal do monitor (350 × 200 mm)
- [ ] Fazer furo frontal da lente (⌀ 80 mm)
- [ ] Fazer grelhas de ventilação na traseira
- [ ] Montar base com pés reguláveis
- [ ] Instalar suporte VESA para mini PC
- [ ] Instalar suporte com parafuso 1/4" para câmera
- [ ] Instalar monitor com inclinação de 12°
- [ ] Passar cabeamento (USB, energia, vídeo)
- [ ] Fechar porta traseira com dobradiça
- [ ] Testar estabilidade e nivelamento
- [ ] Acabamento (pintura/adesivagem)

---

## 11. Próximos Passos

- **Módulo da impressora**: Definir modelo → dimensionar encaixe inferior ou lateral
- **Iluminação**: Ring light ou LED strip no topo para iluminação do rosto
- **Software**: Interface de captura + impressão (app HTML/JS ou Python)

---

> **Documento gerado para servir de base ao projeto HTML interativo do totem.**
> Todas as medidas em milímetros (mm) salvo indicação contrária.
