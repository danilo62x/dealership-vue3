# Concessionária / Vue 3

[Read in English](./README.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE) ![Free](https://img.shields.io/badge/price-free-brightgreen)

Revenda de veículos em Vue 3 + Tailwind: vitrine pública com filtros de marca, modelo, ano, km, câmbio e faixa de preço, ficha completa e simulador de financiamento pela Tabela Price com a memória do cálculo linha a linha e o CET aproximado, que recalcula ao mexer na entrada e respeita a entrada mínima. Avaliação de troca que parte do valor de referência e mostra cada ajuste em reais — depreciação por ano, quilometragem acima ou abaixo da média, estado de conservação e opcionais —, abatendo a entrada. Test-drive que aponta separadamente o conflito de veículo e o de vendedor e exige CNH válida. Showroom com funil kanban que reserva o veículo ao aprovar e o devolve à vitrine se a proposta cai, sem zerar os dias em estoque, mais margem, comissão por faixa e lista de giro lento. i18n pt-BR/en/es, PWA, dark mode.

## Destaques

- Financiamento Price com memória e CET
- Avaliação de troca com cada ajuste em reais
- Test-drive com conflito de veículo e vendedor
- Funil que reserva e devolve ao estoque
- i18n pt-BR/en/es, PWA, dark mode

## Telas em destaque

- Veículo: Ficha e simulador
- Financiamento: Memória e CET
- Funil: Kanban e reserva
- Avaliação: Ajustes da troca

## Stack

- Vue 3
- TypeScript
- Vite 6
- Tailwind CSS v4
- Pinia
- Vue Router 4
- ApexCharts
- VeeValidate

## Requisitos

- Node.js 20 ou mais novo, com npm

## Como rodar

```bash
npm install
npm run dev
```

O servidor de desenvolvimento mostra a URL local para abrir.

Conta de demonstração:

- `gerente@garagem.com.br` / `demo123`

## Build de produção

```bash
npm run build
```

Gera o pacote de produção em `dist/`; para conferir localmente, `npm run preview`. Qualquer hospedagem estática serve; para as rotas no cliente, redirecione caminhos desconhecidos para `index.html`.

## Estrutura do projeto

```
src/
├── assets/  styles
├── components/  app, dl, layout, ui
├── composables/
├── data/
├── i18n/  locales
├── lib/
├── router/
├── stores/
├── views/  app, public
```

## Outras tecnologias

Este template também existe em outras 4 tecnologias, com as mesmas telas e a mesma identidade visual. Todas são gratuitas:

- React 19: https://github.com/danilo62x/dealership-react
- Angular 19: https://github.com/danilo62x/dealership-angular
- Laravel 11: https://github.com/danilo62x/dealership-laravel
- HTML estático: https://github.com/danilo62x/dealership-html

Mais templates gratuitos (painéis admin, sistemas por segmento e apps Flutter): https://github.com/danilo62x?tab=repositories

## Licença

[MIT](./LICENSE), copyright 2026 Danilo Quinelato.
