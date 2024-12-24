/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  // We default the values that we want to change later instead of marking them as notNullable()
  return knex.schema.createTable('users', table => {
    table.increments('id').notNullable();
    table.string('user_id').notNullable();
    table.string('email').notNullable();
    table.string('password').notNullable();
    table.string('role').notNullable();
    table.json('workspaces').defaultTo({});
    table.timestamps(true, true);
  }).then(() => {
    return knex.schema.createTable('workspaces', table => {
      table.increments('id').notNullable();
      table.string('workspace_id').notNullable();
      table.string('name').notNullable();
      table.string('admin_id').notNullable();
      table.json('guests').defaultTo({});
      table.json('colors').defaultTo({});
      table.json('tests').defaultTo({});
      table.timestamps(true, true);
  })}).then(() => {
    return knex.schema.createTable('tests', table => {
      table.increments('id').notNullable();
      table.string('test_id').notNullable();
      table.string('admin_id').notNullable();
      table.string('workspace_id').notNullable();
      table.json('subjects').defaultTo({});
      table.json('guests').defaultTo({});
      table.json('results').defaultTo({});
      table.timestamps(true, true);
    })
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTable('users')
    .then(() => knex.schema.dropTable('workspaces'))
    .then(() => knex.schema.dropTable('tests'));
};
