import Knex from 'knex';

export function up(knex: Knex) {
    return knex.schema.createTable('point_items', (table) => {
        table.increments('id').primary();
        table.integer('point_id').notNullable().references('id').inTable('points');
        table.integer('item_id').notNullable().references('id').inTable('items');
    })
}

export function down(knex: Knex) {
    return knex.schema.dropTableIfExists('point_items');
}
