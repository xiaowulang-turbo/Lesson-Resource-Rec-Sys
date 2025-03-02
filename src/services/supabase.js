import { createClient } from "@supabase/supabase-js";

export const supabaseUrl = "https://rthtwjiqszchqibtoqhb.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0aHR3amlxc3pjaHFpYnRvcWhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjMwMzc0MTAsImV4cCI6MjAzODYxMzQxMH0.Z1TevihqX5X-lIhcxSCpvFBpSRZndm076sZrRK2FsdI";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
