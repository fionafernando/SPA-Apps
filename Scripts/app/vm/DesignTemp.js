define('vm.designTemp',
    ['ko', 'underscore', 'datacontext', 'config', 'sort', 'messenger', 'model', 'utils','model.mapper'],
    function (ko, _, datacontext, config, sort, messenger, model, utils, mapper) {

        var DesignTemp = function () {
            var //---------Properties 
                logger = config.logger,
                templateType = config.referenceValues.refTemplCategories.DRA,
                selectedKeyArea = ko.observable()
                    .extend({ required: { params: true, message: config.validationMessages.required("Key Area") } }),
                selectedUser = ko.observable()
                    .extend({ required: { params: true, message: config.validationMessages.required("Attendee") } }),
                selectedUserEdit = ko.observable()
                    .extend({ required: { params: true, message: config.validationMessages.required("Attendee") } }),
                completeComment = ko.observable()
                    .extend({
                        required: { params: true, message: config.validationMessages.required("Comment") },
                        maxLength: { params: 200, message: config.validationMessages.maxLength("Comment", 200) }
                    }),
                approveComment = ko.observable()
                    .extend({
                        required: { params: true, message: config.validationMessages.required("Comment") },
                        maxLength: { params: 200, message: config.validationMessages.maxLength("Comment", 200) }
                    }),
                triggerRaDelete = ko.observable(),
                triggerOnApproveProcceed = ko.observable(),
                triggerCompleteAction = ko.observable(),
                triggerAttendeeManage = ko.observable(),
                draDocumentId = ko.observable(),
                pdraDocumentId = ko.observable(),
                praDocumentId = ko.observable(),
                actionEditIndex = ko.observable(),
                actionDeleteIndex = ko.observable(),
                attendeeEditIndex = ko.observable(),
                attendeeDeleteIndex = ko.observable(),
                questionEditIndex = ko.observable(),
                questionDeleteIndex = ko.observable(),
                focusQuestion = ko.observable(),
                productId = ko.observable(),
                productTypeId = ko.observable(),
                productNavigationDocStat,
                productNavigationAppStat,
                productNavigationBrief,
                productNavigationCycleId,
                existingTemplates = ko.observableArray(),
                tempAttendeeHolder = ko.observableArray(),
                keyAreaList = ko.observableArray(),
                allActiveUsersList = ko.observableArray([]),
                allUsersList = ko.observableArray(),
                refCommonTypes = ko.observableArray(),
                refProductTypeList = ko.observableArray(),
                refRaTmplCategoryList = ko.observableArray(),
                refRaRiskLevelList = ko.observableArray(),
                deleteActionList = ko.observableArray(),
                mainRa = new model.Ra(),
                mainRaTemplate = new model.RaTemplate(),
                mainRaAreaQuestion = new model.RaAreaQuestion(),
                mainRaQuestionAction = new model.RaQuestionAction(),
                mainRaQuestionActionEdit = new model.RaQuestionAction(),
                mainCompleteRaQuestionAction = new model.RaQuestionAction(),

                //---------------------------------------Permission Modes--------------------------------------
                permCreateDraOrUpdate = ko.observable(false), //183   DRA add edit  
                permCreateDraActions = ko.observable(false), //184  DRA action Creation
                permCompleteActionsWithCommentsAndAttachments = ko.observable(false), //190 complete actions  
                permViewDra = ko.observable(false), //191  DRA View

                loadAddActionPopUp = ko.observable(false),
                 isEditQuestionAction = ko.observable(false),
                selectedQuestion,
                editRaAreaQuestion = new model.RaAreaQuestion(),
                focusNullQuestion = ko.observable(false),
                subscriber1,
                subscriber2,
                subscriber3,
                subscriber4,


                //-----Computed Methods
                loadKeyareaList = ko.computed(function () {
                    if (mainRa.raAreas && mainRa.raAreas().length > 0) {
                        keyAreaList().length = 0;
                        _.each(mainRa.raAreas(), function (item) {
                            if (item.isApplicable()) {
                                keyAreaList().push({ id: item.id, refRaAreaName: item.refRaArea.name });
                            }
                        });
                        keyAreaList.valueHasMutated();
                    }
                }),
                isEditMode = ko.computed(function () {
                    return mainRa.id() > 0;
                }),
                isViewOrApproveMode = ko.computed(function () {
                    return mainRa.isApproved();
                }),
                isViewModeForDropDown = ko.computed(function () {
                    return mainRa.isApproved() || !permCreateDraOrUpdate();
                }),
                isApproveModeLabel = ko.computed(function () {
                    //to do check logged user permissions also
                    return mainRa.customDocumentRiskLevel() == config.referenceValues.raRiskLevals.LowRisk.id;
                }),
               isQuestionCustomEditMode = ko.computed(function () {
                    return mainRaAreaQuestion.id() > 0 && !mainRaAreaQuestion.refRaQuestion.isCustom();
                }),
                isQuestionEditMode = ko.computed(function () {
                    return mainRaAreaQuestion.id() > 0;
                }),
                validationErrRa = ko.computed(function () {
                    var valArray = mainRa ? ko.validation.group(mainRa)() : [];
                    return valArray;
                }),
                validationErrRaQuestion = ko.computed(function () {
                    var valArray = mainRaAreaQuestion ? ko.validation.group(mainRaAreaQuestion)() : [];
                    var valArrayRefQuestion = mainRaAreaQuestion.refRaQuestion ? ko.validation.group(mainRaAreaQuestion.refRaQuestion)() : [];
                    return (valArray + valArrayRefQuestion);
                }),
                validationErrRaQuestionAction = ko.computed(function () {
                    var valArray = mainRaQuestionAction ? ko.validation.group(mainRaQuestionAction)() : [];
                    return valArray;
                }),
                isValidRa = ko.computed(function () {
                    return validationErrRa().length === 0 ? true : false;
                }),
                isValidRaQuestion = ko.computed(function () {
                    return validationErrRaQuestion().length === 0 ? true : false;
                }),
                isValidRaQuestionAction = ko.computed(function () {
                    return validationErrRaQuestionAction().length === 0 ? true : false;
                }),

                //------Methods
                isValidRaQuestionForUpadte = function (raAreaQuestion) {
                    var valArray = raAreaQuestion ? ko.validation.group(raAreaQuestion)() : [];
                    var valArrayRefQuestion = raAreaQuestion.refRaQuestion ? ko.validation.group(raAreaQuestion.refRaQuestion)() : [];
                    return ((valArray.length + valArrayRefQuestion.length) === 0) ? true : false;
                },
                getRelatedUser = function (userId) {
                    if (userId !== 0 && !userId) return null;

                    var user = _.find(allUsersList(), function(item) {
                        return item.Id == userId;
                    });
                    return user; // ? mapper.user.fromDto(user) : null;
                },
                updateUser = function (userObj, user) {
                    if (userObj && user) {
                            user.id(userObj.Id);
                            mapper.user.fromDto(userObj,user);
                        }
                  },
                getRelatedRiskLevel = function (riskLevelId) {
                    return _.find(refRaRiskLevelList(), function (item) {
                        return item.id() == riskLevelId;
                    });
                },
                createCommentObect = function (comment, commentType) {
                    if (comment != null) {
                        comment.commentTypeId(commentType);
                        comment.createdDate(utils.convertToStandardDateString(new Date()));
                        comment.createdBy(config.loggedUser.id());
                        comment.updatedDate(utils.convertToStandardDateString(new Date()));
                        comment.updatedBy(config.loggedUser.id());
                        comment.isActive(true);
                        }
                },
                onActionAdd = function () {
                    if (isValidRaQuestionAction()) {
                        //prepare action object
                        var tempQuestionAction = new model.RaQuestionAction();

                        //  check if action name exists
                        var checkActions = _.find(mainRaAreaQuestion.raQuestionActions(), function (ca) {
                            return ca.name().toLowerCase() == mainRaQuestionAction.name().toLowerCase();
                        });

                        if (checkActions != undefined) {
                            logger.error([config.validationMessages.unique("Action")]);
                        } else {
                            tempQuestionAction.update(mainRaQuestionAction);
                            updateUser(getRelatedUser(mainRaQuestionAction.actionOwnerId()), tempQuestionAction.actionOwner);
                            tempQuestionAction.updatedBy(config.loggedUser.id());
                            tempQuestionAction.updatedDate(utils.convertToStandardDateString(new Date()));
                            tempQuestionAction.createdBy(config.loggedUser.id());
                            tempQuestionAction.createdDate(utils.convertToStandardDateString(new Date()));
                            tempQuestionAction.questionId(mainRaAreaQuestion.id());
                            tempQuestionAction.comment = null;
                            tempQuestionAction.document = null;
                            mainRaAreaQuestion.raQuestionActions.push(tempQuestionAction);
                            clearObject(mainRaQuestionAction);
                        }
                    }
                },

                // Ahila - new 
                // popup function for action
                loadActionPopUp = function () {
                    if (isEditQuestionAction()) {
                        selectedQuestion = null;
                        mainRaAreaQuestion.raQuestionActions().length = 0;
                        mainRaAreaQuestion.raQuestionActions.valueHasMutated();
                    } else {
                        if (loadAddActionPopUp()) {
                            loadAddActionPopUp(false);
                        }
                    }
                    loadAddActionPopUp(true);
                    isEditQuestionAction(false);
                },

                onActionDelete = function (index) {
                    clearObject(mainRaQuestionActionEdit);
                    actionEditIndex(null);
                    actionDeleteIndex(index);
                },
                onActionDeleteAccept = function (action) {
                    //delete
                    if (action.id() > 0) {
                        deleteActionList.push(action.id());

                        var index = -1;
                        if (selectedQuestion && selectedQuestion.raQuestionActions().length > 0) {
                            for (var j = 0; j < selectedQuestion.raQuestionActions().length; j++) {

                                if (selectedQuestion.raQuestionActions()[j].id() == action.id()) {
                                    index = j;
                                    break;
                                }
                            }

                            if (index != -1) {
                                selectedQuestion.raQuestionActions.splice(parseFloat(index), 1);
                                selectedQuestion.raQuestionActions.valueHasMutated();
                            }
                        }
                    }
                    mainRaAreaQuestion.raQuestionActions.remove(action);
                    actionDeleteIndex(null);
                },
                onActionDeleteCancel = function () {
                    actionDeleteIndex(null);
                },
                onActionEdit = function (action, index) {
                    mainRaQuestionActionEdit.update(action);
                    actionDeleteIndex(null);
                    actionEditIndex(index);
                },
                onActionEditAccept = function (action) {
                    //validation
                    if (ko.validation.group(action)().length > 0) {
                        return false;
                    }
                    updateUser(getRelatedUser(action.actionOwnerId()), action.actionOwner);
                    clearObject(mainRaQuestionActionEdit);
                    actionEditIndex(null);
                },
                onActionEditCancel = function (data) {
                    data.update(mainRaQuestionActionEdit);
                    clearObject(mainRaQuestionActionEdit);
                    actionEditIndex(null);
                },
                onAttendeeAdd = function () {
                    var dtoUser = getRelatedUser(selectedUser());
                    if (dtoUser) {
                        var matchedUser = new model.User();
                        updateUser(dtoUser, matchedUser);
                        var isUserExists = _.find(mainRa.users(), function(item) {
                            return item.id() == selectedUser();
                        });
                        if (isUserExists != undefined) {
                            logger.error([config.validationMessages.exists("Attendee")]);
                        } 
                         mainRa.users.push(matchedUser);
                        selectedUser(null);
                    }
                },
                onAttendeeEdit = function (attendee, index) {
                    selectedUserEdit(attendee.id());
                    attendeeEditIndex(index);
                },
                onAttendeeCancel = function () {
                    selectedUserEdit(null);
                    attendeeEditIndex(null);
                },
                onAttendeeAccept = function (attendee) {
                    updateUser(getRelatedUser(selectedUserEdit()),attendee);
                    //attendee.update(matchedUpdatedUser);
                    selectedUserEdit(null);
                    attendeeEditIndex(null);
                },
                onAttendeeDelete = function (index) {
                    attendeeDeleteIndex(index);
                },
                onAttendeeDeleteAccept = function (attendee) {
                    mainRa.users.remove(attendee);
                    attendeeDeleteIndex(null);
                },
                onAttendeeDeleteCancel = function () {
                    attendeeDeleteIndex(null);
                },
                templateValidKeyAreaCount = function () {
                    return _.filter(mainRaTemplate.raTmplAreas(), function (item) {
                        return item.refRaArea.isActive();
                    }).length;
                },
                onSaveRa = function (isDeleteMode) {
                    config.isRefreshing(true);
                    if (isValidRa()) {
                        var saveRaObj = new model.Ra();
                        saveRaObj.update(mainRa);

                        //when creating check template has more than one key area
                        if (!(mainRa.id() > 0) && templateValidKeyAreaCount() == 0) {
                            logger.error([config.toasts.draSelectKeyAreaTemplate]);
                            config.isRefreshing(false);
                            return false;
                        }

                        if (mainRa.id() > 0) {
                            //edit ra doc
                            saveRaObj.updatedDate(utils.convertToStandardDateString(new Date()));
                            saveRaObj.updatedBy(config.loggedUser.id());
                            if (isDeleteMode == true) {
                                saveRaObj.isActive(false);
                                triggerRaDelete(false);
                                //when delete no need to pass additional objects
                                saveRaObj.comment = null;
                                saveRaObj.users().length = 0;
                                saveRaObj.users.valueHasMutated();
                                saveRaObj.raAreas().length = 0;
                                saveRaObj.raAreas.valueHasMutated();

                                //call save method
                                saveRaDocumnet(saveRaObj);
                                // updateRaAreaQuestions(saveRaObj);
                            } else {

                                // Update the whole list
                                onSaveQuestionsList();
                            }
                        } else {
                            //add 
                            saveRaObj.createdDate(utils.convertToStandardDateString(new Date()));
                            saveRaObj.updatedDate(utils.convertToStandardDateString(new Date()));
                            saveRaObj.createdBy(config.loggedUser.id());
                            saveRaObj.updatedBy(config.loggedUser.id());
                            saveRaObj.isActive(true);
                            saveRaObj.productTypeId(productTypeId());
                            //copy data from template
                            saveRaObj.name(mainRaTemplate.name());
                            saveRaObj.productId(productId());
                            saveRaObj.templateId(mainRaTemplate.id());
                            saveRaObj.raAreas().length = 0;
                            _.each(mainRaTemplate.raTmplAreas(), function (item) {
                                if (item.refRaArea.isActive()) {
                                    //fill template areas
                                    var tempRaArea = new model.RaArea();
                                    tempRaArea.areaId(item.areaId());
                                    tempRaArea.sequenceNo(item.sequenceNo());
                                    tempRaArea.isApplicable(true);
                                    tempRaArea.refRaArea = null;
                                    //fill template questions
                                    tempRaArea.raAreaQuestions().length = 0;
                                    _.each(item.raTmplAreaQuestions(), function (elm) {
                                        if (elm.refRaQuestion.isActive()) {
                                            var tempRaAreaQuestion = new model.RaAreaQuestion();
                                            tempRaAreaQuestion.questionId(elm.questionId());
                                            tempRaAreaQuestion.sequenceNo(elm.sequenceNo());
                                            tempRaAreaQuestion.isApplicable(true);
                                            tempRaAreaQuestion.refRaQuestion = null;
                                            tempRaAreaQuestion.comment = null;
                                            tempRaAreaQuestion.factoryComment = null;
                                            tempRaAreaQuestion.isSuitable(true);
                                            tempRaAreaQuestion.isTestingRequired(true);
                                            tempRaAreaQuestion.isSuitableForLargeSizes(true);
                                            tempRaAreaQuestion.isYes(true);
                                            tempRaAreaQuestion.isApplicable(true);
                                            tempRaArea.raAreaQuestions().push(tempRaAreaQuestion);
                                        }
                                    });
                                    tempRaArea.raAreaQuestions.valueHasMutated();
                                    saveRaObj.raAreas().push(tempRaArea);
                                }
                            });
                            saveRaObj.raAreas.valueHasMutated();
                            //clear ra template
                            clearObject(mainRaTemplate);
                            //call save method
                            saveRaDocumnet(saveRaObj);
                        }
                    } else {
                        logger.error([config.toasts.invalidData]);
                        config.isRefreshing(false);
                    }
                },
                onCancelRa = function () {
                    clearObject(mainRa);
                    clearObject(mainRaTemplate);
                },
                onDeleteRa = function () {
                    triggerRaDelete(true);
                },
                onDeleteDraAccept = function () {
                    deleteActionList().length = 0;
                    deleteActionList.valueHasMutated();
                    //call save method
                    onSaveRa(true);
                },
                onDeleteDraCancel = function () {
                    triggerRaDelete(false);
                },
                onDeleteDraConfirm = function () {
                    triggerRaDelete(false);
                },
                onApprove = function () {
                    if (approveComment().trim().length > 0) {
                        createCommentObect(mainRa.approvalComment, config.referenceValues.commentTypes.RAApproveComment);
                        mainRa.approvalComment.comment(approveComment().trim());
                        mainRa.isApproved(true);
                        //onSaveRa();
                        config.isRefreshing(true);
                        var saveRaObj = new model.Ra();
                        saveRaObj.update(mainRa);
                        createCommentObect(saveRaObj.comment, config.referenceValues.commentTypes.RAComment);
                        saveRaDocumnet(saveRaObj);
                        triggerOnApproveProcceed(false);
                    } else {
                        logger.error([config.toasts.draAppovalCommentRequired]);
                    }
                },
                onApproveCancel = function () {
                    triggerOnApproveProcceed(false);
                },
                onActionCompleteAfter = function () {
                    triggerCompleteAction(false);
                },
                onActionCompleteCancel = function () {
                    triggerCompleteAction(false);
                },

                onCompleteAction = function () {
                    // Delete actions if there are any
                    if (deleteActionList().length > 0) {
                        $.when(datacontext.ra.deleteList({
                            success: function () {
                                actionCompletion();
                            },
                            error: function () {
                            }
                        }, deleteActionList(), config.loggedUser.id()));
                    } else {
                        actionCompletion();
                    }
                },

                actionCompletion = function () {
                    //if valid action
                    if ($('div.file_uploader .files tr.template-upload').length > 0) {
                        logger.error([config.toasts.draUploadAttachedDoc]);
                    } else if (completeComment().trim().length > 0 && completeComment().trim().length < 100) {

                        var saveActionObj = new model.RaQuestionAction();
                        saveActionObj.update(mainCompleteRaQuestionAction);
                        createCommentObect(saveActionObj.comment, config.referenceValues.commentTypes.RAQuestionActionComment);
                        saveActionObj.comment.comment(completeComment().trim());
                        saveActionObj.isComplete(true);
                        saveActionObj.completedDate(new Date().toISOString().replace("Z",""));

                        //only if one file is attached
                        if ($('div.file_uploader .files tr.template-download:visible').length > 0) {
                            var docRow = $('div.file_uploader .files tr.template-download:visible').first();
                            var name = $('td.name', docRow).html().trim();
                            var realName = $('td.size .hdnUploadedFileUrl', docRow).html().trim().split('=')[1];
                            var filePath = realName.replace(config.uuid + '_', '');
                            //attached documnet  
                            saveActionObj.document.description('DRA Action Complete Documnet');
                            saveActionObj.document.name(name);
                            saveActionObj.document.source('');
                            saveActionObj.document.path(filePath);
                            saveActionObj.document.previewPath('');
                            saveActionObj.document.typeId(config.referenceValues.documentTypes.RiskAnalysisDocuments.id);
                            saveActionObj.document.createdDate(utils.convertToStandardDateString(new Date()));
                            saveActionObj.document.createdBy(config.loggedUser.id());
                            saveActionObj.document.updatedDate(utils.convertToStandardDateString(new Date()));
                            saveActionObj.document.updatedBy(config.loggedUser.id());
                            saveActionObj.document.isActive(true);
                            //moving temp files to permenant sotrage
                            var files = [];
                            var file = {
                                FileCaption: realName,
                                FileName: realName,
                                Thumb: '',
                                DocumentType: config.referenceValues.documentTypes.RiskAnalysisDocuments.id
                            };
                            files.push(file);
                            var obj = { UUID: config.uuid, UploadedFiles: files, UserId: config.loggedUser.id() };
                            $.ajax({
                                type: "POST",
                                dataType: "json",
                                url: "../../../Upload/StorageHandler.ashx",
                                data: { 'data': JSON.stringify(obj) },
                                cache: false
                            }).done(function (msg) {
                            }).fail(function (msg) {
                                if (msg.status != 200) {
                                    logger.error(['Files saving failed.']);
                                }
                            });
                        } else {
                            saveActionObj.document = null;
                        }

                        triggerCompleteAction(false);
                        config.isRefreshing(true);
                        saveRaAreaQuestionAction(saveActionObj);
                    } else {
                        if (completeComment().trim().length >= 100) {
                            logger.error([config.validationMessages.maxLength("Complete comment", 100)]);
                        } else {
                            logger.error([config.toasts.draCompleteCommentRequired]);
                        }
                    }
                },
                
                onClickApproveAndProcced = function () {
                    mainRa.approvalComment.update(null);
                    approveComment('');
                    triggerOnApproveProcceed(true);
                },
                onClickFile = function (fileUrl) {
                    window.open(fileUrl, "_blank");
                },
                onCompleteActionPop = function (questionAction) {
                    if (!permCompleteActionsWithCommentsAndAttachments()) {
                        logger.info([config.infoMessages.dontHavePermission()]);
                        return false;
                    }
                    //clear file uploader
                    $('div.file_uploader .files tr.template-upload').remove();
                    $('div.file_uploader .files tr.template-download').remove();
                    clearQuestionObj();
                    clearObject(mainCompleteRaQuestionAction);
                    mainCompleteRaQuestionAction.update(questionAction);
                    completeComment(questionAction.comment.comment());
                    triggerCompleteAction(true);
                },
                onKeyAreaIsApplicable = function (raArea, state) {
                    _.each(raArea.raAreaQuestions(), function (item) {
                        item.isApplicable(state);
                    });
                    config.isRefreshing(true);
                    var saveRaObj = new model.Ra();
                    saveRaObj.update(mainRa);
                    createCommentObect(saveRaObj.comment, config.referenceValues.commentTypes.RAComment);
                    saveRaDocumnet(saveRaObj);
                },
                onCommonStateChange = function (item, state) {
                    item(state);
                },
                onManageAttendees = function () {
                    selectedUser(null);
                    tempAttendeeHolder().length = 0;
                    _.each(mainRa.users(), function (item) {
                        tempAttendeeHolder().push(item);
                    });
                    tempAttendeeHolder.valueHasMutated();
                    triggerAttendeeManage(true);
                },
                onAfterAttendeeConfirm = function () {
                    onAfterAttendeeCancel();
                },
                onAfterAttendeeCancel = function () {
                    mainRa.users().length = 0;
                    _.each(tempAttendeeHolder(), function (item) {
                        mainRa.users().push(item);
                    });
                    mainRa.users.valueHasMutated();
                    triggerAttendeeManage(false);
                },
                onAfterAttendeeAccept = function () {
                    triggerAttendeeManage(false);
                    //onSaveRa();
                    config.isRefreshing(true);
                    var saveRaObj = new model.Ra();
                    saveRaObj.update(mainRa);
                    createCommentObect(saveRaObj.comment, config.referenceValues.commentTypes.RAComment);
                    saveRaDocumnet(saveRaObj);
                },
                onSaveQuestionOld = function () {
                    var matchedArea = null;
                    if (isValidRaQuestion()) {
                        config.isRefreshing(true);
                        //find related area 
                        matchedArea = _.find(mainRa.raAreas(), function (elm) {
                            return elm.id() == selectedKeyArea();
                        });
                        if (matchedArea != undefined) {
                            //add new
                            mainRaAreaQuestion.sequenceNo(matchedArea.raAreaQuestions().length + 1);
                            mainRaAreaQuestion.raAreaId(matchedArea.id());

                            //ref area question creation
                            mainRaAreaQuestion.refRaQuestion.createdDate(utils.convertToStandardDateString(new Date()));
                            mainRaAreaQuestion.refRaQuestion.updatedDate(utils.convertToStandardDateString(new Date()));
                            mainRaAreaQuestion.refRaQuestion.createdBy(config.loggedUser.id());
                            mainRaAreaQuestion.refRaQuestion.updatedBy(config.loggedUser.id());
                            mainRaAreaQuestion.refRaQuestion.isActive(true);
                            mainRaAreaQuestion.refRaQuestion.isCustom(true);

                            createCommentObect(mainRaAreaQuestion.comment, config.referenceValues.commentTypes.RAQuestionComment);
                            createCommentObect(mainRaAreaQuestion.factoryComment, config.referenceValues.commentTypes.RAQuestionFactoryComment);
                            if (isEditQuestionAction()) {
                                selectedQuestion = null;
                                mainRaAreaQuestion.raQuestionActions().length = 0;
                                mainRaAreaQuestion.raQuestionActions.valueHasMutated();
                            } else {
                                _.each(mainRaAreaQuestion.raQuestionActions(), function(elm) {
                                    createCommentObect(elm.comment, config.referenceValues.commentTypes.RAQuestionActionComment);
                                });
                            }
                            isEditQuestionAction(false);
                                 saveRaAreaQuestion(mainRaAreaQuestion);
                        } else {
                            
                            config.isRefreshing(false);
                           }
                    }
                    if (!mainRaAreaQuestion.refRaQuestion.question()) {
                        focusNullQuestion(true);
                    }
                    loadAddActionPopUp(false);
                    if (!mainRaAreaQuestion.refRaQuestion.question() || !matchedArea) {
                        logger.error([config.toasts.invalidData]);
                    };
                },
                highlightRowBasedOnRiskLevel = function () {
                    var raAreaQuestion = this;
                    raAreaQuestion.riskLevelId(raAreaQuestion.refRaRiskLevel.id());
                },
                 // Ahila - new 
                 onActionAccept = function () {
                        if (selectedQuestion) {
                         var saveSelectedQuestion = selectedQuestion;
                         saveSelectedQuestion.update(editRaAreaQuestion);

                         saveSelectedQuestion.raQuestionActions().length = 0;
                         _.each(mainRaAreaQuestion.raQuestionActions(), function (act) {
                             saveSelectedQuestion.raQuestionActions().push(act);
                         });
                         saveSelectedQuestion.raQuestionActions.valueHasMutated();
                     }
                     loadAddActionPopUp(false);
                     questionEditIndex(null);
                  },

                onSaveQuestionsList = function () {
                    if (isValidRa()) {

                        var saveRaObj = new model.Ra();
                        saveRaObj.update(mainRa);

                        var isUpdateValid = true;
                        createCommentObect(saveRaObj.comment, config.referenceValues.commentTypes.RAComment);
                        _.each(saveRaObj.raAreas(), function (elm) {
                            elm.refRaArea = null;
                            _.each(elm.raAreaQuestions(), function (question) {
                                question.riskLevelId(question.refRaRiskLevel.id());
                                question.responsibleUserId(question.responsibleUser.id());

                                createCommentObect(question.comment, config.referenceValues.commentTypes.RAQuestionComment);
                                createCommentObect(question.factoryComment, config.referenceValues.commentTypes.RAQuestionFactoryComment);
                                _.each(question.raQuestionActions(), function (elm) {
                                    createCommentObect(elm.comment, config.referenceValues.commentTypes.RAQuestionActionComment);
                                });

                                if (!isValidRaQuestionForUpadte(question)) {
                                    isUpdateValid = false;
                                }
                            });
                        });

                        if (isUpdateValid) {
                            saveRaDocumnet(saveRaObj);
                        } else {
                            logger.error([config.toasts.errorSavingData]);
                            config.isRefreshing(false);
                        }
                    }
                },

                 onDeleteQuestion = function (deleteQuestion, keyAreaId) {
                     clearQuestionObj();
                     questionDeleteIndex(keyAreaId + '~' + deleteQuestion.id());
                 },
                onDeleteCancelQuestion = function () {
                    questionDeleteIndex(null);
                },
                onDeleteAcceptQuestion = function (deleteQuestion) {
                    config.isRefreshing(true);
                    questionDeleteIndex(null);
                    deleteRaQuestions(deleteQuestion);
                },

                // Ahila
                onEditAction = function (editQuestion, keyAreaId) {
                    clearQuestionObj();
                    editRaAreaQuestion.riskLevelId.valueHasMutated();
                    editRaAreaQuestion.update(editQuestion);
                    _.each(editQuestion.raQuestionActions(), function (act) {
                        mainRaAreaQuestion.raQuestionActions().push(act);
                    });
                    selectedQuestion = editQuestion;
                    questionEditIndex(keyAreaId + '~' + editQuestion.id());
                    //focusQuestion(true);

                    if (loadAddActionPopUp()) {
                        loadAddActionPopUp(false);
                    }
                    loadAddActionPopUp(true);
                    isEditQuestionAction(true);
                },

                onCancelQuestion = function () {
                    config.isRefreshing(true);
                    clearQuestionObj();
                    loadExistingRaDocument();
                },
                clearQuestionObj = function () {
                    questionEditIndex(null);
                    questionDeleteIndex(null);
                    selectedKeyArea(null);
                    clearObject(mainRaAreaQuestion);
                    defaultRaQuestionObject();
                },
                saveRaAreaQuestionAction = function (saveQuestionAction) {
                    var questionId = saveQuestionAction.questionId();
                    var actionId = saveQuestionAction.id();
                    //save main ra
                    datacontext.ra.questionActionComplete({
                        success: function () {
                            _.each(mainRa.raAreas(), function (item) {
                                _.each(item.raAreaQuestions(), function (elm) {
                                    // Question
                                    if (elm.id() == questionId) {
                                        // Actions
                                        _.each(elm.raQuestionActions(), function (act) {
                                            if (act.id() == actionId) {
                                                act.completedDate(saveQuestionAction.completedDate());
                                                act.isComplete(true);
                                            }
                                        });
                                        elm.raQuestionActions.valueHasMutated();
                                    }
                                });
                                item.raAreaQuestions.valueHasMutated();
                            });
                            clearObject(mainCompleteRaQuestionAction);
                            logger.success(["Action Completed Successfully!"]);
                            config.isRefreshing(false);
                        },
                        error: function () {
                            config.isRefreshing(false);
                        }
                    }, saveQuestionAction);
                },

               //delete raAreaQuestion : ahi
                deleteRaQuestions = function (deleteRaQuestion) {
                    datacontext.ra.deleteQuestionList({
                        success: function () {
                            var findArea = _.find(mainRa.raAreas(), function (area) {
                                return area.id == deleteRaQuestion.raAreaId;
                            });
                            if (findArea) {
                                findArea.raAreaQuestions.remove(deleteRaQuestion);
                            }
                            logger.success([config.toasts.savedData]);
                            loadExistingRaDocument();
                        },
                        error: function () {
                            config.isRefreshing(false);
                        }
                    }, [deleteRaQuestion.id()], config.loggedUser.id());
                },


                //Save new question : ahi
                    saveRaAreaQuestion = function (saveRaQuestionObj) {
                        datacontext.ra.questionSaveList({
                            success: function () {
                                clearQuestionObj();
                                logger.success([config.toasts.savedData]);
                                loadExistingRaDocument();
                            },
                            error: function () {
                                config.isRefreshing(false);
                                
                            }
                        }, [saveRaQuestionObj], config.loggedUser.id());
                    },

            //        //update questions : ahi
            //updateRaAreaQuestions = function (raquestion) {
            //    datacontext.ra.updateQuestionList({
            //        success: function () {
            //            var saveRaObj = new model.Ra();
            //            saveRaObj.update(mainRa);
            //            _.each(saveRaObj.raAreas(), function (elm) {
            //                elm.refRaArea = null;
            //                _.each(elm.raAreaQuestions(), function (question) {
            //                    question.riskLevelId(question.refRaRiskLevel.id());
            //                    question.responsibleUserId(question.responsibleUser.id());

            //                    createCommentObect(question.comment, config.referenceValues.commentTypes.RAQuestionComment);
            //                    createCommentObect(question.factoryComment, config.referenceValues.commentTypes.RAQuestionFactoryComment);
            //                    _.each(question.raQuestionActions(), function (elm) {
            //                        createCommentObect(elm.comment, config.referenceValues.commentTypes.RAQuestionActionComment);
            //                    });
            //                });
            //            });
            //            logger.success([config.toasts.savedData]);
            //            loadExistingRaDocument();
            //        },
            //        error: function () {
            //            config.isRefreshing(false);
            //        }
            //    }, [raquestion], config.loggedUser.id());
            //},

                saveRaDocumnet = function (saveRaObj) {
                    //save main ra
                    if (deleteActionList().length > 0) {
                        $.when(datacontext.ra.deleteList({
                            success: function () {
                                datacontext.ra.saveList({
                                    success: function (result) {
                                        clearObject(mainRa);
                                        mainRaAreaQuestion.raQuestionActions().length = 0;
                                        mainRaAreaQuestion.raQuestionActions.valueHasMutated();
                                        mainRa.id(result[0]);
                                        logger.success([config.toasts.savedData]);
                                        loadExistingRaDocument();
                                    },
                                    error: function () {
                                        config.isRefreshing(false);
                                    }
                                }, [saveRaObj], config.loggedUser.id());
                            },
                            error: function () {
                            }
                        }, deleteActionList(), config.loggedUser.id()));
                    } else {
                        datacontext.ra.saveList({
                            success: function (result) {
                                clearObject(mainRa);
                                mainRaAreaQuestion.raQuestionActions().length = 0;
                                mainRaAreaQuestion.raQuestionActions.valueHasMutated();
                                mainRa.id(result[0]);
                                logger.success([config.toasts.savedData]);
                                loadExistingRaDocument();

                            },
                            error: function () {
                                config.isRefreshing(false);
                            }
                        }, [saveRaObj], config.loggedUser.id());
                    }
                },
                loadTemplate = function () {
                    // Load template for edit
                    if (mainRa.templateId() > 0) {
                        config.isRefreshing(true);
                        datacontext.raTemplate.getFullById({
                            success: function (result) {
                                clearObject(mainRaTemplate);
                                mainRaTemplate.update(result);
                                config.isRefreshing(false);
                            },
                            error: function () {
                                config.isRefreshing(false);
                            }
                        }, mainRa.templateId(), null);
                    }
                },
                loadExistingRaDocument = function () {
                    // Load Ra Document
                    if (mainRa.id() > 0) {
                        datacontext.ra.getFullById({
                            success: function (result) {
                                mainRa.update(result);
                                if (mainRa.id() > 0) {
                                    loadNavigationBrief();
                                    //edit
                                    //update main object users
                                    updateUser(getRelatedUser(mainRa.createdBy()), mainRa.createdUser);
                                    updateUser(getRelatedUser(mainRa.updatedBy()),mainRa.updatedUser);
                                    _.each(mainRa.raAreas(), function (item) {
                                        _.each(item.raAreaQuestions(), function (elm) {
                                            updateUser(getRelatedUser(elm.responsibleUserId()), elm.responsibleUser);
                                            elm.refRaRiskLevel.update(getRelatedRiskLevel(elm.riskLevelId()));
                                            //Add subscriber
                                            subscriber1 = elm.refRaRiskLevel.id.subscribe(highlightRowBasedOnRiskLevel, elm);
                                        });
                                    });
                                } else {
                                    //delete
                                    productNavigationBrief.activeDocId(null);
                                    productNavigationBrief.dra.documentRiskStatus(config.referenceValues.raRiskLevals.NoRisk.id);
                                    clearObject(mainRaTemplate);
                                    triggerRaDelete(false);
                                }
                                deleteActionList().length = 0;
                                deleteActionList.valueHasMutated();
                                config.isRefreshing(false);
                            },
                            error: function () {
                                config.isRefreshing(false);
                            }
                        }, mainRa.id());
                    } else {
                        config.isRefreshing(false);
                    }
                },
                loadNavigationBrief = function () {
                    datacontext.ra.getRaStatusForProduct({
                        success: function (result) {
                            productNavigationBrief.dra.id(result.dra.id());
                            productNavigationBrief.pdra.id(result.pdra.id());
                            productNavigationBrief.pra.id(result.pra.id());
                            productNavigationBrief.activeDocId(result.activeDocId());
                            productNavigationBrief.notificationCount(result.notificationCount());
                        },
                        error: function () {
                        }
                    }, productNavigationCycleId, config.loggedUser.id());
                },
                loadExistingTemplates = function () {
                    // Load All related templates
                    datacontext.raTemplate.getRaTemplates({
                        success: function (resultList) {
                            existingTemplates().length = 0;
                            _.each(resultList, function (item) {
                                if (item.isActive()) {
                                    existingTemplates().push(item);
                                }
                            });
                            existingTemplates.valueHasMutated();
                        },
                        error: function () {
                            config.isRefreshing(false);
                        }
                    }, templateType.id, null);
                },
                activate = function (routeData, naviDataLoad) {
                    //this method fires when activating vm from route
                    config.isRefreshing(true);
                    addSubscriptions();
                    productNavigationCycleId = routeData.productCycleId;
                    setUserPermissions(function () {
                        messenger.publish.viewModelActivated({ canleaveCallback: canLeave });
                        cearPageVariables();
                        mainRa.id(naviDataLoad.raProductBrief.dra.id());
                        draDocumentId(naviDataLoad.raProductBrief.dra.id());
                        pdraDocumentId(naviDataLoad.raProductBrief.pdra.id());
                        praDocumentId(naviDataLoad.raProductBrief.pra.id());
                        productNavigationDocStat = naviDataLoad.raProductBrief.dra.documentRiskStatus;
                        productNavigationAppStat = naviDataLoad.raProductBrief.dra.isApproved;
                        productNavigationBrief = naviDataLoad.raProductBrief;
                        productId(naviDataLoad.productInfo.productCycles()[0].productId());
                        productTypeId(naviDataLoad.productInfo.productCycles()[0].product.typeId());
                        loadInitialData();
                    }, productNavigationCycleId, naviDataLoad.productInfo.customerId(),
                        naviDataLoad.productInfo.departmentId(), naviDataLoad.productInfo.id(), naviDataLoad.raProductBrief.dra.id());
                },
                loadInitialData = function () {
                    //load data
                    $.when(
                         datacontext.users.getAllUserBriefs({
                             success: function (result) {
                                 _.each(result, function(item) {
                                     allUsersList().push(item);
                                 });
                             },
                             error: function () { }
                         }),
                          // datacontext.users.getData(datacontext.getDataOptions(true, sort, sort.nameSort(true), allUsersList())),
                            datacontext.refCommons.getData(datacontext.getDataOptions(true, sort, sort.nameSort(true), refCommonTypes(), null,
                            ['RefProductType', 'RefRATmplCategory', 'RefRARiskLevel'])),
                            loadExistingTemplates())
                        .then(function () {
                            //Load Common data
                            _.each(refCommonTypes(), function (item) {
                                if (item.isActive() == true) {
                                    item.id(item.originalId());
                                    if (item.refCommonType() == "RefProductType") {
                                        refProductTypeList().push(item);
                                    } else if (item.refCommonType() == "RefRATmplCategory") {
                                        refRaTmplCategoryList().push(item);
                                    } else if (item.refCommonType() == "RefRARiskLevel") {
                                        if (item.isActive()) {
                                            refRaRiskLevelList().push(item);
                                        }
                                    }
                                }
                            });
                            allActiveUsersList().length = 0;
                            if (allUsersList() && allUsersList().length > 0) {
                                _.each(allUsersList(), function (item) {
                                    if (item.IsActive) {
                                        allActiveUsersList().push(item);
                                    }
                                });
                                allActiveUsersList.valueHasMutated();
                            }
                            refProductTypeList.valueHasMutated();
                            refRaTmplCategoryList.valueHasMutated();
                            refRaRiskLevelList.valueHasMutated();

                            //calling the ra document load
                            loadExistingRaDocument();
                        });
                },
                alterNavigationDocumentStat = function () {
                    productNavigationDocStat(mainRa.customDocumentRiskLevel());
                },
                alterNavigationApproveStat = function () {
                    if (productNavigationAppStat) {
                        productNavigationAppStat(mainRa.isApproved());
                    }
                },
                getCommentToolTip = function (data) {
                    if (data) {
                        var text = "<div class='con_comment_tooltip'>";
                        text = text + "<span class='' >" + data + "</span>";
                        text = text + "</div>";
                        return text;
                    }
                    return null;
                },
                clearObject = function (object) {
                    object.update(null);
                },
                defaultRaQuestionObject = function () {
                    mainRaAreaQuestion.isSuitable(true);
                    mainRaAreaQuestion.isTestingRequired(true);
                    mainRaAreaQuestion.isSuitableForLargeSizes(true);
                    mainRaAreaQuestion.isYes(true);
                    mainRaAreaQuestion.isApplicable(true);
                    clearObject(mainRaQuestionAction);
                },
                cearPageVariables = function () {
                    //clean variables
                    clearObject(mainRa);
                    clearObject(mainRaTemplate);
                    clearObject(mainRaAreaQuestion);
                    clearObject(mainRaQuestionAction);
                    clearObject(mainCompleteRaQuestionAction);
                    defaultRaQuestionObject();

                    selectedKeyArea(null);
                    selectedUser(null);
                    selectedUserEdit(null);
                    allActiveUsersList.length = 0;
                    allActiveUsersList.valueHasMutated();
                    allUsersList().length = 0;
                    allUsersList.valueHasMutated();
                    refProductTypeList().length = 0;
                    refProductTypeList.valueHasMutated();
                    refRaTmplCategoryList().length = 0;
                    refRaTmplCategoryList.valueHasMutated();
                    refRaRiskLevelList().length = 0;
                    refRaRiskLevelList.valueHasMutated();
                    refCommonTypes().length = 0;
                    refCommonTypes.valueHasMutated();
                    existingTemplates().length = 0;
                    existingTemplates.valueHasMutated();
                },
                setUserPermissions = function (callback, cycleId, customerId, departmentId, product, raDocId) {
                    //check permissions and allow to enter page
                    var taskList = [
                        { taskId: config.referenceValues.permissionTasks.CreateOrUpdateDRA.id, permission: permCreateDraOrUpdate },
                        { taskId: config.referenceValues.permissionTasks.CreateDRAActions.id, permission: permCreateDraActions },
                        { taskId: config.referenceValues.permissionTasks.CompleteActionsWithCommentsAndAttachments.id, permission: permCompleteActionsWithCommentsAndAttachments },
                        { taskId: config.referenceValues.permissionTasks.ViewDRA.id, permission: permViewDra }
                    ];
                    datacontext.refPermissionTasks.checkPermission({
                        success: function (validTasks) {
                            if (!validTasks) validTasks = [];
                            _.each(taskList, function (pt) {
                                pt.permission(validTasks.indexOf(pt.taskId) > -1);
                            });

                            if (permCreateDraOrUpdate() || permViewDra()) {
                                if (raDocId == null && !permCreateDraOrUpdate() && !permViewDra() ) {
                                    //initial creating stage no permission to create
                                    //Redirect to product navigation
                                    window.location.href = config.systemBaseUrl + config.hashes.mainMenu.productNavigation + '/' + cycleId;
                                    logger.info([config.infoMessages.dontHavePermission()]);
                                }
                                callback();
                            } else {
                                //Redirect to product navigation
                                window.location.href = config.systemBaseUrl + config.hashes.mainMenu.productNavigation + '/' + cycleId;
                                logger.info([config.infoMessages.dontHavePermission()]);
                            }
                        },
                        error: function () { }
                    }, config.loggedUser.id(), _.pluck(taskList, 'taskId'), customerId, departmentId, product);
                },
                //file uploader controler related methods
                fileControlRendred = function () {
                    triggerLoadExistingDocs();
                },
                triggerLoadExistingDocs = function () {
                    //method that trigger delete add process actions
                    $('div.file_uploader .files').delegate('tbody', 'fileAddedEvent', null, bindDocTypeDropdown);
                    $('div.file_uploader .files').delegate('tbody', 'filesRemovedEvent', null, updateFileArray);
                    $('div.file_uploader .files').delegate('tbody', 'filesUploadedEvent', null, updateRowSet);
                },
                updateFileArray = function () {
                    //if any file deleted from grid before process
                        $("div.file_uploader div.fileupload-buttonbar .fileinput-button ").show();
                        $('<tr id="dragDrop" style="height: 36px;">' + '<td  colspan="4" style="background: #eee;">' + ' <span class="td_caption">Click the add button or drag and drop your files..!</span>' + ' </td>' + '</tr>').appendTo("div.table_area .files thead");
                  
                },
                bindDocTypeDropdown = function () {
                    //if any file added to grid before
                    //already one file is attached
                         $("div.file_uploader div.fileupload-buttonbar .fileinput-button ").hide();
                        //$("div.file_uploader div.fileupload-buttonbar ").removeClass('fileupload-buttonbar');
                        $("#dragDrop").remove();
                      if ($('div.file_uploader .files tr.template-download:visible').length > 0) {
                        logger.warning([config.toasts.draActionOnlyOneAttachement]);
                       } else {
                        //only one file can be added to upload
                        if ($('div.file_uploader .files tr.template-upload').length > 1) {
                            $('div.file_uploader .files tr.template-upload').first().remove();
                        }
                    }
                },
                updateRowSet = function () {
                    //if any file uploaded
                },
                addSubscriptions = function () {
                    // set subscription for the page one time
                    subscriber2 = mainRa.templateId.subscribe(loadTemplate);
                    //subscriber to change document status of navigation pane
                    subscriber3 = mainRa.customDocumentRiskLevel.subscribe(alterNavigationDocumentStat);
                    //subscribe to check document got approved
                    subscriber4 = mainRa.isApproved.subscribe(alterNavigationApproveStat);
                },
                canLeave = function () {
                    //if any condition to check before leaving
                    return true;
                },
                dispose = function () {
                    //function to fire when leave vm
                    if (subscriber1) {
                        subscriber1.dispose();
                    }
                    if (subscriber2) {
                        subscriber2.dispose();
                    }
                    if (subscriber3) {
                        subscriber3.dispose();
                    }
                    if (subscriber4) {
                        subscriber4.dispose();
                    }


                    //var tempRiskStatus = productNavigationBrief.dra.documentRiskStatus();
                    existingTemplates().length = 0;
                    existingTemplates.valueHasMutated();
                    tempAttendeeHolder().length = 0;
                    tempAttendeeHolder.valueHasMutated();
                    keyAreaList().length = 0;
                    keyAreaList.valueHasMutated();
                    allActiveUsersList().length = 0;
                    allActiveUsersList.valueHasMutated();
                    allUsersList().length = 0;
                    allUsersList.valueHasMutated();
                    refCommonTypes().length = 0;
                    refCommonTypes.valueHasMutated();
                    refProductTypeList().length = 0;
                    refProductTypeList.valueHasMutated();
                    refRaTmplCategoryList().length = 0;
                    refRaTmplCategoryList.valueHasMutated();
                    refRaRiskLevelList().length = 0;
                    refRaRiskLevelList.valueHasMutated();
                    //productNavigationBrief.dra.documentRiskStatus(tempRiskStatus);
                    deleteActionList().length = 0;
                    deleteActionList.valueHasMutated();
                    loadAddActionPopUp(false);
                },
                afterRender = function () {
                    //call file initiotor
                   
                },
                afterCompleteActionPopUp = function() {
                    this.initFileUploadControl();
                    triggerLoadExistingDocs();
                },
                init = function () {
                    //function to fire when vm starts
                    //addSubscriptions();
                };
            init();
            return {
                activate: activate,
                afterRender: afterRender,
                dispose: dispose,

                triggerOnApproveProcceed: triggerOnApproveProcceed,
                triggerCompleteAction: triggerCompleteAction,
                triggerRaDelete: triggerRaDelete,
                triggerAttendeeManage: triggerAttendeeManage,
                actionEditIndex: actionEditIndex,
                actionDeleteIndex: actionDeleteIndex,
                attendeeEditIndex: attendeeEditIndex,
                attendeeDeleteIndex: attendeeDeleteIndex,
                questionEditIndex: questionEditIndex,
                questionDeleteIndex: questionDeleteIndex,
                selectedUser: selectedUser,
                selectedUserEdit: selectedUserEdit,
                selectedKeyArea: selectedKeyArea,
                completeComment: completeComment,
                approveComment: approveComment,
                isEditMode: isEditMode,
                isViewOrApproveMode: isViewOrApproveMode,
                isApproveModeLabel: isApproveModeLabel,
                isQuestionEditMode: isQuestionEditMode,
                isQuestionCustomEditMode: isQuestionCustomEditMode,
                focusQuestion: focusQuestion,
                loggedInUserId: config.loggedUser.id(),
                draDocumentId: draDocumentId,
                pdraDocumentId: pdraDocumentId,
                praDocumentId: praDocumentId,

                allActiveUsersList: allActiveUsersList,
                existingTemplates: existingTemplates,
                refRaRiskLevelList: refRaRiskLevelList,
                keyAreaList: keyAreaList,

                //file uploder
                fileControlRendred: fileControlRendred,
                triggerLoadExistingDocs: triggerLoadExistingDocs,

                permCreateDraOrUpdate: permCreateDraOrUpdate,
                permCreateDraActions: permCreateDraActions,
                permCompleteActionsWithCommentsAndAttachments: permCompleteActionsWithCommentsAndAttachments,
                permViewDra: permViewDra,

                mainRa: mainRa,
                mainRaTemplate: mainRaTemplate,
                mainRaAreaQuestion: mainRaAreaQuestion,
                mainRaQuestionAction: mainRaQuestionAction,
                mainRaQuestionActionEdit: mainRaQuestionActionEdit,
                mainCompleteRaQuestionAction: mainCompleteRaQuestionAction,

                getCommentToolTip: getCommentToolTip,
                onKeyAreaIsApplicable: onKeyAreaIsApplicable,
                onActionAdd: onActionAdd,
                onActionEdit: onActionEdit,
                onActionDelete: onActionDelete,
                onActionDeleteAccept: onActionDeleteAccept,
                onActionDeleteCancel: onActionDeleteCancel,
                onActionEditAccept: onActionEditAccept,
                onActionEditCancel: onActionEditCancel,
                onAttendeeAdd: onAttendeeAdd,
                onAttendeeEdit: onAttendeeEdit,
                onAttendeeDelete: onAttendeeDelete,
                onAttendeeDeleteAccept: onAttendeeDeleteAccept,
                onAttendeeDeleteCancel: onAttendeeDeleteCancel,
                onAttendeeAccept: onAttendeeAccept

                };
        };
        return DesignTemp;
    });
