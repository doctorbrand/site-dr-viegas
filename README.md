# Site Dr. Viégas · pacote de produção

Site estático, pronto para Vercel (ou qualquer hospedagem estática).

## Estrutura

- `index.html`: página principal, com SEO, Open Graph e dados estruturados (médico, site e FAQ).
- `obrigado/index.html`: página de obrigado. Registra o lead e abre o WhatsApp em 0,35 s. Não é indexada.
- `js/config.js`: **único arquivo a preencher** (IDs de GTM, GA4, Pixel e URL da planilha).
- `js/tracking.js`: rastreamento de todos os cliques, rolagem, UTMs e leads.
- `sitemap.xml`, `robots.txt`, `llms.txt`: buscas no Google e em assistentes de IA (ChatGPT, Perplexity, Claude, Gemini).
- `apps-script/Code.gs`: código que grava os cliques e leads na planilha.
- `vercel.json`: cache das imagens, URLs limpas e bloqueio de indexação do /obrigado.

## Como ativar

1. **Planilha.** Abra "Site Dr. Viégas · Cliques e leads" (Drive > Clientes > Diego Viégas) > Extensões > Apps Script. Cole `apps-script/Code.gs`, depois Implantar > Nova implantação > App da Web, executar como "Eu" e acesso "Qualquer pessoa". Copie a URL `/exec` para `sheetEndpoint` em `js/config.js`.
2. **Tags.** Coloque o ID do Google Tag Manager em `gtmId`. Dentro do GTM, configure GA4, Google Ads e Meta Pixel usando os eventos abaixo. Sem GTM, preencha `ga4Id` e `metaPixelId` que o script carrega direto.
3. **Publicação.** Suba a pasta na Vercel e aponte o domínio `www.drviegas.com.br`.
4. **Buscas.** No Google Search Console e no Bing Webmaster Tools, verifique o domínio e envie `https://www.drviegas.com.br/sitemap.xml`. O ChatGPT usa o índice do Bing, então o envio ao Bing é o que acelera a aparição no GPT.

## Eventos enviados ao dataLayer

| Evento | Quando | Campos |
| --- | --- | --- |
| `vg_click` | qualquer clique em link ou botão | `click_label`, `click_section`, `click_type`, `click_url` |
| `vg_scroll` | rolagem de 25, 50, 75 e 100% | `percent` |
| `generate_lead` | ao abrir /obrigado (antes do WhatsApp) | `lead_id`, `lead_origin`, `lead_channel`, `utm_source`, `utm_campaign` |

Use `generate_lead` como conversão no GA4 e no Google Ads, e como evento `Contact` ou `Lead` no Meta.

## Origem de cada botão de WhatsApp

`agende-1` (menu), `agende-2` (topo da página), `contato-marque-horario` (seção de contato), `whatsapp-flutuante` (botão fixo).

## O que vai para a planilha

- Aba **Cliques**: cada clique, com botão, seção, destino, dispositivo e origem da visita (UTMs, gclid, fbclid, primeira origem).
- Aba **Leads**: cada passagem pela página de obrigado, com o botão de origem e a campanha que trouxe a paciente.
