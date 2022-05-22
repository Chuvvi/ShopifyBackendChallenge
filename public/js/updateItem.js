(function ($){
    var update = $('#update');

    // error handling
    var errorlabel = $('#errorlabel');

    
    $('#success').hide();
    $('#itemID').hide();

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
            var newItem = {};

            var titleIP = $('#titleIP');
            if(titleIP.val().trim().length != 0){
                newItem['title'] = checkStr(titleIP.val().trim(), 'Title');
                titleIP.attr('placeholder', newItem['title']);
                $('#heading').text(`Update Item ${newItem['title']}`);
            }

            var descIP = $('#descIP');
            if(descIP.val().trim().length != 0){
                newItem['description'] = checkStr(descIP.val().trim(), 'Description');
                descIP.attr('placeholder', newItem['description']);
            }

            var costIP = $('#costIP');
            if(costIP.val().trim().length != 0){
                newItem['cost'] = checkNum(costIP.val().trim(), 'Cost', 'float');
                costIP.attr('placeholder', newItem['cost']);
            }

            var stockIP = $('#stockIP');
            if(stockIP.val().trim().length != 0){
                newItem['stock'] = checkNum(stockIP.val().trim(), 'Stock', 'int');
                stockIP.attr('placeholder', newItem['stock']);
            }

            var weightIP = $('#weightIP');
            if(weightIP.val().trim().length != 0){
                newItem['weight'] = checkNum(weightIP.val().trim(), 'Weight', 'float');
                weightIP.attr('placeholder', newItem['weight']);
            }

            var updateItem = {
                method: 'POST',
                url: '/updateitem',
                data: {
                    newItem: newItem,
                    id: $('#itemID').text()
                }
            }
            $.ajax(updateItem).then(function(){
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