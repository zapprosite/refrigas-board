# REFRIMIX TECNOLOGIA - Setup Instructions

## Visão Geral

Sistema de gestão sincronizada para serviços HVAC-R e Elétricos com aprovação de usuários, controle de acesso por papel (role-based), e Kanban para ordens de serviço.

**Tech Stack:**
- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Lovable Cloud (Supabase)
- Google OAuth

---

## 1. Configuração Inicial

### 1.1 Google OAuth Setup

**IMPORTANTE**: Configure o Google OAuth ANTES de usar o sistema. Consulte `AuthTroubleshooting.md` para instruções detalhadas.

**Quick steps:**

1. **Google Cloud Console**:
   - Crie credenciais OAuth 2.0 (Aplicativo Web)
   - Adicione callback: `https://yizbpyjzlzgfsjdnaeor.supabase.co/auth/v1/callback`
   - Copie Client ID e Secret

2. **Lovable Cloud Backend**:
   - Ative Google Provider
   - Cole Client ID/Secret
   - Configure Site URL e Additional Redirect URLs

### 1.2 Banco de Dados

A migração já foi aplicada. Estrutura:

**Tabelas principais:**
- `profiles` - Perfis de usuários (aprovação)
- `user_roles` - Papéis (Admin, Secretary, Collaborator)
- `clients` - Clientes (HVAC-R ou Electrical)
- `service_orders` - Ordens de serviço (Kanban)
- `materials_checklist` - Checklist de materiais
- `processes_checklist` - Checklist de processos
- `photos` - Fotos das OSs
- `reports` - Laudos técnicos
- `templates` - Templates de laudo por segmento
- `leads` - Leads de vendas
- `audit_log` - Auditoria

**Veja detalhes completos em:** `SUPABASE_SETUP.md`

---

## 2. Criar Primeiro Admin

Após a primeira pessoa fazer login com Google:

```sql
-- 1. Ver o novo usuário
SELECT id, google_email, created_at
FROM profiles
WHERE approved_at IS NULL;

-- 2. Aprovar como Admin (substitua <USER_ID>)
UPDATE profiles
SET approved_at = NOW()
WHERE id = '<USER_ID>';

INSERT INTO user_roles (user_id, role)
VALUES ('<USER_ID>', 'Admin');
```

O usuário recarrega a página e acessa como Admin.

---

## 3. Fluxo de Autenticação

### 3.1 Login

1. Usuário clica "Entrar com Google"
2. Redireciona para Google OAuth
3. Após autorizar, volta para o app
4. Se `approved_at IS NULL`: exibe "Aguardando aprovação"
5. Se aprovado + role existe: redireciona para tela principal

### 3.2 Aprovação de Novos Usuários (Admin)

**Via SQL** (temporário até UI de admin):

```sql
-- Listar pendentes
SELECT id, google_email, created_at
FROM profiles
WHERE approved_at IS NULL
ORDER BY created_at DESC;

-- Aprovar e definir role
BEGIN;
  UPDATE profiles SET approved_at = NOW() WHERE id = '<USER_ID>';
  INSERT INTO user_roles (user_id, role) VALUES ('<USER_ID>', 'Secretary');
COMMIT;
```

**Roles disponíveis:**
- `Admin` - Acesso total + aprovação de usuários
- `Secretary` - Gerenciar OSs, clientes, checklists
- `Collaborator` - Ver OSs atribuídas, preencher checklists, enviar fotos/laudos

---

## 4. Modo Mock vs Live Data

### Status Atual: LIVE DATA (MOCK_MODE = false)

Arquivos principais:
- `src/hooks/useAuth.tsx` - Autenticação real (linha 21: `MOCK_MODE = false`)
- `src/hooks/useServiceOrders.tsx` - CRUD de OSs real

**Se precisar voltar ao mock** (desenvolvimento):
1. Edite `useAuth.tsx`: `const MOCK_MODE = true;` (linha 21)
2. Edite `useServiceOrders.tsx`: `const MOCK_MODE = true;`

---

## 5. Checklist de Teste Completo

### 5.1 Autenticação

- [ ] Google OAuth configurado (veja `AuthTroubleshooting.md`)
- [ ] Login com Google funciona
- [ ] Usuário novo vê "Aguardando aprovação"
- [ ] Admin aprova via SQL
- [ ] Usuário aprovado acessa o sistema

### 5.2 Permissões por Role

**Admin:**
- [ ] Vê Kanban completo
- [ ] Cria/edita/deleta clientes
- [ ] Cria/edita/move/deleta OSs
- [ ] Gerencia checklists
- [ ] Aprova novos usuários (SQL)

**Secretary:**
- [ ] Vê Kanban completo
- [ ] Cria/edita clientes
- [ ] Cria/edita/move OSs
- [ ] Gerencia checklists

**Collaborator:**
- [ ] Vê apenas OSs atribuídas a ele
- [ ] Marca itens em checklists
- [ ] Envia fotos
- [ ] Preenche laudos

### 5.3 Funcionalidades Core

**Kanban (Admin/Secretary):**
- [ ] Ver colunas: Pendente, Em Andamento, Concluído, Fechado
- [ ] Drag-and-drop de OSs entre colunas
- [ ] Status muda automaticamente ao mover
- [ ] Filtros: dia, tipo (HVAC-R/Electrical)
- [ ] Criar nova OS
- [ ] Editar OS existente

**Ordens de Serviço:**
- [ ] Criar OS com cliente, tipo, dia
- [ ] Atribuir colaborador
- [ ] Gerar checklists automáticos (materiais + processos)
- [ ] OS fica "verde" quando todos os itens estão marcados

**Checklists (Collaborator):**
- [ ] Marcar item como "done"
- [ ] Status da OS atualiza em tempo real
- [ ] Trigger SQL muda `status = 'green'` quando completo

**Fotos:**
- [ ] Upload de foto para OS
- [ ] Armazenamento em bucket privado `photos/`
- [ ] Presigned URLs para visualização
- [ ] Apenas owner ou Admin/Secretary vê

**Laudos:**
- [ ] Collaborator preenche campos do template
- [ ] Sistema gera PDF
- [ ] Salva em bucket privado `reports/`
- [ ] Download via presigned URL

**Realtime:**
- [ ] OSs atualizam ao vivo (quando outro usuário move/edita)
- [ ] Checklists atualizam ao vivo
- [ ] Status de OS atualiza instantaneamente

### 5.4 Timezone

- [ ] Timestamps armazenados em UTC (Supabase)
- [ ] Exibição em `America/Sao_Paulo` no frontend
- [ ] Datas de OSs (`day`) corretas no Kanban

---

## 6. Comandos Úteis (SQL)

### Ver Usuários

```sql
SELECT 
  p.id,
  p.google_email,
  ur.role,
  p.approved_at,
  p.created_at
FROM profiles p
LEFT JOIN user_roles ur ON p.id = ur.user_id
ORDER BY p.created_at DESC;
```

### Ver OSs por Status

```sql
SELECT 
  so.os_number,
  c.name AS client_name,
  so.status,
  so.type,
  so.day,
  so.assignee
FROM service_orders so
JOIN clients c ON so.client_id = c.id
ORDER BY so.day DESC;
```

### Verificar Checklists

```sql
-- Materiais
SELECT os_id, item, done
FROM materials_checklist
WHERE os_id = '<OS_ID>';

-- Processos
SELECT os_id, step, done
FROM processes_checklist
WHERE os_id = '<OS_ID>';
```

### Audit Log

```sql
SELECT 
  created_at,
  actor,
  action,
  entity,
  meta
FROM audit_log
ORDER BY created_at DESC
LIMIT 50;
```

---

## 7. Estrutura de Pastas

```
src/
├── components/
│   ├── ui/              # shadcn components
│   ├── LoginPage.tsx    # Autenticação
│   ├── KanbanBoard.tsx  # Admin/Secretary view
│   └── CollaboratorView.tsx  # Collaborator view
├── hooks/
│   ├── useAuth.tsx      # Context de autenticação
│   └── useServiceOrders.tsx  # CRUD de OSs
├── integrations/supabase/
│   ├── client.ts        # Cliente Supabase (auto-gerado)
│   └── types.ts         # Types (auto-gerado)
├── pages/
│   ├── Index.tsx        # Página principal
│   └── NotFound.tsx
└── main.tsx             # Entry point
```

---

## 8. Deployment

### Lovable Deploy

1. Clique em **Publish** no Lovable
2. URL automática: `https://<seu-app>.lovable.app`
3. Adicione URL em **Additional Redirect URLs** no Lovable Cloud

### Custom Domain

1. Lovable → Project → Settings → Domains
2. Adicione seu domínio
3. Configure DNS (CNAME)
4. Adicione domínio em **Additional Redirect URLs** no Lovable Cloud
5. Atualize **Origens JavaScript Autorizadas** no Google Cloud

---

## 9. Troubleshooting

### Erro ao fazer login

Consulte: **`AuthTroubleshooting.md`**

### OSs não aparecem

1. Verifique `MOCK_MODE = false` em `useServiceOrders.tsx`
2. Verifique RLS policies (Admin/Secretary podem ver todas, Collaborator só as suas)
3. Confira console logs

### Checklists não atualizam status

1. Verifique trigger `check_and_update_os_status` (Supabase)
2. Teste marcar todos os itens manualmente
3. Veja logs de erro no console

### Upload de foto/PDF falha

1. Verifique buckets `photos` e `reports` existem (Lovable Cloud → Storage)
2. Confirme RLS policies em `storage.objects`
3. Gere presigned URL se necessário

### Realtime não funciona

1. Confirme `ALTER PUBLICATION supabase_realtime ADD TABLE service_orders;` foi executado
2. Verifique subscription no `useServiceOrders.tsx`
3. Teste com 2 navegadores simultâneos

---

## 10. Próximos Passos (Opcionais)

- [ ] UI de aprovação de usuários (Admin)
- [ ] Notificações (toast) para realtime updates
- [ ] Filtros avançados no Kanban
- [ ] Dashboard de analytics
- [ ] Exportação de relatórios (Excel/CSV)
- [ ] Integração com WhatsApp/Email

---

## Suporte

- **Documentação Supabase**: Consulte `SUPABASE_SETUP.md`
- **Troubleshooting Google OAuth**: Consulte `AuthTroubleshooting.md`
- **Logs**: Lovable Cloud → Logs
- **Database Schema**: Lovable Cloud → Database
