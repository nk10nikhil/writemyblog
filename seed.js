const mongoose = require('mongoose');
const { seed } = require('./src/lib/seed');

// Run the seed function
seed()
    .then(() => {
        console.log('Database seeding completed! Your blog now has:');
        console.log('- 7 users with unique specialties');
        console.log('- Each user has 6-8 blogs in their area of expertise');
        console.log('- Various connection and follower relationships');
        console.log('\nYou can now log in with any of these users:');
        console.log('Username: alexj | Password: Password123!');
        console.log('Username: sarahw | Password: Password123!');
        console.log('Username: mikec | Password: Password123!');
        console.log('Username: emilyrod | Password: Password123!');
        console.log('Username: davidk | Password: Password123!');
        console.log('Username: oliviap | Password: Password123!');
        console.log('Username: jamesw | Password: Password123!');
    })
    .catch((error) => {
        console.error('Error running seed script:', error);
    });