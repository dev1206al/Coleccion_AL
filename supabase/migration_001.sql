-- Migration 001: sealed condition + date precision
-- Ejecutar en Supabase > SQL Editor

-- 1. Agregar valor 'sealed' al enum de condición
ALTER TYPE public.item_condition ADD VALUE 'sealed';

-- 2. Reemplazar acquisition_date (date) con año y mes por separado
ALTER TABLE public.collection_items
  DROP COLUMN acquisition_date,
  ADD COLUMN acquisition_year  smallint CHECK (acquisition_year BETWEEN 1900 AND 2100),
  ADD COLUMN acquisition_month smallint CHECK (acquisition_month BETWEEN 1 AND 12);
