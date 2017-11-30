define('vm.newCosting',
    [
        'jquery', 'ko', 'underscore', 'datacontext', 'config', 'router', 'sort', 'messenger', 'utils', 'store', 'model', 'pager', 'model.filterProduct',
        'model.otherCostingItem', 'model.costingSheetItem', 'model.filterRM', 'rmPicker', 'model.costingSheet', 'model.costingSheetBrief', 'model.csSizeRatio', 'model.product', 'model.rmBrief', 'model.mapper', 'model.costingOptionFilter', 'model.costingProperty', 'model.costingPropertyValue'
    ],
    function($, ko, _, datacontext, config, router, sort, messenger, utils, store, model, pager, filterProduct,
        otherCostingItem, costingItem, filterRm, rawMaterialPicker, costingSheet, costingSheetBrief, csSizeRatio, product, rmBrief, mapper, costingOptionFilter, costingProperty, costingPropertyvalue) {
        // Properties
        var NewCosting = function() {
            var //isRefreshing = false,
                logger = config.logger,
                //totalResult = ko.observable(0),
                showFactoryGrid = ko.observable(false),
                iniDataLoaded = ko.observable(false),
                costSheetSaved = ko.observable(false),
                deletingItemId = ko.observable(),
                isCostingSheetChanged = ko.observable(false),
                isCostingItemsChanged = ko.observable(false),
                isCostingOptionChanged = ko.observable(false),
                isCostingOthersChanged = ko.observable(false),
                onNavigateToOpt = ko.observable(false),
                isAnyBOMItemChanged = ko.observable(false),
                isCostSheetChangedPopUp = ko.observable(false),
                RetrievedSmv = ko.observable(),
                routedSMV = ko.observable(),
                //Common Data
                bomMasterId = ko.observable(),
                costingSheetId = ko.observable(),
                validNameResult = ko.observable(),
                initCostingSheetId = ko.observable(),
                isCreateButton = ko.observable(false),
                costSheet = new costingSheet(),
                costingOption = new model.costingOptions(),
                selectCostingOption = new model.costingOptions(),
                deleteOption = new model.costingOptions(),
                otherCosting = new model.costingSheetItem(),
                activeCostingItem = null,
                rmBriefPage,
                onCreateNewPopUp = ko.observable(false),
                //Pop Up selected Ids
                selectedColorIds = ko.observableArray(),
                selectedOptionIds = ko.observableArray(),
                selectedSizeIds = ko.observableArray(),
                csItemsOptionsLst = ko.observableArray(),
                allratio = ko.observable(1),
                onDeleteCosting = ko.observable(false),
                onDeleteCostingOpt = ko.observable(false),
                showItemDeletePopUp = ko.observable(false),
                deleteCostingItemId = ko.observable(),
                currencyOrigId = ko.observable(),
                deleteOtherCostingItemId = ko.observable(),

                //Pop Up binding Data
                RMColourList = ko.observableArray(),
                SizesList = ko.observableArray(),
                OptionsList = ko.observableArray(),
                BOMMasterSizeGridsList = ko.observableArray(),
                otherCostList = ko.observableArray(),
                ConstructionMastersList = ko.observableArray(),
                FabricRmReferenceNos = ko.observableArray(),
                TrimComponentRmReferenceNos = ko.observableArray(),
                LaceRmReferenceNos = ko.observableArray(),
                EmroideryRmReferenceNos = ko.observableArray(),
                ElasticRmReferenceNos = ko.observableArray(),
                TapesRmReferenceNos = ko.observableArray(),
                LabelTransferRmReferenceNos = ko.observableArray(),
                FoamCupRmReferenceNos = ko.observableArray(),
                StripCutRmReferenceNos = ko.observableArray(),
                PackingTrimRmReferenceNos = ko.observableArray(),
                unitOfMeasureList = ko.observableArray(),
                transportModeList = ko.observableArray(),
                currencyList = ko.observableArray(),
                currencyCoverList = ko.observableArray(),
                supplierList = ko.observableArray(),
                costingItemsList = ko.observableArray(),
                fullCostingItemList = ko.observableArray(),
                //Front End Tabs
                costingOptionslist = ko.observableArray(),
                costingOptionslistTab = ko.observableArray(),
                //Pop ups
                confrimPopUp = ko.observable(false),
                supCollapsState1 = ko.observable(true),
                supCollapsState = ko.observable(true),
                isColorPlicker = ko.observable(false),
                supCollapsStateOther = ko.observable(true),
                supCollapsStateItems = ko.observable(false),
                costingOptionLeave = ko.observable(false),
                //RMPicker
                showRMPicker = ko.observable(false),
                rmPicker = new rawMaterialPicker(),
                currentPickItem = null,
                rmFilter = new filterRm(),
                rmAndOtherCosts = ko.observable(0),
                SumValue = ko.observable(0),
                otherCostUSD = ko.observable(0),

                //Add a new column
                costingSheetProperties = ko.observableArray(),
                editCostingProperties = ko.observableArray(),
                addCostingproperty = new costingProperty(),
                editCostingProperty = new costingProperty(),
                editCostingPropertyIndex = ko.observable(),
                deleteCostingPropertyIndex = ko.observable(),
                showPropertyPop = ko.observable(false),
                isItemNoVisible = ko.observable(true),
                isPositionVisible = ko.observable(true),
                isMatSubCategoryVisible = ko.observable(true),
                isSupplierVisible = ko.observable(true),
                isArticleNoVisible = ko.observable(true),
                isMeasurmentVisible = ko.observable(true),
                isColVisible = ko.observable(true),
                isConsumptionUOMVisible = ko.observable(true),
                isBOMGrossConsumptionVisible = ko.observable(true),
                isWastageVisible = ko.observable(true),
                isCostGrosConsumpVisible = ko.observable(true),
                isPcPerPackVisible = ko.observable(true),
                isRatioVisible = ko.observable(true),
                isFOBPriceVisible = ko.observable(true),
                isCOFVisible = ko.observable(true),
                isFreightVisible = ko.observable(true),
                isCIFPriceVisible = ko.observable(true),
                isPriceUomVisible = ko.observable(true),
                isPricePerVisible = ko.observable(true),
                isCurrencyVisible = ko.observable(true),
                isMOQVisible = ko.observable(true),
                isMCQVisible = ko.observable(true),
                isReqVisible = ko.observable(true),
                isSurchargeVisible = ko.observable(true),
                reportColumns = ko.observableArray(),
                reportHidenColumns = ko.observableArray(),
                isShowReportColumn = ko.observable(false),
                columnCount = ko.observable(15),
                isChanged = ko.computed(function() {
                    return isCostingSheetChanged() ||
                        isCostingItemsChanged() ||
                        isCostingOptionChanged() ||
                        isCostingOthersChanged();
                }),
                costingPropertiesValues = [], //PBA observable is not required
                //costingPropertyValue = new costingPropertyvalue(),
                //drag
                organizeMode = ko.observable(),
                ProdInfo,
                //isDelete = true,
                cycleId = ko.observable(),
                //---------------------------------------Permission Modes--------------------------------------
                isCostingAllowed = ko.observable(false), //142   CostingTool
                resetCostingChanged = function() {
                    isCostingSheetChanged(false);
                    isCostingItemsChanged(false);
                    isCostingOptionChanged(false);
                    isCostingOthersChanged(false);
                },
                reset = function() {
                    otherCosting.update(null);
                    costingOption.update(null);
                    iniDataLoaded(false);
                    supCollapsStateOther(true);
                    supCollapsStateItems(false);
                    onDeleteCosting(false);
                    onDeleteCostingOpt(false);
                    showItemDeletePopUp(false);
                    isCreateButton(false);
                    costSheet.update(null);
                    deleteOption.update(null);
                    organizeMode(false);
                    onCreateNewPopUp(false);
                    showPropertyPop(false);
                    //Reset dirty flag
                    costingOption.dirtyFlag().reset();
                    isCostingOptionChanged(false);
                    isCostingOptionChanged(false);
                    //isDirect(false);
                    RMColourList.removeAll();
                    OptionsList.removeAll();
                    SizesList.removeAll();
                    selectedColorIds.removeAll();
                    selectedOptionIds.removeAll();
                    selectedSizeIds.removeAll();
                    fullCostingItemList.removeAll();
                    otherCostList.removeAll();
                    resetCostingChanged();
                },
                activate = function(routeData, prodInfo) {
                    config.isRefreshing(true);
                    setUserPermissions(function() {
                        reset();
                        ProdInfo = prodInfo;
                        costingSheetId(routeData.costingSheetId);
                        initCostingSheetId(routeData.costingSheetId);
                        cycleId(routeData.productCycleId);
                        costingOption.bomMasterId(routeData.bomMasterId);
                        if (routeData.bomMasterId != null) {
                            bomMasterId(routeData.bomMasterId);
                            costSheetSaved(false);
                            isShowReportColumn(false);
                            showPropertyPop(false);
                            getAllRMReferenceNos();
                            if (costingSheetId() || costingSheetId() == 0) {
                                loadCostingData();
                                loadReportHidenColumn(function(list) {
                                    var ids = _.map(list, function(c) {
                                        return c.ColumnId;
                                    });
                                    setHiddenColumns(ids);
                                }, config.referenceValues.reportTypes.Costing.id);
                            } else {
                                laodNewCostingData();
                            }
                        } else {
                            bomMasterId(null);
                            getAllRMReferenceNos();
                            if (costingSheetId() != null) {
                                getCostingSheetWithOptionsById();
                            } else {
                                costingItemsList().length = 0;
                                costingItemsList.valueHasMutated();
                                loadStandAloneCostingData();
                            }
                            
                        }
                        loadRefData();
                        //addSubscriptions();
                    });
                },
                setUserPermissions = function(callback) {
                    var taskList = [{ taskId: config.referenceValues.permissionTasks.CostingTool.id, permission: isCostingAllowed }];
                    datacontext.refPermissionTasks.checkPermission({
                        success: function(validTasks) {
                            if (!validTasks) validTasks = [];
                            _.each(taskList, function(pt) {
                                pt.permission(validTasks.indexOf(pt.taskId) > -1);
                            });
                            if (isCostingAllowed()) {
                                callback();
                            } else {
                                //Redirect to DashBoard
                                window.location.href = config.systemBaseUrl + config.hashes.mainMenu.dashboard;
                                logger.info([config.infoMessages.dontHavePermission()]);
                            }
                        },
                        error: function() {
                        }
                    }, config.loggedUser.id(), _.pluck(taskList, 'taskId'), null, null, null);
                },
                checkIfTheBOMIsEdited = function() {

                },
                loadRefData = function() {
                    currencyCoverList().length = 0;
                    $.when(datacontext.suppliers.getSupplierBriefs({
                                success: function(result) {
                                    supplierList().length = 0;
                                    _.each(result, function(item) {
                                        supplierList().push(item);
                                    });
                                },
                                error: function() {
                                    logger.error([config.toasts.errorGettingData]);
                                }
                            }, true),
                            datacontext.refCommons.getData(
                                datacontext.getDataOptions(true, sort, sort.getNumberSort('sequenceNo')(true), transportModeList(), null,
                                [config.referenceValues.refCommonTypes.RefTransportMode.name])),
                            datacontext.refUOM.getData(
                                datacontext.getDataOptions(true, sort, sort.getNumberSort('name')(true), unitOfMeasureList(), null, config.referenceValues.uomTypes.Other.id)),
                            datacontext.currencyConverter.getWithRefCurrency({
                                success: function(result) {
                                    _.each(result, function(item) {
                                        currencyCoverList().push(item);
                                    });
                                },
                                error: function() {
                                }
                            }),
                            datacontext.refCommons.getData(datacontext.getDataOptions(true, sort, sort.nameSort(true), currencyList(), null, ['RefCurrency'])))
                        .then(function() {
                            transportModeList.valueHasMutated();
                            currencyCoverList.valueHasMutated();
                            unitOfMeasureList.valueHasMutated();
                            supplierList.valueHasMutated();
                            currencyList.valueHasMutated();
                            config.isRefreshing(false);
                        });

                },
                onOtherCostingCopy = function(item) {
                    otherCosting.update(item);
                    isCostingOthersChanged(true);
                    otherCosting.itemNo(null);
                },

                loadStandAloneCostingData = function () {
                    createCostingGridList();

                    costingOptionslistTab().length = 0;
                    var extraCostingOption = new model.costingOptions();
                    var index = costingOptionslistTab().length + 1;
                    var name = 'Costing Option - ' + index;
                    costingOption.id(-1);
                    costingOption.CreatedDate(utils.convertToStandardDateString(new Date()));
                    costingOption.CreatedBy(config.loggedUser.id());
                    costingOption.costingSheetId(costingSheetId());
                    
                    extraCostingOption.name(name);
                    extraCostingOption.id(-1);

                    extraCostingOption.costingSheetId(costingSheetId());
                    costingOptionslistTab().push(extraCostingOption);
                    costingOptionslistTab.valueHasMutated();
                    //Reset dirty flag
                    costingOption.dirtyFlag().reset();
                },

                //get RoutedSMV value
                getRoutedValue = function() {
                    if (costingOption.constructionMasterId() != null && RetrievedSmv() == null) {
                        datacontext.SMVs.getSMVRouteValues({
                            success: function(result) {
                                if (costingOption.smv() != null && result != costingOption.smv()) {
                                    costingOption.constructionMasterId(null);
                                }
                                routedSMV(result);
                                costingOption.smv(result);
                            }
                        }, costingOption.constructionMasterId());
                    }
                },

                laodNewCostingData = function() {
                    ConstructionMastersList.removeAll();
                    RMColourList().length = 0;
                    OptionsList().length = 0;
                    SizesList().length = 0;
                    BOMMasterSizeGridsList().length = 0;
                    $.when(datacontext.bomMaster.getFullForCostingById({
                        success: function(result) {
                            if (result) {
                                if (result.Options) {
                                    _.each(result.Options, function(o) {
                                        OptionsList().push(o);
                                    });
                                }
                                if (result.Colors) {
                                    _.each(result.Colors, function(o) {
                                        if (o.IsAll == false) {
                                            RMColourList().push(o);
                                        }
                                    });
                                }
                                if (result.SizeSplits) {
                                    _.each(result.SizeSplits, function(o) {
                                        SizesList().push(o);
                                        _.each(o.BOMMasterSizeGrids, function(sg) {
                                            var match = _.find(BOMMasterSizeGridsList(), function(s) {
                                                return s.sizeGridId() == sg.SizeGridId;
                                            });
                                            if (!match) {
                                                BOMMasterSizeGridsList().push(convertToAllSizeModel(sg));
                                            }
                                        });
                                    });
                                }
                            }
                        },
                        error: function() {}
                    }, bomMasterId(), true)).then(
                        function() {
                            OptionsList.valueHasMutated();
                            RMColourList.valueHasMutated();
                            SizesList.valueHasMutated();
                            BOMMasterSizeGridsList.valueHasMutated();
                        },
                        function() {
                            logger.error([config.toasts.errorGettingData]);
                        });
                },
                loadCostingData = function() {
                    ConstructionMastersList().length = 0;
                    OptionsList().length = 0;
                    SizesList().length = 0;
                    BOMMasterSizeGridsList().length = 0;
                    RMColourList().length = 0;
                    if (bomMasterId()) {
                        $.when(datacontext.bomMaster.getFullForCostingById({
                                    success: function(result) {
                                        if (result) {
                                            if (result.Options) {
                                                _.each(result.Options, function(o) {
                                                    OptionsList().push(o);
                                                });
                                            }
                                            if (result.Colors) {
                                                _.each(result.Colors, function(o) {
                                                    if (o.IsAll == false) {
                                                        RMColourList().push(o);
                                                    }
                                                });
                                            }
                                            if (result.SizeSplits) {
                                                _.each(result.SizeSplits, function(o) {
                                                    SizesList().push(o);
                                                    _.each(o.BOMMasterSizeGrids, function(sg) {
                                                        var match = _.find(BOMMasterSizeGridsList(), function(s) {
                                                            return s.sizeGridId() == sg.SizeGridId;
                                                        });
                                                        if (!match) {
                                                            BOMMasterSizeGridsList().push(convertToAllSizeModel(sg));
                                                        }
                                                    });
                                                });
                                            }
                                        }
                                    },
                                    error: function() {}
                                }, bomMasterId(), true),
                                datacontext.constructions.getConstructionMasterListByBOMMasterId({
                                    success: function(result) {
                                        _.each(result, function(item) {
                                            ConstructionMastersList().push(item);
                                        });
                                    }
                                }, bomMasterId()),
                                datacontext.costingSheet.getPropertyByMasterId({
                                    success: function(result) {
                                        costingSheetProperties().length = 0;
                                        if (result) {
                                            _.each(result, function(p) {
                                                costingSheetProperties().push(p);
                                            });
                                        }
                                        costingSheetProperties.valueHasMutated();
                                    },
                                    error: function() {}
                                }, costingSheetId()),
                                datacontext.costingSheet.getStatusOfItemChange({
                                    success: function (result) {
                                        if (result > 0) {
                                            isCostSheetChangedPopUp(true);
                                        }
                                    },
                                    error: function () { }
                                }, costingSheetId())
                                ).then(function() {
                                    ConstructionMastersList.valueHasMutated();
                                    OptionsList.valueHasMutated();
                                    SizesList.valueHasMutated();
                                    BOMMasterSizeGridsList.valueHasMutated();
                                    RMColourList.valueHasMutated();
                                    getCostingSheetWithOptionsById();
                                },
                                function() {
                                    logger.error([config.toasts.errorGettingData]);
                                });
                    } else {
                        ConstructionMastersList.valueHasMutated();
                        OptionsList.valueHasMutated();
                        SizesList.valueHasMutated();
                        BOMMasterSizeGridsList.valueHasMutated();
                        RMColourList.valueHasMutated();
                    }
                },
                afterRender = function() {
                    config.isRefreshing(false);
                },
                onColorPick = function(item, index) {
                    if (index == 0) {
                        item.displayColorId(null);
                    } else if (index == 1) { //Red 
                        item.displayColorId(1);
                    } else if (index == 3) { //Green
                        item.displayColorId(2);
                    } else if (index == 2) { //Blue
                        item.displayColorId(3);
                    }

                },
                getsupplier = function(supplierId) {
                    var temp = _.find(supplierList(), function(item) {
                        return supplierId() == item.Id;
                    });
                    if (temp) {
                        return temp.Name;
                    } else {
                        return "";
                    }
                },
                getCurrencyValue = function(currencyId) {
                    var temp1 = _.find(currencyList(), function(item) {
                        return currencyId == item.origId();
                    });
                    if (temp1) {
                        return temp1.name();
                    } else {
                        return "";
                    }
                },
                getUOMValue = function(uomId) {
                    var temp1 = _.find(unitOfMeasureList(), function(item) {
                        return uomId == item.id();
                    });
                    if (temp1) {
                        return temp1.name();
                    } else {
                        return "";
                    }
                },
                getBomOption = function(optionId) {
                    var temp = _.find(OptionsList(), function(itm) {
                        return (itm.Id == optionId);
                    });
                    if (temp) {
                        return temp.Name;
                    } else {
                        return "";
                    }
                },
                getBomSizeSplit = function(sizeId) {
                    var temp = _.find(SizesList(), function(itm) {
                        return (itm.Id == sizeId);
                    });
                    if (temp) {
                        return temp.Name;
                    } else {
                        return "";
                    }
                },
                getBomColor = function(colorId) {
                    var temp = _.find(RMColourList(), function(itm) {
                        return (itm.Id == colorId);
                    });
                    if (temp) {
                        return temp.Name;
                    } else {
                        return "";
                    }
                },
                getTransport = function(transportId) {
                    if (transportId != null) {
                        if (transportId == 2) {
                            return "Air";
                        } else if (transportId == 1) {
                            return "Sea";
                        } else if (transportId == 4) {
                            return "Land";
                        } else if (transportId == 0) {
                            return "N/A";
                        } else if (transportId == 3) {
                            return "Courier";
                        }
                    }
                    return "";
                },
                onCollapse = function() {
                },
                onPickRMFromButton = function(data) {
                    var item = data;
                    if (item.searchRMNo() && item.searchRMNo().trim().length > 0) {
                        rmFilter.update(null);
                        rmFilter.categoryId(item.rmCategoryId());
                        rmFilter.referenceNo(item.searchRMNo());
                        searchRM(function() {
                            //Find exact matches
                            var matches = rmBriefPage.itemList() ?
                                _.filter(rmBriefPage.itemList(), function(it) {
                                    return it.referenceNo().trim().toUpperCase() == item.searchRMNo().trim().toUpperCase();
                                }) : null;
                            if (matches && matches.length == 1) {
                                item.rmCategory(matches[0].category2Name());
                                item.supplier(matches[0].supplierName());
                                item.rmId(matches[0].id());
                                item.rmCategoryId(matches[0].categoryId());
                                item.rmBrief.update(matches[0]);
                            } else if (matches && matches.length > 0) {
                                rmPicker.initialize({ filter: rmFilter, rmBriefPage: rmBriefPage });
                                showRMPicker(true);
                                currentPickItem = item;
                            } else {
                                logger.info([config.infoMessages.noResultsFound]);
                            }
                        });
                    }
                    return true;
                },
                searchRM = function(callBack) {
                    datacontext.rawMaterial.getBriefs(rmFilter, {
                        success: function(result) {
                            rmBriefPage = result;
                            if (rmBriefPage && rmBriefPage.recordCount() > 0) {
                                callBack();
                            } else {
                                logger.info([config.infoMessages.noResultsFound]);
                            }
                        },
                        error: function() {
                        }
                    });
                },

                convertToAllSizeModel = function(item) {
                    var tempAllSizeModel = new csSizeRatio();
                    tempAllSizeModel.bomMasterSizeSplitId(item.BOMMasterSizeSplitId);
                    tempAllSizeModel.sizeSplit(item.SizeGrid.Value);
                    tempAllSizeModel.sizeGridId(item.SizeGridId);
                    tempAllSizeModel.sizeRatio(item.SizeRatio);
                    tempAllSizeModel.sizeGrid = item.SizeGrid;
                    return tempAllSizeModel;
                },

                checkForValidName = function() {
                    if (costSheet.name() != null) {
                        $.when(datacontext.costingSheet.checkIfCostingNameExists({
                                success: function(result) {
                                    validNameResult(result);
                                },
                                error: function() {
                                    config.isRefreshing(false);
                                }
                            }, bomMasterId(), costSheet.name(), costingSheetId())
                        ).then(function() {
                            if (validNameResult() == -1) {
                                logger.error(["Costing Sheet Name Already Exists..!"]);
                                config.isRefreshing(false);
                            } else if (costingSheetId() != null && validNameResult() == 2) {
                                onSaveCostingSheet();
                            } else if (bomMasterId() == null && costingSheetId() == null && validNameResult() == 2) {
                                onSaveCostingSheet();
                            } else if (costingSheetId() == null && validNameResult() == 2) {
                                saveCostSheetWithOptions();
                            }
                        });
                    }
                },
                onMappedForAllSelect = function(item) {
                    item.isMappedForAll(!item.isMappedForAll());
                },
                onNavAccept = function() {
                    onSaveCostingSheet();
                    setTimeout(function() {
                        if (costSheetSaved() == true) {
                            onClickTab(selectCostingOption);
                        } else {
                            onNavigateToOpt(false);
                        }
                    }, 600);
                },
                onNavCancel = function() {
                    if (costingOption.id() == -1) {
                        var costingOptions = _.find(costingOptionslistTab(), function(obj) {
                            return obj.id() == costingOption.id();
                        });
                        costingOptionslistTab.remove(costingOptions);
                        if (costingOptionslistTab().length > 0) {
                            var lastItem = costingOptionslistTab().length;
                            var temp = costingOptionslistTab()[lastItem - 1];
                            costingOption.update(temp);
                            costingOption.bomMasterId(bomMasterId());
                            //Reset dirty flag
                            costingOption.dirtyFlag().reset();
                            //isCostingOptionChanged(false);
                        }
                    }
                    onClickTab(selectCostingOption);
                    onNavigateToOpt(false);
                },
                afterNav = function() {
                    onNavigateToOpt(false);
                },

                onSelectTab = function(data) {
                    selectCostingOption.update(data);
                    if (isChanged() || costingOption.id() == -1) {
                        onNavigateToOpt(true);
                    } else {
                        onClickTab(selectCostingOption);
                    }
                },

                //SP - Save Initial Costing Sheet with Options
                saveCostSheetWithOptions = function() {
                    if (costSheet.name() == null) {
                        logger.error(["Invalid Data"]);
                        config.isRefreshing(false);
                        return;
                    }
                    datacontext.costingSheet.saveCostSheetWithOptions({
                        success: function (result) {
                            if (bomMasterId()) {
                                costingSheetId(result);
                                //Redirect with the costing sheet Id
                                getCostingSheetWithOptionsById();
                                // loadPropertyData();
                                config.isRefreshing(false);
                               // window.location.href = config.systemBaseUrl + config.hashes.productMenu.newCosting + '/' + cycleId() + '/' + bomMasterId() + '/' + costingSheetId();
                                // ProdInfo.loadData();
                            } else {
                                costingSheetId(result);
                                config.isRefreshing(false);
                                getCostingSheetWithOptionsById();
                                
                            }
                        },
                        error: function() {
                        }
                    }, getCostingFilter());
                },

                getCostingFilter = function() {
                    var tempCostingOptionFilter = new model.costingOptionFilter();
                    tempCostingOptionFilter.userId(config.loggedUser.id());
                    tempCostingOptionFilter.bomMasterId(bomMasterId());
                    tempCostingOptionFilter.costShetName(costSheet.name());
                    tempCostingOptionFilter.costingSheetComment(costSheet.comment.comment());
                    tempCostingOptionFilter.totalOrderQty(costSheet.totalOrderQty());
                    tempCostingOptionFilter.customerFOB(costSheet.customerFob());

                    tempCostingOptionFilter.costingOptionId(null);
                    _.each(selectedColorIds(), function(color) {
                        tempCostingOptionFilter.bomMasterColorIds().push(color);
                    });
                    tempCostingOptionFilter.bomMasterColorIds.valueHasMutated();

                    _.each(selectedOptionIds(), function(option) {
                        tempCostingOptionFilter.bomMasterOptionIds().push(option);
                    });
                    tempCostingOptionFilter.bomMasterOptionIds.valueHasMutated();
                    _.each(selectedSizeIds(), function(size) {
                        tempCostingOptionFilter.bomMasterSizeSplitIds().push(size);
                    });
                    tempCostingOptionFilter.bomMasterSizeSplitIds.valueHasMutated();
                    return tempCostingOptionFilter;
                },
                getCostingSheetWithOptionsById = function () {
                    costingOptionslist().length = 0;
                    costingOptionslistTab().length = 0;
                    $.when(datacontext.costingSheet.getCostingSheetWithOptions({
                            success: function(result) {
                                var index = 1;
                                costSheet.update(result);
                                if (costSheet.isBOMItemsChanged()) {
                                    afterCostChangedPOP(true);
                                }
                                costSheet.dirtyFlag().reset();
                                _.each(result.costingOptionslist(), function(option) {
                                    var name = 'Costing Option -' + index;
                                    option.name(name);
                                    costingOptionslist().push(option);
                                    costingOptionslistTab().push(option);
                                    index = costingOptionslist().length + 1;
                                });
                                //if (!bomMasterId()) {
                                    costingOption.update(result.costingOptionslist()[0]);
                               // }
                                BOMMasterSizeGridsList().length = 0;
                                _.each(result.allSizes(), function(item) {
                                    BOMMasterSizeGridsList().push(item);
                                });
                                BOMMasterSizeGridsList.valueHasMutated();
                                //Resolve costing other Items
                                resetCostingChanged();
                            },
                            error: function() {}
                        }, costingSheetId())
                    ).then(function() {
                        costingOptionslist.valueHasMutated();
                        costingOptionslistTab.valueHasMutated();
                        otherCostList.valueHasMutated();

                        RetrievedSmv(costingOptionslist()[0].smv());
                        costingOption.update(costingOptionslist()[0]);

                        //Get the mapping for the 1st costing option
                        _.each(costingOption.csItemsOptionsList(), function(csItemOpt) {
                            csItemsOptionsLst().push(csItemOpt);
                        });
                        getCostingSheetItemsForOptions(costingOptionslist()[0]);
                        //Reset dirty flag
                        costingOption.dirtyFlag().reset();
                        isCostingOptionChanged(false);
                    });
                },

                getTotalSum = function(list) {
                    if (list().length > 0) {
                        var sum1 = 0;
                        _.each(list(), function(obj) {
                            if (obj.isUsedForCal()) {
                                sum1 = parseFloat(sum1) + parseFloat(obj.finalTotal());
                            }
                        });
                        return sum1;
                    } else {
                        return 0;
                    }
                },

                //copy summery values in to summeries in other options
                onCopySummeryValue = function(data, index) {
                    _.each(costingOptionslistTab(), function(option) {
                        if (index == 0) {
                            option.smv(costingOption.smv());
                            option.constructionMasterId(costingOption.constructionMasterId());
                        } else if (index == 1) {
                            if (costingOption.isDirect() == false) {
                                option.factoryCMRatePerMin(costingOption.factoryCMRatePerMin());
                            } else {
                                option.factoryCM(costingOption.factoryCM());
                            }
                        } else if (index == 2) {
                            if (costingOption.isDirect() == false) {
                                option.earnings(costingOption.earnings());
                            } else {
                                option.earnings(costingOption.earnings());
                            }
                        } else if (index == 3) {
                            option.financeCost(costingOption.financeCost());
                        } else if (index == 4) {
                            option.discount(costingOption.discount());
                        } else if (index == 5) {
                            option.addValue(costingOption.addValue());
                        } else if (index == 6) {
                            option.ttlSurcharge(costingOption.ttlSurcharge());
                        } else if (index == 7) {
                            option.ttlSurcharge(costingOption.ttlSurcharge());
                        }
                    });

                    $.when(datacontext.costingSheet.updateCostingOptionSummery({
                        success: function() {
                            logger.success(["Value Copied Successfully..!"]);
                        },
                        error: function() {
                        }
                    }, costingOption, index, costingSheetId())).then(function() {

                    });
                },

                getTotalOtherCost = ko.computed(function() {
                    var sum = 0;
                    _.each(otherCostList(), function(item) {
                        sum = sum + (item.fobPrice() * item.pricePer() * 1);
                    });
                    var FixedValue = sum;
                    SumValue(FixedValue);
                }),
                getRMCategoryGroup = function(rmCategory, rmRefNos) {
                    var costingObj = new costingItem();
                    costingObj.rmCategoryId(rmCategory.id);
                    costingObj.dirtyFlag().reset(); //reset dirty flag;
                    return {
                        costingItemData: costingObj,
                        isMappedForAll: ko.observable(false),
                        rmName: rmCategory.name,
                        rmCategoryId: rmCategory.id,
                        supCollapsState: true,
                        onCollapse: onCollapse(),
                        rmReferenceNos: rmRefNos,
                        selectedItems: ko.observableArray(),
                        selectedAll: ko.observable(false),
                        itemList: ko.observableArray()
                    };
                },

                prepareCostingItem = function(item, rmGroup) {
                    var index = rmGroup.itemList().length + 1;
                    rmGroup.itemList().push(item);
                    item.itemNo(index);
                    item.ratio(allratio());
                    item.totalOrderQty(costSheet.totalOrderQty());
                    item.dirtyFlag().reset(); //reset dirty flag;
                },

                createCostingGridList = function() {
                    var fabricGroup = getRMCategoryGroup(config.referenceValues.refRMCategories.Fabrics, FabricRmReferenceNos);
                    var laceGroup = getRMCategoryGroup(config.referenceValues.refRMCategories.Laces, LaceRmReferenceNos);
                    var embroideryGroup = getRMCategoryGroup(config.referenceValues.refRMCategories.Embroidery, EmroideryRmReferenceNos);
                    var elasticGroup = getRMCategoryGroup(config.referenceValues.refRMCategories.Elastics, ElasticRmReferenceNos);
                    var tapeGroup = getRMCategoryGroup(config.referenceValues.refRMCategories.Tapes, TapesRmReferenceNos);
                    var trimGroup = getRMCategoryGroup(config.referenceValues.refRMCategories.TrimComponent, TrimComponentRmReferenceNos);
                    var labelGroup = getRMCategoryGroup(config.referenceValues.refRMCategories.LabelTransfer, LabelTransferRmReferenceNos);
                    var foamGroup = getRMCategoryGroup(config.referenceValues.refRMCategories.FoamCup, FoamCupRmReferenceNos);
                    var stripcutGroup = getRMCategoryGroup(config.referenceValues.refRMCategories.StripCut, StripCutRmReferenceNos);
                    var packingTrimGroup = getRMCategoryGroup(config.referenceValues.refRMCategories.PackingTrim, PackingTrimRmReferenceNos);

                    _.each(costingItemsList(), function(item) {
                        if (item.rmCategoryId() == config.referenceValues.refRMCategories.Fabrics.id) {
                            prepareCostingItem(item, fabricGroup);
                        } else if (item.rmCategoryId() == config.referenceValues.refRMCategories.Laces.id) {
                            prepareCostingItem(item, laceGroup);
                        } else if (item.rmCategoryId() == config.referenceValues.refRMCategories.Embroidery.id) {
                            prepareCostingItem(item, embroideryGroup);
                        } else if (item.rmCategoryId() == config.referenceValues.refRMCategories.Elastics.id) {
                            prepareCostingItem(item, elasticGroup);
                        } else if (item.rmCategoryId() == config.referenceValues.refRMCategories.Tapes.id) {
                            prepareCostingItem(item, tapeGroup);
                        } else if (item.rmCategoryId() == config.referenceValues.refRMCategories.TrimComponent.id) {
                            prepareCostingItem(item, trimGroup);
                        } else if (item.rmCategoryId() == config.referenceValues.refRMCategories.LabelTransfer.id) {
                            prepareCostingItem(item, labelGroup);
                        } else if (item.rmCategoryId() == config.referenceValues.refRMCategories.FoamCup.id) {
                            prepareCostingItem(item, foamGroup);
                        } else if (item.rmCategoryId() == config.referenceValues.refRMCategories.StripCut.id) {
                            prepareCostingItem(item, stripcutGroup);
                        } else if (item.rmCategoryId() == config.referenceValues.refRMCategories.PackingTrim.id) {
                            prepareCostingItem(item, packingTrimGroup);
                        } else if (item.rmCategoryId() == null) {
                            item.sequenceNo(otherCostList().length + 1);
                            otherCostList().push(item);
                        }
                    });
                    fullCostingItemList().length = 0;
                    fullCostingItemList().push(fabricGroup);
                    fullCostingItemList().push(laceGroup);
                    fullCostingItemList().push(embroideryGroup);
                    fullCostingItemList().push(elasticGroup);
                    fullCostingItemList().push(tapeGroup);
                    fullCostingItemList().push(trimGroup);
                    fullCostingItemList().push(labelGroup);
                    fullCostingItemList().push(foamGroup);
                    fullCostingItemList().push(stripcutGroup);
                    fullCostingItemList().push(packingTrimGroup);

                    fullCostingItemList.valueHasMutated();

                    config.isRefreshing(false);
                    otherCostList.valueHasMutated();

                    _.each(fullCostingItemList(), function(item) {
                        item.itemList().sort(sort.getNumberSort('sequenceNo')(true));
                        for (var i = 0; i < item.itemList().length; i++) {
                            var data = item.itemList()[i];
                            data.searchRMNo.subscribe(onPickRM, data);
                            data.dirtyFlag().reset();
                        }
                        item.itemList.valueHasMutated();
                    });
                    //ser Other properties
                    updateGroupOtherTypes();
                    updateOtherValues();
                    iniDataLoaded(true);
                    resetSeqNo();
                    //calculate summery
                    calculateTotal();

                },
                getColourPicker = function() {
                    isColorPlicker(!isColorPlicker());
                },
                //get Reference Numbers for Articles
                getRMReferenceNos = function(data, request, response) {
                    var matches = _.filter(data(), function(rm) {
                        return rm.toLowerCase().search(request.term.toLowerCase().trim()) !== -1;
                    });
                    var names = [];
                    _.each(matches, function(m) { names.push(m); });
                    response(names);
                },
                setAutoCompleteValue = function(data, ui) {
                    data(ui.item.value);
                },
                getAllRMReferenceNos = function() {
                    datacontext.rawMaterial.getReferenceNos({
                        //rmReference Nos
                        success: function(result) {
                            _.each(result, function(b) {
                                if (b.categoryId == 1) {
                                    _.each(b.rms, function(it) {
                                        FabricRmReferenceNos().push(it.referenceNo);
                                    });
                                    FabricRmReferenceNos.valueHasMutated();
                                } else if (b.categoryId == 6) {
                                    _.each(b.rms, function(it) {
                                        TrimComponentRmReferenceNos().push(it.referenceNo);
                                    });
                                    TrimComponentRmReferenceNos.valueHasMutated();
                                } else if (b.categoryId == 2) {
                                    _.each(b.rms, function(it) {
                                        LaceRmReferenceNos().push(it.referenceNo);
                                    });
                                    LaceRmReferenceNos.valueHasMutated();
                                } else if (b.categoryId == 3) {
                                    _.each(b.rms, function(it) {
                                        EmroideryRmReferenceNos().push(it.referenceNo);
                                    });
                                    EmroideryRmReferenceNos.valueHasMutated();
                                } else if (b.categoryId == 5) {
                                    _.each(b.rms, function(it) {
                                        TapesRmReferenceNos().push(it.referenceNo);
                                    });
                                    TapesRmReferenceNos.valueHasMutated();
                                } else if (b.categoryId == 8) {
                                    _.each(b.rms, function(it) {
                                        FoamCupRmReferenceNos().push(it.referenceNo);
                                    });
                                    FoamCupRmReferenceNos.valueHasMutated();
                                } else if (b.categoryId == 4) {
                                    _.each(b.rms, function(it) {
                                        ElasticRmReferenceNos().push(it.referenceNo);
                                    });
                                    ElasticRmReferenceNos.valueHasMutated();
                                } else if (b.categoryId == 7) {
                                    _.each(b.rms, function(it) {
                                        LabelTransferRmReferenceNos().push(it.referenceNo);
                                    });
                                    LabelTransferRmReferenceNos.valueHasMutated();
                                } else if (b.categoryId == 9) {
                                    _.each(b.rms, function(it) {
                                        StripCutRmReferenceNos().push(it.referenceNo);
                                    });
                                    StripCutRmReferenceNos.valueHasMutated();
                                } else if (b.categoryId == 10) {
                                    _.each(b.rms, function(it) {
                                        PackingTrimRmReferenceNos().push(it.referenceNo);
                                    });
                                    PackingTrimRmReferenceNos.valueHasMutated();
                                }
                            });
                        },
                        error: function() {
                        }
                    }, null);
                },
                //RMPicker  
                onPickRM = function() {
                    var item = this;
                    if (item.searchRMNo() && item.searchRMNo().trim().length > 0) {
                        rmFilter.update(null);
                        rmFilter.categoryId(item.rmCategoryId());
                        rmFilter.referenceNo(item.searchRMNo());
                        searchRM(function() {
                            //Find exact matches
                            var matches = rmBriefPage.itemList() ?
                                _.filter(rmBriefPage.itemList(), function(it) {
                                    return it.referenceNo().trim().toUpperCase() == item.searchRMNo().trim().toUpperCase();
                                }) : null;
                            if (matches && matches.length == 1) {
                                item.rmCategory(matches[0].category2Name());
                                item.supplier(matches[0].supplierName());
                                item.rmId(matches[0].id());
                                item.rmCategoryId(matches[0].categoryId());
                                item.rmBrief.update(matches[0]);
                            } else if (matches && matches.length > 0) {
                                rmPicker.initialize({ filter: rmFilter, rmBriefPage: rmBriefPage });
                                showRMPicker(true);
                                currentPickItem = item;
                            } else {
                                logger.info([config.infoMessages.noResultsFound]);
                            }
                        });
                    }
                    return true;
                },
                //----------------------Summery------------------------------------------------------------------------------
                isCostingSheetValid = function() {
                    if (!costSheet.errors) {
                        costSheet.errors = ko.validation.group(costSheet);
                    }
                    return costSheet.errors().length == 0;
                },
                isCostingOptionValid = function() {
                    if (!costingOption.errors) {
                        costingOption.errors = ko.validation.group(costingOption);
                    }
                    return costingOption.errors().length == 0;
                },
                isItemValid = function(item) {
                    if (!item.errors) {
                        item.errors = ko.validation.group(item);
                    }
                    return item.errors().length == 0;
                },
                isCsItemsValid = function() {
                    var isValid = true;
                    _.all(fullCostingItemList(), function(obj) {
                        _.all(obj.itemList(), function(item) {
                            isValid = isItemValid(item);
                            return isValid;
                        });
                        return isValid;
                    });
                    return isValid;
                },
                isCsOtherItemsValid = function() {
                    var isValid = true;
                    _.all(otherCostList(), function(item) {
                        isValid = isItemValid(item);
                        return isValid;
                    });
                    return isValid;
                },
                isCSValid = function() {
                    return isCostingSheetValid() //Validate Costing Sheet
                        && isCostingOptionValid() //Validate Costing Option
                        && isCsOtherItemsValid() //Validate Other Costing Items
                        && isCsItemsValid(); //Validate Costing Items
                },
                calculateTotal = function() {
                    if (!isCostingOptionValid() //Validate Costing Option
                        || !isCsOtherItemsValid() //Validate Other Costing Items
                        || !isCsItemsValid()) {
                        return false; //Can not calculate
                    }

                    var smv = parseFloat(costingOption.smv() || 0),
                        factoryCMRatePerMin = parseFloat(costingOption.factoryCMRatePerMin() || 0),
                        factoryCM = parseFloat(costingOption.factoryCM() || 0),
                        earningsPerMin = parseFloat(costingOption.earningsPerMin() || 0),
                        earnings = parseFloat(costingOption.earnings() || 0),
                        financeCost = parseFloat(costingOption.financeCost() || 0),
                        discount = parseFloat(costingOption.discount() || 0);
                    //cmMOQ = parseFloat(costingOption.cmMOQ() || 0),
                    //addValue = parseFloat(costingOption.addValue() || 0),
                    //ttlSurcharge = parseFloat(costingOption.ttlSurcharge() || 0);

                    costingOption.otherCostSumValue(SumValue());
                    //RM Cost
                    var total = 0;
                    _.each(fullCostingItemList(), function(obj) {
                        _.each(obj.itemList(), function(item) {
                            if (item.isUsedForCal()) {
                                total = total + parseFloat(item.finalTotal());
                            }
                        });
                    });
                    costingOption.totalCalc(total);
                    var ttlEarning = costingOption.isDirect() ? earnings : (earningsPerMin * smv),
                        ttlFactoryRate = costingOption.isDirect() ? factoryCM : (factoryCMRatePerMin * smv);

                    costingOption.totalWithoutDiscount((parseFloat(costingOption.totalCalc() + parseFloat(SumValue()) + ttlFactoryRate + ttlEarning) * parseFloat(100 + financeCost)) / 100);
                    costingOption.fob(discount + parseFloat(costingOption.totalWithoutDiscount()));
                    if (costingOption.totalCalc() != null && costingOption.fob() != 0) {
                        var totalpercent = (parseFloat(costingOption.totalCalc()) / parseFloat(costingOption.fob())) * 100;
                        costingOption.totalCalcPercent(totalpercent);
                    }

                    //Total RM and Other Costs
                    rmAndOtherCosts(costingOption.totalCalc() + parseFloat(SumValue()));
                    if (SumValue() != null && costingOption.fob() != 0) {
                        var sumpercnet = (parseFloat(SumValue()) / costingOption.fob()) * 100;
                        costingOption.sumValuePercent(sumpercnet);
                    } else {
                        costingOption.sumValuePercent(0);
                    }
                    var factoryRatePercent = 0;
                    if (costingOption.isDirect()) {
                        if (factoryCM != null && costingOption.fob() != 0) {
                            factoryRatePercent = (factoryCM / costingOption.fob()) * 100;
                            costingOption.factoryRatePercent(factoryRatePercent);
                        } else {
                            costingOption.factoryRatePercent(0);
                        }
                    } else {
                        if (factoryCMRatePerMin != null && costingOption.fob() != 0) {
                            factoryRatePercent = (factoryCMRatePerMin / costingOption.fob()) * 100;
                            costingOption.factoryRatePercent(factoryRatePercent);
                        } else {
                            costingOption.factoryRatePercent(0);
                        }
                    }
                    var mdspercent = 0;
                    if (costingOption.isDirect()) {
                        if (earnings != null && costingOption.fob() != 0) {
                            mdspercent = (earnings / costingOption.fob()) * 100;
                            costingOption.mdsEarningsPercnt(mdspercent);
                        } else {
                            costingOption.mdsEarningsPercnt(0);
                        }
                    } else {
                        if (earningsPerMin != null && costingOption.fob() != 0) {
                            mdspercent = (earningsPerMin / costingOption.fob()) * 100;
                            costingOption.mdsEarningsPercnt(mdspercent);
                        } else {
                            costingOption.mdsEarningsPercnt(0);
                        }
                    }
                    if (financeCost != null && costingOption.fob() != 0) {
                        var financeCostper = (financeCost / costingOption.fob()) * 100;
                        costingOption.financnceCostPercnt(financeCostper);
                    } else {
                        costingOption.financnceCostPercnt(0);
                    }
                    //Total without discount 
                    if (costingOption.totalWithoutDiscount() != null && costingOption.fob() != 0) {
                        var totalwodispercent = (parseFloat(costingOption.totalWithoutDiscount()) / costingOption.fob()) * 100;
                        costingOption.totalWithoutDiscountPercnt(totalwodispercent);
                    } else {
                        costingOption.totalWithoutDiscountPercnt(0);
                    }
                    //Discount Surchage
                    if (discount && costingOption.fob() != 0) {
                        var disper = (discount / costingOption.fob()) * 100;
                        costingOption.discountSurchargePercnt(disper);
                    } else {
                        costingOption.discountSurchargePercnt(0);
                    }
                    costingOption.fobPercnt(100);
                    //FSFE Price
                    if (costingOption.isDirect()) {
                        if (!isNaN(costingOption.totalCalc()) || !isNaN(costingOption.otherCostSumValue()) || !isNaN(costingOption.factoryCM())) {
                            costingOption.FSFEPrice(parseFloat(costingOption.totalCalc()) + parseFloat(costingOption.otherCostSumValue()) + parseFloat(costingOption.factoryCM()));
                        }
                    } else {
                        if (!isNaN(costingOption.totalCalc()) || !isNaN(costingOption.otherCostSumValue()) || !isNaN(costingOption.factoryCMRatePerMin())) {
                            costingOption.FSFEPrice(parseFloat(costingOption.totalCalc()) + parseFloat(costingOption.otherCostSumValue()) + parseFloat(costingOption.factoryCMRatePerMin()));
                        }
                    }

                    return true;
                },
                getTotalCalculation = function() {
                    if (!calculateTotal()) {
                        logger.error(["Invalid or Insufficient Data"]);
                        return; //Can not calculate
                    }
                },
                //----------------------------Save Costing Sheet----------------------------------------------------------
                //This will always be an update call to the existing costing sheet.
                getCostingSheet = function() {
                    var costingToSave = new costingSheet();
                    costingToSave.update(costSheet);
                    costingToSave.id(costingSheetId());
                    costingToSave.bomMasterId(bomMasterId());
                    costingToSave.commentId();
                    costingToSave.updatedDate(utils.convertToStandardDateString(new Date()));
                    costingToSave.updatedBy(config.loggedUser.id());
                    if (costSheet.comment.id() && costSheet.comment.id() != '') {
                        costingToSave.comment.update(costSheet.comment);
                    } else {
                        if (!costSheet.comment.comment() || costSheet.comment.comment() == '') {
                            costingToSave.comment.comment("");
                        }
                        costingToSave.comment.commentTypeId(31);
                        costingToSave.comment.id(null);
                        costingToSave.comment.update(costSheet.comment);
                    }
                    costingToSave.comment.createdDate(utils.convertToStandardDateString(new Date()));
                    costingToSave.comment.updatedDate(utils.convertToStandardDateString(new Date()));
                    _.each(BOMMasterSizeGridsList(), function(item) {
                        costingToSave.allSizes().push(item);
                    });
                    costingToSave.allSizes.valueHasMutated();
                    return costingToSave;
                },
                getCsItems = function() {
                    var items = [], itemProperties = [];
                    resetSeqNo();
                    //var count = 1;
                    _.each(fullCostingItemList(), function(obj) {
                        _.each(obj.itemList(), function(item) {
                            //item.sequenceNo(count++);
                            items.push(item);
                            //other values
                            _.each(item.costingPropertyValues(), function(pv) {
                                if (pv.value() && pv.value().trim().length > 0) {
                                    pv.csItemId(item.id());
                                    itemProperties.push(pv);
                                }
                            });
                        });
                    });
                    _.each(otherCostList(), function(itm) {
                        items.push(itm);
                    });

                    return [items, itemProperties];
                },
                getCsOtherItems = function() {
                    var items = [];
                    _.each(otherCostList(), function(item) {
                        items.push(item);
                    });
                    return items;
                },
                onSaveCostingSheet = function() {
                    config.isRefreshing(true);

                    //var changedOpt2 = _.find(costingOptionslistTab(), function (cOpt) {
                    //    return cOpt.id() == costingOption.id();
                    //});
                    //changedOpt2.id(costingOption.id());
                    //costingOptionslistTab.valueHasMutated();

                    costingOption.bomMasterId(bomMasterId());
                    if (!bomMasterId()) {
                        var temp = _.find(fullCostingItemList(), function(itm) {
                            return itm.itemList().length > 0;
                        });
                        if (!temp) {
                            logger.info(["Atleast add one Costing Item"]);
                            config.isRefreshing(false);
                            return;
                         }
                    } 
                    if (!isCSValid()) {
                        logger.error(["Invalid or Insufficient Data"]);
                        config.isRefreshing(false);
                        return;
                    }
                   
                        calculateTotal();
                        var costingToSave = getCostingSheet();
                        var csItems = getCsItems();
                        //var csOtherItems = getCsOtherItems();
                        datacontext.costingSheet.updateCostingSheet({
                            success: function (result) {
                                costingSheetId(result[0]);
                                costingOption.id(result[1]);
                               //Load Option again
                                costSheetSaved(true);
                                
                                //Set Costing Option Tab Selected
                                var changedOpt2 = _.find(costingOptionslistTab(), function (cOpt) {
                                    return cOpt.id() == -1;
                                });
                                if (changedOpt2) {
                                    changedOpt2.id(result[1]);
                                }
                                costingOptionslistTab.valueHasMutated();
                                
                                   //For bomCosting
                                if (bomMasterId()) {
                                    getCostingSheetItemsForOptions(costingOption);
                                }
                                   //for standalone costing
                                else {
                                    config.isRefreshing(false);
                                    if (initCostingSheetId() == null || initCostingSheetId() == undefined) {
                                        window.location.href = config.systemBaseUrl + config.hashes.mainMenu.standAloneCosting + '/' + costingSheetId();
                                    } else {
                                        getCostingSheetItemsForOptions(costingOption);
                                    }
                                }
                                logger.success([config.toasts.savedData]);
                            },
                            error: function() {
                                config.isRefreshing(false);
                            }
                        }, costingToSave, costingOption, csItems[0], csItems[1]);
                    
                },
                afterCostChangedPOP = function() {
                    isCostSheetChangedPopUp(false);
                },
                //---------------------------Add New Costing Item --------------------------------------------------------
                onCostingItemAdd = function(item) {
                    var temp = ko.observableArray();
                    _.each(fullCostingItemList(), function(ObjItm) {
                        _.each(ObjItm.itemList(), function(csItem) {
                            if (csItem.id() < 0) {
                                temp().push(csItem);
                                temp.valueHasMutated();
                            }
                        });
                    });
                    var newItemIndex = -1 - temp().length;

                    //if (isItemValid(item.costingItemData)) {
                    var costingItmData = new costingItem();
                    //costingItmData.update(item.costingItemData);
                    var newIndexs = item.itemList().length + 1;
                    //costingItmData.itemNo(newIndexs);

                    costingItmData.id(newItemIndex);
                    if (item.isMappedForAll() == true) {
                        costingItmData.isMappedForAll(true);
                    } else {
                        costingItmData.isMappedForAll(false);
                    }
                    costingItmData.rmCategoryId(item.rmCategoryId);
                    costingItmData.sequenceNo(null);

                    item.itemList().push(costingItmData);
                    item.itemList.valueHasMutated();
                    isCostingItemsChanged(true);
                    resetSeqNo();
                   
                    updateGroupOtherTypes();
                    updateOtherValues();
                },
                onCostingItemDelete = function(item) {
                    deleteCostingItemId(item.id());
                },
                //--------------------------------------------------------------------------------------------------------
                onCostingCopy = function(item) {
                    var temp = ko.observableArray();

                    _.each(fullCostingItemList(), function(ObjItm) {
                        _.each(ObjItm.itemList(), function(csItem) {
                            if (csItem.id() < 0) {
                                temp().push(csItem);
                                temp.valueHasMutated();
                            }
                        });
                    });
                    var newItemIndex = -1 - temp().length;
                    var temObj = _.find(fullCostingItemList(), function(ObjItem) {
                        return ObjItem.rmCategoryId == item.rmCategoryId();
                    });

                    var copyCostingItmData = new costingItem();

                    copyCostingItmData.update(item);
                    copyCostingItmData.sequenceNo(null);

                    var newIndexs = temObj.itemList().length + 1;
                    if (temObj.isMappedForAll() == true) {
                        copyCostingItmData.isMappedForAll(true);
                    } else {
                        copyCostingItmData.isMappedForAll(false);
                    }
                    copyCostingItmData.id(newItemIndex);
                    temObj.itemList().push(copyCostingItmData);
                    temObj.itemList.valueHasMutated();
                    isCostingItemsChanged(true);
                    updateGroupOtherTypes();
                    updateOtherValues();

                    resetSeqNo();
                },

                resetSeqNo = function() {
                    var count = 1;
                    _.each(fullCostingItemList(), function(ObjItm) {
                        _.each(ObjItm.itemList(), function(csItem) {
                            csItem.sequenceNo(count++);
                        });
                        ObjItm.itemList.valueHasMutated();
                    });
                    fullCostingItemList.valueHasMutated();
                },
                getRowColor = function(colorId, isMappedForAll) {
                    if (isMappedForAll() == true && colorId() == 1) {
                        return 'positionRowColorRed mapedtoAll-red';
                    } else if (isMappedForAll() == true && colorId() == 2) {
                        return 'positionRowColorBlue mapedtoAll-blue';
                    } else if (isMappedForAll() == true && colorId() == 3) {
                        return 'positionRowColorGreen mapedtoAll-green';
                    } else if (isMappedForAll() == false && colorId() == 1) {
                        return 'positionRowColorRed';
                    } else if (isMappedForAll() == false && colorId() == 2) {
                        return 'positionRowColorBlue';
                    } else if (isMappedForAll() == false && colorId() == 3) {
                        return 'positionRowColorGreen';
                    } else if (isMappedForAll() == true && colorId() == null) {
                        return 'mapedtoAll';
                    } else {
                        return '';
                    }
                },
                afterRMPick = function() {

                },
                afterPopUp = function() {
                    confrimPopUp(false);
                },
                afterPopUp2 = function() {
                    onCreateNewPopUp(false);
                },
                onClickTab = function(data) {
                    otherCostList().length = 0;
                    otherCostList.valueHasMutated();
                    onNavigateToOpt(false);
                    isCreateButton(false);
                    if (costingOption.id() != -1) {
                        config.isRefreshing(true);
                        activeCostingItem = null;
                        costingOption.update(data);
                        if (bomMasterId()) {
                            getRatio(data);
                        }
                        getCostingSheetItemsForOptions(data);
                        //Reset dirty flag
                        costingOption.dirtyFlag().reset();
                        isCostingOptionChanged(false);
                    } else {

                    }
                },
                getRatio = function(data) {
                    var size = _.find(SizesList(), function(s) {
                        return s.Id == data.bomMasterSizeSplitId();
                    });
                    var totalRatios = 0;
                    if (size.IsAll == false) {
                        _.each(size.BOMMasterSizeGrids, function(sg) {
                            totalRatios = totalRatios + sg.SizeRatio;
                        });
                    } else {
                        _.each(SizesList(), function(s) {
                            _.each(s.BOMMasterSizeGrids, function(sg) {
                                totalRatios = totalRatios + sg.SizeRatio;
                            });
                        });
                    }
                    if (totalRatios != 0) {
                        allratio(totalRatios / 100);
                    }
                },
                getCostingSheetItemsForOptions = function (data) {
                    config.isRefreshing(true);
                    resetCostingChanged();
                    costingItemsList().length = 0;
                    costingPropertiesValues.length = 0;
                    otherCostList().length = 0;
                    otherCostList.valueHasMutated();
                    //Load items and Property values
                    $.when(datacontext.costingSheet.getCostingSheetItemsForOptions({
                                success: function(result) {
                                    _.each(result, function (csItem) {
                                       costingItemsList().push(csItem);
                                    });
                                },
                                error: function() {}
                            }, costingSheetId(), data.id()),
                            datacontext.costingSheet.getPropertyValueByOptionId({
                                success: function(result) {
                                    costingPropertiesValues = result;
                                    updateOtherValues();
                                },
                                error: function() {

                                }
                            }, data.id(), true))
                        .then(function() {
                            costingItemsList.valueHasMutated();
                            createCostingGridList();
                            config.isRefreshing(false);
                        });
                },
                //On save other costing item
                onClickOther = function() {
                    deleteOtherCostingItemId(null);
                    if (isItemValid(otherCosting)) {
                        var newItemIndex;
                        var othercostingObj = new model.costingSheetItem();
                        var temp = ko.observableArray();
                        if (otherCostList().length == 0) {
                            _.each(fullCostingItemList(), function(ObjItm) {
                                _.each(ObjItm.itemList(), function(csItem) {
                                    if (csItem.id() < 0) {
                                        temp().push(csItem);
                                        temp.valueHasMutated();
                                    }
                                });
                            });
                            newItemIndex = -1 - temp().length;
                        } else {
                            newItemIndex = -1 - otherCostList().length;
                        }
                        othercostingObj.update(otherCosting);
                        othercostingObj.itemNo(otherCostList().length + 1);
                        othercostingObj.sequenceNo(otherCostList().length + 1);
                        othercostingObj.id(newItemIndex);
                        othercostingObj.netConsumption(0);
                        othercostingObj.wastage(0);
                        othercostingObj.pcPerPack(1);
                        othercostingObj.ratio(1);
                        othercostingObj.cof(0);
                        othercostingObj.rmCategoryId(null);
                        otherCostList.push(othercostingObj);
                        otherCosting.update(null);
                        isCostingOthersChanged(true);
                    } else {
                        logger.error(["Invalid or Insufficient Data"]);
                    }
                },
                //On delete other costing item
                onOtherCostingItemDelete = function(itm) {
                    deleteOtherCostingItemId(itm.id());
                },
                //on Cancel delete other costing item
                onOtherCostingItemDeleteCancel = function() {
                    deleteOtherCostingItemId(null);
                },
                //on Accept delete other costing item
                onOtherCostingtemDeleteAccept = function(itm) {
                    if (itm.id() > 0) {
                        datacontext.costingSheet.deleteCostingItem({
                            success: function(result) {
                                //deletingItemId(result);
                                otherCostList.remove(itm);
                                otherCostList.valueHasMutated();
                            },
                            error: function() {
                            }
                        }, itm.id(), costingOption.id());

                    } else {
                        otherCostList.remove(itm);
                        otherCostList.valueHasMutated();
                        if (otherCostList().length < 1) {
                            SumValue(0);
                        }
                    }
                },
                //Collapse Other items header
                onCollapseOther = function() {
                    supCollapsStateOther(true);
                },
                onCollapseItems = function() {
                    supCollapsStateItems(false);
                },
                //initial popup screen create
                onCreate = function() {
                    config.isRefreshing(true);
                    if (isCostingSheetValid() == false) {
                        config.isRefreshing(false);
                        logger.error(['Invalid Data']);
                        return;
                    }
                    if (selectedSizeIds().length == 0 || selectedOptionIds().length == 0 || selectedColorIds().length == 0) {
                        config.isRefreshing(false);
                        logger.error(['Invalid Data']);
                        return;
                    } else {
                        confrimPopUp(false);
                        config.isRefreshing(true);
                        checkForValidName();
                    }

                },
                //highlight csItems
                onClickColourHighligting = function() {
                    isColorPlicker(!isColorPlicker());
                },
                onCostingItemsSelectAll = function() {
                },
                //cs Item check box
                onCostingItemSelect = function(item) {
                    item.isUsedForCal(!item.isUsedForCal());
                },
                //When leaving a costing option
                onCostingOptionLeave = function() {
                    costingOptionLeave(false);
                },
                onCancelCostingOption = function() {

                },
                //delete costing option
                onDeleteOptions = function() {
                    datacontext.costingSheet.deleteCostingOptions({
                        success: function() {
                            logger.success([config.toasts.deleteData]);
                        },
                        error: function() {
                        }
                    }, deleteOption.id());
                    onDeleteCostingOpt(false);
                    var costingOptions = _.find(costingOptionslist(), function(obj) {
                        return obj.id() == deleteOption.id();
                    });
                    if (costingOptions) {
                        costingOptionslist.remove(costingOptions);
                        costingOptionslistTab.remove(costingOptions);
                        var index = 1;
                        var index2 = 1;
                        _.each(costingOptionslist(), function(co) {
                            var name = 'Costing Option - ' + index;
                            co.name(name);
                            index = index + 1;
                        });
                        _.each(costingOptionslistTab(), function(coT) {
                            var name = 'Costing Option - ' + index2;
                            coT.name(name);
                            index2 = index2 + 1;
                        });

                        costingOptionslist.valueHasMutated();
                        costingOptionslistTab.valueHasMutated();

                    } else {
                        logger.info(["Could not find data"]);
                    }
                    if (!(costingOptionslist().length > 0)) {
                        costingOption.bomMasterColorId(null);
                        costingOption.bomMasterOptionId(null);
                        costingOption.bomMasterSizeSplitId(null);
                    }
                },
                onCostingtemDeleteAccept = function(item) {
                    if (item.id() > 0) {
                        $.when(datacontext.costingSheet.deleteCostingItem({
                                success: function(result) {
                                    deletingItemId(result);
                                },
                                error: function() {
                                }
                            }, item.id(), costingOption.id())
                        ).then(function() {
                            var costingItmD = _.find(fullCostingItemList(), function(obj) {
                                return obj.rmCategoryId == item.rmCategoryId();
                            });
                            if (costingItmD) {
                                DeleteItemFromArray(item, costingItmD.itemList);
                            } else {
                                logger.info(["Could not find data"]);
                            }
                        });
                    } else {
                        var costingItm = _.find(fullCostingItemList(), function(obj) {
                            return obj.rmCategoryId == item.rmCategoryId();
                        });
                        if (costingItm) {
                            DeleteItemFromArray(item, costingItm.itemList);
                        } else {
                            logger.info(["Could not find data"]);
                        }
                    }
                },
                onHideColumns = function() {

                },
                onDeleteCostinOpt = function (itm) {
                    if (costingOptionslist().length < 2) {
                        logger.info(["Costing Sheet should have atleat one costing option"]);
                    } else {
                        onDeleteCostingOpt(true);
                        deleteOption.update(itm);
                    }
                },
                onDeleteConfirmCostingOption = function() {
                    onDeleteOptions();
                },
                onDeleteCancelCostingOption = function() {
                    onDeleteCostingOpt(false);
                },
                afterDeletingCostingOpt = function() {
                    onDeleteCostingOpt(false);
                },
                onDeleteCostinggg = function() {
                    onDeleteCosting(true);
                },
                onDeleteConfirmCostingSheet = function() {
                    onDeleteCostingSheet();
                },
                onDeleteCancelCostingSheet = function() {
                    onDeleteCosting(false);
                },
                afterDeletingCosting = function() {
                    onDeleteCosting(false);
                },
                onDeleteCostingSheet = function() {
                    datacontext.costingSheet.deleteCostingSheet({
                        success: function(Id) {
                            if (Id == -1) {
                                logger.error(["Cannot delete costing sheet.! used in FG"]);
                            } else {
                                if (bomMasterId()) {
                                    costingSheetId(null);
                                    costSheet.update(null);
                                    selectedColorIds.removeAll();
                                    selectedOptionIds.removeAll();
                                    selectedSizeIds.removeAll();
                                    onDeleteCosting(false);
                                    resetCostingChanged();
                                    window.location.href = config.systemBaseUrl + config.hashes.productMenu.newCosting + '/' + cycleId() + '/' + bomMasterId();
                                    ProdInfo.loadData();
                                } else {
                                    onDeleteCosting(false);
                                    resetCostingChanged();
                                    costingSheetId(null);
                                    costSheet.update(null);
                                }
                            }
                        },
                        error: function() {
                        }
                    }, costingSheetId());
                },
                onCostingItemDeleteCancel = function() {
                    deleteCostingItemId(null);
                },
                DeleteItemFromArray = function(item, Array) {
                    var result = _.filter(Array(), function(elm) {
                        return elm.id() == item.id();
                    });
                    if (result && result.length > 0) { //item exist then remove
                        Array.remove(result[0]);
                    }
                    Array.valueHasMutated();
                    resetSeqNo();
                    logger.success([config.toasts.deleteData]);
                    deleteCostingItemId(null);
                },

                onClickAddNewOption = function() {
                    //Add new Empty Tab
                    var temp = _.find(costingOptionslistTab(), function(itm) {
                        return itm.id() == -1;
                    });
                    _.each(fullCostingItemList(), function(itm) {
                        itm.itemList.removeAll();
                    });
                    //Find any option in the tab 
                    if (!temp) {
                        costingOption.update(null);
                        var extraCostingOption = new model.costingOptions();
                        var index = costingOptionslistTab().length + 1;
                        var name = 'Costing Option - ' + index;
                        costingOption.id(-1);
                        costingOption.costingSheetId(costingSheetId());
                        extraCostingOption.name(name);
                        extraCostingOption.id(-1);
                        extraCostingOption.costingSheetId(costingSheetId());
                        costingOptionslistTab().push(extraCostingOption);
                        costingOptionslistTab.valueHasMutated();
                        //Reset dirty flag
                        costingOption.dirtyFlag().reset();
                        isCostingOptionChanged(false);
                    } else {
                        logger.info(["Save Previous Option"]);
                        return;
                    }
                },
                saveCostingOptions = function() {
                    var changedOpt = _.find(costingOptionslistTab(), function(cOpt) {
                        return cOpt.id() == costingOption.id();
                    });
                    changedOpt.description(costingOption.description());
                    costingOptionslistTab.valueHasMutated();

                    if (costingOption.bomMasterColorId() && costingOption.bomMasterOptionId() && costingOption.bomMasterSizeSplitId()) {
                        config.isRefreshing(true);
                        datacontext.costingSheet.saveCostingOptions({
                            success: function(costingOptId) {
                                costingOption.id(costingOptId);
                                var temp = _.find(costingOptionslistTab(), function(itm) {
                                    return itm.id() == -1;
                                });
                                if (temp) {
                                    temp.id(costingOptId);
                                    temp.bomMasterColorId(costingOption.bomMasterColorId());
                                    temp.bomMasterOptionId(costingOption.bomMasterOptionId());
                                    temp.bomMasterSizeSplitId(costingOption.bomMasterSizeSplitId());
                                }
                                costingOptionslist().push(temp);
                                costingOptionslist.valueHasMutated();
                                getCostingSheetItemsForOptions();
                            },
                            error: function() {
                            }
                        }, getCostingOptionsFilter());
                    } else {
                        logger.error(['Invalid Data']);
                    }
                },
                getCostingOptionsFilter = function() {
                    var tempOptions = new model.costingOptionFilter();
                    tempOptions.userId(config.loggedUser.id());
                    tempOptions.bomMasterId(bomMasterId());
                    tempOptions.costingSheetId(costingSheetId());
                    tempOptions.costingOptionId(costingOption.id());
                    tempOptions.bomMasterColrId(costingOption.bomMasterColorId());
                    tempOptions.bomMasterOptionId(costingOption.bomMasterOptionId());
                    tempOptions.bomMasterSizeId(costingOption.bomMasterSizeSplitId());
                    tempOptions.costingOptionComment(costingOption.description());
                    return tempOptions;
                },
                onClickIsDirect = function() {
                    costingOption.isDirect(!costingOption.isDirect());
                    costingOption.constructionMasterId(null);
                    costingOption.smvMasterId(null);
                    costingOption.smv(0);
                    costingOption.factoryCMRatePerMin(0);
                    costingOption.factoryCM(0);
                    costingOption.earningsPerMin(0);
                    costingOption.earnings(0);
                },
                //other
                addPropertyValidationErrors = ko.computed(function() {
                    var valArray = ko.validation.group(addCostingproperty)();
                    return valArray;
                }),
                editPropertyValidationErrors = ko.computed(function() {
                    var valArray = ko.validation.group(editCostingProperty)();
                    return valArray;
                }),
                isPropertysValid = function(element, existElementSet, index) {
                    var matchFount = false;
                    for (var i = 0, l = existElementSet.length; i < l; i++) {
                        if (matchFount) break;
                        var elem = existElementSet[i];
                        if (element.id() > 0) {
                            if (elem.id() != element.id() &&
                                element.name().toLowerCase().trim() == elem.name().toLowerCase().trim()) {
                                matchFount = true;
                            }
                        } else {
                            if (index != i &&
                                element.name().toLowerCase().trim() == elem.name().toLowerCase().trim()) {
                                matchFount = true;
                            }
                        }
                    }
                    return matchFount;
                },
                preparProperty = function(item) {
                    if (!item.id() || item.id() <= 0) {

                        item.costingSheetId(costingSheetId());
                        item.createdDate(utils.convertToStandardDateString(new Date()));
                        item.createdBy(config.loggedUser.id());
                        item.propertyTypeId(config.referenceValues.refPropertyTypes.Text.id);
                    }
                },
                onPropertyAdd = function() {
                    addCostingproperty.name.valueHasMutated();
                    if (addPropertyValidationErrors().length <= 0) {
                        if (!isPropertysValid(addCostingproperty, editCostingProperties(), -1)) {
                            var tempProperty = new costingProperty();
                            tempProperty.update(addCostingproperty);
                            tempProperty.costingSheetId(costingSheetId());
                            preparProperty(tempProperty);
                            editCostingProperties.push(tempProperty);
                            _.each(editCostingProperties(), function(elm) {
                                elm.costingSheetId(costingSheetId());
                            });
                            addCostingproperty.update(null);
                            clearErrors(addCostingproperty);
                        } else {
                            addCostingproperty.name.setError(config.validationMessages.exists('Name'));
                            logger.error([config.validationMessages.exists('Name')]);
                        }
                    } else {
                        logger.error([config.toasts.invalidDataAdd]);
                    }
                },
                onPropertyEdit = function(item, index) {
                    editCostingProperty.update(item);
                    editCostingPropertyIndex(index);
                    deleteCostingPropertyIndex(null);
                },
                onPropertyEditCancel = function() {
                    editCostingProperty.update(null);
                    editCostingPropertyIndex(null);
                },
                onPropertyEditAccept = function() {
                    clearErrors(editCostingProperty);
                    if (editPropertyValidationErrors().length <= 0) {
                        if (!isPropertysValid(editCostingProperty, editCostingProperties(), editCostingPropertyIndex())) {
                            var tempProperty = editCostingProperties()[editCostingPropertyIndex()];
                            tempProperty.update(editCostingProperty);
                            preparProperty(tempProperty);
                            // tempProperty.costingSheetId(costingSheetId());
                            _.each(editCostingProperties(), function(elm) {
                                elm.costingSheetId(costingSheetId());
                            });
                            editCostingPropertyIndex(null);
                            editCostingProperty.update(null);
                        } else {
                            editCostingProperty.name.setError(config.validationMessages.exists('Property'));
                            logger.error([config.validationMessages.exists('Property')]);
                        }
                    } else {
                        logger.error([config.toasts.invalidData]);
                    }
                },
                onCostingPropertyDelete = function(index) {
                    editCostingProperty.update(null);
                    editCostingPropertyIndex(null);
                    deleteCostingPropertyIndex(index);
                },
                onCostingPropertyDeleteCancel = function() {
                    deleteCostingPropertyIndex(null);
                },
                onCostingPropertyDeleteAccept = function() {
                    editCostingProperties.remove(editCostingProperties()[deleteCostingPropertyIndex()]);
                    deleteCostingPropertyIndex(null);
                    _.each(editCostingProperties(), function(elm) {
                        elm.costingSheetId(costingSheetId());
                    });
                },
                updateEditCostingProperty = function() {
                    editCostingProperties().length = 0;
                    _.each(costingSheetProperties(), function(bp) {
                        var temp = new costingProperty();
                        temp.update(bp);
                        editCostingProperties().push(temp);
                    });
                    editCostingProperties.valueHasMutated();
                },
                afterPropertyPop = function() {
                    showPropertyPop(false);
                },
                onPropertyPop = function() {
                    showPropertyPop(true);
                    addCostingproperty.update(null);
                    editCostingProperty.update(null);
                    editCostingPropertyIndex(null);
                    updateEditCostingProperty();
                    clearErrors(addCostingproperty);

                },
                clearErrors = function(item) {
                    for (var prop in item) {
                        if (item[prop].clearError) {
                            item[prop].clearError();
                        }
                    }
                },
                updateGroupOtherType = function(editItems, csItemId) {
                    //deleted items
                    for (var i = 0, l = editItems().length; i < l; i++) {
                        var ei = editItems()[i];
                        var match = _.find(costingSheetProperties(), function(bp) {
                            return bp.id() == ei.propertyTypeId;
                        });
                        if (!match) {
                            editItems().splice(i, 1);
                            i = i - 1;
                            l = l - 1;
                        }
                    };
                    _.each(costingSheetProperties(), function(bp) {
                        var match2 = _.find(editItems(), function(ei2) {
                            return bp.id() == ei2.costingPropertyId();
                        });
                        if (!match2) {
                            var newEditItem = new costingPropertyvalue();
                            newEditItem.costingPropertyId(bp.id());
                            newEditItem.csItemId(csItemId);
                            editItems().push(newEditItem);
                        } else {
                            match2.csItemId(csItemId);
                        }
                    });
                    editItems.valueHasMutated();

                },
                updateGroupOtherTypes = function() {
                    _.each(fullCostingItemList(), function(ci) {
                        updateGroupOtherType(ci.costingItemData.costingPropertyValues);
                        _.each(ci.itemList(), function(item) {
                            updateGroupOtherType(item.costingPropertyValues, item.id());
                        });
                    });
                    //updateOtherValues();
                },
                updateOtherValues = function() {
                    _.each(fullCostingItemList(), function(item) {
                        _.each(item.itemList(), function(value) {
                            var csItemValues = _.filter(costingPropertiesValues, function(pv) {
                                return pv.CSItemCostingOption.CostingItemId == value.id();
                            });
                            _.each(value.costingPropertyValues(), function(cpv) {
                                var pValue = _.find(csItemValues, function(itemValue) {
                                    return itemValue.CostingPropertyId == cpv.costingPropertyId();
                                });
                                cpv.value(pValue ? pValue.Value : null);
                                cpv.id(pValue ? pValue.Id : null);
                                cpv.dirtyFlag().reset();
                            });
                        });
                    });
                },
                loadPropertyData = function() {
                    //ReloadProperties
                    datacontext.costingSheet.getPropertyByMasterId({
                        success: function(result) {
                            costingSheetProperties().length = 0;
                            if (result) {
                                _.each(result, function(p) {
                                    costingSheetProperties().push(p);
                                });
                            }
                            costingSheetProperties.valueHasMutated();
                            //update propery values
                            costingPropertiesValues = _.filter(costingPropertiesValues, function(pv) {
                                return _.find(costingSheetProperties(), function(cp) {
                                    return cp.id() == pv.CostingPropertyId;
                                });
                            });
                            updateGroupOtherTypes();
                        },
                        error: function() {
                        }
                    }, costingSheetId());
                },
                isCSItemDirty = function(item) {
                    var isDirty = isItemDirty(item);
                    if (isDirty) {
                        return true;
                    }
                    _.all(item.costingPropertyValues(), function(pv) {
                        isDirty = pv.isDirty ? pv.isDirty() : pv.dirtyFlag().isDirty();
                        return !isDirty;
                    });
                    return isDirty;
                },
                isItemDirty = function(item) {
                    var isDirty = item.isDirty ? item.isDirty() : item.dirtyFlag().isDirty();
                    return isDirty;
                },
                onPropertySave = function() {
                    config.isRefreshing(true);
                    datacontext.costingSheet.saveProperty({
                        success: function() {
                            logger.success([config.toasts.savedData]);
                            loadPropertyData();
                            showPropertyPop(false);
                            config.isRefreshing(false);
                        },
                        error: function() {
                            showPropertyPop(false);
                            config.isRefreshing(false);
                        }
                    }, costingSheetId(), config.loggedUser.id(), editCostingProperties());
                },
                onCSItemRowLeave = function(data) {
                    //activate update
                    if (!isCostingItemsChanged() && isCSItemDirty(data)) {
                        isCostingItemsChanged(true);
                    }
                    calculateTotal();
                },
                onCSItemRowEnter = function(data) {
                    //activate update
                    if (!isCostingItemsChanged() && isCSItemDirty(data)) {
                        isCostingItemsChanged(true);
                    }
                    calculateTotal();
                },
                onCSOtherRowLeave = function(data) {
                    //activate update
                    if (!isCostingOthersChanged() && isItemDirty(data)) {
                        isCostingOthersChanged(true);
                    }
                    calculateTotal();
                },
                setCostingValues = function() {
                    var costingPValues = [];
                    // getCostingPropertiesValues();
                    _.each(fullCostingItemList(), function(item) {
                        _.each(item.itemList(), function(elm) {
                            _.each(elm.costingPropertyValues(), function(values) {
                                if (values.id() > 0 || values.value()) {
                                    costingPValues.push(values);
                                }
                            });
                        });
                    });
                    return costingPValues;
                },
                afterQuestionMove = function() {
                    resetSeqNo();
                },
                onOrganizeKeyAreas = function(state) {
                    organizeMode(state);
                },
                onSelectPlantCost = function(data, event) {
                    if (!isNaN(event.target.innerText)) {
                        var ff = event.target.innerText;
                        costingOption.factoryCM(parseFloat(ff));
                    }

                },
                onCreateOneOpt = function() {
                    if (costingOption.bomMasterColorId() == null && costingOption.bomMasterOptionId() == null && costingOption.bomMasterSizeSplitId() == null) {
                        costingOption.bomMasterColorId.valueHasMutated();
                        costingOption.bomMasterOptionId.valueHasMutated();
                        costingOption.bomMasterSizeSplitId.valueHasMutated();
                        logger.error(["Insufficient Data!"]);
                        return;
                    }
                    var temp = _.find(costingOptionslist(), function(cosOpt) {
                        return (cosOpt.bomMasterOptionId() == costingOption.bomMasterOptionId() &&
                            cosOpt.bomMasterColorId() == costingOption.bomMasterColorId() &&
                            cosOpt.bomMasterSizeSplitId() == costingOption.bomMasterSizeSplitId());
                    });
                    if (temp) {
                        logger.error(["Costing option already Exists!"]);
                        if (costingOption.id() == -1) {
                            costingOption.bomMasterColorId(null);
                            costingOption.bomMasterOptionId(null);
                            costingOption.bomMasterSizeSplitId(null);
                        }
                        config.isRefreshing(false);
                        return;
                        //Change an Existing Option
                    } else if (costingOption.id() != -1 && costingOption.bomMasterColorId() != null && costingOption.bomMasterOptionId() != null && costingOption.bomMasterSizeSplitId() != null) {
                        onCreateNewPopUp(true);
                    } else {
                        saveCostingOptions();
                    }
                },

               onCreateOneOptAccept = function () {
                    onCreateNewPopUp(false);
                    if (bomMasterId() != null) {
                        saveCostingOptions();
                    } else {
                        var index = 1;
                        var csOpt = new new model.costingOptions();
                        csOpt.name = 'Costing Option -' + index;
                        costingOptionslist().push(csOpt);
                        costingOptionslistTab().push(csOpt);
                        isCostingOptionChanged(true);
                    }
               },

          onCreateOneOptCancel = function () {
                    onCreateNewPopUp(false);
                },
                setCreateButton = function() {
                    if (iniDataLoaded() == true) {
                        if (costingOption.bomMasterSizeSplitId() != null && costingOption.bomMasterOptionId() != null && costingOption.bomMasterColorId() != null) {
                            isCreateButton(true);
                        }
                    }
                },
                onCostSheetChange = function() {
                    if (!isCostingSheetChanged() && isItemDirty(costSheet)) {
                        isCostingSheetChanged(true);
                    }
                },
                onCostingOptionChange = function() {
                    if (!isCostingOptionChanged() && isItemDirty(costingOption)) {
                        isCostingOptionChanged(true);
                    }
                },
                onReportColumnShow = function() {
                    config.isRefreshing(true);
                    //load data
                    loadReportColumData(config.referenceValues.reportTypes.Costing.id);
                },

                loadReportColumData = function(reportTypeId) {
                    reportColumns().length = 0;
                    reportHidenColumns().length = 0;
                    // isShowReportColumn(false);
                    $.when(datacontext.reportColumn.getColumnsByReportType({
                                success: function(result) {
                                    reportColumns().length = 0;
                                    _.each(result, function(item) {
                                        reportColumns().push(item);
                                    });
                                },
                                error: function() {}
                            }, reportTypeId),
                            datacontext.reportColumn.getColumnsByUserAndReport(
                            {
                                success: function(result) {
                                    reportHidenColumns().length = 0;
                                    _.each(result, function(item) {
                                        reportHidenColumns().push(item.columnId());
                                    });
                                },
                                error: function() {}
                            }, reportTypeId, config.loggedUser.id()))
                        .then(function() {
                                reportHidenColumns.valueHasMutated();
                                reportColumns.valueHasMutated();
                                isShowReportColumn(true);
                                config.isRefreshing(false);
                            },
                            function() {
                                logger.error([config.toasts.errorGettingData]);
                            });
                },
                clearColumnHideData = function() {
                    reportColumns.removeAll();
                    reportHidenColumns.removeAll();
                    isShowReportColumn(false);
                },
                onReportColumnCancel = function() {
                    clearColumnHideData();
                },
                onReportHideColumnCheck = function(data) {
                    var match = _.find(reportHidenColumns(), function(item) {
                        return item == data.Id;
                    });
                    if (match) {
                        reportHidenColumns.remove(match);
                    } else {
                        reportHidenColumns.push(data.Id);
                    }
                },
                onReportColumnSave = function() {
                    config.isRefreshing(true);
                    var reportTypeId = config.referenceValues.reportTypes.Costing.id;
                    datacontext.reportColumn.saveColumns(
                    {
                        success: function() {
                            setHiddenColumns(reportHidenColumns());
                            clearColumnHideData();
                            config.isRefreshing(false);
                        },
                        error: function() {
                            logger.error([config.toasts.errorSavingData]);
                            config.isRefreshing(false);
                        }
                    }, reportTypeId, config.loggedUser.id(), reportHidenColumns());
                },
                setHiddenColumns = function(ids) {
                    isPositionVisible(ids.indexOf(362) == -1);
                    isItemNoVisible(ids.indexOf(380) == -1);
                    isMatSubCategoryVisible(ids.indexOf(363) == -1);
                    isSupplierVisible(ids.indexOf(343) == -1);
                    isArticleNoVisible(ids.indexOf(366) == -1);
                    isMeasurmentVisible(ids.indexOf(367) == -1);
                    isColVisible(ids.indexOf(71) == -1);
                    isConsumptionUOMVisible(ids.indexOf(88) == -1);
                    isBOMGrossConsumptionVisible(ids.indexOf(373) == -1);
                    isWastageVisible(ids.indexOf(177) == -1);
                    isCostGrosConsumpVisible(ids.indexOf(374) == -1);
                    isPcPerPackVisible(ids.indexOf(369) == -1);
                    isRatioVisible(ids.indexOf(375) == -1);
                    isFOBPriceVisible(ids.indexOf(74) == -1);
                    isCOFVisible(ids.indexOf(376) == -1);
                    isFreightVisible(ids.indexOf(377) == -1);
                    isCIFPriceVisible(ids.indexOf(75) == -1);
                    isPriceUomVisible(ids.indexOf(175) == -1);
                    isPricePerVisible(ids.indexOf(76) == -1);
                    isPcPerPackVisible(ids.indexOf(379) == -1);
                    isCurrencyVisible(ids.indexOf(73) == -1);
                    isMOQVisible(ids.indexOf(52) == -1);
                    isMCQVisible(ids.indexOf(53) == -1);
                    isReqVisible(ids.indexOf(381) == -1);
                    isSurchargeVisible(ids.indexOf(378) == -1);
                    columnCount(24 - ids.length);
                },
                loadReportHidenColumn = function(callback, reportTypeId) {
                    reportHidenColumns().length = 0;
                    datacontext.reportColumn.getColumnsByUserAndReport(
                    {
                        success: function(result) {
                            callback(result);
                        },
                        error: function() {
                            logger.error([config.toasts.errorGettingData]);
                        }
                    }, reportTypeId, config.loggedUser.id(), true);
                },
                onChangesAccept = function () {
                   //GetMatching BOM Items and save with new values
                    datacontext.costingSheet.updateViaBOMItems({
                        success: function (result) {
                            isAnyBOMItemChanged(false);
                            getCostingSheetItemsForOptions(costingOption);
                            isCostSheetChangedPopUp(false);
                        },
                        error: function() {}
                    }, costingSheetId());
                },

                getIdList = function() {
                    var idList = [];
                    _.each(FullCostingObjList(), function(item) {
                        idList.push(_.chain((item.ItemList())
                           .filter(function (cs) { return cs.isBOMItemChanged() == true; })
                           .map(function (itm) { return itm.bomId(); })
                           .value()));
                    });
                    return idList;
                },
                onChangesCancel = function() {
                    isCostSheetChangedPopUp(false);
                    isAnyBOMItemChanged(false);
                },

                dummyMethod = function () {
                  
                },

                setChanges = function() {
                    isCostingSheetChanged(true);
                },
                isConstructionSelected = function() {
                    if (costingOption.constructionMasterId() != null && costingOption.smv() != routedSMV()) {
                        costingOption.constructionMasterId(null);
                    }
                },
                addSubscriptions = function() {

                    costingOption.constructionMasterId.subscribe(getRoutedValue);
                    costingOption.bomMasterColorId.subscribe(setCreateButton);
                    costingOption.bomMasterOptionId.subscribe(setCreateButton);
                    costingOption.bomMasterSizeSplitId.subscribe(setCreateButton);
                    //costSheet.name.subscribe(checkForValidName);
                    costSheet.dirtyFlag().isDirty.subscribe(onCostSheetChange);
                    costingOption.dirtyFlag().isDirty.subscribe(onCostingOptionChange);
                    costSheet.name.subscribe(setChanges);
                    costSheet.totalOrderQty.subscribe(setChanges);
                    costSheet.customerFob.subscribe(setChanges);
                    costingOption.bomMasterColorName.subscribe(setChanges);
                    costingOption.bomMasterOptionName.subscribe(setChanges);
                    costingOption.bomMasterSizeSplitName.subscribe(setChanges);
                    //isShowReportColumn.subscribe(dummyMethod);
                   // costingOption.smv.subscribe(isConstructionSelected());
                },
                init = function() {
                    addSubscriptions();
                };
            init();
            return {
                activate: activate,
                onCreateOneOptAccept: onCreateOneOptAccept,
                onCreateOneOptCancel: onCreateOneOptCancel,
                onCreateNewPopUp: onCreateNewPopUp,
                otherCostUSD: otherCostUSD,
                confrimPopUp: confrimPopUp,
                onCancelCostingOption: onCancelCostingOption,
                costingOptionLeave: costingOptionLeave,
                onCostingOptionLeave: onCostingOptionLeave,
                afterPopUp: afterPopUp,
                onCollapseOther: onCollapseOther,
                supCollapsStateOther: supCollapsStateOther,
                onOtherCostingItemDelete: onOtherCostingItemDelete,
                onOtherCostingItemDeleteCancel: onOtherCostingItemDeleteCancel,
                onOtherCostingtemDeleteAccept: onOtherCostingtemDeleteAccept,
                onCreate: onCreate,
                selectedColorIds: selectedColorIds,
                RMColourList: RMColourList,
                afterRender: afterRender,
                selectedOptionIds: selectedOptionIds,
                selectedSizeIds: selectedSizeIds,
                SizesList: SizesList,
                OptionsList: OptionsList,
                costingOptionslist: costingOptionslist,
                getBomColor: getBomColor,
                getBomSizeSplit: getBomSizeSplit,
                getBomOption: getBomOption,
                costSheet: costSheet,
                supCollapsState1: supCollapsState1,
                supCollapsState: supCollapsState,
                onCollapse: onCollapse,
                fullCostingItemList: fullCostingItemList,
                costingOption: costingOption,
                onClickTab: onClickTab,
                onCostingCopy: onCostingCopy,
                getRowColor: getRowColor,
                unitOfMeasureList: unitOfMeasureList,
                transportModeList: transportModeList,
                currencyList: currencyList,
                getRMReferenceNos: getRMReferenceNos,
                onPickRMFromButton: onPickRMFromButton,
                getTransport: getTransport,
                supplierList: supplierList,
                getUOMValue: getUOMValue,
                getCurrencyValue: getCurrencyValue,
                getsupplier: getsupplier,
                getColourPicker: getColourPicker,
                isColorPlicker: isColorPlicker,
                onClickColourHighligting: onClickColourHighligting,
                onPickRM: onPickRM,
                onColorPick: onColorPick,
                setAutoCompleteValue: setAutoCompleteValue,
                getTotalCalculation: getTotalCalculation,
                rmAndOtherCosts: rmAndOtherCosts,
                showRMPicker: showRMPicker,
                afterRMPick: afterRMPick,
                onCostingItemsSelectAll: onCostingItemsSelectAll,
                onCostingItemSelect: onCostingItemSelect,
                getTotalSum: getTotalSum,
                onClickOther: onClickOther,
                otherCostList: otherCostList,
                otherCosting: otherCosting,
                SumValue: SumValue,
                onDeleteCostingSheet: onDeleteCostingSheet,
                onClickAddNewOption: onClickAddNewOption,
                supCollapsStateItems: supCollapsStateItems,
                onCollapseItems: onCollapseItems,
                onClickIsDirect: onClickIsDirect,
                onDeleteCosting: onDeleteCosting,
                ConstructionMastersList: ConstructionMastersList,
                onSaveCostingSheet: onSaveCostingSheet,
                onCostingItemAdd: onCostingItemAdd,
                //other
                addCostingproperty: addCostingproperty,
                editCostingProperty: editCostingProperty,
                deleteCostingPropertyIndex: deleteCostingPropertyIndex,
                onPropertyAdd: onPropertyAdd,
                onPropertySave: onPropertySave,
                onCostingPropertyDelete: onCostingPropertyDelete,
                onCostingPropertyDeleteCancel: onCostingPropertyDeleteCancel,
                onCostingPropertyDeleteAccept: onCostingPropertyDeleteAccept,
                showPropertyPop: showPropertyPop,
                afterPropertyPop: afterPropertyPop,
                editCostingProperties: editCostingProperties,
                costingSheetProperties: costingSheetProperties,
                onPropertyPop: onPropertyPop,
                onPropertyEdit: onPropertyEdit,
                onPropertyEditCancel: onPropertyEditCancel,
                onPropertyEditAccept: onPropertyEditAccept,
                editCostingPropertyIndex: editCostingPropertyIndex,
                afterQuestionMove: afterQuestionMove,
                onOrganizeKeyAreas: onOrganizeKeyAreas,

                onCostingItemDelete: onCostingItemDelete,
                deleteCostingItemId: deleteCostingItemId,
                onCostingtemDeleteAccept: onCostingtemDeleteAccept,
                onCostingItemDeleteCancel: onCostingItemDeleteCancel,
                costingSheetId: costingSheetId,
                setCostingValues: setCostingValues,
                showFactoryGrid: showFactoryGrid,
                onSelectPlantCost: onSelectPlantCost,
                deleteOtherCostingItemId: deleteOtherCostingItemId,
                onOtherCostingCopy: onOtherCostingCopy,
                onDeleteOptions: onDeleteOptions,
                costingOptionslistTab: costingOptionslistTab,
                onCreateOneOpt: onCreateOneOpt,
                afterPopUp2: afterPopUp2,
                isCreateButton: isCreateButton,
                onHideColumns: onHideColumns,
                onDeleteConfirmCostingSheet: onDeleteConfirmCostingSheet,
                onDeleteCancelCostingSheet: onDeleteCancelCostingSheet,
                afterDeletingCosting: afterDeletingCosting,
                onDeleteCostinggg: onDeleteCostinggg,
                onDeleteCostinOpt: onDeleteCostinOpt,
                onDeleteConfirmCostingOption: onDeleteConfirmCostingOption,
                onDeleteCancelCostingOption: onDeleteCancelCostingOption,
                afterDeletingCostingOpt: afterDeletingCostingOpt,
                onDeleteCostingOpt: onDeleteCostingOpt,
                showItemDeletePopUp: showItemDeletePopUp,
                BOMMasterSizeGridsList: BOMMasterSizeGridsList,
                isChanged: isChanged,
                onCSItemRowLeave: onCSItemRowLeave,
                onCSOtherRowLeave: onCSOtherRowLeave,
                isItemNoVisible: isItemNoVisible,
                isPositionVisible: isPositionVisible,
                isMatSubCategoryVisible: isMatSubCategoryVisible,
                isSupplierVisible: isSupplierVisible,
                isArticleNoVisible: isArticleNoVisible,
                isMeasurmentVisible: isMeasurmentVisible,
                isColVisible: isColVisible,
                isConsumptionUOMVisible: isConsumptionUOMVisible,
                isBOMGrossConsumptionVisible: isBOMGrossConsumptionVisible,
                isWastageVisible: isWastageVisible,
                isCostGrosConsumpVisible: isCostGrosConsumpVisible,
                isPcPerPackVisible: isPcPerPackVisible,
                isRatioVisible: isRatioVisible,
                isFOBPriceVisible: isFOBPriceVisible,
                isCOFVisible: isCOFVisible,
                isFreightVisible: isFreightVisible,
                isCIFPriceVisible: isCIFPriceVisible,
                isPriceUomVisible: isPriceUomVisible,
                isPricePerVisible: isPricePerVisible,
                isCurrencyVisible: isCurrencyVisible,
                isMOQVisible: isMOQVisible,
                isMCQVisible: isMCQVisible,
                isReqVisible: isReqVisible,
                isSurchargeVisible: isSurchargeVisible,
                onReportColumnShow: onReportColumnShow,
                onReportColumnCancel: onReportColumnCancel,
                isShowReportColumn: isShowReportColumn,
                reportColumns: reportColumns,
                reportHidenColumns: reportHidenColumns,
                onReportHideColumnCheck: onReportHideColumnCheck,
                onReportColumnSave: onReportColumnSave,
                onCopySummeryValue: onCopySummeryValue,
                checkForValidName: checkForValidName,
                onMappedForAllSelect: onMappedForAllSelect,
                onSelectTab: onSelectTab,
                onNavAccept: onNavAccept,
                onNavCancel: onNavCancel,
                onNavigateToOpt: onNavigateToOpt,
                afterNav: afterNav,
                bomMasterId: bomMasterId,
                isAnyBOMItemChanged: isAnyBOMItemChanged,
                isCostSheetChangedPopUp: isCostSheetChangedPopUp,
                afterCostChangedPOP: afterCostChangedPOP,
                onChangesCancel: onChangesCancel,
                onChangesAccept: onChangesAccept
            };
        };
        return NewCosting;
    });