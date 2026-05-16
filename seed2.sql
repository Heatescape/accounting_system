-- ============================================================
-- Seed 2: more beauty customers + richer service variety
-- Run in Supabase SQL Editor
-- ============================================================

DO $$
DECLARE
  v_merchant_id uuid;
  v_c6  uuid; v_c7  uuid; v_c8  uuid; v_c9  uuid; v_c10 uuid;
  v_c11 uuid; v_c12 uuid;
BEGIN

SELECT id INTO v_merchant_id FROM public.merchants LIMIT 1;
IF v_merchant_id IS NULL THEN
  RAISE EXCEPTION 'No merchant found. Sign up at /login first.';
END IF;

-- ── New customers ──────────────────────────────────────────
INSERT INTO public.customers (merchant_id, name, mobile, starting_balance) VALUES
  (v_merchant_id, 'Linda Xu',       '0461 111 222', 0),
  (v_merchant_id, 'Coco Huang',     '0462 222 333', 0),
  (v_merchant_id, 'Tina Zhou',      '0463 333 444', 0),
  (v_merchant_id, 'Rachel Ng',      '0464 444 555', 0),
  (v_merchant_id, 'Vivian Sun',     '0465 555 666', 0),
  (v_merchant_id, 'Karen Cheng',    '0466 666 777', 0),
  (v_merchant_id, 'Sophia Li',      '0467 777 888', 0);

SELECT id INTO v_c6  FROM public.customers WHERE merchant_id = v_merchant_id AND mobile = '0461 111 222';
SELECT id INTO v_c7  FROM public.customers WHERE merchant_id = v_merchant_id AND mobile = '0462 222 333';
SELECT id INTO v_c8  FROM public.customers WHERE merchant_id = v_merchant_id AND mobile = '0463 333 444';
SELECT id INTO v_c9  FROM public.customers WHERE merchant_id = v_merchant_id AND mobile = '0464 444 555';
SELECT id INTO v_c10 FROM public.customers WHERE merchant_id = v_merchant_id AND mobile = '0465 555 666';
SELECT id INTO v_c11 FROM public.customers WHERE merchant_id = v_merchant_id AND mobile = '0466 666 777';
SELECT id INTO v_c12 FROM public.customers WHERE merchant_id = v_merchant_id AND mobile = '0467 777 888';

-- ── Linda Xu — facial + skin ───────────────────────────────
INSERT INTO public.transactions (customer_id, merchant_id, type, amount, service_name, created_at) VALUES
  (v_c6, v_merchant_id, 'topup',        600.00, null,                          now() - interval '110 days'),
  (v_c6, v_merchant_id, 'topup',        600.00, null,                          now() - interval '40 days'),
  (v_c6, v_merchant_id, 'consumption',  260.00, 'Thermage RF Skin Tightening', now() - interval '105 days'),
  (v_c6, v_merchant_id, 'consumption',  130.00, 'Vitamin C Brightening Facial',now() - interval '80 days'),
  (v_c6, v_merchant_id, 'consumption',   88.00, 'Microneedling',               now() - interval '55 days'),
  (v_c6, v_merchant_id, 'consumption',  260.00, 'Thermage RF Skin Tightening', now() - interval '35 days'),
  (v_c6, v_merchant_id, 'consumption',   75.00, 'Eyebrow Embroidery Touch-up', now() - interval '10 days');

-- ── Coco Huang — nails obsessive ──────────────────────────
INSERT INTO public.transactions (customer_id, merchant_id, type, amount, service_name, created_at) VALUES
  (v_c7, v_merchant_id, 'topup',        400.00, null,                    now() - interval '150 days'),
  (v_c7, v_merchant_id, 'topup',        400.00, null,                    now() - interval '60 days'),
  (v_c7, v_merchant_id, 'consumption',   85.00, 'Gel Manicure',          now() - interval '145 days'),
  (v_c7, v_merchant_id, 'consumption',  110.00, 'Acrylic Full Set',      now() - interval '120 days'),
  (v_c7, v_merchant_id, 'consumption',   65.00, 'Gel Manicure',          now() - interval '95 days'),
  (v_c7, v_merchant_id, 'consumption',   95.00, 'Spa Pedicure',          now() - interval '90 days'),
  (v_c7, v_merchant_id, 'consumption',  110.00, 'Acrylic Infill',        now() - interval '65 days'),
  (v_c7, v_merchant_id, 'consumption',   85.00, 'Gel Manicure',          now() - interval '45 days'),
  (v_c7, v_merchant_id, 'consumption',   95.00, 'Spa Pedicure',          now() - interval '20 days');

-- ── Tina Zhou — waxing + brows regular ────────────────────
INSERT INTO public.transactions (customer_id, merchant_id, type, amount, service_name, created_at) VALUES
  (v_c8, v_merchant_id, 'topup',        350.00, null,                       now() - interval '180 days'),
  (v_c8, v_merchant_id, 'topup',        350.00, null,                       now() - interval '90 days'),
  (v_c8, v_merchant_id, 'consumption',   55.00, 'Eyebrow Wax & Tint',       now() - interval '175 days'),
  (v_c8, v_merchant_id, 'consumption',  120.00, 'Brazilian Wax',            now() - interval '165 days'),
  (v_c8, v_merchant_id, 'consumption',   45.00, 'Upper Lip & Chin Wax',     now() - interval '150 days'),
  (v_c8, v_merchant_id, 'consumption',   55.00, 'Eyebrow Wax & Tint',       now() - interval '135 days'),
  (v_c8, v_merchant_id, 'consumption',  120.00, 'Brazilian Wax',            now() - interval '120 days'),
  (v_c8, v_merchant_id, 'consumption',   55.00, 'Eyebrow Wax & Tint',       now() - interval '105 days'),
  (v_c8, v_merchant_id, 'consumption',   45.00, 'Half Leg Wax',             now() - interval '90 days'),
  (v_c8, v_merchant_id, 'consumption',  120.00, 'Brazilian Wax',            now() - interval '75 days'),
  (v_c8, v_merchant_id, 'consumption',   55.00, 'Eyebrow Wax & Tint',       now() - interval '55 days'),
  (v_c8, v_merchant_id, 'consumption',  120.00, 'Brazilian Wax',            now() - interval '30 days'),
  (v_c8, v_merchant_id, 'consumption',   55.00, 'Eyebrow Wax & Tint',       now() - interval '10 days');

-- ── Rachel Ng — lashes + premium facials ──────────────────
INSERT INTO public.transactions (customer_id, merchant_id, type, amount, service_name, created_at) VALUES
  (v_c9, v_merchant_id, 'topup',        800.00, null,                          now() - interval '130 days'),
  (v_c9, v_merchant_id, 'topup',        800.00, null,                          now() - interval '20 days'),
  (v_c9, v_merchant_id, 'consumption',  188.00, 'Classic Lash Extensions',     now() - interval '125 days'),
  (v_c9, v_merchant_id, 'consumption',  320.00, 'M22 Photon Rejuvenation',     now() - interval '100 days'),
  (v_c9, v_merchant_id, 'consumption',   88.00, 'Lash Refill (2 weeks)',        now() - interval '90 days'),
  (v_c9, v_merchant_id, 'consumption',  180.00, 'HydraFacial',                 now() - interval '75 days'),
  (v_c9, v_merchant_id, 'consumption',   88.00, 'Lash Refill (2 weeks)',        now() - interval '65 days'),
  (v_c9, v_merchant_id, 'consumption',  320.00, 'M22 Photon Rejuvenation',     now() - interval '45 days'),
  (v_c9, v_merchant_id, 'consumption',   88.00, 'Lash Refill (3 weeks)',        now() - interval '30 days');

-- ── Vivian Sun — mixed bag, low balance ───────────────────
INSERT INTO public.transactions (customer_id, merchant_id, type, amount, service_name, created_at) VALUES
  (v_c10, v_merchant_id, 'topup',       200.00, null,                     now() - interval '50 days'),
  (v_c10, v_merchant_id, 'consumption',  65.00, 'Lash Lift & Tint',       now() - interval '45 days'),
  (v_c10, v_merchant_id, 'consumption',  75.00, 'Gel Manicure',           now() - interval '30 days'),
  (v_c10, v_merchant_id, 'consumption',  55.00, 'Eyebrow Wax & Tint',     now() - interval '10 days');

-- ── Karen Cheng — big spender, anti-aging ─────────────────
INSERT INTO public.transactions (customer_id, merchant_id, type, amount, service_name, created_at) VALUES
  (v_c11, v_merchant_id, 'topup',      2000.00, null,                          now() - interval '180 days'),
  (v_c11, v_merchant_id, 'topup',      2000.00, null,                          now() - interval '60 days'),
  (v_c11, v_merchant_id, 'consumption', 580.00, 'Ultherapy HIFU Full Face',    now() - interval '170 days'),
  (v_c11, v_merchant_id, 'consumption', 320.00, 'M22 Photon Rejuvenation',     now() - interval '140 days'),
  (v_c11, v_merchant_id, 'consumption', 260.00, 'Thermage RF Skin Tightening', now() - interval '110 days'),
  (v_c11, v_merchant_id, 'consumption', 180.00, 'HydraFacial',                 now() - interval '90 days'),
  (v_c11, v_merchant_id, 'consumption', 320.00, 'M22 Photon Rejuvenation',     now() - interval '55 days'),
  (v_c11, v_merchant_id, 'consumption', 580.00, 'Ultherapy HIFU Full Face',    now() - interval '30 days'),
  (v_c11, v_merchant_id, 'consumption', 180.00, 'HydraFacial',                 now() - interval '10 days');

-- ── Sophia Li — brand new customer, just topped up ────────
INSERT INTO public.transactions (customer_id, merchant_id, type, amount, service_name, created_at) VALUES
  (v_c12, v_merchant_id, 'topup',       500.00, null,                    now() - interval '3 days'),
  (v_c12, v_merchant_id, 'consumption', 188.00, 'Classic Lash Extensions', now() - interval '2 days');

RAISE NOTICE 'Seed 2 complete. 7 new customers added.';
END $$;
