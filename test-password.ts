import bcrypt from 'bcrypt';

const password = 'tastytaste1';
const hash = '$2b$10$h94qkZLIw3FhU7hh3f29S.tUQS.ALDBcucDXrw3mSH5/aORE1Sjpy';

console.log('Testing password:', password);
console.log('Against hash:', hash);

bcrypt.compare(password, hash, (err, result) => {
  if (err) {
    console.error('Error:', err);
    process.exit(1);
  }
  console.log('Password match result:', result);
  if (result) {
    console.log('✓ Password is correct!');
  } else {
    console.log('✗ Password does NOT match!');
  }
});
