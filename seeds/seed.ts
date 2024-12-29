import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('users').del();
  await knex('users').insert([
    { user_id: "admin1", email: 'superadmin@croneri.co.uk', password: '12345678', role: 'admin' },
  ]);

  await knex('workspaces').del();
  await knex('workspaces').insert([
    { workspace_id: "workspace1", name: 'workspace1', admin_id: "admin1", guest_ids: [], test_ids: [] },
  ]);
};
