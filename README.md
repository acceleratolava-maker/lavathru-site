# Lava Thru — Site novo (2026)

Site institucional refeito do zero: moderno, interativo, premium e 100% fiel ao manual de marca
(Arquitetura de Marca DZ9 2024). Estático — HTML + CSS + JS puros, sem build, sem dependências.
Basta subir os arquivos em qualquer hospedagem.

## Páginas

| Arquivo | O que é |
|---|---|
| `index.html` | Home completa: hero interativo, como funciona, diferenciais, planos/preços, limpeza interna, sobre, franquia (teaser), contato + mapa |
| `franqueado.html` | Landing de expansão: por que investir, modelos LT Express × LT Master, jornada de abertura, CTAs |
| `termos.html` | Termos de Uso (conteúdo real do site original) |
| `privacidade.html` | Política de Privacidade (conteúdo real + direitos LGPD) |

## A marca em código

- **Catavento oficial em SVG vetorial** — geometria extraída diretamente do PDF do manual
  (não é imagem: escala perfeita em qualquer tamanho). Definido uma vez em cada página
  (`<g id="pw">`) e reutilizado via `<use href="#pw">`.
- **Recolorir uma instância:** `style="--pw-o:#fff;--pw-n:#61B1DF"` no `<svg>` (gotas laranja / gotas azuis).
- **Interatividade do hero:** o catavento gira sozinho como a escova do túnel, acelera com o
  scroll, dispara no hover e solta bolhas de espuma no clique (`assets/js/main.js`).
- **Cores oficiais** (CSS variables em `assets/css/style.css`):
  laranja `#F54F03` · azul `#0D1D60` · celeste `#61B1DF`.
- **Tipografia:** Fredoka (display, rounded como as gotas) + Hanken Grotesk (texto), via Google Fonts.

## Onde editar os dados que mudam

| Dado | Onde |
|---|---|
| Preços dos planos | `index.html` — seção `#planos` (Essencial 39,90 · Premium 49,90 · Exclusiva 69,90 · Assinatura 199,90/mês — valores da API oficial em jul/2026) |
| Números da franquia | `franqueado.html` — seção `#modelos` |
| Horários / endereço / telefone | `index.html` (hero, `#contato`, footer, JSON-LD no `<head>`) e footers das demais páginas |
| Links de WhatsApp | busca global por `wa.me/5544991754488` (mensagem pré-preenchida no parâmetro `text=`) |
| Área do cliente | aponta para `https://www.lavathru.com.br/login` (sistema atual de compra/assinatura) |

## SEO / extras já inclusos

- Meta description + Open Graph (`og-image.jpg`) em todas as páginas.
- JSON-LD `AutoWash` (endereço, horários, telefone) na home — Google entende o negócio local.
- Favicon e ícones PWA (`favicon-64.png`, `icon-192.png`, `icon-512.png`) gerados do símbolo oficial.
- Fotos reais da unidade otimizadas (de ~16 MB para ~400 KB cada).
- `prefers-reduced-motion` respeitado (animações desligam para quem pede).

## Rodar localmente

Qualquer servidor estático serve. Ex.: `python -m http.server 8080` dentro desta pasta,
ou abrir pelo preview do JARVIS (config `lavathru-site` no `.claude/launch.json`).

---
⚡ Desenvolvido por **Raydix**.
