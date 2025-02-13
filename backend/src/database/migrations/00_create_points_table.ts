import Knex from 'knex';

export function up(knex: Knex) {
    return knex.schema.createTable('points', (table) => {
        table.increments('id').primary();
        table.string('image').notNullable();
        table.string('name').notNullable();
        table.string('email').notNullable();
        table.string('whatsapp').notNullable();
        table.decimal('longitude');
        table.decimal('latitude');
        table.string('city').notNullable();
        table.string('uf', 2).notNullable();
    })
}

export function down(knex: Knex) {
    return knex.schema.dropTableIfExists('points');
}
