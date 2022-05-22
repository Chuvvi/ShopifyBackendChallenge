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
                    $('#from').append(`<option value="${i._id}item">Item ${i.title}</option>`);
                    // $('#to').append(`<option value="${i._id}">Item ${i.title}</option>`);
                }
                for(let i of war){
                    $('#from').append(`<option value="${i._id}ware">Warehouse ${i.name}</option>`);
                    // $('#to').append(`<option value="${i._id}">Warehouse ${i.name}</option>`);
                }
            })
        })
    }

    getData();

    $('#from').on('change', function(){
        if(this.value === "null"){
            to.empty();
        }
        else if(this.value.substr(24) === "item"){
            // add only warehouses
            to.empty();
            var req = {
                method: 'POST',
                url: '/getallwarehouses'
            }
            $.ajax(req).then(function(res){
                for(let i of res) to.append(`<option value="${i._id}">Warehouse ${i.name}</option>`);
            })
        }
        else{
            // add only items
            to.empty();
            var req = {
                method: 'POST',
                url: '/getallitems'
            }
            $.ajax(req).then(function(res){
                for(let i of res) to.append(`<option value="${i._id}">Item ${i.title}</option>`);
            })
        }
    })


    $('#transfer').on('click', function(){
        var fromReq = from.val().substr(0, 24);
        var toReq = to.val();
        var stockReq = stock.val();
        var decide = from.val().substr(24);

        if(fromReq === 'null') errorlabel.text("Please select a valid source");
        else{
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
                    errorlabel.text(res);
                }).fail(function(xhr, status, error){
                    errorlabel.text(xhr.responseJSON.error);
                })
            }
        }
    })




})(window.jQuery);