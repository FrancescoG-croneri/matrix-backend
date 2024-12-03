/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('admins').del()
  await knex('admins').insert([
    { user_id: 1, email: 'francesco.guglielmi@croneri.co.uk', password: '1234567' },
  ]);

  await knex('guests').del()
  await knex('guests').insert([
    { user_id: 1, username: 'francesco', password: '1234567' },
  ]);
};
