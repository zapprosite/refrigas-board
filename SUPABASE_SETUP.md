# Agenda Sincronizada REFRIMIX TECNOLOGIA - Supabase Setup

## 📋 Visão Geral

Sistema de gestão de ordens de serviço (OS) com controle de acesso baseado em papéis, checklists automáticas, armazenamento de fotos e geração de laudos em PDF.

**Stack**: React + TypeScript + Lovable Cloud (Supabase) + Tailwind CSS

---

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

#### `profiles`
Perfil estendido dos usuários autenticados.
```sql
- id: uuid (PK, FK → auth.users.id)
- google_email: text
- approved_at: timestamptz (NULL até aprovação do Admin)
- approved_by: uuid (FK → auth.users.id)
- created_at, updated_at: timestamptz
```

#### `user_roles`
Papéis dos usuários (separado por segurança).
```sql
- id: uuid (PK)
- user_id: uuid (FK → auth.users.id)
- role: app_role ENUM ('Admin', 'Secretary', 'Collaborator')
- created_at: timestamptz
```

#### `clients`
Cadastro de clientes.
```sql
- id: uuid (PK)
- name: text (NOT NULL)
- phone, email, address: text
- segment: client_segment ENUM ('HVAC-R', 'Electrical')
- created_at, updated_at: timestamptz
```

#### `service_orders`
Ordens de serviço agendadas por dia da semana.
```sql
- id: uuid (PK)
- os_number: text (único, ex: "OS-2025-001")
- client_id: uuid (FK → clients.id)
- day: text ("Segunda", "Terça", etc.)
- status: service_status ENUM ('todo', 'doing', 'done', 'green')
- type: service_type ENUM ('HVAC-R', 'Electrical')
- assignee: text (nome do colaborador)
- created_at, updated_at: timestamptz
```

#### `materials_checklist` & `processes_checklist`
Checklists de materiais e processos por OS.
```sql
- id: uuid (PK)
- os_id: uuid (FK → service_orders.id)
- item/step: text
- done: boolean (default false)
- created_at, updated_at: timestamptz
```
**Trigger automático**: quando TODOS os itens de ambas as checklists ficam `done=true`, a OS muda para `status='green'`.

#### `photos`
Fotos tiradas durante a execução da OS.
```sql
- id: uuid (PK)
- os_id: uuid (FK → service_orders.id)
- storage_path: text (caminho no bucket 'photos/')
- created_at: timestamptz
```

#### `reports`
Laudos/relatórios gerados para cada OS.
```sql
- id: uuid (PK)
- os_id: uuid (FK → service_orders.id, UNIQUE)
- content: text (conteúdo do laudo)
- pdf_path: text (caminho no bucket 'reports/')
- created_at, updated_at: timestamptz
```

#### `templates`
Templates de laudos por segmento.
```sql
- id: uuid (PK)
- segment: client_segment ENUM
- logo_url: text
- fields: jsonb (campos customizados)
- created_at, updated_at: timestamptz
```

#### `leads`
Leads de novos clientes.
```sql
- id: uuid (PK)
- client_id: uuid (FK → clients.id)
- source: text
- tags: text[]
- created_at, updated_at: timestamptz
```

#### `audit_log`
Log de auditoria de ações críticas.
```sql
- id: uuid (PK)
- actor: uuid (FK → auth.users.id)
- action: text ("created", "updated", "approved", etc.)
- entity: text (nome da tabela)
- meta: jsonb (dados adicionais)
- created_at: timestamptz
```

---

## 🔐 Políticas RLS (Row-Level Security)

### Papéis e Permissões

| Papel | Permissões |
|-------|-----------|
| **Admin** | Tudo: aprovar usuários, gerenciar roles, CRUD completo em todas as tabelas |
| **Secretary** | Gerenciar clientes, OS, leads; visualizar tudo; não pode aprovar usuários |
| **Collaborator** | Visualizar suas OS, atualizar checklists, fazer upload de fotos, criar laudos |

### RLS por Tabela

#### `profiles` & `user_roles`
- **SELECT**: Admin pode ver todos; usuários veem apenas o próprio
- **INSERT**: Automático via trigger `handle_new_user()` no signup
- **UPDATE**: Apenas Admin (para aprovar e atribuir roles)

#### `clients`, `service_orders`, `leads`, `templates`
- **SELECT**: Todos autenticados
- **INSERT/UPDATE/DELETE**: Apenas Admin ou Secretary

#### `materials_checklist`, `processes_checklist`
- **SELECT**: Todos autenticados
- **INSERT/DELETE**: Admin ou Secretary
- **UPDATE**: Admin, Secretary ou Collaborator

#### `photos`
- **SELECT**: Todos autenticados
- **INSERT**: Admin, Secretary ou Collaborator
- **DELETE**: Apenas Admin ou Secretary

#### `reports`
- **SELECT**: Todos autenticados
- **INSERT/UPDATE**: Admin, Secretary ou Collaborator
- **DELETE**: Apenas Admin ou Secretary

#### `audit_log`
- **SELECT**: Apenas Admin
- **INSERT**: Todos autenticados (para logging)

---

## 📦 Storage Buckets

### `photos/` (privado)
- Fotos das OS (antes/depois, instalação, etc.)
- Max 10MB por arquivo
- Tipos: image/jpeg, image/png, image/webp
- **Acesso**: presigned URLs geradas no backend
- **RLS**:
  - SELECT: Todos autenticados
  - INSERT: Admin, Secretary, Collaborator
  - DELETE: Admin, Secretary

### `reports/` (privado)
- PDFs dos laudos finalizados
- Max 50MB por arquivo
- Tipo: application/pdf
- **Acesso**: presigned URLs geradas no backend
- **RLS**:
  - SELECT: Todos autenticados
  - INSERT: Admin, Secretary, Collaborator
  - DELETE: Admin, Secretary

---

## 🔧 Funções e Triggers

### `public.has_role(_user_id uuid, _role app_role)`
Função `SECURITY DEFINER` usada nas RLS policies para verificar se um usuário tem determinado papel (evita recursão infinita).

### `public.update_updated_at_column()`
Trigger que atualiza automaticamente `updated_at` em todas as tabelas relevantes.

### `public.check_and_update_os_status()`
Trigger que monitora `materials_checklist` e `processes_checklist`:
- Quando TODOS os itens de ambas ficam `done=true`, muda `service_orders.status` para `'green'`.

### `public.handle_new_user()`
Trigger no signup (auth.users INSERT):
- Cria automaticamente registro em `profiles` com o email do Google.

---

## 🌐 Frontend - Rotas e Componentes

### Rotas Principais
- `/` - Index (KanbanBoard ou LoginPage dependendo de autenticação)
- Login via Google OAuth (Supabase Auth)

### Componentes-Chave

#### `AuthProvider` (`src/hooks/useAuth.tsx`)
- Gerencia sessão do usuário
- Busca `role` de `user_roles` e `approved_at` de `profiles`
- Bloqueia acesso se `approved_at IS NULL`
- **MOCK_MODE**: `false` (queries reais ativadas)

#### `useServiceOrders` (`src/hooks/useServiceOrders.tsx`)
- Busca `service_orders` com JOIN em `clients(name, phone, address)`
- Ordena por `day`
- Implementa `updateOrderDay(orderId, newDay)` para drag-and-drop
- **Realtime**: canal `service_orders_changes` escuta INSERT/UPDATE/DELETE
- **MOCK_MODE**: `false` (queries reais ativadas)

#### `KanbanBoard` (`src/components/KanbanBoard.tsx`)
- Visualização por dia da semana (Segunda a Sábado)
- Drag-and-drop para reagendar OS
- Exibe status colorido: todo (azul), doing (amarelo), done (verde), green (verde escuro)

#### `CollaboratorView` (`src/components/CollaboratorView.tsx`)
- View simplificada para Collaborators
- Checklist de materiais e processos
- Upload de fotos
- Geração de laudos

#### `LoginPage` (`src/components/LoginPage.tsx`)
- Login com Google
- Mensagem de "aguardando aprovação" se `approved_at IS NULL`

---

## ⏰ Timezone (UTC → America/Sao_Paulo)

- **Banco**: Todos os timestamps são armazenados em **UTC** (`timestamptz`)
- **Frontend**: Conversão para `America/Sao_Paulo` ao exibir/editar datas
- Usar biblioteca `date-fns` ou `date-fns-tz` para conversão

```typescript
import { format } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';

const utcDate = new Date(dbTimestamp);
const brDate = utcToZonedTime(utcDate, 'America/Sao_Paulo');
const formatted = format(brDate, 'dd/MM/yyyy HH:mm', { timeZone: 'America/Sao_Paulo' });
```

---

## 🧪 Checklist de Testes Pós-Migração

### 1. Verificar Migração Aplicada
```bash
# No Lovable Cloud backend, confirmar que a migration foi executada
# Verificar que todas as tabelas existem e RLS está habilitado
```

### 2. Criar Primeiro Usuário Admin

#### a) Fazer login via Google (primeira vez)
- Acesse a aplicação
- Clique em "Entrar com Google"
- Autorize o app
- Você verá a mensagem "Aguardando aprovação"

#### b) Promover para Admin (via SQL no backend)
```sql
-- 1. Verificar o ID do usuário recém-criado
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 1;

-- 2. Aprovar o usuário (substituir USER_ID_AQUI)
UPDATE public.profiles 
SET approved_at = NOW(), approved_by = 'USER_ID_AQUI'
WHERE id = 'USER_ID_AQUI';

-- 3. Atribuir role de Admin
INSERT INTO public.user_roles (user_id, role)
VALUES ('USER_ID_AQUI', 'Admin');
```

#### c) Fazer logout e login novamente
- A aplicação reconhecerá o Admin e liberará acesso total

### 3. Testar Funcionalidades

#### ✅ Autenticação
- [ ] Login com Google funciona
- [ ] Usuário sem `approved_at` vê tela de "aguardando aprovação"
- [ ] Admin consegue acessar o dashboard

#### ✅ CRUD de Clientes
- [ ] Admin/Secretary consegue criar cliente
- [ ] Todos conseguem visualizar clientes
- [ ] Collaborator NÃO consegue editar/deletar clientes

#### ✅ Ordens de Serviço
- [ ] Admin/Secretary cria nova OS vinculada a cliente
- [ ] OS aparece no KanbanBoard no dia correto
- [ ] Drag-and-drop para outro dia atualiza `day` no banco
- [ ] Realtime: ao criar/mover OS em outra aba, a tela atualiza automaticamente

#### ✅ Checklists Automáticas
- [ ] Ao marcar item em `materials_checklist`, `done` atualiza
- [ ] Ao marcar item em `processes_checklist`, `done` atualiza
- [ ] Quando TODOS os itens de ambas ficam `done=true`, `service_orders.status` muda para `'green'` automaticamente (verificar no banco)

#### ✅ Upload de Fotos (Presigned URLs)
- [ ] Collaborator faz upload de foto para bucket `photos/`
- [ ] Registro criado em `photos` com `storage_path`
- [ ] Foto é exibida via presigned URL (privada, não pública)

#### ✅ Geração de Laudos (PDF)
- [ ] Collaborator preenche laudo e gera PDF
- [ ] PDF salvo no bucket `reports/`
- [ ] Registro criado em `reports` com `pdf_path`
- [ ] PDF pode ser baixado via presigned URL

#### ✅ Audit Log
- [ ] Ações críticas (criar OS, aprovar usuário, etc.) geram entrada em `audit_log`
- [ ] Apenas Admin consegue visualizar `audit_log`

---

## 🚀 Comandos Úteis

### Verificar RLS Habilitado
```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

### Listar Policies de uma Tabela
```sql
SELECT * FROM pg_policies WHERE tablename = 'service_orders';
```

### Testar Função has_role
```sql
SELECT public.has_role('USER_ID_AQUI', 'Admin');
-- Deve retornar true se o usuário for Admin
```

### Ver Realtime Events
No frontend (console do navegador):
```javascript
supabase
  .channel('test')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'service_orders' }, 
    (payload) => console.log('Change:', payload)
  )
  .subscribe();
```

---

## 📝 Notas de Segurança

1. **Nunca armazenar roles em `localStorage`** – sempre validar server-side via `user_roles`
2. **Buckets privados** – fotos e PDFs NÃO são acessíveis publicamente; usar presigned URLs
3. **SECURITY DEFINER** – função `has_role()` evita ataques de escalação de privilégios
4. **Aprovação obrigatória** – novos usuários ficam bloqueados até Admin aprovar (`approved_at`)
5. **Audit trail** – todas as ações críticas devem logar em `audit_log` para rastreabilidade

---

## 🐛 Troubleshooting

### Erro: "requested path is invalid" no login Google
- Verificar Site URL e Redirect URLs nas configurações do Lovable Cloud backend
- Deve incluir domínio de preview e produção

### Erro: "infinite recursion detected in policy"
- Verificar se alguma policy está fazendo SELECT na própria tabela
- Usar `public.has_role()` SECURITY DEFINER ao invés de subqueries diretas

### Realtime não atualiza
```sql
-- Verificar se tabela está na publicação
ALTER PUBLICATION supabase_realtime ADD TABLE public.service_orders;
```

### Upload de foto falha
- Verificar size limits (10MB para fotos)
- Conferir RLS policies do bucket `photos`
- Verificar se usuário está autenticado

---

## 📚 Referências

- [Lovable Cloud Docs](https://docs.lovable.dev/features/cloud)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)

---

**Última atualização**: Migração aplicada, MOCK_MODE desabilitado, sistema pronto para produção.
