/*
 * Copyright (C) 2015 Everlaw
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var SEK = ts.ScriptElementKind;
var builtinLibs = {};
var HostImpl = (function () {
    function HostImpl() {
        this.version = 0;
        this.files = {};
        this.config = {};
    }
    HostImpl.prototype.log = function (s) {
        process.stdout.write('L' + JSON.stringify(s) + '\n');
    };
    HostImpl.prototype.getCompilationSettings = function () {
        var settings = Object.create(this.config);
        if (this.config.noImplicitAny == null) {
            // report implicit-any errors anyway, but only as warnings (see getDiagnostics)
            settings.noImplicitAny = true;
        }
        return settings;
    };
    HostImpl.prototype.getProjectVersion = function () {
        return String(this.version);
    };
    HostImpl.prototype.getScriptFileNames = function () {
        return Object.keys(this.files);
    };
    HostImpl.prototype.getScriptVersion = function (fileName) {
        if (fileName in builtinLibs) {
            return "0";
        }
        return this.files[fileName] && this.files[fileName].version;
    };
    HostImpl.prototype.getScriptSnapshot = function (fileName) {
        if (fileName in builtinLibs) {
            return new SnapshotImpl(builtinLibs[fileName]);
        }
        return this.files[fileName] && this.files[fileName].snapshot;
    };
    HostImpl.prototype.getCurrentDirectory = function () {
        return "";
    };
    HostImpl.prototype.getDefaultLibFileName = function (options) {
        return "(builtin) " + ts.getDefaultLibFileName(options);
    };
    return HostImpl;
})();
var SnapshotImpl = (function () {
    function SnapshotImpl(text) {
        this.text = text;
    }
    SnapshotImpl.prototype.getText = function (start, end) {
        return this.text.substring(start, end);
    };
    SnapshotImpl.prototype.getLength = function () {
        return this.text.length;
    };
    SnapshotImpl.prototype.getChangeRange = function (oldSnapshot) {
        var newText = this.text, oldText = oldSnapshot.text;
        var newEnd = newText.length, oldEnd = oldText.length;
        while (newEnd > 0 && oldEnd > 0 && newText.charCodeAt(newEnd) === oldText.charCodeAt(oldEnd)) {
            newEnd--;
            oldEnd--;
        }
        var start = 0, start = 0;
        while (start < oldEnd && start < newEnd && newText.charCodeAt(start) === oldText.charCodeAt(start)) {
            start++;
        }
        return { span: { start: start, length: oldEnd - start }, newLength: newEnd - start };
    };
    return SnapshotImpl;
})();
var Program = (function () {
    function Program() {
        this.host = new HostImpl();
        this.service = ts.createLanguageService(this.host, ts.createDocumentRegistry());
    }
    Program.prototype.updateFile = function (fileName, newText, modified) {
        this.host.version++;
        if (/\.tsx?$/.test(fileName)) {
            this.host.files[fileName] = {
                version: String(this.host.version),
                snapshot: new SnapshotImpl(newText)
            };
        }
        else if (/\.json$/.test(fileName)) {
            var pch = { readDirectory: function () { return []; } };
            this.host.config = ts.parseConfigFile(JSON.parse(newText), pch, null).options;
        }
    };
    Program.prototype.deleteFile = function (fileName) {
        this.host.version++;
        if (/\.tsx?$/.test(fileName)) {
            delete this.host.files[fileName];
        }
        else if (/\.json$/.test(fileName)) {
            this.host.config = {};
        }
    };
    Program.prototype.getDiagnostics = function (fileName) {
        var _this = this;
        var errs = this.service.getSyntacticDiagnostics(fileName).concat(this.service.getSemanticDiagnostics(fileName));
        return errs.map(function (diag) { return ({
            line: ts.getLineAndCharacterOfPosition(diag.file, diag.start).line,
            start: diag.start,
            length: diag.length,
            messageText: ts.flattenDiagnosticMessageText(diag.messageText, "\n"),
            // 7xxx is implicit-any errors
            category: (diag.code >= 7000 && diag.code <= 7999 && !_this.host.config.noImplicitAny)
                ? ts.DiagnosticCategory.Warning
                : diag.category,
            code: diag.code
        }); });
    };
    Program.prototype.getAllDiagnostics = function () {
        var errs = {};
        for (var fileName in this.host.files) {
            errs[fileName] = this.getDiagnostics(fileName);
        }
        return errs;
    };
    Program.prototype.getCompletions = function (fileName, position, prefix) {
        var service = this.service;
        var info = service.getCompletionsAtPosition(fileName, position);
        prefix = prefix.toLowerCase(); // NetBeans completion is case insensitive
        if (info) {
            return {
                isMemberCompletion: info.isMemberCompletion,
                entries: info.entries.filter(function (e) {
                    return e.name.substr(0, prefix.length).toLowerCase() === prefix;
                })
            };
        }
        return info;
    };
    Program.prototype.getCompletionEntryDetails = function (fileName, position, entryName) {
        return this.service.getCompletionEntryDetails(fileName, position, entryName);
    };
    Program.prototype.getQuickInfoAtPosition = function (fileName, position) {
        var quickInfo = this.service.getQuickInfoAtPosition(fileName, position);
        return quickInfo && {
            name: this.host.getScriptSnapshot(fileName).getText(quickInfo.textSpan.start, quickInfo.textSpan.start + quickInfo.textSpan.length),
            kind: quickInfo.kind,
            kindModifiers: quickInfo.kindModifiers,
            start: quickInfo.textSpan.start,
            end: quickInfo.textSpan.start + quickInfo.textSpan.length,
            displayParts: quickInfo.displayParts,
            documentation: quickInfo.documentation
        };
    };
    Program.prototype.getDefsAtPosition = function (fileName, position) {
        var _this = this;
        var defs = this.service.getDefinitionAtPosition(fileName, position);
        return defs && defs.map(function (di) {
            var sourceFile = _this.service.getSourceFile(di.fileName);
            return {
                fileName: di.fileName,
                start: di.textSpan.start,
                line: sourceFile.getLineAndCharacterOfPosition(di.textSpan.start).line,
                kind: di.kind,
                name: di.name,
                containerKind: di.containerKind,
                containerName: di.containerName
            };
        });
    };
    Program.prototype.getOccurrencesAtPosition = function (fileName, position) {
        var occurrences = this.service.getOccurrencesAtPosition(fileName, position);
        return occurrences && occurrences.map(function (occ) { return ({
            start: occ.textSpan.start,
            end: occ.textSpan.start + occ.textSpan.length
        }); });
    };
    Program.prototype.getNetbeansSemanticHighlights = function (fileName) {
        var sourceFile = this.service.getRealSourceFile(fileName);
        var typeInfoResolver = this.service.getProgram().getTypeChecker();
        var results = [];
        var resultByPos = {};
        function highlight(start, end, attr) {
            var res = resultByPos[start];
            if (!res) {
                res = { s: start, l: end - start, a: [] };
                results.push(res);
                resultByPos[start] = res;
            }
            res.a.push(attr);
        }
        function highlightIdent(node, attr) {
            // node.pos is too early (includes leading trivia)
            node.text && highlight(node.end - node.text.length, node.end, attr);
        }
        var localDecls = [];
        var usedSymbols = new Set();
        function isGlobal(decl) {
            do {
                decl = decl.parent;
            } while (!decl.locals);
            return decl.kind === 246 /* SourceFile */ && !ts.isExternalModule(decl);
        }
        function walk(node) {
            if (node.symbol && node.name && node.name.text) {
                var isLocal;
                if (node.kind === 136 /* Parameter */ && !node.parent.body) {
                    // don't complain about unused parameters in functions with no implementation body
                    isLocal = false;
                }
                else if (node.symbol.flags & 0x1A00C) {
                    // property, enum member, method, get/set - public by default
                    // is only local if "private" modifier is present
                    isLocal = !!(node.flags & 32 /* Private */);
                }
                else {
                    // other symbols are local unless in global scope or exported
                    isLocal = !(isGlobal(node) || node.localSymbol);
                }
                isLocal && localDecls.push(node);
            }
            if (node.kind === 67 /* Identifier */ && node.text) {
                var symbol;
                if (node.parent.symbol && node.parent.name === node) {
                    // declaration
                    symbol = node.parent.symbol;
                    if (node.parent.kind === 244 /* ShorthandPropertyAssignment */) {
                        // this isn't just a declaration, but also a usage - of a different symbol
                        usedSymbols.add(typeInfoResolver.getShorthandAssignmentValueSymbol(node.parent));
                    }
                }
                else {
                    // usage
                    symbol = typeInfoResolver.getSymbolAtLocation(node);
                    if (symbol) {
                        // if this is a generic instantiation, find the original symbol
                        symbol = symbol.target || symbol;
                        usedSymbols.add(symbol);
                    }
                }
                if (symbol) {
                    var decls = symbol.declarations;
                    if (symbol.flags & 2147483648 /* Deprecated */) {
                        highlightIdent(node, 'DEPRECATED');
                    }
                    if (symbol.flags & 0x1800C) {
                        // Property, EnumMember, GetAccessor, SetAccessor
                        highlightIdent(node, 'FIELD');
                    }
                    else if (symbol.flags & 0x7FB) {
                        // var, function, class, interface, enum, module
                        if (isGlobal(decls[0])) {
                            highlightIdent(node, 'GLOBAL');
                        }
                    }
                }
                else {
                    highlightIdent(node, 'UNDEFINED');
                }
                return;
            }
            switch (node.kind) {
                case 141 /* MethodDeclaration */:
                case 211 /* FunctionDeclaration */:
                case 212 /* ClassDeclaration */:
                case 213 /* InterfaceDeclaration */:
                case 214 /* TypeAliasDeclaration */:
                case 215 /* EnumDeclaration */:
                case 216 /* ModuleDeclaration */:
                    // name.kind could be string (external module decl); don't highlight that
                    if (node.name.kind === 67 /* Identifier */) {
                        highlightIdent(node.name, 'METHOD');
                    }
                    break;
                case 142 /* Constructor */:
                    node.getChildren().forEach(function (n) {
                        if (n.kind === 119 /* ConstructorKeyword */) {
                            highlight(n.end - 11, n.end, 'METHOD');
                        }
                    });
                    break;
                case 143 /* GetAccessor */:
                case 144 /* SetAccessor */:
                    highlight(node.name.pos - 3, node.name.pos, 'METHOD');
                    break;
            }
            ts.forEachChild(node, walk);
        }
        walk(sourceFile);
        localDecls.forEach(function (decl) {
            usedSymbols.has(decl.symbol) || highlightIdent(decl.name, 'UNUSED');
        });
        return results;
    };
    Program.prototype.getStructureItems = function (fileName) {
        var sourceFile = this.service.getRealSourceFile(fileName);
        var typeInfoResolver = this.service.getProgram().getTypeChecker();
        function buildResults(topNode, inFunction) {
            var results = [];
            function add(node, kind, symbol) {
                var name = node.kind === 142 /* Constructor */ ? "constructor" : node.name.text;
                if (!name) {
                    return;
                }
                var res = {
                    name: name,
                    kind: kind,
                    kindModifiers: ts.getNodeModifiers(node),
                    start: ts.skipTrivia(sourceFile.text, node.pos),
                    end: node.end
                };
                if (symbol) {
                    var type = typeInfoResolver.getTypeOfSymbolAtLocation(symbol, node);
                    res.type = typeInfoResolver.typeToString(type);
                }
                results.push(res);
                return res;
            }
            function addFunc(node, kind, symbol) {
                if (node.body) {
                    var res = add(node, kind, symbol);
                    res.children = buildResults(node.body, true);
                }
            }
            function addWithHeritage(node, kind) {
                var res = add(node, kind);
                node.heritageClauses && node.heritageClauses.forEach(function (hc) {
                    var types = hc.types.map(function (type) { return type.getFullText(); }).join(', ');
                    if (hc.token === 81 /* ExtendsKeyword */) {
                        res.extends = types;
                    }
                    else {
                        res.type = types;
                    }
                });
                return res;
            }
            function visit(node) {
                switch (node.kind) {
                    case 139 /* PropertyDeclaration */:
                        add(node, SEK.memberVariableElement, node.symbol);
                        break;
                    case 141 /* MethodDeclaration */:
                        addFunc(node, SEK.memberFunctionElement, node.symbol);
                        break;
                    case 142 /* Constructor */:
                        addFunc(node, SEK.constructorImplementationElement);
                        break;
                    case 143 /* GetAccessor */:
                        addFunc(node, SEK.memberGetAccessorElement, node.symbol);
                        break;
                    case 144 /* SetAccessor */:
                        addFunc(node, SEK.memberSetAccessorElement, node.symbol);
                        break;
                    case 191 /* VariableStatement */:
                        if (!inFunction) {
                            node.declarationList.declarations.forEach(function (v) {
                                add(v, SEK.variableElement, v.symbol);
                            });
                        }
                        break;
                    case 211 /* FunctionDeclaration */:
                        addFunc(node, SEK.functionElement, node.symbol);
                        break;
                    case 212 /* ClassDeclaration */:
                        var res = addWithHeritage(node, SEK.classElement);
                        res.children = buildResults(node, false);
                        break;
                    case 213 /* InterfaceDeclaration */:
                        addWithHeritage(node, SEK.interfaceElement);
                        break;
                    case 215 /* EnumDeclaration */:
                        add(node, SEK.enumElement);
                        break;
                    case 216 /* ModuleDeclaration */:
                        var res = add(node, SEK.moduleElement);
                        res.children = buildResults(node, false);
                        break;
                    case 217 /* ModuleBlock */:
                        node.statements.forEach(visit);
                        break;
                }
            }
            ts.forEachChild(topNode, visit);
            return results;
        }
        return buildResults(sourceFile, false);
    };
    Program.prototype.getFolds = function (fileName) {
        return this.service.getOutliningSpans(fileName).map(function (os) { return ({
            start: os.textSpan.start,
            end: os.textSpan.start + os.textSpan.length
        }); });
    };
    Program.prototype.getReferencesAtPosition = function (fileName, position) {
        var _this = this;
        var refs = this.service.getReferencesAtPosition(fileName, position);
        return refs && refs.map(function (ref) {
            var file = _this.service.getSourceFile(ref.fileName);
            var lineStarts = file.getLineStarts();
            var line = ts.computeLineAndCharacterOfPosition(lineStarts, ref.textSpan.start).line;
            return {
                fileName: ref.fileName,
                isWriteAccess: ref.isWriteAccess,
                start: ref.textSpan.start,
                end: ref.textSpan.start + ref.textSpan.length,
                lineStart: lineStarts[line],
                lineText: file.text.substring(lineStarts[line], lineStarts[line + 1])
            };
        });
    };
    return Program;
})();
require('readline').createInterface(process.stdin, process.stdout).on('line', function (l) {
    try {
        var r = JSON.stringify(eval(l));
    }
    catch (error) {
        r = 'X' + JSON.stringify(error.stack);
    }
    process.stdout.write(r + '\n');
});
