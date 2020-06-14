import knex from "../database/connection";
import {Request, Response} from "express";

export default class ItemController {
    async index(request: Request, response: Response) {
        const items = await knex('items').select('*');

        const serializedItems = items.map(item => {
            return {
                id: item.id,
                title: item.title,
                image: `http://localhost:3333/uploads/${item.image}`
            }
        });

        return response.status(200).json(serializedItems);
    }
}
