# Integração com Yelp API - Restaurantes de Toronto

Este documento explica como configurar e usar a integração com a Yelp Fusion API para importar dados de restaurantes de Toronto.

## 📋 Pré-requisitos

1. Conta no Yelp for Developers
2. API Key da Yelp Fusion API

## 🔑 Como Obter a API Key do Yelp

1. Acesse [Yelp for Developers](https://www.yelp.com/developers)
2. Faça login ou crie uma conta
3. Vá para [Create New App](https://www.yelp.com/developers/v3/manage_app)
4. Preencha as informações do aplicativo:
   - **App Name**: What To Eat
   - **Industry**: Food & Dining
   - **Contact Email**: seu email
   - **Description**: Restaurant discovery application
5. Após criar o app, copie a **API Key** gerada

## ⚙️ Configuração

1. Abra o arquivo `src/WhatToEat.API/appsettings.json`
2. Substitua `YOUR_YELP_API_KEY_HERE` pela sua API Key:

```json
{
  "YelpApi": {
    "ApiKey": "SUA_API_KEY_AQUI",
    "BaseUrl": "https://api.yelp.com/v3",
    "DefaultLimit": 50,
    "DefaultRadius": 10000
  }
}
```

## 🚀 Como Usar

A aplicação possui 3 endpoints para importar restaurantes:

### 1. Importar de Toronto (Recomendado)

Endpoint de conveniência que já usa as coordenadas de Toronto:

```bash
POST /api/restaurantimport/from-toronto?limit=100&radius=10000&skipDuplicates=true
```

**Parâmetros:**
- `limit` (opcional, padrão: 50): Número máximo de restaurantes a importar (até 1000)
- `radius` (opcional, padrão: 10000): Raio de busca em metros (máximo: 40000m = 40km)
- `skipDuplicates` (opcional, padrão: true): Pular restaurantes duplicados

**Exemplo usando curl:**

```bash
curl -X POST "http://localhost:5000/api/restaurantimport/from-toronto?limit=200&radius=15000"
```

**Exemplo de resposta:**

```json
{
  "success": true,
  "message": "Successfully imported 195 restaurants. Skipped 5 duplicates.",
  "totalFetched": 200,
  "totalSaved": 195,
  "totalSkipped": 5
}
```

### 2. Importar por Localização

Buscar restaurantes por nome da cidade:

```bash
POST /api/restaurantimport/from-location?location=Toronto,ON&limit=100
```

**Exemplo usando curl:**

```bash
curl -X POST "http://localhost:5000/api/restaurantimport/from-location?location=Toronto%2CON&limit=100"
```

### 3. Importar por Coordenadas

Buscar restaurantes por latitude/longitude específicas:

```bash
POST /api/restaurantimport/from-coordinates?latitude=43.6532&longitude=-79.3832&radius=10000&limit=100
```

**Coordenadas úteis em Toronto:**
- Centro de Toronto: `43.6532, -79.3832`
- Downtown Toronto: `43.6426, -79.3871`
- North York: `43.7615, -79.4111`
- Scarborough: `43.7731, -79.2577`
- Etobicoke: `43.6435, -79.5656`

## 📊 Limites da API do Yelp

- **Requisições por dia**: 25,000 (sem necessidade de aprovação)
- **Máximo por requisição**: 50 restaurantes
- **Raio máximo de busca**: 40,000 metros (40km)
- **Total máximo de resultados**: ~1000 por busca

> **Nota:** A aplicação faz paginação automática para buscar mais de 50 restaurantes por vez.

## 🔍 Detecção de Duplicatas

O sistema verifica duplicatas baseado em:
- Nome do restaurante
- Coordenadas (latitude/longitude com precisão de 0.0001 graus)

Para importar todos os restaurantes sem pular duplicatas:

```bash
curl -X POST "http://localhost:5000/api/restaurantimport/from-toronto?limit=100&skipDuplicates=false"
```

## 📝 Dados Importados

Para cada restaurante, os seguintes dados são importados:

- **Name**: Nome do restaurante
- **Category**: Categoria principal (ex: "Pizza", "Sushi", "Burgers")
- **CuisineType**: Tipo de culinária (ex: "Italian", "Japanese", "American")
- **Address**: Endereço completo
- **Latitude/Longitude**: Coordenadas GPS
- **Phone**: Telefone
- **Rating**: Avaliação (0-5)
- **ImageUrl**: URL da imagem do restaurante

## 🧪 Testando a Integração

### 1. Inicie a aplicação:

```bash
cd src/WhatToEat.API
dotnet run
```

### 2. Acesse o Swagger UI:

Abra seu navegador em: `http://localhost:5000/swagger`

### 3. Teste o endpoint de importação:

1. Expanda `POST /api/restaurantimport/from-toronto`
2. Clique em "Try it out"
3. Configure os parâmetros:
   - limit: 50
   - radius: 10000
   - skipDuplicates: true
4. Clique em "Execute"

### 4. Verifique os restaurantes importados:

```bash
curl http://localhost:5000/api/restaurants
```

## 💡 Dicas de Uso

### Importar restaurantes de diferentes áreas de Toronto:

```bash
# Downtown
curl -X POST "http://localhost:5000/api/restaurantimport/from-coordinates?latitude=43.6426&longitude=-79.3871&limit=100"

# North York
curl -X POST "http://localhost:5000/api/restaurantimport/from-coordinates?latitude=43.7615&longitude=-79.4111&limit=100"

# Scarborough
curl -X POST "http://localhost:5000/api/restaurantimport/from-coordinates?latitude=43.7731&longitude=-79.2577&limit=100"
```

### Importar restaurantes de uma categoria específica:

Atualmente, a API do Yelp retorna todos os tipos de restaurantes. Para filtrar por categoria específica, você pode:

1. Importar todos os restaurantes
2. Usar o endpoint de busca da API para filtrar: `GET /api/restaurants/search?category=Pizza`

## 🐛 Solução de Problemas

### Erro 401 (Unauthorized)

- Verifique se a API Key está correta no `appsettings.json`
- Certifique-se de que a API Key está ativa no Yelp Developer Portal

### Erro 429 (Too Many Requests)

- Você excedeu o limite de 25,000 requisições por dia
- Aguarde 24 horas ou faça upgrade do plano Yelp

### Nenhum restaurante encontrado

- Verifique se as coordenadas estão corretas
- Aumente o raio de busca
- Tente usar o endpoint `from-location` em vez de coordenadas

### Restaurantes duplicados

- Certifique-se de que `skipDuplicates=true` está configurado
- O sistema compara nome + coordenadas para detectar duplicatas

## 📚 Recursos Adicionais

- [Yelp Fusion API Documentation](https://docs.developer.yelp.com/docs/fusion-intro)
- [Yelp API Terms of Use](https://www.yelp.com/developers/api_terms)
- [Yelp Category List](https://www.yelp.com/developers/documentation/v3/all_category_list)

## 🌐 Outras Opções de APIs

Se você quiser explorar outras fontes de dados:

1. **Google Places API** - 100,000 chamadas/dia grátis (requer cartão)
2. **Foursquare Places API** - 5,000 chamadas/hora
3. **City of Toronto Open Data** - Dados governamentais gratuitos

---

**Nota:** Este projeto usa a Yelp Fusion API para fins educacionais e não comerciais. Certifique-se de seguir os [Termos de Uso da API Yelp](https://www.yelp.com/developers/api_terms).
