/* Configuração do site Dr. Viégas.
   Preencha os IDs abaixo. Campos vazios ficam desligados sem quebrar nada. */
window.VG_CONFIG = {
  // Google Tag Manager (recomendado: GA4, Google Ads e Meta Pixel configurados dentro dele)
  gtmId: "",              // ex.: "GTM-ABC1234"

  // Use só se NÃO for usar o GTM para estas tags:
  ga4Id: "",              // ex.: "G-XXXXXXXXXX"
  metaPixelId: "",        // ex.: "123456789012345"

  // URL do Apps Script publicado como app da Web (planilha de cliques e leads)
  sheetEndpoint: "",      // ex.: "https://script.google.com/macros/s/AKfy.../exec"

  // WhatsApp da clínica
  whatsapp: "5521968736185",
  whatsappMessage: "Olá! Vim pelo site do Dr. Viégas e gostaria de agendar uma consulta.",

  // E-mail que recebe as aplicações do Fellow (/fellow/aplicacao/)
  fellowEmail: "viegasplastica@gmail.com",

  // Tempo na página de obrigado antes de abrir o WhatsApp (ms)
  redirectDelayMs: 350
};
