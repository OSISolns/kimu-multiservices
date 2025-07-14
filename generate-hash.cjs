const bcrypt = require('bcryptjs');

bcrypt.hash('kimu@2025', 10).then(hash => {
  console.log('Hash for kimu@2025:', hash);
}); 