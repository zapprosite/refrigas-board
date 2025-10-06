# Troubleshooting Google OAuth - REFRIMIX TECNOLOGIA

## Erro: "Google OAuth não configurado" ou "Unsupported provider"

Se você receber este erro ao tentar fazer login com Google, siga os passos abaixo:

---

## 1. Configure o Google Cloud Console

### Criar Credenciais OAuth 2.0

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Selecione seu projeto (ou crie um novo)
3. Navegue para **APIs e Serviços → Credenciais**
4. Clique em **Criar Credenciais → ID do cliente OAuth 2.0**
5. Escolha tipo de aplicativo: **Aplicativo da Web**

### URIs de Redirecionamento Autorizados

Adicione EXATAMENTE esta URL (substitua `<SEU-PROJETO>` pelo ID do seu projeto Lovable Cloud):

```
https://yizbpyjzlzgfsjdnaeor.supabase.co/auth/v1/callback
```

### Origens JavaScript Autorizadas

Adicione todas as URLs do seu app:

```
http://localhost:5173
https://<seu-preview-lovable>.lovable.app
https://<seu-dominio-producao>.com
```

6. Salve e copie **Client ID** e **Client Secret**

---

## 2. Configure o Lovable Cloud (Supabase)

### Ativar Google Provider

<lov-actions>
  <lov-open-backend>View Backend</lov-open-backend>
</lov-actions>

1. Abra o Backend do Lovable Cloud (botão acima)
2. Navegue para **Authentication → Providers → Google**
3. **Ative** o toggle do Google
4. Cole:
   - **Client ID** (do Google Cloud Console)
   - **Client Secret** (do Google Cloud Console)
5. Clique em **Save**

### Configurar URLs de Redirecionamento

1. Ainda no Backend, vá para **Authentication → URL Configuration**
2. Defina:
   - **Site URL**: URL principal do seu app (ex: `https://seu-app.lovable.app`)
   - **Additional Redirect URLs**: adicione TODAS as URLs onde seu app roda:
     ```
     http://localhost:5173
     https://<preview-do-lovable>.lovable.app
     https://<dominio-producao>.com
     ```

**IMPORTANTE**: 
- NÃO adicione barras finais (`/`)
- Certifique-se de que as URLs no Google Cloud e no Lovable Cloud estão EXATAMENTE iguais
- Aguarde 1-2 minutos após salvar antes de tentar login novamente

---

## 3. Verificar Configuração

### Checklist Rápido

- [ ] Google Provider **ativado** no Lovable Cloud
- [ ] Client ID e Secret **colados corretamente** (sem espaços)
- [ ] Callback URL no Google Cloud: `https://yizbpyjzlzgfsjdnaeor.supabase.co/auth/v1/callback`
- [ ] Site URL configurada no Lovable Cloud
- [ ] Additional Redirect URLs incluem localhost + preview + produção
- [ ] Aguardou 1-2 minutos após salvar

### Teste o Login

1. Abra o app em modo anônimo/privado
2. Clique em "Entrar com Google"
3. Autorize o acesso
4. Você deve ser redirecionado e ver a página de "Aguardando aprovação"

---

## 4. Erros Comuns

### "redirect_uri_mismatch"

- **Causa**: URL de callback não está autorizada no Google Cloud
- **Solução**: Adicione `https://yizbpyjzlzgfsjdnaeor.supabase.co/auth/v1/callback` exatamente

### "Access blocked: Authorization Error"

- **Causa**: Aplicação não verificada pelo Google
- **Solução**: Durante desenvolvimento, adicione seu email como "Test User" no Google Cloud Console → OAuth consent screen

### "Unsupported provider"

- **Causa**: Google Provider não está ativado no Lovable Cloud
- **Solução**: Siga o passo 2 acima

### "Invalid redirect URL"

- **Causa**: Site URL ou Additional Redirect URLs incorretas
- **Solução**: Verifique que não há barras finais e que as URLs estão corretas

---

## 5. Aprovação de Usuários (Após Login)

Quando um novo usuário faz login pela primeira vez:

1. Um perfil é criado automaticamente (`profiles` table)
2. O usuário vê: "Aguardando aprovação do administrador"
3. **Admin** precisa aprovar via SQL:

```sql
-- Ver usuários pendentes
SELECT p.id, p.google_email, p.created_at
FROM profiles p
WHERE p.approved_at IS NULL;

-- Aprovar usuário e definir role
-- Substitua <USER_ID> pelo ID do usuário e <ROLE> por 'Admin', 'Secretary' ou 'Collaborator'
UPDATE profiles
SET approved_at = NOW(), approved_by = auth.uid()
WHERE id = '<USER_ID>';

INSERT INTO user_roles (user_id, role)
VALUES ('<USER_ID>', '<ROLE>');
```

4. Usuário recarrega a página e acessa o sistema

---

## Suporte

Se os problemas persistirem:

1. Verifique os logs no Lovable Cloud → Logs
2. Teste com outro navegador/modo anônimo
3. Limpe cache e cookies
4. Aguarde 5 minutos após salvar configurações
