(function ($){
    var itemID = $('#itemID');
    var iteminfo = $('#iteminfo');
    itemID.hide();
    var itemIDVal = itemID.text();
    var deleteStatus = $('#deleteStatus');
    deleteStatus.hide();

    function makeItemPost(data){
        let title = `<h1>${data.title}<h1>`;
        let desc = `<h2>${data.description}<h2>`;
        let cost = `<h2>Price: ${data.cost}<h2>`;
        let weight = `<h2>Weight: ${data.weight}<h2>`;
        let stock = `<h2>Stock left: ${data.stock}<h2>`;
        let warehouseStock = `<h2>Stock in warehouse: ${data.warehouseStock}<h2>`;
        let table = "";
        if(data.locations.length != 0){
            table = `<table class='center'><tr><th>Warehouse</th><th>Quantity</th><th>Actions</th></tr>`;
            for(let i of data.locations){
                const {warehouseID, warehouseName, stock} = i;
                table += `<tr><td>${warehouseName}</td><td>${stock}</td><td><label for='${warehouseID}'></label><input type='number' min='1' max='${stock}' name='${warehouseID}' id='${warehouseID}'></input><button class='btn retrieve' value='${warehouseID}${data._id}' onclick='window.location="/item/${data._id}"'>Retrieve Items</button></td></tr>`;
            }
            table += `</table>`;
        }
        let edit = `<button class='btn edit' value='${data._id}' onclick='window.location="/edititems/${data._id}"'>Edit</button>`;
        let del = `<button class='btn del' value='${data._id}'>Delete</button>`;
        return `<div id=${data._id}>${title}${desc}${cost}${weight}${stock}${warehouseStock}${table}${edit}${del}</div>`;
    }

    function buildPage(){
        var getInfo = {
            method: 'GET',
            url: `/iteminfo/${itemIDVal}`
        }
        $.ajax(getInfo).then(function(res){
            const {result} = res;
            iteminfo.append(makeItemPost(result));
        })
    }

    buildPage();

    $(document).on('click', 'button.del', function(){
        var id = this.value;
        var delReq = {
            method: 'POST',
            url: `/deleteitem/${id}`
        }
        $.ajax(delReq).then(function(){
            deleteStatus.show();
            iteminfo.empty();
        })
    })

    $(document).on('click', 'button.retrieve', function(){
        let warehouseID = this.value.substring(0, 24);
        let itemID = this.value.substring(24);
        let ip = $(`#${warehouseID}`);
        let stock = ip.val();
        var retrieveReq = {
            method: 'POST',
            url: '/retrieve',
            data: {
                warehouseID: warehouseID,
                itemID: itemID,
                stock: stock
            }
        }
        $.ajax(retrieveReq).then(function(res){

        })
    })
})(window.jQuery);