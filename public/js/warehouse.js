(function ($){
    var warehouseID = $('#warehouseID');
    var warehouseinfo = $('#warehouseinfo');
    warehouseID.hide();
    var warehouseIDVal = warehouseID.text();
    var deleteStatus = $('#deleteStatus');
    deleteStatus.hide();

    function makewarehousePost(data){
        let name = `<h1>${data.name}<h1>`;
        let location = `<h2>${data.location}<h2>`;
        let capacity = `<h2>Price: ${data.capacity}<h2>`;
        let capacityFilled = `<h2>Weight: ${data.capacityFilled}<h2>`;
        let table = "";
        if(data.stock.length != 0){
            table = `<table class='center'><tr><th>Item</th><th>Quantity</th><th>Actions</th></tr>`;
            for(let i of data.stock){
                const {itemID, itemName, stock} = i;
                table += `<tr><td>${itemName}</td><td>${stock}</td><td><label for='${itemID}'></label><input type='number' min='1' max='${stock}' name='${itemID}' id='${itemID}'></input><button class='btn returnn' value='${itemID}${data._id}' onclick='window.location="/warehouse/${data._id}"'>Return Items</button></td></tr>`;
            }
            table += `</table>`;
        }
        let edit = `<button class='btn edit' value='${data._id}' onclick='window.location="/editwarehouse/${data._id}"'>Edit</button>`;
        let del = `<button class='btn del' value='${data._id}'>Delete</button>`;
        return `<div id=${data._id}>${name}${location}${capacity}${capacityFilled}${table}${edit}${del}</div>`;
    }

    function buildPage(){
        var getInfo = {
            method: 'GET',
            url: `/warehouseinfo/${warehouseIDVal}`
        }
        $.ajax(getInfo).then(function(res){
            const {result} = res;
            warehouseinfo.append(makewarehousePost(result));
        })
    }

    buildPage();

    $(document).on('click', 'button.del', function(){
        var id = this.value;
        var delReq = {
            method: 'POST',
            url: `/deletewarehouse/${id}`
        }
        $.ajax(delReq).then(function(){
            deleteStatus.show();
            warehouseinfo.empty();
        })
    })

    $(document).on('click', 'button.returnn', function(){
        let itemID = this.value.substring(0, 24);
        let warehouseID = this.value.substring(24);
        let ip = $(`#${itemID}`);
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
            // warehouseinfo.empty();
        })
    })
})(window.jQuery);