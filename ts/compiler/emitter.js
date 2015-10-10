/// <reference path="checker.ts"/>
/// <reference path="declarationEmitter.ts"/>
/* @internal */
var ts;
(function (ts) {
    function isExternalModuleOrDeclarationFile(sourceFile) {
        return ts.isExternalModule(sourceFile) || ts.isDeclarationFile(sourceFile);
    }
    ts.isExternalModuleOrDeclarationFile = isExternalModuleOrDeclarationFile;
    // targetSourceFile is when users only want one file in entire project to be emitted. This is used in compileOnSave feature
    function emitFiles(resolver, host, targetSourceFile) {
        // emit output for the __extends helper function
        var extendsHelper = "\nvar __extends = (this && this.__extends) || function (d, b) {\n    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];\n    function __() { this.constructor = d; }\n    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n};";
        // emit output for the __decorate helper function
        var decorateHelper = "\nvar __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {\n    if (typeof Reflect === \"object\" && typeof Reflect.decorate === \"function\") return Reflect.decorate(decorators, target, key, desc);\n    switch (arguments.length) {\n        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);\n        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);\n        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);\n    }\n};";
        // emit output for the __metadata helper function
        var metadataHelper = "\nvar __metadata = (this && this.__metadata) || function (k, v) {\n    if (typeof Reflect === \"object\" && typeof Reflect.metadata === \"function\") return Reflect.metadata(k, v);\n};";
        // emit output for the __param helper function
        var paramHelper = "\nvar __param = (this && this.__param) || function (paramIndex, decorator) {\n    return function (target, key) { decorator(target, key, paramIndex); }\n};";
        var awaiterHelper = "\nvar __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, Promise, generator) {\n    return new Promise(function (resolve, reject) {\n        generator = generator.call(thisArg, _arguments);\n        function cast(value) { return value instanceof Promise && value.constructor === Promise ? value : new Promise(function (resolve) { resolve(value); }); }\n        function onfulfill(value) { try { step(\"next\", value); } catch (e) { reject(e); } }\n        function onreject(value) { try { step(\"throw\", value); } catch (e) { reject(e); } }\n        function step(verb, value) {\n            var result = generator[verb](value);\n            result.done ? resolve(result.value) : cast(result.value).then(onfulfill, onreject);\n        }\n        step(\"next\", void 0);\n    });\n};";
        var compilerOptions = host.getCompilerOptions();
        var languageVersion = compilerOptions.target || 0 /* ES3 */;
        var sourceMapDataList = compilerOptions.sourceMap || compilerOptions.inlineSourceMap ? [] : undefined;
        var diagnostics = [];
        var newLine = host.getNewLine();
        var jsxDesugaring = host.getCompilerOptions().jsx !== 1 /* Preserve */;
        var shouldEmitJsx = function (s) { return (s.languageVariant === 1 /* JSX */ && !jsxDesugaring); };
        if (targetSourceFile === undefined) {
            forEach(host.getSourceFiles(), function (sourceFile) {
                if (ts.shouldEmitToOwnFile(sourceFile, compilerOptions)) {
                    var jsFilePath = ts.getOwnEmitOutputFilePath(sourceFile, host, shouldEmitJsx(sourceFile) ? ".jsx" : ".js");
                    emitFile(jsFilePath, sourceFile);
                }
            });
            if (compilerOptions.outFile || compilerOptions.out) {
                emitFile(compilerOptions.outFile || compilerOptions.out);
            }
        }
        else {
            // targetSourceFile is specified (e.g calling emitter from language service or calling getSemanticDiagnostic from language service)
            if (ts.shouldEmitToOwnFile(targetSourceFile, compilerOptions)) {
                var jsFilePath = ts.getOwnEmitOutputFilePath(targetSourceFile, host, shouldEmitJsx(targetSourceFile) ? ".jsx" : ".js");
                emitFile(jsFilePath, targetSourceFile);
            }
            else if (!ts.isDeclarationFile(targetSourceFile) && (compilerOptions.outFile || compilerOptions.out)) {
                emitFile(compilerOptions.outFile || compilerOptions.out);
            }
        }
        // Sort and make the unique list of diagnostics
        diagnostics = sortAndDeduplicateDiagnostics(diagnostics);
        return {
            emitSkipped: false,
            diagnostics: diagnostics,
            sourceMaps: sourceMapDataList
        };
        function isNodeDescendentOf(node, ancestor) {
            while (node) {
                if (node === ancestor)
                    return true;
                node = node.parent;
            }
            return false;
        }
        function isUniqueLocalName(name, container) {
            for (var node = container; isNodeDescendentOf(node, container); node = node.nextContainer) {
                if (node.locals && hasProperty(node.locals, name)) {
                    // We conservatively include alias symbols to cover cases where they're emitted as locals
                    if (node.locals[name].flags & (107455 /* Value */ | 1048576 /* ExportValue */ | 8388608 /* Alias */)) {
                        return false;
                    }
                }
            }
            return true;
        }
        function emitJavaScript(jsFilePath, root) {
            var writer = ts.createTextWriter(newLine);
            var write = writer.write, writeTextOfNode = writer.writeTextOfNode, writeLine = writer.writeLine, increaseIndent = writer.increaseIndent, decreaseIndent = writer.decreaseIndent;
            var currentSourceFile;
            // name of an exporter function if file is a System external module
            // System.register([...], function (<exporter>) {...})
            // exporting in System modules looks like:
            // export var x; ... x = 1
            // =>
            // var x;... exporter("x", x = 1)
            var exportFunctionForFile;
            var generatedNameSet = {};
            var nodeToGeneratedName = [];
            var computedPropertyNamesToGeneratedNames;
            var extendsEmitted = false;
            var decorateEmitted = false;
            var paramEmitted = false;
            var awaiterEmitted = false;
            var tempFlags = 0;
            var tempVariables;
            var tempParameters;
            var externalImports;
            var exportSpecifiers;
            var exportEquals;
            var hasExportStars;
            /** Write emitted output to disk */
            var writeEmittedFiles = writeJavaScriptFile;
            var detachedCommentsInfo;
            var writeComment = ts.writeCommentRange;
            /** Emit a node */
            var emit = emitNodeWithCommentsAndWithoutSourcemap;
            /** Called just before starting emit of a node */
            var emitStart = function (node) { };
            /** Called once the emit of the node is done */
            var emitEnd = function (node) { };
            /** Emit the text for the given token that comes after startPos
              * This by default writes the text provided with the given tokenKind
              * but if optional emitFn callback is provided the text is emitted using the callback instead of default text
              * @param tokenKind the kind of the token to search and emit
              * @param startPos the position in the source to start searching for the token
              * @param emitFn if given will be invoked to emit the text instead of actual token emit */
            var emitToken = emitTokenText;
            /** Called to before starting the lexical scopes as in function/class in the emitted code because of node
              * @param scopeDeclaration node that starts the lexical scope
              * @param scopeName Optional name of this scope instead of deducing one from the declaration node */
            var scopeEmitStart = function (scopeDeclaration, scopeName) { };
            /** Called after coming out of the scope */
            var scopeEmitEnd = function () { };
            /** Sourcemap data that will get encoded */
            var sourceMapData;
            if (compilerOptions.sourceMap || compilerOptions.inlineSourceMap) {
                initializeEmitterWithSourceMaps();
            }
            if (root) {
                // Do not call emit directly. It does not set the currentSourceFile.
                emitSourceFile(root);
            }
            else {
                forEach(host.getSourceFiles(), function (sourceFile) {
                    if (!isExternalModuleOrDeclarationFile(sourceFile)) {
                        emitSourceFile(sourceFile);
                    }
                });
            }
            writeLine();
            writeEmittedFiles(writer.getText(), compilerOptions.emitBOM);
            return;
            function emitSourceFile(sourceFile) {
                currentSourceFile = sourceFile;
                exportFunctionForFile = undefined;
                emit(sourceFile);
            }
            function isUniqueName(name) {
                return !resolver.hasGlobalName(name) &&
                    !hasProperty(currentSourceFile.identifiers, name) &&
                    !hasProperty(generatedNameSet, name);
            }
            // Return the next available name in the pattern _a ... _z, _0, _1, ...
            // TempFlags._i or TempFlags._n may be used to express a preference for that dedicated name.
            // Note that names generated by makeTempVariableName and makeUniqueName will never conflict.
            function makeTempVariableName(flags) {
                if (flags && !(tempFlags & flags)) {
                    var name_1 = flags === 268435456 /* _i */ ? "_i" : "_n";
                    if (isUniqueName(name_1)) {
                        tempFlags |= flags;
                        return name_1;
                    }
                }
                while (true) {
                    var count = tempFlags & 268435455 /* CountMask */;
                    tempFlags++;
                    // Skip over 'i' and 'n'
                    if (count !== 8 && count !== 13) {
                        var name_2 = count < 26 ? "_" + String.fromCharCode(97 /* a */ + count) : "_" + (count - 26);
                        if (isUniqueName(name_2)) {
                            return name_2;
                        }
                    }
                }
            }
            // Generate a name that is unique within the current file and doesn't conflict with any names
            // in global scope. The name is formed by adding an '_n' suffix to the specified base name,
            // where n is a positive integer. Note that names generated by makeTempVariableName and
            // makeUniqueName are guaranteed to never conflict.
            function makeUniqueName(baseName) {
                // Find the first unique 'name_n', where n is a positive number
                if (baseName.charCodeAt(baseName.length - 1) !== 95 /* _ */) {
                    baseName += "_";
                }
                var i = 1;
                while (true) {
                    var generatedName = baseName + i;
                    if (isUniqueName(generatedName)) {
                        return generatedNameSet[generatedName] = generatedName;
                    }
                    i++;
                }
            }
            function generateNameForModuleOrEnum(node) {
                var name = node.name.text;
                // Use module/enum name itself if it is unique, otherwise make a unique variation
                return isUniqueLocalName(name, node) ? name : makeUniqueName(name);
            }
            function generateNameForImportOrExportDeclaration(node) {
                var expr = ts.getExternalModuleName(node);
                var baseName = expr.kind === 9 /* StringLiteral */ ?
                    ts.escapeIdentifier(ts.makeIdentifierFromModuleName(expr.text)) : "module";
                return makeUniqueName(baseName);
            }
            function generateNameForExportDefault() {
                return makeUniqueName("default");
            }
            function generateNameForClassExpression() {
                return makeUniqueName("class");
            }
            function generateNameForNode(node) {
                switch (node.kind) {
                    case 67 /* Identifier */:
                        return makeUniqueName(node.text);
                    case 216 /* ModuleDeclaration */:
                    case 215 /* EnumDeclaration */:
                        return generateNameForModuleOrEnum(node);
                    case 220 /* ImportDeclaration */:
                    case 226 /* ExportDeclaration */:
                        return generateNameForImportOrExportDeclaration(node);
                    case 211 /* FunctionDeclaration */:
                    case 212 /* ClassDeclaration */:
                    case 225 /* ExportAssignment */:
                        return generateNameForExportDefault();
                    case 184 /* ClassExpression */:
                        return generateNameForClassExpression();
                }
            }
            function getGeneratedNameForNode(node) {
                var id = ts.getNodeId(node);
                return nodeToGeneratedName[id] || (nodeToGeneratedName[id] = ts.unescapeIdentifier(generateNameForNode(node)));
            }
            function initializeEmitterWithSourceMaps() {
                var sourceMapDir; // The directory in which sourcemap will be
                // Current source map file and its index in the sources list
                var sourceMapSourceIndex = -1;
                // Names and its index map
                var sourceMapNameIndexMap = {};
                var sourceMapNameIndices = [];
                function getSourceMapNameIndex() {
                    return sourceMapNameIndices.length ? lastOrUndefined(sourceMapNameIndices) : -1;
                }
                // Last recorded and encoded spans
                var lastRecordedSourceMapSpan;
                var lastEncodedSourceMapSpan = {
                    emittedLine: 1,
                    emittedColumn: 1,
                    sourceLine: 1,
                    sourceColumn: 1,
                    sourceIndex: 0
                };
                var lastEncodedNameIndex = 0;
                // Encoding for sourcemap span
                function encodeLastRecordedSourceMapSpan() {
                    if (!lastRecordedSourceMapSpan || lastRecordedSourceMapSpan === lastEncodedSourceMapSpan) {
                        return;
                    }
                    var prevEncodedEmittedColumn = lastEncodedSourceMapSpan.emittedColumn;
                    // Line/Comma delimiters
                    if (lastEncodedSourceMapSpan.emittedLine === lastRecordedSourceMapSpan.emittedLine) {
                        // Emit comma to separate the entry
                        if (sourceMapData.sourceMapMappings) {
                            sourceMapData.sourceMapMappings += ",";
                        }
                    }
                    else {
                        // Emit line delimiters
                        for (var encodedLine = lastEncodedSourceMapSpan.emittedLine; encodedLine < lastRecordedSourceMapSpan.emittedLine; encodedLine++) {
                            sourceMapData.sourceMapMappings += ";";
                        }
                        prevEncodedEmittedColumn = 1;
                    }
                    // 1. Relative Column 0 based
                    sourceMapData.sourceMapMappings += base64VLQFormatEncode(lastRecordedSourceMapSpan.emittedColumn - prevEncodedEmittedColumn);
                    // 2. Relative sourceIndex
                    sourceMapData.sourceMapMappings += base64VLQFormatEncode(lastRecordedSourceMapSpan.sourceIndex - lastEncodedSourceMapSpan.sourceIndex);
                    // 3. Relative sourceLine 0 based
                    sourceMapData.sourceMapMappings += base64VLQFormatEncode(lastRecordedSourceMapSpan.sourceLine - lastEncodedSourceMapSpan.sourceLine);
                    // 4. Relative sourceColumn 0 based
                    sourceMapData.sourceMapMappings += base64VLQFormatEncode(lastRecordedSourceMapSpan.sourceColumn - lastEncodedSourceMapSpan.sourceColumn);
                    // 5. Relative namePosition 0 based
                    if (lastRecordedSourceMapSpan.nameIndex >= 0) {
                        sourceMapData.sourceMapMappings += base64VLQFormatEncode(lastRecordedSourceMapSpan.nameIndex - lastEncodedNameIndex);
                        lastEncodedNameIndex = lastRecordedSourceMapSpan.nameIndex;
                    }
                    lastEncodedSourceMapSpan = lastRecordedSourceMapSpan;
                    sourceMapData.sourceMapDecodedMappings.push(lastEncodedSourceMapSpan);
                    function base64VLQFormatEncode(inValue) {
                        function base64FormatEncode(inValue) {
                            if (inValue < 64) {
                                return "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(inValue);
                            }
                            throw TypeError(inValue + ": not a 64 based value");
                        }
                        // Add a new least significant bit that has the sign of the value.
                        // if negative number the least significant bit that gets added to the number has value 1
                        // else least significant bit value that gets added is 0
                        // eg. -1 changes to binary : 01 [1] => 3
                        //     +1 changes to binary : 01 [0] => 2
                        if (inValue < 0) {
                            inValue = ((-inValue) << 1) + 1;
                        }
                        else {
                            inValue = inValue << 1;
                        }
                        // Encode 5 bits at a time starting from least significant bits
                        var encodedStr = "";
                        do {
                            var currentDigit = inValue & 31; // 11111
                            inValue = inValue >> 5;
                            if (inValue > 0) {
                                // There are still more digits to decode, set the msb (6th bit)
                                currentDigit = currentDigit | 32;
                            }
                            encodedStr = encodedStr + base64FormatEncode(currentDigit);
                        } while (inValue > 0);
                        return encodedStr;
                    }
                }
                function recordSourceMapSpan(pos) {
                    var sourceLinePos = ts.getLineAndCharacterOfPosition(currentSourceFile, pos);
                    // Convert the location to be one-based.
                    sourceLinePos.line++;
                    sourceLinePos.character++;
                    var emittedLine = writer.getLine();
                    var emittedColumn = writer.getColumn();
                    // If this location wasn't recorded or the location in source is going backwards, record the span
                    if (!lastRecordedSourceMapSpan ||
                        lastRecordedSourceMapSpan.emittedLine !== emittedLine ||
                        lastRecordedSourceMapSpan.emittedColumn !== emittedColumn ||
                        (lastRecordedSourceMapSpan.sourceIndex === sourceMapSourceIndex &&
                            (lastRecordedSourceMapSpan.sourceLine > sourceLinePos.line ||
                                (lastRecordedSourceMapSpan.sourceLine === sourceLinePos.line && lastRecordedSourceMapSpan.sourceColumn > sourceLinePos.character)))) {
                        // Encode the last recordedSpan before assigning new
                        encodeLastRecordedSourceMapSpan();
                        // New span
                        lastRecordedSourceMapSpan = {
                            emittedLine: emittedLine,
                            emittedColumn: emittedColumn,
                            sourceLine: sourceLinePos.line,
                            sourceColumn: sourceLinePos.character,
                            nameIndex: getSourceMapNameIndex(),
                            sourceIndex: sourceMapSourceIndex
                        };
                    }
                    else {
                        // Take the new pos instead since there is no change in emittedLine and column since last location
                        lastRecordedSourceMapSpan.sourceLine = sourceLinePos.line;
                        lastRecordedSourceMapSpan.sourceColumn = sourceLinePos.character;
                        lastRecordedSourceMapSpan.sourceIndex = sourceMapSourceIndex;
                    }
                }
                function recordEmitNodeStartSpan(node) {
                    // Get the token pos after skipping to the token (ignoring the leading trivia)
                    recordSourceMapSpan(ts.skipTrivia(currentSourceFile.text, node.pos));
                }
                function recordEmitNodeEndSpan(node) {
                    recordSourceMapSpan(node.end);
                }
                function writeTextWithSpanRecord(tokenKind, startPos, emitFn) {
                    var tokenStartPos = ts.skipTrivia(currentSourceFile.text, startPos);
                    recordSourceMapSpan(tokenStartPos);
                    var tokenEndPos = emitTokenText(tokenKind, tokenStartPos, emitFn);
                    recordSourceMapSpan(tokenEndPos);
                    return tokenEndPos;
                }
                function recordNewSourceFileStart(node) {
                    // Add the file to tsFilePaths
                    // If sourceroot option: Use the relative path corresponding to the common directory path
                    // otherwise source locations relative to map file location
                    var sourcesDirectoryPath = compilerOptions.sourceRoot ? host.getCommonSourceDirectory() : sourceMapDir;
                    sourceMapData.sourceMapSources.push(getRelativePathToDirectoryOrUrl(sourcesDirectoryPath, node.fileName, host.getCurrentDirectory(), host.getCanonicalFileName, 
                    /*isAbsolutePathAnUrl*/ true));
                    sourceMapSourceIndex = sourceMapData.sourceMapSources.length - 1;
                    // The one that can be used from program to get the actual source file
                    sourceMapData.inputSourceFileNames.push(node.fileName);
                    if (compilerOptions.inlineSources) {
                        if (!sourceMapData.sourceMapSourcesContent) {
                            sourceMapData.sourceMapSourcesContent = [];
                        }
                        sourceMapData.sourceMapSourcesContent.push(node.text);
                    }
                }
                function recordScopeNameOfNode(node, scopeName) {
                    function recordScopeNameIndex(scopeNameIndex) {
                        sourceMapNameIndices.push(scopeNameIndex);
                    }
                    function recordScopeNameStart(scopeName) {
                        var scopeNameIndex = -1;
                        if (scopeName) {
                            var parentIndex = getSourceMapNameIndex();
                            if (parentIndex !== -1) {
                                // Child scopes are always shown with a dot (even if they have no name),
                                // unless it is a computed property. Then it is shown with brackets,
                                // but the brackets are included in the name.
                                var name_3 = node.name;
                                if (!name_3 || name_3.kind !== 134 /* ComputedPropertyName */) {
                                    scopeName = "." + scopeName;
                                }
                                scopeName = sourceMapData.sourceMapNames[parentIndex] + scopeName;
                            }
                            scopeNameIndex = getProperty(sourceMapNameIndexMap, scopeName);
                            if (scopeNameIndex === undefined) {
                                scopeNameIndex = sourceMapData.sourceMapNames.length;
                                sourceMapData.sourceMapNames.push(scopeName);
                                sourceMapNameIndexMap[scopeName] = scopeNameIndex;
                            }
                        }
                        recordScopeNameIndex(scopeNameIndex);
                    }
                    if (scopeName) {
                        // The scope was already given a name  use it
                        recordScopeNameStart(scopeName);
                    }
                    else if (node.kind === 211 /* FunctionDeclaration */ ||
                        node.kind === 171 /* FunctionExpression */ ||
                        node.kind === 141 /* MethodDeclaration */ ||
                        node.kind === 140 /* MethodSignature */ ||
                        node.kind === 143 /* GetAccessor */ ||
                        node.kind === 144 /* SetAccessor */ ||
                        node.kind === 216 /* ModuleDeclaration */ ||
                        node.kind === 212 /* ClassDeclaration */ ||
                        node.kind === 215 /* EnumDeclaration */) {
                        // Declaration and has associated name use it
                        if (node.name) {
                            var name_4 = node.name;
                            // For computed property names, the text will include the brackets
                            scopeName = name_4.kind === 134 /* ComputedPropertyName */
                                ? ts.getTextOfNode(name_4)
                                : node.name.text;
                        }
                        recordScopeNameStart(scopeName);
                    }
                    else {
                        // Block just use the name from upper level scope
                        recordScopeNameIndex(getSourceMapNameIndex());
                    }
                }
                function recordScopeNameEnd() {
                    sourceMapNameIndices.pop();
                }
                ;
                function writeCommentRangeWithMap(curentSourceFile, writer, comment, newLine) {
                    recordSourceMapSpan(comment.pos);
                    ts.writeCommentRange(currentSourceFile, writer, comment, newLine);
                    recordSourceMapSpan(comment.end);
                }
                function serializeSourceMapContents(version, file, sourceRoot, sources, names, mappings, sourcesContent) {
                    if (typeof JSON !== "undefined") {
                        var map = {
                            version: version,
                            file: file,
                            sourceRoot: sourceRoot,
                            sources: sources,
                            names: names,
                            mappings: mappings
                        };
                        if (sourcesContent !== undefined) {
                            map.sourcesContent = sourcesContent;
                        }
                        return JSON.stringify(map);
                    }
                    return "{\"version\":" + version + ",\"file\":\"" + ts.escapeString(file) + "\",\"sourceRoot\":\"" + ts.escapeString(sourceRoot) + "\",\"sources\":[" + serializeStringArray(sources) + "],\"names\":[" + serializeStringArray(names) + "],\"mappings\":\"" + ts.escapeString(mappings) + "\" " + (sourcesContent !== undefined ? ",\"sourcesContent\":[" + serializeStringArray(sourcesContent) + "]" : "") + "}";
                    function serializeStringArray(list) {
                        var output = "";
                        for (var i = 0, n = list.length; i < n; i++) {
                            if (i) {
                                output += ",";
                            }
                            output += "\"" + ts.escapeString(list[i]) + "\"";
                        }
                        return output;
                    }
                }
                function writeJavaScriptAndSourceMapFile(emitOutput, writeByteOrderMark) {
                    encodeLastRecordedSourceMapSpan();
                    var sourceMapText = serializeSourceMapContents(3, sourceMapData.sourceMapFile, sourceMapData.sourceMapSourceRoot, sourceMapData.sourceMapSources, sourceMapData.sourceMapNames, sourceMapData.sourceMapMappings, sourceMapData.sourceMapSourcesContent);
                    sourceMapDataList.push(sourceMapData);
                    var sourceMapUrl;
                    if (compilerOptions.inlineSourceMap) {
                        // Encode the sourceMap into the sourceMap url
                        var base64SourceMapText = ts.convertToBase64(sourceMapText);
                        sourceMapUrl = "//# sourceMappingURL=data:application/json;base64," + base64SourceMapText;
                    }
                    else {
                        // Write source map file
                        ts.writeFile(host, diagnostics, sourceMapData.sourceMapFilePath, sourceMapText, false);
                        sourceMapUrl = "//# sourceMappingURL=" + sourceMapData.jsSourceMappingURL;
                    }
                    // Write sourcemap url to the js file and write the js file
                    writeJavaScriptFile(emitOutput + sourceMapUrl, writeByteOrderMark);
                }
                // Initialize source map data
                var sourceMapJsFile = getBaseFileName(normalizeSlashes(jsFilePath));
                sourceMapData = {
                    sourceMapFilePath: jsFilePath + ".map",
                    jsSourceMappingURL: sourceMapJsFile + ".map",
                    sourceMapFile: sourceMapJsFile,
                    sourceMapSourceRoot: compilerOptions.sourceRoot || "",
                    sourceMapSources: [],
                    inputSourceFileNames: [],
                    sourceMapNames: [],
                    sourceMapMappings: "",
                    sourceMapSourcesContent: undefined,
                    sourceMapDecodedMappings: []
                };
                // Normalize source root and make sure it has trailing "/" so that it can be used to combine paths with the
                // relative paths of the sources list in the sourcemap
                sourceMapData.sourceMapSourceRoot = ts.normalizeSlashes(sourceMapData.sourceMapSourceRoot);
                if (sourceMapData.sourceMapSourceRoot.length && sourceMapData.sourceMapSourceRoot.charCodeAt(sourceMapData.sourceMapSourceRoot.length - 1) !== 47 /* slash */) {
                    sourceMapData.sourceMapSourceRoot += directorySeparator;
                }
                if (compilerOptions.mapRoot) {
                    sourceMapDir = normalizeSlashes(compilerOptions.mapRoot);
                    if (root) {
                        // For modules or multiple emit files the mapRoot will have directory structure like the sources
                        // So if src\a.ts and src\lib\b.ts are compiled together user would be moving the maps into mapRoot\a.js.map and mapRoot\lib\b.js.map
                        sourceMapDir = getDirectoryPath(ts.getSourceFilePathInNewDir(root, host, sourceMapDir));
                    }
                    if (!isRootedDiskPath(sourceMapDir) && !isUrl(sourceMapDir)) {
                        // The relative paths are relative to the common directory
                        sourceMapDir = combinePaths(host.getCommonSourceDirectory(), sourceMapDir);
                        sourceMapData.jsSourceMappingURL = getRelativePathToDirectoryOrUrl(getDirectoryPath(normalizePath(jsFilePath)), combinePaths(sourceMapDir, sourceMapData.jsSourceMappingURL), host.getCurrentDirectory(), host.getCanonicalFileName, 
                        /*isAbsolutePathAnUrl*/ true);
                    }
                    else {
                        sourceMapData.jsSourceMappingURL = combinePaths(sourceMapDir, sourceMapData.jsSourceMappingURL);
                    }
                }
                else {
                    sourceMapDir = getDirectoryPath(normalizePath(jsFilePath));
                }
                function emitNodeWithSourceMap(node) {
                    if (node) {
                        if (ts.nodeIsSynthesized(node)) {
                            return emitNodeWithoutSourceMap(node);
                        }
                        if (node.kind !== 246 /* SourceFile */) {
                            recordEmitNodeStartSpan(node);
                            emitNodeWithoutSourceMap(node);
                            recordEmitNodeEndSpan(node);
                        }
                        else {
                            recordNewSourceFileStart(node);
                            emitNodeWithoutSourceMap(node);
                        }
                    }
                }
                function emitNodeWithCommentsAndWithSourcemap(node) {
                    emitNodeConsideringCommentsOption(node, emitNodeWithSourceMap);
                }
                writeEmittedFiles = writeJavaScriptAndSourceMapFile;
                emit = emitNodeWithCommentsAndWithSourcemap;
                emitStart = recordEmitNodeStartSpan;
                emitEnd = recordEmitNodeEndSpan;
                emitToken = writeTextWithSpanRecord;
                scopeEmitStart = recordScopeNameOfNode;
                scopeEmitEnd = recordScopeNameEnd;
                writeComment = writeCommentRangeWithMap;
            }
            function writeJavaScriptFile(emitOutput, writeByteOrderMark) {
                ts.writeFile(host, diagnostics, jsFilePath, emitOutput, writeByteOrderMark);
            }
            // Create a temporary variable with a unique unused name.
            function createTempVariable(flags) {
                var result = ts.createSynthesizedNode(67 /* Identifier */);
                result.text = makeTempVariableName(flags);
                return result;
            }
            function recordTempDeclaration(name) {
                if (!tempVariables) {
                    tempVariables = [];
                }
                tempVariables.push(name);
            }
            function createAndRecordTempVariable(flags) {
                var temp = createTempVariable(flags);
                recordTempDeclaration(temp);
                return temp;
            }
            function emitTempDeclarations(newLine) {
                if (tempVariables) {
                    if (newLine) {
                        writeLine();
                    }
                    else {
                        write(" ");
                    }
                    write("var ");
                    emitCommaList(tempVariables);
                    write(";");
                }
            }
            function emitTokenText(tokenKind, startPos, emitFn) {
                var tokenString = ts.tokenToString(tokenKind);
                if (emitFn) {
                    emitFn();
                }
                else {
                    write(tokenString);
                }
                return startPos + tokenString.length;
            }
            function emitOptional(prefix, node) {
                if (node) {
                    write(prefix);
                    emit(node);
                }
            }
            function emitParenthesizedIf(node, parenthesized) {
                if (parenthesized) {
                    write("(");
                }
                emit(node);
                if (parenthesized) {
                    write(")");
                }
            }
            function emitTrailingCommaIfPresent(nodeList) {
                if (nodeList.hasTrailingComma) {
                    write(",");
                }
            }
            function emitLinePreservingList(parent, nodes, allowTrailingComma, spacesBetweenBraces) {
                Debug.assert(nodes.length > 0);
                increaseIndent();
                if (nodeStartPositionsAreOnSameLine(parent, nodes[0])) {
                    if (spacesBetweenBraces) {
                        write(" ");
                    }
                }
                else {
                    writeLine();
                }
                for (var i = 0, n = nodes.length; i < n; i++) {
                    if (i) {
                        if (nodeEndIsOnSameLineAsNodeStart(nodes[i - 1], nodes[i])) {
                            write(", ");
                        }
                        else {
                            write(",");
                            writeLine();
                        }
                    }
                    emit(nodes[i]);
                }
                if (nodes.hasTrailingComma && allowTrailingComma) {
                    write(",");
                }
                decreaseIndent();
                if (nodeEndPositionsAreOnSameLine(parent, lastOrUndefined(nodes))) {
                    if (spacesBetweenBraces) {
                        write(" ");
                    }
                }
                else {
                    writeLine();
                }
            }
            function emitList(nodes, start, count, multiLine, trailingComma, leadingComma, noTrailingNewLine, emitNode) {
                if (!emitNode) {
                    emitNode = emit;
                }
                for (var i = 0; i < count; i++) {
                    if (multiLine) {
                        if (i || leadingComma) {
                            write(",");
                        }
                        writeLine();
                    }
                    else {
                        if (i || leadingComma) {
                            write(", ");
                        }
                    }
                    var node = nodes[start + i];
                    // This emitting is to make sure we emit following comment properly
                    //   ...(x, /*comment1*/ y)...
                    //         ^ => node.pos
                    // "comment1" is not considered leading comment for "y" but rather
                    // considered as trailing comment of the previous node.
                    emitTrailingCommentsOfPosition(node.pos);
                    emitNode(node);
                    leadingComma = true;
                }
                if (trailingComma) {
                    write(",");
                }
                if (multiLine && !noTrailingNewLine) {
                    writeLine();
                }
                return count;
            }
            function emitCommaList(nodes) {
                if (nodes) {
                    emitList(nodes, 0, nodes.length, false, false);
                }
            }
            function emitLines(nodes) {
                emitLinesStartingAt(nodes, 0);
            }
            function emitLinesStartingAt(nodes, startIndex) {
                for (var i = startIndex; i < nodes.length; i++) {
                    writeLine();
                    emit(nodes[i]);
                }
            }
            function isBinaryOrOctalIntegerLiteral(node, text) {
                if (node.kind === 8 /* NumericLiteral */ && text.length > 1) {
                    switch (text.charCodeAt(1)) {
                        case 98 /* b */:
                        case 66 /* B */:
                        case 111 /* o */:
                        case 79 /* O */:
                            return true;
                    }
                }
                return false;
            }
            function emitLiteral(node) {
                var text = getLiteralText(node);
                if ((compilerOptions.sourceMap || compilerOptions.inlineSourceMap) && (node.kind === 9 /* StringLiteral */ || ts.isTemplateLiteralKind(node.kind))) {
                    writer.writeLiteral(text);
                }
                else if (languageVersion < 2 /* ES6 */ && isBinaryOrOctalIntegerLiteral(node, text)) {
                    write(node.text);
                }
                else {
                    write(text);
                }
            }
            function getLiteralText(node) {
                // Any template literal or string literal with an extended escape
                // (e.g. "\u{0067}") will need to be downleveled as a escaped string literal.
                if (languageVersion < 2 /* ES6 */ && (ts.isTemplateLiteralKind(node.kind) || node.hasExtendedUnicodeEscape)) {
                    return getQuotedEscapedLiteralText("\"", node.text, "\"");
                }
                // If we don't need to downlevel and we can reach the original source text using
                // the node's parent reference, then simply get the text as it was originally written.
                if (node.parent) {
                    return ts.getSourceTextOfNodeFromSourceFile(currentSourceFile, node);
                }
                // If we can't reach the original source text, use the canonical form if it's a number,
                // or an escaped quoted form of the original text if it's string-like.
                switch (node.kind) {
                    case 9 /* StringLiteral */:
                        return getQuotedEscapedLiteralText("\"", node.text, "\"");
                    case 11 /* NoSubstitutionTemplateLiteral */:
                        return getQuotedEscapedLiteralText("`", node.text, "`");
                    case 12 /* TemplateHead */:
                        return getQuotedEscapedLiteralText("`", node.text, "${");
                    case 13 /* TemplateMiddle */:
                        return getQuotedEscapedLiteralText("}", node.text, "${");
                    case 14 /* TemplateTail */:
                        return getQuotedEscapedLiteralText("}", node.text, "`");
                    case 8 /* NumericLiteral */:
                        return node.text;
                }
                Debug.fail("Literal kind '" + node.kind + "' not accounted for.");
            }
            function getQuotedEscapedLiteralText(leftQuote, text, rightQuote) {
                return leftQuote + ts.escapeNonAsciiCharacters(ts.escapeString(text)) + rightQuote;
            }
            function emitDownlevelRawTemplateLiteral(node) {
                // Find original source text, since we need to emit the raw strings of the tagged template.
                // The raw strings contain the (escaped) strings of what the user wrote.
                // Examples: `\n` is converted to "\\n", a template string with a newline to "\n".
                var text = ts.getSourceTextOfNodeFromSourceFile(currentSourceFile, node);
                // text contains the original source, it will also contain quotes ("`"), dolar signs and braces ("${" and "}"),
                // thus we need to remove those characters.
                // First template piece starts with "`", others with "}"
                // Last template piece ends with "`", others with "${"
                var isLast = node.kind === 11 /* NoSubstitutionTemplateLiteral */ || node.kind === 14 /* TemplateTail */;
                text = text.substring(1, text.length - (isLast ? 1 : 2));
                // Newline normalization:
                // ES6 Spec 11.8.6.1 - Static Semantics of TV's and TRV's
                // <CR><LF> and <CR> LineTerminatorSequences are normalized to <LF> for both TV and TRV.
                text = text.replace(/\r\n?/g, "\n");
                text = ts.escapeString(text);
                write("\"" + text + "\"");
            }
            function emitDownlevelTaggedTemplateArray(node, literalEmitter) {
                write("[");
                if (node.template.kind === 11 /* NoSubstitutionTemplateLiteral */) {
                    literalEmitter(node.template);
                }
                else {
                    literalEmitter(node.template.head);
                    forEach(node.template.templateSpans, function (child) {
                        write(", ");
                        literalEmitter(child.literal);
                    });
                }
                write("]");
            }
            function emitDownlevelTaggedTemplate(node) {
                var tempVariable = createAndRecordTempVariable(0 /* Auto */);
                write("(");
                emit(tempVariable);
                write(" = ");
                emitDownlevelTaggedTemplateArray(node, emit);
                write(", ");
                emit(tempVariable);
                write(".raw = ");
                emitDownlevelTaggedTemplateArray(node, emitDownlevelRawTemplateLiteral);
                write(", ");
                emitParenthesizedIf(node.tag, needsParenthesisForPropertyAccessOrInvocation(node.tag));
                write("(");
                emit(tempVariable);
                // Now we emit the expressions
                if (node.template.kind === 181 /* TemplateExpression */) {
                    forEach(node.template.templateSpans, function (templateSpan) {
                        write(", ");
                        var needsParens = templateSpan.expression.kind === 179 /* BinaryExpression */
                            && templateSpan.expression.operatorToken.kind === 24 /* CommaToken */;
                        emitParenthesizedIf(templateSpan.expression, needsParens);
                    });
                }
                write("))");
            }
            function emitTemplateExpression(node) {
                // In ES6 mode and above, we can simply emit each portion of a template in order, but in
                // ES3 & ES5 we must convert the template expression into a series of string concatenations.
                if (languageVersion >= 2 /* ES6 */) {
                    ts.forEachChild(node, emit);
                    return;
                }
                var emitOuterParens = ts.isExpression(node.parent)
                    && templateNeedsParens(node, node.parent);
                if (emitOuterParens) {
                    write("(");
                }
                var headEmitted = false;
                if (shouldEmitTemplateHead()) {
                    emitLiteral(node.head);
                    headEmitted = true;
                }
                for (var i = 0, n = node.templateSpans.length; i < n; i++) {
                    var templateSpan = node.templateSpans[i];
                    // Check if the expression has operands and binds its operands less closely than binary '+'.
                    // If it does, we need to wrap the expression in parentheses. Otherwise, something like
                    //    `abc${ 1 << 2 }`
                    // becomes
                    //    "abc" + 1 << 2 + ""
                    // which is really
                    //    ("abc" + 1) << (2 + "")
                    // rather than
                    //    "abc" + (1 << 2) + ""
                    var needsParens = templateSpan.expression.kind !== 170 /* ParenthesizedExpression */
                        && comparePrecedenceToBinaryPlus(templateSpan.expression) !== Comparison.GreaterThan;
                    if (i > 0 || headEmitted) {
                        // If this is the first span and the head was not emitted, then this templateSpan's
                        // expression will be the first to be emitted. Don't emit the preceding ' + ' in that
                        // case.
                        write(" + ");
                    }
                    emitParenthesizedIf(templateSpan.expression, needsParens);
                    // Only emit if the literal is non-empty.
                    // The binary '+' operator is left-associative, so the first string concatenation
                    // with the head will force the result up to this point to be a string.
                    // Emitting a '+ ""' has no semantic effect for middles and tails.
                    if (templateSpan.literal.text.length !== 0) {
                        write(" + ");
                        emitLiteral(templateSpan.literal);
                    }
                }
                if (emitOuterParens) {
                    write(")");
                }
                function shouldEmitTemplateHead() {
                    // If this expression has an empty head literal and the first template span has a non-empty
                    // literal, then emitting the empty head literal is not necessary.
                    //     `${ foo } and ${ bar }`
                    // can be emitted as
                    //     foo + " and " + bar
                    // This is because it is only required that one of the first two operands in the emit
                    // output must be a string literal, so that the other operand and all following operands
                    // are forced into strings.
                    //
                    // If the first template span has an empty literal, then the head must still be emitted.
                    //     `${ foo }${ bar }`
                    // must still be emitted as
                    //     "" + foo + bar
                    // There is always atleast one templateSpan in this code path, since
                    // NoSubstitutionTemplateLiterals are directly emitted via emitLiteral()
                    Debug.assert(node.templateSpans.length !== 0);
                    return node.head.text.length !== 0 || node.templateSpans[0].literal.text.length === 0;
                }
                function templateNeedsParens(template, parent) {
                    switch (parent.kind) {
                        case 166 /* CallExpression */:
                        case 167 /* NewExpression */:
                            return parent.expression === template;
                        case 168 /* TaggedTemplateExpression */:
                        case 170 /* ParenthesizedExpression */:
                            return false;
                        default:
                            return comparePrecedenceToBinaryPlus(parent) !== Comparison.LessThan;
                    }
                }
                /**
                 * Returns whether the expression has lesser, greater,
                 * or equal precedence to the binary '+' operator
                 */
                function comparePrecedenceToBinaryPlus(expression) {
                    // All binary expressions have lower precedence than '+' apart from '*', '/', and '%'
                    // which have greater precedence and '-' which has equal precedence.
                    // All unary operators have a higher precedence apart from yield.
                    // Arrow functions and conditionals have a lower precedence,
                    // although we convert the former into regular function expressions in ES5 mode,
                    // and in ES6 mode this function won't get called anyway.
                    //
                    // TODO (drosen): Note that we need to account for the upcoming 'yield' and
                    //                spread ('...') unary operators that are anticipated for ES6.
                    switch (expression.kind) {
                        case 179 /* BinaryExpression */:
                            switch (expression.operatorToken.kind) {
                                case 37 /* AsteriskToken */:
                                case 38 /* SlashToken */:
                                case 39 /* PercentToken */:
                                    return Comparison.GreaterThan;
                                case 35 /* PlusToken */:
                                case 36 /* MinusToken */:
                                    return Comparison.EqualTo;
                                default:
                                    return Comparison.LessThan;
                            }
                        case 182 /* YieldExpression */:
                        case 180 /* ConditionalExpression */:
                            return Comparison.LessThan;
                        default:
                            return Comparison.GreaterThan;
                    }
                }
            }
            function emitTemplateSpan(span) {
                emit(span.expression);
                emit(span.literal);
            }
            function jsxEmitReact(node) {
                /// Emit a tag name, which is either '"div"' for lower-cased names, or
                /// 'Div' for upper-cased or dotted names
                function emitTagName(name) {
                    if (name.kind === 67 /* Identifier */ && ts.isIntrinsicJsxName(name.text)) {
                        write("\"");
                        emit(name);
                        write("\"");
                    }
                    else {
                        emit(name);
                    }
                }
                /// Emit an attribute name, which is quoted if it needs to be quoted. Because
                /// these emit into an object literal property name, we don't need to be worried
                /// about keywords, just non-identifier characters
                function emitAttributeName(name) {
                    if (/[A-Za-z_]+[\w*]/.test(name.text)) {
                        write("\"");
                        emit(name);
                        write("\"");
                    }
                    else {
                        emit(name);
                    }
                }
                /// Emit an name/value pair for an attribute (e.g. "x: 3")
                function emitJsxAttribute(node) {
                    emitAttributeName(node.name);
                    write(": ");
                    if (node.initializer) {
                        emit(node.initializer);
                    }
                    else {
                        write("true");
                    }
                }
                function emitJsxElement(openingNode, children) {
                    var syntheticReactRef = ts.createSynthesizedNode(67 /* Identifier */);
                    syntheticReactRef.text = 'React';
                    syntheticReactRef.parent = openingNode;
                    // Call React.createElement(tag, ...
                    emitLeadingComments(openingNode);
                    emitExpressionIdentifier(syntheticReactRef);
                    write(".createElement(");
                    emitTagName(openingNode.tagName);
                    write(", ");
                    // Attribute list
                    if (openingNode.attributes.length === 0) {
                        // When there are no attributes, React wants "null"
                        write("null");
                    }
                    else {
                        // Either emit one big object literal (no spread attribs), or
                        // a call to React.__spread
                        var attrs = openingNode.attributes;
                        if (forEach(attrs, function (attr) { return attr.kind === 237 /* JsxSpreadAttribute */; })) {
                            emitExpressionIdentifier(syntheticReactRef);
                            write(".__spread(");
                            var haveOpenedObjectLiteral = false;
                            for (var i_1 = 0; i_1 < attrs.length; i_1++) {
                                if (attrs[i_1].kind === 237 /* JsxSpreadAttribute */) {
                                    // If this is the first argument, we need to emit a {} as the first argument
                                    if (i_1 === 0) {
                                        write("{}, ");
                                    }
                                    if (haveOpenedObjectLiteral) {
                                        write("}");
                                        haveOpenedObjectLiteral = false;
                                    }
                                    if (i_1 > 0) {
                                        write(", ");
                                    }
                                    emit(attrs[i_1].expression);
                                }
                                else {
                                    Debug.assert(attrs[i_1].kind === 236 /* JsxAttribute */);
                                    if (haveOpenedObjectLiteral) {
                                        write(", ");
                                    }
                                    else {
                                        haveOpenedObjectLiteral = true;
                                        if (i_1 > 0) {
                                            write(", ");
                                        }
                                        write("{");
                                    }
                                    emitJsxAttribute(attrs[i_1]);
                                }
                            }
                            if (haveOpenedObjectLiteral)
                                write("}");
                            write(")"); // closing paren to React.__spread(
                        }
                        else {
                            // One object literal with all the attributes in them
                            write("{");
                            for (var i = 0; i < attrs.length; i++) {
                                if (i > 0) {
                                    write(", ");
                                }
                                emitJsxAttribute(attrs[i]);
                            }
                            write("}");
                        }
                    }
                    // Children
                    if (children) {
                        for (var i = 0; i < children.length; i++) {
                            // Don't emit empty expressions
                            if (children[i].kind === 238 /* JsxExpression */ && !(children[i].expression)) {
                                continue;
                            }
                            // Don't emit empty strings
                            if (children[i].kind === 234 /* JsxText */) {
                                var text = getTextToEmit(children[i]);
                                if (text !== undefined) {
                                    write(", \"");
                                    write(text);
                                    write("\"");
                                }
                            }
                            else {
                                write(", ");
                                emit(children[i]);
                            }
                        }
                    }
                    // Closing paren
                    write(")"); // closes "React.createElement("
                    emitTrailingComments(openingNode);
                }
                if (node.kind === 231 /* JsxElement */) {
                    emitJsxElement(node.openingElement, node.children);
                }
                else {
                    Debug.assert(node.kind === 232 /* JsxSelfClosingElement */);
                    emitJsxElement(node);
                }
            }
            function jsxEmitPreserve(node) {
                function emitJsxAttribute(node) {
                    emit(node.name);
                    if (node.initializer) {
                        write("=");
                        emit(node.initializer);
                    }
                }
                function emitJsxSpreadAttribute(node) {
                    write("{...");
                    emit(node.expression);
                    write("}");
                }
                function emitAttributes(attribs) {
                    for (var i = 0, n = attribs.length; i < n; i++) {
                        if (i > 0) {
                            write(" ");
                        }
                        if (attribs[i].kind === 237 /* JsxSpreadAttribute */) {
                            emitJsxSpreadAttribute(attribs[i]);
                        }
                        else {
                            Debug.assert(attribs[i].kind === 236 /* JsxAttribute */);
                            emitJsxAttribute(attribs[i]);
                        }
                    }
                }
                function emitJsxOpeningOrSelfClosingElement(node) {
                    write("<");
                    emit(node.tagName);
                    if (node.attributes.length > 0 || (node.kind === 232 /* JsxSelfClosingElement */)) {
                        write(" ");
                    }
                    emitAttributes(node.attributes);
                    if (node.kind === 232 /* JsxSelfClosingElement */) {
                        write("/>");
                    }
                    else {
                        write(">");
                    }
                }
                function emitJsxClosingElement(node) {
                    write("</");
                    emit(node.tagName);
                    write(">");
                }
                function emitJsxElement(node) {
                    emitJsxOpeningOrSelfClosingElement(node.openingElement);
                    for (var i = 0, n = node.children.length; i < n; i++) {
                        emit(node.children[i]);
                    }
                    emitJsxClosingElement(node.closingElement);
                }
                if (node.kind === 231 /* JsxElement */) {
                    emitJsxElement(node);
                }
                else {
                    Debug.assert(node.kind === 232 /* JsxSelfClosingElement */);
                    emitJsxOpeningOrSelfClosingElement(node);
                }
            }
            // This function specifically handles numeric/string literals for enum and accessor 'identifiers'.
            // In a sense, it does not actually emit identifiers as much as it declares a name for a specific property.
            // For example, this is utilized when feeding in a result to Object.defineProperty.
            function emitExpressionForPropertyName(node) {
                Debug.assert(node.kind !== 161 /* BindingElement */);
                if (node.kind === 9 /* StringLiteral */) {
                    emitLiteral(node);
                }
                else if (node.kind === 134 /* ComputedPropertyName */) {
                    // if this is a decorated computed property, we will need to capture the result
                    // of the property expression so that we can apply decorators later. This is to ensure
                    // we don't introduce unintended side effects:
                    //
                    //   class C {
                    //     [_a = x]() { }
                    //   }
                    //
                    // The emit for the decorated computed property decorator is:
                    //
                    //   Object.defineProperty(C.prototype, _a, __decorate([dec], C.prototype, _a, Object.getOwnPropertyDescriptor(C.prototype, _a)));
                    //
                    if (ts.nodeIsDecorated(node.parent)) {
                        if (!computedPropertyNamesToGeneratedNames) {
                            computedPropertyNamesToGeneratedNames = [];
                        }
                        var generatedName = computedPropertyNamesToGeneratedNames[ts.getNodeId(node)];
                        if (generatedName) {
                            // we have already generated a variable for this node, write that value instead.
                            write(generatedName);
                            return;
                        }
                        generatedName = createAndRecordTempVariable(0 /* Auto */).text;
                        computedPropertyNamesToGeneratedNames[ts.getNodeId(node)] = generatedName;
                        write(generatedName);
                        write(" = ");
                    }
                    emit(node.expression);
                }
                else {
                    write("\"");
                    if (node.kind === 8 /* NumericLiteral */) {
                        write(node.text);
                    }
                    else {
                        writeTextOfNode(currentSourceFile, node);
                    }
                    write("\"");
                }
            }
            function isExpressionIdentifier(node) {
                var parent = node.parent;
                switch (parent.kind) {
                    case 162 /* ArrayLiteralExpression */:
                    case 179 /* BinaryExpression */:
                    case 166 /* CallExpression */:
                    case 239 /* CaseClause */:
                    case 134 /* ComputedPropertyName */:
                    case 180 /* ConditionalExpression */:
                    case 137 /* Decorator */:
                    case 173 /* DeleteExpression */:
                    case 195 /* DoStatement */:
                    case 165 /* ElementAccessExpression */:
                    case 225 /* ExportAssignment */:
                    case 193 /* ExpressionStatement */:
                    case 186 /* ExpressionWithTypeArguments */:
                    case 197 /* ForStatement */:
                    case 198 /* ForInStatement */:
                    case 199 /* ForOfStatement */:
                    case 194 /* IfStatement */:
                    case 232 /* JsxSelfClosingElement */:
                    case 233 /* JsxOpeningElement */:
                    case 237 /* JsxSpreadAttribute */:
                    case 238 /* JsxExpression */:
                    case 167 /* NewExpression */:
                    case 170 /* ParenthesizedExpression */:
                    case 178 /* PostfixUnaryExpression */:
                    case 177 /* PrefixUnaryExpression */:
                    case 202 /* ReturnStatement */:
                    case 244 /* ShorthandPropertyAssignment */:
                    case 183 /* SpreadElementExpression */:
                    case 204 /* SwitchStatement */:
                    case 168 /* TaggedTemplateExpression */:
                    case 188 /* TemplateSpan */:
                    case 206 /* ThrowStatement */:
                    case 169 /* TypeAssertionExpression */:
                    case 174 /* TypeOfExpression */:
                    case 175 /* VoidExpression */:
                    case 196 /* WhileStatement */:
                    case 203 /* WithStatement */:
                    case 182 /* YieldExpression */:
                        return true;
                    case 161 /* BindingElement */:
                    case 245 /* EnumMember */:
                    case 136 /* Parameter */:
                    case 243 /* PropertyAssignment */:
                    case 139 /* PropertyDeclaration */:
                    case 209 /* VariableDeclaration */:
                        return parent.initializer === node;
                    case 164 /* PropertyAccessExpression */:
                        return parent.expression === node;
                    case 172 /* ArrowFunction */:
                    case 171 /* FunctionExpression */:
                        return parent.body === node;
                    case 219 /* ImportEqualsDeclaration */:
                        return parent.moduleReference === node;
                    case 133 /* QualifiedName */:
                        return parent.left === node;
                }
                return false;
            }
            function emitExpressionIdentifier(node) {
                if (resolver.getNodeCheckFlags(node) & 2048 /* LexicalArguments */) {
                    write("_arguments");
                    return;
                }
                var container = resolver.getReferencedExportContainer(node);
                if (container) {
                    if (container.kind === 246 /* SourceFile */) {
                        // Identifier references module export
                        if (languageVersion < 2 /* ES6 */ && compilerOptions.module !== 4 /* System */) {
                            write("exports.");
                        }
                    }
                    else {
                        // Identifier references namespace export
                        write(getGeneratedNameForNode(container));
                        write(".");
                    }
                }
                else if (languageVersion < 2 /* ES6 */) {
                    var declaration = resolver.getReferencedImportDeclaration(node);
                    if (declaration) {
                        if (declaration.kind === 221 /* ImportClause */) {
                            // Identifier references default import
                            write(getGeneratedNameForNode(declaration.parent));
                            write(languageVersion === 0 /* ES3 */ ? "[\"default\"]" : ".default");
                            return;
                        }
                        else if (declaration.kind === 224 /* ImportSpecifier */) {
                            // Identifier references named import
                            write(getGeneratedNameForNode(declaration.parent.parent.parent));
                            write(".");
                            writeTextOfNode(currentSourceFile, declaration.propertyName || declaration.name);
                            return;
                        }
                    }
                    declaration = resolver.getReferencedNestedRedeclaration(node);
                    if (declaration) {
                        write(getGeneratedNameForNode(declaration.name));
                        return;
                    }
                }
                if (ts.nodeIsSynthesized(node)) {
                    write(node.text);
                }
                else {
                    writeTextOfNode(currentSourceFile, node);
                }
            }
            function isNameOfNestedRedeclaration(node) {
                if (languageVersion < 2 /* ES6 */) {
                    var parent_1 = node.parent;
                    switch (parent_1.kind) {
                        case 161 /* BindingElement */:
                        case 212 /* ClassDeclaration */:
                        case 215 /* EnumDeclaration */:
                        case 209 /* VariableDeclaration */:
                            return parent_1.name === node && resolver.isNestedRedeclaration(parent_1);
                    }
                }
                return false;
            }
            function emitIdentifier(node) {
                if (!node.parent) {
                    write(node.text);
                }
                else if (isExpressionIdentifier(node)) {
                    emitExpressionIdentifier(node);
                }
                else if (isNameOfNestedRedeclaration(node)) {
                    write(getGeneratedNameForNode(node));
                }
                else if (ts.nodeIsSynthesized(node)) {
                    write(node.text);
                }
                else {
                    writeTextOfNode(currentSourceFile, node);
                }
            }
            function emitThis(node) {
                if (resolver.getNodeCheckFlags(node) & 2 /* LexicalThis */) {
                    write("_this");
                }
                else {
                    write("this");
                }
            }
            function emitSuper(node) {
                if (languageVersion >= 2 /* ES6 */) {
                    write("super");
                }
                else {
                    var flags = resolver.getNodeCheckFlags(node);
                    if (flags & 256 /* SuperInstance */) {
                        write("_super.prototype");
                    }
                    else {
                        write("_super");
                    }
                }
            }
            function emitObjectBindingPattern(node) {
                write("{ ");
                var elements = node.elements;
                emitList(elements, 0, elements.length, false, elements.hasTrailingComma);
                write(" }");
            }
            function emitArrayBindingPattern(node) {
                write("[");
                var elements = node.elements;
                emitList(elements, 0, elements.length, false, elements.hasTrailingComma);
                write("]");
            }
            function emitBindingElement(node) {
                if (node.propertyName) {
                    emit(node.propertyName);
                    write(": ");
                }
                if (node.dotDotDotToken) {
                    write("...");
                }
                if (ts.isBindingPattern(node.name)) {
                    emit(node.name);
                }
                else {
                    emitModuleMemberName(node);
                }
                emitOptional(" = ", node.initializer);
            }
            function emitSpreadElementExpression(node) {
                write("...");
                emit(node.expression);
            }
            function emitYieldExpression(node) {
                write(ts.tokenToString(112 /* YieldKeyword */));
                if (node.asteriskToken) {
                    write("*");
                }
                if (node.expression) {
                    write(" ");
                    emit(node.expression);
                }
            }
            function emitAwaitExpression(node) {
                var needsParenthesis = needsParenthesisForAwaitExpressionAsYield(node);
                if (needsParenthesis) {
                    write("(");
                }
                write(ts.tokenToString(112 /* YieldKeyword */));
                write(" ");
                emit(node.expression);
                if (needsParenthesis) {
                    write(")");
                }
            }
            function needsParenthesisForAwaitExpressionAsYield(node) {
                if (node.parent.kind === 179 /* BinaryExpression */ && !ts.isAssignmentOperator(node.parent.operatorToken.kind)) {
                    return true;
                }
                else if (node.parent.kind === 180 /* ConditionalExpression */ && node.parent.condition === node) {
                    return true;
                }
                return false;
            }
            function needsParenthesisForPropertyAccessOrInvocation(node) {
                switch (node.kind) {
                    case 67 /* Identifier */:
                    case 162 /* ArrayLiteralExpression */:
                    case 164 /* PropertyAccessExpression */:
                    case 165 /* ElementAccessExpression */:
                    case 166 /* CallExpression */:
                    case 170 /* ParenthesizedExpression */:
                        // This list is not exhaustive and only includes those cases that are relevant
                        // to the check in emitArrayLiteral. More cases can be added as needed.
                        return false;
                }
                return true;
            }
            function emitListWithSpread(elements, needsUniqueCopy, multiLine, trailingComma, useConcat) {
                var pos = 0;
                var group = 0;
                var length = elements.length;
                while (pos < length) {
                    // Emit using the pattern <group0>.concat(<group1>, <group2>, ...)
                    if (group === 1 && useConcat) {
                        write(".concat(");
                    }
                    else if (group > 0) {
                        write(", ");
                    }
                    var e = elements[pos];
                    if (e.kind === 183 /* SpreadElementExpression */) {
                        e = e.expression;
                        emitParenthesizedIf(e, group === 0 && needsParenthesisForPropertyAccessOrInvocation(e));
                        pos++;
                        if (pos === length && group === 0 && needsUniqueCopy && e.kind !== 162 /* ArrayLiteralExpression */) {
                            write(".slice()");
                        }
                    }
                    else {
                        var i = pos;
                        while (i < length && elements[i].kind !== 183 /* SpreadElementExpression */) {
                            i++;
                        }
                        write("[");
                        if (multiLine) {
                            increaseIndent();
                        }
                        emitList(elements, pos, i - pos, multiLine, trailingComma && i === length);
                        if (multiLine) {
                            decreaseIndent();
                        }
                        write("]");
                        pos = i;
                    }
                    group++;
                }
                if (group > 1) {
                    if (useConcat) {
                        write(")");
                    }
                }
            }
            function isSpreadElementExpression(node) {
                return node.kind === 183 /* SpreadElementExpression */;
            }
            function emitArrayLiteral(node) {
                var elements = node.elements;
                if (elements.length === 0) {
                    write("[]");
                }
                else if (languageVersion >= 2 /* ES6 */ || !forEach(elements, isSpreadElementExpression)) {
                    write("[");
                    emitLinePreservingList(node, node.elements, elements.hasTrailingComma, false);
                    write("]");
                }
                else {
                    emitListWithSpread(elements, true, (node.flags & 2048 /* MultiLine */) !== 0, 
                    /*trailingComma*/ elements.hasTrailingComma, true);
                }
            }
            function emitObjectLiteralBody(node, numElements) {
                if (numElements === 0) {
                    write("{}");
                    return;
                }
                write("{");
                if (numElements > 0) {
                    var properties = node.properties;
                    // If we are not doing a downlevel transformation for object literals,
                    // then try to preserve the original shape of the object literal.
                    // Otherwise just try to preserve the formatting.
                    if (numElements === properties.length) {
                        emitLinePreservingList(node, properties, languageVersion >= 1 /* ES5 */, true);
                    }
                    else {
                        var multiLine = (node.flags & 2048 /* MultiLine */) !== 0;
                        if (!multiLine) {
                            write(" ");
                        }
                        else {
                            increaseIndent();
                        }
                        emitList(properties, 0, numElements, multiLine, false);
                        if (!multiLine) {
                            write(" ");
                        }
                        else {
                            decreaseIndent();
                        }
                    }
                }
                write("}");
            }
            function emitDownlevelObjectLiteralWithComputedProperties(node, firstComputedPropertyIndex) {
                var multiLine = (node.flags & 2048 /* MultiLine */) !== 0;
                var properties = node.properties;
                write("(");
                if (multiLine) {
                    increaseIndent();
                }
                // For computed properties, we need to create a unique handle to the object
                // literal so we can modify it without risking internal assignments tainting the object.
                var tempVar = createAndRecordTempVariable(0 /* Auto */);
                // Write out the first non-computed properties
                // (or all properties if none of them are computed),
                // then emit the rest through indexing on the temp variable.
                emit(tempVar);
                write(" = ");
                emitObjectLiteralBody(node, firstComputedPropertyIndex);
                for (var i = firstComputedPropertyIndex, n = properties.length; i < n; i++) {
                    writeComma();
                    var property = properties[i];
                    emitStart(property);
                    if (property.kind === 143 /* GetAccessor */ || property.kind === 144 /* SetAccessor */) {
                        // TODO (drosen): Reconcile with 'emitMemberFunctions'.
                        var accessors = ts.getAllAccessorDeclarations(node.properties, property);
                        if (property !== accessors.firstAccessor) {
                            continue;
                        }
                        write("Object.defineProperty(");
                        emit(tempVar);
                        write(", ");
                        emitStart(node.name);
                        emitExpressionForPropertyName(property.name);
                        emitEnd(property.name);
                        write(", {");
                        increaseIndent();
                        if (accessors.getAccessor) {
                            writeLine();
                            emitLeadingComments(accessors.getAccessor);
                            write("get: ");
                            emitStart(accessors.getAccessor);
                            write("function ");
                            emitSignatureAndBody(accessors.getAccessor);
                            emitEnd(accessors.getAccessor);
                            emitTrailingComments(accessors.getAccessor);
                            write(",");
                        }
                        if (accessors.setAccessor) {
                            writeLine();
                            emitLeadingComments(accessors.setAccessor);
                            write("set: ");
                            emitStart(accessors.setAccessor);
                            write("function ");
                            emitSignatureAndBody(accessors.setAccessor);
                            emitEnd(accessors.setAccessor);
                            emitTrailingComments(accessors.setAccessor);
                            write(",");
                        }
                        writeLine();
                        write("enumerable: true,");
                        writeLine();
                        write("configurable: true");
                        decreaseIndent();
                        writeLine();
                        write("})");
                        emitEnd(property);
                    }
                    else {
                        emitLeadingComments(property);
                        emitStart(property.name);
                        emit(tempVar);
                        emitMemberAccessForPropertyName(property.name);
                        emitEnd(property.name);
                        write(" = ");
                        if (property.kind === 243 /* PropertyAssignment */) {
                            emit(property.initializer);
                        }
                        else if (property.kind === 244 /* ShorthandPropertyAssignment */) {
                            emitExpressionIdentifier(property.name);
                        }
                        else if (property.kind === 141 /* MethodDeclaration */) {
                            emitFunctionDeclaration(property);
                        }
                        else {
                            Debug.fail("ObjectLiteralElement type not accounted for: " + property.kind);
                        }
                    }
                    emitEnd(property);
                }
                writeComma();
                emit(tempVar);
                if (multiLine) {
                    decreaseIndent();
                    writeLine();
                }
                write(")");
                function writeComma() {
                    if (multiLine) {
                        write(",");
                        writeLine();
                    }
                    else {
                        write(", ");
                    }
                }
            }
            function emitObjectLiteral(node) {
                var properties = node.properties;
                if (languageVersion < 2 /* ES6 */) {
                    var numProperties = properties.length;
                    // Find the first computed property.
                    // Everything until that point can be emitted as part of the initial object literal.
                    var numInitialNonComputedProperties = numProperties;
                    for (var i = 0, n = properties.length; i < n; i++) {
                        if (properties[i].name.kind === 134 /* ComputedPropertyName */) {
                            numInitialNonComputedProperties = i;
                            break;
                        }
                    }
                    var hasComputedProperty = numInitialNonComputedProperties !== properties.length;
                    if (hasComputedProperty) {
                        emitDownlevelObjectLiteralWithComputedProperties(node, numInitialNonComputedProperties);
                        return;
                    }
                }
                // Ordinary case: either the object has no computed properties
                // or we're compiling with an ES6+ target.
                emitObjectLiteralBody(node, properties.length);
            }
            function createBinaryExpression(left, operator, right, startsOnNewLine) {
                var result = ts.createSynthesizedNode(179 /* BinaryExpression */, startsOnNewLine);
                result.operatorToken = ts.createSynthesizedNode(operator);
                result.left = left;
                result.right = right;
                return result;
            }
            function createPropertyAccessExpression(expression, name) {
                var result = ts.createSynthesizedNode(164 /* PropertyAccessExpression */);
                result.expression = parenthesizeForAccess(expression);
                result.dotToken = ts.createSynthesizedNode(21 /* DotToken */);
                result.name = name;
                return result;
            }
            function createElementAccessExpression(expression, argumentExpression) {
                var result = ts.createSynthesizedNode(165 /* ElementAccessExpression */);
                result.expression = parenthesizeForAccess(expression);
                result.argumentExpression = argumentExpression;
                return result;
            }
            function parenthesizeForAccess(expr) {
                // When diagnosing whether the expression needs parentheses, the decision should be based
                // on the innermost expression in a chain of nested type assertions.
                while (expr.kind === 169 /* TypeAssertionExpression */ || expr.kind === 187 /* AsExpression */) {
                    expr = expr.expression;
                }
                // isLeftHandSideExpression is almost the correct criterion for when it is not necessary
                // to parenthesize the expression before a dot. The known exceptions are:
                //
                //    NewExpression:
                //       new C.x        -> not the same as (new C).x
                //    NumberLiteral
                //       1.x            -> not the same as (1).x
                //
                if (ts.isLeftHandSideExpression(expr) &&
                    expr.kind !== 167 /* NewExpression */ &&
                    expr.kind !== 8 /* NumericLiteral */) {
                    return expr;
                }
                var node = ts.createSynthesizedNode(170 /* ParenthesizedExpression */);
                node.expression = expr;
                return node;
            }
            function emitComputedPropertyName(node) {
                write("[");
                emitExpressionForPropertyName(node);
                write("]");
            }
            function emitMethod(node) {
                if (languageVersion >= 2 /* ES6 */ && node.asteriskToken) {
                    write("*");
                }
                emit(node.name);
                if (languageVersion < 2 /* ES6 */) {
                    write(": function ");
                }
                emitSignatureAndBody(node);
            }
            function emitPropertyAssignment(node) {
                emit(node.name);
                write(": ");
                // This is to ensure that we emit comment in the following case:
                //      For example:
                //          obj = {
                //              id: /*comment1*/ ()=>void
                //          }
                // "comment1" is not considered to be leading comment for node.initializer
                // but rather a trailing comment on the previous node.
                emitTrailingCommentsOfPosition(node.initializer.pos);
                emit(node.initializer);
            }
            // Return true if identifier resolves to an exported member of a namespace
            function isNamespaceExportReference(node) {
                var container = resolver.getReferencedExportContainer(node);
                return container && container.kind !== 246 /* SourceFile */;
            }
            function emitShorthandPropertyAssignment(node) {
                // The name property of a short-hand property assignment is considered an expression position, so here
                // we manually emit the identifier to avoid rewriting.
                writeTextOfNode(currentSourceFile, node.name);
                // If emitting pre-ES6 code, or if the name requires rewriting when resolved as an expression identifier,
                // we emit a normal property assignment. For example:
                //   module m {
                //       export let y;
                //   }
                //   module m {
                //       let obj = { y };
                //   }
                // Here we need to emit obj = { y : m.y } regardless of the output target.
                if (languageVersion < 2 /* ES6 */ || isNamespaceExportReference(node.name)) {
                    // Emit identifier as an identifier
                    write(": ");
                    emit(node.name);
                }
            }
            function tryEmitConstantValue(node) {
                var constantValue = tryGetConstEnumValue(node);
                if (constantValue !== undefined) {
                    write(constantValue.toString());
                    if (!compilerOptions.removeComments) {
                        var propertyName = node.kind === 164 /* PropertyAccessExpression */ ? ts.declarationNameToString(node.name) : ts.getTextOfNode(node.argumentExpression);
                        write(" /* " + propertyName + " */");
                    }
                    return true;
                }
                return false;
            }
            function tryGetConstEnumValue(node) {
                if (compilerOptions.isolatedModules) {
                    return undefined;
                }
                return node.kind === 164 /* PropertyAccessExpression */ || node.kind === 165 /* ElementAccessExpression */
                    ? resolver.getConstantValue(node)
                    : undefined;
            }
            // Returns 'true' if the code was actually indented, false otherwise.
            // If the code is not indented, an optional valueToWriteWhenNotIndenting will be
            // emitted instead.
            function indentIfOnDifferentLines(parent, node1, node2, valueToWriteWhenNotIndenting) {
                var realNodesAreOnDifferentLines = !ts.nodeIsSynthesized(parent) && !nodeEndIsOnSameLineAsNodeStart(node1, node2);
                // Always use a newline for synthesized code if the synthesizer desires it.
                var synthesizedNodeIsOnDifferentLine = synthesizedNodeStartsOnNewLine(node2);
                if (realNodesAreOnDifferentLines || synthesizedNodeIsOnDifferentLine) {
                    increaseIndent();
                    writeLine();
                    return true;
                }
                else {
                    if (valueToWriteWhenNotIndenting) {
                        write(valueToWriteWhenNotIndenting);
                    }
                    return false;
                }
            }
            function emitPropertyAccess(node) {
                if (tryEmitConstantValue(node)) {
                    return;
                }
                emit(node.expression);
                var indentedBeforeDot = indentIfOnDifferentLines(node, node.expression, node.dotToken);
                // 1 .toString is a valid property access, emit a space after the literal
                // Also emit a space if expression is a integer const enum value - it will appear in generated code as numeric literal
                var shouldEmitSpace;
                if (!indentedBeforeDot) {
                    if (node.expression.kind === 8 /* NumericLiteral */) {
                        // check if numeric literal was originally written with a dot
                        var text = ts.getSourceTextOfNodeFromSourceFile(currentSourceFile, node.expression);
                        shouldEmitSpace = text.indexOf(ts.tokenToString(21 /* DotToken */)) < 0;
                    }
                    else {
                        // check if constant enum value is integer
                        var constantValue = tryGetConstEnumValue(node.expression);
                        // isFinite handles cases when constantValue is undefined
                        shouldEmitSpace = isFinite(constantValue) && Math.floor(constantValue) === constantValue;
                    }
                }
                if (shouldEmitSpace) {
                    write(" .");
                }
                else {
                    write(".");
                }
                var indentedAfterDot = indentIfOnDifferentLines(node, node.dotToken, node.name);
                emit(node.name);
                decreaseIndentIf(indentedBeforeDot, indentedAfterDot);
            }
            function emitQualifiedName(node) {
                emit(node.left);
                write(".");
                emit(node.right);
            }
            function emitQualifiedNameAsExpression(node, useFallback) {
                if (node.left.kind === 67 /* Identifier */) {
                    emitEntityNameAsExpression(node.left, useFallback);
                }
                else if (useFallback) {
                    var temp = createAndRecordTempVariable(0 /* Auto */);
                    write("(");
                    emitNodeWithoutSourceMap(temp);
                    write(" = ");
                    emitEntityNameAsExpression(node.left, true);
                    write(") && ");
                    emitNodeWithoutSourceMap(temp);
                }
                else {
                    emitEntityNameAsExpression(node.left, false);
                }
                write(".");
                emit(node.right);
            }
            function emitEntityNameAsExpression(node, useFallback) {
                switch (node.kind) {
                    case 67 /* Identifier */:
                        if (useFallback) {
                            write("typeof ");
                            emitExpressionIdentifier(node);
                            write(" !== 'undefined' && ");
                        }
                        emitExpressionIdentifier(node);
                        break;
                    case 133 /* QualifiedName */:
                        emitQualifiedNameAsExpression(node, useFallback);
                        break;
                }
            }
            function emitIndexedAccess(node) {
                if (tryEmitConstantValue(node)) {
                    return;
                }
                emit(node.expression);
                write("[");
                emit(node.argumentExpression);
                write("]");
            }
            function hasSpreadElement(elements) {
                return forEach(elements, function (e) { return e.kind === 183 /* SpreadElementExpression */; });
            }
            function skipParentheses(node) {
                while (node.kind === 170 /* ParenthesizedExpression */ || node.kind === 169 /* TypeAssertionExpression */ || node.kind === 187 /* AsExpression */) {
                    node = node.expression;
                }
                return node;
            }
            function emitCallTarget(node) {
                if (node.kind === 67 /* Identifier */ || node.kind === 95 /* ThisKeyword */ || node.kind === 93 /* SuperKeyword */) {
                    emit(node);
                    return node;
                }
                var temp = createAndRecordTempVariable(0 /* Auto */);
                write("(");
                emit(temp);
                write(" = ");
                emit(node);
                write(")");
                return temp;
            }
            function emitCallWithSpread(node) {
                var target;
                var expr = skipParentheses(node.expression);
                if (expr.kind === 164 /* PropertyAccessExpression */) {
                    // Target will be emitted as "this" argument
                    target = emitCallTarget(expr.expression);
                    write(".");
                    emit(expr.name);
                }
                else if (expr.kind === 165 /* ElementAccessExpression */) {
                    // Target will be emitted as "this" argument
                    target = emitCallTarget(expr.expression);
                    write("[");
                    emit(expr.argumentExpression);
                    write("]");
                }
                else if (expr.kind === 93 /* SuperKeyword */) {
                    target = expr;
                    write("_super");
                }
                else {
                    emit(node.expression);
                }
                write(".apply(");
                if (target) {
                    if (target.kind === 93 /* SuperKeyword */) {
                        // Calls of form super(...) and super.foo(...)
                        emitThis(target);
                    }
                    else {
                        // Calls of form obj.foo(...)
                        emit(target);
                    }
                }
                else {
                    // Calls of form foo(...)
                    write("void 0");
                }
                write(", ");
                emitListWithSpread(node.arguments, false, false, false, true);
                write(")");
            }
            function emitCallExpression(node) {
                if (languageVersion < 2 /* ES6 */ && hasSpreadElement(node.arguments)) {
                    emitCallWithSpread(node);
                    return;
                }
                var superCall = false;
                if (node.expression.kind === 93 /* SuperKeyword */) {
                    emitSuper(node.expression);
                    superCall = true;
                }
                else {
                    emit(node.expression);
                    superCall = node.expression.kind === 164 /* PropertyAccessExpression */ && node.expression.expression.kind === 93 /* SuperKeyword */;
                }
                if (superCall && languageVersion < 2 /* ES6 */) {
                    write(".call(");
                    emitThis(node.expression);
                    if (node.arguments.length) {
                        write(", ");
                        emitCommaList(node.arguments);
                    }
                    write(")");
                }
                else {
                    write("(");
                    emitCommaList(node.arguments);
                    write(")");
                }
            }
            function emitNewExpression(node) {
                write("new ");
                // Spread operator logic is supported in new expressions in ES5 using a combination
                // of Function.prototype.bind() and Function.prototype.apply().
                //
                //     Example:
                //
                //         var args = [1, 2, 3, 4, 5];
                //         new Array(...args);
                //
                //     is compiled into the following ES5:
                //
                //         var args = [1, 2, 3, 4, 5];
                //         new (Array.bind.apply(Array, [void 0].concat(args)));
                //
                // The 'thisArg' to 'bind' is ignored when invoking the result of 'bind' with 'new',
                // Thus, we set it to undefined ('void 0').
                if (languageVersion === 1 /* ES5 */ &&
                    node.arguments &&
                    hasSpreadElement(node.arguments)) {
                    write("(");
                    var target = emitCallTarget(node.expression);
                    write(".bind.apply(");
                    emit(target);
                    write(", [void 0].concat(");
                    emitListWithSpread(node.arguments, false, false, false, false);
                    write(")))");
                    write("()");
                }
                else {
                    emit(node.expression);
                    if (node.arguments) {
                        write("(");
                        emitCommaList(node.arguments);
                        write(")");
                    }
                }
            }
            function emitTaggedTemplateExpression(node) {
                if (languageVersion >= 2 /* ES6 */) {
                    emit(node.tag);
                    write(" ");
                    emit(node.template);
                }
                else {
                    emitDownlevelTaggedTemplate(node);
                }
            }
            function emitParenExpression(node) {
                // If the node is synthesized, it means the emitter put the parentheses there,
                // not the user. If we didn't want them, the emitter would not have put them
                // there.
                if (!ts.nodeIsSynthesized(node) && node.parent.kind !== 172 /* ArrowFunction */) {
                    if (node.expression.kind === 169 /* TypeAssertionExpression */ || node.expression.kind === 187 /* AsExpression */) {
                        var operand = node.expression.expression;
                        // Make sure we consider all nested cast expressions, e.g.:
                        // (<any><number><any>-A).x;
                        while (operand.kind === 169 /* TypeAssertionExpression */ || operand.kind === 187 /* AsExpression */) {
                            operand = operand.expression;
                        }
                        // We have an expression of the form: (<Type>SubExpr)
                        // Emitting this as (SubExpr) is really not desirable. We would like to emit the subexpr as is.
                        // Omitting the parentheses, however, could cause change in the semantics of the generated
                        // code if the casted expression has a lower precedence than the rest of the expression, e.g.:
                        //      (<any>new A).foo should be emitted as (new A).foo and not new A.foo
                        //      (<any>typeof A).toString() should be emitted as (typeof A).toString() and not typeof A.toString()
                        //      new (<any>A()) should be emitted as new (A()) and not new A()
                        //      (<any>function foo() { })() should be emitted as an IIF (function foo(){})() and not declaration function foo(){} ()
                        if (operand.kind !== 177 /* PrefixUnaryExpression */ &&
                            operand.kind !== 175 /* VoidExpression */ &&
                            operand.kind !== 174 /* TypeOfExpression */ &&
                            operand.kind !== 173 /* DeleteExpression */ &&
                            operand.kind !== 178 /* PostfixUnaryExpression */ &&
                            operand.kind !== 167 /* NewExpression */ &&
                            !(operand.kind === 166 /* CallExpression */ && node.parent.kind === 167 /* NewExpression */) &&
                            !(operand.kind === 171 /* FunctionExpression */ && node.parent.kind === 166 /* CallExpression */)) {
                            emit(operand);
                            return;
                        }
                    }
                }
                write("(");
                emit(node.expression);
                write(")");
            }
            function emitDeleteExpression(node) {
                write(ts.tokenToString(76 /* DeleteKeyword */));
                write(" ");
                emit(node.expression);
            }
            function emitVoidExpression(node) {
                write(ts.tokenToString(101 /* VoidKeyword */));
                write(" ");
                emit(node.expression);
            }
            function emitTypeOfExpression(node) {
                write(ts.tokenToString(99 /* TypeOfKeyword */));
                write(" ");
                emit(node.expression);
            }
            function isNameOfExportedSourceLevelDeclarationInSystemExternalModule(node) {
                if (!isCurrentFileSystemExternalModule() || node.kind !== 67 /* Identifier */ || ts.nodeIsSynthesized(node)) {
                    return false;
                }
                var isVariableDeclarationOrBindingElement = node.parent && (node.parent.kind === 209 /* VariableDeclaration */ || node.parent.kind === 161 /* BindingElement */);
                var targetDeclaration = isVariableDeclarationOrBindingElement
                    ? node.parent
                    : resolver.getReferencedValueDeclaration(node);
                return isSourceFileLevelDeclarationInSystemJsModule(targetDeclaration, true);
            }
            function emitPrefixUnaryExpression(node) {
                var exportChanged = isNameOfExportedSourceLevelDeclarationInSystemExternalModule(node.operand);
                if (exportChanged) {
                    // emit
                    // ++x
                    // as
                    // exports('x', ++x)
                    write(exportFunctionForFile + "(\"");
                    emitNodeWithoutSourceMap(node.operand);
                    write("\", ");
                }
                write(ts.tokenToString(node.operator));
                // In some cases, we need to emit a space between the operator and the operand. One obvious case
                // is when the operator is an identifier, like delete or typeof. We also need to do this for plus
                // and minus expressions in certain cases. Specifically, consider the following two cases (parens
                // are just for clarity of exposition, and not part of the source code):
                //
                //  (+(+1))
                //  (+(++1))
                //
                // We need to emit a space in both cases. In the first case, the absence of a space will make
                // the resulting expression a prefix increment operation. And in the second, it will make the resulting
                // expression a prefix increment whose operand is a plus expression - (++(+x))
                // The same is true of minus of course.
                if (node.operand.kind === 177 /* PrefixUnaryExpression */) {
                    var operand = node.operand;
                    if (node.operator === 35 /* PlusToken */ && (operand.operator === 35 /* PlusToken */ || operand.operator === 40 /* PlusPlusToken */)) {
                        write(" ");
                    }
                    else if (node.operator === 36 /* MinusToken */ && (operand.operator === 36 /* MinusToken */ || operand.operator === 41 /* MinusMinusToken */)) {
                        write(" ");
                    }
                }
                emit(node.operand);
                if (exportChanged) {
                    write(")");
                }
            }
            function emitPostfixUnaryExpression(node) {
                var exportChanged = isNameOfExportedSourceLevelDeclarationInSystemExternalModule(node.operand);
                if (exportChanged) {
                    // export function returns the value that was passes as the second argument
                    // however for postfix unary expressions result value should be the value before modification.
                    // emit 'x++' as '(export('x', ++x) - 1)' and 'x--' as '(export('x', --x) + 1)'
                    write("(" + exportFunctionForFile + "(\"");
                    emitNodeWithoutSourceMap(node.operand);
                    write("\", ");
                    write(ts.tokenToString(node.operator));
                    emit(node.operand);
                    if (node.operator === 40 /* PlusPlusToken */) {
                        write(") - 1)");
                    }
                    else {
                        write(") + 1)");
                    }
                }
                else {
                    emit(node.operand);
                    write(ts.tokenToString(node.operator));
                }
            }
            function shouldHoistDeclarationInSystemJsModule(node) {
                return isSourceFileLevelDeclarationInSystemJsModule(node, false);
            }
            /*
             * Checks if given node is a source file level declaration (not nested in module/function).
             * If 'isExported' is true - then declaration must also be exported.
             * This function is used in two cases:
             * - check if node is a exported source file level value to determine
             *   if we should also export the value after its it changed
             * - check if node is a source level declaration to emit it differently,
             *   i.e non-exported variable statement 'var x = 1' is hoisted so
             *   we we emit variable statement 'var' should be dropped.
             */
            function isSourceFileLevelDeclarationInSystemJsModule(node, isExported) {
                if (!node || languageVersion >= 2 /* ES6 */ || !isCurrentFileSystemExternalModule()) {
                    return false;
                }
                var current = node;
                while (current) {
                    if (current.kind === 246 /* SourceFile */) {
                        return !isExported || ((ts.getCombinedNodeFlags(node) & 1 /* Export */) !== 0);
                    }
                    else if (ts.isFunctionLike(current) || current.kind === 217 /* ModuleBlock */) {
                        return false;
                    }
                    else {
                        current = current.parent;
                    }
                }
            }
            function emitBinaryExpression(node) {
                if (languageVersion < 2 /* ES6 */ && node.operatorToken.kind === 55 /* EqualsToken */ &&
                    (node.left.kind === 163 /* ObjectLiteralExpression */ || node.left.kind === 162 /* ArrayLiteralExpression */)) {
                    emitDestructuring(node, node.parent.kind === 193 /* ExpressionStatement */);
                }
                else {
                    var exportChanged = node.operatorToken.kind >= 55 /* FirstAssignment */ &&
                        node.operatorToken.kind <= 66 /* LastAssignment */ &&
                        isNameOfExportedSourceLevelDeclarationInSystemExternalModule(node.left);
                    if (exportChanged) {
                        // emit assignment 'x <op> y' as 'exports("x", x <op> y)'
                        write(exportFunctionForFile + "(\"");
                        emitNodeWithoutSourceMap(node.left);
                        write("\", ");
                    }
                    emit(node.left);
                    var indentedBeforeOperator = indentIfOnDifferentLines(node, node.left, node.operatorToken, node.operatorToken.kind !== 24 /* CommaToken */ ? " " : undefined);
                    write(ts.tokenToString(node.operatorToken.kind));
                    var indentedAfterOperator = indentIfOnDifferentLines(node, node.operatorToken, node.right, " ");
                    emit(node.right);
                    decreaseIndentIf(indentedBeforeOperator, indentedAfterOperator);
                    if (exportChanged) {
                        write(")");
                    }
                }
            }
            function synthesizedNodeStartsOnNewLine(node) {
                return ts.nodeIsSynthesized(node) && node.startsOnNewLine;
            }
            function emitConditionalExpression(node) {
                emit(node.condition);
                var indentedBeforeQuestion = indentIfOnDifferentLines(node, node.condition, node.questionToken, " ");
                write("?");
                var indentedAfterQuestion = indentIfOnDifferentLines(node, node.questionToken, node.whenTrue, " ");
                emit(node.whenTrue);
                decreaseIndentIf(indentedBeforeQuestion, indentedAfterQuestion);
                var indentedBeforeColon = indentIfOnDifferentLines(node, node.whenTrue, node.colonToken, " ");
                write(":");
                var indentedAfterColon = indentIfOnDifferentLines(node, node.colonToken, node.whenFalse, " ");
                emit(node.whenFalse);
                decreaseIndentIf(indentedBeforeColon, indentedAfterColon);
            }
            // Helper function to decrease the indent if we previously indented.  Allows multiple
            // previous indent values to be considered at a time.  This also allows caller to just
            // call this once, passing in all their appropriate indent values, instead of needing
            // to call this helper function multiple times.
            function decreaseIndentIf(value1, value2) {
                if (value1) {
                    decreaseIndent();
                }
                if (value2) {
                    decreaseIndent();
                }
            }
            function isSingleLineEmptyBlock(node) {
                if (node && node.kind === 190 /* Block */) {
                    var block = node;
                    return block.statements.length === 0 && nodeEndIsOnSameLineAsNodeStart(block, block);
                }
            }
            function emitBlock(node) {
                if (isSingleLineEmptyBlock(node)) {
                    emitToken(15 /* OpenBraceToken */, node.pos);
                    write(" ");
                    emitToken(16 /* CloseBraceToken */, node.statements.end);
                    return;
                }
                emitToken(15 /* OpenBraceToken */, node.pos);
                increaseIndent();
                scopeEmitStart(node.parent);
                if (node.kind === 217 /* ModuleBlock */) {
                    Debug.assert(node.parent.kind === 216 /* ModuleDeclaration */);
                    emitCaptureThisForNodeIfNecessary(node.parent);
                }
                emitLines(node.statements);
                if (node.kind === 217 /* ModuleBlock */) {
                    emitTempDeclarations(true);
                }
                decreaseIndent();
                writeLine();
                emitToken(16 /* CloseBraceToken */, node.statements.end);
                scopeEmitEnd();
            }
            function emitEmbeddedStatement(node) {
                if (node.kind === 190 /* Block */) {
                    write(" ");
                    emit(node);
                }
                else {
                    increaseIndent();
                    writeLine();
                    emit(node);
                    decreaseIndent();
                }
            }
            function emitExpressionStatement(node) {
                emitParenthesizedIf(node.expression, node.expression.kind === 172 /* ArrowFunction */);
                write(";");
            }
            function emitIfStatement(node) {
                var endPos = emitToken(86 /* IfKeyword */, node.pos);
                write(" ");
                endPos = emitToken(17 /* OpenParenToken */, endPos);
                emit(node.expression);
                emitToken(18 /* CloseParenToken */, node.expression.end);
                emitEmbeddedStatement(node.thenStatement);
                if (node.elseStatement) {
                    writeLine();
                    emitToken(78 /* ElseKeyword */, node.thenStatement.end);
                    if (node.elseStatement.kind === 194 /* IfStatement */) {
                        write(" ");
                        emit(node.elseStatement);
                    }
                    else {
                        emitEmbeddedStatement(node.elseStatement);
                    }
                }
            }
            function emitDoStatement(node) {
                write("do");
                emitEmbeddedStatement(node.statement);
                if (node.statement.kind === 190 /* Block */) {
                    write(" ");
                }
                else {
                    writeLine();
                }
                write("while (");
                emit(node.expression);
                write(");");
            }
            function emitWhileStatement(node) {
                write("while (");
                emit(node.expression);
                write(")");
                emitEmbeddedStatement(node.statement);
            }
            /**
             * Returns true if start of variable declaration list was emitted.
             * Returns false if nothing was written - this can happen for source file level variable declarations
             *     in system modules where such variable declarations are hoisted.
             */
            function tryEmitStartOfVariableDeclarationList(decl, startPos) {
                if (shouldHoistVariable(decl, true)) {
                    // variables in variable declaration list were already hoisted
                    return false;
                }
                var tokenKind = 100 /* VarKeyword */;
                if (decl && languageVersion >= 2 /* ES6 */) {
                    if (ts.isLet(decl)) {
                        tokenKind = 106 /* LetKeyword */;
                    }
                    else if (ts.isConst(decl)) {
                        tokenKind = 72 /* ConstKeyword */;
                    }
                }
                if (startPos !== undefined) {
                    emitToken(tokenKind, startPos);
                    write(" ");
                }
                else {
                    switch (tokenKind) {
                        case 100 /* VarKeyword */:
                            write("var ");
                            break;
                        case 106 /* LetKeyword */:
                            write("let ");
                            break;
                        case 72 /* ConstKeyword */:
                            write("const ");
                            break;
                    }
                }
                return true;
            }
            function emitVariableDeclarationListSkippingUninitializedEntries(list) {
                var started = false;
                for (var _a = 0, _b = list.declarations; _a < _b.length; _a++) {
                    var decl = _b[_a];
                    if (!decl.initializer) {
                        continue;
                    }
                    if (!started) {
                        started = true;
                    }
                    else {
                        write(", ");
                    }
                    emit(decl);
                }
                return started;
            }
            function emitForStatement(node) {
                var endPos = emitToken(84 /* ForKeyword */, node.pos);
                write(" ");
                endPos = emitToken(17 /* OpenParenToken */, endPos);
                if (node.initializer && node.initializer.kind === 210 /* VariableDeclarationList */) {
                    var variableDeclarationList = node.initializer;
                    var startIsEmitted = tryEmitStartOfVariableDeclarationList(variableDeclarationList, endPos);
                    if (startIsEmitted) {
                        emitCommaList(variableDeclarationList.declarations);
                    }
                    else {
                        emitVariableDeclarationListSkippingUninitializedEntries(variableDeclarationList);
                    }
                }
                else if (node.initializer) {
                    emit(node.initializer);
                }
                write(";");
                emitOptional(" ", node.condition);
                write(";");
                emitOptional(" ", node.incrementor);
                write(")");
                emitEmbeddedStatement(node.statement);
            }
            function emitForInOrForOfStatement(node) {
                if (languageVersion < 2 /* ES6 */ && node.kind === 199 /* ForOfStatement */) {
                    return emitDownLevelForOfStatement(node);
                }
                var endPos = emitToken(84 /* ForKeyword */, node.pos);
                write(" ");
                endPos = emitToken(17 /* OpenParenToken */, endPos);
                if (node.initializer.kind === 210 /* VariableDeclarationList */) {
                    var variableDeclarationList = node.initializer;
                    if (variableDeclarationList.declarations.length >= 1) {
                        tryEmitStartOfVariableDeclarationList(variableDeclarationList, endPos);
                        emit(variableDeclarationList.declarations[0]);
                    }
                }
                else {
                    emit(node.initializer);
                }
                if (node.kind === 198 /* ForInStatement */) {
                    write(" in ");
                }
                else {
                    write(" of ");
                }
                emit(node.expression);
                emitToken(18 /* CloseParenToken */, node.expression.end);
                emitEmbeddedStatement(node.statement);
            }
            function emitDownLevelForOfStatement(node) {
                // The following ES6 code:
                //
                //    for (let v of expr) { }
                //
                // should be emitted as
                //
                //    for (let _i = 0, _a = expr; _i < _a.length; _i++) {
                //        let v = _a[_i];
                //    }
                //
                // where _a and _i are temps emitted to capture the RHS and the counter,
                // respectively.
                // When the left hand side is an expression instead of a let declaration,
                // the "let v" is not emitted.
                // When the left hand side is a let/const, the v is renamed if there is
                // another v in scope.
                // Note that all assignments to the LHS are emitted in the body, including
                // all destructuring.
                // Note also that because an extra statement is needed to assign to the LHS,
                // for-of bodies are always emitted as blocks.
                var endPos = emitToken(84 /* ForKeyword */, node.pos);
                write(" ");
                endPos = emitToken(17 /* OpenParenToken */, endPos);
                // Do not emit the LHS let declaration yet, because it might contain destructuring.
                // Do not call recordTempDeclaration because we are declaring the temps
                // right here. Recording means they will be declared later.
                // In the case where the user wrote an identifier as the RHS, like this:
                //
                //     for (let v of arr) { }
                //
                // we don't want to emit a temporary variable for the RHS, just use it directly.
                var rhsIsIdentifier = node.expression.kind === 67 /* Identifier */;
                var counter = createTempVariable(268435456 /* _i */);
                var rhsReference = rhsIsIdentifier ? node.expression : createTempVariable(0 /* Auto */);
                // This is the let keyword for the counter and rhsReference. The let keyword for
                // the LHS will be emitted inside the body.
                emitStart(node.expression);
                write("var ");
                // _i = 0
                emitNodeWithoutSourceMap(counter);
                write(" = 0");
                emitEnd(node.expression);
                if (!rhsIsIdentifier) {
                    // , _a = expr
                    write(", ");
                    emitStart(node.expression);
                    emitNodeWithoutSourceMap(rhsReference);
                    write(" = ");
                    emitNodeWithoutSourceMap(node.expression);
                    emitEnd(node.expression);
                }
                write("; ");
                // _i < _a.length;
                emitStart(node.initializer);
                emitNodeWithoutSourceMap(counter);
                write(" < ");
                emitNodeWithCommentsAndWithoutSourcemap(rhsReference);
                write(".length");
                emitEnd(node.initializer);
                write("; ");
                // _i++)
                emitStart(node.initializer);
                emitNodeWithoutSourceMap(counter);
                write("++");
                emitEnd(node.initializer);
                emitToken(18 /* CloseParenToken */, node.expression.end);
                // Body
                write(" {");
                writeLine();
                increaseIndent();
                // Initialize LHS
                // let v = _a[_i];
                var rhsIterationValue = createElementAccessExpression(rhsReference, counter);
                emitStart(node.initializer);
                if (node.initializer.kind === 210 /* VariableDeclarationList */) {
                    write("var ");
                    var variableDeclarationList = node.initializer;
                    if (variableDeclarationList.declarations.length > 0) {
                        var declaration = variableDeclarationList.declarations[0];
                        if (ts.isBindingPattern(declaration.name)) {
                            // This works whether the declaration is a var, let, or const.
                            // It will use rhsIterationValue _a[_i] as the initializer.
                            emitDestructuring(declaration, false, rhsIterationValue);
                        }
                        else {
                            // The following call does not include the initializer, so we have
                            // to emit it separately.
                            emitNodeWithCommentsAndWithoutSourcemap(declaration);
                            write(" = ");
                            emitNodeWithoutSourceMap(rhsIterationValue);
                        }
                    }
                    else {
                        // It's an empty declaration list. This can only happen in an error case, if the user wrote
                        //     for (let of []) {}
                        emitNodeWithoutSourceMap(createTempVariable(0 /* Auto */));
                        write(" = ");
                        emitNodeWithoutSourceMap(rhsIterationValue);
                    }
                }
                else {
                    // Initializer is an expression. Emit the expression in the body, so that it's
                    // evaluated on every iteration.
                    var assignmentExpression = createBinaryExpression(node.initializer, 55 /* EqualsToken */, rhsIterationValue, false);
                    if (node.initializer.kind === 162 /* ArrayLiteralExpression */ || node.initializer.kind === 163 /* ObjectLiteralExpression */) {
                        // This is a destructuring pattern, so call emitDestructuring instead of emit. Calling emit will not work, because it will cause
                        // the BinaryExpression to be passed in instead of the expression statement, which will cause emitDestructuring to crash.
                        emitDestructuring(assignmentExpression, true, undefined);
                    }
                    else {
                        emitNodeWithCommentsAndWithoutSourcemap(assignmentExpression);
                    }
                }
                emitEnd(node.initializer);
                write(";");
                if (node.statement.kind === 190 /* Block */) {
                    emitLines(node.statement.statements);
                }
                else {
                    writeLine();
                    emit(node.statement);
                }
                writeLine();
                decreaseIndent();
                write("}");
            }
            function emitBreakOrContinueStatement(node) {
                emitToken(node.kind === 201 /* BreakStatement */ ? 68 /* BreakKeyword */ : 73 /* ContinueKeyword */, node.pos);
                emitOptional(" ", node.label);
                write(";");
            }
            function emitReturnStatement(node) {
                emitToken(92 /* ReturnKeyword */, node.pos);
                emitOptional(" ", node.expression);
                write(";");
            }
            function emitWithStatement(node) {
                write("with (");
                emit(node.expression);
                write(")");
                emitEmbeddedStatement(node.statement);
            }
            function emitSwitchStatement(node) {
                var endPos = emitToken(94 /* SwitchKeyword */, node.pos);
                write(" ");
                emitToken(17 /* OpenParenToken */, endPos);
                emit(node.expression);
                endPos = emitToken(18 /* CloseParenToken */, node.expression.end);
                write(" ");
                emitCaseBlock(node.caseBlock, endPos);
            }
            function emitCaseBlock(node, startPos) {
                emitToken(15 /* OpenBraceToken */, startPos);
                increaseIndent();
                emitLines(node.clauses);
                decreaseIndent();
                writeLine();
                emitToken(16 /* CloseBraceToken */, node.clauses.end);
            }
            function nodeStartPositionsAreOnSameLine(node1, node2) {
                return ts.getLineOfLocalPosition(currentSourceFile, ts.skipTrivia(currentSourceFile.text, node1.pos)) ===
                    ts.getLineOfLocalPosition(currentSourceFile, ts.skipTrivia(currentSourceFile.text, node2.pos));
            }
            function nodeEndPositionsAreOnSameLine(node1, node2) {
                return ts.getLineOfLocalPosition(currentSourceFile, node1.end) ===
                    ts.getLineOfLocalPosition(currentSourceFile, node2.end);
            }
            function nodeEndIsOnSameLineAsNodeStart(node1, node2) {
                return ts.getLineOfLocalPosition(currentSourceFile, node1.end) ===
                    ts.getLineOfLocalPosition(currentSourceFile, ts.skipTrivia(currentSourceFile.text, node2.pos));
            }
            function emitCaseOrDefaultClause(node) {
                if (node.kind === 239 /* CaseClause */) {
                    write("case ");
                    emit(node.expression);
                    write(":");
                }
                else {
                    write("default:");
                }
                if (node.statements.length === 1 && nodeStartPositionsAreOnSameLine(node, node.statements[0])) {
                    write(" ");
                    emit(node.statements[0]);
                }
                else {
                    increaseIndent();
                    emitLines(node.statements);
                    decreaseIndent();
                }
            }
            function emitThrowStatement(node) {
                write("throw ");
                emit(node.expression);
                write(";");
            }
            function emitTryStatement(node) {
                write("try ");
                emit(node.tryBlock);
                emit(node.catchClause);
                if (node.finallyBlock) {
                    writeLine();
                    write("finally ");
                    emit(node.finallyBlock);
                }
            }
            function emitCatchClause(node) {
                writeLine();
                var endPos = emitToken(70 /* CatchKeyword */, node.pos);
                write(" ");
                emitToken(17 /* OpenParenToken */, endPos);
                emit(node.variableDeclaration);
                emitToken(18 /* CloseParenToken */, node.variableDeclaration ? node.variableDeclaration.end : endPos);
                write(" ");
                emitBlock(node.block);
            }
            function emitDebuggerStatement(node) {
                emitToken(74 /* DebuggerKeyword */, node.pos);
                write(";");
            }
            function emitLabelledStatement(node) {
                emit(node.label);
                write(": ");
                emit(node.statement);
            }
            function getContainingModule(node) {
                do {
                    node = node.parent;
                } while (node && node.kind !== 216 /* ModuleDeclaration */);
                return node;
            }
            function emitContainingModuleName(node) {
                var container = getContainingModule(node);
                write(container ? getGeneratedNameForNode(container) : "exports");
            }
            function emitModuleMemberName(node) {
                emitStart(node.name);
                if (ts.getCombinedNodeFlags(node) & 1 /* Export */) {
                    var container = getContainingModule(node);
                    if (container) {
                        write(getGeneratedNameForNode(container));
                        write(".");
                    }
                    else if (languageVersion < 2 /* ES6 */ && compilerOptions.module !== 4 /* System */) {
                        write("exports.");
                    }
                }
                emitNodeWithCommentsAndWithoutSourcemap(node.name);
                emitEnd(node.name);
            }
            function createVoidZero() {
                var zero = ts.createSynthesizedNode(8 /* NumericLiteral */);
                zero.text = "0";
                var result = ts.createSynthesizedNode(175 /* VoidExpression */);
                result.expression = zero;
                return result;
            }
            function emitEs6ExportDefaultCompat(node) {
                if (node.parent.kind === 246 /* SourceFile */) {
                    Debug.assert(!!(node.flags & 1024 /* Default */) || node.kind === 225 /* ExportAssignment */);
                    // only allow export default at a source file level
                    if (compilerOptions.module === 1 /* CommonJS */ || compilerOptions.module === 2 /* AMD */ || compilerOptions.module === 3 /* UMD */) {
                        if (!currentSourceFile.symbol.exports["___esModule"]) {
                            if (languageVersion === 1 /* ES5 */) {
                                // default value of configurable, enumerable, writable are `false`.
                                write("Object.defineProperty(exports, \"__esModule\", { value: true });");
                                writeLine();
                            }
                            else if (languageVersion === 0 /* ES3 */) {
                                write("exports.__esModule = true;");
                                writeLine();
                            }
                        }
                    }
                }
            }
            function emitExportMemberAssignment(node) {
                if (node.flags & 1 /* Export */) {
                    writeLine();
                    emitStart(node);
                    // emit call to exporter only for top level nodes
                    if (compilerOptions.module === 4 /* System */ && node.parent === currentSourceFile) {
                        // emit export default <smth> as
                        // export("default", <smth>)
                        write(exportFunctionForFile + "(\"");
                        if (node.flags & 1024 /* Default */) {
                            write("default");
                        }
                        else {
                            emitNodeWithCommentsAndWithoutSourcemap(node.name);
                        }
                        write("\", ");
                        emitDeclarationName(node);
                        write(")");
                    }
                    else {
                        if (node.flags & 1024 /* Default */) {
                            emitEs6ExportDefaultCompat(node);
                            if (languageVersion === 0 /* ES3 */) {
                                write("exports[\"default\"]");
                            }
                            else {
                                write("exports.default");
                            }
                        }
                        else {
                            emitModuleMemberName(node);
                        }
                        write(" = ");
                        emitDeclarationName(node);
                    }
                    emitEnd(node);
                    write(";");
                }
            }
            function emitExportMemberAssignments(name) {
                if (compilerOptions.module === 4 /* System */) {
                    return;
                }
                if (!exportEquals && exportSpecifiers && hasProperty(exportSpecifiers, name.text)) {
                    for (var _a = 0, _b = exportSpecifiers[name.text]; _a < _b.length; _a++) {
                        var specifier = _b[_a];
                        writeLine();
                        emitStart(specifier.name);
                        emitContainingModuleName(specifier);
                        write(".");
                        emitNodeWithCommentsAndWithoutSourcemap(specifier.name);
                        emitEnd(specifier.name);
                        write(" = ");
                        emitExpressionIdentifier(name);
                        write(";");
                    }
                }
            }
            function emitExportSpecifierInSystemModule(specifier) {
                Debug.assert(compilerOptions.module === 4 /* System */);
                if (!resolver.getReferencedValueDeclaration(specifier.propertyName || specifier.name) && !resolver.isValueAliasDeclaration(specifier)) {
                    return;
                }
                writeLine();
                emitStart(specifier.name);
                write(exportFunctionForFile + "(\"");
                emitNodeWithCommentsAndWithoutSourcemap(specifier.name);
                write("\", ");
                emitExpressionIdentifier(specifier.propertyName || specifier.name);
                write(")");
                emitEnd(specifier.name);
                write(";");
            }
            function emitDestructuring(root, isAssignmentExpressionStatement, value) {
                var emitCount = 0;
                // An exported declaration is actually emitted as an assignment (to a property on the module object), so
                // temporary variables in an exported declaration need to have real declarations elsewhere
                // Also temporary variables should be explicitly allocated for source level declarations when module target is system
                // because actual variable declarations are hoisted
                var canDefineTempVariablesInPlace = false;
                if (root.kind === 209 /* VariableDeclaration */) {
                    var isExported = ts.getCombinedNodeFlags(root) & 1 /* Export */;
                    var isSourceLevelForSystemModuleKind = shouldHoistDeclarationInSystemJsModule(root);
                    canDefineTempVariablesInPlace = !isExported && !isSourceLevelForSystemModuleKind;
                }
                else if (root.kind === 136 /* Parameter */) {
                    canDefineTempVariablesInPlace = true;
                }
                if (root.kind === 179 /* BinaryExpression */) {
                    emitAssignmentExpression(root);
                }
                else {
                    Debug.assert(!isAssignmentExpressionStatement);
                    emitBindingElement(root, value);
                }
                function emitAssignment(name, value) {
                    if (emitCount++) {
                        write(", ");
                    }
                    var isVariableDeclarationOrBindingElement = name.parent && (name.parent.kind === 209 /* VariableDeclaration */ || name.parent.kind === 161 /* BindingElement */);
                    var exportChanged = isNameOfExportedSourceLevelDeclarationInSystemExternalModule(name);
                    if (exportChanged) {
                        write(exportFunctionForFile + "(\"");
                        emitNodeWithCommentsAndWithoutSourcemap(name);
                        write("\", ");
                    }
                    if (isVariableDeclarationOrBindingElement) {
                        emitModuleMemberName(name.parent);
                    }
                    else {
                        emit(name);
                    }
                    write(" = ");
                    emit(value);
                    if (exportChanged) {
                        write(")");
                    }
                }
                /**
                 * Ensures that there exists a declared identifier whose value holds the given expression.
                 * This function is useful to ensure that the expression's value can be read from in subsequent expressions.
                 * Unless 'reuseIdentifierExpressions' is false, 'expr' will be returned if it is just an identifier.
                 *
                 * @param expr the expression whose value needs to be bound.
                 * @param reuseIdentifierExpressions true if identifier expressions can simply be returned;
                 *                                   false if it is necessary to always emit an identifier.
                 */
                function ensureIdentifier(expr, reuseIdentifierExpressions) {
                    if (expr.kind === 67 /* Identifier */ && reuseIdentifierExpressions) {
                        return expr;
                    }
                    var identifier = createTempVariable(0 /* Auto */);
                    if (!canDefineTempVariablesInPlace) {
                        recordTempDeclaration(identifier);
                    }
                    emitAssignment(identifier, expr);
                    return identifier;
                }
                function createDefaultValueCheck(value, defaultValue) {
                    // The value expression will be evaluated twice, so for anything but a simple identifier
                    // we need to generate a temporary variable
                    value = ensureIdentifier(value, true);
                    // Return the expression 'value === void 0 ? defaultValue : value'
                    var equals = ts.createSynthesizedNode(179 /* BinaryExpression */);
                    equals.left = value;
                    equals.operatorToken = ts.createSynthesizedNode(32 /* EqualsEqualsEqualsToken */);
                    equals.right = createVoidZero();
                    return createConditionalExpression(equals, defaultValue, value);
                }
                function createConditionalExpression(condition, whenTrue, whenFalse) {
                    var cond = ts.createSynthesizedNode(180 /* ConditionalExpression */);
                    cond.condition = condition;
                    cond.questionToken = ts.createSynthesizedNode(52 /* QuestionToken */);
                    cond.whenTrue = whenTrue;
                    cond.colonToken = ts.createSynthesizedNode(53 /* ColonToken */);
                    cond.whenFalse = whenFalse;
                    return cond;
                }
                function createNumericLiteral(value) {
                    var node = ts.createSynthesizedNode(8 /* NumericLiteral */);
                    node.text = "" + value;
                    return node;
                }
                function createPropertyAccessForDestructuringProperty(object, propName) {
                    // We create a synthetic copy of the identifier in order to avoid the rewriting that might
                    // otherwise occur when the identifier is emitted.
                    var syntheticName = ts.createSynthesizedNode(propName.kind);
                    syntheticName.text = propName.text;
                    if (syntheticName.kind !== 67 /* Identifier */) {
                        return createElementAccessExpression(object, syntheticName);
                    }
                    return createPropertyAccessExpression(object, syntheticName);
                }
                function createSliceCall(value, sliceIndex) {
                    var call = ts.createSynthesizedNode(166 /* CallExpression */);
                    var sliceIdentifier = ts.createSynthesizedNode(67 /* Identifier */);
                    sliceIdentifier.text = "slice";
                    call.expression = createPropertyAccessExpression(value, sliceIdentifier);
                    call.arguments = ts.createSynthesizedNodeArray();
                    call.arguments[0] = createNumericLiteral(sliceIndex);
                    return call;
                }
                function emitObjectLiteralAssignment(target, value) {
                    var properties = target.properties;
                    if (properties.length !== 1) {
                        // For anything but a single element destructuring we need to generate a temporary
                        // to ensure value is evaluated exactly once.
                        value = ensureIdentifier(value, true);
                    }
                    for (var _a = 0; _a < properties.length; _a++) {
                        var p = properties[_a];
                        if (p.kind === 243 /* PropertyAssignment */ || p.kind === 244 /* ShorthandPropertyAssignment */) {
                            var propName = p.name;
                            emitDestructuringAssignment(p.initializer || propName, createPropertyAccessForDestructuringProperty(value, propName));
                        }
                    }
                }
                function emitArrayLiteralAssignment(target, value) {
                    var elements = target.elements;
                    if (elements.length !== 1) {
                        // For anything but a single element destructuring we need to generate a temporary
                        // to ensure value is evaluated exactly once.
                        value = ensureIdentifier(value, true);
                    }
                    for (var i = 0; i < elements.length; i++) {
                        var e = elements[i];
                        if (e.kind !== 185 /* OmittedExpression */) {
                            if (e.kind !== 183 /* SpreadElementExpression */) {
                                emitDestructuringAssignment(e, createElementAccessExpression(value, createNumericLiteral(i)));
                            }
                            else if (i === elements.length - 1) {
                                emitDestructuringAssignment(e.expression, createSliceCall(value, i));
                            }
                        }
                    }
                }
                function emitDestructuringAssignment(target, value) {
                    if (target.kind === 179 /* BinaryExpression */ && target.operatorToken.kind === 55 /* EqualsToken */) {
                        value = createDefaultValueCheck(value, target.right);
                        target = target.left;
                    }
                    if (target.kind === 163 /* ObjectLiteralExpression */) {
                        emitObjectLiteralAssignment(target, value);
                    }
                    else if (target.kind === 162 /* ArrayLiteralExpression */) {
                        emitArrayLiteralAssignment(target, value);
                    }
                    else {
                        emitAssignment(target, value);
                    }
                }
                function emitAssignmentExpression(root) {
                    var target = root.left;
                    var value = root.right;
                    if (ts.isEmptyObjectLiteralOrArrayLiteral(target)) {
                        emit(value);
                    }
                    else if (isAssignmentExpressionStatement) {
                        emitDestructuringAssignment(target, value);
                    }
                    else {
                        if (root.parent.kind !== 170 /* ParenthesizedExpression */) {
                            write("(");
                        }
                        value = ensureIdentifier(value, true);
                        emitDestructuringAssignment(target, value);
                        write(", ");
                        emit(value);
                        if (root.parent.kind !== 170 /* ParenthesizedExpression */) {
                            write(")");
                        }
                    }
                }
                function emitBindingElement(target, value) {
                    if (target.initializer) {
                        // Combine value and initializer
                        value = value ? createDefaultValueCheck(value, target.initializer) : target.initializer;
                    }
                    else if (!value) {
                        // Use 'void 0' in absence of value and initializer
                        value = createVoidZero();
                    }
                    if (ts.isBindingPattern(target.name)) {
                        var pattern = target.name;
                        var elements = pattern.elements;
                        var numElements = elements.length;
                        if (numElements !== 1) {
                            // For anything other than a single-element destructuring we need to generate a temporary
                            // to ensure value is evaluated exactly once. Additionally, if we have zero elements
                            // we need to emit *something* to ensure that in case a 'var' keyword was already emitted,
                            // so in that case, we'll intentionally create that temporary.
                            value = ensureIdentifier(value, numElements !== 0);
                        }
                        for (var i = 0; i < numElements; i++) {
                            var element = elements[i];
                            if (pattern.kind === 159 /* ObjectBindingPattern */) {
                                // Rewrite element to a declaration with an initializer that fetches property
                                var propName = element.propertyName || element.name;
                                emitBindingElement(element, createPropertyAccessForDestructuringProperty(value, propName));
                            }
                            else if (element.kind !== 185 /* OmittedExpression */) {
                                if (!element.dotDotDotToken) {
                                    // Rewrite element to a declaration that accesses array element at index i
                                    emitBindingElement(element, createElementAccessExpression(value, createNumericLiteral(i)));
                                }
                                else if (i === numElements - 1) {
                                    emitBindingElement(element, createSliceCall(value, i));
                                }
                            }
                        }
                    }
                    else {
                        emitAssignment(target.name, value);
                    }
                }
            }
            function emitVariableDeclaration(node) {
                if (ts.isBindingPattern(node.name)) {
                    if (languageVersion < 2 /* ES6 */) {
                        emitDestructuring(node, false);
                    }
                    else {
                        emit(node.name);
                        emitOptional(" = ", node.initializer);
                    }
                }
                else {
                    var initializer = node.initializer;
                    if (!initializer && languageVersion < 2 /* ES6 */) {
                        // downlevel emit for non-initialized let bindings defined in loops
                        // for (...) {  let x; }
                        // should be
                        // for (...) { var <some-uniqie-name> = void 0; }
                        // this is necessary to preserve ES6 semantic in scenarios like
                        // for (...) { let x; console.log(x); x = 1 } // assignment on one iteration should not affect other iterations
                        var isUninitializedLet = (resolver.getNodeCheckFlags(node) & 16384 /* BlockScopedBindingInLoop */) &&
                            (getCombinedFlagsForIdentifier(node.name) & 16384 /* Let */);
                        // NOTE: default initialization should not be added to let bindings in for-in\for-of statements
                        if (isUninitializedLet &&
                            node.parent.parent.kind !== 198 /* ForInStatement */ &&
                            node.parent.parent.kind !== 199 /* ForOfStatement */) {
                            initializer = createVoidZero();
                        }
                    }
                    var exportChanged = isNameOfExportedSourceLevelDeclarationInSystemExternalModule(node.name);
                    if (exportChanged) {
                        write(exportFunctionForFile + "(\"");
                        emitNodeWithCommentsAndWithoutSourcemap(node.name);
                        write("\", ");
                    }
                    emitModuleMemberName(node);
                    emitOptional(" = ", initializer);
                    if (exportChanged) {
                        write(")");
                    }
                }
            }
            function emitExportVariableAssignments(node) {
                if (node.kind === 185 /* OmittedExpression */) {
                    return;
                }
                var name = node.name;
                if (name.kind === 67 /* Identifier */) {
                    emitExportMemberAssignments(name);
                }
                else if (ts.isBindingPattern(name)) {
                    forEach(name.elements, emitExportVariableAssignments);
                }
            }
            function getCombinedFlagsForIdentifier(node) {
                if (!node.parent || (node.parent.kind !== 209 /* VariableDeclaration */ && node.parent.kind !== 161 /* BindingElement */)) {
                    return 0;
                }
                return ts.getCombinedNodeFlags(node.parent);
            }
            function isES6ExportedDeclaration(node) {
                return !!(node.flags & 1 /* Export */) &&
                    languageVersion >= 2 /* ES6 */ &&
                    node.parent.kind === 246 /* SourceFile */;
            }
            function emitVariableStatement(node) {
                var startIsEmitted = false;
                if (node.flags & 1 /* Export */) {
                    if (isES6ExportedDeclaration(node)) {
                        // Exported ES6 module member
                        write("export ");
                        startIsEmitted = tryEmitStartOfVariableDeclarationList(node.declarationList);
                    }
                }
                else {
                    startIsEmitted = tryEmitStartOfVariableDeclarationList(node.declarationList);
                }
                if (startIsEmitted) {
                    emitCommaList(node.declarationList.declarations);
                    write(";");
                }
                else {
                    var atLeastOneItem = emitVariableDeclarationListSkippingUninitializedEntries(node.declarationList);
                    if (atLeastOneItem) {
                        write(";");
                    }
                }
                if (languageVersion < 2 /* ES6 */ && node.parent === currentSourceFile) {
                    forEach(node.declarationList.declarations, emitExportVariableAssignments);
                }
            }
            function shouldEmitLeadingAndTrailingCommentsForVariableStatement(node) {
                // If we're not exporting the variables, there's nothing special here.
                // Always emit comments for these nodes.
                if (!(node.flags & 1 /* Export */)) {
                    return true;
                }
                // If we are exporting, but it's a top-level ES6 module exports,
                // we'll emit the declaration list verbatim, so emit comments too.
                if (isES6ExportedDeclaration(node)) {
                    return true;
                }
                // Otherwise, only emit if we have at least one initializer present.
                for (var _a = 0, _b = node.declarationList.declarations; _a < _b.length; _a++) {
                    var declaration = _b[_a];
                    if (declaration.initializer) {
                        return true;
                    }
                }
                return false;
            }
            function emitParameter(node) {
                if (languageVersion < 2 /* ES6 */) {
                    if (ts.isBindingPattern(node.name)) {
                        var name_5 = createTempVariable(0 /* Auto */);
                        if (!tempParameters) {
                            tempParameters = [];
                        }
                        tempParameters.push(name_5);
                        emit(name_5);
                    }
                    else {
                        emit(node.name);
                    }
                }
                else {
                    if (node.dotDotDotToken) {
                        write("...");
                    }
                    emit(node.name);
                    emitOptional(" = ", node.initializer);
                }
            }
            function emitDefaultValueAssignments(node) {
                if (languageVersion < 2 /* ES6 */) {
                    var tempIndex = 0;
                    forEach(node.parameters, function (parameter) {
                        // A rest parameter cannot have a binding pattern or an initializer,
                        // so let's just ignore it.
                        if (parameter.dotDotDotToken) {
                            return;
                        }
                        var paramName = parameter.name, initializer = parameter.initializer;
                        if (ts.isBindingPattern(paramName)) {
                            // In cases where a binding pattern is simply '[]' or '{}',
                            // we usually don't want to emit a var declaration; however, in the presence
                            // of an initializer, we must emit that expression to preserve side effects.
                            var hasBindingElements = paramName.elements.length > 0;
                            if (hasBindingElements || initializer) {
                                writeLine();
                                write("var ");
                                if (hasBindingElements) {
                                    emitDestructuring(parameter, false, tempParameters[tempIndex]);
                                }
                                else {
                                    emit(tempParameters[tempIndex]);
                                    write(" = ");
                                    emit(initializer);
                                }
                                write(";");
                                tempIndex++;
                            }
                        }
                        else if (initializer) {
                            writeLine();
                            emitStart(parameter);
                            write("if (");
                            emitNodeWithoutSourceMap(paramName);
                            write(" === void 0)");
                            emitEnd(parameter);
                            write(" { ");
                            emitStart(parameter);
                            emitNodeWithCommentsAndWithoutSourcemap(paramName);
                            write(" = ");
                            emitNodeWithCommentsAndWithoutSourcemap(initializer);
                            emitEnd(parameter);
                            write("; }");
                        }
                    });
                }
            }
            function emitRestParameter(node) {
                if (languageVersion < 2 /* ES6 */ && ts.hasRestParameter(node)) {
                    var restIndex = node.parameters.length - 1;
                    var restParam = node.parameters[restIndex];
                    // A rest parameter cannot have a binding pattern, so let's just ignore it if it does.
                    if (ts.isBindingPattern(restParam.name)) {
                        return;
                    }
                    var tempName = createTempVariable(268435456 /* _i */).text;
                    writeLine();
                    emitLeadingComments(restParam);
                    emitStart(restParam);
                    write("var ");
                    emitNodeWithCommentsAndWithoutSourcemap(restParam.name);
                    write(" = [];");
                    emitEnd(restParam);
                    emitTrailingComments(restParam);
                    writeLine();
                    write("for (");
                    emitStart(restParam);
                    write("var " + tempName + " = " + restIndex + ";");
                    emitEnd(restParam);
                    write(" ");
                    emitStart(restParam);
                    write(tempName + " < arguments.length;");
                    emitEnd(restParam);
                    write(" ");
                    emitStart(restParam);
                    write(tempName + "++");
                    emitEnd(restParam);
                    write(") {");
                    increaseIndent();
                    writeLine();
                    emitStart(restParam);
                    emitNodeWithCommentsAndWithoutSourcemap(restParam.name);
                    write("[" + tempName + " - " + restIndex + "] = arguments[" + tempName + "];");
                    emitEnd(restParam);
                    decreaseIndent();
                    writeLine();
                    write("}");
                }
            }
            function emitAccessor(node) {
                write(node.kind === 143 /* GetAccessor */ ? "get " : "set ");
                emit(node.name);
                emitSignatureAndBody(node);
            }
            function shouldEmitAsArrowFunction(node) {
                return node.kind === 172 /* ArrowFunction */ && languageVersion >= 2 /* ES6 */;
            }
            function emitDeclarationName(node) {
                if (node.name) {
                    emitNodeWithCommentsAndWithoutSourcemap(node.name);
                }
                else {
                    write(getGeneratedNameForNode(node));
                }
            }
            function shouldEmitFunctionName(node) {
                if (node.kind === 171 /* FunctionExpression */) {
                    // Emit name if one is present
                    return !!node.name;
                }
                if (node.kind === 211 /* FunctionDeclaration */) {
                    // Emit name if one is present, or emit generated name in down-level case (for export default case)
                    return !!node.name || languageVersion < 2 /* ES6 */;
                }
            }
            function emitFunctionDeclaration(node) {
                if (ts.nodeIsMissing(node.body)) {
                    return emitOnlyPinnedOrTripleSlashComments(node);
                }
                // TODO (yuisu) : we should not have special cases to condition emitting comments
                // but have one place to fix check for these conditions.
                if (node.kind !== 141 /* MethodDeclaration */ && node.kind !== 140 /* MethodSignature */ &&
                    node.parent && node.parent.kind !== 243 /* PropertyAssignment */ &&
                    node.parent.kind !== 166 /* CallExpression */) {
                    // 1. Methods will emit the comments as part of emitting method declaration
                    // 2. If the function is a property of object literal, emitting leading-comments
                    // is done by emitNodeWithoutSourceMap which then call this function.
                    // In particular, we would like to avoid emit comments twice in following case:
                    //      For example:
                    //          var obj = {
                    //              id:
                    //                  /*comment*/ () => void
                    //          }
                    // 3. If the function is an argument in call expression, emitting of comments will be
                    // taken care of in emit list of arguments inside of emitCallexpression
                    emitLeadingComments(node);
                }
                emitStart(node);
                // For targeting below es6, emit functions-like declaration including arrow function using function keyword.
                // When targeting ES6, emit arrow function natively in ES6 by omitting function keyword and using fat arrow instead
                if (!shouldEmitAsArrowFunction(node)) {
                    if (isES6ExportedDeclaration(node)) {
                        write("export ");
                        if (node.flags & 1024 /* Default */) {
                            write("default ");
                        }
                    }
                    write("function");
                    if (languageVersion >= 2 /* ES6 */ && node.asteriskToken) {
                        write("*");
                    }
                    write(" ");
                }
                if (shouldEmitFunctionName(node)) {
                    emitDeclarationName(node);
                }
                emitSignatureAndBody(node);
                if (languageVersion < 2 /* ES6 */ && node.kind === 211 /* FunctionDeclaration */ && node.parent === currentSourceFile && node.name) {
                    emitExportMemberAssignments(node.name);
                }
                emitEnd(node);
                if (node.kind !== 141 /* MethodDeclaration */ && node.kind !== 140 /* MethodSignature */) {
                    emitTrailingComments(node);
                }
            }
            function emitCaptureThisForNodeIfNecessary(node) {
                if (resolver.getNodeCheckFlags(node) & 4 /* CaptureThis */) {
                    writeLine();
                    emitStart(node);
                    write("var _this = this;");
                    emitEnd(node);
                }
            }
            function emitSignatureParameters(node) {
                increaseIndent();
                write("(");
                if (node) {
                    var parameters = node.parameters;
                    var omitCount = languageVersion < 2 /* ES6 */ && ts.hasRestParameter(node) ? 1 : 0;
                    emitList(parameters, 0, parameters.length - omitCount, false, false);
                }
                write(")");
                decreaseIndent();
            }
            function emitSignatureParametersForArrow(node) {
                // Check whether the parameter list needs parentheses and preserve no-parenthesis
                if (node.parameters.length === 1 && node.pos === node.parameters[0].pos) {
                    emit(node.parameters[0]);
                    return;
                }
                emitSignatureParameters(node);
            }
            function emitAsyncFunctionBodyForES6(node) {
                var promiseConstructor = ts.getEntityNameFromTypeNode(node.type);
                var isArrowFunction = node.kind === 172 /* ArrowFunction */;
                var hasLexicalArguments = (resolver.getNodeCheckFlags(node) & 4096 /* CaptureArguments */) !== 0;
                var args;
                // An async function is emit as an outer function that calls an inner
                // generator function. To preserve lexical bindings, we pass the current
                // `this` and `arguments` objects to `__awaiter`. The generator function
                // passed to `__awaiter` is executed inside of the callback to the
                // promise constructor.
                //
                // The emit for an async arrow without a lexical `arguments` binding might be:
                //
                //  // input
                //  let a = async (b) => { await b; }
                //
                //  // output
                //  let a = (b) => __awaiter(this, void 0, void 0, function* () {
                //      yield b;
                //  });
                //
                // The emit for an async arrow with a lexical `arguments` binding might be:
                //
                //  // input
                //  let a = async (b) => { await arguments[0]; }
                //
                //  // output
                //  let a = (b) => __awaiter(this, arguments, void 0, function* (arguments) {
                //      yield arguments[0];
                //  });
                //
                // The emit for an async function expression without a lexical `arguments` binding
                // might be:
                //
                //  // input
                //  let a = async function (b) {
                //      await b;
                //  }
                //
                //  // output
                //  let a = function (b) {
                //      return __awaiter(this, void 0, void 0, function* () {
                //          yield b;
                //      });
                //  }
                //
                // The emit for an async function expression with a lexical `arguments` binding
                // might be:
                //
                //  // input
                //  let a = async function (b) {
                //      await arguments[0];
                //  }
                //
                //  // output
                //  let a = function (b) {
                //      return __awaiter(this, arguments, void 0, function* (_arguments) {
                //          yield _arguments[0];
                //      });
                //  }
                //
                // The emit for an async function expression with a lexical `arguments` binding
                // and a return type annotation might be:
                //
                //  // input
                //  let a = async function (b): MyPromise<any> {
                //      await arguments[0];
                //  }
                //
                //  // output
                //  let a = function (b) {
                //      return __awaiter(this, arguments, MyPromise, function* (_arguments) {
                //          yield _arguments[0];
                //      });
                //  }
                //
                // If this is not an async arrow, emit the opening brace of the function body
                // and the start of the return statement.
                if (!isArrowFunction) {
                    write(" {");
                    increaseIndent();
                    writeLine();
                    write("return");
                }
                write(" __awaiter(this");
                if (hasLexicalArguments) {
                    write(", arguments");
                }
                else {
                    write(", void 0");
                }
                if (promiseConstructor) {
                    write(", ");
                    emitNodeWithoutSourceMap(promiseConstructor);
                }
                else {
                    write(", Promise");
                }
                // Emit the call to __awaiter.
                if (hasLexicalArguments) {
                    write(", function* (_arguments)");
                }
                else {
                    write(", function* ()");
                }
                // Emit the signature and body for the inner generator function.
                emitFunctionBody(node);
                write(")");
                // If this is not an async arrow, emit the closing brace of the outer function body.
                if (!isArrowFunction) {
                    write(";");
                    decreaseIndent();
                    writeLine();
                    write("}");
                }
            }
            function emitFunctionBody(node) {
                if (!node.body) {
                    // There can be no body when there are parse errors.  Just emit an empty block
                    // in that case.
                    write(" { }");
                }
                else {
                    if (node.body.kind === 190 /* Block */) {
                        emitBlockFunctionBody(node, node.body);
                    }
                    else {
                        emitExpressionFunctionBody(node, node.body);
                    }
                }
            }
            function emitSignatureAndBody(node) {
                var saveTempFlags = tempFlags;
                var saveTempVariables = tempVariables;
                var saveTempParameters = tempParameters;
                tempFlags = 0;
                tempVariables = undefined;
                tempParameters = undefined;
                // When targeting ES6, emit arrow function natively in ES6
                if (shouldEmitAsArrowFunction(node)) {
                    emitSignatureParametersForArrow(node);
                    write(" =>");
                }
                else {
                    emitSignatureParameters(node);
                }
                var isAsync = ts.isAsyncFunctionLike(node);
                if (isAsync && languageVersion === 2 /* ES6 */) {
                    emitAsyncFunctionBodyForES6(node);
                }
                else {
                    emitFunctionBody(node);
                }
                if (!isES6ExportedDeclaration(node)) {
                    emitExportMemberAssignment(node);
                }
                tempFlags = saveTempFlags;
                tempVariables = saveTempVariables;
                tempParameters = saveTempParameters;
            }
            // Returns true if any preamble code was emitted.
            function emitFunctionBodyPreamble(node) {
                emitCaptureThisForNodeIfNecessary(node);
                emitDefaultValueAssignments(node);
                emitRestParameter(node);
            }
            function emitExpressionFunctionBody(node, body) {
                if (languageVersion < 2 /* ES6 */ || node.flags & 512 /* Async */) {
                    emitDownLevelExpressionFunctionBody(node, body);
                    return;
                }
                // For es6 and higher we can emit the expression as is.  However, in the case
                // where the expression might end up looking like a block when emitted, we'll
                // also wrap it in parentheses first.  For example if you have: a => <foo>{}
                // then we need to generate: a => ({})
                write(" ");
                // Unwrap all type assertions.
                var current = body;
                while (current.kind === 169 /* TypeAssertionExpression */) {
                    current = current.expression;
                }
                emitParenthesizedIf(body, current.kind === 163 /* ObjectLiteralExpression */);
            }
            function emitDownLevelExpressionFunctionBody(node, body) {
                write(" {");
                scopeEmitStart(node);
                increaseIndent();
                var outPos = writer.getTextPos();
                emitDetachedComments(node.body);
                emitFunctionBodyPreamble(node);
                var preambleEmitted = writer.getTextPos() !== outPos;
                decreaseIndent();
                // If we didn't have to emit any preamble code, then attempt to keep the arrow
                // function on one line.
                if (!preambleEmitted && nodeStartPositionsAreOnSameLine(node, body)) {
                    write(" ");
                    emitStart(body);
                    write("return ");
                    emit(body);
                    emitEnd(body);
                    write(";");
                    emitTempDeclarations(false);
                    write(" ");
                }
                else {
                    increaseIndent();
                    writeLine();
                    emitLeadingComments(node.body);
                    write("return ");
                    emit(body);
                    write(";");
                    emitTrailingComments(node.body);
                    emitTempDeclarations(true);
                    decreaseIndent();
                    writeLine();
                }
                emitStart(node.body);
                write("}");
                emitEnd(node.body);
                scopeEmitEnd();
            }
            function emitBlockFunctionBody(node, body) {
                write(" {");
                scopeEmitStart(node);
                var initialTextPos = writer.getTextPos();
                increaseIndent();
                emitDetachedComments(body.statements);
                // Emit all the directive prologues (like "use strict").  These have to come before
                // any other preamble code we write (like parameter initializers).
                var startIndex = emitDirectivePrologues(body.statements, true);
                emitFunctionBodyPreamble(node);
                decreaseIndent();
                var preambleEmitted = writer.getTextPos() !== initialTextPos;
                if (!preambleEmitted && nodeEndIsOnSameLineAsNodeStart(body, body)) {
                    for (var _a = 0, _b = body.statements; _a < _b.length; _a++) {
                        var statement = _b[_a];
                        write(" ");
                        emit(statement);
                    }
                    emitTempDeclarations(false);
                    write(" ");
                    emitLeadingCommentsOfPosition(body.statements.end);
                }
                else {
                    increaseIndent();
                    emitLinesStartingAt(body.statements, startIndex);
                    emitTempDeclarations(true);
                    writeLine();
                    emitLeadingCommentsOfPosition(body.statements.end);
                    decreaseIndent();
                }
                emitToken(16 /* CloseBraceToken */, body.statements.end);
                scopeEmitEnd();
            }
            function findInitialSuperCall(ctor) {
                if (ctor.body) {
                    var statement = ctor.body.statements[0];
                    if (statement && statement.kind === 193 /* ExpressionStatement */) {
                        var expr = statement.expression;
                        if (expr && expr.kind === 166 /* CallExpression */) {
                            var func = expr.expression;
                            if (func && func.kind === 93 /* SuperKeyword */) {
                                return statement;
                            }
                        }
                    }
                }
            }
            function emitParameterPropertyAssignments(node) {
                forEach(node.parameters, function (param) {
                    if (param.flags & 112 /* AccessibilityModifier */) {
                        writeLine();
                        emitStart(param);
                        emitStart(param.name);
                        write("this.");
                        emitNodeWithoutSourceMap(param.name);
                        emitEnd(param.name);
                        write(" = ");
                        emit(param.name);
                        write(";");
                        emitEnd(param);
                    }
                });
            }
            function emitMemberAccessForPropertyName(memberName) {
                // This does not emit source map because it is emitted by caller as caller
                // is aware how the property name changes to the property access
                // eg. public x = 10; becomes this.x and static x = 10 becomes className.x
                if (memberName.kind === 9 /* StringLiteral */ || memberName.kind === 8 /* NumericLiteral */) {
                    write("[");
                    emitNodeWithCommentsAndWithoutSourcemap(memberName);
                    write("]");
                }
                else if (memberName.kind === 134 /* ComputedPropertyName */) {
                    emitComputedPropertyName(memberName);
                }
                else {
                    write(".");
                    emitNodeWithCommentsAndWithoutSourcemap(memberName);
                }
            }
            function getInitializedProperties(node, isStatic) {
                var properties = [];
                for (var _a = 0, _b = node.members; _a < _b.length; _a++) {
                    var member = _b[_a];
                    if (member.kind === 139 /* PropertyDeclaration */ && isStatic === ((member.flags & 128 /* Static */) !== 0) && member.initializer) {
                        properties.push(member);
                    }
                }
                return properties;
            }
            function emitPropertyDeclarations(node, properties) {
                for (var _a = 0; _a < properties.length; _a++) {
                    var property = properties[_a];
                    emitPropertyDeclaration(node, property);
                }
            }
            function emitPropertyDeclaration(node, property, receiver, isExpression) {
                writeLine();
                emitLeadingComments(property);
                emitStart(property);
                emitStart(property.name);
                if (receiver) {
                    emit(receiver);
                }
                else {
                    if (property.flags & 128 /* Static */) {
                        emitDeclarationName(node);
                    }
                    else {
                        write("this");
                    }
                }
                emitMemberAccessForPropertyName(property.name);
                emitEnd(property.name);
                write(" = ");
                emit(property.initializer);
                if (!isExpression) {
                    write(";");
                }
                emitEnd(property);
                emitTrailingComments(property);
            }
            function emitMemberFunctionsForES5AndLower(node) {
                forEach(node.members, function (member) {
                    if (member.kind === 189 /* SemicolonClassElement */) {
                        writeLine();
                        write(";");
                    }
                    else if (member.kind === 141 /* MethodDeclaration */ || node.kind === 140 /* MethodSignature */) {
                        if (!member.body) {
                            return emitOnlyPinnedOrTripleSlashComments(member);
                        }
                        writeLine();
                        emitLeadingComments(member);
                        emitStart(member);
                        emitStart(member.name);
                        emitClassMemberPrefix(node, member);
                        emitMemberAccessForPropertyName(member.name);
                        emitEnd(member.name);
                        write(" = ");
                        emitFunctionDeclaration(member);
                        emitEnd(member);
                        write(";");
                        emitTrailingComments(member);
                    }
                    else if (member.kind === 143 /* GetAccessor */ || member.kind === 144 /* SetAccessor */) {
                        var accessors = ts.getAllAccessorDeclarations(node.members, member);
                        if (member === accessors.firstAccessor) {
                            writeLine();
                            emitStart(member);
                            write("Object.defineProperty(");
                            emitStart(member.name);
                            emitClassMemberPrefix(node, member);
                            write(", ");
                            emitExpressionForPropertyName(member.name);
                            emitEnd(member.name);
                            write(", {");
                            increaseIndent();
                            if (accessors.getAccessor) {
                                writeLine();
                                emitLeadingComments(accessors.getAccessor);
                                write("get: ");
                                emitStart(accessors.getAccessor);
                                write("function ");
                                emitSignatureAndBody(accessors.getAccessor);
                                emitEnd(accessors.getAccessor);
                                emitTrailingComments(accessors.getAccessor);
                                write(",");
                            }
                            if (accessors.setAccessor) {
                                writeLine();
                                emitLeadingComments(accessors.setAccessor);
                                write("set: ");
                                emitStart(accessors.setAccessor);
                                write("function ");
                                emitSignatureAndBody(accessors.setAccessor);
                                emitEnd(accessors.setAccessor);
                                emitTrailingComments(accessors.setAccessor);
                                write(",");
                            }
                            writeLine();
                            write("enumerable: true,");
                            writeLine();
                            write("configurable: true");
                            decreaseIndent();
                            writeLine();
                            write("});");
                            emitEnd(member);
                        }
                    }
                });
            }
            function emitMemberFunctionsForES6AndHigher(node) {
                for (var _a = 0, _b = node.members; _a < _b.length; _a++) {
                    var member = _b[_a];
                    if ((member.kind === 141 /* MethodDeclaration */ || node.kind === 140 /* MethodSignature */) && !member.body) {
                        emitOnlyPinnedOrTripleSlashComments(member);
                    }
                    else if (member.kind === 141 /* MethodDeclaration */ ||
                        member.kind === 143 /* GetAccessor */ ||
                        member.kind === 144 /* SetAccessor */) {
                        writeLine();
                        emitLeadingComments(member);
                        emitStart(member);
                        if (member.flags & 128 /* Static */) {
                            write("static ");
                        }
                        if (member.kind === 143 /* GetAccessor */) {
                            write("get ");
                        }
                        else if (member.kind === 144 /* SetAccessor */) {
                            write("set ");
                        }
                        if (member.asteriskToken) {
                            write("*");
                        }
                        emit(member.name);
                        emitSignatureAndBody(member);
                        emitEnd(member);
                        emitTrailingComments(member);
                    }
                    else if (member.kind === 189 /* SemicolonClassElement */) {
                        writeLine();
                        write(";");
                    }
                }
            }
            function emitConstructor(node, baseTypeElement) {
                var saveTempFlags = tempFlags;
                var saveTempVariables = tempVariables;
                var saveTempParameters = tempParameters;
                tempFlags = 0;
                tempVariables = undefined;
                tempParameters = undefined;
                emitConstructorWorker(node, baseTypeElement);
                tempFlags = saveTempFlags;
                tempVariables = saveTempVariables;
                tempParameters = saveTempParameters;
            }
            function emitConstructorWorker(node, baseTypeElement) {
                // Check if we have property assignment inside class declaration.
                // If there is property assignment, we need to emit constructor whether users define it or not
                // If there is no property assignment, we can omit constructor if users do not define it
                var hasInstancePropertyWithInitializer = false;
                // Emit the constructor overload pinned comments
                forEach(node.members, function (member) {
                    if (member.kind === 142 /* Constructor */ && !member.body) {
                        emitOnlyPinnedOrTripleSlashComments(member);
                    }
                    // Check if there is any non-static property assignment
                    if (member.kind === 139 /* PropertyDeclaration */ && member.initializer && (member.flags & 128 /* Static */) === 0) {
                        hasInstancePropertyWithInitializer = true;
                    }
                });
                var ctor = ts.getFirstConstructorWithBody(node);
                // For target ES6 and above, if there is no user-defined constructor and there is no property assignment
                // do not emit constructor in class declaration.
                if (languageVersion >= 2 /* ES6 */ && !ctor && !hasInstancePropertyWithInitializer) {
                    return;
                }
                if (ctor) {
                    emitLeadingComments(ctor);
                }
                emitStart(ctor || node);
                if (languageVersion < 2 /* ES6 */) {
                    write("function ");
                    emitDeclarationName(node);
                    emitSignatureParameters(ctor);
                }
                else {
                    write("constructor");
                    if (ctor) {
                        emitSignatureParameters(ctor);
                    }
                    else {
                        // Based on EcmaScript6 section 14.5.14: Runtime Semantics: ClassDefinitionEvaluation.
                        // If constructor is empty, then,
                        //      If ClassHeritageopt is present, then
                        //          Let constructor be the result of parsing the String "constructor(... args){ super (...args);}" using the syntactic grammar with the goal symbol MethodDefinition.
                        //      Else,
                        //          Let constructor be the result of parsing the String "constructor( ){ }" using the syntactic grammar with the goal symbol MethodDefinition
                        if (baseTypeElement) {
                            write("(...args)");
                        }
                        else {
                            write("()");
                        }
                    }
                }
                var startIndex = 0;
                write(" {");
                scopeEmitStart(node, "constructor");
                increaseIndent();
                if (ctor) {
                    // Emit all the directive prologues (like "use strict").  These have to come before
                    // any other preamble code we write (like parameter initializers).
                    startIndex = emitDirectivePrologues(ctor.body.statements, true);
                    emitDetachedComments(ctor.body.statements);
                }
                emitCaptureThisForNodeIfNecessary(node);
                var superCall;
                if (ctor) {
                    emitDefaultValueAssignments(ctor);
                    emitRestParameter(ctor);
                    if (baseTypeElement) {
                        superCall = findInitialSuperCall(ctor);
                        if (superCall) {
                            writeLine();
                            emit(superCall);
                        }
                    }
                    emitParameterPropertyAssignments(ctor);
                }
                else {
                    if (baseTypeElement) {
                        writeLine();
                        emitStart(baseTypeElement);
                        if (languageVersion < 2 /* ES6 */) {
                            write("_super.apply(this, arguments);");
                        }
                        else {
                            write("super(...args);");
                        }
                        emitEnd(baseTypeElement);
                    }
                }
                emitPropertyDeclarations(node, getInitializedProperties(node, false));
                if (ctor) {
                    var statements = ctor.body.statements;
                    if (superCall) {
                        statements = statements.slice(1);
                    }
                    emitLinesStartingAt(statements, startIndex);
                }
                emitTempDeclarations(true);
                writeLine();
                if (ctor) {
                    emitLeadingCommentsOfPosition(ctor.body.statements.end);
                }
                decreaseIndent();
                emitToken(16 /* CloseBraceToken */, ctor ? ctor.body.statements.end : node.members.end);
                scopeEmitEnd();
                emitEnd(ctor || node);
                if (ctor) {
                    emitTrailingComments(ctor);
                }
            }
            function emitClassExpression(node) {
                return emitClassLikeDeclaration(node);
            }
            function emitClassDeclaration(node) {
                return emitClassLikeDeclaration(node);
            }
            function emitClassLikeDeclaration(node) {
                if (languageVersion < 2 /* ES6 */) {
                    emitClassLikeDeclarationBelowES6(node);
                }
                else {
                    emitClassLikeDeclarationForES6AndHigher(node);
                }
            }
            function emitClassLikeDeclarationForES6AndHigher(node) {
                var thisNodeIsDecorated = ts.nodeIsDecorated(node);
                if (node.kind === 212 /* ClassDeclaration */) {
                    if (thisNodeIsDecorated) {
                        // To preserve the correct runtime semantics when decorators are applied to the class,
                        // the emit needs to follow one of the following rules:
                        //
                        // * For a local class declaration:
                        //
                        //     @dec class C {
                        //     }
                        //
                        //   The emit should be:
                        //
                        //     let C = class {
                        //     };
                        //     Object.defineProperty(C, "name", { value: "C", configurable: true });
                        //     C = __decorate([dec], C);
                        //
                        // * For an exported class declaration:
                        //
                        //     @dec export class C {
                        //     }
                        //
                        //   The emit should be:
                        //
                        //     export let C = class {
                        //     };
                        //     Object.defineProperty(C, "name", { value: "C", configurable: true });
                        //     C = __decorate([dec], C);
                        //
                        // * For a default export of a class declaration with a name:
                        //
                        //     @dec default export class C {
                        //     }
                        //
                        //   The emit should be:
                        //
                        //     let C = class {
                        //     }
                        //     Object.defineProperty(C, "name", { value: "C", configurable: true });
                        //     C = __decorate([dec], C);
                        //     export default C;
                        //
                        // * For a default export of a class declaration without a name:
                        //
                        //     @dec default export class {
                        //     }
                        //
                        //   The emit should be:
                        //
                        //     let _default = class {
                        //     }
                        //     _default = __decorate([dec], _default);
                        //     export default _default;
                        //
                        if (isES6ExportedDeclaration(node) && !(node.flags & 1024 /* Default */)) {
                            write("export ");
                        }
                        write("let ");
                        emitDeclarationName(node);
                        write(" = ");
                    }
                    else if (isES6ExportedDeclaration(node)) {
                        write("export ");
                        if (node.flags & 1024 /* Default */) {
                            write("default ");
                        }
                    }
                }
                // If the class has static properties, and it's a class expression, then we'll need
                // to specialize the emit a bit.  for a class expression of the form:
                //
                //      class C { static a = 1; static b = 2; ... }
                //
                // We'll emit:
                //
                //      (_temp = class C { ... }, _temp.a = 1, _temp.b = 2, _temp)
                //
                // This keeps the expression as an expression, while ensuring that the static parts
                // of it have been initialized by the time it is used.
                var staticProperties = getInitializedProperties(node, true);
                var isClassExpressionWithStaticProperties = staticProperties.length > 0 && node.kind === 184 /* ClassExpression */;
                var tempVariable;
                if (isClassExpressionWithStaticProperties) {
                    tempVariable = createAndRecordTempVariable(0 /* Auto */);
                    write("(");
                    increaseIndent();
                    emit(tempVariable);
                    write(" = ");
                }
                write("class");
                // check if this is an "export default class" as it may not have a name. Do not emit the name if the class is decorated.
                if ((node.name || !(node.flags & 1024 /* Default */)) && !thisNodeIsDecorated) {
                    write(" ");
                    emitDeclarationName(node);
                }
                var baseTypeNode = ts.getClassExtendsHeritageClauseElement(node);
                if (baseTypeNode) {
                    write(" extends ");
                    emit(baseTypeNode.expression);
                }
                write(" {");
                increaseIndent();
                scopeEmitStart(node);
                writeLine();
                emitConstructor(node, baseTypeNode);
                emitMemberFunctionsForES6AndHigher(node);
                decreaseIndent();
                writeLine();
                emitToken(16 /* CloseBraceToken */, node.members.end);
                scopeEmitEnd();
                // TODO(rbuckton): Need to go back to `let _a = class C {}` approach, removing the defineProperty call for now.
                // For a decorated class, we need to assign its name (if it has one). This is because we emit
                // the class as a class expression to avoid the double-binding of the identifier:
                //
                //   let C = class {
                //   }
                //   Object.defineProperty(C, "name", { value: "C", configurable: true });
                //
                if (thisNodeIsDecorated) {
                    write(";");
                }
                // Emit static property assignment. Because classDeclaration is lexically evaluated,
                // it is safe to emit static property assignment after classDeclaration
                // From ES6 specification:
                //      HasLexicalDeclaration (N) : Determines if the argument identifier has a binding in this environment record that was created using
                //                                  a lexical declaration such as a LexicalDeclaration or a ClassDeclaration.
                if (isClassExpressionWithStaticProperties) {
                    for (var _a = 0; _a < staticProperties.length; _a++) {
                        var property = staticProperties[_a];
                        write(",");
                        writeLine();
                        emitPropertyDeclaration(node, property, tempVariable, true);
                    }
                    write(",");
                    writeLine();
                    emit(tempVariable);
                    decreaseIndent();
                    write(")");
                }
                else {
                    writeLine();
                    emitPropertyDeclarations(node, staticProperties);
                    emitDecoratorsOfClass(node);
                }
                // If this is an exported class, but not on the top level (i.e. on an internal
                // module), export it
                if (!isES6ExportedDeclaration(node) && (node.flags & 1 /* Export */)) {
                    writeLine();
                    emitStart(node);
                    emitModuleMemberName(node);
                    write(" = ");
                    emitDeclarationName(node);
                    emitEnd(node);
                    write(";");
                }
                else if (isES6ExportedDeclaration(node) && (node.flags & 1024 /* Default */) && thisNodeIsDecorated) {
                    // if this is a top level default export of decorated class, write the export after the declaration.
                    writeLine();
                    write("export default ");
                    emitDeclarationName(node);
                    write(";");
                }
            }
            function emitClassLikeDeclarationBelowES6(node) {
                if (node.kind === 212 /* ClassDeclaration */) {
                    // source file level classes in system modules are hoisted so 'var's for them are already defined
                    if (!shouldHoistDeclarationInSystemJsModule(node)) {
                        write("var ");
                    }
                    emitDeclarationName(node);
                    write(" = ");
                }
                write("(function (");
                var baseTypeNode = ts.getClassExtendsHeritageClauseElement(node);
                if (baseTypeNode) {
                    write("_super");
                }
                write(") {");
                var saveTempFlags = tempFlags;
                var saveTempVariables = tempVariables;
                var saveTempParameters = tempParameters;
                var saveComputedPropertyNamesToGeneratedNames = computedPropertyNamesToGeneratedNames;
                tempFlags = 0;
                tempVariables = undefined;
                tempParameters = undefined;
                computedPropertyNamesToGeneratedNames = undefined;
                increaseIndent();
                scopeEmitStart(node);
                if (baseTypeNode) {
                    writeLine();
                    emitStart(baseTypeNode);
                    write("__extends(");
                    emitDeclarationName(node);
                    write(", _super);");
                    emitEnd(baseTypeNode);
                }
                writeLine();
                emitConstructor(node, baseTypeNode);
                emitMemberFunctionsForES5AndLower(node);
                emitPropertyDeclarations(node, getInitializedProperties(node, true));
                writeLine();
                emitDecoratorsOfClass(node);
                writeLine();
                emitToken(16 /* CloseBraceToken */, node.members.end, function () {
                    write("return ");
                    emitDeclarationName(node);
                });
                write(";");
                emitTempDeclarations(true);
                tempFlags = saveTempFlags;
                tempVariables = saveTempVariables;
                tempParameters = saveTempParameters;
                computedPropertyNamesToGeneratedNames = saveComputedPropertyNamesToGeneratedNames;
                decreaseIndent();
                writeLine();
                emitToken(16 /* CloseBraceToken */, node.members.end);
                scopeEmitEnd();
                emitStart(node);
                write(")(");
                if (baseTypeNode) {
                    emit(baseTypeNode.expression);
                }
                write(")");
                if (node.kind === 212 /* ClassDeclaration */) {
                    write(";");
                }
                emitEnd(node);
                if (node.kind === 212 /* ClassDeclaration */) {
                    emitExportMemberAssignment(node);
                }
                if (languageVersion < 2 /* ES6 */ && node.parent === currentSourceFile && node.name) {
                    emitExportMemberAssignments(node.name);
                }
            }
            function emitClassMemberPrefix(node, member) {
                emitDeclarationName(node);
                if (!(member.flags & 128 /* Static */)) {
                    write(".prototype");
                }
            }
            function emitDecoratorsOfClass(node) {
                emitDecoratorsOfMembers(node, 0);
                emitDecoratorsOfMembers(node, 128 /* Static */);
                emitDecoratorsOfConstructor(node);
            }
            function emitDecoratorsOfConstructor(node) {
                var decorators = node.decorators;
                var constructor = ts.getFirstConstructorWithBody(node);
                var hasDecoratedParameters = constructor && forEach(constructor.parameters, ts.nodeIsDecorated);
                // skip decoration of the constructor if neither it nor its parameters are decorated
                if (!decorators && !hasDecoratedParameters) {
                    return;
                }
                // Emit the call to __decorate. Given the class:
                //
                //   @dec
                //   class C {
                //   }
                //
                // The emit for the class is:
                //
                //   C = __decorate([dec], C);
                //
                writeLine();
                emitStart(node);
                emitDeclarationName(node);
                write(" = __decorate([");
                increaseIndent();
                writeLine();
                var decoratorCount = decorators ? decorators.length : 0;
                var argumentsWritten = emitList(decorators, 0, decoratorCount, true, false, false, true, function (decorator) {
                    emitStart(decorator);
                    emit(decorator.expression);
                    emitEnd(decorator);
                });
                argumentsWritten += emitDecoratorsOfParameters(constructor, argumentsWritten > 0);
                emitSerializedTypeMetadata(node, argumentsWritten >= 0);
                decreaseIndent();
                writeLine();
                write("], ");
                emitDeclarationName(node);
                write(");");
                emitEnd(node);
                writeLine();
            }
            function emitDecoratorsOfMembers(node, staticFlag) {
                for (var _a = 0, _b = node.members; _a < _b.length; _a++) {
                    var member = _b[_a];
                    // only emit members in the correct group
                    if ((member.flags & 128 /* Static */) !== staticFlag) {
                        continue;
                    }
                    // skip members that cannot be decorated (such as the constructor)
                    if (!ts.nodeCanBeDecorated(member)) {
                        continue;
                    }
                    // skip a member if it or any of its parameters are not decorated
                    if (!ts.nodeOrChildIsDecorated(member)) {
                        continue;
                    }
                    // skip an accessor declaration if it is not the first accessor
                    var decorators = void 0;
                    var functionLikeMember = void 0;
                    if (ts.isAccessor(member)) {
                        var accessors = ts.getAllAccessorDeclarations(node.members, member);
                        if (member !== accessors.firstAccessor) {
                            continue;
                        }
                        // get the decorators from the first accessor with decorators
                        decorators = accessors.firstAccessor.decorators;
                        if (!decorators && accessors.secondAccessor) {
                            decorators = accessors.secondAccessor.decorators;
                        }
                        // we only decorate parameters of the set accessor
                        functionLikeMember = accessors.setAccessor;
                    }
                    else {
                        decorators = member.decorators;
                        // we only decorate the parameters here if this is a method
                        if (member.kind === 141 /* MethodDeclaration */) {
                            functionLikeMember = member;
                        }
                    }
                    // Emit the call to __decorate. Given the following:
                    //
                    //   class C {
                    //     @dec method(@dec2 x) {}
                    //     @dec get accessor() {}
                    //     @dec prop;
                    //   }
                    //
                    // The emit for a method is:
                    //
                    //   Object.defineProperty(C.prototype, "method",
                    //       __decorate([
                    //           dec,
                    //           __param(0, dec2),
                    //           __metadata("design:type", Function),
                    //           __metadata("design:paramtypes", [Object]),
                    //           __metadata("design:returntype", void 0)
                    //       ], C.prototype, "method", Object.getOwnPropertyDescriptor(C.prototype, "method")));
                    //
                    // The emit for an accessor is:
                    //
                    //   Object.defineProperty(C.prototype, "accessor",
                    //       __decorate([
                    //           dec
                    //       ], C.prototype, "accessor", Object.getOwnPropertyDescriptor(C.prototype, "accessor")));
                    //
                    // The emit for a property is:
                    //
                    //   __decorate([
                    //       dec
                    //   ], C.prototype, "prop");
                    //
                    writeLine();
                    emitStart(member);
                    if (member.kind !== 139 /* PropertyDeclaration */) {
                        write("Object.defineProperty(");
                        emitStart(member.name);
                        emitClassMemberPrefix(node, member);
                        write(", ");
                        emitExpressionForPropertyName(member.name);
                        emitEnd(member.name);
                        write(",");
                        increaseIndent();
                        writeLine();
                    }
                    write("__decorate([");
                    increaseIndent();
                    writeLine();
                    var decoratorCount = decorators ? decorators.length : 0;
                    var argumentsWritten = emitList(decorators, 0, decoratorCount, true, false, false, true, function (decorator) {
                        emitStart(decorator);
                        emit(decorator.expression);
                        emitEnd(decorator);
                    });
                    argumentsWritten += emitDecoratorsOfParameters(functionLikeMember, argumentsWritten > 0);
                    emitSerializedTypeMetadata(member, argumentsWritten > 0);
                    decreaseIndent();
                    writeLine();
                    write("], ");
                    emitStart(member.name);
                    emitClassMemberPrefix(node, member);
                    write(", ");
                    emitExpressionForPropertyName(member.name);
                    emitEnd(member.name);
                    if (member.kind !== 139 /* PropertyDeclaration */) {
                        write(", Object.getOwnPropertyDescriptor(");
                        emitStart(member.name);
                        emitClassMemberPrefix(node, member);
                        write(", ");
                        emitExpressionForPropertyName(member.name);
                        emitEnd(member.name);
                        write("))");
                        decreaseIndent();
                    }
                    write(");");
                    emitEnd(member);
                    writeLine();
                }
            }
            function emitDecoratorsOfParameters(node, leadingComma) {
                var argumentsWritten = 0;
                if (node) {
                    var parameterIndex = 0;
                    for (var _a = 0, _b = node.parameters; _a < _b.length; _a++) {
                        var parameter = _b[_a];
                        if (ts.nodeIsDecorated(parameter)) {
                            var decorators = parameter.decorators;
                            argumentsWritten += emitList(decorators, 0, decorators.length, true, false, leadingComma, true, function (decorator) {
                                emitStart(decorator);
                                write("__param(" + parameterIndex + ", ");
                                emit(decorator.expression);
                                write(")");
                                emitEnd(decorator);
                            });
                            leadingComma = true;
                        }
                        ++parameterIndex;
                    }
                }
                return argumentsWritten;
            }
            function shouldEmitTypeMetadata(node) {
                // This method determines whether to emit the "design:type" metadata based on the node's kind.
                // The caller should have already tested whether the node has decorators and whether the emitDecoratorMetadata
                // compiler option is set.
                switch (node.kind) {
                    case 141 /* MethodDeclaration */:
                    case 143 /* GetAccessor */:
                    case 144 /* SetAccessor */:
                    case 139 /* PropertyDeclaration */:
                        return true;
                }
                return false;
            }
            function shouldEmitReturnTypeMetadata(node) {
                // This method determines whether to emit the "design:returntype" metadata based on the node's kind.
                // The caller should have already tested whether the node has decorators and whether the emitDecoratorMetadata
                // compiler option is set.
                switch (node.kind) {
                    case 141 /* MethodDeclaration */:
                        return true;
                }
                return false;
            }
            function shouldEmitParamTypesMetadata(node) {
                // This method determines whether to emit the "design:paramtypes" metadata based on the node's kind.
                // The caller should have already tested whether the node has decorators and whether the emitDecoratorMetadata
                // compiler option is set.
                switch (node.kind) {
                    case 212 /* ClassDeclaration */:
                    case 141 /* MethodDeclaration */:
                    case 144 /* SetAccessor */:
                        return true;
                }
                return false;
            }
            /** Serializes the type of a declaration to an appropriate JS constructor value. Used by the __metadata decorator for a class member. */
            function emitSerializedTypeOfNode(node) {
                // serialization of the type of a declaration uses the following rules:
                //
                // * The serialized type of a ClassDeclaration is "Function"
                // * The serialized type of a ParameterDeclaration is the serialized type of its type annotation.
                // * The serialized type of a PropertyDeclaration is the serialized type of its type annotation.
                // * The serialized type of an AccessorDeclaration is the serialized type of the return type annotation of its getter or parameter type annotation of its setter.
                // * The serialized type of any other FunctionLikeDeclaration is "Function".
                // * The serialized type of any other node is "void 0".
                //
                // For rules on serializing type annotations, see `serializeTypeNode`.
                switch (node.kind) {
                    case 212 /* ClassDeclaration */:
                        write("Function");
                        return;
                    case 139 /* PropertyDeclaration */:
                        emitSerializedTypeNode(node.type);
                        return;
                    case 136 /* Parameter */:
                        emitSerializedTypeNode(node.type);
                        return;
                    case 143 /* GetAccessor */:
                        emitSerializedTypeNode(node.type);
                        return;
                    case 144 /* SetAccessor */:
                        emitSerializedTypeNode(ts.getSetAccessorTypeAnnotationNode(node));
                        return;
                }
                if (ts.isFunctionLike(node)) {
                    write("Function");
                    return;
                }
                write("void 0");
            }
            function emitSerializedTypeNode(node) {
                if (node) {
                    switch (node.kind) {
                        case 101 /* VoidKeyword */:
                            write("void 0");
                            return;
                        case 158 /* ParenthesizedType */:
                            emitSerializedTypeNode(node.type);
                            return;
                        case 150 /* FunctionType */:
                        case 151 /* ConstructorType */:
                            write("Function");
                            return;
                        case 154 /* ArrayType */:
                        case 155 /* TupleType */:
                            write("Array");
                            return;
                        case 148 /* TypePredicate */:
                        case 118 /* BooleanKeyword */:
                            write("Boolean");
                            return;
                        case 128 /* StringKeyword */:
                        case 9 /* StringLiteral */:
                            write("String");
                            return;
                        case 126 /* NumberKeyword */:
                            write("Number");
                            return;
                        case 129 /* SymbolKeyword */:
                            write("Symbol");
                            return;
                        case 149 /* TypeReference */:
                            emitSerializedTypeReferenceNode(node);
                            return;
                        case 152 /* TypeQuery */:
                        case 153 /* TypeLiteral */:
                        case 156 /* UnionType */:
                        case 157 /* IntersectionType */:
                        case 115 /* AnyKeyword */:
                            break;
                        default:
                            Debug.fail("Cannot serialize unexpected type node.");
                            break;
                    }
                }
                write("Object");
            }
            /** Serializes a TypeReferenceNode to an appropriate JS constructor value. Used by the __metadata decorator. */
            function emitSerializedTypeReferenceNode(node) {
                var location = node.parent;
                while (ts.isDeclaration(location) || ts.isTypeNode(location)) {
                    location = location.parent;
                }
                // Clone the type name and parent it to a location outside of the current declaration.
                var typeName = ts.cloneEntityName(node.typeName);
                typeName.parent = location;
                var result = resolver.getTypeReferenceSerializationKind(typeName);
                switch (result) {
                    case ts.TypeReferenceSerializationKind.Unknown:
                        var temp = createAndRecordTempVariable(0 /* Auto */);
                        write("(typeof (");
                        emitNodeWithoutSourceMap(temp);
                        write(" = ");
                        emitEntityNameAsExpression(typeName, true);
                        write(") === 'function' && ");
                        emitNodeWithoutSourceMap(temp);
                        write(") || Object");
                        break;
                    case ts.TypeReferenceSerializationKind.TypeWithConstructSignatureAndValue:
                        emitEntityNameAsExpression(typeName, false);
                        break;
                    case ts.TypeReferenceSerializationKind.VoidType:
                        write("void 0");
                        break;
                    case ts.TypeReferenceSerializationKind.BooleanType:
                        write("Boolean");
                        break;
                    case ts.TypeReferenceSerializationKind.NumberLikeType:
                        write("Number");
                        break;
                    case ts.TypeReferenceSerializationKind.StringLikeType:
                        write("String");
                        break;
                    case ts.TypeReferenceSerializationKind.ArrayLikeType:
                        write("Array");
                        break;
                    case ts.TypeReferenceSerializationKind.ESSymbolType:
                        if (languageVersion < 2 /* ES6 */) {
                            write("typeof Symbol === 'function' ? Symbol : Object");
                        }
                        else {
                            write("Symbol");
                        }
                        break;
                    case ts.TypeReferenceSerializationKind.TypeWithCallSignature:
                        write("Function");
                        break;
                    case ts.TypeReferenceSerializationKind.ObjectType:
                        write("Object");
                        break;
                }
            }
            /** Serializes the parameter types of a function or the constructor of a class. Used by the __metadata decorator for a method or set accessor. */
            function emitSerializedParameterTypesOfNode(node) {
                // serialization of parameter types uses the following rules:
                //
                // * If the declaration is a class, the parameters of the first constructor with a body are used.
                // * If the declaration is function-like and has a body, the parameters of the function are used.
                //
                // For the rules on serializing the type of each parameter declaration, see `serializeTypeOfDeclaration`.
                if (node) {
                    var valueDeclaration;
                    if (node.kind === 212 /* ClassDeclaration */) {
                        valueDeclaration = ts.getFirstConstructorWithBody(node);
                    }
                    else if (ts.isFunctionLike(node) && ts.nodeIsPresent(node.body)) {
                        valueDeclaration = node;
                    }
                    if (valueDeclaration) {
                        var parameters = valueDeclaration.parameters;
                        var parameterCount = parameters.length;
                        if (parameterCount > 0) {
                            for (var i = 0; i < parameterCount; i++) {
                                if (i > 0) {
                                    write(", ");
                                }
                                if (parameters[i].dotDotDotToken) {
                                    var parameterType = parameters[i].type;
                                    if (parameterType.kind === 154 /* ArrayType */) {
                                        parameterType = parameterType.elementType;
                                    }
                                    else if (parameterType.kind === 149 /* TypeReference */ && parameterType.typeArguments && parameterType.typeArguments.length === 1) {
                                        parameterType = parameterType.typeArguments[0];
                                    }
                                    else {
                                        parameterType = undefined;
                                    }
                                    emitSerializedTypeNode(parameterType);
                                }
                                else {
                                    emitSerializedTypeOfNode(parameters[i]);
                                }
                            }
                        }
                    }
                }
            }
            /** Serializes the return type of function. Used by the __metadata decorator for a method. */
            function emitSerializedReturnTypeOfNode(node) {
                if (node && ts.isFunctionLike(node) && node.type) {
                    emitSerializedTypeNode(node.type);
                    return;
                }
                write("void 0");
            }
            function emitSerializedTypeMetadata(node, writeComma) {
                // This method emits the serialized type metadata for a decorator target.
                // The caller should have already tested whether the node has decorators.
                var argumentsWritten = 0;
                if (compilerOptions.emitDecoratorMetadata) {
                    if (shouldEmitTypeMetadata(node)) {
                        if (writeComma) {
                            write(", ");
                        }
                        writeLine();
                        write("__metadata('design:type', ");
                        emitSerializedTypeOfNode(node);
                        write(")");
                        argumentsWritten++;
                    }
                    if (shouldEmitParamTypesMetadata(node)) {
                        if (writeComma || argumentsWritten) {
                            write(", ");
                        }
                        writeLine();
                        write("__metadata('design:paramtypes', [");
                        emitSerializedParameterTypesOfNode(node);
                        write("])");
                        argumentsWritten++;
                    }
                    if (shouldEmitReturnTypeMetadata(node)) {
                        if (writeComma || argumentsWritten) {
                            write(", ");
                        }
                        writeLine();
                        write("__metadata('design:returntype', ");
                        emitSerializedReturnTypeOfNode(node);
                        write(")");
                        argumentsWritten++;
                    }
                }
                return argumentsWritten;
            }
            function emitInterfaceDeclaration(node) {
                emitOnlyPinnedOrTripleSlashComments(node);
            }
            function shouldEmitEnumDeclaration(node) {
                var isConstEnum = ts.isConst(node);
                return !isConstEnum || compilerOptions.preserveConstEnums || compilerOptions.isolatedModules;
            }
            function emitEnumDeclaration(node) {
                // const enums are completely erased during compilation.
                if (!shouldEmitEnumDeclaration(node)) {
                    return;
                }
                if (!shouldHoistDeclarationInSystemJsModule(node)) {
                    // do not emit var if variable was already hoisted
                    if (!(node.flags & 1 /* Export */) || isES6ExportedDeclaration(node)) {
                        emitStart(node);
                        if (isES6ExportedDeclaration(node)) {
                            write("export ");
                        }
                        write("var ");
                        emit(node.name);
                        emitEnd(node);
                        write(";");
                    }
                }
                writeLine();
                emitStart(node);
                write("(function (");
                emitStart(node.name);
                write(getGeneratedNameForNode(node));
                emitEnd(node.name);
                write(") {");
                increaseIndent();
                scopeEmitStart(node);
                emitLines(node.members);
                decreaseIndent();
                writeLine();
                emitToken(16 /* CloseBraceToken */, node.members.end);
                scopeEmitEnd();
                write(")(");
                emitModuleMemberName(node);
                write(" || (");
                emitModuleMemberName(node);
                write(" = {}));");
                emitEnd(node);
                if (!isES6ExportedDeclaration(node) && node.flags & 1 /* Export */ && !shouldHoistDeclarationInSystemJsModule(node)) {
                    // do not emit var if variable was already hoisted
                    writeLine();
                    emitStart(node);
                    write("var ");
                    emit(node.name);
                    write(" = ");
                    emitModuleMemberName(node);
                    emitEnd(node);
                    write(";");
                }
                if (languageVersion < 2 /* ES6 */ && node.parent === currentSourceFile) {
                    if (compilerOptions.module === 4 /* System */ && (node.flags & 1 /* Export */)) {
                        // write the call to exporter for enum
                        writeLine();
                        write(exportFunctionForFile + "(\"");
                        emitDeclarationName(node);
                        write("\", ");
                        emitDeclarationName(node);
                        write(");");
                    }
                    emitExportMemberAssignments(node.name);
                }
            }
            function emitEnumMember(node) {
                var enumParent = node.parent;
                emitStart(node);
                write(getGeneratedNameForNode(enumParent));
                write("[");
                write(getGeneratedNameForNode(enumParent));
                write("[");
                emitExpressionForPropertyName(node.name);
                write("] = ");
                writeEnumMemberDeclarationValue(node);
                write("] = ");
                emitExpressionForPropertyName(node.name);
                emitEnd(node);
                write(";");
            }
            function writeEnumMemberDeclarationValue(member) {
                var value = resolver.getConstantValue(member);
                if (value !== undefined) {
                    write(value.toString());
                    return;
                }
                else if (member.initializer) {
                    emit(member.initializer);
                }
                else {
                    write("undefined");
                }
            }
            function getInnerMostModuleDeclarationFromDottedModule(moduleDeclaration) {
                if (moduleDeclaration.body.kind === 216 /* ModuleDeclaration */) {
                    var recursiveInnerModule = getInnerMostModuleDeclarationFromDottedModule(moduleDeclaration.body);
                    return recursiveInnerModule || moduleDeclaration.body;
                }
            }
            function shouldEmitModuleDeclaration(node) {
                return ts.isInstantiatedModule(node, compilerOptions.preserveConstEnums || compilerOptions.isolatedModules);
            }
            function isModuleMergedWithES6Class(node) {
                return languageVersion === 2 /* ES6 */ && !!(resolver.getNodeCheckFlags(node) & 32768 /* LexicalModuleMergesWithClass */);
            }
            function emitModuleDeclaration(node) {
                // Emit only if this module is non-ambient.
                var shouldEmit = shouldEmitModuleDeclaration(node);
                if (!shouldEmit) {
                    return emitOnlyPinnedOrTripleSlashComments(node);
                }
                var hoistedInDeclarationScope = shouldHoistDeclarationInSystemJsModule(node);
                var emitVarForModule = !hoistedInDeclarationScope && !isModuleMergedWithES6Class(node);
                if (emitVarForModule) {
                    emitStart(node);
                    if (isES6ExportedDeclaration(node)) {
                        write("export ");
                    }
                    write("var ");
                    emit(node.name);
                    write(";");
                    emitEnd(node);
                    writeLine();
                }
                emitStart(node);
                write("(function (");
                emitStart(node.name);
                write(getGeneratedNameForNode(node));
                emitEnd(node.name);
                write(") ");
                if (node.body.kind === 217 /* ModuleBlock */) {
                    var saveTempFlags = tempFlags;
                    var saveTempVariables = tempVariables;
                    tempFlags = 0;
                    tempVariables = undefined;
                    emit(node.body);
                    tempFlags = saveTempFlags;
                    tempVariables = saveTempVariables;
                }
                else {
                    write("{");
                    increaseIndent();
                    scopeEmitStart(node);
                    emitCaptureThisForNodeIfNecessary(node);
                    writeLine();
                    emit(node.body);
                    decreaseIndent();
                    writeLine();
                    var moduleBlock = getInnerMostModuleDeclarationFromDottedModule(node).body;
                    emitToken(16 /* CloseBraceToken */, moduleBlock.statements.end);
                    scopeEmitEnd();
                }
                write(")(");
                // write moduleDecl = containingModule.m only if it is not exported es6 module member
                if ((node.flags & 1 /* Export */) && !isES6ExportedDeclaration(node)) {
                    emit(node.name);
                    write(" = ");
                }
                emitModuleMemberName(node);
                write(" || (");
                emitModuleMemberName(node);
                write(" = {}));");
                emitEnd(node);
                if (!isES6ExportedDeclaration(node) && node.name.kind === 67 /* Identifier */ && node.parent === currentSourceFile) {
                    if (compilerOptions.module === 4 /* System */ && (node.flags & 1 /* Export */)) {
                        writeLine();
                        write(exportFunctionForFile + "(\"");
                        emitDeclarationName(node);
                        write("\", ");
                        emitDeclarationName(node);
                        write(");");
                    }
                    emitExportMemberAssignments(node.name);
                }
            }
            /*
             * Some bundlers (SystemJS builder) sometimes want to rename dependencies.
             * Here we check if alternative name was provided for a given moduleName and return it if possible.
             */
            function tryRenameExternalModule(moduleName) {
                if (currentSourceFile.renamedDependencies && hasProperty(currentSourceFile.renamedDependencies, moduleName.text)) {
                    return "\"" + currentSourceFile.renamedDependencies[moduleName.text] + "\"";
                }
                return undefined;
            }
            function emitRequire(moduleName) {
                if (moduleName.kind === 9 /* StringLiteral */) {
                    write("require(");
                    var text = tryRenameExternalModule(moduleName);
                    if (text) {
                        write(text);
                    }
                    else {
                        emitStart(moduleName);
                        emitLiteral(moduleName);
                        emitEnd(moduleName);
                    }
                    emitToken(18 /* CloseParenToken */, moduleName.end);
                }
                else {
                    write("require()");
                }
            }
            function getNamespaceDeclarationNode(node) {
                if (node.kind === 219 /* ImportEqualsDeclaration */) {
                    return node;
                }
                var importClause = node.importClause;
                if (importClause && importClause.namedBindings && importClause.namedBindings.kind === 222 /* NamespaceImport */) {
                    return importClause.namedBindings;
                }
            }
            function isDefaultImport(node) {
                return node.kind === 220 /* ImportDeclaration */ && node.importClause && !!node.importClause.name;
            }
            function emitExportImportAssignments(node) {
                if (ts.isAliasSymbolDeclaration(node) && resolver.isValueAliasDeclaration(node)) {
                    emitExportMemberAssignments(node.name);
                }
                ts.forEachChild(node, emitExportImportAssignments);
            }
            function emitImportDeclaration(node) {
                if (languageVersion < 2 /* ES6 */) {
                    return emitExternalImportDeclaration(node);
                }
                // ES6 import
                if (node.importClause) {
                    var shouldEmitDefaultBindings = resolver.isReferencedAliasDeclaration(node.importClause);
                    var shouldEmitNamedBindings = node.importClause.namedBindings && resolver.isReferencedAliasDeclaration(node.importClause.namedBindings, true);
                    if (shouldEmitDefaultBindings || shouldEmitNamedBindings) {
                        write("import ");
                        emitStart(node.importClause);
                        if (shouldEmitDefaultBindings) {
                            emit(node.importClause.name);
                            if (shouldEmitNamedBindings) {
                                write(", ");
                            }
                        }
                        if (shouldEmitNamedBindings) {
                            emitLeadingComments(node.importClause.namedBindings);
                            emitStart(node.importClause.namedBindings);
                            if (node.importClause.namedBindings.kind === 222 /* NamespaceImport */) {
                                write("* as ");
                                emit(node.importClause.namedBindings.name);
                            }
                            else {
                                write("{ ");
                                emitExportOrImportSpecifierList(node.importClause.namedBindings.elements, resolver.isReferencedAliasDeclaration);
                                write(" }");
                            }
                            emitEnd(node.importClause.namedBindings);
                            emitTrailingComments(node.importClause.namedBindings);
                        }
                        emitEnd(node.importClause);
                        write(" from ");
                        emit(node.moduleSpecifier);
                        write(";");
                    }
                }
                else {
                    write("import ");
                    emit(node.moduleSpecifier);
                    write(";");
                }
            }
            function emitExternalImportDeclaration(node) {
                if (contains(externalImports, node)) {
                    var isExportedImport = node.kind === 219 /* ImportEqualsDeclaration */ && (node.flags & 1 /* Export */) !== 0;
                    var namespaceDeclaration = getNamespaceDeclarationNode(node);
                    if (compilerOptions.module !== 2 /* AMD */) {
                        emitLeadingComments(node);
                        emitStart(node);
                        if (namespaceDeclaration && !isDefaultImport(node)) {
                            // import x = require("foo")
                            // import * as x from "foo"
                            if (!isExportedImport)
                                write("var ");
                            emitModuleMemberName(namespaceDeclaration);
                            write(" = ");
                        }
                        else {
                            // import "foo"
                            // import x from "foo"
                            // import { x, y } from "foo"
                            // import d, * as x from "foo"
                            // import d, { x, y } from "foo"
                            var isNakedImport = 220 /* ImportDeclaration */ && !node.importClause;
                            if (!isNakedImport) {
                                write("var ");
                                write(getGeneratedNameForNode(node));
                                write(" = ");
                            }
                        }
                        emitRequire(ts.getExternalModuleName(node));
                        if (namespaceDeclaration && isDefaultImport(node)) {
                            // import d, * as x from "foo"
                            write(", ");
                            emitModuleMemberName(namespaceDeclaration);
                            write(" = ");
                            write(getGeneratedNameForNode(node));
                        }
                        write(";");
                        emitEnd(node);
                        emitExportImportAssignments(node);
                        emitTrailingComments(node);
                    }
                    else {
                        if (isExportedImport) {
                            emitModuleMemberName(namespaceDeclaration);
                            write(" = ");
                            emit(namespaceDeclaration.name);
                            write(";");
                        }
                        else if (namespaceDeclaration && isDefaultImport(node)) {
                            // import d, * as x from "foo"
                            write("var ");
                            emitModuleMemberName(namespaceDeclaration);
                            write(" = ");
                            write(getGeneratedNameForNode(node));
                            write(";");
                        }
                        emitExportImportAssignments(node);
                    }
                }
            }
            function emitImportEqualsDeclaration(node) {
                if (ts.isExternalModuleImportEqualsDeclaration(node)) {
                    emitExternalImportDeclaration(node);
                    return;
                }
                // preserve old compiler's behavior: emit 'var' for import declaration (even if we do not consider them referenced) when
                // - current file is not external module
                // - import declaration is top level and target is value imported by entity name
                if (resolver.isReferencedAliasDeclaration(node) ||
                    (!ts.isExternalModule(currentSourceFile) && resolver.isTopLevelValueImportEqualsWithEntityName(node))) {
                    emitLeadingComments(node);
                    emitStart(node);
                    // variable declaration for import-equals declaration can be hoisted in system modules
                    // in this case 'var' should be omitted and emit should contain only initialization
                    var variableDeclarationIsHoisted = shouldHoistVariable(node, true);
                    // is it top level export import v = a.b.c in system module?
                    // if yes - it needs to be rewritten as exporter('v', v = a.b.c)
                    var isExported = isSourceFileLevelDeclarationInSystemJsModule(node, true);
                    if (!variableDeclarationIsHoisted) {
                        Debug.assert(!isExported);
                        if (isES6ExportedDeclaration(node)) {
                            write("export ");
                            write("var ");
                        }
                        else if (!(node.flags & 1 /* Export */)) {
                            write("var ");
                        }
                    }
                    if (isExported) {
                        write(exportFunctionForFile + "(\"");
                        emitNodeWithoutSourceMap(node.name);
                        write("\", ");
                    }
                    emitModuleMemberName(node);
                    write(" = ");
                    emit(node.moduleReference);
                    if (isExported) {
                        write(")");
                    }
                    write(";");
                    emitEnd(node);
                    emitExportImportAssignments(node);
                    emitTrailingComments(node);
                }
            }
            function emitExportDeclaration(node) {
                Debug.assert(compilerOptions.module !== 4 /* System */);
                if (languageVersion < 2 /* ES6 */) {
                    if (node.moduleSpecifier && (!node.exportClause || resolver.isValueAliasDeclaration(node))) {
                        emitStart(node);
                        var generatedName = getGeneratedNameForNode(node);
                        if (node.exportClause) {
                            // export { x, y, ... } from "foo"
                            if (compilerOptions.module !== 2 /* AMD */) {
                                write("var ");
                                write(generatedName);
                                write(" = ");
                                emitRequire(ts.getExternalModuleName(node));
                                write(";");
                            }
                            for (var _a = 0, _b = node.exportClause.elements; _a < _b.length; _a++) {
                                var specifier = _b[_a];
                                if (resolver.isValueAliasDeclaration(specifier)) {
                                    writeLine();
                                    emitStart(specifier);
                                    emitContainingModuleName(specifier);
                                    write(".");
                                    emitNodeWithCommentsAndWithoutSourcemap(specifier.name);
                                    write(" = ");
                                    write(generatedName);
                                    write(".");
                                    emitNodeWithCommentsAndWithoutSourcemap(specifier.propertyName || specifier.name);
                                    write(";");
                                    emitEnd(specifier);
                                }
                            }
                        }
                        else {
                            // export * from "foo"
                            writeLine();
                            write("__export(");
                            if (compilerOptions.module !== 2 /* AMD */) {
                                emitRequire(ts.getExternalModuleName(node));
                            }
                            else {
                                write(generatedName);
                            }
                            write(");");
                        }
                        emitEnd(node);
                    }
                }
                else {
                    if (!node.exportClause || resolver.isValueAliasDeclaration(node)) {
                        write("export ");
                        if (node.exportClause) {
                            // export { x, y, ... }
                            write("{ ");
                            emitExportOrImportSpecifierList(node.exportClause.elements, resolver.isValueAliasDeclaration);
                            write(" }");
                        }
                        else {
                            write("*");
                        }
                        if (node.moduleSpecifier) {
                            write(" from ");
                            emit(node.moduleSpecifier);
                        }
                        write(";");
                    }
                }
            }
            function emitExportOrImportSpecifierList(specifiers, shouldEmit) {
                Debug.assert(languageVersion >= 2 /* ES6 */);
                var needsComma = false;
                for (var _a = 0; _a < specifiers.length; _a++) {
                    var specifier = specifiers[_a];
                    if (shouldEmit(specifier)) {
                        if (needsComma) {
                            write(", ");
                        }
                        if (specifier.propertyName) {
                            emit(specifier.propertyName);
                            write(" as ");
                        }
                        emit(specifier.name);
                        needsComma = true;
                    }
                }
            }
            function emitExportAssignment(node) {
                if (!node.isExportEquals && resolver.isValueAliasDeclaration(node)) {
                    if (languageVersion >= 2 /* ES6 */) {
                        writeLine();
                        emitStart(node);
                        write("export default ");
                        var expression = node.expression;
                        emit(expression);
                        if (expression.kind !== 211 /* FunctionDeclaration */ &&
                            expression.kind !== 212 /* ClassDeclaration */) {
                            write(";");
                        }
                        emitEnd(node);
                    }
                    else {
                        writeLine();
                        emitStart(node);
                        if (compilerOptions.module === 4 /* System */) {
                            write(exportFunctionForFile + "(\"default\",");
                            emit(node.expression);
                            write(")");
                        }
                        else {
                            emitEs6ExportDefaultCompat(node);
                            emitContainingModuleName(node);
                            if (languageVersion === 0 /* ES3 */) {
                                write("[\"default\"] = ");
                            }
                            else {
                                write(".default = ");
                            }
                            emit(node.expression);
                        }
                        write(";");
                        emitEnd(node);
                    }
                }
            }
            function collectExternalModuleInfo(sourceFile) {
                externalImports = [];
                exportSpecifiers = {};
                exportEquals = undefined;
                hasExportStars = false;
                for (var _a = 0, _b = sourceFile.statements; _a < _b.length; _a++) {
                    var node = _b[_a];
                    switch (node.kind) {
                        case 220 /* ImportDeclaration */:
                            if (!node.importClause ||
                                resolver.isReferencedAliasDeclaration(node.importClause, true)) {
                                // import "mod"
                                // import x from "mod" where x is referenced
                                // import * as x from "mod" where x is referenced
                                // import { x, y } from "mod" where at least one import is referenced
                                externalImports.push(node);
                            }
                            break;
                        case 219 /* ImportEqualsDeclaration */:
                            if (node.moduleReference.kind === 230 /* ExternalModuleReference */ && resolver.isReferencedAliasDeclaration(node)) {
                                // import x = require("mod") where x is referenced
                                externalImports.push(node);
                            }
                            break;
                        case 226 /* ExportDeclaration */:
                            if (node.moduleSpecifier) {
                                if (!node.exportClause) {
                                    // export * from "mod"
                                    externalImports.push(node);
                                    hasExportStars = true;
                                }
                                else if (resolver.isValueAliasDeclaration(node)) {
                                    // export { x, y } from "mod" where at least one export is a value symbol
                                    externalImports.push(node);
                                }
                            }
                            else {
                                // export { x, y }
                                for (var _c = 0, _d = node.exportClause.elements; _c < _d.length; _c++) {
                                    var specifier = _d[_c];
                                    var name_6 = (specifier.propertyName || specifier.name).text;
                                    (exportSpecifiers[name_6] || (exportSpecifiers[name_6] = [])).push(specifier);
                                }
                            }
                            break;
                        case 225 /* ExportAssignment */:
                            if (node.isExportEquals && !exportEquals) {
                                // export = x
                                exportEquals = node;
                            }
                            break;
                    }
                }
            }
            function emitExportStarHelper() {
                if (hasExportStars) {
                    writeLine();
                    write("function __export(m) {");
                    increaseIndent();
                    writeLine();
                    write("for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];");
                    decreaseIndent();
                    writeLine();
                    write("}");
                }
            }
            function getLocalNameForExternalImport(node) {
                var namespaceDeclaration = getNamespaceDeclarationNode(node);
                if (namespaceDeclaration && !isDefaultImport(node)) {
                    return ts.getSourceTextOfNodeFromSourceFile(currentSourceFile, namespaceDeclaration.name);
                }
                if (node.kind === 220 /* ImportDeclaration */ && node.importClause) {
                    return getGeneratedNameForNode(node);
                }
                if (node.kind === 226 /* ExportDeclaration */ && node.moduleSpecifier) {
                    return getGeneratedNameForNode(node);
                }
            }
            function getExternalModuleNameText(importNode) {
                var moduleName = ts.getExternalModuleName(importNode);
                if (moduleName.kind === 9 /* StringLiteral */) {
                    return tryRenameExternalModule(moduleName) || getLiteralText(moduleName);
                }
                return undefined;
            }
            function emitVariableDeclarationsForImports() {
                if (externalImports.length === 0) {
                    return;
                }
                writeLine();
                var started = false;
                for (var _a = 0; _a < externalImports.length; _a++) {
                    var importNode = externalImports[_a];
                    // do not create variable declaration for exports and imports that lack import clause
                    var skipNode = importNode.kind === 226 /* ExportDeclaration */ ||
                        (importNode.kind === 220 /* ImportDeclaration */ && !importNode.importClause);
                    if (skipNode) {
                        continue;
                    }
                    if (!started) {
                        write("var ");
                        started = true;
                    }
                    else {
                        write(", ");
                    }
                    write(getLocalNameForExternalImport(importNode));
                }
                if (started) {
                    write(";");
                }
            }
            function emitLocalStorageForExportedNamesIfNecessary(exportedDeclarations) {
                // when resolving exports local exported entries/indirect exported entries in the module
                // should always win over entries with similar names that were added via star exports
                // to support this we store names of local/indirect exported entries in a set.
                // this set is used to filter names brought by star expors.
                if (!hasExportStars) {
                    // local names set is needed only in presence of star exports
                    return undefined;
                }
                // local names set should only be added if we have anything exported
                if (!exportedDeclarations && isEmpty(exportSpecifiers)) {
                    // no exported declarations (export var ...) or export specifiers (export {x})
                    // check if we have any non star export declarations.
                    var hasExportDeclarationWithExportClause = false;
                    for (var _a = 0; _a < externalImports.length; _a++) {
                        var externalImport = externalImports[_a];
                        if (externalImport.kind === 226 /* ExportDeclaration */ && externalImport.exportClause) {
                            hasExportDeclarationWithExportClause = true;
                            break;
                        }
                    }
                    if (!hasExportDeclarationWithExportClause) {
                        // we still need to emit exportStar helper
                        return emitExportStarFunction(undefined);
                    }
                }
                var exportedNamesStorageRef = makeUniqueName("exportedNames");
                writeLine();
                write("var " + exportedNamesStorageRef + " = {");
                increaseIndent();
                var started = false;
                if (exportedDeclarations) {
                    for (var i = 0; i < exportedDeclarations.length; ++i) {
                        // write name of exported declaration, i.e 'export var x...'
                        writeExportedName(exportedDeclarations[i]);
                    }
                }
                if (exportSpecifiers) {
                    for (var n in exportSpecifiers) {
                        for (var _b = 0, _c = exportSpecifiers[n]; _b < _c.length; _b++) {
                            var specifier = _c[_b];
                            // write name of export specified, i.e. 'export {x}'
                            writeExportedName(specifier.name);
                        }
                    }
                }
                for (var _d = 0; _d < externalImports.length; _d++) {
                    var externalImport = externalImports[_d];
                    if (externalImport.kind !== 226 /* ExportDeclaration */) {
                        continue;
                    }
                    var exportDecl = externalImport;
                    if (!exportDecl.exportClause) {
                        // export * from ...
                        continue;
                    }
                    for (var _e = 0, _f = exportDecl.exportClause.elements; _e < _f.length; _e++) {
                        var element = _f[_e];
                        // write name of indirectly exported entry, i.e. 'export {x} from ...'
                        writeExportedName(element.name || element.propertyName);
                    }
                }
                decreaseIndent();
                writeLine();
                write("};");
                return emitExportStarFunction(exportedNamesStorageRef);
                function emitExportStarFunction(localNames) {
                    var exportStarFunction = makeUniqueName("exportStar");
                    writeLine();
                    // define an export star helper function
                    write("function " + exportStarFunction + "(m) {");
                    increaseIndent();
                    writeLine();
                    write("var exports = {};");
                    writeLine();
                    write("for(var n in m) {");
                    increaseIndent();
                    writeLine();
                    write("if (n !== \"default\"");
                    if (localNames) {
                        write("&& !" + localNames + ".hasOwnProperty(n)");
                    }
                    write(") exports[n] = m[n];");
                    decreaseIndent();
                    writeLine();
                    write("}");
                    writeLine();
                    write(exportFunctionForFile + "(exports);");
                    decreaseIndent();
                    writeLine();
                    write("}");
                    return exportStarFunction;
                }
                function writeExportedName(node) {
                    // do not record default exports
                    // they are local to module and never overwritten (explicitly skipped) by star export
                    if (node.kind !== 67 /* Identifier */ && node.flags & 1024 /* Default */) {
                        return;
                    }
                    if (started) {
                        write(",");
                    }
                    else {
                        started = true;
                    }
                    writeLine();
                    write("'");
                    if (node.kind === 67 /* Identifier */) {
                        emitNodeWithCommentsAndWithoutSourcemap(node);
                    }
                    else {
                        emitDeclarationName(node);
                    }
                    write("': true");
                }
            }
            function processTopLevelVariableAndFunctionDeclarations(node) {
                // per ES6 spec:
                // 15.2.1.16.4 ModuleDeclarationInstantiation() Concrete Method
                // - var declarations are initialized to undefined - 14.a.ii
                // - function/generator declarations are instantiated - 16.a.iv
                // this means that after module is instantiated but before its evaluation
                // exported functions are already accessible at import sites
                // in theory we should hoist only exported functions and its dependencies
                // in practice to simplify things we'll hoist all source level functions and variable declaration
                // including variables declarations for module and class declarations
                var hoistedVars;
                var hoistedFunctionDeclarations;
                var exportedDeclarations;
                visit(node);
                if (hoistedVars) {
                    writeLine();
                    write("var ");
                    var seen = {};
                    for (var i = 0; i < hoistedVars.length; ++i) {
                        var local = hoistedVars[i];
                        var name_7 = local.kind === 67 /* Identifier */
                            ? local
                            : local.name;
                        if (name_7) {
                            // do not emit duplicate entries (in case of declaration merging) in the list of hoisted variables
                            var text = ts.unescapeIdentifier(name_7.text);
                            if (hasProperty(seen, text)) {
                                continue;
                            }
                            else {
                                seen[text] = text;
                            }
                        }
                        if (i !== 0) {
                            write(", ");
                        }
                        if (local.kind === 212 /* ClassDeclaration */ || local.kind === 216 /* ModuleDeclaration */ || local.kind === 215 /* EnumDeclaration */) {
                            emitDeclarationName(local);
                        }
                        else {
                            emit(local);
                        }
                        var flags = ts.getCombinedNodeFlags(local.kind === 67 /* Identifier */ ? local.parent : local);
                        if (flags & 1 /* Export */) {
                            if (!exportedDeclarations) {
                                exportedDeclarations = [];
                            }
                            exportedDeclarations.push(local);
                        }
                    }
                    write(";");
                }
                if (hoistedFunctionDeclarations) {
                    for (var _a = 0; _a < hoistedFunctionDeclarations.length; _a++) {
                        var f = hoistedFunctionDeclarations[_a];
                        writeLine();
                        emit(f);
                        if (f.flags & 1 /* Export */) {
                            if (!exportedDeclarations) {
                                exportedDeclarations = [];
                            }
                            exportedDeclarations.push(f);
                        }
                    }
                }
                return exportedDeclarations;
                function visit(node) {
                    if (node.flags & 2 /* Ambient */) {
                        return;
                    }
                    if (node.kind === 211 /* FunctionDeclaration */) {
                        if (!hoistedFunctionDeclarations) {
                            hoistedFunctionDeclarations = [];
                        }
                        hoistedFunctionDeclarations.push(node);
                        return;
                    }
                    if (node.kind === 212 /* ClassDeclaration */) {
                        if (!hoistedVars) {
                            hoistedVars = [];
                        }
                        hoistedVars.push(node);
                        return;
                    }
                    if (node.kind === 215 /* EnumDeclaration */) {
                        if (shouldEmitEnumDeclaration(node)) {
                            if (!hoistedVars) {
                                hoistedVars = [];
                            }
                            hoistedVars.push(node);
                        }
                        return;
                    }
                    if (node.kind === 216 /* ModuleDeclaration */) {
                        if (shouldEmitModuleDeclaration(node)) {
                            if (!hoistedVars) {
                                hoistedVars = [];
                            }
                            hoistedVars.push(node);
                        }
                        return;
                    }
                    if (node.kind === 209 /* VariableDeclaration */ || node.kind === 161 /* BindingElement */) {
                        if (shouldHoistVariable(node, false)) {
                            var name_8 = node.name;
                            if (name_8.kind === 67 /* Identifier */) {
                                if (!hoistedVars) {
                                    hoistedVars = [];
                                }
                                hoistedVars.push(name_8);
                            }
                            else {
                                ts.forEachChild(name_8, visit);
                            }
                        }
                        return;
                    }
                    if (ts.isInternalModuleImportEqualsDeclaration(node) && resolver.isValueAliasDeclaration(node)) {
                        if (!hoistedVars) {
                            hoistedVars = [];
                        }
                        hoistedVars.push(node.name);
                        return;
                    }
                    if (ts.isBindingPattern(node)) {
                        forEach(node.elements, visit);
                        return;
                    }
                    if (!ts.isDeclaration(node)) {
                        ts.forEachChild(node, visit);
                    }
                }
            }
            function shouldHoistVariable(node, checkIfSourceFileLevelDecl) {
                if (checkIfSourceFileLevelDecl && !shouldHoistDeclarationInSystemJsModule(node)) {
                    return false;
                }
                // hoist variable if
                // - it is not block scoped
                // - it is top level block scoped
                // if block scoped variables are nested in some another block then
                // no other functions can use them except ones that are defined at least in the same block
                return (ts.getCombinedNodeFlags(node) & 49152 /* BlockScoped */) === 0 ||
                    ts.getEnclosingBlockScopeContainer(node).kind === 246 /* SourceFile */;
            }
            function isCurrentFileSystemExternalModule() {
                return compilerOptions.module === 4 /* System */ && ts.isExternalModule(currentSourceFile);
            }
            function emitSystemModuleBody(node, dependencyGroups, startIndex) {
                // shape of the body in system modules:
                // function (exports) {
                //     <list of local aliases for imports>
                //     <hoisted function declarations>
                //     <hoisted variable declarations>
                //     return {
                //         setters: [
                //             <list of setter function for imports>
                //         ],
                //         execute: function() {
                //             <module statements>
                //         }
                //     }
                //     <temp declarations>
                // }
                // I.e:
                // import {x} from 'file1'
                // var y = 1;
                // export function foo() { return y + x(); }
                // console.log(y);
                // will be transformed to
                // function(exports) {
                //     var file1; // local alias
                //     var y;
                //     function foo() { return y + file1.x(); }
                //     exports("foo", foo);
                //     return {
                //         setters: [
                //             function(v) { file1 = v }
                //         ],
                //         execute(): function() {
                //             y = 1;
                //             console.log(y);
                //         }
                //     };
                // }
                emitVariableDeclarationsForImports();
                writeLine();
                var exportedDeclarations = processTopLevelVariableAndFunctionDeclarations(node);
                var exportStarFunction = emitLocalStorageForExportedNamesIfNecessary(exportedDeclarations);
                writeLine();
                write("return {");
                increaseIndent();
                writeLine();
                emitSetters(exportStarFunction, dependencyGroups);
                writeLine();
                emitExecute(node, startIndex);
                decreaseIndent();
                writeLine();
                write("}"); // return
                emitTempDeclarations(true);
            }
            function emitSetters(exportStarFunction, dependencyGroups) {
                write("setters:[");
                for (var i = 0; i < dependencyGroups.length; ++i) {
                    if (i !== 0) {
                        write(",");
                    }
                    writeLine();
                    increaseIndent();
                    var group = dependencyGroups[i];
                    // derive a unique name for parameter from the first named entry in the group
                    var parameterName = makeUniqueName(forEach(group, getLocalNameForExternalImport) || "");
                    write("function (" + parameterName + ") {");
                    increaseIndent();
                    for (var _a = 0; _a < group.length; _a++) {
                        var entry = group[_a];
                        var importVariableName = getLocalNameForExternalImport(entry) || "";
                        switch (entry.kind) {
                            case 220 /* ImportDeclaration */:
                                if (!entry.importClause) {
                                    // 'import "..."' case
                                    // module is imported only for side-effects, no emit required
                                    break;
                                }
                            // fall-through
                            case 219 /* ImportEqualsDeclaration */:
                                Debug.assert(importVariableName !== "");
                                writeLine();
                                // save import into the local
                                write(importVariableName + " = " + parameterName + ";");
                                writeLine();
                                break;
                            case 226 /* ExportDeclaration */:
                                Debug.assert(importVariableName !== "");
                                if (entry.exportClause) {
                                    // export {a, b as c} from 'foo'
                                    // emit as:
                                    // exports_({
                                    //    "a": _["a"],
                                    //    "c": _["b"]
                                    // });
                                    writeLine();
                                    write(exportFunctionForFile + "({");
                                    writeLine();
                                    increaseIndent();
                                    for (var i_2 = 0, len = entry.exportClause.elements.length; i_2 < len; ++i_2) {
                                        if (i_2 !== 0) {
                                            write(",");
                                            writeLine();
                                        }
                                        var e = entry.exportClause.elements[i_2];
                                        write("\"");
                                        emitNodeWithCommentsAndWithoutSourcemap(e.name);
                                        write("\": " + parameterName + "[\"");
                                        emitNodeWithCommentsAndWithoutSourcemap(e.propertyName || e.name);
                                        write("\"]");
                                    }
                                    decreaseIndent();
                                    writeLine();
                                    write("});");
                                }
                                else {
                                    writeLine();
                                    // export * from 'foo'
                                    // emit as:
                                    // exportStar(_foo);
                                    write(exportStarFunction + "(" + parameterName + ");");
                                }
                                writeLine();
                                break;
                        }
                    }
                    decreaseIndent();
                    write("}");
                    decreaseIndent();
                }
                write("],");
            }
            function emitExecute(node, startIndex) {
                write("execute: function() {");
                increaseIndent();
                writeLine();
                for (var i = startIndex; i < node.statements.length; ++i) {
                    var statement = node.statements[i];
                    switch (statement.kind) {
                        // - function declarations are not emitted because they were already hoisted
                        // - import declarations are not emitted since they are already handled in setters
                        // - export declarations with module specifiers are not emitted since they were already written in setters
                        // - export declarations without module specifiers are emitted preserving the order
                        case 211 /* FunctionDeclaration */:
                        case 220 /* ImportDeclaration */:
                            continue;
                        case 226 /* ExportDeclaration */:
                            if (!statement.moduleSpecifier) {
                                for (var _a = 0, _b = statement.exportClause.elements; _a < _b.length; _a++) {
                                    var element = _b[_a];
                                    // write call to exporter function for every export specifier in exports list
                                    emitExportSpecifierInSystemModule(element);
                                }
                            }
                            continue;
                        case 219 /* ImportEqualsDeclaration */:
                            if (!ts.isInternalModuleImportEqualsDeclaration(statement)) {
                                // - import equals declarations that import external modules are not emitted
                                continue;
                            }
                        // fall-though for import declarations that import internal modules
                        default:
                            writeLine();
                            emit(statement);
                    }
                }
                decreaseIndent();
                writeLine();
                write("}"); // execute
            }
            function emitSystemModule(node, startIndex) {
                collectExternalModuleInfo(node);
                // System modules has the following shape
                // System.register(['dep-1', ... 'dep-n'], function(exports) {/* module body function */})
                // 'exports' here is a function 'exports<T>(name: string, value: T): T' that is used to publish exported values.
                // 'exports' returns its 'value' argument so in most cases expressions
                // that mutate exported values can be rewritten as:
                // expr -> exports('name', expr).
                // The only exception in this rule is postfix unary operators,
                // see comment to 'emitPostfixUnaryExpression' for more details
                Debug.assert(!exportFunctionForFile);
                // make sure that  name of 'exports' function does not conflict with existing identifiers
                exportFunctionForFile = makeUniqueName("exports");
                writeLine();
                write("System.register(");
                if (node.moduleName) {
                    write("\"" + node.moduleName + "\", ");
                }
                write("[");
                var groupIndices = {};
                var dependencyGroups = [];
                for (var i = 0; i < externalImports.length; ++i) {
                    var text = getExternalModuleNameText(externalImports[i]);
                    if (hasProperty(groupIndices, text)) {
                        // deduplicate/group entries in dependency list by the dependency name
                        var groupIndex = groupIndices[text];
                        dependencyGroups[groupIndex].push(externalImports[i]);
                        continue;
                    }
                    else {
                        groupIndices[text] = dependencyGroups.length;
                        dependencyGroups.push([externalImports[i]]);
                    }
                    if (i !== 0) {
                        write(", ");
                    }
                    write(text);
                }
                write("], function(" + exportFunctionForFile + ") {");
                writeLine();
                increaseIndent();
                emitEmitHelpers(node);
                emitCaptureThisForNodeIfNecessary(node);
                emitSystemModuleBody(node, dependencyGroups, startIndex);
                decreaseIndent();
                writeLine();
                write("});");
            }
            function emitAMDDependencies(node, includeNonAmdDependencies) {
                // An AMD define function has the following shape:
                //     define(id?, dependencies?, factory);
                //
                // This has the shape of
                //     define(name, ["module1", "module2"], function (module1Alias) {
                // The location of the alias in the parameter list in the factory function needs to
                // match the position of the module name in the dependency list.
                //
                // To ensure this is true in cases of modules with no aliases, e.g.:
                // `import "module"` or `<amd-dependency path= "a.css" />`
                // we need to add modules without alias names to the end of the dependencies list
                // names of modules with corresponding parameter in the factory function
                var aliasedModuleNames = [];
                // names of modules with no corresponding parameters in factory function
                var unaliasedModuleNames = [];
                var importAliasNames = []; // names of the parameters in the factory function; these
                // parameters need to match the indexes of the corresponding
                // module names in aliasedModuleNames.
                // Fill in amd-dependency tags
                for (var _a = 0, _b = node.amdDependencies; _a < _b.length; _a++) {
                    var amdDependency = _b[_a];
                    if (amdDependency.name) {
                        aliasedModuleNames.push("\"" + amdDependency.path + "\"");
                        importAliasNames.push(amdDependency.name);
                    }
                    else {
                        unaliasedModuleNames.push("\"" + amdDependency.path + "\"");
                    }
                }
                for (var _c = 0; _c < externalImports.length; _c++) {
                    var importNode = externalImports[_c];
                    // Find the name of the external module
                    var externalModuleName = getExternalModuleNameText(importNode);
                    // Find the name of the module alias, if there is one
                    var importAliasName = getLocalNameForExternalImport(importNode);
                    if (includeNonAmdDependencies && importAliasName) {
                        aliasedModuleNames.push(externalModuleName);
                        importAliasNames.push(importAliasName);
                    }
                    else {
                        unaliasedModuleNames.push(externalModuleName);
                    }
                }
                write("[\"require\", \"exports\"");
                if (aliasedModuleNames.length) {
                    write(", ");
                    write(aliasedModuleNames.join(", "));
                }
                if (unaliasedModuleNames.length) {
                    write(", ");
                    write(unaliasedModuleNames.join(", "));
                }
                write("], function (require, exports");
                if (importAliasNames.length) {
                    write(", ");
                    write(importAliasNames.join(", "));
                }
            }
            function emitAMDModule(node, startIndex) {
                emitEmitHelpers(node);
                collectExternalModuleInfo(node);
                writeLine();
                write("define(");
                if (node.moduleName) {
                    write("\"" + node.moduleName + "\", ");
                }
                emitAMDDependencies(node, true);
                write(") {");
                increaseIndent();
                emitExportStarHelper();
                emitCaptureThisForNodeIfNecessary(node);
                emitLinesStartingAt(node.statements, startIndex);
                emitTempDeclarations(true);
                emitExportEquals(true);
                decreaseIndent();
                writeLine();
                write("});");
            }
            function emitCommonJSModule(node, startIndex) {
                emitEmitHelpers(node);
                collectExternalModuleInfo(node);
                emitExportStarHelper();
                emitCaptureThisForNodeIfNecessary(node);
                emitLinesStartingAt(node.statements, startIndex);
                emitTempDeclarations(true);
                emitExportEquals(false);
            }
            function emitUMDModule(node, startIndex) {
                emitEmitHelpers(node);
                collectExternalModuleInfo(node);
                // Module is detected first to support Browserify users that load into a browser with an AMD loader
                writeLines("(function (deps, factory) {\n    if (typeof module === 'object' && typeof module.exports === 'object') {\n        var v = factory(require, exports); if (v !== undefined) module.exports = v;\n    }\n    else if (typeof define === 'function' && define.amd) {\n        define(deps, factory);\n    }\n})(");
                emitAMDDependencies(node, false);
                write(") {");
                increaseIndent();
                emitExportStarHelper();
                emitCaptureThisForNodeIfNecessary(node);
                emitLinesStartingAt(node.statements, startIndex);
                emitTempDeclarations(true);
                emitExportEquals(true);
                decreaseIndent();
                writeLine();
                write("});");
            }
            function emitES6Module(node, startIndex) {
                externalImports = undefined;
                exportSpecifiers = undefined;
                exportEquals = undefined;
                hasExportStars = false;
                emitEmitHelpers(node);
                emitCaptureThisForNodeIfNecessary(node);
                emitLinesStartingAt(node.statements, startIndex);
                emitTempDeclarations(true);
                // Emit exportDefault if it exists will happen as part
                // or normal statement emit.
            }
            function emitExportEquals(emitAsReturn) {
                if (exportEquals && resolver.isValueAliasDeclaration(exportEquals)) {
                    writeLine();
                    emitStart(exportEquals);
                    write(emitAsReturn ? "return " : "module.exports = ");
                    emit(exportEquals.expression);
                    write(";");
                    emitEnd(exportEquals);
                }
            }
            function emitJsxElement(node) {
                switch (compilerOptions.jsx) {
                    case 2 /* React */:
                        jsxEmitReact(node);
                        break;
                    case 1 /* Preserve */:
                    // Fall back to preserve if None was specified (we'll error earlier)
                    default:
                        jsxEmitPreserve(node);
                        break;
                }
            }
            function trimReactWhitespaceAndApplyEntities(node) {
                var result = undefined;
                var text = ts.getTextOfNode(node, true);
                var firstNonWhitespace = 0;
                var lastNonWhitespace = -1;
                // JSX trims whitespace at the end and beginning of lines, except that the
                // start/end of a tag is considered a start/end of a line only if that line is
                // on the same line as the closing tag. See examples in tests/cases/conformance/jsx/tsxReactEmitWhitespace.tsx
                for (var i = 0; i < text.length; i++) {
                    var c = text.charCodeAt(i);
                    if (ts.isLineBreak(c)) {
                        if (firstNonWhitespace !== -1 && (lastNonWhitespace - firstNonWhitespace + 1 > 0)) {
                            var part = text.substr(firstNonWhitespace, lastNonWhitespace - firstNonWhitespace + 1);
                            result = (result ? result + "\" + ' ' + \"" : "") + part;
                        }
                        firstNonWhitespace = -1;
                    }
                    else if (!ts.isWhiteSpace(c)) {
                        lastNonWhitespace = i;
                        if (firstNonWhitespace === -1) {
                            firstNonWhitespace = i;
                        }
                    }
                }
                if (firstNonWhitespace !== -1) {
                    var part = text.substr(firstNonWhitespace);
                    result = (result ? result + "\" + ' ' + \"" : "") + part;
                }
                if (result) {
                    // Replace entities like &nbsp;
                    result = result.replace(/&(\w+);/g, function (s, m) {
                        if (entities[m] !== undefined) {
                            return String.fromCharCode(entities[m]);
                        }
                        else {
                            return s;
                        }
                    });
                }
                return result;
            }
            function getTextToEmit(node) {
                switch (compilerOptions.jsx) {
                    case 2 /* React */:
                        var text = trimReactWhitespaceAndApplyEntities(node);
                        if (text === undefined || text.length === 0) {
                            return undefined;
                        }
                        else {
                            return text;
                        }
                    case 1 /* Preserve */:
                    default:
                        return ts.getTextOfNode(node, true);
                }
            }
            function emitJsxText(node) {
                switch (compilerOptions.jsx) {
                    case 2 /* React */:
                        write("\"");
                        write(trimReactWhitespaceAndApplyEntities(node));
                        write("\"");
                        break;
                    case 1 /* Preserve */:
                    default:
                        writer.writeLiteral(ts.getTextOfNode(node, true));
                        break;
                }
            }
            function emitJsxExpression(node) {
                if (node.expression) {
                    switch (compilerOptions.jsx) {
                        case 1 /* Preserve */:
                        default:
                            write("{");
                            emit(node.expression);
                            write("}");
                            break;
                        case 2 /* React */:
                            emit(node.expression);
                            break;
                    }
                }
            }
            function emitDirectivePrologues(statements, startWithNewLine) {
                for (var i = 0; i < statements.length; ++i) {
                    if (ts.isPrologueDirective(statements[i])) {
                        if (startWithNewLine || i > 0) {
                            writeLine();
                        }
                        emit(statements[i]);
                    }
                    else {
                        // return index of the first non prologue directive
                        return i;
                    }
                }
                return statements.length;
            }
            function writeLines(text) {
                var lines = text.split(/\r\n|\r|\n/g);
                for (var i = 0; i < lines.length; ++i) {
                    var line = lines[i];
                    if (line.length) {
                        writeLine();
                        write(line);
                    }
                }
            }
            function emitEmitHelpers(node) {
                // Only emit helpers if the user did not say otherwise.
                if (!compilerOptions.noEmitHelpers) {
                    // Only Emit __extends function when target ES5.
                    // For target ES6 and above, we can emit classDeclaration as is.
                    if ((languageVersion < 2 /* ES6 */) && (!extendsEmitted && resolver.getNodeCheckFlags(node) & 8 /* EmitExtends */)) {
                        writeLines(extendsHelper);
                        extendsEmitted = true;
                    }
                    if (!decorateEmitted && resolver.getNodeCheckFlags(node) & 16 /* EmitDecorate */) {
                        writeLines(decorateHelper);
                        if (compilerOptions.emitDecoratorMetadata) {
                            writeLines(metadataHelper);
                        }
                        decorateEmitted = true;
                    }
                    if (!paramEmitted && resolver.getNodeCheckFlags(node) & 32 /* EmitParam */) {
                        writeLines(paramHelper);
                        paramEmitted = true;
                    }
                    if (!awaiterEmitted && resolver.getNodeCheckFlags(node) & 64 /* EmitAwaiter */) {
                        writeLines(awaiterHelper);
                        awaiterEmitted = true;
                    }
                }
            }
            function emitSourceFileNode(node) {
                // Start new file on new line
                writeLine();
                emitShebang();
                emitDetachedComments(node);
                // emit prologue directives prior to __extends
                var startIndex = emitDirectivePrologues(node.statements, false);
                if (ts.isExternalModule(node) || compilerOptions.isolatedModules) {
                    if (languageVersion >= 2 /* ES6 */) {
                        emitES6Module(node, startIndex);
                    }
                    else if (compilerOptions.module === 2 /* AMD */) {
                        emitAMDModule(node, startIndex);
                    }
                    else if (compilerOptions.module === 4 /* System */) {
                        emitSystemModule(node, startIndex);
                    }
                    else if (compilerOptions.module === 3 /* UMD */) {
                        emitUMDModule(node, startIndex);
                    }
                    else {
                        emitCommonJSModule(node, startIndex);
                    }
                }
                else {
                    externalImports = undefined;
                    exportSpecifiers = undefined;
                    exportEquals = undefined;
                    hasExportStars = false;
                    emitEmitHelpers(node);
                    emitCaptureThisForNodeIfNecessary(node);
                    emitLinesStartingAt(node.statements, startIndex);
                    emitTempDeclarations(true);
                }
                emitLeadingComments(node.endOfFileToken);
            }
            function emitNodeWithCommentsAndWithoutSourcemap(node) {
                emitNodeConsideringCommentsOption(node, emitNodeWithoutSourceMap);
            }
            function emitNodeConsideringCommentsOption(node, emitNodeConsideringSourcemap) {
                if (node) {
                    if (node.flags & 2 /* Ambient */) {
                        return emitOnlyPinnedOrTripleSlashComments(node);
                    }
                    if (isSpecializedCommentHandling(node)) {
                        // This is the node that will handle its own comments and sourcemap
                        return emitNodeWithoutSourceMap(node);
                    }
                    var emitComments_1 = shouldEmitLeadingAndTrailingComments(node);
                    if (emitComments_1) {
                        emitLeadingComments(node);
                    }
                    emitNodeConsideringSourcemap(node);
                    if (emitComments_1) {
                        emitTrailingComments(node);
                    }
                }
            }
            function emitNodeWithoutSourceMap(node) {
                if (node) {
                    emitJavaScriptWorker(node);
                }
            }
            function isSpecializedCommentHandling(node) {
                switch (node.kind) {
                    // All of these entities are emitted in a specialized fashion.  As such, we allow
                    // the specialized methods for each to handle the comments on the nodes.
                    case 213 /* InterfaceDeclaration */:
                    case 211 /* FunctionDeclaration */:
                    case 220 /* ImportDeclaration */:
                    case 219 /* ImportEqualsDeclaration */:
                    case 214 /* TypeAliasDeclaration */:
                    case 225 /* ExportAssignment */:
                        return true;
                }
            }
            function shouldEmitLeadingAndTrailingComments(node) {
                switch (node.kind) {
                    case 191 /* VariableStatement */:
                        return shouldEmitLeadingAndTrailingCommentsForVariableStatement(node);
                    case 216 /* ModuleDeclaration */:
                        // Only emit the leading/trailing comments for a module if we're actually
                        // emitting the module as well.
                        return shouldEmitModuleDeclaration(node);
                    case 215 /* EnumDeclaration */:
                        // Only emit the leading/trailing comments for an enum if we're actually
                        // emitting the module as well.
                        return shouldEmitEnumDeclaration(node);
                }
                // If the node is emitted in specialized fashion, dont emit comments as this node will handle 
                // emitting comments when emitting itself
                Debug.assert(!isSpecializedCommentHandling(node));
                // If this is the expression body of an arrow function that we're down-leveling,
                // then we don't want to emit comments when we emit the body.  It will have already
                // been taken care of when we emitted the 'return' statement for the function
                // expression body.
                if (node.kind !== 190 /* Block */ &&
                    node.parent &&
                    node.parent.kind === 172 /* ArrowFunction */ &&
                    node.parent.body === node &&
                    compilerOptions.target <= 1 /* ES5 */) {
                    return false;
                }
                // Emit comments for everything else.
                return true;
            }
            function emitJavaScriptWorker(node) {
                // Check if the node can be emitted regardless of the ScriptTarget
                switch (node.kind) {
                    case 67 /* Identifier */:
                        return emitIdentifier(node);
                    case 136 /* Parameter */:
                        return emitParameter(node);
                    case 141 /* MethodDeclaration */:
                    case 140 /* MethodSignature */:
                        return emitMethod(node);
                    case 143 /* GetAccessor */:
                    case 144 /* SetAccessor */:
                        return emitAccessor(node);
                    case 95 /* ThisKeyword */:
                        return emitThis(node);
                    case 93 /* SuperKeyword */:
                        return emitSuper(node);
                    case 91 /* NullKeyword */:
                        return write("null");
                    case 97 /* TrueKeyword */:
                        return write("true");
                    case 82 /* FalseKeyword */:
                        return write("false");
                    case 8 /* NumericLiteral */:
                    case 9 /* StringLiteral */:
                    case 10 /* RegularExpressionLiteral */:
                    case 11 /* NoSubstitutionTemplateLiteral */:
                    case 12 /* TemplateHead */:
                    case 13 /* TemplateMiddle */:
                    case 14 /* TemplateTail */:
                        return emitLiteral(node);
                    case 181 /* TemplateExpression */:
                        return emitTemplateExpression(node);
                    case 188 /* TemplateSpan */:
                        return emitTemplateSpan(node);
                    case 231 /* JsxElement */:
                    case 232 /* JsxSelfClosingElement */:
                        return emitJsxElement(node);
                    case 234 /* JsxText */:
                        return emitJsxText(node);
                    case 238 /* JsxExpression */:
                        return emitJsxExpression(node);
                    case 133 /* QualifiedName */:
                        return emitQualifiedName(node);
                    case 159 /* ObjectBindingPattern */:
                        return emitObjectBindingPattern(node);
                    case 160 /* ArrayBindingPattern */:
                        return emitArrayBindingPattern(node);
                    case 161 /* BindingElement */:
                        return emitBindingElement(node);
                    case 162 /* ArrayLiteralExpression */:
                        return emitArrayLiteral(node);
                    case 163 /* ObjectLiteralExpression */:
                        return emitObjectLiteral(node);
                    case 243 /* PropertyAssignment */:
                        return emitPropertyAssignment(node);
                    case 244 /* ShorthandPropertyAssignment */:
                        return emitShorthandPropertyAssignment(node);
                    case 134 /* ComputedPropertyName */:
                        return emitComputedPropertyName(node);
                    case 164 /* PropertyAccessExpression */:
                        return emitPropertyAccess(node);
                    case 165 /* ElementAccessExpression */:
                        return emitIndexedAccess(node);
                    case 166 /* CallExpression */:
                        return emitCallExpression(node);
                    case 167 /* NewExpression */:
                        return emitNewExpression(node);
                    case 168 /* TaggedTemplateExpression */:
                        return emitTaggedTemplateExpression(node);
                    case 169 /* TypeAssertionExpression */:
                        return emit(node.expression);
                    case 187 /* AsExpression */:
                        return emit(node.expression);
                    case 170 /* ParenthesizedExpression */:
                        return emitParenExpression(node);
                    case 211 /* FunctionDeclaration */:
                    case 171 /* FunctionExpression */:
                    case 172 /* ArrowFunction */:
                        return emitFunctionDeclaration(node);
                    case 173 /* DeleteExpression */:
                        return emitDeleteExpression(node);
                    case 174 /* TypeOfExpression */:
                        return emitTypeOfExpression(node);
                    case 175 /* VoidExpression */:
                        return emitVoidExpression(node);
                    case 176 /* AwaitExpression */:
                        return emitAwaitExpression(node);
                    case 177 /* PrefixUnaryExpression */:
                        return emitPrefixUnaryExpression(node);
                    case 178 /* PostfixUnaryExpression */:
                        return emitPostfixUnaryExpression(node);
                    case 179 /* BinaryExpression */:
                        return emitBinaryExpression(node);
                    case 180 /* ConditionalExpression */:
                        return emitConditionalExpression(node);
                    case 183 /* SpreadElementExpression */:
                        return emitSpreadElementExpression(node);
                    case 182 /* YieldExpression */:
                        return emitYieldExpression(node);
                    case 185 /* OmittedExpression */:
                        return;
                    case 190 /* Block */:
                    case 217 /* ModuleBlock */:
                        return emitBlock(node);
                    case 191 /* VariableStatement */:
                        return emitVariableStatement(node);
                    case 192 /* EmptyStatement */:
                        return write(";");
                    case 193 /* ExpressionStatement */:
                        return emitExpressionStatement(node);
                    case 194 /* IfStatement */:
                        return emitIfStatement(node);
                    case 195 /* DoStatement */:
                        return emitDoStatement(node);
                    case 196 /* WhileStatement */:
                        return emitWhileStatement(node);
                    case 197 /* ForStatement */:
                        return emitForStatement(node);
                    case 199 /* ForOfStatement */:
                    case 198 /* ForInStatement */:
                        return emitForInOrForOfStatement(node);
                    case 200 /* ContinueStatement */:
                    case 201 /* BreakStatement */:
                        return emitBreakOrContinueStatement(node);
                    case 202 /* ReturnStatement */:
                        return emitReturnStatement(node);
                    case 203 /* WithStatement */:
                        return emitWithStatement(node);
                    case 204 /* SwitchStatement */:
                        return emitSwitchStatement(node);
                    case 239 /* CaseClause */:
                    case 240 /* DefaultClause */:
                        return emitCaseOrDefaultClause(node);
                    case 205 /* LabeledStatement */:
                        return emitLabelledStatement(node);
                    case 206 /* ThrowStatement */:
                        return emitThrowStatement(node);
                    case 207 /* TryStatement */:
                        return emitTryStatement(node);
                    case 242 /* CatchClause */:
                        return emitCatchClause(node);
                    case 208 /* DebuggerStatement */:
                        return emitDebuggerStatement(node);
                    case 209 /* VariableDeclaration */:
                        return emitVariableDeclaration(node);
                    case 184 /* ClassExpression */:
                        return emitClassExpression(node);
                    case 212 /* ClassDeclaration */:
                        return emitClassDeclaration(node);
                    case 213 /* InterfaceDeclaration */:
                        return emitInterfaceDeclaration(node);
                    case 215 /* EnumDeclaration */:
                        return emitEnumDeclaration(node);
                    case 245 /* EnumMember */:
                        return emitEnumMember(node);
                    case 216 /* ModuleDeclaration */:
                        return emitModuleDeclaration(node);
                    case 220 /* ImportDeclaration */:
                        return emitImportDeclaration(node);
                    case 219 /* ImportEqualsDeclaration */:
                        return emitImportEqualsDeclaration(node);
                    case 226 /* ExportDeclaration */:
                        return emitExportDeclaration(node);
                    case 225 /* ExportAssignment */:
                        return emitExportAssignment(node);
                    case 246 /* SourceFile */:
                        return emitSourceFileNode(node);
                }
            }
            function hasDetachedComments(pos) {
                return detachedCommentsInfo !== undefined && lastOrUndefined(detachedCommentsInfo).nodePos === pos;
            }
            function getLeadingCommentsWithoutDetachedComments() {
                // get the leading comments from detachedPos
                var leadingComments = ts.getLeadingCommentRanges(currentSourceFile.text, lastOrUndefined(detachedCommentsInfo).detachedCommentEndPos);
                if (detachedCommentsInfo.length - 1) {
                    detachedCommentsInfo.pop();
                }
                else {
                    detachedCommentsInfo = undefined;
                }
                return leadingComments;
            }
            /**
             * Removes all but the pinned or triple slash comments.
             * @param ranges The array to be filtered
             * @param onlyPinnedOrTripleSlashComments whether the filtering should be performed.
             */
            function filterComments(ranges, onlyPinnedOrTripleSlashComments) {
                // If we're removing comments, then we want to strip out all but the pinned or
                // triple slash comments.
                if (ranges && onlyPinnedOrTripleSlashComments) {
                    ranges = filter(ranges, isPinnedOrTripleSlashComment);
                    if (ranges.length === 0) {
                        return undefined;
                    }
                }
                return ranges;
            }
            function getLeadingCommentsToEmit(node) {
                // Emit the leading comments only if the parent's pos doesn't match because parent should take care of emitting these comments
                if (node.parent) {
                    if (node.parent.kind === 246 /* SourceFile */ || node.pos !== node.parent.pos) {
                        if (hasDetachedComments(node.pos)) {
                            // get comments without detached comments
                            return getLeadingCommentsWithoutDetachedComments();
                        }
                        else {
                            // get the leading comments from the node
                            return ts.getLeadingCommentRangesOfNode(node, currentSourceFile);
                        }
                    }
                }
            }
            function getTrailingCommentsToEmit(node) {
                // Emit the trailing comments only if the parent's pos doesn't match because parent should take care of emitting these comments
                if (node.parent) {
                    if (node.parent.kind === 246 /* SourceFile */ || node.end !== node.parent.end) {
                        return ts.getTrailingCommentRanges(currentSourceFile.text, node.end);
                    }
                }
            }
            function emitOnlyPinnedOrTripleSlashComments(node) {
                emitLeadingCommentsWorker(node, true);
            }
            function emitLeadingComments(node) {
                return emitLeadingCommentsWorker(node, compilerOptions.removeComments);
            }
            function emitLeadingCommentsWorker(node, onlyPinnedOrTripleSlashComments) {
                // If the caller only wants pinned or triple slash comments, then always filter
                // down to that set.  Otherwise, filter based on the current compiler options.
                var leadingComments = filterComments(getLeadingCommentsToEmit(node), onlyPinnedOrTripleSlashComments);
                ts.emitNewLineBeforeLeadingComments(currentSourceFile, writer, node, leadingComments);
                // Leading comments are emitted at /*leading comment1 */space/*leading comment*/space
                ts.emitComments(currentSourceFile, writer, leadingComments, true, newLine, writeComment);
            }
            function emitTrailingComments(node) {
                // Emit the trailing comments only if the parent's end doesn't match
                var trailingComments = filterComments(getTrailingCommentsToEmit(node), compilerOptions.removeComments);
                // trailing comments are emitted at space/*trailing comment1 */space/*trailing comment*/
                ts.emitComments(currentSourceFile, writer, trailingComments, false, newLine, writeComment);
            }
            /**
             * Emit trailing comments at the position. The term trailing comment is used here to describe following comment:
             *      x, /comment1/ y
             *        ^ => pos; the function will emit "comment1" in the emitJS
             */
            function emitTrailingCommentsOfPosition(pos) {
                var trailingComments = filterComments(ts.getTrailingCommentRanges(currentSourceFile.text, pos), compilerOptions.removeComments);
                // trailing comments are emitted at space/*trailing comment1 */space/*trailing comment*/
                ts.emitComments(currentSourceFile, writer, trailingComments, true, newLine, writeComment);
            }
            function emitLeadingCommentsOfPosition(pos) {
                var leadingComments;
                if (hasDetachedComments(pos)) {
                    // get comments without detached comments
                    leadingComments = getLeadingCommentsWithoutDetachedComments();
                }
                else {
                    // get the leading comments from the node
                    leadingComments = ts.getLeadingCommentRanges(currentSourceFile.text, pos);
                }
                leadingComments = filterComments(leadingComments, compilerOptions.removeComments);
                ts.emitNewLineBeforeLeadingComments(currentSourceFile, writer, { pos: pos, end: pos }, leadingComments);
                // Leading comments are emitted at /*leading comment1 */space/*leading comment*/space
                ts.emitComments(currentSourceFile, writer, leadingComments, true, newLine, writeComment);
            }
            function emitDetachedComments(node) {
                var leadingComments = ts.getLeadingCommentRanges(currentSourceFile.text, node.pos);
                if (leadingComments) {
                    var detachedComments = [];
                    var lastComment;
                    forEach(leadingComments, function (comment) {
                        if (lastComment) {
                            var lastCommentLine = ts.getLineOfLocalPosition(currentSourceFile, lastComment.end);
                            var commentLine = ts.getLineOfLocalPosition(currentSourceFile, comment.pos);
                            if (commentLine >= lastCommentLine + 2) {
                                // There was a blank line between the last comment and this comment.  This
                                // comment is not part of the copyright comments.  Return what we have so
                                // far.
                                return detachedComments;
                            }
                        }
                        detachedComments.push(comment);
                        lastComment = comment;
                    });
                    if (detachedComments.length) {
                        // All comments look like they could have been part of the copyright header.  Make
                        // sure there is at least one blank line between it and the node.  If not, it's not
                        // a copyright header.
                        var lastCommentLine = ts.getLineOfLocalPosition(currentSourceFile, lastOrUndefined(detachedComments).end);
                        var nodeLine = ts.getLineOfLocalPosition(currentSourceFile, ts.skipTrivia(currentSourceFile.text, node.pos));
                        if (nodeLine >= lastCommentLine + 2) {
                            // Valid detachedComments
                            ts.emitNewLineBeforeLeadingComments(currentSourceFile, writer, node, leadingComments);
                            ts.emitComments(currentSourceFile, writer, detachedComments, true, newLine, writeComment);
                            var currentDetachedCommentInfo = { nodePos: node.pos, detachedCommentEndPos: lastOrUndefined(detachedComments).end };
                            if (detachedCommentsInfo) {
                                detachedCommentsInfo.push(currentDetachedCommentInfo);
                            }
                            else {
                                detachedCommentsInfo = [currentDetachedCommentInfo];
                            }
                        }
                    }
                }
            }
            function emitShebang() {
                var shebang = ts.getShebang(currentSourceFile.text);
                if (shebang) {
                    write(shebang);
                }
            }
            function isPinnedOrTripleSlashComment(comment) {
                if (currentSourceFile.text.charCodeAt(comment.pos + 1) === 42 /* asterisk */) {
                    return currentSourceFile.text.charCodeAt(comment.pos + 2) === 33 /* exclamation */;
                }
                else if (currentSourceFile.text.charCodeAt(comment.pos + 1) === 47 /* slash */ &&
                    comment.pos + 2 < comment.end &&
                    currentSourceFile.text.charCodeAt(comment.pos + 2) === 47 /* slash */ &&
                    currentSourceFile.text.substring(comment.pos, comment.end).match(ts.fullTripleSlashReferencePathRegEx)) {
                    return true;
                }
            }
        }
        function emitFile(jsFilePath, sourceFile) {
            emitJavaScript(jsFilePath, sourceFile);
            if (compilerOptions.declaration) {
                ts.writeDeclarationFile(jsFilePath, sourceFile, host, resolver, diagnostics);
            }
        }
    }
    ts.emitFiles = emitFiles;
    var entities = {
        "quot": 0x0022,
        "amp": 0x0026,
        "apos": 0x0027,
        "lt": 0x003C,
        "gt": 0x003E,
        "nbsp": 0x00A0,
        "iexcl": 0x00A1,
        "cent": 0x00A2,
        "pound": 0x00A3,
        "curren": 0x00A4,
        "yen": 0x00A5,
        "brvbar": 0x00A6,
        "sect": 0x00A7,
        "uml": 0x00A8,
        "copy": 0x00A9,
        "ordf": 0x00AA,
        "laquo": 0x00AB,
        "not": 0x00AC,
        "shy": 0x00AD,
        "reg": 0x00AE,
        "macr": 0x00AF,
        "deg": 0x00B0,
        "plusmn": 0x00B1,
        "sup2": 0x00B2,
        "sup3": 0x00B3,
        "acute": 0x00B4,
        "micro": 0x00B5,
        "para": 0x00B6,
        "middot": 0x00B7,
        "cedil": 0x00B8,
        "sup1": 0x00B9,
        "ordm": 0x00BA,
        "raquo": 0x00BB,
        "frac14": 0x00BC,
        "frac12": 0x00BD,
        "frac34": 0x00BE,
        "iquest": 0x00BF,
        "Agrave": 0x00C0,
        "Aacute": 0x00C1,
        "Acirc": 0x00C2,
        "Atilde": 0x00C3,
        "Auml": 0x00C4,
        "Aring": 0x00C5,
        "AElig": 0x00C6,
        "Ccedil": 0x00C7,
        "Egrave": 0x00C8,
        "Eacute": 0x00C9,
        "Ecirc": 0x00CA,
        "Euml": 0x00CB,
        "Igrave": 0x00CC,
        "Iacute": 0x00CD,
        "Icirc": 0x00CE,
        "Iuml": 0x00CF,
        "ETH": 0x00D0,
        "Ntilde": 0x00D1,
        "Ograve": 0x00D2,
        "Oacute": 0x00D3,
        "Ocirc": 0x00D4,
        "Otilde": 0x00D5,
        "Ouml": 0x00D6,
        "times": 0x00D7,
        "Oslash": 0x00D8,
        "Ugrave": 0x00D9,
        "Uacute": 0x00DA,
        "Ucirc": 0x00DB,
        "Uuml": 0x00DC,
        "Yacute": 0x00DD,
        "THORN": 0x00DE,
        "szlig": 0x00DF,
        "agrave": 0x00E0,
        "aacute": 0x00E1,
        "acirc": 0x00E2,
        "atilde": 0x00E3,
        "auml": 0x00E4,
        "aring": 0x00E5,
        "aelig": 0x00E6,
        "ccedil": 0x00E7,
        "egrave": 0x00E8,
        "eacute": 0x00E9,
        "ecirc": 0x00EA,
        "euml": 0x00EB,
        "igrave": 0x00EC,
        "iacute": 0x00ED,
        "icirc": 0x00EE,
        "iuml": 0x00EF,
        "eth": 0x00F0,
        "ntilde": 0x00F1,
        "ograve": 0x00F2,
        "oacute": 0x00F3,
        "ocirc": 0x00F4,
        "otilde": 0x00F5,
        "ouml": 0x00F6,
        "divide": 0x00F7,
        "oslash": 0x00F8,
        "ugrave": 0x00F9,
        "uacute": 0x00FA,
        "ucirc": 0x00FB,
        "uuml": 0x00FC,
        "yacute": 0x00FD,
        "thorn": 0x00FE,
        "yuml": 0x00FF,
        "OElig": 0x0152,
        "oelig": 0x0153,
        "Scaron": 0x0160,
        "scaron": 0x0161,
        "Yuml": 0x0178,
        "fnof": 0x0192,
        "circ": 0x02C6,
        "tilde": 0x02DC,
        "Alpha": 0x0391,
        "Beta": 0x0392,
        "Gamma": 0x0393,
        "Delta": 0x0394,
        "Epsilon": 0x0395,
        "Zeta": 0x0396,
        "Eta": 0x0397,
        "Theta": 0x0398,
        "Iota": 0x0399,
        "Kappa": 0x039A,
        "Lambda": 0x039B,
        "Mu": 0x039C,
        "Nu": 0x039D,
        "Xi": 0x039E,
        "Omicron": 0x039F,
        "Pi": 0x03A0,
        "Rho": 0x03A1,
        "Sigma": 0x03A3,
        "Tau": 0x03A4,
        "Upsilon": 0x03A5,
        "Phi": 0x03A6,
        "Chi": 0x03A7,
        "Psi": 0x03A8,
        "Omega": 0x03A9,
        "alpha": 0x03B1,
        "beta": 0x03B2,
        "gamma": 0x03B3,
        "delta": 0x03B4,
        "epsilon": 0x03B5,
        "zeta": 0x03B6,
        "eta": 0x03B7,
        "theta": 0x03B8,
        "iota": 0x03B9,
        "kappa": 0x03BA,
        "lambda": 0x03BB,
        "mu": 0x03BC,
        "nu": 0x03BD,
        "xi": 0x03BE,
        "omicron": 0x03BF,
        "pi": 0x03C0,
        "rho": 0x03C1,
        "sigmaf": 0x03C2,
        "sigma": 0x03C3,
        "tau": 0x03C4,
        "upsilon": 0x03C5,
        "phi": 0x03C6,
        "chi": 0x03C7,
        "psi": 0x03C8,
        "omega": 0x03C9,
        "thetasym": 0x03D1,
        "upsih": 0x03D2,
        "piv": 0x03D6,
        "ensp": 0x2002,
        "emsp": 0x2003,
        "thinsp": 0x2009,
        "zwnj": 0x200C,
        "zwj": 0x200D,
        "lrm": 0x200E,
        "rlm": 0x200F,
        "ndash": 0x2013,
        "mdash": 0x2014,
        "lsquo": 0x2018,
        "rsquo": 0x2019,
        "sbquo": 0x201A,
        "ldquo": 0x201C,
        "rdquo": 0x201D,
        "bdquo": 0x201E,
        "dagger": 0x2020,
        "Dagger": 0x2021,
        "bull": 0x2022,
        "hellip": 0x2026,
        "permil": 0x2030,
        "prime": 0x2032,
        "Prime": 0x2033,
        "lsaquo": 0x2039,
        "rsaquo": 0x203A,
        "oline": 0x203E,
        "frasl": 0x2044,
        "euro": 0x20AC,
        "image": 0x2111,
        "weierp": 0x2118,
        "real": 0x211C,
        "trade": 0x2122,
        "alefsym": 0x2135,
        "larr": 0x2190,
        "uarr": 0x2191,
        "rarr": 0x2192,
        "darr": 0x2193,
        "harr": 0x2194,
        "crarr": 0x21B5,
        "lArr": 0x21D0,
        "uArr": 0x21D1,
        "rArr": 0x21D2,
        "dArr": 0x21D3,
        "hArr": 0x21D4,
        "forall": 0x2200,
        "part": 0x2202,
        "exist": 0x2203,
        "empty": 0x2205,
        "nabla": 0x2207,
        "isin": 0x2208,
        "notin": 0x2209,
        "ni": 0x220B,
        "prod": 0x220F,
        "sum": 0x2211,
        "minus": 0x2212,
        "lowast": 0x2217,
        "radic": 0x221A,
        "prop": 0x221D,
        "infin": 0x221E,
        "ang": 0x2220,
        "and": 0x2227,
        "or": 0x2228,
        "cap": 0x2229,
        "cup": 0x222A,
        "int": 0x222B,
        "there4": 0x2234,
        "sim": 0x223C,
        "cong": 0x2245,
        "asymp": 0x2248,
        "ne": 0x2260,
        "equiv": 0x2261,
        "le": 0x2264,
        "ge": 0x2265,
        "sub": 0x2282,
        "sup": 0x2283,
        "nsub": 0x2284,
        "sube": 0x2286,
        "supe": 0x2287,
        "oplus": 0x2295,
        "otimes": 0x2297,
        "perp": 0x22A5,
        "sdot": 0x22C5,
        "lceil": 0x2308,
        "rceil": 0x2309,
        "lfloor": 0x230A,
        "rfloor": 0x230B,
        "lang": 0x2329,
        "rang": 0x232A,
        "loz": 0x25CA,
        "spades": 0x2660,
        "clubs": 0x2663,
        "hearts": 0x2665,
        "diams": 0x2666
    };
})(ts || (ts = {}));
