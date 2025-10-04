import bcrypt from 'bcrypt';

const password = 'tastytaste1';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
    process.exit(1);
  }
  console.log('Password hash for "tastytaste1":');
  console.log(hash);
});
