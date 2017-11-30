/// <reference path="../model/model.style.js" />
/// <reference path="~/Scripts/lib/knockout-2.2.0.debug.js" />
var Style_vm = function () {
    var productMastersList = ko.observable(),
    getStyleData = function () {
        var obj = {
            customer: this.customerId(),
            Department: this.deptId(),
            Season: this.seasonId(),
            Description: this.description()
        }
        $.ajax({
            url: 'http://localhost:54082/api/Style/GetAllProdcutMasters',
            type: 'GET',
            dataType: 'json',
            data: JSON.stringify(obj),
            success: function (data, textStatus, xhr) {
                _.each(data,
                    function(prodMas) {
                        productMastersList().push(prodMas);
                    });
                productMastersList.valueHasMutated();
            },
            error: function(xhr, textStatus, errorThrown) {
                console.log('Error in Operation');
            }
        });
    },
    addStyle =  function() {
        var that = this;
        var obj = getStyleObj(that);
        $.ajax({
            url: 'http://localhost:54082/api/StyleController/GetAllProdcutMasters',
            type: 'GET',
            dataType: 'json',
            data: JSON.stringify(obj),
            success: function(data, textStatus, xhr) {
                productMastersList().push(data);
            },
            error: function(xhr, textStatus, errorThrown) {
                console.log('Error in Operation');
            }
        });

        var grid = $("#grid").kendoGrid({
            dataSource: kendoArr(),
            height: 550,
            groupable: true,
            sortable: true,
            pageable: {
                refresh: true,
                pageSizes: true,
                buttonCount: 5
            },
            columns: [
                {
                    field: "Customer",
                    title: "Customer",
                    width: 240
                }, {
                    field: "Department",
                    title: "Department"
                }, {
                    field: "Season",
                    title: "Season"
                }, {
                    field: "Description",
                    width: 150,
                    title: "Description"
                },
                {
                    field: "Style_No",
                    width: 150,
                    title: "Style No"
                }
            ]
        });
    }
    return {
        addStyle: addStyle,
        getStyleData: getStyleData
    }
}

var style = new Style_vm();



