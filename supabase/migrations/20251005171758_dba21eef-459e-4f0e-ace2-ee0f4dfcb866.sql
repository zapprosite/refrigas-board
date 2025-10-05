-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUMS
CREATE TYPE app_role AS ENUM ('Admin', 'Secretary', 'Collaborator');
CREATE TYPE service_status AS ENUM ('todo', 'doing', 'done', 'green');
CREATE TYPE service_type AS ENUM ('HVAC-R', 'Electrical');
CREATE TYPE client_segment AS ENUM ('HVAC-R', 'Electrical');

-- ============================================
-- TABLES (no policies yet)
-- ============================================

-- PROFILES TABLE (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  google_email TEXT,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_profiles_google_email ON public.profiles(google_email);

-- USER ROLES TABLE
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- CLIENTS TABLE
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  email TEXT,
  segment client_segment,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- SERVICE ORDERS TABLE
CREATE TABLE public.service_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  os_number TEXT NOT NULL UNIQUE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  day TEXT NOT NULL,
  status service_status NOT NULL DEFAULT 'todo',
  type service_type NOT NULL,
  assignee TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_service_orders_day ON public.service_orders(day);
CREATE INDEX idx_service_orders_status ON public.service_orders(status);
CREATE INDEX idx_service_orders_client ON public.service_orders(client_id);

-- MATERIALS CHECKLIST TABLE
CREATE TABLE public.materials_checklist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  os_id UUID NOT NULL REFERENCES public.service_orders(id) ON DELETE CASCADE,
  item TEXT NOT NULL,
  done BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.materials_checklist ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_materials_checklist_os ON public.materials_checklist(os_id);

-- PROCESSES CHECKLIST TABLE
CREATE TABLE public.processes_checklist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  os_id UUID NOT NULL REFERENCES public.service_orders(id) ON DELETE CASCADE,
  step TEXT NOT NULL,
  done BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.processes_checklist ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_processes_checklist_os ON public.processes_checklist(os_id);

-- PHOTOS TABLE
CREATE TABLE public.photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  os_id UUID NOT NULL REFERENCES public.service_orders(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_photos_os ON public.photos(os_id);

-- REPORTS TABLE
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  os_id UUID NOT NULL REFERENCES public.service_orders(id) ON DELETE CASCADE,
  content TEXT,
  pdf_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(os_id)
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_reports_os ON public.reports(os_id);

-- TEMPLATES TABLE
CREATE TABLE public.templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  segment client_segment NOT NULL,
  logo_url TEXT,
  fields JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- LEADS TABLE
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  source TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- AUDIT LOG TABLE
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  meta JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_audit_log_created ON public.audit_log(created_at DESC);
CREATE INDEX idx_audit_log_actor ON public.audit_log(actor);

-- ============================================
-- HELPER FUNCTIONS (must come before policies that use them)
-- ============================================

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- ============================================
-- RLS POLICIES (applied after tables and functions exist)
-- ============================================

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'Admin'));

CREATE POLICY "Admins can update profiles"
  ON public.profiles FOR UPDATE
  USING (public.has_role(auth.uid(), 'Admin'));

-- User roles policies
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'Admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'Admin'));

-- Clients policies
CREATE POLICY "Authenticated users can view clients"
  ON public.clients FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin and Secretary can manage clients"
  ON public.clients FOR ALL
  USING (
    public.has_role(auth.uid(), 'Admin') OR 
    public.has_role(auth.uid(), 'Secretary')
  );

-- Service orders policies
CREATE POLICY "Authenticated users can view service orders"
  ON public.service_orders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin and Secretary can manage service orders"
  ON public.service_orders FOR ALL
  USING (
    public.has_role(auth.uid(), 'Admin') OR 
    public.has_role(auth.uid(), 'Secretary')
  );

-- Materials checklist policies
CREATE POLICY "Authenticated users can view materials checklist"
  ON public.materials_checklist FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin and Secretary can manage materials checklist"
  ON public.materials_checklist FOR ALL
  USING (
    public.has_role(auth.uid(), 'Admin') OR 
    public.has_role(auth.uid(), 'Secretary')
  );

CREATE POLICY "Collaborators can update materials checklist"
  ON public.materials_checklist FOR UPDATE
  USING (public.has_role(auth.uid(), 'Collaborator'));

-- Processes checklist policies
CREATE POLICY "Authenticated users can view processes checklist"
  ON public.processes_checklist FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin and Secretary can manage processes checklist"
  ON public.processes_checklist FOR ALL
  USING (
    public.has_role(auth.uid(), 'Admin') OR 
    public.has_role(auth.uid(), 'Secretary')
  );

CREATE POLICY "Collaborators can update processes checklist"
  ON public.processes_checklist FOR UPDATE
  USING (public.has_role(auth.uid(), 'Collaborator'));

-- Photos policies
CREATE POLICY "Authenticated users can view photos"
  ON public.photos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin and Secretary can manage photos"
  ON public.photos FOR ALL
  USING (
    public.has_role(auth.uid(), 'Admin') OR 
    public.has_role(auth.uid(), 'Secretary')
  );

CREATE POLICY "Collaborators can insert photos"
  ON public.photos FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'Collaborator'));

-- Reports policies
CREATE POLICY "Authenticated users can view reports"
  ON public.reports FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin and Secretary can manage reports"
  ON public.reports FOR ALL
  USING (
    public.has_role(auth.uid(), 'Admin') OR 
    public.has_role(auth.uid(), 'Secretary')
  );

CREATE POLICY "Collaborators can create/update reports"
  ON public.reports FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'Collaborator'));

CREATE POLICY "Collaborators can update own reports"
  ON public.reports FOR UPDATE
  USING (public.has_role(auth.uid(), 'Collaborator'));

-- Templates policies
CREATE POLICY "Authenticated users can view templates"
  ON public.templates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage templates"
  ON public.templates FOR ALL
  USING (public.has_role(auth.uid(), 'Admin'));

-- Leads policies
CREATE POLICY "Admin and Secretary can view leads"
  ON public.leads FOR SELECT
  USING (
    public.has_role(auth.uid(), 'Admin') OR 
    public.has_role(auth.uid(), 'Secretary')
  );

CREATE POLICY "Admin and Secretary can manage leads"
  ON public.leads FOR ALL
  USING (
    public.has_role(auth.uid(), 'Admin') OR 
    public.has_role(auth.uid(), 'Secretary')
  );

-- Audit log policies
CREATE POLICY "Admins can view audit log"
  ON public.audit_log FOR SELECT
  USING (public.has_role(auth.uid(), 'Admin'));

CREATE POLICY "Authenticated users can insert audit log"
  ON public.audit_log FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================
-- TRIGGERS
-- ============================================

-- Updated at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_orders_updated_at
  BEFORE UPDATE ON public.service_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_materials_checklist_updated_at
  BEFORE UPDATE ON public.materials_checklist
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_processes_checklist_updated_at
  BEFORE UPDATE ON public.processes_checklist
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON public.templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-set service order status to 'green' when all checklists complete
CREATE OR REPLACE FUNCTION public.check_and_update_os_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_os_id UUID;
  v_materials_complete BOOLEAN;
  v_processes_complete BOOLEAN;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_os_id := OLD.os_id;
  ELSE
    v_os_id := NEW.os_id;
  END IF;

  SELECT BOOL_AND(done) INTO v_materials_complete
  FROM public.materials_checklist
  WHERE os_id = v_os_id;

  SELECT BOOL_AND(done) INTO v_processes_complete
  FROM public.processes_checklist
  WHERE os_id = v_os_id;

  IF v_materials_complete AND v_processes_complete THEN
    UPDATE public.service_orders
    SET status = 'green'
    WHERE id = v_os_id AND status != 'green';
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

CREATE TRIGGER check_materials_complete
  AFTER INSERT OR UPDATE OR DELETE ON public.materials_checklist
  FOR EACH ROW EXECUTE FUNCTION public.check_and_update_os_status();

CREATE TRIGGER check_processes_complete
  AFTER INSERT OR UPDATE OR DELETE ON public.processes_checklist
  FOR EACH ROW EXECUTE FUNCTION public.check_and_update_os_status();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, google_email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- STORAGE BUCKETS
-- ============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'photos',
  'photos',
  false,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'reports',
  'reports',
  false,
  52428800,
  ARRAY['application/pdf']
);

-- Storage policies for photos
CREATE POLICY "Authenticated users can view photos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'photos');

CREATE POLICY "Admin and Secretary can upload photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'photos' AND
    (public.has_role(auth.uid(), 'Admin') OR 
     public.has_role(auth.uid(), 'Secretary'))
  );

CREATE POLICY "Collaborators can upload photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'photos' AND
    public.has_role(auth.uid(), 'Collaborator')
  );

CREATE POLICY "Admin and Secretary can delete photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'photos' AND
    (public.has_role(auth.uid(), 'Admin') OR 
     public.has_role(auth.uid(), 'Secretary'))
  );

-- Storage policies for reports
CREATE POLICY "Authenticated users can view reports"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'reports');

CREATE POLICY "Admin and Secretary can upload reports"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'reports' AND
    (public.has_role(auth.uid(), 'Admin') OR 
     public.has_role(auth.uid(), 'Secretary'))
  );

CREATE POLICY "Collaborators can upload reports"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'reports' AND
    public.has_role(auth.uid(), 'Collaborator')
  );

CREATE POLICY "Admin and Secretary can delete reports"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'reports' AND
    (public.has_role(auth.uid(), 'Admin') OR 
     public.has_role(auth.uid(), 'Secretary'))
  );