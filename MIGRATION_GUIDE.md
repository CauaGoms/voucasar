# 📋 Guia de Migração - Seleção de Tipo de Chave PIX

## Resumo das Alterações

Este documento descreve como migrar de bancos de dados existentes para suportar a nova funcionalidade de seleção de tipo de chave PIX.

## Pré-requisitos

- Python 3.9+
- MySQL 8+
- Acesso ao banco de dados com privilégios de ALTER TABLE

## 1. Backup do Banco de Dados

**Antes de qualquer alteração, faça um backup completo:**

```bash
# Backup
mysqldump -u [usuario] -p [banco] > voucasar_backup_$(date +%Y%m%d_%H%M%S).sql

# Exemplo:
mysqldump -u root -p voucasar > voucasar_backup_20260608.sql
```

## 2. Executar Script de Migração

### Opção A: Script Python (Recomendado)

```bash
cd /caminho/para/voucasar
python3 scratch/add_tipo_chave_pix.py
```

**O script irá:**
- Verificar se coluna já existe
- Adicionar coluna `tipo_chave_pix` se necessário
- Definir valor padrão como 'aleatoria'
- Exibir confirmação de sucesso

### Opção B: SQL Direto

Se preferir executar manualmente:

```sql
-- Conectar ao banco
mysql -u root -p voucasar

-- Adicionar coluna (se não existir)
ALTER TABLE Casal ADD COLUMN tipo_chave_pix VARCHAR(50) DEFAULT 'aleatoria';

-- Verificar
SHOW COLUMNS FROM Casal LIKE 'tipo_chave_pix';
```

## 3. Atualizar Chaves Existentes (Opcional)

Se você conhecer os tipos das chaves existentes, pode atualizá-las:

```sql
-- Exemplo: Se a maioria das chaves são aleatórias
UPDATE Casal SET tipo_chave_pix = 'aleatoria' WHERE tipo_chave_pix IS NULL;

-- Ou por padrão (já definido)
UPDATE Casal SET tipo_chave_pix = 'aleatoria';

-- Se souber que determinadas chaves são CPFs
UPDATE Casal SET tipo_chave_pix = 'cpf' 
WHERE chave_pix REGEXP '^[0-9]{11}$' AND LENGTH(chave_pix) = 11;

-- Se souber que determinadas chaves são emails
UPDATE Casal SET tipo_chave_pix = 'email' 
WHERE chave_pix LIKE '%@%';

-- Se souber que determinadas chaves são telefones
UPDATE Casal SET tipo_chave_pix = 'telefone' 
WHERE chave_pix REGEXP '^\\+55[0-9]{10,11}$';
```

## 4. Reiniciar Serviços

### Backend
```bash
# Se usando Uvicorn
pkill -f uvicorn
python main.py

# Se usando Docker
docker compose restart backend
```

### Frontend
```bash
# Reconstruir para garantir que tipo_chave_pix é reconhecido
cd frontend
npm run build
```

## 5. Verificações Pós-Migração

### Verificar Banco de Dados
```sql
-- Conectar ao banco
mysql -u root -p voucasar

-- Verificar estrutura
DESCRIBE Casal;

-- Contar casais com cada tipo
SELECT tipo_chave_pix, COUNT(*) as total 
FROM Casal 
GROUP BY tipo_chave_pix;

-- Verificar se há valores NULL (não deveriam existir)
SELECT COUNT(*) FROM Casal WHERE tipo_chave_pix IS NULL;
```

### Testar API
```bash
# Criar novo casamento
curl -X POST http://localhost:8000/api/casal \
  -H "Authorization: Bearer [token]" \
  -H "Content-Type: application/json" \
  -d '{
    "email_usuario_2": "parceiro@example.com",
    "chave_pix": "seu-cpf-aqui",
    "tipo_chave_pix": "cpf",
    "data_casamento": "2026-12-25"
  }'

# Buscar casamento (verificar se tipo_chave_pix está na resposta)
curl -X GET http://localhost:8000/api/casal/1 \
  -H "Authorization: Bearer [token]"
```

### Testar Frontend
1. Abra o dashboard em http://localhost:5173
2. Crie novo casamento
3. Verifique se selector de tipo de chave aparece
4. Selecione diferentes tipos e verifique placeholders
5. Configure PIX e verifique se tipo é salvo

## 6. Rollback (Se Necessário)

Se algo der errado:

```bash
# Restaurar banco
mysql -u root -p voucasar < voucasar_backup_20260608.sql

# Remover coluna (se necessário)
ALTER TABLE Casal DROP COLUMN tipo_chave_pix;
```

## 7. Validações de Tipo de Chave

O sistema valida automaticamente conforme o tipo:

### CPF
- Exatamente 11 dígitos
- Exemplo: `12345678901`

### Email
- Deve conter `@`
- Convertido para minúsculas
- Exemplo: `usuario@example.com`

### Telefone
- 10 ou 11 dígitos (sem código país)
- Ou com código país (+55...)
- Normalizado para E.164
- Exemplos:
  - `11999999999` → `+5511999999999`
  - `(11) 99999-9999` → `+5511999999999`
  - `+5511999999999` → `+5511999999999`

### Aleatória
- Qualquer string com 5+ caracteres
- Tipicamente UUID
- Exemplo: `550e8400-e29b-41d4-a716-446655440000`

## 8. Troubleshooting

### Erro: "Coluna tipo_chave_pix já existe"
- Normal, significa que você já tem a coluna
- Verifique a estrutura com `DESCRIBE Casal;`

### Erro: "Tipo de chave inválido"
- Verificar tipos válidos: `cpf`, `email`, `telefone`, `aleatoria`
- Confirmar que a chave corresponde ao tipo

### Erro de Validação ao Gerar PIX
- Confirmar que `tipo_chave_pix` está correto para a chave
- Verificar normalização de dados
- Consultar logs do backend

### Frontend não reconhece tipo_chave_pix
- Limpar cache: `npm run build` no frontend
- Limpar cache do navegador (Ctrl+Shift+Delete)
- Hard reload (Ctrl+Shift+R)

## 9. Próximas Etapas

Após a migração bem-sucedida:

1. ✅ Comunicar aos usuários sobre a nova funcionalidade
2. ✅ Documentar tipos de chave suportados
3. ✅ Estabelecer política para qual tipo usar
4. ✅ Monitorar validações de PIX nos logs
5. ✅ Coletar feedback dos usuários

## 📞 Suporte

Se encontrar problemas:

1. Verificar logs do backend: `docker logs backend` ou arquivo de logs
2. Verificar console do navegador (DevTools)
3. Consultar CHANGELOG.md para histórico completo
4. Restaurar banco de dados do backup se necessário

---

**Data de Criação**: 8 de Junho de 2026  
**Última Atualização**: 8 de Junho de 2026  
**Status**: Completo
