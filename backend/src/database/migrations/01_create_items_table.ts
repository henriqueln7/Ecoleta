import Knex from 'knex';

export function up(knex: Knex) {
    return knex.schema.createTable('items', (table) => {
        table.increments('id').primary();
        table.string('title').notNullable();
        table.string('image').notNullable();
    })
}

export function down(knex: Knex) {
    return knex.schema.dropTableIfExists('items');
}
//
//
//
