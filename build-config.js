// Gera assets/config.local.js a partir das variáveis de ambiente (usado no deploy da Vercel).
const fs = require('fs');
const env = process.env;
const faltando = ['CLOUDINARY_CLOUD_NAME','CLOUDINARY_UPLOAD_PRESET','JSONBIN_BIN_ID','JSONBIN_API_KEY','ADMIN_EMAIL','ADMIN_PASSWORD']
  .filter(k => !env[k]);
if (faltando.length) {
  console.error('Variáveis de ambiente faltando na Vercel: ' + faltando.join(', '));
  process.exit(1);
}
const js = `window.CLOUDINARY_CONFIG = ${JSON.stringify({ cloudName: env.CLOUDINARY_CLOUD_NAME, uploadPreset: env.CLOUDINARY_UPLOAD_PRESET })};
window.JSONBIN_CONFIG = ${JSON.stringify({ binId: env.JSONBIN_BIN_ID, apiKey: env.JSONBIN_API_KEY })};
window.ADMIN_CONFIG = ${JSON.stringify({ email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD })};
`;
fs.writeFileSync('assets/config.local.js', js);
console.log('assets/config.local.js gerado.');
