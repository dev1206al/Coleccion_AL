-- Migration 004: Sale tracking
-- Ejecutar en Supabase > SQL Editor

-- 1. Agregar 'for_sale' al enum de status
ALTER TYPE public.item_status ADD VALUE IF NOT EXISTS 'for_sale';

-- 2. Columnas de venta
ALTER TABLE public.collection_items
  ADD COLUMN IF NOT EXISTS asking_price numeric(10,2),
  ADD COLUMN IF NOT EXISTS sale_price   numeric(10,2),
  ADD COLUMN IF NOT EXISTS sale_date    date,
  ADD COLUMN IF NOT EXISTS sale_notes   text;
