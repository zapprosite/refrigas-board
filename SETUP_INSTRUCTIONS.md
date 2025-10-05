# 🚨 IMPORTANT: Database Migration Required

## Current Status

Your Lovable Cloud backend has been configured, but the **database schema migration is pending approval**.

### Why Am I Seeing TypeScript Errors?

The TypeScript errors you're seeing (`Argument of type '"user_roles"' is not assignable to parameter of type 'never'`) occur because:

1. The Supabase types file (`src/integrations/supabase/types.ts`) is currently empty
2. The database has no tables yet
3. The migration that creates all necessary tables is **waiting for your approval**

### ✅ How to Fix This

**Step 1: Approve the Database Migration**

Look for the migration proposal in your Lovable chat. It should contain SQL to create these tables:
- `profiles`
- `user_roles`
- `clients`
- `service_orders`
- `materials_checklist`
- `processes_checklist`
- `photos`
- `reports`
- `templates`
- `leads`
- `audit_log`

Plus storage buckets:
- `photos`
- `reports`

**Click "Approve" or "Run Migration"** to execute it.

**Step 2: Wait for Types to Regenerate**

After the migration runs:
1. Lovable will automatically regenerate `src/integrations/supabase/types.ts`
2. The TypeScript errors will disappear
3. The app will build successfully

**Step 3: Add Seed Data**

After migration succeeds, run this SQL to add sample data:

```sql
-- Insert sample clients
INSERT INTO clients (name, phone, address, email, segment)
VALUES 
  ('Empresa ABC Ltda', '(11) 98765-4321', 'Av. Paulista, 1000', 'contato@empresaabc.com.br', 'HVAC-R'),
  ('Comércio XYZ', '(11) 91234-5678', 'Rua Augusta, 500', 'xyz@comercio.com.br', 'Electrical'),
  ('Indústria DEF', '(11) 99999-8888', 'Rod. Anhanguera, km 20', 'def@industria.com.br', 'HVAC-R');
```

Then create service orders:

```sql
-- Get client IDs
DO $$
DECLARE
  client1_id uuid;
  client2_id uuid;
  client3_id uuid;
  os1_id uuid;
BEGIN
  SELECT id INTO client1_id FROM clients WHERE name = 'Empresa ABC Ltda' LIMIT 1;
  SELECT id INTO client2_id FROM clients WHERE name = 'Comércio XYZ' LIMIT 1;
  SELECT id INTO client3_id FROM clients WHERE name = 'Indústria DEF' LIMIT 1;

  -- Insert service orders
  INSERT INTO service_orders (os_number, client_id, day, status, type, assignee)
  VALUES 
    ('OS-2025-001', client1_id, 'Segunda', 'yellow', 'HVAC-R', 'João Silva')
    RETURNING id INTO os1_id;

  INSERT INTO service_orders (os_number, client_id, day, status, type, assignee)
  VALUES 
    ('OS-2025-002', client2_id, 'Terça', 'blue', 'Electrical', 'Maria Santos');

  INSERT INTO service_orders (os_number, client_id, day, status, type, assignee)
  VALUES 
    ('OS-2025-003', client3_id, 'Quarta', 'yellow', 'HVAC-R', 'Pedro Costa');

  -- Add checklists for OS-2025-001
  INSERT INTO materials_checklist (os_id, item, done)
  VALUES 
    (os1_id, 'Gás refrigerante R-410A', false),
    (os1_id, 'Filtros de ar', false),
    (os1_id, 'Tubulação de cobre', false),
    (os1_id, 'Isolamento térmico', false),
    (os1_id, 'Válvulas de expansão', false);

  INSERT INTO processes_checklist (os_id, step, done)
  VALUES 
    (os1_id, 'Inspeção inicial do sistema', false),
    (os1_id, 'Verificação de pressão', false),
    (os1_id, 'Limpeza dos componentes', false),
    (os1_id, 'Teste de funcionamento', false),
    (os1_id, 'Verificação final de segurança', false);
END $$;
```

**Step 4: Configure Google OAuth**

1. Access Lovable Cloud Dashboard (click "View Backend" button)
2. Go to **Users → Auth Settings → Google Settings**
3. Add your Google OAuth credentials:
   - Client ID
   - Client Secret
4. Configure redirect URLs

**Step 5: Create Your First Admin User**

After logging in with Google for the first time:

```sql
-- Replace <YOUR_USER_ID> with your actual user ID from auth.users
UPDATE profiles 
SET approved_at = NOW() 
WHERE id = '<YOUR_USER_ID>';

INSERT INTO user_roles (user_id, role) 
VALUES ('<YOUR_USER_ID>', 'Admin');
```

## 📋 What Happens After Migration?

Once the migration is applied and types are regenerated:

✅ **Frontend Features:**
- Google OAuth login
- Role-based access (Admin/Secretary/Collaborator)
- Kanban board with drag-and-drop (Admin/Secretary only)
- Service order management
- Realtime updates when cards are moved
- Collaborator view with checklists and photo upload

✅ **Backend Features:**
- Full database schema with RLS policies
- Storage buckets for photos and reports
- Automatic status updates when checklists complete
- User approval queue
- Audit logging

## 🔄 Current Workflow

1. **You approve the migration** ⬅️ **YOU ARE HERE**
2. Lovable applies the migration
3. Types auto-regenerate
4. TypeScript errors disappear
5. App builds successfully
6. You can test the login and features

## 🆘 Need Help?

If you encounter issues:
- Check the Lovable Cloud Dashboard for migration logs
- Verify auth configuration is set correctly
- Review RLS policies if data access issues occur
- Contact support if migration fails

---

**Next Step:** Look for the migration proposal in the Lovable chat and click "Approve" or "Run Migration".
