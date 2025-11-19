# BAT - Burnout Assessment Tool

Implementação web do **BAT (Burnout Assessment Tool)** - Ferramenta de Avaliação de Burnout, baseada no manual oficial versão 2.0.

## 📋 Sobre o Projeto

Este projeto é uma implementação do questionário BAT em português brasileiro, contendo:

- **23 itens principais** divididos em 4 dimensões:
  - Esgotamento (8 itens)
  - Distanciamento Mental (5 itens)
  - Prejuízo Cognitivo (5 itens)
  - Prejuízo Emocional (5 itens)
- **10 sintomas secundários**
- Cálculo automático de médias e classificação de risco
- Interface responsiva e acessível

## ⚠️ Aviso Importante

Este questionário é apenas uma **ferramenta de triagem** e **NÃO substitui** uma avaliação profissional. Se você está enfrentando sintomas de burnout, recomendamos fortemente buscar ajuda de um profissional de saúde mental qualificado.

## 🚀 Como Rodar Localmente

### Pré-requisitos

Você precisa apenas de um navegador web moderno e um servidor HTTP local. Escolha uma das opções abaixo:

### Opção 1: Python (Recomendado)

Se você tem Python instalado:

```bash
# Python 3
python3 -m http.server 8000

# Ou Python 2
python -m SimpleHTTPServer 8000
```

Depois acesse: http://localhost:8000

### Opção 2: Node.js

Se você tem Node.js instalado:

```bash
# Instalar http-server globalmente (apenas uma vez)
npm install -g http-server

# Rodar o servidor
http-server -p 8000
```

Depois acesse: http://localhost:8000

### Opção 3: PHP

Se você tem PHP instalado:

```bash
php -S localhost:8000
```

Depois acesse: http://localhost:8000

### Opção 4: Abrir Diretamente

Para testes rápidos, você também pode abrir o arquivo `index.html` diretamente no navegador, mas algumas funcionalidades podem não funcionar corretamente.

## 📁 Estrutura do Projeto

```
burnout/
├── index.html          # Página principal com o questionário
├── styles.css          # Estilos e design responsivo
├── script.js           # Lógica de cálculo e interação
├── README.md           # Este arquivo
├── LICENSE             # Licença do projeto
└── Manual.pdf          # Manual oficial do BAT v2.0
```

## 🎯 Como Usar

1. Abra o site no navegador
2. Leia o disclaimer e as instruções
3. Responda todas as 33 questões usando a escala de 1 a 5
4. Clique em "Calcular" para ver seus resultados
5. Os resultados mostrarão:
   - Média geral
   - Médias por subescala
   - Classificação de risco (🟢 Baixo, 🟠 Médio, 🔴 Alto)

## 📊 Interpretação dos Resultados

- **🟢 Baixo Risco:** Níveis normais de estresse relacionado ao trabalho
- **🟠 Risco Médio:** Sinais de alerta presentes - considere fazer mudanças
- **🔴 Alto Risco:** Indicadores significativos de burnout - busque ajuda profissional

## 🔬 Referência Científica

Schaufeli, W. B., De Witte, H., & Desart, S. (2020). Manual Burnout Assessment Tool (BAT) - Version 2.0. KU Leuven, Belgium: Unpublished internal report.

[📄 Manual Original (PDF)](https://burnoutassessmenttool.be/wp-content/uploads/2020/08/User-Manual-BAT-version-2.0.pdf)

## 🛠️ Tecnologias Utilizadas

- HTML5 semântico
- CSS3 com variáveis customizadas
- JavaScript vanilla (sem dependências)
- Design responsivo
- Acessibilidade (ARIA labels, navegação por teclado)

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:

- Reportar bugs
- Sugerir melhorias
- Melhorar a tradução
- Aprimorar a acessibilidade

## 📧 Contato

Para questões sobre o uso clínico do BAT, consulte o [site oficial](https://burnoutassessmenttool.be/start_eng/).

---

**Nota:** Este é um projeto educacional e de triagem. Para diagnóstico e tratamento de burnout, sempre consulte um profissional qualificado.
