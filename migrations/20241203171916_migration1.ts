import { type Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', table => {
    table.increments('id').notNullable();
    table.string('user_id').notNullable();
    table.string('email').notNullable();
    table.string('password').notNullable();
    table.string('role').notNullable();
    table.timestamps(true, true);
  }).then(() => {
    return knex.schema.createTable('workspaces', table => {
      table.increments('id').notNullable();
      table.string('workspace_id').notNullable();
      table.string('name').notNullable();
      table.string('admin_id').notNullable();
      table.specificType('guest_ids', 'text[]').defaultTo('{}');
      table.specificType('test_ids', 'text[]').defaultTo('{}');
      table.timestamps(true, true);
  })}).then(() => {
    return knex.schema.createTable('tests', table => {
      table.increments('id').notNullable();
      table.string('test_id').notNullable();
      table.string('admin_id').notNullable();
      table.string('workspace_id').notNullable();
      table.specificType('subjects', 'text[]').defaultTo('{}');
      table.timestamps(true, true);
    })
  }).then(() => {
    return knex.schema.createTable('invitations', table => {
      table.increments('id').notNullable();
      table.string('invitation_id').notNullable();
      table.string('item_id').notNullable();
      table.string('admin_id').notNullable();
      table.string('guest_id').notNullable();
      table.string('type').notNullable();
      table.string('status').notNullable();
      table.timestamps(true, true);
    })
  }).then(() => {
    return knex.schema.createTable('colors', table => {
      table.increments('id').notNullable();
      table.string('color_id').notNullable();
      table.string('workspace_id').notNullable();
      table.string('guest_id').notNullable();
      table.string('hex').notNullable();
      table.timestamps(true, true);
    })
  }).then(() => {
    return knex.schema.createTable('results', table => {
      table.increments('id').notNullable();
      table.string('result_id').notNullable();
      table.string('test_id').notNullable();
      table.string('guest_id').notNullable();
      table.specificType('subjects', 'text[]').defaultTo('{}');
      table.specificType('scores', 'text[]').defaultTo('{}');
      table.timestamps(true, true);
  })});
};

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('colors')
    .then(() => knex.schema.dropTable('workspaces'))
    .then(() => knex.schema.dropTable('tests'))
    .then(() => knex.schema.dropTable('invitations'))
    .then(() => knex.schema.dropTable('colors'))
    .then(() => knex.schema.dropTable('results'));
};
