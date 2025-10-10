# Eng Process Quality and Statistics (EPQS)

**Sistema Integrado de Ferramentas de Qualidade e Estatística**  
*Desenvolvido por Marcos Garçon*

## ⚠️ IMPORTANTE - Instruções de Execução

**Para o funcionamento correto do sistema, é OBRIGATÓRIO executá-lo através de um servidor web local.** Não execute diretamente abrindo o arquivo `index.html` no navegador, pois isso causará erros de CORS e SecurityError que impedem o carregamento das ferramentas.

### 🚀 Métodos de Execução Recomendados

#### Método 1: Scripts de Inicialização (Recomendado)

Utilize os scripts pré-configurados para iniciar o servidor `serve` automaticamente:

```bash
# Windows
start-server.bat

# Linux/Mac
./start-server.sh
```

#### Método 2: Manual com `serve` (Node.js)

Se você tem Node.js instalado, pode usar o `serve` diretamente:

```bash
# Instale o serve globalmente (apenas na primeira vez)
npm install -g serve

# Navegue até o diretório raiz do sistema EPQS
cd /caminho/para/eng-process-quality-system

# Inicie o servidor
serve -s . -l 5000
```

#### Método 3: Outros Servidores HTTP Simples

Você também pode usar outros servidores HTTP simples, como o do Python:

```bash
# Python 3
python -m http.server 5000
```

**Após iniciar o servidor (em qualquer um dos métodos), acesse o sistema no seu navegador:**

**http://localhost:5000**

## 📋 Descrição

O EPQS é uma Progressive Web Application (PWA) completa que integra 34 ferramentas especializadas para engenharia de processos, controle de qualidade e análise estatística. O sistema oferece uma interface unificada, salvamento local de dados, relatórios avançados e integração conceitual com ferramentas externas como Jamovi, FreeCAD e JaamSim.

## 🚀 Características Principais

### ✨ Ferramentas Integradas (34 total)
- **Análise de Problemas**: 5 Porquês, 8D, Ishikawa, FMEA, MASP, Root Cause Analysis (RCA)
- **Qualidade e Controle**: 5S, CEP, MSA, APQP, PPAP, Gap Analysis
- **Análise Estatística**: Pareto, Histograma, Dispersão, Folha de Verificação
- **Processos e Melhoria**: Kaizen, DMAIC, VSM, Mapeamento, Cronoanálise, SMED
- **Gestão**: Planejamento, Treinamento, Manutenção
- **Análise Estratégica**: SWOT, Matriz GUT, Matriz Esforço x Impacto
- **Controle de Produção**: Injeção, Estamparia, Sucata
- **Relatórios**: A3, Dashboard de Indicadores, Gerenciador

### 🎯 Funcionalidades do Sistema
- **Login Seguro e Gerenciamento de Usuários**: Sistema de autenticação local com múltiplos perfis e isolamento de dados.
- **Salvamento Local Robusto**: Dados persistentes offline (localStorage + IndexedDB) com backup automático e exportação/importação.
- **Dashboard Interativo**: KPIs, gráficos e análises em tempo real.
- **Relatórios Avançados**: Geração automática de relatórios personalizados.
- **Integração Externa**: Fluxos de trabalho com Jamovi, FreeCAD e JaamSim.
- **PWA Completa**: Instalável em Windows e Android.
- **Responsivo**: Interface adaptativa para desktop, tablet e mobile.

### 🔧 Compatibilidade
- **Windows**: Otimizado para desktop Windows 10/11
- **Android**: Interface touch-friendly para dispositivos móveis
- **Navegadores**: Chrome, Edge, Firefox, Safari (modernos)
- **Offline**: Funciona completamente offline após instalação

## 📱 Instalação

### Pré-requisitos
1. **Inicie um servidor web local** (veja seção "Instruções de Execução" acima)
2. Acesse `http://localhost:5000` no navegador

### Windows (Desktop)
1. Com o servidor rodando, acesse `http://localhost:5000`
2. Clique no ícone de instalação na barra de endereços
3. Ou use o botão "Instalar App" que aparece no cabeçalho
4. O EPQS será instalado como aplicativo nativo

### Android (Mobile)
1. Com o servidor rodando, acesse `http://localhost:5000` no Chrome
2. Toque no menu (⋮) e selecione "Instalar app"
3. Ou use o banner de instalação que aparece automaticamente
4. O EPQS será adicionado à tela inicial

## 🔐 Login Padrão

- **Usuário**: `admin`
- **Senha**: `admin123`

*Nota: O sistema de login é local e pode ser personalizado na seção de Gerenciamento de Usuários.*

## 📊 Uso do Sistema

### 1. Dashboard Principal
- Visão geral das ferramentas disponíveis
- Cards informativos organizados por categoria
- Acesso rápido às funcionalidades mais utilizadas

### 2. Dashboard de Indicadores
- KPIs em tempo real
- Gráficos interativos (Chart.js)
- Análise de tendências e performance
- Gerador de relatórios personalizados

### 3. Ferramentas Especializadas
- Cada ferramenta carrega em iframe isolado
- Dados salvos automaticamente
- Integração transparente com sistema principal
- Exportação de dados para análise externa

### 4. Integração Externa
- Templates de exportação para Jamovi (CSV)
- Scripts Python para FreeCAD
- Configurações para JaamSim
- Fluxos de trabalho Digital Twin

### 5. Gerenciamento de Usuários
- Adicione, edite e remova usuários
- Defina perfis de acesso (Admin, User, Viewer)
- Gerencie permissões e dados isolados por usuário

## 🛠️ Estrutura do Projeto

```
eng-process-quality-system/
├── index.html                 # Página principal
├── manifest.json             # Configuração PWA
├── service-worker.js         # Cache e offline
├── app.js                    # Lógica principal
├── data-manager.js           # Gerenciamento de dados
├── settings.js               # Configurações
├── tool-processor.js         # Processamento de ferramentas
├── reports-dashboard.js      # Sistema de relatórios
├── external-integration.js   # Integração externa
├── platform-optimization.js # Otimizações de plataforma
├── user-management.js        # Gerenciamento de usuários
├── system-validator.js       # Testes e validação do sistema
├── package-system.js         # Empacotamento do sistema
├── test-integration.html     # Testes de integração
├── start-server.bat          # Script para iniciar servidor (Windows)
├── start-server.sh           # Script para iniciar servidor (Linux/Mac)
├── tools/                    # Ferramentas HTML (34 arquivos)
│   ├── 5_porques.html
│   ├── 5s.html
│   ├── cep.html
│   └── ...
├── icons/                    # Ícones PWA
│   ├── icon-72x72.png
│   ├── icon-192x192.png
│   └── icon-512x512.png
└── screenshots/              # Screenshots para app stores
    ├── desktop-screenshot.png
    └── mobile-screenshot.png
```

## 🔧 Configurações Avançadas

### Personalização de Temas
```javascript
// Acesse as configurações no sistema
// Temas disponíveis: escuro, claro, automático
```

### Backup e Restauração
```javascript
// Backup automático configurável
// Exportação manual de dados
// Importação de configurações
```

### Integração com Ferramentas Externas

#### Jamovi (Análise Estatística)
1. Exporte dados usando templates CSV
2. Importe no Jamovi para análises avançadas
3. Utilize os workflows pré-configurados

#### FreeCAD (Modelagem 3D)
1. Use scripts Python gerados automaticamente
2. Modele layouts e equipamentos
3. Exporte para simulação

#### JaamSim (Simulação)
1. Configure processos usando templates
2. Execute simulações de eventos discretos
3. Analise resultados no Jamovi

## 📈 Fluxos de Trabalho

### Digital Twin Completo
1. **FreeCAD**: Modelagem 3D do layout/equipamento
2. **JaamSim**: Simulação do processo produtivo
3. **Jamovi**: Análise estatística dos resultados
4. **EPQS**: Documentação e controle de qualidade

### Melhoria Contínua
1. **EPQS**: Coleta e análise de dados (CEP, 5S, etc.)
2. **JaamSim**: Simulação de melhorias propostas
3. **Jamovi**: Validação estatística
4. **EPQS**: Implementação e monitoramento

## 🧪 Testes

Execute o arquivo `test-integration.html` para:
- Verificar integridade das 34 ferramentas
- Testar funcionalidades de integração
- Validar compatibilidade do navegador
- Exportar relatórios de teste

Você também pode executar o validador do sistema diretamente no console do navegador após o login:
```javascript
EPQS_SystemValidator.runAllTests();
```

## 📋 Requisitos do Sistema

### Mínimos
- **Navegador**: Chrome 80+, Edge 80+, Firefox 75+, Safari 13+
- **RAM**: 2GB
- **Armazenamento**: 50MB livres
- **Resolução**: 1024x768 (desktop), 360x640 (mobile)

### Recomendados
- **Navegador**: Versões mais recentes
- **RAM**: 4GB+
- **Armazenamento**: 100MB+ livres
- **Resolução**: 1920x1080 (desktop), 1080x1920 (mobile)

## 🔒 Segurança e Privacidade

- **Dados Locais**: Todos os dados ficam no dispositivo
- **Sem Servidor**: Não há transmissão de dados para servidores externos
- **Criptografia**: Dados sensíveis são criptografados localmente
- **Backup Seguro**: Exportação criptografada opcional

## 🆘 Suporte e Solução de Problemas

### Problemas Comuns

**Ferramentas não carregam**
- Verifique se o sistema está sendo executado através de um servidor web local (veja "Instruções de Execução").
- Verifique se todos os arquivos estão no diretório correto.
- Limpe o cache do navegador.

**Dados não salvam**
- Verifique se localStorage está habilitado.
- Teste em modo privado/incógnito.
- Verifique espaço disponível.

**Performance lenta**
- Feche outras abas do navegador.
- Limpe dados antigos nas configurações.
- Reinicie o aplicativo.

### Logs de Debug
```javascript
// Abra o console do navegador (F12)
// Verifique mensagens de erro
// Use: EPQS_SystemValidator.runAllTests() para diagnóstico completo
```

## 🔄 Atualizações

O sistema verifica automaticamente por atualizações quando online. Para atualizar manualmente:
1. Feche completamente o aplicativo
2. Limpe o cache do navegador
3. Reabra o aplicativo
4. O service worker baixará a versão mais recente

## 📄 Licença

Este projeto foi desenvolvido por **Marcos Garçon** como um sistema integrado de ferramentas de qualidade e estatística. Todos os direitos reservados.

## 🤝 Contribuições

Para sugestões, melhorias ou relatórios de bugs, entre em contato através dos canais oficiais.

## 📞 Contato

**Desenvolvedor**: Marcos Garçon  
**Sistema**: Eng Process Quality and Statistics (EPQS)  
**Versão**: 1.0.0  
**Data**: 2024

---

*Sistema desenvolvido com foco na excelência operacional e melhoria contínua de processos industriais.*

