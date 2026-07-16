-- SQL Schema for MindCraft Road Hazard Reporting App
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard)
-- Matches your strict database enums: hazard_type, hazard_level, report_status

DROP TABLE IF EXISTS public.reports;
DROP TYPE IF EXISTS public.hazard_type;
DROP TYPE IF EXISTS public.hazard_level;
DROP TYPE IF EXISTS public.report_status;

-- 1. Create Enums
CREATE TYPE public.hazard_type AS ENUM (
  'Jalanan_rusak',
  'Lampu_lalu_lintas',
  'Banjir',
  'Pohon_tumbang',
  'Other'
);

CREATE TYPE public.hazard_level AS ENUM (
  'Rendah',
  'Sedang',
  'Tinggi'
);

CREATE TYPE public.report_status AS ENUM (
  'Aktif',
  'Ditangani',
  'Selesai'
);

-- 2. Create Table
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  jenis public.hazard_type NOT NULL,
  judul TEXT NOT NULL,
  deskripsi TEXT,
  foto_url TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  display_name TEXT,
  hazard_level public.hazard_level NOT NULL DEFAULT 'Sedang',
  upvotes INTEGER NOT NULL DEFAULT 0,
  downvotes INTEGER NOT NULL DEFAULT 0,
  status public.report_status NOT NULL DEFAULT 'Aktif'
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies for Anonymous Crowdsourcing
CREATE POLICY "Allow anonymous read" ON public.reports 
    FOR SELECT 
    TO public 
    USING (true);

CREATE POLICY "Allow anonymous insert" ON public.reports 
    FOR INSERT 
    TO public 
    WITH CHECK (true);

CREATE POLICY "Allow anonymous update" ON public.reports 
    FOR UPDATE 
    TO public 
    USING (true)
    WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS reports_coords_idx ON public.reports (lat, lng);
CREATE INDEX IF NOT EXISTS reports_status_idx ON public.reports (status);
CREATE INDEX IF NOT EXISTS reports_hazard_level_idx ON public.reports (hazard_level);
