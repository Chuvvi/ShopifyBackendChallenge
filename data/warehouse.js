const { ObjectId, Collection } = require('mongodb');
const mongoCollections = require('../config/mongoCollections');
const warehouse = mongoCollections.warehouse;
const inventoryDB = mongoCollections.inventory;
const inventory = require('./inventory');
const {checkStr, checkNum, checkID} = require('../errorHandling');

async function create(params){
    let {name, location, capacity} = params;
    name = checkStr(name, 'Warehouse name');
    location = checkStr(location, 'Warehouse location');
    capacity = checkNum(capacity, 'Warehouse capacity', 'int');
    let newWarehouse = {
        name: name,
        location: location,
        capacity: capacity,
        capacityFilled: 0,
        stock: []
    };
    const warehouseCollection = await warehouse();
    const res = await warehouseCollection.insertOne(newWarehouse);
    if(!res.acknowledged || !res.insertedId) throw `Could not add warehouse`;
    return `${name} added!`;
}

async function edit(updateParams, id){
    checkID(id);
    if(updateParams === null) throw `Could not find update content.`;
    const warehouseCollection = await warehouse();
    const w = await warehouseCollection.findOne({_id: ObjectId(id)});
    if(w === null) throw `Could not find warehouse.`;
    if(updateParams.name !== undefined) updateParams.name = checkStr(updateParams.name, 'Warehouse name');
    if(updateParams.location !== undefined) updateParams.location = checkStr(updateParams.location, 'Warehouse location');
    if(updateParams.capacity !== undefined) updateParams.capacity = checkNum(updateParams.capacity, 'Warehouse capacity', 'int');
    const res = await warehouseCollection.updateOne({_id: ObjectId(id)}, {$set: updateParams});
    if(!res.acknowledged || !res.modifiedCount) throw `Could not update ${w.name}. Please try again.`;
    return `${w.name} updated successfully!`;
}

async function remove(id){
    checkID(id);
    const warehouseCollection = await warehouse();
    const w = await warehouseCollection.findOne({_id: ObjectId(id)});
    if(w === null) throw `Could not find warehouse.`;

    // return all the warehouse items back
    for(let i of w.stock){
        const {itemID, stock} = i;
        const result = await returnBack(id, itemID, `${stock}`);
    }

    const res = await warehouseCollection.deleteOne({_id: ObjectId(id)});
    if(!res.acknowledged || !res.deletedCount) throw `Could not delete ${w.name}.`;
    return `${w.name} deleted successfully!`;
}

async function getAll(){
    const warehouseCollection = await warehouse();
    const res =  await warehouseCollection.find({}).toArray();
    if(res.length === 0) throw `No warehouses to display`
    return res;
}

async function get(id){
    checkID(id);
    const warehouseCollection = await warehouse();
    const res =  await warehouseCollection.findOne({_id: ObjectId(id)});
    if(res === null) throw `Warehouse not found`;
    return res;
}

async function addItem(warehouseID, itemID, stock){
    let item = await inventory.get(itemID);
    let w = await get(warehouseID);
    let res;
    stock = checkNum(stock, 'Item stock', 'int');
    if(item.stock < stock) throw `'${item.title}' stock is less than the demand`;
    if(stock + w.capacityFilled > w.capacity) throw `Warehouse ${w.name} capacity exceeded`;
    
    // update params
    item.stock -= stock;
    item.warehouseStock += stock;
    w.capacity -= stock;
    w.capacityFilled += stock;

    // check if warehouse already exists as a subdocument
    const inventoryCollection = await inventoryDB();
    const warehouseCollection = await warehouse();
    res = await inventoryCollection.findOne({'_id': ObjectId(itemID), 'locations.warehouseID': warehouseID});
    if(res !== null){
        res = await inventoryCollection.updateOne({
            '_id': ObjectId(itemID),
            'locations.warehouseID': warehouseID
        },
        {
            '$set' : {
                'stock': item.stock,
                'warehouseStock': item.warehouseStock,
            },
            '$inc' : {
                'locations.$.stock': stock
            }
        })

        res = await warehouseCollection.updateOne({
            '_id': ObjectId(warehouseID),
            'stock.itemID': itemID
        },
        {
            '$set' : {
                'capacity': w.capacity,
                'capacityFilled': w.capacityFilled
            },
            '$inc' : {
                'stock.$.stock': stock
            }
        })
    }

    // if warehouse does not exist
    else{
        item.locations.push({
            warehouseID: warehouseID,
            warehouseName: w.name,
            stock: stock
        });
        const itemUpdate = {
            stock: `${item.stock}`,
            warehouseStock: item.warehouseStock,
            locations: item.locations
        }
        res = await inventory.edit(itemUpdate, itemID)

        // update warehouse
        w.stock.push({
            itemID: itemID,
            itemName: item.title,
            stock: stock
        });
        const warehouseUpdate = {
            capacity: `${w.capacity}`,
            capacityFilled: w.capacityFilled,
            stock: w.stock
        }
        res = await edit(warehouseUpdate, warehouseID);
    }
    return `${stock} of item '${item.title}' added to warehouse '${w.name}'!`;
}

// return back items
async function returnBack(warehouseID, itemID, stock){
    let item = await inventory.get(itemID);
    let w = await get(warehouseID);
    let res;
    stock = checkNum(stock, 'Item stock', 'int');

    const inventoryCollection = await inventoryDB();
    const warehouseCollection = await warehouse();
    res = await inventoryCollection.aggregate([
        {
            '$match': {'_id': ObjectId(itemID), 'locations.warehouseID': warehouseID}
        },
        {
            '$project':{
                'locations': {
                    '$filter': {
                        'input': '$locations',
                        'as': 'locations',
                        'cond': {'$eq': ['$$locations.warehouseID', warehouseID]}
                    }
                }
            }
        }
    ]).toArray();
    if(res.length === 0) throw `Item '${item.title}' not found in warehouse '${w.name}`;
    res = res[0];
    if(res.locations[0].stock < stock) throw `Insufficient items to return`;
    
    // update params
    let newStock = res.locations[0].stock - stock;
    item.stock += stock;
    item.warehouseStock -= stock;
    w.capacity += stock;
    w.capacityFilled -= stock

    if(newStock === 0){
        // remove it from warehouse and item
        // update items
        res = await inventoryCollection.updateOne({
            '_id': ObjectId(itemID),
            'locations.warehouseID': warehouseID
        },
        {
            '$pull': {'locations': {'warehouseID': warehouseID}},
            '$set': {
                'stock': item.stock,
                'warehouseStock': item.warehouseStock
            }
        })
        // update warehouse
        res = await warehouseCollection.updateOne({
            '_id': ObjectId(warehouseID),
            'stock.itemID': itemID
        },
        {
            '$pull': {'stock': {'itemID': itemID}},
            '$set': {
                'capacity': w.capacity,
                'capacityFilled': w.capacityFilled
            }
        })
    }
    else{
        // update it from warehouse and item
        // update items
        res = await inventoryCollection.updateOne({
            '_id': ObjectId(itemID),
            'locations.warehouseID': warehouseID
        },
        {
            '$set': {
                'stock': item.stock,
                'warehouseStock': item.warehouseStock
            },
            '$inc' : {
                'locations.$.stock': -stock
            }
        })

        // update warehouse
        res = await warehouseCollection.updateOne({
            '_id': ObjectId(warehouseID),
            'stock.itemID': itemID
        },
        {
            '$set': {
                'capacity': w.capacity,
                'capacityFilled': w.capacityFilled,
            },
            '$inc': {
                'stock.$.stock': -stock
            }
        })
    }
    return `${stock} of '${item.title}' returned back to warehouse '${w.name}'!`;
}

// ship items
async function ship(warehouseID, itemID, stock){
    let item = await inventory.get(itemID);
    let w = await get(warehouseID);
    let res;
    stock = checkNum(stock, 'Item stock', 'int');

    const inventoryCollection = await inventoryDB();
    const warehouseCollection = await warehouse();
    res = await inventoryCollection.aggregate([
        {
            '$match': {'_id': ObjectId(itemID), 'locations.warehouseID': warehouseID}
        },
        {
            '$project':{
                'locations': {
                    '$filter': {
                        'input': '$locations',
                        'as': 'locations',
                        'cond': {'$eq': ['$$locations.warehouseID', warehouseID]}
                    }
                }
            }
        }
    ]).toArray();
    if(res.length === 0) throw `Item '${item.title}' not found in warehouse '${w.name}`;
    res = res[0];
    if(res.locations[0].stock < stock) throw `Insufficient items to ship`;

    // update params
    let newStock = res.locations[0].stock - stock;
    item.warehouseStock -= stock;
    w.capacity += stock;
    w.capacityFilled -= stock

    if(newStock === 0){
        // remove it from warehouse and item
        // update items
        res = await inventoryCollection.updateOne({
            '_id': ObjectId(itemID),
            'locations.warehouseID': warehouseID
        },
        {
            '$pull': {'locations': {'warehouseID': warehouseID}},
            '$set': {
                'warehouseStock': item.warehouseStock
            }
        })
        // update warehouse
        res = await warehouseCollection.updateOne({
            '_id': ObjectId(warehouseID),
            'stock.itemID': itemID
        },
        {
            '$pull': {'stock': {'itemID': itemID}},
            '$set': {
                'capacity': w.capacity,
                'capacityFilled': w.capacityFilled
            }
        })
    }
    else{
        // update it from warehouse and item
        // update items
        res = await inventoryCollection.updateOne({
            '_id': ObjectId(itemID),
            'locations.warehouseID': warehouseID
        },
        {
            '$set': {
                'warehouseStock': item.warehouseStock
            },
            '$inc' : {
                'locations.$.stock': -stock
            }
        })

        // update warehouse
        res = await warehouseCollection.updateOne({
            '_id': ObjectId(warehouseID),
            'stock.itemID': itemID
        },
        {
            '$set': {
                'capacity': w.capacity,
                'capacityFilled': w.capacityFilled,
            },
            '$inc': {
                'stock.$.stock': -stock
            }
        })
    }
    return `${stock} of '${item.title}' from warehouse '${w.name}' shipped!`;
}

module.exports = {
    create,
    edit,
    remove,
    getAll,
    get,
    addItem,
    returnBack,
    ship
}