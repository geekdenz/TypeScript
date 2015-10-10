/// <reference path="sys.ts"/>
/// <reference path="types.ts"/>
/// <reference path="core.ts"/>
/// <reference path="scanner.ts"/>
var ts;
(function (ts) {
    /* @internal */
    ts.optionDeclarations = [
        {
            name: "charset",
            type: "string"
        },
        {
            name: "declaration",
            shortName: "d",
            type: "boolean",
            description: ts.Diagnostics.Generates_corresponding_d_ts_file
        },
        {
            name: "diagnostics",
            type: "boolean"
        },
        {
            name: "emitBOM",
            type: "boolean"
        },
        {
            name: "help",
            shortName: "h",
            type: "boolean",
            description: ts.Diagnostics.Print_this_message
        },
        {
            name: "init",
            type: "boolean",
            description: ts.Diagnostics.Initializes_a_TypeScript_project_and_creates_a_tsconfig_json_file
        },
        {
            name: "inlineSourceMap",
            type: "boolean"
        },
        {
            name: "inlineSources",
            type: "boolean"
        },
        {
            name: "jsx",
            type: {
                "preserve": 1 /* Preserve */,
                "react": 2 /* React */
            },
            paramType: ts.Diagnostics.KIND,
            description: ts.Diagnostics.Specify_JSX_code_generation_Colon_preserve_or_react,
            error: ts.Diagnostics.Argument_for_jsx_must_be_preserve_or_react
        },
        {
            name: "listFiles",
            type: "boolean"
        },
        {
            name: "locale",
            type: "string"
        },
        {
            name: "mapRoot",
            type: "string",
            isFilePath: true,
            description: ts.Diagnostics.Specifies_the_location_where_debugger_should_locate_map_files_instead_of_generated_locations,
            paramType: ts.Diagnostics.LOCATION
        },
        {
            name: "module",
            shortName: "m",
            type: {
                "commonjs": 1 /* CommonJS */,
                "amd": 2 /* AMD */,
                "system": 4 /* System */,
                "umd": 3 /* UMD */
            },
            description: ts.Diagnostics.Specify_module_code_generation_Colon_commonjs_amd_system_or_umd,
            paramType: ts.Diagnostics.KIND,
            error: ts.Diagnostics.Argument_for_module_option_must_be_commonjs_amd_system_or_umd
        },
        {
            name: "newLine",
            type: {
                "crlf": 0 /* CarriageReturnLineFeed */,
                "lf": 1 /* LineFeed */
            },
            description: ts.Diagnostics.Specifies_the_end_of_line_sequence_to_be_used_when_emitting_files_Colon_CRLF_dos_or_LF_unix,
            paramType: ts.Diagnostics.NEWLINE,
            error: ts.Diagnostics.Argument_for_newLine_option_must_be_CRLF_or_LF
        },
        {
            name: "noEmit",
            type: "boolean",
            description: ts.Diagnostics.Do_not_emit_outputs
        },
        {
            name: "noEmitHelpers",
            type: "boolean"
        },
        {
            name: "noEmitOnError",
            type: "boolean",
            description: ts.Diagnostics.Do_not_emit_outputs_if_any_errors_were_reported
        },
        {
            name: "noImplicitAny",
            type: "boolean",
            description: ts.Diagnostics.Raise_error_on_expressions_and_declarations_with_an_implied_any_type
        },
        {
            name: "noLib",
            type: "boolean"
        },
        {
            name: "noResolve",
            type: "boolean"
        },
        {
            name: "skipDefaultLibCheck",
            type: "boolean"
        },
        {
            name: "out",
            type: "string",
            isFilePath: false,
            // for correct behaviour, please use outFile
            paramType: ts.Diagnostics.FILE
        },
        {
            name: "outFile",
            type: "string",
            isFilePath: true,
            description: ts.Diagnostics.Concatenate_and_emit_output_to_single_file,
            paramType: ts.Diagnostics.FILE
        },
        {
            name: "outDir",
            type: "string",
            isFilePath: true,
            description: ts.Diagnostics.Redirect_output_structure_to_the_directory,
            paramType: ts.Diagnostics.DIRECTORY
        },
        {
            name: "preserveConstEnums",
            type: "boolean",
            description: ts.Diagnostics.Do_not_erase_const_enum_declarations_in_generated_code
        },
        {
            name: "project",
            shortName: "p",
            type: "string",
            isFilePath: true,
            description: ts.Diagnostics.Compile_the_project_in_the_given_directory,
            paramType: ts.Diagnostics.DIRECTORY
        },
        {
            name: "removeComments",
            type: "boolean",
            description: ts.Diagnostics.Do_not_emit_comments_to_output
        },
        {
            name: "rootDir",
            type: "string",
            isFilePath: true,
            description: ts.Diagnostics.Specifies_the_root_directory_of_input_files_Use_to_control_the_output_directory_structure_with_outDir,
            paramType: ts.Diagnostics.LOCATION
        },
        {
            name: "isolatedModules",
            type: "boolean"
        },
        {
            name: "sourceMap",
            type: "boolean",
            description: ts.Diagnostics.Generates_corresponding_map_file
        },
        {
            name: "sourceRoot",
            type: "string",
            isFilePath: true,
            description: ts.Diagnostics.Specifies_the_location_where_debugger_should_locate_TypeScript_files_instead_of_source_locations,
            paramType: ts.Diagnostics.LOCATION
        },
        {
            name: "suppressExcessPropertyErrors",
            type: "boolean",
            description: ts.Diagnostics.Suppress_excess_property_checks_for_object_literals,
            experimental: true
        },
        {
            name: "suppressImplicitAnyIndexErrors",
            type: "boolean",
            description: ts.Diagnostics.Suppress_noImplicitAny_errors_for_indexing_objects_lacking_index_signatures
        },
        {
            name: "stripInternal",
            type: "boolean",
            description: ts.Diagnostics.Do_not_emit_declarations_for_code_that_has_an_internal_annotation,
            experimental: true
        },
        {
            name: "target",
            shortName: "t",
            type: { "es3": 0 /* ES3 */, "es5": 1 /* ES5 */, "es6": 2 /* ES6 */ },
            description: ts.Diagnostics.Specify_ECMAScript_target_version_Colon_ES3_default_ES5_or_ES6_experimental,
            paramType: ts.Diagnostics.VERSION,
            error: ts.Diagnostics.Argument_for_target_option_must_be_ES3_ES5_or_ES6
        },
        {
            name: "version",
            shortName: "v",
            type: "boolean",
            description: ts.Diagnostics.Print_the_compiler_s_version
        },
        {
            name: "watch",
            shortName: "w",
            type: "boolean",
            description: ts.Diagnostics.Watch_input_files
        },
        {
            name: "experimentalAsyncFunctions",
            type: "boolean",
            description: ts.Diagnostics.Enables_experimental_support_for_ES7_async_functions
        },
        {
            name: "experimentalDecorators",
            type: "boolean",
            description: ts.Diagnostics.Enables_experimental_support_for_ES7_decorators
        },
        {
            name: "emitDecoratorMetadata",
            type: "boolean",
            experimental: true,
            description: ts.Diagnostics.Enables_experimental_support_for_emitting_type_metadata_for_decorators
        },
        {
            name: "moduleResolution",
            type: {
                "node": 2 /* NodeJs */,
                "classic": 1 /* Classic */
            },
            description: ts.Diagnostics.Specifies_module_resolution_strategy_Colon_node_Node_js_or_classic_TypeScript_pre_1_6,
            error: ts.Diagnostics.Argument_for_moduleResolution_option_must_be_node_or_classic
        }
    ];
    var optionNameMapCache;
    /* @internal */
    function getOptionNameMap() {
        if (optionNameMapCache) {
            return optionNameMapCache;
        }
        var optionNameMap = {};
        var shortOptionNames = {};
        forEach(ts.optionDeclarations, function (option) {
            optionNameMap[option.name.toLowerCase()] = option;
            if (option.shortName) {
                shortOptionNames[option.shortName] = option.name;
            }
        });
        optionNameMapCache = { optionNameMap: optionNameMap, shortOptionNames: shortOptionNames };
        return optionNameMapCache;
    }
    ts.getOptionNameMap = getOptionNameMap;
    function parseCommandLine(commandLine, readFile) {
        var options = {};
        var fileNames = [];
        var errors = [];
        var _a = getOptionNameMap(), optionNameMap = _a.optionNameMap, shortOptionNames = _a.shortOptionNames;
        parseStrings(commandLine);
        return {
            options: options,
            fileNames: fileNames,
            errors: errors
        };
        function parseStrings(args) {
            var i = 0;
            while (i < args.length) {
                var s = args[i++];
                if (s.charCodeAt(0) === 64 /* at */) {
                    parseResponseFile(s.slice(1));
                }
                else if (s.charCodeAt(0) === 45 /* minus */) {
                    s = s.slice(s.charCodeAt(1) === 45 /* minus */ ? 2 : 1).toLowerCase();
                    // Try to translate short option names to their full equivalents.
                    if (hasProperty(shortOptionNames, s)) {
                        s = shortOptionNames[s];
                    }
                    if (hasProperty(optionNameMap, s)) {
                        var opt = optionNameMap[s];
                        // Check to see if no argument was provided (e.g. "--locale" is the last command-line argument).
                        if (!args[i] && opt.type !== "boolean") {
                            errors.push(createCompilerDiagnostic(ts.Diagnostics.Compiler_option_0_expects_an_argument, opt.name));
                        }
                        switch (opt.type) {
                            case "number":
                                options[opt.name] = parseInt(args[i++]);
                                break;
                            case "boolean":
                                options[opt.name] = true;
                                break;
                            case "string":
                                options[opt.name] = args[i++] || "";
                                break;
                            // If not a primitive, the possible types are specified in what is effectively a map of options.
                            default:
                                var map = opt.type;
                                var key = (args[i++] || "").toLowerCase();
                                if (hasProperty(map, key)) {
                                    options[opt.name] = map[key];
                                }
                                else {
                                    errors.push(createCompilerDiagnostic(opt.error));
                                }
                        }
                    }
                    else {
                        errors.push(createCompilerDiagnostic(ts.Diagnostics.Unknown_compiler_option_0, s));
                    }
                }
                else {
                    fileNames.push(s);
                }
            }
        }
        function parseResponseFile(fileName) {
            var text = readFile ? readFile(fileName) : ts.sys.readFile(fileName);
            if (!text) {
                errors.push(createCompilerDiagnostic(ts.Diagnostics.File_0_not_found, fileName));
                return;
            }
            var args = [];
            var pos = 0;
            while (true) {
                while (pos < text.length && text.charCodeAt(pos) <= 32 /* space */)
                    pos++;
                if (pos >= text.length)
                    break;
                var start = pos;
                if (text.charCodeAt(start) === 34 /* doubleQuote */) {
                    pos++;
                    while (pos < text.length && text.charCodeAt(pos) !== 34 /* doubleQuote */)
                        pos++;
                    if (pos < text.length) {
                        args.push(text.substring(start + 1, pos));
                        pos++;
                    }
                    else {
                        errors.push(createCompilerDiagnostic(ts.Diagnostics.Unterminated_quoted_string_in_response_file_0, fileName));
                    }
                }
                else {
                    while (text.charCodeAt(pos) > 32 /* space */)
                        pos++;
                    args.push(text.substring(start, pos));
                }
            }
            parseStrings(args);
        }
    }
    ts.parseCommandLine = parseCommandLine;
    /**
      * Read tsconfig.json file
      * @param fileName The path to the config file
      */
    function readConfigFile(fileName) {
        var text = "";
        try {
            text = ts.sys.readFile(fileName);
        }
        catch (e) {
            return { error: createCompilerDiagnostic(ts.Diagnostics.Cannot_read_file_0_Colon_1, fileName, e.message) };
        }
        return parseConfigFileText(fileName, text);
    }
    ts.readConfigFile = readConfigFile;
    /**
      * Parse the text of the tsconfig.json file
      * @param fileName The path to the config file
      * @param jsonText The text of the config file
      */
    function parseConfigFileText(fileName, jsonText) {
        try {
            return { config: /\S/.test(jsonText) ? JSON.parse(jsonText) : {} };
        }
        catch (e) {
            return { error: createCompilerDiagnostic(ts.Diagnostics.Failed_to_parse_file_0_Colon_1, fileName, e.message) };
        }
    }
    ts.parseConfigFileText = parseConfigFileText;
    /**
      * Parse the contents of a config file (tsconfig.json).
      * @param json The contents of the config file to parse
      * @param basePath A root directory to resolve relative path entries in the config
      *    file to. e.g. outDir
      */
    function parseConfigFile(json, host, basePath) {
        var errors = [];
        return {
            options: getCompilerOptions(),
            fileNames: getFileNames(),
            errors: errors
        };
        function getCompilerOptions() {
            var options = {};
            var optionNameMap = {};
            forEach(ts.optionDeclarations, function (option) {
                optionNameMap[option.name] = option;
            });
            var jsonOptions = json["compilerOptions"];
            if (jsonOptions) {
                for (var id in jsonOptions) {
                    if (hasProperty(optionNameMap, id)) {
                        var opt = optionNameMap[id];
                        var optType = opt.type;
                        var value = jsonOptions[id];
                        var expectedType = typeof optType === "string" ? optType : "string";
                        if (typeof value === expectedType) {
                            if (typeof optType !== "string") {
                                var key = value.toLowerCase();
                                if (hasProperty(optType, key)) {
                                    value = optType[key];
                                }
                                else {
                                    errors.push(createCompilerDiagnostic(opt.error));
                                    value = 0;
                                }
                            }
                            if (opt.isFilePath) {
                                value = normalizePath(combinePaths(basePath, value));
                            }
                            options[opt.name] = value;
                        }
                        else {
                            errors.push(createCompilerDiagnostic(ts.Diagnostics.Compiler_option_0_requires_a_value_of_type_1, id, expectedType));
                        }
                    }
                    else {
                        errors.push(createCompilerDiagnostic(ts.Diagnostics.Unknown_compiler_option_0, id));
                    }
                }
            }
            return options;
        }
        function getFileNames() {
            var fileNames = [];
            if (hasProperty(json, "files")) {
                if (json["files"] instanceof Array) {
                    fileNames = map(json["files"], function (s) { return combinePaths(basePath, s); });
                }
                else {
                    errors.push(createCompilerDiagnostic(ts.Diagnostics.Compiler_option_0_requires_a_value_of_type_1, "files", "Array"));
                }
            }
            else {
                var exclude = json["exclude"] instanceof Array ? map(json["exclude"], normalizeSlashes) : undefined;
                var sysFiles = host.readDirectory(basePath, ".ts", exclude).concat(host.readDirectory(basePath, ".tsx", exclude));
                for (var i = 0; i < sysFiles.length; i++) {
                    var name_1 = sysFiles[i];
                    if (fileExtensionIs(name_1, ".d.ts")) {
                        var baseName = name_1.substr(0, name_1.length - ".d.ts".length);
                        if (!contains(sysFiles, baseName + ".tsx") && !contains(sysFiles, baseName + ".ts")) {
                            fileNames.push(name_1);
                        }
                    }
                    else if (fileExtensionIs(name_1, ".ts")) {
                        if (!contains(sysFiles, name_1 + "x")) {
                            fileNames.push(name_1);
                        }
                    }
                    else {
                        fileNames.push(name_1);
                    }
                }
            }
            return fileNames;
        }
    }
    ts.parseConfigFile = parseConfigFile;
})(ts || (ts = {}));
