
import { createClient } from '@supabase/supabase-js';
import { Note, User } from '../types';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

// Initialize only if keys are present to prevent "supabaseUrl is required" crash
export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

export const isSupabaseConfigured = !!supabase;

// --- Notes Logic ---
export const fetchAllNotes = async (): Promise<Note[]> => {
  if (!supabase) {
    console.warn('Supabase not configured. Using local data.');
    return [];
  }

  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('createdAt', { ascending: false });

  if (error) {
    console.error('Error fetching notes:', error);
    return [];
  }
  return data as Note[];
};

export const saveNewNote = async (note: Note) => {
  if (!supabase) return;
  const { error } = await supabase.from('notes').insert([note]);
  if (error) throw error;
};

export const updateNoteInCloud = async (id: string, updates: Partial<Note>) => {
  if (!supabase) return;
  const { error } = await supabase.from('notes').update(updates).eq('id', id);
  if (error) throw error;
};

export const deleteNoteFromCloud = async (id: string) => {
  if (!supabase) return;
  const { error } = await supabase.from('notes').delete().eq('id', id);
  if (error) throw error;
};

// --- Profiles Logic ---
export const fetchProfileByEmail = async (email: string): Promise<User | null> => {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();

  if (error) return null;
  return data as User;
};

export const createProfile = async (user: User) => {
  if (!supabase) return;
  const { error } = await supabase.from('profiles').insert([user]);
  if (error) throw error;
};

export const updateProfile = async (id: string, updates: Partial<User>) => {
  if (!supabase) return;
  const { error } = await supabase.from('profiles').update(updates).eq('id', id);
  if (error) throw error;
};
