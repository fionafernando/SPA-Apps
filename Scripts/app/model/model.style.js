$(document).ready(function () {
    function Style_model() {
        this.customerId = ko.observable(1);
        this.deptId = ko.observable();
        this.seasonId = ko.observable();
        this.description = ko.observable();
        this.styleNo = ko.observable();
        this.deptList = ko.observableArray();
        this.customerList = ko.observableArray();
        this.seasonList = ko.observableArray();
    };
    Style_model.prototype.update = function (data) {
        this.styleNo(data ? data.styleNo() : null);
        this.customerId(data ? data.customerId() : null);
        this.deptId(data ? data.deptId() : null);
        this.seasonId(data ? data.seasonId() : null);
    };
    ko.applyBindings(new Style_model());
});