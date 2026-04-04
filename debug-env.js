require('dotenv').config()
console.log('CLERK_PUBLISHABLE_KEY starts with:', process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.substring(0, 10))
console.log('CLERK_SECRET_KEY starts with:', process.env.CLERK_SECRET_KEY?.substring(0, 10))
console.log('Database URL protocol:', process.env.DATABASE_URL?.split(':')[0])
