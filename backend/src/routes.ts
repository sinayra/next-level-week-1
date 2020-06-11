import express, { request } from "express";
import multer from "multer";
import { celebrate, Joi } from "celebrate";
import multerConfig from "./config/multer";
import PointsControllers from "./controllers/PointsController";
import ItemsController from "./controllers/ItemsController";

const routes = express.Router();
const upload = multer(multerConfig);

const pointsController = new PointsControllers();
const itemsController = new ItemsController();

routes.get("/items", itemsController.index);
routes.post(
  "/points",
  upload.single("image"),
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      whatsapp: Joi.string().required(),
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
      state: Joi.string().max(2).required(),
      city: Joi.string().required(),
      items: Joi.string().required(),
    }),
  }, {
      abortEarly: false
  }),
  pointsController.create
);
routes.get("/points/:id", pointsController.show);
routes.get("/points/", pointsController.index);

export default routes;
