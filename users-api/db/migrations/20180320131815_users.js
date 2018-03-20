
exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', table => {
      table.increments();
      table.timestamp('createdAt').notNullable().defaultTo(knex.raw('now()'));
      table.string('username').unique().notNullable();
      table.string('passowrd').notNullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('users');
};
