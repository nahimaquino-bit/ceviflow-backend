const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function check() {
  const { data, error } = await supabase.from('sales').select('*').limit(1);
  if (error) {
    console.log('--- ERROR ---', error.code, error.message);
  } else {
    console.log('--- SUCCESS --- Table exists', data);
  }
}

check();
