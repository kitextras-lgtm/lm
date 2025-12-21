import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cihirmtgbwyxhxmcseog.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpaGlybXRnYnd5eGh4bWNzZW9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1NDQ2OTgsImV4cCI6MjA4MDEyMDY5OH0.S3pd-D5cBh7r0v5MQsOr2aFFfrnA7P3MCiEFzkKxtI8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
