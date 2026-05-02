import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function signUpAdmin() {
  const { data, error } = await supabase.auth.signUp({
    email: 'adrian@castileusa.com',
    password: 'adrt555',
  })

  if (error) {
    console.error('Error signing up:', error.message)
    return
  }

  console.log('Success!', data)
  console.log('Note: If email confirmation is enabled, please check your email at adrian@castileusa.com to verify the account.')
}

signUpAdmin()
