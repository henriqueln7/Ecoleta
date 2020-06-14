import {Request, Response} from "express";
import Joi from '@hapi/joi';
import knex from "../database/connection";

export default class PointController {
    async index(request: Request, response: Response) {
        const { city, uf, items } = request.query;
        const parsedItems = String(items).split(',').map(item => Number(item.trim()));

        const points = await knex('points')
            .join('point_items', 'points.id', '=', 'point_items.point_id')
            .whereIn('point_items.item_id', parsedItems)
            .where('city', String(city))
            .where('uf', String(uf))
            .distinct()
            .select('points.*');

        const serializedPoints = points.map(point => {
            return {
                ...point,
                image_url: `http://localhost:3333/uploads/${point.image}`
            }
        });

        return response.status(200).json(serializedPoints);
    }

    async show(request: Request, response: Response) {
        const { id } = request.params;

        const point = await knex('points').where('id', id).first();

        if(!point) {
            return response.status(404).json({message: 'Point not found'})
        }

        const items = await knex('items')
            .join('point_items', 'items.id', '=', 'point_items.item_id')
            .where('point_items.point_id', id)
            .select('items.title');

        const serializedPoint = {
            ...point,
            image_url: `http://localhost:3333/uploads/${point.image}`
        }


        return response.status(200).json({ point: serializedPoint, items });
    }

    async create(request: Request, response: Response) {
        const {name, email, whatsapp, latitude, longitude, city, uf, items} = request.body;

        const schema = Joi.object({
            name: Joi.string().required(),
            email: Joi.string().email().required(),
            whatsapp: Joi.string().required(),
            latitude: Joi.number().required(),
            longitude: Joi.number().required(),
            city: Joi.string().required(),
            uf: Joi.string().required().max(2),
            items: Joi.string().required(),
        });

        const { error } = schema.validate({name, email, whatsapp, latitude, longitude, city, uf, items});

        if(error) {
            return response.status(400).json(error);
        }

        try {

            const trx = await knex.transaction();

            const point = {
                image: request.file.filename,
                name,
                email,
                whatsapp,
                latitude,
                longitude,
                city,
                uf
            };
            const [pointID] = await trx('points').insert(point);

            const pointItems = items
                .split(',')
                .map((item: string) => Number(item.trim()))
                .map((item_id: number) => {
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
