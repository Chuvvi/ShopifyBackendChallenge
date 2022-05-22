const { ObjectId } = require('mongodb');
const mongoCollections = require('../config/mongoCollections');
const inventory = mongoCollections.inventory;
const warehouse = mongoCollections.warehouse;
const {checkStr, checkNum, checkID} = require('../errorHandling');

async function create(params){
    let {title, description, cost, stock, weight} = params
    title = checkStr(title, 'Title');
    description = checkStr(description, 'Description');
    cost = checkNum(cost, 'Cost', 'float');
    stock = checkNum(stock, 'Stock', 'int');
    weight = checkNum(weight, 'Weight', 'float');
    let newItem = {
        title: title,
        description: description,
        cost: cost,
        stock: stock,
        warehouseStock: 0,
        locations: [],
        weight: weight
    };
    const inventoryCollection = await inventory();
    const res = await inventoryCollection.insertOne(newItem);
    if(!res.acknowledged || !res.insertedId) throw `Could not insert item`;
    return `${title} added to inventory!`;
}

async function edit(updateParams, id){
    checkID(id);
    if(updateParams === null) throw `Could not find update content.`;
    const inventoryCollection = await inventory();
    const item = await inventoryCollection.findOne({_id: ObjectId(id)});
    if(item === null) throw `Could not find item.`;
    if(updateParams.title !== undefined) updateParams.title = checkStr(updateParams.title, 'Title');
    if(updateParams.description !== undefined) updateParams.description = checkStr(updateParams.description, 'Description');
    if(updateParams.cost !== undefined) updateParams.cost = checkNum(updateParams.cost, 'Cost', 'float');
    if(updateParams.stock !== undefined) updateParams.stock = checkNum(updateParams.stock, 'Stock', 'int');
    if(updateParams.weight !== undefined) updateParams.weight = checkNum(updateParams.weight, 'Weight', 'float');
    const res = await inventoryCollection.updateOne({_id: ObjectId(id)}, {$set: updateParams});
    if(!res.acknowledged || !res.modifiedCount) throw `Could not update ${item.title}. Please try again.`;
    return `${item.title} updated successfully!`;
}

async function remove(id){
    checkID(id);
    const inventoryCollection = await inventory();
    const item = await inventoryCollection.findOne({_id: ObjectId(id)});
    if(item === null) throw `Could not find item.`;
    for(let i of item.locations){
        const {warehouseID, stock} = i;
        const result = await ship(warehouseID, id, `${stock}`);
    }
    const res = await inventoryCollection.deleteOne({_id: ObjectId(id)});
    if(!res.acknowledged || !res.deletedCount) throw `Could not delete ${item.title}. Please try again.`;
    return `${item.title} deleted successfully!`;
}

async function getAll(){
    const inventoryCollection = await inventory();
    const res =  await inventoryCollection.find({}).toArray();
    return res;
}

async function get(id){
    checkID(id);
    const inventoryCollection = await inventory();
    const res =  await inventoryCollection.findOne({_id: ObjectId(id)});
    if(res === null) throw `Item not found`;
    return res;
}

// ship items
async function ship(warehouseID, itemID, stock){
    let item = await get(itemID);
    let w = await getWarehouse(warehouseID);
    let res;
    stock = checkNum(stock, 'Item stock', 'int');

    const inventoryCollection = await inventory();
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

// warehouse helper function
async function getWarehouse(id){
    checkID(id);
    const warehouseCollection = await warehouse();
    const res =  await warehouseCollection.findOne({_id: ObjectId(id)});
    if(res === null) throw `Warehouse not found`;
    return res;
}

module.exports = {
    create,
    edit,
    remove,
    getAll,
    get
}