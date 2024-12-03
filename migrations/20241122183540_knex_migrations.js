/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema
    .createTable('admins', table => {
      table.increments('id');
      table.string('user_id').notNullable();
      table.string('email').notNullable();
      table.string('password').notNullable();
      table.timestamps(true, true);
    })
    .then(() => {
      return knex.schema.createTable('guests', table => {
        table.increments('id');
        table.string('user_id').notNullable();
        table.string('username').notNullable();
        table.string('password').notNullable();
        table.timestamps(true, true);
  })})
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema
    .dropTable('admins')
      .then(() => knex.schema.dropTable('guests'));
};
