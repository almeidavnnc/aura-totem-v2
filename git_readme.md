# Git / GitHub Pages — Aura Totem

Repositório: https://github.com/almeidavnnc/aura-totem
Site publicado: https://almeidavnnc.github.io/aura-totem/

---

## Atualizar o site (uso frequente)

Sempre que mexer em `index.html`, `styles.css`, `totem.js`, `totem-3d.js` ou qualquer arquivo:

```powershell
git -C D:\claude\totem_ana add .
git -C D:\claude\totem_ana commit -m "descrição da mudança"
git -C D:\claude\totem_ana push
```

Em ~30 segundos o GitHub Pages atualiza automaticamente o site.

---

## Verificar estado antes de commitar

```powershell
git -C D:\claude\totem_ana status        # lista arquivos modificados
git -C D:\claude\totem_ana diff          # mostra o que mudou
git -C D:\claude\totem_ana log --oneline # histórico de commits
```

---

## Setup inicial (já feito — referência)

Foi executado uma única vez para criar tudo:

```powershell
# 1. Criar repo no site: https://github.com/new (público, sem README/gitignore/license)

# 2. Inicializar local + configurar usuário
git -C D:\claude\totem_ana init -b main
git -C D:\claude\totem_ana config user.name "almeidavnnc"
git -C D:\claude\totem_ana config user.email "almeidavnnc@gmail.com"

# 3. Primeiro commit
git -C D:\claude\totem_ana add .
git -C D:\claude\totem_ana commit -m "Initial commit: totem aura site"

# 4. Conectar ao repo remoto e enviar
git -C D:\claude\totem_ana remote add origin https://github.com/almeidavnnc/aura-totem.git
git -C D:\claude\totem_ana push -u origin main

# 5. Ativar GitHub Pages em:
#    https://github.com/almeidavnnc/aura-totem/settings/pages
#    Source: Deploy from a branch
#    Branch: main / (root)
#    Save
```

---

## Comandos úteis extras

### Desfazer alterações em arquivo (antes de commitar)
```powershell
git -C D:\claude\totem_ana restore <arquivo>
```

### Ver diferença de um arquivo específico
```powershell
git -C D:\claude\totem_ana diff index.html
```

### Trazer mudanças do GitHub pro local (se editar pelo site)
```powershell
git -C D:\claude\totem_ana pull
```

### Adicionar só um arquivo (em vez de tudo)
```powershell
git -C D:\claude\totem_ana add index.html
git -C D:\claude\totem_ana commit -m "ajuste no index"
git -C D:\claude\totem_ana push
```

---

## Arquivos ignorados (`.gitignore`)

Estes nunca são enviados pro GitHub:
- `.claude/` — configurações locais do Claude Code
- `*.log` — arquivos de log
- `.DS_Store`, `Thumbs.db` — lixo do SO

---

## Troubleshooting

**Push pede autenticação toda vez:**
O Git Credential Manager guarda o login após a primeira vez. Se ainda pedir, abre o "Gerenciador de Credenciais do Windows" e confere se tem entrada `git:https://github.com`.

**"rejected — non-fast-forward":**
Alguém (ou você pelo site) commitou direto no GitHub. Roda `git -C D:\claude\totem_ana pull` antes do push.

**Site não atualiza:**
- Confere em https://github.com/almeidavnnc/aura-totem/actions se o deploy do Pages rodou sem erro
- Pode levar até 2 minutos
- Limpa cache do navegador (Ctrl+F5)
