(function ($){
    // navigation
    var createInventory = $('#createInventory');
    var viewInventory = $('#viewInventory');
    var createWarehouse = $('#createWarehouse');
    var viewWarehouse = $('#viewWarehouse');

    // content
    var addInventory = $('#addInventory');
    var viewAllInventory = $('#viewAllInventory');
    var addWarehouse = $('#addWarehouse');
    var viewAllWarehouse = $('#viewAllWarehouse');

    // hide all content
    function onLoad(){
        addInventory.hide();
        viewAllInventory.hide();
        addWarehouse.hide();
        viewAllWarehouse.hide();
        $('#success').hide();
        $('#successWarehouse').hide();
    }

    // error handling
    var errorlabel = $('#errorlabel');
    var warehouseError = $('#warehouseError');

    function checkStr(str, name){
        if(str === null || str === undefined) throw `${name} not provided`;
        if(typeof str !== 'string') throw `${name} is not a string`;
        str = str.trim();
        if(str.length === 0) throw `${name} is empty`;
        return str;
    }
    
    function checkNum(num, name, type){
        num = checkStr(num, name);
        if(type === 'float') num = parseFloat(num);
        else if(type === 'int'){
            if(num.includes('.')) throw `${name} cannot be a a decimal`;
            num = parseInt(num);
        }
        if(isNaN(num)) throw `${name} is not a number`;
        if(num <= 0) throw `${name} cannot be 0 or less`;
        return num;
    }

    // populating divs
    function makeItemPost(data){
        let title = `<h1>${data.title}<h1>`;
        let desc = `<h2>${data.description}<h2>`;
        let cost = `<h2>Price: ${data.cost}<h2>`;
        let weight = `<h2>Weight: ${data.weight}<h2>`;
        let stock = `<h2>Stock left: ${data.stock}<h2>`;
        let warehouseStock = `<h2>Stock in warehouse: ${data.warehouseStock}<h2>`;
        let edit = `<button class='btn edit' value='${data._id}' onclick='window.location="/edititems/${data._id}"'>Edit</button>`;
        let del = `<button class='btn del' value='${data._id}'>Delete</button>`;
        let more = `<button class='btn more' value='${data._id}' onclick='window.location="/item/${data._id}"'>More Details</button>`;
        return `<div id=${data._id}>${title}${desc}${cost}${weight}${stock}${warehouseStock}${edit}${del}${more}</div>`;
    }

    function makeWarehousePost(data){
        let name = `<h1>${data.name}<h1>`;
        let location = `<h2>Location: ${data.location}<h2>`;
        let capacity = `<h2>Capacity: ${data.capacity}<h2>`;
        let capacityFilled = `<h2>Capacity filled: ${data.capacityFilled}<h2>`;
        let edit = `<button class='btn edit' value='${data._id}' onclick='window.location="/editwarehouse/${data._id}"'>Edit</button>`;
        let del = `<button class='btn delWarehouse' value='${data._id}'>Delete</button>`;
        let more = `<button class='btn moreWarehouse' value='${data._id}' onclick='window.location="/warehouse/${data._id}"'>More Details</button>`;
        return `<div id=${data._id}>${name}${location}${capacity}${capacityFilled}${edit}${del}${more}</div>`;
    }

    function getAllItems(){
        var getAllItemsReq = {
            method: 'POST',
            url: '/getallitems'
        }
        $.ajax(getAllItemsReq).then(function(res){
            for(let i in res){
                viewAllInventory.prepend(makeItemPost(res[i]));
            }
        })
    }

    function getAllWarehouses(){
        var getAllWarehousesReq = {
            method: 'POST',
            url: '/getallwarehouses'
        }
        $.ajax(getAllWarehousesReq).then(function(res){
            for(let i in res){
                viewAllWarehouse.prepend(makeWarehousePost(res[i]));
            }
        })
    }

    onLoad();

    createInventory.on('click', function(){
        onLoad();
        addInventory.show();
    })

    viewInventory.on('click', function(){
        onLoad();
        viewAllInventory.show();
        viewAllInventory.empty();
        getAllItems();
    })

    createWarehouse.on('click', function(){
        onLoad();
        addWarehouse.show();
    })

    viewWarehouse.on('click', function(){
        onLoad();
        viewAllWarehouse.show();
        viewAllWarehouse.empty();
        getAllWarehouses();
    })

    // inventory creation
    $('#create').on('click', function(event){
        event.preventDefault();

        try{
            var titleIP = $('#titleIP');
            var titleIPVal = checkStr(titleIP.val().trim(), 'Title');

            var descIP = $('#descIP');
            var descIPVal = checkStr(descIP.val().trim(), 'Description');

            var costIP = $('#costIP');
            var costIPVal = checkNum(costIP.val().trim(), 'Cost', 'float');

            var stockIP = $('#stockIP');
            var stockIPVal = checkNum(stockIP.val().trim(), 'Stock', 'int');

            var weightIP = $('#weightIP');
            var weightIPVal = checkNum(weightIP.val().trim(), 'Weight', 'float');

            var newItem = {
                title: titleIPVal,
                description: descIPVal,
                cost: costIPVal,
                stock: stockIPVal,
                weight: weightIPVal
            }

            var postItem = {
                method: 'POST',
                url: '/additem',
                data: newItem
            }
            $.ajax(postItem).then(function(){

            })

            $('#itemForm')[0].reset();
            $('#success').show()
            errorlabel.hide();
        }
        catch (e){
            $('#success').hide()
            errorlabel.text(e);
            errorlabel.show();
        }

    })

    // delete button functionality
    $(document).on('click', 'button.del', function(){
        var id = this.value;
        var delReq = {
            method: 'POST',
            url: `/deleteitem/${id}`
        }
        $.ajax(delReq).then(function(){
            viewAllInventory.empty();
            getAllItems();
        })
    })

    // warehouse creation
    $('#addWarehouseBtn').on('click', function(event){
        event.preventDefault();
        try{
            var nameIP = $('#nameIP');
            var nameIPVal = checkStr(nameIP.val().trim(), 'Warehouse name');

            var locationIP = $('#locationIP');
            var locationIPVal = checkStr(locationIP.val().trim(), 'Warehouse location');

            var capacityIP = $('#capacityIP');
            var capacityIPVal = checkNum(capacityIP.val().trim(), 'Warehouse capacity', 'int');

            var newWarehouse = {
                name: nameIPVal,
                location: locationIPVal,
                capacity: capacityIPVal
            }

            var postWarehouse = {
                method: 'POST',
                url: '/addwarehouse',
                data: newWarehouse
            }
            $.ajax(postWarehouse).then(function(res){

            })

            $('#warehouseForm')[0].reset();
            $('#successWarehouse').show()
            warehouseError.hide();
        }
        catch (e){
            $('#successWarehouse').hide()
            warehouseError.text(e);
            warehouseError.show();
        }
    })

    // warehouse delete button functionality
    $(document).on('click', 'button.delWarehouse', function(){
        var id = this.value;
        var delReq = {
            method: 'POST',
            url: `/deletewarehouse/${id}`
        }
        $.ajax(delReq).then(function(){
            viewAllWarehouse.empty();
            getAllWarehouses();
        })
    })


})(window.jQuery);