const express = require('express');
const router = express.Router();
const {inventory, warehouse} = require('../data');
const {checkStr, checkNum, checkID} = require('../errorHandling');

router.get('/', async(req, res) =>{
    res.render('render/home', {});
})

router.post('/additem', async(req, res) =>{
    try{
        const result = await inventory.create(req.body);
        return res.status(200).json(result);
    }
    catch (e){
        return res.status(400).json({error: e});
    }
})

router.post('/getallitems', async(req, res) =>{
    try{
        const result = await inventory.getAll();
        return res.status(200).json(result);
    }
    catch (e){
        return res.status(400).json({error: e});
    }
})

router.get('/item/:id', async(req, res) =>{
    try{
        const result = await inventory.get(req.params.id);
        return res.status(200).render('render/item', {result});
    }
    catch (e){
        return res.status(400).render('render/itemNotFound', {});
    }
})

router.get('/iteminfo/:id', async(req, res) =>{
    try{
        const result = await inventory.get(req.params.id);
        return res.status(200).json({result});
    }
    catch (e){
        return res.status(400).json({error: e});
    }
})

router.get('/edititems/:id', async(req, res) =>{
    try{
        const result = await inventory.get(req.params.id);
        return res.status(200).render('render/editItem', {result});
    }
    catch (e){
        return res.status(400).render('render/itemNotFound', {});
    }
})

router.post('/editItems/:id', async(req, res) =>{
    try{
        const result = await inventory.get(req.params.id);
        return res.status(200).json(result);
    }
    catch (e){
        return res.status(400).json({error: e});
    }
})

router.post('/updateitem', async(req, res) =>{
    try{
        const {newItem, id} = req.body;
        const result = await inventory.edit(newItem, id);
        return res.status(200).json(result);
    }
    catch (e){
        return res.status(400).json({error: e});
    }
})

router.post('/deleteitem/:id', async(req, res) =>{
    try{
        const result = await inventory.remove(req.params.id)
        return res.status(200).json(result);
    }
    catch (e){
        return res.status(400).json({error: e});
    }
})

router.post('/addwarehouse', async(req, res) =>{
    try{
        const result = await warehouse.create(req.body);
        return res.status(200).json(result);
    }
    catch(e){
        return res.status(400).json({error: e});
    }
})

router.get('/warehouse/:id', async(req, res) =>{
    try{
        const result = await warehouse.get(req.params.id);
        return res.status(200).render('render/warehouse', {result});
    }
    catch (e){
        return res.status(400).render('render/warehouseNotFound', {});
    }
})

router.get('/warehouseinfo/:id', async(req, res) =>{
    try{
        const result = await warehouse.get(req.params.id);
        return res.status(200).json({result});
    }
    catch (e){
        return res.status(400).json({error: e});
    }
})

router.post('/getallwarehouses', async(req, res) =>{
    try{
        const result = await warehouse.getAll();
        return res.status(200).json(result);
    }
    catch (e){
        return res.status(400).json({error: e});
    }
})

router.get('/warehouseinfo/:id', async(req, res) =>{
    try{
        const result = await warehouse.get(req.params.id);
        return res.status(200).json({result});
    }
    catch (e){
        return res.status(400).json({error: e});
    }
})

router.post('/retrieve', async(req, res) =>{
    try{
        const {warehouseID, itemID, stock} = req.body;
        const result = await warehouse.returnBack(warehouseID, itemID, stock)
        return res.status(200).json({result})
    }
    catch (e){
        console.log(e);
        return res.status(400).json({error: e});
    }
})

router.get('/editwarehouse/:id', async(req, res) =>{
    try{
        return res.status(200).render('render/editWarehouse', {});
    }
    catch (e){
        return res.status(400).render('render/warehouseNotFound', {});
    }
})

router.post('/updatewarehouse', async(req, res) =>{
    try{
        const {newWarehouse, id} = req.body;
        const result = await warehouse.edit(newWarehouse, id);
        return res.status(200).json(result);
    }
    catch (e){
        return res.status(400).json({error: e});
    }
})

router.post('/deletewarehouse/:id', async(req, res) =>{
    try{
        const result = await warehouse.remove(req.params.id)
        return res.status(200).json(result);
    }
    catch (e){
        return res.status(400).json({error: e});
    }
})

router.get('/transfer', async(req, res) =>{
    const result = await warehouse.getAll();
    return res.status(200).render('render/transfer', {result});
})

router.post('/additems', async(req, res) =>{
    try{
        const {warehouseID, itemID, stock} = req.body;
        const result = await warehouse.addItem(warehouseID, itemID, stock);
        return res.status(200).json(result);
    }
    catch (e){
        return res.status(400).json({error: e});
    }
})

router.post('/retrieveitems', async(req, res) =>{
    try{
        const {warehouseID, itemID, stock} = req.body;
        const result = await warehouse.returnBack(warehouseID, itemID, stock);
        return res.status(200).json(result);
    }
    catch (e){
        return res.status(400).json({error: e});
    }
})

module.exports = router;