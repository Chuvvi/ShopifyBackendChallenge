(function ($){
    var from = $('#from');
    var to = $('#to');
    var stock = $('#stock');
    var errorlabel = $('#errorlabel');

    // get all data
    function getData(){
        var req = {
            method: 'POST',
            url: '/getallitems'
        }
        $.ajax(req).then(function(items){
            var req2 = {
                method: 'POST',
                url: '/getallwarehouses'
            }
            $.ajax(req2).then(function(war){
                for(let i of items){
                    $('#from').append(`<option value="${i._id}item${i.stock}" id="${i._id}">Item ${i.title}</option>`);
                }
                for(let i of war){
                    $('#from').append(`<option value="${i._id}ware${i.capacity}" id="${i._id}">Warehouse ${i.name}</option>`);
                }
            })
        })
    }

    getData();

    $('#from').on('change', function(){
        $('#toStock').text('');
        if(this.value === "null"){
            to.empty();
            to.append(`<option value="null">Select One</option>`);
            $('#fromStock').text('');
        }
        else if(this.value.slice(24, 28) === "item"){
            // add only warehouses
            to.empty();
            to.append(`<option value="null">Select One</option>`);
            $('#fromStock').text(`Stock left: ${this.value.slice(28)}`);
            var req = {
                method: 'POST',
                url: '/getallwarehouses'
            };
            $.ajax(req).then(function(res){
                for(let i of res){
                    if(i.capacity !== 0) to.append(`<option value="${i._id}ware${i.capacity}" id="${i._id}">Warehouse ${i.name}</option>`);
                }
            })
        }
        else{
            // add only items
            to.empty();
            to.append(`<option value="null">Select One</option>`);
            $('#fromStock').text(`Capacity left: ${this.value.slice(28)}`);

            var req = {
                method: 'GET',
                url: `/warehouseinfo/${this.value.slice(0, 24)}`
            };
            $.ajax(req).then(function(res){
                for(let i of res.result.stock){
                    var req = {
                        method: 'GET',
                        url: `/iteminfo/${i.itemID}`
                    }
                    $.ajax(req).then(function(res){
                        to.append(`<option value="${i.itemID}item${i.stock}item${res.result.stock}" id="${i.itemID}">Item ${i.itemName}</option>`);
                    })
                }
            })
        }
    })

    $('#to').on('change', function(){
        if(this.value === "null") $('#toStock').text('');
        let params = this.value.split('item');
        if(this.value.slice(24, 28) === "item") $('#toStock').text(`Stock in warehouse: ${params[1]}, Stock left in inventory: ${params[2]}`);
        else $('#toStock').text(`Capacity left: ${this.value.slice(28)}`);
    })


    $('#transfer').on('click', function(){
        var fromReq = from.val().slice(0, 24);
        var toReq = to.val().slice(0, 24);
        var stockReq = stock.val();
        var decide = from.val().slice(24,28);

        if(fromReq === 'null') errorlabel.text("Please select a valid source");
        else if(toReq === 'null') errorlabel.text("Please select a valid destination");
        else{
            var fromOption = document.getElementById(`${fromReq}`);
            var fromOptionParams = fromOption.value.split('item');
            let fromParams = $('#fromStock').text().split(": ");
            let toParams = $('#toStock').text().split(": ");
            if(decide === 'item'){
                // use add item function
                var req = {
                    method: 'POST',
                    url: '/additems',
                    data: {
                        warehouseID: toReq,
                        itemID: fromReq,
                        stock: stockReq
                    }
                }
                $.ajax(req).then(function(res){
                    let newFrom = parseInt(fromParams[1]) - parseInt(stockReq);
                    let newTo = parseInt(toParams[1]) - parseInt(stockReq);
                    $('#fromStock').text(`${fromParams[0]}: ${newFrom}`);
                    $('#toStock').text(`${toParams[0]}: ${newTo}`);
                    fromOption.value = `${fromOptionParams[0]}item${newFrom}`;
                    errorlabel.text(res);
                }).fail(function(xhr, status, error){
                    errorlabel.text(xhr.responseJSON.error);
                })
            }
            else{
                // use retrieve function
                var req = {
                    method: 'POST',
                    url: '/retrieveitems',
                    data: {
                        warehouseID: fromReq,
                        itemID: toReq,
                        stock: stockReq
                    }
                }
                $.ajax(req).then(function(res){
                    let midSplit = toParams[1].split(',');
                    let newFrom = parseInt(fromParams[1]) + parseInt(stockReq);
                    let newStockWare = parseInt(midSplit[0]) - parseInt(stockReq);
                    let newStock = parseInt(toParams[2]) + parseInt(stockReq);
                    let fop = fromOptionParams[0].split('ware');
                    $('#fromStock').text(`${fromParams[0]}: ${newFrom}`);
                    $('#toStock').text(`${toParams[0]}: ${newStockWare}, ${midSplit[1]}: ${newStock}`);
                    fromOption.value = `${fop[0]}ware${newFrom}`;
                    errorlabel.text(res);
                }).fail(function(xhr, status, error){
                    errorlabel.text(xhr.responseJSON.error);
                })
            }
        }
    })




})(window.jQuery);