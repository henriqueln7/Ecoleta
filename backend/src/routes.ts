import express from 'express';
import ItemController from "./controllers/ItemController";
import PointController from "./controllers/PointController";
import multer from 'multer';
import multerConfig from './config/multer';

const routes = express.Router();
const upload = multer(multerConfig);

const pointController = new PointController();
const itemController = new ItemController();

routes.get('/items', itemController.index);

routes.get('/points', pointController.index)
routes.get('/points/:id', pointController.show)

routes.post('/points', upload.single('image'), pointController.create);

export default routes;
