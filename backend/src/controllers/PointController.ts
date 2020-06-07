import {Request, Response} from "express";
import knex from "../database/connection";

export default class PointController {
    static async index(request: Request, response: Response) {
        const { city, uf, items } = request.query;
        const parsedItems = String(items).split(',').map(item => Number(item.trim()));

        const points = await knex('points')
            .join('point_items', 'points.id', '=', 'point_items.point_id')
            .whereIn('point_items.item_id', parsedItems)
            .where('city', String(city))
            .where('uf', String(uf))
            .distinct()
            .select('points.*');

        return response.status(200).json(points);
    }

    static async show(request: Request, response: Response) {
        const { id } = request.params;

        const point = await knex('points').where('id', id).first();

        if(!point) {
            return response.status(404).json({message: 'Point not found'})
        }

        const items = await knex('items')
            .join('point_items', 'items.id', '=', 'point_items.item_id')
            .where('point_items.point_id', id)
            .select('items.title');

        return response.status(200).json({ point, items });
    }

    static async create(request: Request, response: Response) {
        const {name, email, whatsapp, latitude, longitude, city, uf, items} = request.body;

        try {

            const trx = await knex.transaction();

            const point = {
                image: 'https://images.unsplash.com/flagged/photo-1588612005960-a382b1eca714?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=387&q=80',
                name,
                email,
                whatsapp,
                latitude,
                longitude,
                city,
                uf
            };
            const [pointID] = await trx('points').insert(point);

            const pointItems = items.map((item_id: number) => {
                return {
                    point_id: pointID,
                    item_id,
                }
            });

            await trx('point_items').insert(pointItems);

            await trx.commit();

            return response.status(201).json({
                id: pointID,
                ...point,
            })

        } catch (e) {
            console.log(e);
        }
    }
}
