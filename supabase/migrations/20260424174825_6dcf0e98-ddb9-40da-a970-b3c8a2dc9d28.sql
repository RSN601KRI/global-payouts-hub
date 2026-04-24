
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('admin', 'finance', 'viewer');
CREATE TYPE public.kyc_status AS ENUM ('pending', 'in_review', 'approved', 'rejected');
CREATE TYPE public.payout_status AS ENUM ('draft', 'queued', 'processing', 'completed', 'failed', 'cancelled');
CREATE TYPE public.payout_rail AS ENUM ('solana_usdc', 'dodo_fiat', 'auto');
CREATE TYPE public.recipient_method AS ENUM ('crypto_wallet', 'bank_transfer', 'auto');
CREATE TYPE public.schedule_status AS ENUM ('active', 'paused', 'archived');

-- ============ TIMESTAMP TRIGGER ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============ BUSINESSES ============
CREATE TABLE public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  legal_name TEXT,
  country TEXT,
  default_currency TEXT NOT NULL DEFAULT 'USD',
  kyc_status public.kyc_status NOT NULL DEFAULT 'pending',
  kyc_submitted_at TIMESTAMPTZ,
  kyc_approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_businesses_updated BEFORE UPDATE ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT,
  email TEXT,
  avatar_url TEXT,
  current_business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ BUSINESS MEMBERS ============
CREATE TABLE public.business_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  invited_email TEXT,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(business_id, user_id)
);

-- ============ USER ROLES (per-business) ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, business_id, role)
);

-- ============ HELPER FUNCTIONS (security definer) ============
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _business_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND business_id = _business_id AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.is_business_member(_user_id UUID, _business_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.business_members
    WHERE user_id = _user_id AND business_id = _business_id
  );
$$;

CREATE OR REPLACE FUNCTION public.has_any_role(_user_id UUID, _business_id UUID, _roles public.app_role[])
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND business_id = _business_id AND role = ANY(_roles)
  );
$$;

-- ============ RECIPIENTS ============
CREATE TABLE public.recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  country TEXT,
  payout_method public.recipient_method NOT NULL DEFAULT 'auto',
  wallet_address TEXT,
  bank_currency TEXT,
  bank_details JSONB,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_recipients_business ON public.recipients(business_id);
CREATE TRIGGER trg_recipients_updated BEFORE UPDATE ON public.recipients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ WALLETS (Solana) ============
CREATE TABLE public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT 'Treasury',
  network TEXT NOT NULL DEFAULT 'solana-devnet',
  public_key TEXT NOT NULL,
  encrypted_secret TEXT NOT NULL, -- encrypted with server-side key
  balance_sol NUMERIC(20,9) DEFAULT 0,
  balance_usdc NUMERIC(20,6) DEFAULT 0,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(business_id, public_key)
);
CREATE INDEX idx_wallets_business ON public.wallets(business_id);
CREATE TRIGGER trg_wallets_updated BEFORE UPDATE ON public.wallets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ PAYOUTS ============
CREATE TABLE public.payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES public.recipients(id) ON DELETE SET NULL,
  schedule_id UUID,
  amount NUMERIC(20,6) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USDC',
  rail public.payout_rail NOT NULL DEFAULT 'auto',
  resolved_rail public.payout_rail,
  status public.payout_status NOT NULL DEFAULT 'draft',
  memo TEXT,
  fee_amount NUMERIC(20,6) DEFAULT 0,
  external_reference TEXT,
  failure_reason TEXT,
  initiated_by UUID,
  source TEXT NOT NULL DEFAULT 'dashboard', -- dashboard | api | schedule
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);
CREATE INDEX idx_payouts_business ON public.payouts(business_id);
CREATE INDEX idx_payouts_status ON public.payouts(status);
CREATE INDEX idx_payouts_created ON public.payouts(created_at DESC);
CREATE TRIGGER trg_payouts_updated BEFORE UPDATE ON public.payouts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ PAYOUT SCHEDULES ============
CREATE TABLE public.payout_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cadence TEXT NOT NULL, -- weekly | biweekly | monthly | custom
  next_run_at TIMESTAMPTZ NOT NULL,
  last_run_at TIMESTAMPTZ,
  status public.schedule_status NOT NULL DEFAULT 'active',
  total_amount NUMERIC(20,6),
  currency TEXT NOT NULL DEFAULT 'USDC',
  rail public.payout_rail NOT NULL DEFAULT 'auto',
  recipient_amounts JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{recipient_id, amount}]
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_schedules_business ON public.payout_schedules(business_id);
CREATE TRIGGER trg_schedules_updated BEFORE UPDATE ON public.payout_schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ TRANSACTIONS (settlement records) ============
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  payout_id UUID REFERENCES public.payouts(id) ON DELETE CASCADE,
  rail public.payout_rail NOT NULL,
  network TEXT, -- solana-devnet | dodo
  tx_signature TEXT,
  amount NUMERIC(20,6) NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  raw_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_tx_business ON public.transactions(business_id);
CREATE INDEX idx_tx_payout ON public.transactions(payout_id);

-- ============ API KEYS ============
CREATE TABLE public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_prefix TEXT NOT NULL, -- first 8 chars shown to user, e.g. sk_live_abcd1234
  hashed_key TEXT NOT NULL UNIQUE, -- sha256 hex of full key
  scopes TEXT[] NOT NULL DEFAULT ARRAY['payouts:create','payouts:read','recipients:read']::TEXT[],
  last_used_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_api_keys_business ON public.api_keys(business_id);
CREATE INDEX idx_api_keys_hash ON public.api_keys(hashed_key);

-- ============ WEBHOOKS ============
CREATE TABLE public.webhook_endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  signing_secret TEXT NOT NULL,
  events TEXT[] NOT NULL DEFAULT ARRAY['payout.completed','payout.failed']::TEXT[],
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  endpoint_id UUID REFERENCES public.webhook_endpoints(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  delivery_status TEXT NOT NULL DEFAULT 'pending',
  response_code INT,
  attempts INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  delivered_at TIMESTAMPTZ
);
CREATE INDEX idx_webhook_events_business ON public.webhook_events(business_id);

-- ============ MONITORING ============
CREATE TABLE public.monitoring_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  payout_id UUID REFERENCES public.payouts(id) ON DELETE SET NULL,
  severity TEXT NOT NULL DEFAULT 'info', -- info | warn | error
  category TEXT NOT NULL, -- rail_failure | velocity | suspicious | balance_low
  message TEXT NOT NULL,
  details JSONB,
  resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_monitoring_business ON public.monitoring_events(business_id);

-- ============ ENABLE RLS ============
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitoring_events ENABLE ROW LEVEL SECURITY;

-- ============ RLS POLICIES ============
-- profiles: own row
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- businesses: members can read; admins can update
CREATE POLICY "businesses_select_member" ON public.businesses FOR SELECT TO authenticated
  USING (public.is_business_member(auth.uid(), id));
CREATE POLICY "businesses_update_admin" ON public.businesses FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), id, 'admin'));

-- business_members: see members of your business; admins manage
CREATE POLICY "members_select" ON public.business_members FOR SELECT TO authenticated
  USING (public.is_business_member(auth.uid(), business_id));
CREATE POLICY "members_admin_all" ON public.business_members FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), business_id, 'admin'))
  WITH CHECK (public.has_role(auth.uid(), business_id, 'admin'));

-- user_roles: see own + business; admins manage
CREATE POLICY "roles_select" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), business_id, 'admin'));
CREATE POLICY "roles_admin_all" ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), business_id, 'admin'))
  WITH CHECK (public.has_role(auth.uid(), business_id, 'admin'));

-- recipients: members read, finance+admin write
CREATE POLICY "recipients_select" ON public.recipients FOR SELECT TO authenticated
  USING (public.is_business_member(auth.uid(), business_id));
CREATE POLICY "recipients_write" ON public.recipients FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), business_id, ARRAY['admin','finance']::public.app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), business_id, ARRAY['admin','finance']::public.app_role[]));

-- wallets: members read (no secrets exposed via app code), finance+admin manage
CREATE POLICY "wallets_select" ON public.wallets FOR SELECT TO authenticated
  USING (public.is_business_member(auth.uid(), business_id));
CREATE POLICY "wallets_write" ON public.wallets FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), business_id, ARRAY['admin','finance']::public.app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), business_id, ARRAY['admin','finance']::public.app_role[]));

-- payouts: members read, finance+admin write
CREATE POLICY "payouts_select" ON public.payouts FOR SELECT TO authenticated
  USING (public.is_business_member(auth.uid(), business_id));
CREATE POLICY "payouts_write" ON public.payouts FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), business_id, ARRAY['admin','finance']::public.app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), business_id, ARRAY['admin','finance']::public.app_role[]));

-- schedules
CREATE POLICY "schedules_select" ON public.payout_schedules FOR SELECT TO authenticated
  USING (public.is_business_member(auth.uid(), business_id));
CREATE POLICY "schedules_write" ON public.payout_schedules FOR ALL TO authenticated
  USING (public.has_any_role(auth.uid(), business_id, ARRAY['admin','finance']::public.app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), business_id, ARRAY['admin','finance']::public.app_role[]));

-- transactions: read-only for members
CREATE POLICY "tx_select" ON public.transactions FOR SELECT TO authenticated
  USING (public.is_business_member(auth.uid(), business_id));

-- api_keys: only admin
CREATE POLICY "apikeys_admin_all" ON public.api_keys FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), business_id, 'admin'))
  WITH CHECK (public.has_role(auth.uid(), business_id, 'admin'));

-- webhooks: only admin
CREATE POLICY "webhooks_admin_all" ON public.webhook_endpoints FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), business_id, 'admin'))
  WITH CHECK (public.has_role(auth.uid(), business_id, 'admin'));
CREATE POLICY "webhook_events_select" ON public.webhook_events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), business_id, 'admin'));

-- monitoring: members read
CREATE POLICY "monitoring_select" ON public.monitoring_events FOR SELECT TO authenticated
  USING (business_id IS NULL OR public.is_business_member(auth.uid(), business_id));

-- ============ SIGNUP TRIGGER: create profile + business + admin role ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  new_business_id UUID;
  display_name_value TEXT;
  business_name_value TEXT;
BEGIN
  display_name_value := COALESCE(
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );

  business_name_value := COALESCE(
    NEW.raw_user_meta_data->>'business_name',
    display_name_value || '''s Workspace'
  );

  INSERT INTO public.businesses (name) VALUES (business_name_value)
  RETURNING id INTO new_business_id;

  INSERT INTO public.profiles (user_id, display_name, email, current_business_id, avatar_url)
  VALUES (
    NEW.id,
    display_name_value,
    NEW.email,
    new_business_id,
    NEW.raw_user_meta_data->>'avatar_url'
  );

  INSERT INTO public.business_members (business_id, user_id) VALUES (new_business_id, NEW.id);
  INSERT INTO public.user_roles (user_id, business_id, role) VALUES (NEW.id, new_business_id, 'admin');

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
