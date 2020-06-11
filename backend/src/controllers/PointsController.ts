import { Request, Response } from "express";
import knex from "../database/connection";

class PointsController {
  async create(req: Request, resp: Response) {
    const {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      state,
      items,
    } = req.body;
    const point = {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      state,
      image: req.file.filename,
    };
    let status = 200;
    const trx = await knex.transaction();
    let point_id = 0;

    try {
      const insertedIds = await trx("points").insert(point);

      point_id = insertedIds[0];

      const pointItems = items
        .split(",")
        .map((item: string) => Number(item.trim()))
        .map((item_id: number) => {
          return {
            item_id,
            point_id: point_id,
          };
        });

      await trx("points_items").insert(pointItems);

      await trx.commit();
    } catch (err) {
      await trx.rollback();
      status = 500;
      console.log(err);
    }

    return resp.status(status).json({
      id: point_id,
      ...point,
    });
  }

  async show(req: Request, resp: Response) {
    const { id } = req.params;
    let status = 200;
    let data = null;

    let point = await knex("points").where("id", id).first();

    if (!point) {
      status = 400;
    } else {
      const serializedPoint = {
        ...point,
        image_url: `http://192.168.0.20:3333/uploads/${point.image}`,
      };
      const items = await knex("items")
        .join("points_items", "items.id", "=", "points_items.item_id")
        .where("points_items.point_id", id)
        .select("items.title");

      data = {
        point: serializedPoint,
        items,
      };
    }

    resp.status(status).json(data);
  }

  async index(req: Request, resp: Response) {
    const { city, state, items } = req.query;
    let status = 200;
    const parsedItems = String(items)
      .split(",")
      .map((item) => Number(item.trim()));

    const points = await knex("points")
      .join("points_items", "points.id", "=", "points_items.point_id")
      .whereIn("points_items.item_id", parsedItems)
      .where("city", String(city))
      .where("state", String(state))
      .distinct()
      .select("points.*");

    const serializedPoints = points.map((point) => {
      return {
        ...point,
        image_url: `http://192.168.0.20:3333/uploads/${point.image}`,
      };
    });

    resp.status(status).json(serializedPoints);
  }
}

export default PointsController;
