# Verificação das Ferramentas EPQS

## Ferramentas Encontradas na Pasta tools/

### Ferramentas Principais (31 arquivos HTML)
1. 5_porques.html ✓
2. 5s.html ✓
3. 8d.html ✓
4. apqp.html ✓
5. cep.html ✓
6. controle_injecao.html ✓
7. cronoanalise.html ✓ (deve ser renomeado para cronoanalise-mtm.html)
8. diagrama-dispersao.html ✓
9. dmaic.html ✓
10. estamparia.html ✓
11. fmea.html ✓
12. folha_verificacao.html ✓
13. gap-analysis.html ✓
14. histograma.html ✓
15. ishikawa.html ✓
16. kaizen.html ✓
17. manutencao.html ✓
18. mapeamento-de-processos.html ✓ (deve ser renomeado para mapeamento-processos.html)
19. masp.html ✓
20. matriz-esforco-impacto.html ✓
21. matriz-gut.html ✓
22. msa.html ✓
23. pareto.html ✓
24. planejamento.html ✓
25. ppap.html ✓
26. relatorio-a3.html ✓
27. root-cause-analysis.html ✓
28. smed.html ✓
29. sucata.html ✓
30. swot.html ✓ (deve ser renomeado para analise-swot.html)
31. treinamento.html ✓
32. vsm.html ✓

### Arquivos Extras (não são ferramentas principais)
- DashboarddeIndicadores.html (arquivo legado, não usado)
- GerenciadordeDashboards.html (arquivo legado, não usado)
- manutencao-backup.html (arquivo de backup)
- mapeamento-de-processos-backup.html (arquivo de backup)

## Problemas Identificados

### 1. Inconsistências de Nomenclatura
- `cronoanalise.html` → deve ser `cronoanalise-mtm.html`
- `mapeamento-de-processos.html` → deve ser `mapeamento-processos.html`
- `swot.html` → deve ser `analise-swot.html`

### 2. Arquivos Legados
- `DashboarddeIndicadores.html` e `GerenciadordeDashboards.html` são arquivos antigos que não são mais usados
- Devem ser removidos para evitar confusão

### 3. Arquivos de Backup
- `manutencao-backup.html` e `mapeamento-de-processos-backup.html` são backups
- Podem ser mantidos ou removidos dependendo da necessidade

## Ações Necessárias

1. **Renomear arquivos para consistência:**
   - `cronoanalise.html` → `cronoanalise-mtm.html`
   - `mapeamento-de-processos.html` → `mapeamento-processos.html`
   - `swot.html` → `analise-swot.html`

2. **Atualizar app.js e package-system.js:**
   - Corrigir referências aos nomes de arquivos
   - Garantir que todas as 31 ferramentas estejam listadas corretamente

3. **Limpar arquivos desnecessários:**
   - Remover ou mover arquivos legados
   - Organizar backups em pasta separada

4. **Verificar integração:**
   - Testar carregamento de todas as ferramentas
   - Verificar se o dashboard de indicadores funciona corretamente
   - Confirmar que a navegação entre ferramentas está fluida

## Status das Ferramentas por Categoria

### Sistema (4 ferramentas virtuais)
- Dashboard ✓
- Dashboard de Indicadores ✓
- Integração Externa ✓
- Gerenciar Usuários ✓

### Análise de Problemas (6 ferramentas)
- 5 Porquês ✓
- Relatório 8D ✓
- Diagrama Ishikawa ✓
- FMEA ✓
- MASP ✓
- Análise de Causa Raiz ✓

### Qualidade e Controle (6 ferramentas)
- Auditoria 5S ✓
- CEP e Capabilidade ✓
- MSA ✓
- APQP ✓
- PPAP ✓
- Gap Analysis ✓

### Análise Estatística (4 ferramentas)
- Diagrama de Pareto ✓
- Histograma ✓
- Diagrama de Dispersão ✓
- Folha de Verificação ✓

### Processos e Melhoria (6 ferramentas)
- Kaizen ✓
- DMAIC ✓
- VSM ✓
- Mapeamento de Processos ✓
- Cronoanálise MTM ✓
- SMED ✓

### Gestão e Planejamento (3 ferramentas)
- Planejamento ✓
- Treinamento ✓
- Manutenção ✓

### Análise Estratégica (3 ferramentas)
- Análise SWOT ✓
- Matriz GUT ✓
- Matriz Esforço x Impacto ✓

### Controle de Produção (3 ferramentas)
- Controle de Injeção ✓
- Estamparia ✓
- Controle de Sucata ✓

### Relatórios (1 ferramenta)
- Relatório A3 ✓

**Total: 31 ferramentas HTML + 4 ferramentas virtuais do sistema = 35 ferramentas totais**
