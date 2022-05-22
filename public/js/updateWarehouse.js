(function ($){
    var update = $('#update');

    // error handling
    var errorlabel = $('#errorlabel');

    
    $('#success').hide();
    $('#warehouseID').hide();

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

    update.on('click', function(event){
        event.preventDefault();
        try{
            var newWarehouse = {};

            var nameIP = $('#nameIP');
            if(nameIP.val().trim().length != 0){
                newWarehouse['name'] = checkStr(nameIP.val().trim(), 'Warehouse name');
                nameIP.attr('placeholder', newWarehouse['name']);
                $('#heading').text(`Update Warehouse ${newWarehouse['name']}`);
            }

            var locationIP = $('#locationIP');
            if(locationIP.val().trim().length != 0){
                newWarehouse['location'] = checkStr(locationIP.val().trim(), 'Warehouse location');
                locationIP.attr('placeholder', newWarehouse['location']);
            }

            var capacityIP = $('#capacityIP');
            if(capacityIP.val().trim().length != 0){
                newWarehouse['capacity'] = checkNum(capacityIP.val().trim(), 'Warehouse Capacity', 'int');
                capacityIP.attr('placeholder', newWarehouse['capacity']);
            }

            var updateWarehouse = {
                method: 'POST',
                url: '/updatewarehouse',
                data: {
                    newWarehouse: newWarehouse,
                    id: $('#warehouseID').text()
                }
            }
            $.ajax(updateWarehouse).then(function(){
                $('#success').show();
                $('#updateForm')[0].reset();
            })

            errorlabel.hide();
        }
        catch (e){
            $('#success').hide();
            errorlabel.text(e);
            errorlabel.show();
        }
    })

})(window.jQuery);