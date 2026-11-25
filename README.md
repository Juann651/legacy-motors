# Legacy Motors

Site de catálogo de veículos para uma concessionária de Vila Velha - ES. O cliente navega pelos carros, filtra, favorita e fala com a loja direto pelo WhatsApp. A equipe gerencia o estoque por um painel administrativo.

Feito com **HTML, CSS e JavaScript puro**, sem framework e sem etapa de build para rodar localmente.

## Funcionalidades

**Site público**
- Catálogo de veículos com foto, preço, ano, quilometragem, câmbio e combustível
- Busca por texto e filtros por tipo (novo, seminovo, usado), marca, câmbio, combustível e faixa de preço
- Ordenação: mais recentes, menor/maior preço, ano mais novo e menor quilometragem
- Página de **favoritos** (salvos no navegador de cada visitante)
- Botões "Tenho interesse" e "Agendar visita" que abrem o WhatsApp com mensagem pronta citando o veículo
- Formulário de contato, mapa e links de redes sociais

**Painel admin (`/admin`)**
- Login por email e senha
- Cadastro, edição e exclusão de veículos
- Status do veículo: disponível, reservado ou vendido
- Upload de imagem direto para o Cloudinary (ou uso de uma URL de imagem)

## Tecnologias

- HTML5, CSS3 e JavaScript (ES6+)
- [JSONBin.io](https://jsonbin.io): "banco de dados" dos veículos, sincronizado entre dispositivos
- [Cloudinary](https://cloudinary.com): hospedagem das imagens (upload sem assinatura)
- [Vercel](https://vercel.com): hospedagem

## Estrutura

```
legacy-motors-main/
├── index.html            # página inicial / catálogo
├── favoritos.html        # veículos favoritados
├── admin/
│   ├── index.html        # painel administrativo
│   └── admin.js          # login e CRUD de veículos
├── assets/
│   ├── app.js            # renderização do catálogo, filtros e favoritos
│   ├── data.js           # acesso ao JSONBin, helpers e dados de exemplo
│   ├── style.css         # estilos
│   ├── config.js         # configuração pública (somente placeholders)
│   └── config.example.js # modelo de configuração
├── build-config.js       # gera assets/config.local.js a partir de variáveis de ambiente
└── vercel.json           # configuração de deploy na Vercel
```

## Configuração

As credenciais **não ficam no repositório**. O site lê as configurações de `window.CLOUDINARY_CONFIG`, `window.JSONBIN_CONFIG` e `window.ADMIN_CONFIG`, definidas em `assets/config.js` (placeholders) e sobrescritas por `assets/config.local.js` (ignorado pelo Git).

### 1. Crie os serviços
1. **JSONBin:** crie uma conta, um novo bin com o conteúdo `{"cars":[]}` e uma API Key (Account → API Keys). Anote o Bin ID.
2. **Cloudinary:** em Settings → Upload, crie um *Upload preset* com Signing Mode **Unsigned**. Anote o cloud name e o nome do preset.

### 2. Rodando localmente
1. Copie `assets/config.example.js` para `assets/config.local.js`.
2. Preencha os valores reais.
3. Abra a pasta no VS Code e rode o `index.html` com a extensão **Live Server**.

Sem configuração, o site funciona com veículos de exemplo, mas o admin não consegue salvar nem enviar imagens.

### 3. Deploy na Vercel
1. Importe o repositório na Vercel (Framework Preset: **Other**). O `vercel.json` já define o comando de build.
2. Cadastre estas variáveis em Settings → Environment Variables:

| Variável | Descrição |
|---|---|
| `CLOUDINARY_CLOUD_NAME` | Cloud name do Cloudinary |
| `CLOUDINARY_UPLOAD_PRESET` | Nome do upload preset (unsigned) |
| `JSONBIN_BIN_ID` | ID do bin no JSONBin |
| `JSONBIN_API_KEY` | API Key do JSONBin |
| `ADMIN_EMAIL` | Email de acesso ao painel admin |
| `ADMIN_PASSWORD` | Senha de acesso ao painel admin |

3. Faça o deploy. O `build-config.js` gera o `assets/config.local.js` automaticamente. Se faltar alguma variável, o build falha e informa qual.

## Personalização

O número de WhatsApp da loja, o email de contato e o link do Instagram estão escritos diretamente em `index.html` e `assets/data.js`. Troque pelos dados reais antes de publicar a sua versão.

## Segurança

Este é um projeto 100% front-end. Isso significa que:
- A chave do JSONBin e as credenciais do admin chegam ao navegador do visitante e podem ser vistas por quem inspecionar o site.
- O login do admin acontece no próprio JavaScript e **não é uma proteção forte**.

Para uso em produção com dados importantes, mova o acesso ao banco e a autenticação para um back-end (por exemplo, funções serverless da Vercel).
