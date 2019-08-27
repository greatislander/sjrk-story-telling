/*
Copyright 2019 OCAD University
Licensed under the New BSD license. You may not use this file except in compliance with this licence.
You may obtain a copy of the BSD License at
https://raw.githubusercontent.com/fluid-project/sjrk-story-telling/master/LICENSE.txt
*/

/* global fluid, jqUnit, sjrk, sinon */

"use strict";

(function ($, fluid) {

    var mockServer;

    jqUnit.test("Test getParameterByName function", function () {
        var testCases = [
            { // test retrieval of set value from provided URL
                parameter: "testParameter",
                url: "testUrl?testParameter=testValue",
                expected: "testValue"
            },
            { // test retrieval of empty value from provided URL
                parameter: "testParameter",
                url: "testUrl?testParameter=",
                expected: ""
            },
            { // test retrieval of set value from falsy URL
                parameter: "testParameter",
                url: null,
                expected: null
            },
            { // test retrieval of null value from provided URL
                parameter: null,
                url: "testUrl?testParameter=testValue",
                expected: null
            },
            { // test retrieval of set value from page URL
                parameter: "testParameterFromUrl",
                url: "",
                expected: "testValue"
            },
            { // test retrieval of null value from page URL
                parameter: null,
                url: "",
                expected: null
            },
            { // test retrieval of empty value from page URL
                parameter: "emptyTestParameterFromUrl",
                url: "",
                expected: ""
            },
            { // test retrieval of missing value from page URL
                parameter: "testParameterNotInUrl",
                url: "",
                expected: null
            }
        ];

        jqUnit.expect(testCases.length);

        fluid.each(testCases, function (testCase, index) {
            if (index === 4) {
                sjrk.storyTelling.testUtils.setQueryString("testParameterFromUrl=testValue&emptyTestParameterFromUrl=");
            }

            var actualResult = sjrk.storyTelling.getParameterByName(testCase.parameter, testCase.url);
            jqUnit.assertEquals("Query string parameter '" + testCase.parameter + "' is retrieved as expected", testCase.expected, actualResult);
        });
    });

    fluid.defaults("sjrk.storyTelling.storyTellingServerUiTester", {
        gradeNames: ["fluid.modelComponent", "fluid.test.testCaseHolder"],
        baseTestCase: {
            clientConfig: {
                theme: "base",
                baseTheme: "base",
                authoringEnabled: true
            }
        },
        model: {
            clientConfig: {
                theme: "customTheme",
                baseTheme: "base",
                authoringEnabled: true
            }
        },
        modules: [{
            name: "Test Storytelling Server UI code",
            tests: [{
                name: "Test themed page loading functions",
                expect: 7,
                sequence: [{
                    funcName: "sjrk.storyTelling.storyTellingServerUiTester.setupMockServer",
                    args: ["/clientConfig", "{that}.options.baseTestCase", "application/json"]
                },{
                    // call the load themed page function, forcing the base theme response
                    task: "sjrk.storyTelling.loadThemedPage",
                    args: ["sjrk.storyTelling.testUtils.callbackVerificationFunction"],
                    resolve: "jqUnit.assertDeepEq",
                    resolveArgs: ["The themed page load resolved as expected", "{that}.options.baseTestCase.clientConfig", "{arguments}.0"]
                },{
                    funcName: "sjrk.storyTelling.storyTellingServerUiTester.teardownMockServer"
                },{
                    // load clientConfig and store that value somewhere
                    task: "sjrk.storyTelling.storyTellingServerUiTester.loadClientConfigFromServer",
                    args: ["/clientConfig", "{that}", "clientConfig.theme"],
                    resolve: "jqUnit.assertDeepEq",
                    resolveArgs: ["Custom theme was loaded successfully", "{that}.model.clientConfig", "{arguments}.0"]
                },{
                    // call the load themed page function, forcing the custom theme response
                    task: "sjrk.storyTelling.storyTellingServerUiTester.verifyCustomThemeLoading",
                    args: ["sjrk.storyTelling.testUtils.callbackVerificationFunction"],
                    resolve: "jqUnit.assertDeepEq",
                    resolveArgs: ["The themed page load resolved as expected", "{that}.model.clientConfig", "{arguments}.0"]
                },{
                    funcName: "sjrk.storyTelling.storyTellingServerUiTester.assertCustomCssLoaded",
                    args: ["{that}.model.clientConfig.theme", 1]
                },{
                    // test the CSS/JS injection function directly
                    funcName: "sjrk.storyTelling.loadCustomThemeFiles",
                    args: ["sjrk.storyTelling.testUtils.callbackVerificationFunction", "{that}.model.clientConfig"]
                },{
                    funcName: "sjrk.storyTelling.storyTellingServerUiTester.assertCustomCssLoaded",
                    args: ["{that}.model.clientConfig.theme", 2]
                }]
            }]
        }]
    });

    sjrk.storyTelling.storyTellingServerUiTester.loadClientConfigFromServer = function (url, component, clientConfigPath) {
        var configPromise = fluid.promise();

        $.get(url).then(function (data) {
            if (data.theme !== data.baseTheme) {
                fluid.set(component.model, clientConfigPath, data.theme);
                configPromise.resolve(data);
            } else {
                configPromise.reject({
                    isError: true,
                    message: "Custom theme was not set in the server configuration."
                });
            }
        }, function (jqXHR, textStatus, errorThrown) {
            configPromise.reject({
                isError: true,
                message: errorThrown
            });
        });

        return configPromise;
    };

    sjrk.storyTelling.storyTellingServerUiTester.verifyCustomThemeLoading = function (callback) {
        var loadPromise = fluid.promise();

        sjrk.storyTelling.loadThemedPage(callback).then(function (clientConfig) {
            loadPromise.resolve(clientConfig);
        }, function () {
            loadPromise.reject();
        });

        return loadPromise;
    };

    sjrk.storyTelling.storyTellingServerUiTester.setupMockServer = function (url, testCase, responseType) {
        mockServer = sinon.createFakeServer();
        mockServer.respondImmediately = true;
        mockServer.respondWith(url, [200, { "Content-Type": responseType }, JSON.stringify(testCase.clientConfig)]);
    };

    sjrk.storyTelling.storyTellingServerUiTester.teardownMockServer = function () {
        mockServer.restore();
    };

    sjrk.storyTelling.storyTellingServerUiTester.assertCustomCssLoaded = function (expectedTheme, expectedInstanceCount) {
        var expectedFileName = expectedTheme + ".css";

        var cssFilesLinked = fluid.transform(fluid.getMembers($("link"), "href"), function (fileUrl) {
            return fileUrl.split("/css/")[1];
        });

        var actualInstanceCount = 0;

        fluid.each(cssFilesLinked, function (fileName) {
            if (fileName === expectedFileName) {
                actualInstanceCount++;
            }
        });

        jqUnit.assertEquals("Linked CSS files include the expected custom theme file the expected number of instances", expectedInstanceCount, actualInstanceCount);
    };

    fluid.defaults("sjrk.storyTelling.storyTellingServerUiTest", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            storyTellingServerUiTester: {
                type: "sjrk.storyTelling.storyTellingServerUiTester"
            }
        }
    });

    $(document).ready(function () {
        fluid.test.runTests([
            "sjrk.storyTelling.storyTellingServerUiTest"
        ]);
    });

})(jQuery, fluid);
