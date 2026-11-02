import { Router } from 'express';
const router = Router();
import { get, getOne, getSearch, create, update, remove } from '../controllers/indentTypeMasterNew.controller.js';


router.post('/:name', create);

router.get('/', get);

router.get('/:name', getOne);

router.get('/search/:searchKey', getSearch);

router.put('/:id', update);

router.delete('/:id', remove);

export default router;