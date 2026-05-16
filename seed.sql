-- ============================================================
-- Seed: fake customers + transactions
-- Run in Supabase SQL Editor AFTER signing up as a merchant
-- ============================================================

DO $$
DECLARE
  v_merchant_id uuid;
  v_c1 uuid; v_c2 uuid; v_c3 uuid; v_c4 uuid; v_c5 uuid;
BEGIN

-- Get the first merchant in the system
SELECT id INTO v_merchant_id FROM public.merchants LIMIT 1;
IF v_merchant_id IS NULL THEN
  RAISE EXCEPTION 'No merchant found. Sign up at /login first.';
END IF;

-- ── Customers ──────────────────────────────────────────────
INSERT INTO public.customers (id, merchant_id, name, mobile, starting_balance)
VALUES
  (gen_random_uuid(), v_merchant_id, 'Sarah Chen',     '0412 345 678', 0),
  (gen_random_uuid(), v_merchant_id, 'Emily Wang',     '0423 456 789', 0),
  (gen_random_uuid(), v_merchant_id, 'Jessica Liu',    '0434 567 890', 0),
  (gen_random_uuid(), v_merchant_id, 'Michelle Zhang', '0445 678 901', 0),
  (gen_random_uuid(), v_merchant_id, 'Amy Lam',        '0456 789 012', 0)
RETURNING id INTO v_c1;

-- Fetch each customer id by mobile
SELECT id INTO v_c1 FROM public.customers WHERE merchant_id = v_merchant_id AND mobile = '0412 345 678';
SELECT id INTO v_c2 FROM public.customers WHERE merchant_id = v_merchant_id AND mobile = '0423 456 789';
SELECT id INTO v_c3 FROM public.customers WHERE merchant_id = v_merchant_id AND mobile = '0434 567 890';
SELECT id INTO v_c4 FROM public.customers WHERE merchant_id = v_merchant_id AND mobile = '0445 678 901';
SELECT id INTO v_c5 FROM public.customers WHERE merchant_id = v_merchant_id AND mobile = '0456 789 012';

-- ── Transactions: Sarah Chen ───────────────────────────────
INSERT INTO public.transactions (customer_id, merchant_id, type, amount, service_name, created_at) VALUES
  (v_c1, v_merchant_id, 'topup',       500.00, null,                    now() - interval '90 days'),
  (v_c1, v_merchant_id, 'topup',       500.00, null,                    now() - interval '60 days'),
  (v_c1, v_merchant_id, 'consumption', 180.00, 'HydraFacial',           now() - interval '85 days'),
  (v_c1, v_merchant_id, 'consumption',  88.00, 'Eyebrow Tinting',       now() - interval '70 days'),
  (v_c1, v_merchant_id, 'consumption', 220.00, 'IPL Hair Removal',      now() - interval '55 days'),
  (v_c1, v_merchant_id, 'consumption',  65.00, 'Lash Lift & Tint',      now() - interval '40 days'),
  (v_c1, v_merchant_id, 'consumption', 180.00, 'HydraFacial',           now() - interval '20 days');

-- ── Transactions: Emily Wang ───────────────────────────────
INSERT INTO public.transactions (customer_id, merchant_id, type, amount, service_name, created_at) VALUES
  (v_c2, v_merchant_id, 'topup',       300.00, null,                    now() - interval '45 days'),
  (v_c2, v_merchant_id, 'consumption',  75.00, 'Gel Manicure',          now() - interval '42 days'),
  (v_c2, v_merchant_id, 'consumption',  95.00, 'Spa Pedicure',          now() - interval '42 days'),
  (v_c2, v_merchant_id, 'consumption',  75.00, 'Gel Manicure',          now() - interval '14 days');

-- ── Transactions: Jessica Liu ──────────────────────────────
INSERT INTO public.transactions (customer_id, merchant_id, type, amount, service_name, created_at) VALUES
  (v_c3, v_merchant_id, 'topup',      1000.00, null,                    now() - interval '120 days'),
  (v_c3, v_merchant_id, 'consumption', 320.00, 'M22 Photon Rejuvenation', now() - interval '115 days'),
  (v_c3, v_merchant_id, 'consumption', 180.00, 'HydraFacial',           now() - interval '90 days'),
  (v_c3, v_merchant_id, 'consumption', 320.00, 'M22 Photon Rejuvenation', now() - interval '60 days'),
  (v_c3, v_merchant_id, 'consumption',  88.00, 'Brow Shaping & Tint',   now() - interval '30 days');

-- ── Transactions: Michelle Zhang ──────────────────────────
INSERT INTO public.transactions (customer_id, merchant_id, type, amount, service_name, created_at) VALUES
  (v_c4, v_merchant_id, 'topup',       200.00, null,                    now() - interval '30 days'),
  (v_c4, v_merchant_id, 'consumption',  55.00, 'Classic Manicure',      now() - interval '28 days'),
  (v_c4, v_merchant_id, 'consumption',  65.00, 'Lash Lift & Tint',      now() - interval '10 days');

-- ── Transactions: Amy Lam ──────────────────────────────────
INSERT INTO public.transactions (customer_id, merchant_id, type, amount, service_name, created_at) VALUES
  (v_c5, v_merchant_id, 'topup',       800.00, null,                    now() - interval '200 days'),
  (v_c5, v_merchant_id, 'topup',       500.00, null,                    now() - interval '100 days'),
  (v_c5, v_merchant_id, 'consumption', 220.00, 'IPL Hair Removal',      now() - interval '190 days'),
  (v_c5, v_merchant_id, 'consumption', 220.00, 'IPL Hair Removal',      now() - interval '160 days'),
  (v_c5, v_merchant_id, 'consumption', 180.00, 'HydraFacial',           now() - interval '130 days'),
  (v_c5, v_merchant_id, 'consumption', 220.00, 'IPL Hair Removal',      now() - interval '100 days'),
  (v_c5, v_merchant_id, 'consumption',  65.00, 'Lash Lift & Tint',      now() - interval '70 days'),
  (v_c5, v_merchant_id, 'consumption', 180.00, 'HydraFacial',           now() - interval '35 days');

RAISE NOTICE 'Seed complete. Merchant: %', v_merchant_id;
END $$;
