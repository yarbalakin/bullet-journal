-- BuJo — Supabase Setup
-- Запусти этот скрипт в Supabase → SQL Editor → New query → Run

-- Таблица snapshots: хранит все данные пользователя одним JSON-блобом
-- Минимальные изменения в коде — логика такая же как с n8n
CREATE TABLE IF NOT EXISTS snapshots (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  data    JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security: каждый видит только свои данные
ALTER TABLE snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own snapshot" ON snapshots
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
