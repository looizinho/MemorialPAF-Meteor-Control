// Embute public/apple-touch-icon.png no <head> de client/main.html como URI data:.
// No iOS 27 a folha "Adicionar à Tela de Início" não busca o apple-touch-icon por
// URL e cai num bloco com a letra do nome; embutido, o ícone aparece.
// Rode de novo (npm run icone-ios) sempre que o PNG mudar.
const fs = require('fs');
const path = require('path');

const raiz = path.join(__dirname, '..');
const png = fs.readFileSync(path.join(raiz, 'public/apple-touch-icon.png'));
const html = path.join(raiz, 'client/main.html');

const link = `<link rel="apple-touch-icon" sizes="180x180" href="data:image/png;base64,${png.toString('base64')}">`;
const atual = fs.readFileSync(html, 'utf8');
const padrao = /<link rel="apple-touch-icon"[^>]*>/;

if (!padrao.test(atual)) {
  console.error('Link apple-touch-icon não encontrado em client/main.html');
  process.exit(1);
}

fs.writeFileSync(html, atual.replace(padrao, link));
console.log(`apple-touch-icon embutido (${png.length} bytes de PNG)`);
