define('model.costingSheetItem',
    ['ko', 'config', 'utils', 'model.rmBrief'],
    function (ko, config, utils, rmBrief) {
        var CostingSheetItem = function () {
            var self = this;
            self.id = ko.observable();
            self.description = ko.observable();
            self.costSheetId = ko.observable();
            self.rmCategoryId = ko.observable();
            self.name = ko.observable().extend({
                customValidation: {
                    method: function (val, otherVal) {
                        return self.rmCategoryId() > 0 || !(val === undefined || val === null);
                    },
                    params: {
                        value: null,
                        message: 'Name is Required'
                    }
                }
            });
            self.bomId = ko.observable();
            self.itemNo = ko.observable();
            self.position = ko.observable();
            self.rmCategory = ko.observable();
            self.rmId = ko.observable();
            self.supplierId = ko.observable();
            self.supplier = ko.observable();
            self.rmReferenceNo = ko.observable();
            self.measurement = ko.observable();
            self.measurementId = ko.observable();
            self.rmColour = ko.observable();
            self.rmColourId = ko.observable();
            self.previousValue = ko.observable();
            self.previousValueCost = ko.observable();
            self.meterToYardRatio = 0.9144;
            self.yardsToMeterRatio = 1.09361;
            //self.costingPropertyValue = ko.observable();//PBA not in use
            //initially all are included in the calculation
            self.isUsedForCal = ko.observable(true);
            self.isMappedForAll = ko.observable(false);
            self.itemOptionId = ko.observable();
            self.sequenceNo = ko.observable();
            self.consumptionUOMId = ko.observable().extend({
                //required: { params: true, message: config.validationMessages.required("COF") } ,
                csItemReq: { catId: self.rmCategoryId, params: { message: "Consumption UOM is Required" } },
                customValidation: {
                    method: function (val, otherVal) {
                        return !(self.rmCategoryId() > 0) || !self.costUOMId || !self.consumptionUOMId
                            || self.consumptionUOMId() == self.costUOMId();
                    },
                    params: {
                        value: null,
                        message: 'Should match with Price UOM '
                    }
                }
            });
            self.netConsumption = ko.observable().extend({
                csItemReq: { catId: self.rmCategoryId, params: { message: "Net Consumption" } },
                customValidation: {
                    method: function (val, otherVal) {
                        if (self.rmCategoryId() > 0 && (!val || isNaN(val)) && val != 0) {
                            return false;
                        } else {
                            return true;
                        }
                    },
                    params: {
                        value: null,
                        message: 'Invalid Net Consumption'
                    }
                }
            });
            self.wastage = ko.observable().extend({
                csItemReq: { catId: self.rmCategoryId, params: { message: "Wastage" } },
               // csItemReq: { param: self.rmCategoryId(), message: "Wastage" },
                customValidation: {
                    method: function (val, otherVal) {
                        if (self.rmCategoryId() > 0 && (!val || isNaN(val)) && val != 0) {
                            return false;
                        } else {
                            return true;
                        }
                    },
                    params: {
                        value: null,
                        message: 'Invalid Wastage '
                    }
                }
            });
            self.pcPerPack = ko.observable(1).extend({
                csItemReq: { catId: self.rmCategoryId, params: { message: "Pc Per Pack" } },
                customValidation: {
                    method: function (val, otherVal) {
                        if ( (!val || isNaN(val)) && val != 0) {
                            return false;
                        }
                        else {
                            return true;
                        }
                    },
                    params: {
                        value: null,
                        message: 'Invalid Pc Per Pack'
                    }
                }
            });
            self.moq = ko.observable();
            self.mcq = ko.observable();
            self.ratio = ko.observable().extend({
                csItemReq: { catId: self.rmCategoryId, params: { message: "Ratio" } },
               // csItemReq: { param: self.rmCategoryId(), message: "Ratio"},
                customValidation: {
                    method: function (val, otherVal) {
                        if ( !val || val == 0 || isNaN(val)) {
                            return false;
                        } else {
                            return true;
                        }
                    },
                    params: {
                        value: null,
                        message: 'Invalid Ratio '
                    }
                }
            });
            self.fobPrice = ko.observable().extend({
                required: { params: true, message: "fob Price" },
                customValidation: {
                    method: function (val, otherVal) {
                       if ((!val || isNaN(val)) && val != 0) {
                            return false;
                        } else {
                            return true;
                        }
                    },
                    params: {
                        value: null,
                        message: 'Invalid FOB Price'
                    }
                }
            });
            self.cof = ko.observable(0).extend({ required: { params: true, message: config.validationMessages.required("COF") } });
            self.freightModeId = ko.observable();
            self.costUOMId = ko.observable().extend({
                required: { params: true, message: config.validationMessages.required("Price UOM") },
               // csItemReq: { catId: self.rmCategoryId, params: { message: "Price UOM" } },
                customValidation: {
                    method: function (val, otherVal) {
                        if (self.rmCategoryId() > 0 && self.consumptionUOMId() != self.costUOMId()) {
                            return false;
                        } else {
                            return true;
                        }
                    },
                    params: {
                        value: null,
                        message: 'Should match with Consumption UOM '
                    }
                }
            });
            self.pricePer = ko.observable().extend({ required: { params: true, message: config.validationMessages.required("Price Per") } });
            self.currencyId = ko.observable().extend({ required: { params: true, message: config.validationMessages.required("Currency") } });
            self.searchRMNo = ko.observable();
            self.displayColorId = ko.observable();
            self.rmBrief = new rmBrief();
            self.rate = ko.observable(1);
            self.totalOrderQty = ko.observable();
            self.costingPropertyValues = ko.observableArray();
            self.pricePerforCalc = ko.computed(function () {
                //selected Meters
                if ((self.previousValueCost() == 9 && self.costUOMId() == 3) || (self.previousValueCost() == undefined && self.costUOMId() == 3)) {
                    var cons = parseFloat(self.pricePer()) * parseFloat(self.meterToYardRatio);
                    if (isNaN(cons)) {
                        self.previousValueCost(3);
                        self.pricePer(0);
                    } else {
                        self.previousValueCost(3);
                        self.pricePer(cons.toFixed(4));
                    }
                    //selected Yards
                } else if ((self.previousValueCost() == 3 && self.costUOMId() == 9) || (self.previousValueCost() == undefined && self.costUOMId() == 9)) {
                    var cons1 = parseFloat(self.pricePer()) * parseFloat(self.yardsToMeterRatio);
                    if (isNaN(cons1)) {
                        self.previousValueCost(9);
                        self.pricePer(0);
                    } else {
                        self.previousValueCost(9);
                        self.pricePer(cons1.toFixed(4));
                    }
                } else {
                    self.previousValueCost(self.costUOMId());
                }
            });
            self.netConsumptionForCal = ko.computed(function () {
                //selected Meters
                if ((self.previousValue() == 9 && self.consumptionUOMId() == 3) || (self.previousValue() == undefined && self.consumptionUOMId() == 3)) {
                    var cons = parseFloat(self.netConsumption()) * parseFloat(self.meterToYardRatio);
                    if (isNaN(cons)) {
                        self.previousValue(3);
                        self.netConsumption(0);
                    } else {
                        self.previousValue(3);
                        self.netConsumption(cons.toFixed(4));
                    }
                    //selected Yards
                } else if ((self.previousValue() == 3 && self.consumptionUOMId() == 9) || (self.previousValue() == undefined && self.consumptionUOMId() == 9)) {
                    var cons1 = parseFloat(self.netConsumption()) * parseFloat(self.yardsToMeterRatio);
                    if (isNaN(cons1)) {
                        self.previousValue(9);
                        self.netConsumption(0);
                    } else {
                        self.previousValue(9);
                        self.netConsumption(cons1.toFixed(4));
                    }
                } else {
                    self.previousValue(self.consumptionUOMId());
                }
            });

            self.OtherfinalTotal = ko.computed(function () {
                if (self.fobPrice() != null && self.pricePer() != null && self.currencyId() != null ) {
                    return parseFloat(self.fobPrice() * self.pricePer() * 1);
                } else {
                    return 0;
                }
            });
            self.grossValue2ForCalculation = ko.computed(function () {
                if (self.netConsumption() != null && self.wastage() != null) {
                    return (parseFloat(parseFloat(self.netConsumption()) + (parseFloat(self.netConsumption()) * (parseFloat(self.wastage()) / 100))));
                } else {
                    return 0;
                }
            });
            self.grossValue = ko.computed(function () {
                if (self.netConsumption() != null && self.wastage() != null) {
                    return (parseFloat(parseFloat(self.netConsumption()) + (parseFloat(self.netConsumption()) * (parseFloat(self.wastage()) / 100)))).toFixed(3);
                } else {
                    return 0;
                }
            });
            self.cifForCalculation = ko.computed(function () {
                if (self.fobPrice() != null && self.cof() != null) {
                    return parseFloat(parseFloat(self.fobPrice()) + parseFloat(self.cof()));
                } else {
                    return 0;
                }
            });
            self.surcharge = ko.computed(function() {
                if (self.mcq() != null && self.mcq() != 0 && self.grossValue2ForCalculation() != null && self.grossValue2ForCalculation() > 0 &&
                    self.totalOrderQty() != null && self.totalOrderQty() != 0 && self.cifForCalculation() != 0) {
                    return (parseFloat((parseFloat(self.mcq()) - (parseFloat(self.totalOrderQty()) * parseFloat(self.grossValue2ForCalculation()))) * parseFloat(self.cifForCalculation())) / parseFloat(self.totalOrderQty())).toFixed(3);
                } else {
                    return 0;
                }
            });
            self.reqMCQ = ko.computed(function () {
                if (self.mcq() != null && self.grossValue2ForCalculation() != null && self.grossValue2ForCalculation() > 0) {
                    return (parseFloat(parseFloat(self.mcq()) / parseFloat(self.grossValue2ForCalculation()))).toFixed(3);
                } else {
                    return 0;
                }
            });
            self.cif = ko.computed(function () {
                if (self.fobPrice() != null && self.cof() != null) {
                    return parseFloat(parseFloat(self.fobPrice()) + parseFloat(self.cof())).toFixed(3);
                } else {
                    return 0;
                }
            });
            self.finalTotal = ko.computed(function () {
                if (self.currencyId() != null && self.consumptionUOMId() == self.costUOMId()) {
                    if (self.grossValue2ForCalculation() != null && self.pcPerPack() != null && self.ratio() != null && self.pricePer() != null) {
                        return parseFloat((self.grossValue2ForCalculation() * self.pcPerPack() * self.ratio() * (self.cifForCalculation() / self.pricePer())) * self.rate()).toFixed(3);
                    } else {
                        return 0;
                    }
                } else {
                    return 0;
                }
            });
            self.dirtyFlag = new ko.DirtyFlag([
                 self.name,
                 self.description,
                 self.supplierId,
                 self.position,
                 self.rmId,
                 self.measurementId,
                 self.rmColourId,
                 self.consumptionUOMId,
                 self.netConsumption,
                 self.wastage,
                 self.pcPerPack,
                 self.moq,
                 self.mcq,
                 self.ratio,
                 self.fobPrice,
                 self.cof,
                 self.freightModeId,
                 self.costUOMId,
                 self.pricePer,
                 self.currencyId,
                 self.rate
            ]);
            return self;
        };

        CostingSheetItem.prototype.update = function (data) {
            this.id(data ? data.id() : null);
            this.name(data ? data.name() : null);
            this.description(data ? data.description() : null);
            this.costSheetId(data ? data.costSheetId() : null);
            this.rmCategoryId(data ? data.rmCategoryId() : null);
            this.bomId(data ? data.bomId() : null);
            this.itemNo(data ? data.itemNo() : null);
            this.bomId(data ? data.bomId() : null);
            this.position(data ? data.position() : null);
            this.rmCategory(data ? data.rmCategory() : null);
            this.rmId(data ? data.rmId() : null);
            this.supplierId(data ? data.supplierId() : null);
            this.supplier(data ? data.supplier() : null);
            this.rmReferenceNo(data ? data.rmReferenceNo() : null);
            this.measurement(data ? data.measurement() : null);
            this.measurementId(data ? data.measurementId() : null);
            this.rmColour(data ? data.rmColour() : null);
            this.rmColourId(data ? data.rmColourId() : null);
            this.previousValue(data ? data.previousValue() : null);
            this.previousValueCost(data ? data.previousValueCost() : null);
            this.isUsedForCal(data ? data.isUsedForCal() : null);
            this.isMappedForAll(data ? data.isMappedForAll() : null);
            this.itemOptionId(data ? data.itemOptionId() : null);
            this.consumptionUOMId(data ? data.consumptionUOMId() : null);
            this.netConsumption(data ? data.netConsumption() : null);
            this.wastage(data ? data.wastage() : null);
            this.pcPerPack(data ? data.pcPerPack() : 1);
            this.moq(data ? data.moq() : 0);
            this.mcq(data ? data.mcq() : 0);
            this.ratio(data ? data.ratio() : 1);
            this.fobPrice(data ? data.fobPrice() : null);
            this.cof(data ? data.cof() : 0);
            this.freightModeId(data ? data.freightModeId() : null);
            this.costUOMId(data ? data.costUOMId() : null);
            this.pricePer(data ? data.pricePer() : null);
            this.currencyId(data ? data.currencyId() : null);
            this.searchRMNo(data ? data.searchRMNo() : null);
            this.displayColorId(data ? data.displayColorId() : null);
            this.rmBrief.update(data ? data.rmBrief : null);
            this.rate(data ? data.rate() : null);
            this.totalOrderQty(data ? data.totalOrderQty() : false);
            this.sequenceNo(data ? data.sequenceNo() : null);
            //this.costingPropertyValues().length = 0;
            //if (data && data.costingPropertyValues() && data.costingPropertyValues().length > 0) {
            //    for (var i = 0, l = data.costingPropertyValues().length; i < l; i++) {
            //        self.costingPropertyValues().push(data.costingPropertyValues()[i]);
            //    }
            //}
            //this.costingPropertyValues.valueHasMutated();
        };

        return CostingSheetItem;
    });