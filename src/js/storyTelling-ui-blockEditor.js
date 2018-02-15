/*
Copyright 2018 OCAD University
Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.
You may obtain a copy of the ECL 2.0 License and BSD License at
https://raw.githubusercontent.com/fluid-project/sjrk-story-telling/master/LICENSE.txt
*/

/* global fluid */

(function ($, fluid) {

    "use strict";

    fluid.defaults("sjrk.storyTelling.ui.blockEditor", {
        gradeNames: ["sjrk.storyTelling.ui"],
        selectors: {
            storySubmit: ".sjrkc-storyTelling-storySubmit",
            storyEditorNext: ".sjrkc-storyTelling-storyEditorNext",
            storyEditorPrevious: ".sjrkc-storyTelling-storyEditorPrevious",
            storyEditorPage1: ".sjrkc-storyTelling-storyEditorPage1",
            storyEditorPage2: ".sjrkc-storyTelling-storyEditorPage2",
            storyAddTextBlock: ".sjrkc-storyTelling-button-text-block",
            storyAddImageBlock: ".sjrkc-storyTelling-button-image-block",
            storyRemoveSelectedBlocks: ".sjrkc-storyTelling-button-remove-blocks",
            storyRestoreRemovedBlocks: ".sjrkc-storyTelling-button-restore-blocks"
        },
        interfaceControlStrings: {
            storyTitleIdForLabel: "@expand:{that}.getLabelId(title)",
            storyAuthorIdForLabel: "@expand:{that}.getLabelId(author)",
            storyTagsIdForLabel: "@expand:{that}.getLabelId(tags)"
        },
        events: {
            onStorySubmitRequested: null,
            onEditorNextRequested: null,
            onEditorPreviousRequested: null,
            onStoryListenToRequested: null,
            onTextBlockAdditionRequested: null,
            onImageBlockAdditionRequested: null,
            onRemoveBlocksRequested: null,
            onRestoreBlocksRequested: null
        },
        listeners: {
            "onReadyToBind.bindAddTextBlock": {
                "this": "{that}.dom.storyAddTextBlock",
                "method": "click",
                "args": ["{that}.events.onTextBlockAdditionRequested.fire"]
            },
            "onReadyToBind.bindSubmitControl": {
                "this": "{that}.dom.storySubmit",
                "method": "click",
                "args": ["{that}.events.onStorySubmitRequested.fire"]
            },
            "onReadyToBind.bindEditorNextControl": {
                "this": "{that}.dom.storyEditorNext",
                "method": "click",
                "args": ["{that}.events.onEditorNextRequested.fire"]
            },
            "onReadyToBind.bindEditorPreviousControl": {
                "this": "{that}.dom.storyEditorPrevious",
                "method": "click",
                "args": ["{that}.events.onEditorPreviousRequested.fire"]
            },
            "onEditorNextRequested.manageVisibility": {
                funcName: "sjrk.storyTelling.ui.manageVisibility",
                args: [
                    ["{that}.dom.storyEditorPage1"],
                    ["{that}.dom.storyEditorPage2"],
                    "{that}.events.onVisibilityChanged"
                ]
            },
            "onEditorPreviousRequested.manageVisibility": {
                funcName: "sjrk.storyTelling.ui.manageVisibility",
                args: [
                    ["{that}.dom.storyEditorPage2"],
                    ["{that}.dom.storyEditorPage1"],
                    "{that}.events.onVisibilityChanged"
                ]
            }
        },
        // TODO: add events for binding the various buttons
        // TODO: add listeners to handle the various buttons' functionality
        components: {
            templateManager: {
                options: {
                    templateConfig: {
                        templatePath: "%resourcePrefix/src/templates/storyBlockEditor.handlebars"
                    }
                }
            },
            blockManager: {
                type: "sjrk.dynamicViewComponentManager",
                // container: "{ui}.options.selectors.storyContent",
                container: "{ui}.options.selectors.storyContent",
                createOnEvent: "{templateManager}.events.onAllResourcesLoaded",
                options: {
                    dynamicComponents: {
                        managedViewComponents: {
                            type: "sjrk.storyTelling.block.textBlock"
                        }
                    },
                    listeners: {
                        "{blockEditor}.events.onTextBlockAdditionRequested": {
                            func: "{that}.events.viewComponentContainerRequested",
                            namespace: "addItem"
                        }
                    }
                }
            },
            binder: {
                type: "sjrk.storyTelling.binder",
                container: "{ui}.container",
                options: {
                    model: "{story}.model",
                    selectors: "{ui}.options.selectors",
                    bindings: {
                        storyTitle: "title",
                        storyAuthor: "author",
                        storyTags: {
                            selector: "storyTags",
                            path: "tags",
                            rules: {
                                domToModel: {
                                    "" : {
                                        transform: {
                                            type: "sjrk.storyTelling.transforms.stringToArray",
                                            inputPath: ""
                                        }
                                    }
                                },
                                modelToDom: {
                                    "" : {
                                        transform: {
                                            type: "sjrk.storyTelling.transforms.arrayToString",
                                            inputPath: ""
                                        }
                                    }
                                }
                            }
                        }
                    },
                    events: {
                        onUiReadyToBind: "{ui}.events.onReadyToBind"
                    }
                }
            }
        }
    });

})(jQuery, fluid);
