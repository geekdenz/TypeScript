/// <reference path="scanner.ts"/>
/// <reference path="utilities.ts"/>
var ts;
(function (ts) {
    var nodeConstructors = new Array(270 /* Count */);
    /* @internal */ ts.parseTime = 0;
    function getNodeConstructor(kind) {
        return nodeConstructors[kind] || (nodeConstructors[kind] = objectAllocator.getNodeConstructor(kind));
    }
    ts.getNodeConstructor = getNodeConstructor;
    function createNode(kind) {
        return new (getNodeConstructor(kind))();
    }
    ts.createNode = createNode;
    function visitNode(cbNode, node) {
        if (node) {
            return cbNode(node);
        }
    }
    function visitNodeArray(cbNodes, nodes) {
        if (nodes) {
            return cbNodes(nodes);
        }
    }
    function visitEachNode(cbNode, nodes) {
        if (nodes) {
            for (var _i = 0; _i < nodes.length; _i++) {
                var node = nodes[_i];
                var result = cbNode(node);
                if (result) {
                    return result;
                }
            }
        }
    }
    // Invokes a callback for each child of the given node. The 'cbNode' callback is invoked for all child nodes
    // stored in properties. If a 'cbNodes' callback is specified, it is invoked for embedded arrays; otherwise,
    // embedded arrays are flattened and the 'cbNode' callback is invoked for each element. If a callback returns
    // a truthy value, iteration stops and that value is returned. Otherwise, undefined is returned.
    function forEachChild(node, cbNode, cbNodeArray) {
        if (!node) {
            return;
        }
        // The visitXXX functions could be written as local functions that close over the cbNode and cbNodeArray
        // callback parameters, but that causes a closure allocation for each invocation with noticeable effects
        // on performance.
        var visitNodes = cbNodeArray ? visitNodeArray : visitEachNode;
        var cbNodes = cbNodeArray || cbNode;
        switch (node.kind) {
            case 133 /* QualifiedName */:
                return visitNode(cbNode, node.left) ||
                    visitNode(cbNode, node.right);
            case 135 /* TypeParameter */:
                return visitNode(cbNode, node.name) ||
                    visitNode(cbNode, node.constraint) ||
                    visitNode(cbNode, node.expression);
            case 136 /* Parameter */:
            case 139 /* PropertyDeclaration */:
            case 138 /* PropertySignature */:
            case 243 /* PropertyAssignment */:
            case 244 /* ShorthandPropertyAssignment */:
            case 209 /* VariableDeclaration */:
            case 161 /* BindingElement */:
                return visitNodes(cbNodes, node.decorators) ||
                    visitNodes(cbNodes, node.modifiers) ||
                    visitNode(cbNode, node.propertyName) ||
                    visitNode(cbNode, node.dotDotDotToken) ||
                    visitNode(cbNode, node.name) ||
                    visitNode(cbNode, node.questionToken) ||
                    visitNode(cbNode, node.type) ||
                    visitNode(cbNode, node.initializer);
            case 150 /* FunctionType */:
            case 151 /* ConstructorType */:
            case 145 /* CallSignature */:
            case 146 /* ConstructSignature */:
            case 147 /* IndexSignature */:
                return visitNodes(cbNodes, node.decorators) ||
                    visitNodes(cbNodes, node.modifiers) ||
                    visitNodes(cbNodes, node.typeParameters) ||
                    visitNodes(cbNodes, node.parameters) ||
                    visitNode(cbNode, node.type);
            case 141 /* MethodDeclaration */:
            case 140 /* MethodSignature */:
            case 142 /* Constructor */:
            case 143 /* GetAccessor */:
            case 144 /* SetAccessor */:
            case 171 /* FunctionExpression */:
            case 211 /* FunctionDeclaration */:
            case 172 /* ArrowFunction */:
                return visitNodes(cbNodes, node.decorators) ||
                    visitNodes(cbNodes, node.modifiers) ||
                    visitNode(cbNode, node.asteriskToken) ||
                    visitNode(cbNode, node.name) ||
                    visitNode(cbNode, node.questionToken) ||
                    visitNodes(cbNodes, node.typeParameters) ||
                    visitNodes(cbNodes, node.parameters) ||
                    visitNode(cbNode, node.type) ||
                    visitNode(cbNode, node.equalsGreaterThanToken) ||
                    visitNode(cbNode, node.body);
            case 149 /* TypeReference */:
                return visitNode(cbNode, node.typeName) ||
                    visitNodes(cbNodes, node.typeArguments);
            case 148 /* TypePredicate */:
                return visitNode(cbNode, node.parameterName) ||
                    visitNode(cbNode, node.type);
            case 152 /* TypeQuery */:
                return visitNode(cbNode, node.exprName);
            case 153 /* TypeLiteral */:
                return visitNodes(cbNodes, node.members);
            case 154 /* ArrayType */:
                return visitNode(cbNode, node.elementType);
            case 155 /* TupleType */:
                return visitNodes(cbNodes, node.elementTypes);
            case 156 /* UnionType */:
            case 157 /* IntersectionType */:
                return visitNodes(cbNodes, node.types);
            case 158 /* ParenthesizedType */:
                return visitNode(cbNode, node.type);
            case 159 /* ObjectBindingPattern */:
            case 160 /* ArrayBindingPattern */:
                return visitNodes(cbNodes, node.elements);
            case 162 /* ArrayLiteralExpression */:
                return visitNodes(cbNodes, node.elements);
            case 163 /* ObjectLiteralExpression */:
                return visitNodes(cbNodes, node.properties);
            case 164 /* PropertyAccessExpression */:
                return visitNode(cbNode, node.expression) ||
                    visitNode(cbNode, node.dotToken) ||
                    visitNode(cbNode, node.name);
            case 165 /* ElementAccessExpression */:
                return visitNode(cbNode, node.expression) ||
                    visitNode(cbNode, node.argumentExpression);
            case 166 /* CallExpression */:
            case 167 /* NewExpression */:
                return visitNode(cbNode, node.expression) ||
                    visitNodes(cbNodes, node.typeArguments) ||
                    visitNodes(cbNodes, node.arguments);
            case 168 /* TaggedTemplateExpression */:
                return visitNode(cbNode, node.tag) ||
                    visitNode(cbNode, node.template);
            case 169 /* TypeAssertionExpression */:
                return visitNode(cbNode, node.type) ||
                    visitNode(cbNode, node.expression);
            case 170 /* ParenthesizedExpression */:
                return visitNode(cbNode, node.expression);
            case 173 /* DeleteExpression */:
                return visitNode(cbNode, node.expression);
            case 174 /* TypeOfExpression */:
                return visitNode(cbNode, node.expression);
            case 175 /* VoidExpression */:
                return visitNode(cbNode, node.expression);
            case 177 /* PrefixUnaryExpression */:
                return visitNode(cbNode, node.operand);
            case 182 /* YieldExpression */:
                return visitNode(cbNode, node.asteriskToken) ||
                    visitNode(cbNode, node.expression);
            case 176 /* AwaitExpression */:
                return visitNode(cbNode, node.expression);
            case 178 /* PostfixUnaryExpression */:
                return visitNode(cbNode, node.operand);
            case 179 /* BinaryExpression */:
                return visitNode(cbNode, node.left) ||
                    visitNode(cbNode, node.operatorToken) ||
                    visitNode(cbNode, node.right);
            case 187 /* AsExpression */:
                return visitNode(cbNode, node.expression) ||
                    visitNode(cbNode, node.type);
            case 180 /* ConditionalExpression */:
                return visitNode(cbNode, node.condition) ||
                    visitNode(cbNode, node.questionToken) ||
                    visitNode(cbNode, node.whenTrue) ||
                    visitNode(cbNode, node.colonToken) ||
                    visitNode(cbNode, node.whenFalse);
            case 183 /* SpreadElementExpression */:
                return visitNode(cbNode, node.expression);
            case 190 /* Block */:
            case 217 /* ModuleBlock */:
                return visitNodes(cbNodes, node.statements);
            case 246 /* SourceFile */:
                return visitNodes(cbNodes, node.statements) ||
                    visitNode(cbNode, node.endOfFileToken);
            case 191 /* VariableStatement */:
                return visitNodes(cbNodes, node.decorators) ||
                    visitNodes(cbNodes, node.modifiers) ||
                    visitNode(cbNode, node.declarationList);
            case 210 /* VariableDeclarationList */:
                return visitNodes(cbNodes, node.declarations);
            case 193 /* ExpressionStatement */:
                return visitNode(cbNode, node.expression);
            case 194 /* IfStatement */:
                return visitNode(cbNode, node.expression) ||
                    visitNode(cbNode, node.thenStatement) ||
                    visitNode(cbNode, node.elseStatement);
            case 195 /* DoStatement */:
                return visitNode(cbNode, node.statement) ||
                    visitNode(cbNode, node.expression);
            case 196 /* WhileStatement */:
                return visitNode(cbNode, node.expression) ||
                    visitNode(cbNode, node.statement);
            case 197 /* ForStatement */:
                return visitNode(cbNode, node.initializer) ||
                    visitNode(cbNode, node.condition) ||
                    visitNode(cbNode, node.incrementor) ||
                    visitNode(cbNode, node.statement);
            case 198 /* ForInStatement */:
                return visitNode(cbNode, node.initializer) ||
                    visitNode(cbNode, node.expression) ||
                    visitNode(cbNode, node.statement);
            case 199 /* ForOfStatement */:
                return visitNode(cbNode, node.initializer) ||
                    visitNode(cbNode, node.expression) ||
                    visitNode(cbNode, node.statement);
            case 200 /* ContinueStatement */:
            case 201 /* BreakStatement */:
                return visitNode(cbNode, node.label);
            case 202 /* ReturnStatement */:
                return visitNode(cbNode, node.expression);
            case 203 /* WithStatement */:
                return visitNode(cbNode, node.expression) ||
                    visitNode(cbNode, node.statement);
            case 204 /* SwitchStatement */:
                return visitNode(cbNode, node.expression) ||
                    visitNode(cbNode, node.caseBlock);
            case 218 /* CaseBlock */:
                return visitNodes(cbNodes, node.clauses);
            case 239 /* CaseClause */:
                return visitNode(cbNode, node.expression) ||
                    visitNodes(cbNodes, node.statements);
            case 240 /* DefaultClause */:
                return visitNodes(cbNodes, node.statements);
            case 205 /* LabeledStatement */:
                return visitNode(cbNode, node.label) ||
                    visitNode(cbNode, node.statement);
            case 206 /* ThrowStatement */:
                return visitNode(cbNode, node.expression);
            case 207 /* TryStatement */:
                return visitNode(cbNode, node.tryBlock) ||
                    visitNode(cbNode, node.catchClause) ||
                    visitNode(cbNode, node.finallyBlock);
            case 242 /* CatchClause */:
                return visitNode(cbNode, node.variableDeclaration) ||
                    visitNode(cbNode, node.block);
            case 137 /* Decorator */:
                return visitNode(cbNode, node.expression);
            case 212 /* ClassDeclaration */:
            case 184 /* ClassExpression */:
                return visitNodes(cbNodes, node.decorators) ||
                    visitNodes(cbNodes, node.modifiers) ||
                    visitNode(cbNode, node.name) ||
                    visitNodes(cbNodes, node.typeParameters) ||
                    visitNodes(cbNodes, node.heritageClauses) ||
                    visitNodes(cbNodes, node.members);
            case 213 /* InterfaceDeclaration */:
                return visitNodes(cbNodes, node.decorators) ||
                    visitNodes(cbNodes, node.modifiers) ||
                    visitNode(cbNode, node.name) ||
                    visitNodes(cbNodes, node.typeParameters) ||
                    visitNodes(cbNodes, node.heritageClauses) ||
                    visitNodes(cbNodes, node.members);
            case 214 /* TypeAliasDeclaration */:
                return visitNodes(cbNodes, node.decorators) ||
                    visitNodes(cbNodes, node.modifiers) ||
                    visitNode(cbNode, node.name) ||
                    visitNodes(cbNodes, node.typeParameters) ||
                    visitNode(cbNode, node.type);
            case 215 /* EnumDeclaration */:
                return visitNodes(cbNodes, node.decorators) ||
                    visitNodes(cbNodes, node.modifiers) ||
                    visitNode(cbNode, node.name) ||
                    visitNodes(cbNodes, node.members);
            case 245 /* EnumMember */:
                return visitNode(cbNode, node.name) ||
                    visitNode(cbNode, node.initializer);
            case 216 /* ModuleDeclaration */:
                return visitNodes(cbNodes, node.decorators) ||
                    visitNodes(cbNodes, node.modifiers) ||
                    visitNode(cbNode, node.name) ||
                    visitNode(cbNode, node.body);
            case 219 /* ImportEqualsDeclaration */:
                return visitNodes(cbNodes, node.decorators) ||
                    visitNodes(cbNodes, node.modifiers) ||
                    visitNode(cbNode, node.name) ||
                    visitNode(cbNode, node.moduleReference);
            case 220 /* ImportDeclaration */:
                return visitNodes(cbNodes, node.decorators) ||
                    visitNodes(cbNodes, node.modifiers) ||
                    visitNode(cbNode, node.importClause) ||
                    visitNode(cbNode, node.moduleSpecifier);
            case 221 /* ImportClause */:
                return visitNode(cbNode, node.name) ||
                    visitNode(cbNode, node.namedBindings);
            case 222 /* NamespaceImport */:
                return visitNode(cbNode, node.name);
            case 223 /* NamedImports */:
            case 227 /* NamedExports */:
                return visitNodes(cbNodes, node.elements);
            case 226 /* ExportDeclaration */:
                return visitNodes(cbNodes, node.decorators) ||
                    visitNodes(cbNodes, node.modifiers) ||
                    visitNode(cbNode, node.exportClause) ||
                    visitNode(cbNode, node.moduleSpecifier);
            case 224 /* ImportSpecifier */:
            case 228 /* ExportSpecifier */:
                return visitNode(cbNode, node.propertyName) ||
                    visitNode(cbNode, node.name);
            case 225 /* ExportAssignment */:
                return visitNodes(cbNodes, node.decorators) ||
                    visitNodes(cbNodes, node.modifiers) ||
                    visitNode(cbNode, node.expression);
            case 181 /* TemplateExpression */:
                return visitNode(cbNode, node.head) || visitNodes(cbNodes, node.templateSpans);
            case 188 /* TemplateSpan */:
                return visitNode(cbNode, node.expression) || visitNode(cbNode, node.literal);
            case 134 /* ComputedPropertyName */:
                return visitNode(cbNode, node.expression);
            case 241 /* HeritageClause */:
                return visitNodes(cbNodes, node.types);
            case 186 /* ExpressionWithTypeArguments */:
                return visitNode(cbNode, node.expression) ||
                    visitNodes(cbNodes, node.typeArguments);
            case 230 /* ExternalModuleReference */:
                return visitNode(cbNode, node.expression);
            case 229 /* MissingDeclaration */:
                return visitNodes(cbNodes, node.decorators);
            case 231 /* JsxElement */:
                return visitNode(cbNode, node.openingElement) ||
                    visitNodes(cbNodes, node.children) ||
                    visitNode(cbNode, node.closingElement);
            case 232 /* JsxSelfClosingElement */:
            case 233 /* JsxOpeningElement */:
                return visitNode(cbNode, node.tagName) ||
                    visitNodes(cbNodes, node.attributes);
            case 236 /* JsxAttribute */:
                return visitNode(cbNode, node.name) ||
                    visitNode(cbNode, node.initializer);
            case 237 /* JsxSpreadAttribute */:
                return visitNode(cbNode, node.expression);
            case 238 /* JsxExpression */:
                return visitNode(cbNode, node.expression);
            case 235 /* JsxClosingElement */:
                return visitNode(cbNode, node.tagName);
            case 247 /* JSDocTypeExpression */:
                return visitNode(cbNode, node.type);
            case 251 /* JSDocUnionType */:
                return visitNodes(cbNodes, node.types);
            case 252 /* JSDocTupleType */:
                return visitNodes(cbNodes, node.types);
            case 250 /* JSDocArrayType */:
                return visitNode(cbNode, node.elementType);
            case 254 /* JSDocNonNullableType */:
                return visitNode(cbNode, node.type);
            case 253 /* JSDocNullableType */:
                return visitNode(cbNode, node.type);
            case 255 /* JSDocRecordType */:
                return visitNodes(cbNodes, node.members);
            case 257 /* JSDocTypeReference */:
                return visitNode(cbNode, node.name) ||
                    visitNodes(cbNodes, node.typeArguments);
            case 258 /* JSDocOptionalType */:
                return visitNode(cbNode, node.type);
            case 259 /* JSDocFunctionType */:
                return visitNodes(cbNodes, node.parameters) ||
                    visitNode(cbNode, node.type);
            case 260 /* JSDocVariadicType */:
                return visitNode(cbNode, node.type);
            case 261 /* JSDocConstructorType */:
                return visitNode(cbNode, node.type);
            case 262 /* JSDocThisType */:
                return visitNode(cbNode, node.type);
            case 256 /* JSDocRecordMember */:
                return visitNode(cbNode, node.name) ||
                    visitNode(cbNode, node.type);
            case 263 /* JSDocComment */:
                return visitNodes(cbNodes, node.tags);
            case 265 /* JSDocParameterTag */:
                return visitNode(cbNode, node.preParameterName) ||
                    visitNode(cbNode, node.typeExpression) ||
                    visitNode(cbNode, node.postParameterName);
            case 266 /* JSDocReturnTag */:
                return visitNode(cbNode, node.typeExpression);
            case 267 /* JSDocTypeTag */:
                return visitNode(cbNode, node.typeExpression);
            case 268 /* JSDocTemplateTag */:
                return visitNodes(cbNodes, node.typeParameters);
        }
    }
    ts.forEachChild = forEachChild;
    function createSourceFile(fileName, sourceText, languageVersion, setParentNodes) {
        if (setParentNodes === void 0) { setParentNodes = false; }
        var start = new Date().getTime();
        var result = Parser.parseSourceFile(fileName, sourceText, languageVersion, undefined, setParentNodes);
        ts.parseTime += new Date().getTime() - start;
        return result;
    }
    ts.createSourceFile = createSourceFile;
    // Produces a new SourceFile for the 'newText' provided. The 'textChangeRange' parameter
    // indicates what changed between the 'text' that this SourceFile has and the 'newText'.
    // The SourceFile will be created with the compiler attempting to reuse as many nodes from
    // this file as possible.
    //
    // Note: this function mutates nodes from this SourceFile. That means any existing nodes
    // from this SourceFile that are being held onto may change as a result (including
    // becoming detached from any SourceFile).  It is recommended that this SourceFile not
    // be used once 'update' is called on it.
    function updateSourceFile(sourceFile, newText, textChangeRange, aggressiveChecks) {
        return IncrementalParser.updateSourceFile(sourceFile, newText, textChangeRange, aggressiveChecks);
    }
    ts.updateSourceFile = updateSourceFile;
    /* @internal */
    function parseIsolatedJSDocComment(content, start, length) {
        return Parser.JSDocParser.parseIsolatedJSDocComment(content, start, length);
    }
    ts.parseIsolatedJSDocComment = parseIsolatedJSDocComment;
    /* @internal */
    // Exposed only for testing.
    function parseJSDocTypeExpressionForTests(content, start, length) {
        return Parser.JSDocParser.parseJSDocTypeExpressionForTests(content, start, length);
    }
    ts.parseJSDocTypeExpressionForTests = parseJSDocTypeExpressionForTests;
    // Implement the parser as a singleton module.  We do this for perf reasons because creating
    // parser instances can actually be expensive enough to impact us on projects with many source
    // files.
    var Parser;
    (function (Parser) {
        // Share a single scanner across all calls to parse a source file.  This helps speed things
        // up by avoiding the cost of creating/compiling scanners over and over again.
        var scanner = ts.createScanner(2 /* Latest */, true);
        var disallowInAndDecoratorContext = 1 /* DisallowIn */ | 4 /* Decorator */;
        var sourceFile;
        var parseDiagnostics;
        var syntaxCursor;
        var token;
        var sourceText;
        var nodeCount;
        var identifiers;
        var identifierCount;
        var parsingContext;
        // Flags that dictate what parsing context we're in.  For example:
        // Whether or not we are in strict parsing mode.  All that changes in strict parsing mode is
        // that some tokens that would be considered identifiers may be considered keywords.
        //
        // When adding more parser context flags, consider which is the more common case that the
        // flag will be in.  This should be the 'false' state for that flag.  The reason for this is
        // that we don't store data in our nodes unless the value is in the *non-default* state.  So,
        // for example, more often than code 'allows-in' (or doesn't 'disallow-in').  We opt for
        // 'disallow-in' set to 'false'.  Otherwise, if we had 'allowsIn' set to 'true', then almost
        // all nodes would need extra state on them to store this info.
        //
        // Note:  'allowIn' and 'allowYield' track 1:1 with the [in] and [yield] concepts in the ES6
        // grammar specification.
        //
        // An important thing about these context concepts.  By default they are effectively inherited
        // while parsing through every grammar production.  i.e. if you don't change them, then when
        // you parse a sub-production, it will have the same context values as the parent production.
        // This is great most of the time.  After all, consider all the 'expression' grammar productions
        // and how nearly all of them pass along the 'in' and 'yield' context values:
        //
        // EqualityExpression[In, Yield] :
        //      RelationalExpression[?In, ?Yield]
        //      EqualityExpression[?In, ?Yield] == RelationalExpression[?In, ?Yield]
        //      EqualityExpression[?In, ?Yield] != RelationalExpression[?In, ?Yield]
        //      EqualityExpression[?In, ?Yield] === RelationalExpression[?In, ?Yield]
        //      EqualityExpression[?In, ?Yield] !== RelationalExpression[?In, ?Yield]
        //
        // Where you have to be careful is then understanding what the points are in the grammar
        // where the values are *not* passed along.  For example:
        //
        // SingleNameBinding[Yield,GeneratorParameter]
        //      [+GeneratorParameter]BindingIdentifier[Yield] Initializer[In]opt
        //      [~GeneratorParameter]BindingIdentifier[?Yield]Initializer[In, ?Yield]opt
        //
        // Here this is saying that if the GeneratorParameter context flag is set, that we should
        // explicitly set the 'yield' context flag to false before calling into the BindingIdentifier
        // and we should explicitly unset the 'yield' context flag before calling into the Initializer.
        // production.  Conversely, if the GeneratorParameter context flag is not set, then we
        // should leave the 'yield' context flag alone.
        //
        // Getting this all correct is tricky and requires careful reading of the grammar to
        // understand when these values should be changed versus when they should be inherited.
        //
        // Note: it should not be necessary to save/restore these flags during speculative/lookahead
        // parsing.  These context flags are naturally stored and restored through normal recursive
        // descent parsing and unwinding.
        var contextFlags;
        // Whether or not we've had a parse error since creating the last AST node.  If we have
        // encountered an error, it will be stored on the next AST node we create.  Parse errors
        // can be broken down into three categories:
        //
        // 1) An error that occurred during scanning.  For example, an unterminated literal, or a
        //    character that was completely not understood.
        //
        // 2) A token was expected, but was not present.  This type of error is commonly produced
        //    by the 'parseExpected' function.
        //
        // 3) A token was present that no parsing function was able to consume.  This type of error
        //    only occurs in the 'abortParsingListOrMoveToNextToken' function when the parser
        //    decides to skip the token.
        //
        // In all of these cases, we want to mark the next node as having had an error before it.
        // With this mark, we can know in incremental settings if this node can be reused, or if
        // we have to reparse it.  If we don't keep this information around, we may just reuse the
        // node.  in that event we would then not produce the same errors as we did before, causing
        // significant confusion problems.
        //
        // Note: it is necessary that this value be saved/restored during speculative/lookahead
        // parsing.  During lookahead parsing, we will often create a node.  That node will have
        // this value attached, and then this value will be set back to 'false'.  If we decide to
        // rewind, we must get back to the same value we had prior to the lookahead.
        //
        // Note: any errors at the end of the file that do not precede a regular node, should get
        // attached to the EOF token.
        var parseErrorBeforeNextFinishedNode = false;
        function parseSourceFile(fileName, _sourceText, languageVersion, _syntaxCursor, setParentNodes) {
            initializeState(fileName, _sourceText, languageVersion, _syntaxCursor);
            var result = parseSourceFileWorker(fileName, languageVersion, setParentNodes);
            clearState();
            return result;
        }
        Parser.parseSourceFile = parseSourceFile;
        function initializeState(fileName, _sourceText, languageVersion, _syntaxCursor) {
            sourceText = _sourceText;
            syntaxCursor = _syntaxCursor;
            parseDiagnostics = [];
            parsingContext = 0;
            identifiers = {};
            identifierCount = 0;
            nodeCount = 0;
            contextFlags = ts.isJavaScript(fileName) ? 32 /* JavaScriptFile */ : 0 /* None */;
            parseErrorBeforeNextFinishedNode = false;
            // Initialize and prime the scanner before parsing the source elements.
            scanner.setText(sourceText);
            scanner.setOnError(scanError);
            scanner.setScriptTarget(languageVersion);
            scanner.setLanguageVariant(ts.isTsx(fileName) ? 1 /* JSX */ : 0 /* Standard */);
        }
        function clearState() {
            // Clear out the text the scanner is pointing at, so it doesn't keep anything alive unnecessarily.
            scanner.setText("");
            scanner.setOnError(undefined);
            // Clear any data.  We don't want to accidently hold onto it for too long.
            parseDiagnostics = undefined;
            sourceFile = undefined;
            identifiers = undefined;
            syntaxCursor = undefined;
            sourceText = undefined;
        }
        function parseSourceFileWorker(fileName, languageVersion, setParentNodes) {
            sourceFile = createSourceFile(fileName, languageVersion);
            // Prime the scanner.
            token = nextToken();
            processReferenceComments(sourceFile);
            sourceFile.statements = parseList(0 /* SourceElements */, parseStatement);
            Debug.assert(token === 1 /* EndOfFileToken */);
            sourceFile.endOfFileToken = parseTokenNode();
            setExternalModuleIndicator(sourceFile);
            sourceFile.nodeCount = nodeCount;
            sourceFile.identifierCount = identifierCount;
            sourceFile.identifiers = identifiers;
            sourceFile.parseDiagnostics = parseDiagnostics;
            if (setParentNodes) {
                fixupParentReferences(sourceFile);
            }
            // If this is a javascript file, proactively see if we can get JSDoc comments for
            // relevant nodes in the file.  We'll use these to provide typing informaion if they're
            // available.
            if (ts.isJavaScript(fileName)) {
                addJSDocComments();
            }
            return sourceFile;
        }
        function addJSDocComments() {
            forEachChild(sourceFile, visit);
            return;
            function visit(node) {
                // Add additional cases as necessary depending on how we see JSDoc comments used
                // in the wild.
                switch (node.kind) {
                    case 191 /* VariableStatement */:
                    case 211 /* FunctionDeclaration */:
                    case 136 /* Parameter */:
                        addJSDocComment(node);
                }
                forEachChild(node, visit);
            }
        }
        function addJSDocComment(node) {
            var comments = ts.getLeadingCommentRangesOfNode(node, sourceFile);
            if (comments) {
                for (var _i = 0; _i < comments.length; _i++) {
                    var comment = comments[_i];
                    var jsDocComment = JSDocParser.parseJSDocComment(node, comment.pos, comment.end - comment.pos);
                    if (jsDocComment) {
                        node.jsDocComment = jsDocComment;
                    }
                }
            }
        }
        function fixupParentReferences(sourceFile) {
            // normally parent references are set during binding. However, for clients that only need
            // a syntax tree, and no semantic features, then the binding process is an unnecessary
            // overhead.  This functions allows us to set all the parents, without all the expense of
            // binding.
            var parent = sourceFile;
            forEachChild(sourceFile, visitNode);
            return;
            function visitNode(n) {
                // walk down setting parents that differ from the parent we think it should be.  This
                // allows us to quickly bail out of setting parents for subtrees during incremental
                // parsing
                if (n.parent !== parent) {
                    n.parent = parent;
                    var saveParent = parent;
                    parent = n;
                    forEachChild(n, visitNode);
                    parent = saveParent;
                }
            }
        }
        Parser.fixupParentReferences = fixupParentReferences;
        function createSourceFile(fileName, languageVersion) {
            var sourceFile = createNode(246 /* SourceFile */, 0);
            sourceFile.pos = 0;
            sourceFile.end = sourceText.length;
            sourceFile.text = sourceText;
            sourceFile.bindDiagnostics = [];
            sourceFile.languageVersion = languageVersion;
            sourceFile.fileName = normalizePath(fileName);
            sourceFile.flags = fileExtensionIs(sourceFile.fileName, ".d.ts") ? 8192 /* DeclarationFile */ : 0;
            sourceFile.languageVariant = ts.isTsx(sourceFile.fileName) ? 1 /* JSX */ : 0 /* Standard */;
            return sourceFile;
        }
        function setContextFlag(val, flag) {
            if (val) {
                contextFlags |= flag;
            }
            else {
                contextFlags &= ~flag;
            }
        }
        function setDisallowInContext(val) {
            setContextFlag(val, 1 /* DisallowIn */);
        }
        function setYieldContext(val) {
            setContextFlag(val, 2 /* Yield */);
        }
        function setDecoratorContext(val) {
            setContextFlag(val, 4 /* Decorator */);
        }
        function setAwaitContext(val) {
            setContextFlag(val, 8 /* Await */);
        }
        function doOutsideOfContext(context, func) {
            // contextFlagsToClear will contain only the context flags that are
            // currently set that we need to temporarily clear
            // We don't just blindly reset to the previous flags to ensure
            // that we do not mutate cached flags for the incremental
            // parser (ThisNodeHasError, ThisNodeOrAnySubNodesHasError, and
            // HasAggregatedChildData).
            var contextFlagsToClear = context & contextFlags;
            if (contextFlagsToClear) {
                // clear the requested context flags
                setContextFlag(false, contextFlagsToClear);
                var result = func();
                // restore the context flags we just cleared
                setContextFlag(true, contextFlagsToClear);
                return result;
            }
            // no need to do anything special as we are not in any of the requested contexts
            return func();
        }
        function doInsideOfContext(context, func) {
            // contextFlagsToSet will contain only the context flags that
            // are not currently set that we need to temporarily enable.
            // We don't just blindly reset to the previous flags to ensure
            // that we do not mutate cached flags for the incremental
            // parser (ThisNodeHasError, ThisNodeOrAnySubNodesHasError, and
            // HasAggregatedChildData).
            var contextFlagsToSet = context & ~contextFlags;
            if (contextFlagsToSet) {
                // set the requested context flags
                setContextFlag(true, contextFlagsToSet);
                var result = func();
                // reset the context flags we just set
                setContextFlag(false, contextFlagsToSet);
                return result;
            }
            // no need to do anything special as we are already in all of the requested contexts
            return func();
        }
        function allowInAnd(func) {
            return doOutsideOfContext(1 /* DisallowIn */, func);
        }
        function disallowInAnd(func) {
            return doInsideOfContext(1 /* DisallowIn */, func);
        }
        function doInYieldContext(func) {
            return doInsideOfContext(2 /* Yield */, func);
        }
        function doOutsideOfYieldContext(func) {
            return doOutsideOfContext(2 /* Yield */, func);
        }
        function doInDecoratorContext(func) {
            return doInsideOfContext(4 /* Decorator */, func);
        }
        function doInAwaitContext(func) {
            return doInsideOfContext(8 /* Await */, func);
        }
        function doOutsideOfAwaitContext(func) {
            return doOutsideOfContext(8 /* Await */, func);
        }
        function doInYieldAndAwaitContext(func) {
            return doInsideOfContext(2 /* Yield */ | 8 /* Await */, func);
        }
        function doOutsideOfYieldAndAwaitContext(func) {
            return doOutsideOfContext(2 /* Yield */ | 8 /* Await */, func);
        }
        function inContext(flags) {
            return (contextFlags & flags) !== 0;
        }
        function inYieldContext() {
            return inContext(2 /* Yield */);
        }
        function inDisallowInContext() {
            return inContext(1 /* DisallowIn */);
        }
        function inDecoratorContext() {
            return inContext(4 /* Decorator */);
        }
        function inAwaitContext() {
            return inContext(8 /* Await */);
        }
        function parseErrorAtCurrentToken(message, arg0) {
            var start = scanner.getTokenPos();
            var length = scanner.getTextPos() - start;
            parseErrorAtPosition(start, length, message, arg0);
        }
        function parseErrorAtPosition(start, length, message, arg0) {
            // Don't report another error if it would just be at the same position as the last error.
            var lastError = lastOrUndefined(parseDiagnostics);
            if (!lastError || start !== lastError.start) {
                parseDiagnostics.push(createFileDiagnostic(sourceFile, start, length, message, arg0));
            }
            // Mark that we've encountered an error.  We'll set an appropriate bit on the next
            // node we finish so that it can't be reused incrementally.
            parseErrorBeforeNextFinishedNode = true;
        }
        function scanError(message, length) {
            var pos = scanner.getTextPos();
            parseErrorAtPosition(pos, length || 0, message);
        }
        function getNodePos() {
            return scanner.getStartPos();
        }
        function getNodeEnd() {
            return scanner.getStartPos();
        }
        function nextToken() {
            return token = scanner.scan();
        }
        function getTokenPos(pos) {
            return ts.skipTrivia(sourceText, pos);
        }
        function reScanGreaterToken() {
            return token = scanner.reScanGreaterToken();
        }
        function reScanSlashToken() {
            return token = scanner.reScanSlashToken();
        }
        function reScanTemplateToken() {
            return token = scanner.reScanTemplateToken();
        }
        function scanJsxIdentifier() {
            return token = scanner.scanJsxIdentifier();
        }
        function scanJsxText() {
            return token = scanner.scanJsxToken();
        }
        function speculationHelper(callback, isLookAhead) {
            // Keep track of the state we'll need to rollback to if lookahead fails (or if the
            // caller asked us to always reset our state).
            var saveToken = token;
            var saveParseDiagnosticsLength = parseDiagnostics.length;
            var saveParseErrorBeforeNextFinishedNode = parseErrorBeforeNextFinishedNode;
            // Note: it is not actually necessary to save/restore the context flags here.  That's
            // because the saving/restorating of these flags happens naturally through the recursive
            // descent nature of our parser.  However, we still store this here just so we can
            // assert that that invariant holds.
            var saveContextFlags = contextFlags;
            // If we're only looking ahead, then tell the scanner to only lookahead as well.
            // Otherwise, if we're actually speculatively parsing, then tell the scanner to do the
            // same.
            var result = isLookAhead
                ? scanner.lookAhead(callback)
                : scanner.tryScan(callback);
            Debug.assert(saveContextFlags === contextFlags);
            // If our callback returned something 'falsy' or we're just looking ahead,
            // then unconditionally restore us to where we were.
            if (!result || isLookAhead) {
                token = saveToken;
                parseDiagnostics.length = saveParseDiagnosticsLength;
                parseErrorBeforeNextFinishedNode = saveParseErrorBeforeNextFinishedNode;
            }
            return result;
        }
        // Invokes the provided callback then unconditionally restores the parser to the state it
        // was in immediately prior to invoking the callback.  The result of invoking the callback
        // is returned from this function.
        function lookAhead(callback) {
            return speculationHelper(callback, true);
        }
        // Invokes the provided callback.  If the callback returns something falsy, then it restores
        // the parser to the state it was in immediately prior to invoking the callback.  If the
        // callback returns something truthy, then the parser state is not rolled back.  The result
        // of invoking the callback is returned from this function.
        function tryParse(callback) {
            return speculationHelper(callback, false);
        }
        // Ignore strict mode flag because we will report an error in type checker instead.
        function isIdentifier() {
            if (token === 67 /* Identifier */) {
                return true;
            }
            // If we have a 'yield' keyword, and we're in the [yield] context, then 'yield' is
            // considered a keyword and is not an identifier.
            if (token === 112 /* YieldKeyword */ && inYieldContext()) {
                return false;
            }
            // If we have a 'await' keyword, and we're in the [Await] context, then 'await' is
            // considered a keyword and is not an identifier.
            if (token === 117 /* AwaitKeyword */ && inAwaitContext()) {
                return false;
            }
            return token > 103 /* LastReservedWord */;
        }
        function parseExpected(kind, diagnosticMessage, shouldAdvance) {
            if (shouldAdvance === void 0) { shouldAdvance = true; }
            if (token === kind) {
                if (shouldAdvance) {
                    nextToken();
                }
                return true;
            }
            // Report specific message if provided with one.  Otherwise, report generic fallback message.
            if (diagnosticMessage) {
                parseErrorAtCurrentToken(diagnosticMessage);
            }
            else {
                parseErrorAtCurrentToken(ts.Diagnostics._0_expected, ts.tokenToString(kind));
            }
            return false;
        }
        function parseOptional(t) {
            if (token === t) {
                nextToken();
                return true;
            }
            return false;
        }
        function parseOptionalToken(t) {
            if (token === t) {
                return parseTokenNode();
            }
            return undefined;
        }
        function parseExpectedToken(t, reportAtCurrentPosition, diagnosticMessage, arg0) {
            return parseOptionalToken(t) ||
                createMissingNode(t, reportAtCurrentPosition, diagnosticMessage, arg0);
        }
        function parseTokenNode() {
            var node = createNode(token);
            nextToken();
            return finishNode(node);
        }
        function canParseSemicolon() {
            // If there's a real semicolon, then we can always parse it out.
            if (token === 23 /* SemicolonToken */) {
                return true;
            }
            // We can parse out an optional semicolon in ASI cases in the following cases.
            return token === 16 /* CloseBraceToken */ || token === 1 /* EndOfFileToken */ || scanner.hasPrecedingLineBreak();
        }
        function parseSemicolon() {
            if (canParseSemicolon()) {
                if (token === 23 /* SemicolonToken */) {
                    // consume the semicolon if it was explicitly provided.
                    nextToken();
                }
                return true;
            }
            else {
                return parseExpected(23 /* SemicolonToken */);
            }
        }
        function createNode(kind, pos) {
            nodeCount++;
            var node = new (nodeConstructors[kind] || (nodeConstructors[kind] = objectAllocator.getNodeConstructor(kind)))();
            if (!(pos >= 0)) {
                pos = scanner.getStartPos();
            }
            node.pos = pos;
            node.end = pos;
            return node;
        }
        function finishNode(node, end) {
            node.end = end === undefined ? scanner.getStartPos() : end;
            if (contextFlags) {
                node.parserContextFlags = contextFlags;
            }
            // Keep track on the node if we encountered an error while parsing it.  If we did, then
            // we cannot reuse the node incrementally.  Once we've marked this node, clear out the
            // flag so that we don't mark any subsequent nodes.
            if (parseErrorBeforeNextFinishedNode) {
                parseErrorBeforeNextFinishedNode = false;
                node.parserContextFlags |= 16 /* ThisNodeHasError */;
            }
            return node;
        }
        function createMissingNode(kind, reportAtCurrentPosition, diagnosticMessage, arg0) {
            if (reportAtCurrentPosition) {
                parseErrorAtPosition(scanner.getStartPos(), 0, diagnosticMessage, arg0);
            }
            else {
                parseErrorAtCurrentToken(diagnosticMessage, arg0);
            }
            var result = createNode(kind, scanner.getStartPos());
            result.text = "";
            return finishNode(result);
        }
        function internIdentifier(text) {
            text = ts.escapeIdentifier(text);
            return hasProperty(identifiers, text) ? identifiers[text] : (identifiers[text] = text);
        }
        // An identifier that starts with two underscores has an extra underscore character prepended to it to avoid issues
        // with magic property names like '__proto__'. The 'identifiers' object is used to share a single string instance for
        // each identifier in order to reduce memory consumption.
        function createIdentifier(isIdentifier, diagnosticMessage) {
            identifierCount++;
            if (isIdentifier) {
                var node = createNode(67 /* Identifier */);
                // Store original token kind if it is not just an Identifier so we can report appropriate error later in type checker
                if (token !== 67 /* Identifier */) {
                    node.originalKeywordKind = token;
                }
                node.text = internIdentifier(scanner.getTokenValue());
                nextToken();
                return finishNode(node);
            }
            return createMissingNode(67 /* Identifier */, false, diagnosticMessage || ts.Diagnostics.Identifier_expected);
        }
        function parseIdentifier(diagnosticMessage) {
            return createIdentifier(isIdentifier(), diagnosticMessage);
        }
        function parseIdentifierName() {
            return createIdentifier(isIdentifierOrKeyword());
        }
        function isLiteralPropertyName() {
            return isIdentifierOrKeyword() ||
                token === 9 /* StringLiteral */ ||
                token === 8 /* NumericLiteral */;
        }
        function parsePropertyNameWorker(allowComputedPropertyNames) {
            if (token === 9 /* StringLiteral */ || token === 8 /* NumericLiteral */) {
                return parseLiteralNode(true);
            }
            if (allowComputedPropertyNames && token === 19 /* OpenBracketToken */) {
                return parseComputedPropertyName();
            }
            return parseIdentifierName();
        }
        function parsePropertyName() {
            return parsePropertyNameWorker(true);
        }
        function parseSimplePropertyName() {
            return parsePropertyNameWorker(false);
        }
        function isSimplePropertyName() {
            return token === 9 /* StringLiteral */ || token === 8 /* NumericLiteral */ || isIdentifierOrKeyword();
        }
        function parseComputedPropertyName() {
            // PropertyName [Yield]:
            //      LiteralPropertyName
            //      ComputedPropertyName[?Yield]
            var node = createNode(134 /* ComputedPropertyName */);
            parseExpected(19 /* OpenBracketToken */);
            // We parse any expression (including a comma expression). But the grammar
            // says that only an assignment expression is allowed, so the grammar checker
            // will error if it sees a comma expression.
            node.expression = allowInAnd(parseExpression);
            parseExpected(20 /* CloseBracketToken */);
            return finishNode(node);
        }
        function parseContextualModifier(t) {
            return token === t && tryParse(nextTokenCanFollowModifier);
        }
        function nextTokenCanFollowModifier() {
            if (token === 72 /* ConstKeyword */) {
                // 'const' is only a modifier if followed by 'enum'.
                return nextToken() === 79 /* EnumKeyword */;
            }
            if (token === 80 /* ExportKeyword */) {
                nextToken();
                if (token === 75 /* DefaultKeyword */) {
                    return lookAhead(nextTokenIsClassOrFunction);
                }
                return token !== 37 /* AsteriskToken */ && token !== 15 /* OpenBraceToken */ && canFollowModifier();
            }
            if (token === 75 /* DefaultKeyword */) {
                return nextTokenIsClassOrFunction();
            }
            nextToken();
            return canFollowModifier();
        }
        function parseAnyContextualModifier() {
            return ts.isModifier(token) && tryParse(nextTokenCanFollowModifier);
        }
        function canFollowModifier() {
            return token === 19 /* OpenBracketToken */
                || token === 15 /* OpenBraceToken */
                || token === 37 /* AsteriskToken */
                || isLiteralPropertyName();
        }
        function nextTokenIsClassOrFunction() {
            nextToken();
            return token === 71 /* ClassKeyword */ || token === 85 /* FunctionKeyword */;
        }
        // True if positioned at the start of a list element
        function isListElement(parsingContext, inErrorRecovery) {
            var node = currentNode(parsingContext);
            if (node) {
                return true;
            }
            switch (parsingContext) {
                case 0 /* SourceElements */:
                case 1 /* BlockStatements */:
                case 3 /* SwitchClauseStatements */:
                    // If we're in error recovery, then we don't want to treat ';' as an empty statement.
                    // The problem is that ';' can show up in far too many contexts, and if we see one
                    // and assume it's a statement, then we may bail out inappropriately from whatever
                    // we're parsing.  For example, if we have a semicolon in the middle of a class, then
                    // we really don't want to assume the class is over and we're on a statement in the
                    // outer module.  We just want to consume and move on.
                    return !(token === 23 /* SemicolonToken */ && inErrorRecovery) && isStartOfStatement();
                case 2 /* SwitchClauses */:
                    return token === 69 /* CaseKeyword */ || token === 75 /* DefaultKeyword */;
                case 4 /* TypeMembers */:
                    return isStartOfTypeMember();
                case 5 /* ClassMembers */:
                    // We allow semicolons as class elements (as specified by ES6) as long as we're
                    // not in error recovery.  If we're in error recovery, we don't want an errant
                    // semicolon to be treated as a class member (since they're almost always used
                    // for statements.
                    return lookAhead(isClassMemberStart) || (token === 23 /* SemicolonToken */ && !inErrorRecovery);
                case 6 /* EnumMembers */:
                    // Include open bracket computed properties. This technically also lets in indexers,
                    // which would be a candidate for improved error reporting.
                    return token === 19 /* OpenBracketToken */ || isLiteralPropertyName();
                case 12 /* ObjectLiteralMembers */:
                    return token === 19 /* OpenBracketToken */ || token === 37 /* AsteriskToken */ || isLiteralPropertyName();
                case 9 /* ObjectBindingElements */:
                    return isLiteralPropertyName();
                case 7 /* HeritageClauseElement */:
                    // If we see { } then only consume it as an expression if it is followed by , or {
                    // That way we won't consume the body of a class in its heritage clause.
                    if (token === 15 /* OpenBraceToken */) {
                        return lookAhead(isValidHeritageClauseObjectLiteral);
                    }
                    if (!inErrorRecovery) {
                        return isStartOfLeftHandSideExpression() && !isHeritageClauseExtendsOrImplementsKeyword();
                    }
                    else {
                        // If we're in error recovery we tighten up what we're willing to match.
                        // That way we don't treat something like "this" as a valid heritage clause
                        // element during recovery.
                        return isIdentifier() && !isHeritageClauseExtendsOrImplementsKeyword();
                    }
                case 8 /* VariableDeclarations */:
                    return isIdentifierOrPattern();
                case 10 /* ArrayBindingElements */:
                    return token === 24 /* CommaToken */ || token === 22 /* DotDotDotToken */ || isIdentifierOrPattern();
                case 17 /* TypeParameters */:
                    return isIdentifier();
                case 11 /* ArgumentExpressions */:
                case 15 /* ArrayLiteralMembers */:
                    return token === 24 /* CommaToken */ || token === 22 /* DotDotDotToken */ || isStartOfExpression();
                case 16 /* Parameters */:
                    return isStartOfParameter();
                case 18 /* TypeArguments */:
                case 19 /* TupleElementTypes */:
                    return token === 24 /* CommaToken */ || isStartOfType();
                case 20 /* HeritageClauses */:
                    return isHeritageClause();
                case 21 /* ImportOrExportSpecifiers */:
                    return isIdentifierOrKeyword();
                case 13 /* JsxAttributes */:
                    return isIdentifierOrKeyword() || token === 15 /* OpenBraceToken */;
                case 14 /* JsxChildren */:
                    return true;
                case 22 /* JSDocFunctionParameters */:
                case 23 /* JSDocTypeArguments */:
                case 25 /* JSDocTupleTypes */:
                    return JSDocParser.isJSDocType();
                case 24 /* JSDocRecordMembers */:
                    return isSimplePropertyName();
            }
            Debug.fail("Non-exhaustive case in 'isListElement'.");
        }
        function isValidHeritageClauseObjectLiteral() {
            Debug.assert(token === 15 /* OpenBraceToken */);
            if (nextToken() === 16 /* CloseBraceToken */) {
                // if we see  "extends {}" then only treat the {} as what we're extending (and not
                // the class body) if we have:
                //
                //      extends {} {
                //      extends {},
                //      extends {} extends
                //      extends {} implements
                var next = nextToken();
                return next === 24 /* CommaToken */ || next === 15 /* OpenBraceToken */ || next === 81 /* ExtendsKeyword */ || next === 104 /* ImplementsKeyword */;
            }
            return true;
        }
        function nextTokenIsIdentifier() {
            nextToken();
            return isIdentifier();
        }
        function nextTokenIsIdentifierOrKeyword() {
            nextToken();
            return isIdentifierOrKeyword();
        }
        function isHeritageClauseExtendsOrImplementsKeyword() {
            if (token === 104 /* ImplementsKeyword */ ||
                token === 81 /* ExtendsKeyword */) {
                return lookAhead(nextTokenIsStartOfExpression);
            }
            return false;
        }
        function nextTokenIsStartOfExpression() {
            nextToken();
            return isStartOfExpression();
        }
        // True if positioned at a list terminator
        function isListTerminator(kind) {
            if (token === 1 /* EndOfFileToken */) {
                // Being at the end of the file ends all lists.
                return true;
            }
            switch (kind) {
                case 1 /* BlockStatements */:
                case 2 /* SwitchClauses */:
                case 4 /* TypeMembers */:
                case 5 /* ClassMembers */:
                case 6 /* EnumMembers */:
                case 12 /* ObjectLiteralMembers */:
                case 9 /* ObjectBindingElements */:
                case 21 /* ImportOrExportSpecifiers */:
                    return token === 16 /* CloseBraceToken */;
                case 3 /* SwitchClauseStatements */:
                    return token === 16 /* CloseBraceToken */ || token === 69 /* CaseKeyword */ || token === 75 /* DefaultKeyword */;
                case 7 /* HeritageClauseElement */:
                    return token === 15 /* OpenBraceToken */ || token === 81 /* ExtendsKeyword */ || token === 104 /* ImplementsKeyword */;
                case 8 /* VariableDeclarations */:
                    return isVariableDeclaratorListTerminator();
                case 17 /* TypeParameters */:
                    // Tokens other than '>' are here for better error recovery
                    return token === 27 /* GreaterThanToken */ || token === 17 /* OpenParenToken */ || token === 15 /* OpenBraceToken */ || token === 81 /* ExtendsKeyword */ || token === 104 /* ImplementsKeyword */;
                case 11 /* ArgumentExpressions */:
                    // Tokens other than ')' are here for better error recovery
                    return token === 18 /* CloseParenToken */ || token === 23 /* SemicolonToken */;
                case 15 /* ArrayLiteralMembers */:
                case 19 /* TupleElementTypes */:
                case 10 /* ArrayBindingElements */:
                    return token === 20 /* CloseBracketToken */;
                case 16 /* Parameters */:
                    // Tokens other than ')' and ']' (the latter for index signatures) are here for better error recovery
                    return token === 18 /* CloseParenToken */ || token === 20 /* CloseBracketToken */ /*|| token === SyntaxKind.OpenBraceToken*/;
                case 18 /* TypeArguments */:
                    // Tokens other than '>' are here for better error recovery
                    return token === 27 /* GreaterThanToken */ || token === 17 /* OpenParenToken */;
                case 20 /* HeritageClauses */:
                    return token === 15 /* OpenBraceToken */ || token === 16 /* CloseBraceToken */;
                case 13 /* JsxAttributes */:
                    return token === 27 /* GreaterThanToken */ || token === 38 /* SlashToken */;
                case 14 /* JsxChildren */:
                    return token === 25 /* LessThanToken */ && lookAhead(nextTokenIsSlash);
                case 22 /* JSDocFunctionParameters */:
                    return token === 18 /* CloseParenToken */ || token === 53 /* ColonToken */ || token === 16 /* CloseBraceToken */;
                case 23 /* JSDocTypeArguments */:
                    return token === 27 /* GreaterThanToken */ || token === 16 /* CloseBraceToken */;
                case 25 /* JSDocTupleTypes */:
                    return token === 20 /* CloseBracketToken */ || token === 16 /* CloseBraceToken */;
                case 24 /* JSDocRecordMembers */:
                    return token === 16 /* CloseBraceToken */;
            }
        }
        function isVariableDeclaratorListTerminator() {
            // If we can consume a semicolon (either explicitly, or with ASI), then consider us done
            // with parsing the list of  variable declarators.
            if (canParseSemicolon()) {
                return true;
            }
            // in the case where we're parsing the variable declarator of a 'for-in' statement, we
            // are done if we see an 'in' keyword in front of us. Same with for-of
            if (isInOrOfKeyword(token)) {
                return true;
            }
            // ERROR RECOVERY TWEAK:
            // For better error recovery, if we see an '=>' then we just stop immediately.  We've got an
            // arrow function here and it's going to be very unlikely that we'll resynchronize and get
            // another variable declaration.
            if (token === 34 /* EqualsGreaterThanToken */) {
                return true;
            }
            // Keep trying to parse out variable declarators.
            return false;
        }
        // True if positioned at element or terminator of the current list or any enclosing list
        function isInSomeParsingContext() {
            for (var kind = 0; kind < 26 /* Count */; kind++) {
                if (parsingContext & (1 << kind)) {
                    if (isListElement(kind, true) || isListTerminator(kind)) {
                        return true;
                    }
                }
            }
            return false;
        }
        // Parses a list of elements
        function parseList(kind, parseElement) {
            var saveParsingContext = parsingContext;
            parsingContext |= 1 << kind;
            var result = [];
            result.pos = getNodePos();
            while (!isListTerminator(kind)) {
                if (isListElement(kind, false)) {
                    var element = parseListElement(kind, parseElement);
                    result.push(element);
                    continue;
                }
                if (abortParsingListOrMoveToNextToken(kind)) {
                    break;
                }
            }
            result.end = getNodeEnd();
            parsingContext = saveParsingContext;
            return result;
        }
        function parseListElement(parsingContext, parseElement) {
            var node = currentNode(parsingContext);
            if (node) {
                return consumeNode(node);
            }
            return parseElement();
        }
        function currentNode(parsingContext) {
            // If there is an outstanding parse error that we've encountered, but not attached to
            // some node, then we cannot get a node from the old source tree.  This is because we
            // want to mark the next node we encounter as being unusable.
            //
            // Note: This may be too conservative.  Perhaps we could reuse the node and set the bit
            // on it (or its leftmost child) as having the error.  For now though, being conservative
            // is nice and likely won't ever affect perf.
            if (parseErrorBeforeNextFinishedNode) {
                return undefined;
            }
            if (!syntaxCursor) {
                // if we don't have a cursor, we could never return a node from the old tree.
                return undefined;
            }
            var node = syntaxCursor.currentNode(scanner.getStartPos());
            // Can't reuse a missing node.
            if (ts.nodeIsMissing(node)) {
                return undefined;
            }
            // Can't reuse a node that intersected the change range.
            if (node.intersectsChange) {
                return undefined;
            }
            // Can't reuse a node that contains a parse error.  This is necessary so that we
            // produce the same set of errors again.
            if (ts.containsParseError(node)) {
                return undefined;
            }
            // We can only reuse a node if it was parsed under the same strict mode that we're
            // currently in.  i.e. if we originally parsed a node in non-strict mode, but then
            // the user added 'using strict' at the top of the file, then we can't use that node
            // again as the presense of strict mode may cause us to parse the tokens in the file
            // differetly.
            //
            // Note: we *can* reuse tokens when the strict mode changes.  That's because tokens
            // are unaffected by strict mode.  It's just the parser will decide what to do with it
            // differently depending on what mode it is in.
            //
            // This also applies to all our other context flags as well.
            var nodeContextFlags = node.parserContextFlags & 31 /* ParserGeneratedFlags */;
            if (nodeContextFlags !== contextFlags) {
                return undefined;
            }
            // Ok, we have a node that looks like it could be reused.  Now verify that it is valid
            // in the currest list parsing context that we're currently at.
            if (!canReuseNode(node, parsingContext)) {
                return undefined;
            }
            return node;
        }
        function consumeNode(node) {
            // Move the scanner so it is after the node we just consumed.
            scanner.setTextPos(node.end);
            nextToken();
            return node;
        }
        function canReuseNode(node, parsingContext) {
            switch (parsingContext) {
                case 5 /* ClassMembers */:
                    return isReusableClassMember(node);
                case 2 /* SwitchClauses */:
                    return isReusableSwitchClause(node);
                case 0 /* SourceElements */:
                case 1 /* BlockStatements */:
                case 3 /* SwitchClauseStatements */:
                    return isReusableStatement(node);
                case 6 /* EnumMembers */:
                    return isReusableEnumMember(node);
                case 4 /* TypeMembers */:
                    return isReusableTypeMember(node);
                case 8 /* VariableDeclarations */:
                    return isReusableVariableDeclaration(node);
                case 16 /* Parameters */:
                    return isReusableParameter(node);
                // Any other lists we do not care about reusing nodes in.  But feel free to add if
                // you can do so safely.  Danger areas involve nodes that may involve speculative
                // parsing.  If speculative parsing is involved with the node, then the range the
                // parser reached while looking ahead might be in the edited range (see the example
                // in canReuseVariableDeclaratorNode for a good case of this).
                case 20 /* HeritageClauses */:
                // This would probably be safe to reuse.  There is no speculative parsing with
                // heritage clauses.
                case 17 /* TypeParameters */:
                // This would probably be safe to reuse.  There is no speculative parsing with
                // type parameters.  Note that that's because type *parameters* only occur in
                // unambiguous *type* contexts.  While type *arguments* occur in very ambiguous
                // *expression* contexts.
                case 19 /* TupleElementTypes */:
                // This would probably be safe to reuse.  There is no speculative parsing with
                // tuple types.
                // Technically, type argument list types are probably safe to reuse.  While
                // speculative parsing is involved with them (since type argument lists are only
                // produced from speculative parsing a < as a type argument list), we only have
                // the types because speculative parsing succeeded.  Thus, the lookahead never
                // went past the end of the list and rewound.
                case 18 /* TypeArguments */:
                // Note: these are almost certainly not safe to ever reuse.  Expressions commonly
                // need a large amount of lookahead, and we should not reuse them as they may
                // have actually intersected the edit.
                case 11 /* ArgumentExpressions */:
                // This is not safe to reuse for the same reason as the 'AssignmentExpression'
                // cases.  i.e. a property assignment may end with an expression, and thus might
                // have lookahead far beyond it's old node.
                case 12 /* ObjectLiteralMembers */:
                // This is probably not safe to reuse.  There can be speculative parsing with
                // type names in a heritage clause.  There can be generic names in the type
                // name list, and there can be left hand side expressions (which can have type
                // arguments.)
                case 7 /* HeritageClauseElement */:
                // Perhaps safe to reuse, but it's unlikely we'd see more than a dozen attributes
                // on any given element. Same for children.
                case 13 /* JsxAttributes */:
                case 14 /* JsxChildren */:
            }
            return false;
        }
        function isReusableClassMember(node) {
            if (node) {
                switch (node.kind) {
                    case 142 /* Constructor */:
                    case 147 /* IndexSignature */:
                    case 143 /* GetAccessor */:
                    case 144 /* SetAccessor */:
                    case 139 /* PropertyDeclaration */:
                    case 189 /* SemicolonClassElement */:
                        return true;
                    case 141 /* MethodDeclaration */:
                        // Method declarations are not necessarily reusable.  An object-literal
                        // may have a method calls "constructor(...)" and we must reparse that
                        // into an actual .ConstructorDeclaration.
                        var methodDeclaration = node;
                        var nameIsConstructor = methodDeclaration.name.kind === 67 /* Identifier */ &&
                            methodDeclaration.name.originalKeywordKind === 119 /* ConstructorKeyword */;
                        return !nameIsConstructor;
                }
            }
            return false;
        }
        function isReusableSwitchClause(node) {
            if (node) {
                switch (node.kind) {
                    case 239 /* CaseClause */:
                    case 240 /* DefaultClause */:
                        return true;
                }
            }
            return false;
        }
        function isReusableStatement(node) {
            if (node) {
                switch (node.kind) {
                    case 211 /* FunctionDeclaration */:
                    case 191 /* VariableStatement */:
                    case 190 /* Block */:
                    case 194 /* IfStatement */:
                    case 193 /* ExpressionStatement */:
                    case 206 /* ThrowStatement */:
                    case 202 /* ReturnStatement */:
                    case 204 /* SwitchStatement */:
                    case 201 /* BreakStatement */:
                    case 200 /* ContinueStatement */:
                    case 198 /* ForInStatement */:
                    case 199 /* ForOfStatement */:
                    case 197 /* ForStatement */:
                    case 196 /* WhileStatement */:
                    case 203 /* WithStatement */:
                    case 192 /* EmptyStatement */:
                    case 207 /* TryStatement */:
                    case 205 /* LabeledStatement */:
                    case 195 /* DoStatement */:
                    case 208 /* DebuggerStatement */:
                    case 220 /* ImportDeclaration */:
                    case 219 /* ImportEqualsDeclaration */:
                    case 226 /* ExportDeclaration */:
                    case 225 /* ExportAssignment */:
                    case 216 /* ModuleDeclaration */:
                    case 212 /* ClassDeclaration */:
                    case 213 /* InterfaceDeclaration */:
                    case 215 /* EnumDeclaration */:
                    case 214 /* TypeAliasDeclaration */:
                        return true;
                }
            }
            return false;
        }
        function isReusableEnumMember(node) {
            return node.kind === 245 /* EnumMember */;
        }
        function isReusableTypeMember(node) {
            if (node) {
                switch (node.kind) {
                    case 146 /* ConstructSignature */:
                    case 140 /* MethodSignature */:
                    case 147 /* IndexSignature */:
                    case 138 /* PropertySignature */:
                    case 145 /* CallSignature */:
                        return true;
                }
            }
            return false;
        }
        function isReusableVariableDeclaration(node) {
            if (node.kind !== 209 /* VariableDeclaration */) {
                return false;
            }
            // Very subtle incremental parsing bug.  Consider the following code:
            //
            //      let v = new List < A, B
            //
            // This is actually legal code.  It's a list of variable declarators "v = new List<A"
            // on one side and "B" on the other. If you then change that to:
            //
            //      let v = new List < A, B >()
            //
            // then we have a problem.  "v = new List<A" doesn't intersect the change range, so we
            // start reparsing at "B" and we completely fail to handle this properly.
            //
            // In order to prevent this, we do not allow a variable declarator to be reused if it
            // has an initializer.
            var variableDeclarator = node;
            return variableDeclarator.initializer === undefined;
        }
        function isReusableParameter(node) {
            if (node.kind !== 136 /* Parameter */) {
                return false;
            }
            // See the comment in isReusableVariableDeclaration for why we do this.
            var parameter = node;
            return parameter.initializer === undefined;
        }
        // Returns true if we should abort parsing.
        function abortParsingListOrMoveToNextToken(kind) {
            parseErrorAtCurrentToken(parsingContextErrors(kind));
            if (isInSomeParsingContext()) {
                return true;
            }
            nextToken();
            return false;
        }
        function parsingContextErrors(context) {
            switch (context) {
                case 0 /* SourceElements */: return ts.Diagnostics.Declaration_or_statement_expected;
                case 1 /* BlockStatements */: return ts.Diagnostics.Declaration_or_statement_expected;
                case 2 /* SwitchClauses */: return ts.Diagnostics.case_or_default_expected;
                case 3 /* SwitchClauseStatements */: return ts.Diagnostics.Statement_expected;
                case 4 /* TypeMembers */: return ts.Diagnostics.Property_or_signature_expected;
                case 5 /* ClassMembers */: return ts.Diagnostics.Unexpected_token_A_constructor_method_accessor_or_property_was_expected;
                case 6 /* EnumMembers */: return ts.Diagnostics.Enum_member_expected;
                case 7 /* HeritageClauseElement */: return ts.Diagnostics.Expression_expected;
                case 8 /* VariableDeclarations */: return ts.Diagnostics.Variable_declaration_expected;
                case 9 /* ObjectBindingElements */: return ts.Diagnostics.Property_destructuring_pattern_expected;
                case 10 /* ArrayBindingElements */: return ts.Diagnostics.Array_element_destructuring_pattern_expected;
                case 11 /* ArgumentExpressions */: return ts.Diagnostics.Argument_expression_expected;
                case 12 /* ObjectLiteralMembers */: return ts.Diagnostics.Property_assignment_expected;
                case 15 /* ArrayLiteralMembers */: return ts.Diagnostics.Expression_or_comma_expected;
                case 16 /* Parameters */: return ts.Diagnostics.Parameter_declaration_expected;
                case 17 /* TypeParameters */: return ts.Diagnostics.Type_parameter_declaration_expected;
                case 18 /* TypeArguments */: return ts.Diagnostics.Type_argument_expected;
                case 19 /* TupleElementTypes */: return ts.Diagnostics.Type_expected;
                case 20 /* HeritageClauses */: return ts.Diagnostics.Unexpected_token_expected;
                case 21 /* ImportOrExportSpecifiers */: return ts.Diagnostics.Identifier_expected;
                case 13 /* JsxAttributes */: return ts.Diagnostics.Identifier_expected;
                case 14 /* JsxChildren */: return ts.Diagnostics.Identifier_expected;
                case 22 /* JSDocFunctionParameters */: return ts.Diagnostics.Parameter_declaration_expected;
                case 23 /* JSDocTypeArguments */: return ts.Diagnostics.Type_argument_expected;
                case 25 /* JSDocTupleTypes */: return ts.Diagnostics.Type_expected;
                case 24 /* JSDocRecordMembers */: return ts.Diagnostics.Property_assignment_expected;
            }
        }
        ;
        // Parses a comma-delimited list of elements
        function parseDelimitedList(kind, parseElement, considerSemicolonAsDelimeter) {
            var saveParsingContext = parsingContext;
            parsingContext |= 1 << kind;
            var result = [];
            result.pos = getNodePos();
            var commaStart = -1; // Meaning the previous token was not a comma
            while (true) {
                if (isListElement(kind, false)) {
                    result.push(parseListElement(kind, parseElement));
                    commaStart = scanner.getTokenPos();
                    if (parseOptional(24 /* CommaToken */)) {
                        continue;
                    }
                    commaStart = -1; // Back to the state where the last token was not a comma
                    if (isListTerminator(kind)) {
                        break;
                    }
                    // We didn't get a comma, and the list wasn't terminated, explicitly parse
                    // out a comma so we give a good error message.
                    parseExpected(24 /* CommaToken */);
                    // If the token was a semicolon, and the caller allows that, then skip it and
                    // continue.  This ensures we get back on track and don't result in tons of
                    // parse errors.  For example, this can happen when people do things like use
                    // a semicolon to delimit object literal members.   Note: we'll have already
                    // reported an error when we called parseExpected above.
                    if (considerSemicolonAsDelimeter && token === 23 /* SemicolonToken */ && !scanner.hasPrecedingLineBreak()) {
                        nextToken();
                    }
                    continue;
                }
                if (isListTerminator(kind)) {
                    break;
                }
                if (abortParsingListOrMoveToNextToken(kind)) {
                    break;
                }
            }
            // Recording the trailing comma is deliberately done after the previous
            // loop, and not just if we see a list terminator. This is because the list
            // may have ended incorrectly, but it is still important to know if there
            // was a trailing comma.
            // Check if the last token was a comma.
            if (commaStart >= 0) {
                // Always preserve a trailing comma by marking it on the NodeArray
                result.hasTrailingComma = true;
            }
            result.end = getNodeEnd();
            parsingContext = saveParsingContext;
            return result;
        }
        function createMissingList() {
            var pos = getNodePos();
            var result = [];
            result.pos = pos;
            result.end = pos;
            return result;
        }
        function parseBracketedList(kind, parseElement, open, close) {
            if (parseExpected(open)) {
                var result = parseDelimitedList(kind, parseElement);
                parseExpected(close);
                return result;
            }
            return createMissingList();
        }
        // The allowReservedWords parameter controls whether reserved words are permitted after the first dot
        function parseEntityName(allowReservedWords, diagnosticMessage) {
            var entity = parseIdentifier(diagnosticMessage);
            while (parseOptional(21 /* DotToken */)) {
                var node = createNode(133 /* QualifiedName */, entity.pos);
                node.left = entity;
                node.right = parseRightSideOfDot(allowReservedWords);
                entity = finishNode(node);
            }
            return entity;
        }
        function parseRightSideOfDot(allowIdentifierNames) {
            // Technically a keyword is valid here as all identifiers and keywords are identifier names.
            // However, often we'll encounter this in error situations when the identifier or keyword
            // is actually starting another valid construct.
            //
            // So, we check for the following specific case:
            //
            //      name.
            //      identifierOrKeyword identifierNameOrKeyword
            //
            // Note: the newlines are important here.  For example, if that above code
            // were rewritten into:
            //
            //      name.identifierOrKeyword
            //      identifierNameOrKeyword
            //
            // Then we would consider it valid.  That's because ASI would take effect and
            // the code would be implicitly: "name.identifierOrKeyword; identifierNameOrKeyword".
            // In the first case though, ASI will not take effect because there is not a
            // line terminator after the identifier or keyword.
            if (scanner.hasPrecedingLineBreak() && isIdentifierOrKeyword()) {
                var matchesPattern = lookAhead(nextTokenIsIdentifierOrKeywordOnSameLine);
                if (matchesPattern) {
                    // Report that we need an identifier.  However, report it right after the dot,
                    // and not on the next token.  This is because the next token might actually
                    // be an identifier and the error would be quite confusing.
                    return createMissingNode(67 /* Identifier */, true, ts.Diagnostics.Identifier_expected);
                }
            }
            return allowIdentifierNames ? parseIdentifierName() : parseIdentifier();
        }
        function parseTemplateExpression() {
            var template = createNode(181 /* TemplateExpression */);
            template.head = parseLiteralNode();
            Debug.assert(template.head.kind === 12 /* TemplateHead */, "Template head has wrong token kind");
            var templateSpans = [];
            templateSpans.pos = getNodePos();
            do {
                templateSpans.push(parseTemplateSpan());
            } while (lastOrUndefined(templateSpans).literal.kind === 13 /* TemplateMiddle */);
            templateSpans.end = getNodeEnd();
            template.templateSpans = templateSpans;
            return finishNode(template);
        }
        function parseTemplateSpan() {
            var span = createNode(188 /* TemplateSpan */);
            span.expression = allowInAnd(parseExpression);
            var literal;
            if (token === 16 /* CloseBraceToken */) {
                reScanTemplateToken();
                literal = parseLiteralNode();
            }
            else {
                literal = parseExpectedToken(14 /* TemplateTail */, false, ts.Diagnostics._0_expected, ts.tokenToString(16 /* CloseBraceToken */));
            }
            span.literal = literal;
            return finishNode(span);
        }
        function parseLiteralNode(internName) {
            var node = createNode(token);
            var text = scanner.getTokenValue();
            node.text = internName ? internIdentifier(text) : text;
            if (scanner.hasExtendedUnicodeEscape()) {
                node.hasExtendedUnicodeEscape = true;
            }
            if (scanner.isUnterminated()) {
                node.isUnterminated = true;
            }
            var tokenPos = scanner.getTokenPos();
            nextToken();
            finishNode(node);
            // Octal literals are not allowed in strict mode or ES5
            // Note that theoretically the following condition would hold true literals like 009,
            // which is not octal.But because of how the scanner separates the tokens, we would
            // never get a token like this. Instead, we would get 00 and 9 as two separate tokens.
            // We also do not need to check for negatives because any prefix operator would be part of a
            // parent unary expression.
            if (node.kind === 8 /* NumericLiteral */
                && sourceText.charCodeAt(tokenPos) === 48 /* _0 */
                && ts.isOctalDigit(sourceText.charCodeAt(tokenPos + 1))) {
                node.flags |= 65536 /* OctalLiteral */;
            }
            return node;
        }
        // TYPES
        function parseTypeReferenceOrTypePredicate() {
            var typeName = parseEntityName(false, ts.Diagnostics.Type_expected);
            if (typeName.kind === 67 /* Identifier */ && token === 122 /* IsKeyword */ && !scanner.hasPrecedingLineBreak()) {
                nextToken();
                var node_1 = createNode(148 /* TypePredicate */, typeName.pos);
                node_1.parameterName = typeName;
                node_1.type = parseType();
                return finishNode(node_1);
            }
            var node = createNode(149 /* TypeReference */, typeName.pos);
            node.typeName = typeName;
            if (!scanner.hasPrecedingLineBreak() && token === 25 /* LessThanToken */) {
                node.typeArguments = parseBracketedList(18 /* TypeArguments */, parseType, 25 /* LessThanToken */, 27 /* GreaterThanToken */);
            }
            return finishNode(node);
        }
        function parseTypeQuery() {
            var node = createNode(152 /* TypeQuery */);
            parseExpected(99 /* TypeOfKeyword */);
            node.exprName = parseEntityName(true);
            return finishNode(node);
        }
        function parseTypeParameter() {
            var node = createNode(135 /* TypeParameter */);
            node.name = parseIdentifier();
            if (parseOptional(81 /* ExtendsKeyword */)) {
                // It's not uncommon for people to write improper constraints to a generic.  If the
                // user writes a constraint that is an expression and not an actual type, then parse
                // it out as an expression (so we can recover well), but report that a type is needed
                // instead.
                if (isStartOfType() || !isStartOfExpression()) {
                    node.constraint = parseType();
                }
                else {
                    // It was not a type, and it looked like an expression.  Parse out an expression
                    // here so we recover well.  Note: it is important that we call parseUnaryExpression
                    // and not parseExpression here.  If the user has:
                    //
                    //      <T extends "">
                    //
                    // We do *not* want to consume the  >  as we're consuming the expression for "".
                    node.expression = parseUnaryExpressionOrHigher();
                }
            }
            return finishNode(node);
        }
        function parseTypeParameters() {
            if (token === 25 /* LessThanToken */) {
                return parseBracketedList(17 /* TypeParameters */, parseTypeParameter, 25 /* LessThanToken */, 27 /* GreaterThanToken */);
            }
        }
        function parseParameterType() {
            if (parseOptional(53 /* ColonToken */)) {
                return token === 9 /* StringLiteral */
                    ? parseLiteralNode(true)
                    : parseType();
            }
            return undefined;
        }
        function isStartOfParameter() {
            return token === 22 /* DotDotDotToken */ || isIdentifierOrPattern() || ts.isModifier(token) || token === 54 /* AtToken */;
        }
        function setModifiers(node, modifiers) {
            if (modifiers) {
                node.flags |= modifiers.flags;
                node.modifiers = modifiers;
            }
        }
        function parseParameter() {
            var node = createNode(136 /* Parameter */);
            node.decorators = parseDecorators();
            setModifiers(node, parseModifiers());
            node.dotDotDotToken = parseOptionalToken(22 /* DotDotDotToken */);
            // FormalParameter [Yield,Await]:
            //      BindingElement[?Yield,?Await]
            node.name = parseIdentifierOrPattern();
            if (ts.getFullWidth(node.name) === 0 && node.flags === 0 && ts.isModifier(token)) {
                // in cases like
                // 'use strict'
                // function foo(static)
                // isParameter('static') === true, because of isModifier('static')
                // however 'static' is not a legal identifier in a strict mode.
                // so result of this function will be ParameterDeclaration (flags = 0, name = missing, type = undefined, initializer = undefined)
                // and current token will not change => parsing of the enclosing parameter list will last till the end of time (or OOM)
                // to avoid this we'll advance cursor to the next token.
                nextToken();
            }
            node.questionToken = parseOptionalToken(52 /* QuestionToken */);
            node.type = parseParameterType();
            node.initializer = parseBindingElementInitializer(true);
            // Do not check for initializers in an ambient context for parameters. This is not
            // a grammar error because the grammar allows arbitrary call signatures in
            // an ambient context.
            // It is actually not necessary for this to be an error at all. The reason is that
            // function/constructor implementations are syntactically disallowed in ambient
            // contexts. In addition, parameter initializers are semantically disallowed in
            // overload signatures. So parameter initializers are transitively disallowed in
            // ambient contexts.
            return finishNode(node);
        }
        function parseBindingElementInitializer(inParameter) {
            return inParameter ? parseParameterInitializer() : parseNonParameterInitializer();
        }
        function parseParameterInitializer() {
            return parseInitializer(true);
        }
        function fillSignature(returnToken, yieldContext, awaitContext, requireCompleteParameterList, signature) {
            var returnTokenRequired = returnToken === 34 /* EqualsGreaterThanToken */;
            signature.typeParameters = parseTypeParameters();
            signature.parameters = parseParameterList(yieldContext, awaitContext, requireCompleteParameterList);
            if (returnTokenRequired) {
                parseExpected(returnToken);
                signature.type = parseType();
            }
            else if (parseOptional(returnToken)) {
                signature.type = parseType();
            }
        }
        function parseParameterList(yieldContext, awaitContext, requireCompleteParameterList) {
            // FormalParameters [Yield,Await]: (modified)
            //      [empty]
            //      FormalParameterList[?Yield,Await]
            //
            // FormalParameter[Yield,Await]: (modified)
            //      BindingElement[?Yield,Await]
            //
            // BindingElement [Yield,Await]: (modified)
            //      SingleNameBinding[?Yield,?Await]
            //      BindingPattern[?Yield,?Await]Initializer [In, ?Yield,?Await] opt
            //
            // SingleNameBinding [Yield,Await]:
            //      BindingIdentifier[?Yield,?Await]Initializer [In, ?Yield,?Await] opt
            if (parseExpected(17 /* OpenParenToken */)) {
                var savedYieldContext = inYieldContext();
                var savedAwaitContext = inAwaitContext();
                setYieldContext(yieldContext);
                setAwaitContext(awaitContext);
                var result = parseDelimitedList(16 /* Parameters */, parseParameter);
                setYieldContext(savedYieldContext);
                setAwaitContext(savedAwaitContext);
                if (!parseExpected(18 /* CloseParenToken */) && requireCompleteParameterList) {
                    // Caller insisted that we had to end with a )   We didn't.  So just return
                    // undefined here.
                    return undefined;
                }
                return result;
            }
            // We didn't even have an open paren.  If the caller requires a complete parameter list,
            // we definitely can't provide that.  However, if they're ok with an incomplete one,
            // then just return an empty set of parameters.
            return requireCompleteParameterList ? undefined : createMissingList();
        }
        function parseTypeMemberSemicolon() {
            // We allow type members to be separated by commas or (possibly ASI) semicolons.
            // First check if it was a comma.  If so, we're done with the member.
            if (parseOptional(24 /* CommaToken */)) {
                return;
            }
            // Didn't have a comma.  We must have a (possible ASI) semicolon.
            parseSemicolon();
        }
        function parseSignatureMember(kind) {
            var node = createNode(kind);
            if (kind === 146 /* ConstructSignature */) {
                parseExpected(90 /* NewKeyword */);
            }
            fillSignature(53 /* ColonToken */, false, false, false, node);
            parseTypeMemberSemicolon();
            return finishNode(node);
        }
        function isIndexSignature() {
            if (token !== 19 /* OpenBracketToken */) {
                return false;
            }
            return lookAhead(isUnambiguouslyIndexSignature);
        }
        function isUnambiguouslyIndexSignature() {
            // The only allowed sequence is:
            //
            //   [id:
            //
            // However, for error recovery, we also check the following cases:
            //
            //   [...
            //   [id,
            //   [id?,
            //   [id?:
            //   [id?]
            //   [public id
            //   [private id
            //   [protected id
            //   []
            //
            nextToken();
            if (token === 22 /* DotDotDotToken */ || token === 20 /* CloseBracketToken */) {
                return true;
            }
            if (ts.isModifier(token)) {
                nextToken();
                if (isIdentifier()) {
                    return true;
                }
            }
            else if (!isIdentifier()) {
                return false;
            }
            else {
                // Skip the identifier
                nextToken();
            }
            // A colon signifies a well formed indexer
            // A comma should be a badly formed indexer because comma expressions are not allowed
            // in computed properties.
            if (token === 53 /* ColonToken */ || token === 24 /* CommaToken */) {
                return true;
            }
            // Question mark could be an indexer with an optional property,
            // or it could be a conditional expression in a computed property.
            if (token !== 52 /* QuestionToken */) {
                return false;
            }
            // If any of the following tokens are after the question mark, it cannot
            // be a conditional expression, so treat it as an indexer.
            nextToken();
            return token === 53 /* ColonToken */ || token === 24 /* CommaToken */ || token === 20 /* CloseBracketToken */;
        }
        function parseIndexSignatureDeclaration(fullStart, decorators, modifiers) {
            var node = createNode(147 /* IndexSignature */, fullStart);
            node.decorators = decorators;
            setModifiers(node, modifiers);
            node.parameters = parseBracketedList(16 /* Parameters */, parseParameter, 19 /* OpenBracketToken */, 20 /* CloseBracketToken */);
            node.type = parseTypeAnnotation();
            parseTypeMemberSemicolon();
            return finishNode(node);
        }
        function parsePropertyOrMethodSignature() {
            var fullStart = scanner.getStartPos();
            var name = parsePropertyName();
            var questionToken = parseOptionalToken(52 /* QuestionToken */);
            if (token === 17 /* OpenParenToken */ || token === 25 /* LessThanToken */) {
                var method = createNode(140 /* MethodSignature */, fullStart);
                method.name = name;
                method.questionToken = questionToken;
                // Method signatues don't exist in expression contexts.  So they have neither
                // [Yield] nor [Await]
                fillSignature(53 /* ColonToken */, false, false, false, method);
                parseTypeMemberSemicolon();
                return finishNode(method);
            }
            else {
                var property = createNode(138 /* PropertySignature */, fullStart);
                property.name = name;
                property.questionToken = questionToken;
                property.type = parseTypeAnnotation();
                parseTypeMemberSemicolon();
                return finishNode(property);
            }
        }
        function isStartOfTypeMember() {
            switch (token) {
                case 17 /* OpenParenToken */:
                case 25 /* LessThanToken */:
                case 19 /* OpenBracketToken */:
                    return true;
                default:
                    if (ts.isModifier(token)) {
                        var result = lookAhead(isStartOfIndexSignatureDeclaration);
                        if (result) {
                            return result;
                        }
                    }
                    return isLiteralPropertyName() && lookAhead(isTypeMemberWithLiteralPropertyName);
            }
        }
        function isStartOfIndexSignatureDeclaration() {
            while (ts.isModifier(token)) {
                nextToken();
            }
            return isIndexSignature();
        }
        function isTypeMemberWithLiteralPropertyName() {
            nextToken();
            return token === 17 /* OpenParenToken */ ||
                token === 25 /* LessThanToken */ ||
                token === 52 /* QuestionToken */ ||
                token === 53 /* ColonToken */ ||
                canParseSemicolon();
        }
        function parseTypeMember() {
            switch (token) {
                case 17 /* OpenParenToken */:
                case 25 /* LessThanToken */:
                    return parseSignatureMember(145 /* CallSignature */);
                case 19 /* OpenBracketToken */:
                    // Indexer or computed property
                    return isIndexSignature()
                        ? parseIndexSignatureDeclaration(scanner.getStartPos(), undefined, undefined)
                        : parsePropertyOrMethodSignature();
                case 90 /* NewKeyword */:
                    if (lookAhead(isStartOfConstructSignature)) {
                        return parseSignatureMember(146 /* ConstructSignature */);
                    }
                // fall through.
                case 9 /* StringLiteral */:
                case 8 /* NumericLiteral */:
                    return parsePropertyOrMethodSignature();
                default:
                    // Index declaration as allowed as a type member.  But as per the grammar,
                    // they also allow modifiers. So we have to check for an index declaration
                    // that might be following modifiers. This ensures that things work properly
                    // when incrementally parsing as the parser will produce the Index declaration
                    // if it has the same text regardless of whether it is inside a class or an
                    // object type.
                    if (ts.isModifier(token)) {
                        var result = tryParse(parseIndexSignatureWithModifiers);
                        if (result) {
                            return result;
                        }
                    }
                    if (isIdentifierOrKeyword()) {
                        return parsePropertyOrMethodSignature();
                    }
            }
        }
        function parseIndexSignatureWithModifiers() {
            var fullStart = scanner.getStartPos();
            var decorators = parseDecorators();
            var modifiers = parseModifiers();
            return isIndexSignature()
                ? parseIndexSignatureDeclaration(fullStart, decorators, modifiers)
                : undefined;
        }
        function isStartOfConstructSignature() {
            nextToken();
            return token === 17 /* OpenParenToken */ || token === 25 /* LessThanToken */;
        }
        function parseTypeLiteral() {
            var node = createNode(153 /* TypeLiteral */);
            node.members = parseObjectTypeMembers();
            return finishNode(node);
        }
        function parseObjectTypeMembers() {
            var members;
            if (parseExpected(15 /* OpenBraceToken */)) {
                members = parseList(4 /* TypeMembers */, parseTypeMember);
                parseExpected(16 /* CloseBraceToken */);
            }
            else {
                members = createMissingList();
            }
            return members;
        }
        function parseTupleType() {
            var node = createNode(155 /* TupleType */);
            node.elementTypes = parseBracketedList(19 /* TupleElementTypes */, parseType, 19 /* OpenBracketToken */, 20 /* CloseBracketToken */);
            return finishNode(node);
        }
        function parseParenthesizedType() {
            var node = createNode(158 /* ParenthesizedType */);
            parseExpected(17 /* OpenParenToken */);
            node.type = parseType();
            parseExpected(18 /* CloseParenToken */);
            return finishNode(node);
        }
        function parseFunctionOrConstructorType(kind) {
            var node = createNode(kind);
            if (kind === 151 /* ConstructorType */) {
                parseExpected(90 /* NewKeyword */);
            }
            fillSignature(34 /* EqualsGreaterThanToken */, false, false, false, node);
            return finishNode(node);
        }
        function parseKeywordAndNoDot() {
            var node = parseTokenNode();
            return token === 21 /* DotToken */ ? undefined : node;
        }
        function parseNonArrayType() {
            switch (token) {
                case 115 /* AnyKeyword */:
                case 128 /* StringKeyword */:
                case 126 /* NumberKeyword */:
                case 118 /* BooleanKeyword */:
                case 129 /* SymbolKeyword */:
                    // If these are followed by a dot, then parse these out as a dotted type reference instead.
                    var node = tryParse(parseKeywordAndNoDot);
                    return node || parseTypeReferenceOrTypePredicate();
                case 101 /* VoidKeyword */:
                    return parseTokenNode();
                case 99 /* TypeOfKeyword */:
                    return parseTypeQuery();
                case 15 /* OpenBraceToken */:
                    return parseTypeLiteral();
                case 19 /* OpenBracketToken */:
                    return parseTupleType();
                case 17 /* OpenParenToken */:
                    return parseParenthesizedType();
                default:
                    return parseTypeReferenceOrTypePredicate();
            }
        }
        function isStartOfType() {
            switch (token) {
                case 115 /* AnyKeyword */:
                case 128 /* StringKeyword */:
                case 126 /* NumberKeyword */:
                case 118 /* BooleanKeyword */:
                case 129 /* SymbolKeyword */:
                case 101 /* VoidKeyword */:
                case 99 /* TypeOfKeyword */:
                case 15 /* OpenBraceToken */:
                case 19 /* OpenBracketToken */:
                case 25 /* LessThanToken */:
                case 90 /* NewKeyword */:
                    return true;
                case 17 /* OpenParenToken */:
                    // Only consider '(' the start of a type if followed by ')', '...', an identifier, a modifier,
                    // or something that starts a type. We don't want to consider things like '(1)' a type.
                    return lookAhead(isStartOfParenthesizedOrFunctionType);
                default:
                    return isIdentifier();
            }
        }
        function isStartOfParenthesizedOrFunctionType() {
            nextToken();
            return token === 18 /* CloseParenToken */ || isStartOfParameter() || isStartOfType();
        }
        function parseArrayTypeOrHigher() {
            var type = parseNonArrayType();
            while (!scanner.hasPrecedingLineBreak() && parseOptional(19 /* OpenBracketToken */)) {
                parseExpected(20 /* CloseBracketToken */);
                var node = createNode(154 /* ArrayType */, type.pos);
                node.elementType = type;
                type = finishNode(node);
            }
            return type;
        }
        function parseUnionOrIntersectionType(kind, parseConstituentType, operator) {
            var type = parseConstituentType();
            if (token === operator) {
                var types = [type];
                types.pos = type.pos;
                while (parseOptional(operator)) {
                    types.push(parseConstituentType());
                }
                types.end = getNodeEnd();
                var node = createNode(kind, type.pos);
                node.types = types;
                type = finishNode(node);
            }
            return type;
        }
        function parseIntersectionTypeOrHigher() {
            return parseUnionOrIntersectionType(157 /* IntersectionType */, parseArrayTypeOrHigher, 45 /* AmpersandToken */);
        }
        function parseUnionTypeOrHigher() {
            return parseUnionOrIntersectionType(156 /* UnionType */, parseIntersectionTypeOrHigher, 46 /* BarToken */);
        }
        function isStartOfFunctionType() {
            if (token === 25 /* LessThanToken */) {
                return true;
            }
            return token === 17 /* OpenParenToken */ && lookAhead(isUnambiguouslyStartOfFunctionType);
        }
        function isUnambiguouslyStartOfFunctionType() {
            nextToken();
            if (token === 18 /* CloseParenToken */ || token === 22 /* DotDotDotToken */) {
                // ( )
                // ( ...
                return true;
            }
            if (isIdentifier() || ts.isModifier(token)) {
                nextToken();
                if (token === 53 /* ColonToken */ || token === 24 /* CommaToken */ ||
                    token === 52 /* QuestionToken */ || token === 55 /* EqualsToken */ ||
                    isIdentifier() || ts.isModifier(token)) {
                    // ( id :
                    // ( id ,
                    // ( id ?
                    // ( id =
                    // ( modifier id
                    return true;
                }
                if (token === 18 /* CloseParenToken */) {
                    nextToken();
                    if (token === 34 /* EqualsGreaterThanToken */) {
                        // ( id ) =>
                        return true;
                    }
                }
            }
            return false;
        }
        function parseType() {
            // The rules about 'yield' only apply to actual code/expression contexts.  They don't
            // apply to 'type' contexts.  So we disable these parameters here before moving on.
            return doOutsideOfContext(10 /* TypeExcludesFlags */, parseTypeWorker);
        }
        function parseTypeWorker() {
            if (isStartOfFunctionType()) {
                return parseFunctionOrConstructorType(150 /* FunctionType */);
            }
            if (token === 90 /* NewKeyword */) {
                return parseFunctionOrConstructorType(151 /* ConstructorType */);
            }
            return parseUnionTypeOrHigher();
        }
        function parseTypeAnnotation() {
            return parseOptional(53 /* ColonToken */) ? parseType() : undefined;
        }
        // EXPRESSIONS
        function isStartOfLeftHandSideExpression() {
            switch (token) {
                case 95 /* ThisKeyword */:
                case 93 /* SuperKeyword */:
                case 91 /* NullKeyword */:
                case 97 /* TrueKeyword */:
                case 82 /* FalseKeyword */:
                case 8 /* NumericLiteral */:
                case 9 /* StringLiteral */:
                case 11 /* NoSubstitutionTemplateLiteral */:
                case 12 /* TemplateHead */:
                case 17 /* OpenParenToken */:
                case 19 /* OpenBracketToken */:
                case 15 /* OpenBraceToken */:
                case 85 /* FunctionKeyword */:
                case 71 /* ClassKeyword */:
                case 90 /* NewKeyword */:
                case 38 /* SlashToken */:
                case 59 /* SlashEqualsToken */:
                case 67 /* Identifier */:
                    return true;
                default:
                    return isIdentifier();
            }
        }
        function isStartOfExpression() {
            if (isStartOfLeftHandSideExpression()) {
                return true;
            }
            switch (token) {
                case 35 /* PlusToken */:
                case 36 /* MinusToken */:
                case 49 /* TildeToken */:
                case 48 /* ExclamationToken */:
                case 76 /* DeleteKeyword */:
                case 99 /* TypeOfKeyword */:
                case 101 /* VoidKeyword */:
                case 40 /* PlusPlusToken */:
                case 41 /* MinusMinusToken */:
                case 25 /* LessThanToken */:
                case 117 /* AwaitKeyword */:
                case 112 /* YieldKeyword */:
                    // Yield/await always starts an expression.  Either it is an identifier (in which case
                    // it is definitely an expression).  Or it's a keyword (either because we're in
                    // a generator or async function, or in strict mode (or both)) and it started a yield or await expression.
                    return true;
                default:
                    // Error tolerance.  If we see the start of some binary operator, we consider
                    // that the start of an expression.  That way we'll parse out a missing identifier,
                    // give a good message about an identifier being missing, and then consume the
                    // rest of the binary expression.
                    if (isBinaryOperator()) {
                        return true;
                    }
                    return isIdentifier();
            }
        }
        function isStartOfExpressionStatement() {
            // As per the grammar, none of '{' or 'function' or 'class' can start an expression statement.
            return token !== 15 /* OpenBraceToken */ &&
                token !== 85 /* FunctionKeyword */ &&
                token !== 71 /* ClassKeyword */ &&
                token !== 54 /* AtToken */ &&
                isStartOfExpression();
        }
        function allowInAndParseExpression() {
            return allowInAnd(parseExpression);
        }
        function parseExpression() {
            // Expression[in]:
            //      AssignmentExpression[in]
            //      Expression[in] , AssignmentExpression[in]
            // clear the decorator context when parsing Expression, as it should be unambiguous when parsing a decorator
            var saveDecoratorContext = inDecoratorContext();
            if (saveDecoratorContext) {
                setDecoratorContext(false);
            }
            var expr = parseAssignmentExpressionOrHigher();
            var operatorToken;
            while ((operatorToken = parseOptionalToken(24 /* CommaToken */))) {
                expr = makeBinaryExpression(expr, operatorToken, parseAssignmentExpressionOrHigher());
            }
            if (saveDecoratorContext) {
                setDecoratorContext(true);
            }
            return expr;
        }
        function parseInitializer(inParameter) {
            if (token !== 55 /* EqualsToken */) {
                // It's not uncommon during typing for the user to miss writing the '=' token.  Check if
                // there is no newline after the last token and if we're on an expression.  If so, parse
                // this as an equals-value clause with a missing equals.
                // NOTE: There are two places where we allow equals-value clauses.  The first is in a
                // variable declarator.  The second is with a parameter.  For variable declarators
                // it's more likely that a { would be a allowed (as an object literal).  While this
                // is also allowed for parameters, the risk is that we consume the { as an object
                // literal when it really will be for the block following the parameter.
                if (scanner.hasPrecedingLineBreak() || (inParameter && token === 15 /* OpenBraceToken */) || !isStartOfExpression()) {
                    // preceding line break, open brace in a parameter (likely a function body) or current token is not an expression -
                    // do not try to parse initializer
                    return undefined;
                }
            }
            // Initializer[In, Yield] :
            //     = AssignmentExpression[?In, ?Yield]
            parseExpected(55 /* EqualsToken */);
            return parseAssignmentExpressionOrHigher();
        }
        function parseAssignmentExpressionOrHigher() {
            //  AssignmentExpression[in,yield]:
            //      1) ConditionalExpression[?in,?yield]
            //      2) LeftHandSideExpression = AssignmentExpression[?in,?yield]
            //      3) LeftHandSideExpression AssignmentOperator AssignmentExpression[?in,?yield]
            //      4) ArrowFunctionExpression[?in,?yield]
            //      5) [+Yield] YieldExpression[?In]
            //
            // Note: for ease of implementation we treat productions '2' and '3' as the same thing.
            // (i.e. they're both BinaryExpressions with an assignment operator in it).
            // First, do the simple check if we have a YieldExpression (production '5').
            if (isYieldExpression()) {
                return parseYieldExpression();
            }
            // Then, check if we have an arrow function (production '4') that starts with a parenthesized
            // parameter list. If we do, we must *not* recurse for productions 1, 2 or 3. An ArrowFunction is
            // not a  LeftHandSideExpression, nor does it start a ConditionalExpression.  So we are done
            // with AssignmentExpression if we see one.
            var arrowExpression = tryParseParenthesizedArrowFunctionExpression();
            if (arrowExpression) {
                return arrowExpression;
            }
            // Now try to see if we're in production '1', '2' or '3'.  A conditional expression can
            // start with a LogicalOrExpression, while the assignment productions can only start with
            // LeftHandSideExpressions.
            //
            // So, first, we try to just parse out a BinaryExpression.  If we get something that is a
            // LeftHandSide or higher, then we can try to parse out the assignment expression part.
            // Otherwise, we try to parse out the conditional expression bit.  We want to allow any
            // binary expression here, so we pass in the 'lowest' precedence here so that it matches
            // and consumes anything.
            var expr = parseBinaryExpressionOrHigher(0);
            // To avoid a look-ahead, we did not handle the case of an arrow function with a single un-parenthesized
            // parameter ('x => ...') above. We handle it here by checking if the parsed expression was a single
            // identifier and the current token is an arrow.
            if (expr.kind === 67 /* Identifier */ && token === 34 /* EqualsGreaterThanToken */) {
                return parseSimpleArrowFunctionExpression(expr);
            }
            // Now see if we might be in cases '2' or '3'.
            // If the expression was a LHS expression, and we have an assignment operator, then
            // we're in '2' or '3'. Consume the assignment and return.
            //
            // Note: we call reScanGreaterToken so that we get an appropriately merged token
            // for cases like > > =  becoming >>=
            if (ts.isLeftHandSideExpression(expr) && ts.isAssignmentOperator(reScanGreaterToken())) {
                return makeBinaryExpression(expr, parseTokenNode(), parseAssignmentExpressionOrHigher());
            }
            // It wasn't an assignment or a lambda.  This is a conditional expression:
            return parseConditionalExpressionRest(expr);
        }
        function isYieldExpression() {
            if (token === 112 /* YieldKeyword */) {
                // If we have a 'yield' keyword, and htis is a context where yield expressions are
                // allowed, then definitely parse out a yield expression.
                if (inYieldContext()) {
                    return true;
                }
                // We're in a context where 'yield expr' is not allowed.  However, if we can
                // definitely tell that the user was trying to parse a 'yield expr' and not
                // just a normal expr that start with a 'yield' identifier, then parse out
                // a 'yield expr'.  We can then report an error later that they are only
                // allowed in generator expressions.
                //
                // for example, if we see 'yield(foo)', then we'll have to treat that as an
                // invocation expression of something called 'yield'.  However, if we have
                // 'yield foo' then that is not legal as a normal expression, so we can
                // definitely recognize this as a yield expression.
                //
                // for now we just check if the next token is an identifier.  More heuristics
                // can be added here later as necessary.  We just need to make sure that we
                // don't accidently consume something legal.
                return lookAhead(nextTokenIsIdentifierOrKeywordOrNumberOnSameLine);
            }
            return false;
        }
        function nextTokenIsIdentifierOnSameLine() {
            nextToken();
            return !scanner.hasPrecedingLineBreak() && isIdentifier();
        }
        function parseYieldExpression() {
            var node = createNode(182 /* YieldExpression */);
            // YieldExpression[In] :
            //      yield
            //      yield [no LineTerminator here] [Lexical goal InputElementRegExp]AssignmentExpression[?In, Yield]
            //      yield [no LineTerminator here] * [Lexical goal InputElementRegExp]AssignmentExpression[?In, Yield]
            nextToken();
            if (!scanner.hasPrecedingLineBreak() &&
                (token === 37 /* AsteriskToken */ || isStartOfExpression())) {
                node.asteriskToken = parseOptionalToken(37 /* AsteriskToken */);
                node.expression = parseAssignmentExpressionOrHigher();
                return finishNode(node);
            }
            else {
                // if the next token is not on the same line as yield.  or we don't have an '*' or
                // the start of an expressin, then this is just a simple "yield" expression.
                return finishNode(node);
            }
        }
        function parseSimpleArrowFunctionExpression(identifier) {
            Debug.assert(token === 34 /* EqualsGreaterThanToken */, "parseSimpleArrowFunctionExpression should only have been called if we had a =>");
            var node = createNode(172 /* ArrowFunction */, identifier.pos);
            var parameter = createNode(136 /* Parameter */, identifier.pos);
            parameter.name = identifier;
            finishNode(parameter);
            node.parameters = [parameter];
            node.parameters.pos = parameter.pos;
            node.parameters.end = parameter.end;
            node.equalsGreaterThanToken = parseExpectedToken(34 /* EqualsGreaterThanToken */, false, ts.Diagnostics._0_expected, "=>");
            node.body = parseArrowFunctionExpressionBody(false);
            return finishNode(node);
        }
        function tryParseParenthesizedArrowFunctionExpression() {
            var triState = isParenthesizedArrowFunctionExpression();
            if (triState === 0 /* False */) {
                // It's definitely not a parenthesized arrow function expression.
                return undefined;
            }
            // If we definitely have an arrow function, then we can just parse one, not requiring a
            // following => or { token. Otherwise, we *might* have an arrow function.  Try to parse
            // it out, but don't allow any ambiguity, and return 'undefined' if this could be an
            // expression instead.
            var arrowFunction = triState === 1 /* True */
                ? parseParenthesizedArrowFunctionExpressionHead(true)
                : tryParse(parsePossibleParenthesizedArrowFunctionExpressionHead);
            if (!arrowFunction) {
                // Didn't appear to actually be a parenthesized arrow function.  Just bail out.
                return undefined;
            }
            var isAsync = !!(arrowFunction.flags & 512 /* Async */);
            // If we have an arrow, then try to parse the body. Even if not, try to parse if we
            // have an opening brace, just in case we're in an error state.
            var lastToken = token;
            arrowFunction.equalsGreaterThanToken = parseExpectedToken(34 /* EqualsGreaterThanToken */, false, ts.Diagnostics._0_expected, "=>");
            arrowFunction.body = (lastToken === 34 /* EqualsGreaterThanToken */ || lastToken === 15 /* OpenBraceToken */)
                ? parseArrowFunctionExpressionBody(isAsync)
                : parseIdentifier();
            return finishNode(arrowFunction);
        }
        //  True        -> We definitely expect a parenthesized arrow function here.
        //  False       -> There *cannot* be a parenthesized arrow function here.
        //  Unknown     -> There *might* be a parenthesized arrow function here.
        //                 Speculatively look ahead to be sure, and rollback if not.
        function isParenthesizedArrowFunctionExpression() {
            if (token === 17 /* OpenParenToken */ || token === 25 /* LessThanToken */ || token === 116 /* AsyncKeyword */) {
                return lookAhead(isParenthesizedArrowFunctionExpressionWorker);
            }
            if (token === 34 /* EqualsGreaterThanToken */) {
                // ERROR RECOVERY TWEAK:
                // If we see a standalone => try to parse it as an arrow function expression as that's
                // likely what the user intended to write.
                return 1 /* True */;
            }
            // Definitely not a parenthesized arrow function.
            return 0 /* False */;
        }
        function isParenthesizedArrowFunctionExpressionWorker() {
            if (token === 116 /* AsyncKeyword */) {
                nextToken();
                if (scanner.hasPrecedingLineBreak()) {
                    return 0 /* False */;
                }
                if (token !== 17 /* OpenParenToken */ && token !== 25 /* LessThanToken */) {
                    return 0 /* False */;
                }
            }
            var first = token;
            var second = nextToken();
            if (first === 17 /* OpenParenToken */) {
                if (second === 18 /* CloseParenToken */) {
                    // Simple cases: "() =>", "(): ", and  "() {".
                    // This is an arrow function with no parameters.
                    // The last one is not actually an arrow function,
                    // but this is probably what the user intended.
                    var third = nextToken();
                    switch (third) {
                        case 34 /* EqualsGreaterThanToken */:
                        case 53 /* ColonToken */:
                        case 15 /* OpenBraceToken */:
                            return 1 /* True */;
                        default:
                            return 0 /* False */;
                    }
                }
                // If encounter "([" or "({", this could be the start of a binding pattern.
                // Examples:
                //      ([ x ]) => { }
                //      ({ x }) => { }
                //      ([ x ])
                //      ({ x })
                if (second === 19 /* OpenBracketToken */ || second === 15 /* OpenBraceToken */) {
                    return 2 /* Unknown */;
                }
                // Simple case: "(..."
                // This is an arrow function with a rest parameter.
                if (second === 22 /* DotDotDotToken */) {
                    return 1 /* True */;
                }
                // If we had "(" followed by something that's not an identifier,
                // then this definitely doesn't look like a lambda.
                // Note: we could be a little more lenient and allow
                // "(public" or "(private". These would not ever actually be allowed,
                // but we could provide a good error message instead of bailing out.
                if (!isIdentifier()) {
                    return 0 /* False */;
                }
                // If we have something like "(a:", then we must have a
                // type-annotated parameter in an arrow function expression.
                if (nextToken() === 53 /* ColonToken */) {
                    return 1 /* True */;
                }
                // This *could* be a parenthesized arrow function.
                // Return Unknown to let the caller know.
                return 2 /* Unknown */;
            }
            else {
                Debug.assert(first === 25 /* LessThanToken */);
                // If we have "<" not followed by an identifier,
                // then this definitely is not an arrow function.
                if (!isIdentifier()) {
                    return 0 /* False */;
                }
                // JSX overrides
                if (sourceFile.languageVariant === 1 /* JSX */) {
                    var isArrowFunctionInJsx = lookAhead(function () {
                        var third = nextToken();
                        if (third === 81 /* ExtendsKeyword */) {
                            var fourth = nextToken();
                            switch (fourth) {
                                case 55 /* EqualsToken */:
                                case 27 /* GreaterThanToken */:
                                    return false;
                                default:
                                    return true;
                            }
                        }
                        else if (third === 24 /* CommaToken */) {
                            return true;
                        }
                        return false;
                    });
                    if (isArrowFunctionInJsx) {
                        return 1 /* True */;
                    }
                    return 0 /* False */;
                }
                // This *could* be a parenthesized arrow function.
                return 2 /* Unknown */;
            }
        }
        function parsePossibleParenthesizedArrowFunctionExpressionHead() {
            return parseParenthesizedArrowFunctionExpressionHead(false);
        }
        function parseParenthesizedArrowFunctionExpressionHead(allowAmbiguity) {
            var node = createNode(172 /* ArrowFunction */);
            setModifiers(node, parseModifiersForArrowFunction());
            var isAsync = !!(node.flags & 512 /* Async */);
            // Arrow functions are never generators.
            //
            // If we're speculatively parsing a signature for a parenthesized arrow function, then
            // we have to have a complete parameter list.  Otherwise we might see something like
            // a => (b => c)
            // And think that "(b =>" was actually a parenthesized arrow function with a missing
            // close paren.
            fillSignature(53 /* ColonToken */, false, isAsync, !allowAmbiguity, node);
            // If we couldn't get parameters, we definitely could not parse out an arrow function.
            if (!node.parameters) {
                return undefined;
            }
            // Parsing a signature isn't enough.
            // Parenthesized arrow signatures often look like other valid expressions.
            // For instance:
            //  - "(x = 10)" is an assignment expression parsed as a signature with a default parameter value.
            //  - "(x,y)" is a comma expression parsed as a signature with two parameters.
            //  - "a ? (b): c" will have "(b):" parsed as a signature with a return type annotation.
            //
            // So we need just a bit of lookahead to ensure that it can only be a signature.
            if (!allowAmbiguity && token !== 34 /* EqualsGreaterThanToken */ && token !== 15 /* OpenBraceToken */) {
                // Returning undefined here will cause our caller to rewind to where we started from.
                return undefined;
            }
            return node;
        }
        function parseArrowFunctionExpressionBody(isAsync) {
            if (token === 15 /* OpenBraceToken */) {
                return parseFunctionBlock(false, isAsync, false);
            }
            if (token !== 23 /* SemicolonToken */ &&
                token !== 85 /* FunctionKeyword */ &&
                token !== 71 /* ClassKeyword */ &&
                isStartOfStatement() &&
                !isStartOfExpressionStatement()) {
                // Check if we got a plain statement (i.e. no expression-statements, no function/class expressions/declarations)
                //
                // Here we try to recover from a potential error situation in the case where the
                // user meant to supply a block. For example, if the user wrote:
                //
                //  a =>
                //      let v = 0;
                //  }
                //
                // they may be missing an open brace.  Check to see if that's the case so we can
                // try to recover better.  If we don't do this, then the next close curly we see may end
                // up preemptively closing the containing construct.
                //
                // Note: even when 'ignoreMissingOpenBrace' is passed as true, parseBody will still error.
                return parseFunctionBlock(false, isAsync, true);
            }
            return isAsync
                ? doInAwaitContext(parseAssignmentExpressionOrHigher)
                : doOutsideOfAwaitContext(parseAssignmentExpressionOrHigher);
        }
        function parseConditionalExpressionRest(leftOperand) {
            // Note: we are passed in an expression which was produced from parseBinaryExpressionOrHigher.
            var questionToken = parseOptionalToken(52 /* QuestionToken */);
            if (!questionToken) {
                return leftOperand;
            }
            // Note: we explicitly 'allowIn' in the whenTrue part of the condition expression, and
            // we do not that for the 'whenFalse' part.
            var node = createNode(180 /* ConditionalExpression */, leftOperand.pos);
            node.condition = leftOperand;
            node.questionToken = questionToken;
            node.whenTrue = doOutsideOfContext(disallowInAndDecoratorContext, parseAssignmentExpressionOrHigher);
            node.colonToken = parseExpectedToken(53 /* ColonToken */, false, ts.Diagnostics._0_expected, ts.tokenToString(53 /* ColonToken */));
            node.whenFalse = parseAssignmentExpressionOrHigher();
            return finishNode(node);
        }
        function parseBinaryExpressionOrHigher(precedence) {
            var leftOperand = parseUnaryExpressionOrHigher();
            return parseBinaryExpressionRest(precedence, leftOperand);
        }
        function isInOrOfKeyword(t) {
            return t === 88 /* InKeyword */ || t === 132 /* OfKeyword */;
        }
        function parseBinaryExpressionRest(precedence, leftOperand) {
            while (true) {
                // We either have a binary operator here, or we're finished.  We call
                // reScanGreaterToken so that we merge token sequences like > and = into >=
                reScanGreaterToken();
                var newPrecedence = getBinaryOperatorPrecedence();
                // Check the precedence to see if we should "take" this operator
                if (newPrecedence <= precedence) {
                    break;
                }
                if (token === 88 /* InKeyword */ && inDisallowInContext()) {
                    break;
                }
                if (token === 114 /* AsKeyword */) {
                    // Make sure we *do* perform ASI for constructs like this:
                    //    var x = foo
                    //    as (Bar)
                    // This should be parsed as an initialized variable, followed
                    // by a function call to 'as' with the argument 'Bar'
                    if (scanner.hasPrecedingLineBreak()) {
                        break;
                    }
                    else {
                        nextToken();
                        leftOperand = makeAsExpression(leftOperand, parseType());
                    }
                }
                else {
                    leftOperand = makeBinaryExpression(leftOperand, parseTokenNode(), parseBinaryExpressionOrHigher(newPrecedence));
                }
            }
            return leftOperand;
        }
        function isBinaryOperator() {
            if (inDisallowInContext() && token === 88 /* InKeyword */) {
                return false;
            }
            return getBinaryOperatorPrecedence() > 0;
        }
        function getBinaryOperatorPrecedence() {
            switch (token) {
                case 51 /* BarBarToken */:
                    return 1;
                case 50 /* AmpersandAmpersandToken */:
                    return 2;
                case 46 /* BarToken */:
                    return 3;
                case 47 /* CaretToken */:
                    return 4;
                case 45 /* AmpersandToken */:
                    return 5;
                case 30 /* EqualsEqualsToken */:
                case 31 /* ExclamationEqualsToken */:
                case 32 /* EqualsEqualsEqualsToken */:
                case 33 /* ExclamationEqualsEqualsToken */:
                    return 6;
                case 25 /* LessThanToken */:
                case 27 /* GreaterThanToken */:
                case 28 /* LessThanEqualsToken */:
                case 29 /* GreaterThanEqualsToken */:
                case 89 /* InstanceOfKeyword */:
                case 88 /* InKeyword */:
                case 114 /* AsKeyword */:
                    return 7;
                case 42 /* LessThanLessThanToken */:
                case 43 /* GreaterThanGreaterThanToken */:
                case 44 /* GreaterThanGreaterThanGreaterThanToken */:
                    return 8;
                case 35 /* PlusToken */:
                case 36 /* MinusToken */:
                    return 9;
                case 37 /* AsteriskToken */:
                case 38 /* SlashToken */:
                case 39 /* PercentToken */:
                    return 10;
            }
            // -1 is lower than all other precedences.  Returning it will cause binary expression
            // parsing to stop.
            return -1;
        }
        function makeBinaryExpression(left, operatorToken, right) {
            var node = createNode(179 /* BinaryExpression */, left.pos);
            node.left = left;
            node.operatorToken = operatorToken;
            node.right = right;
            return finishNode(node);
        }
        function makeAsExpression(left, right) {
            var node = createNode(187 /* AsExpression */, left.pos);
            node.expression = left;
            node.type = right;
            return finishNode(node);
        }
        function parsePrefixUnaryExpression() {
            var node = createNode(177 /* PrefixUnaryExpression */);
            node.operator = token;
            nextToken();
            node.operand = parseUnaryExpressionOrHigher();
            return finishNode(node);
        }
        function parseDeleteExpression() {
            var node = createNode(173 /* DeleteExpression */);
            nextToken();
            node.expression = parseUnaryExpressionOrHigher();
            return finishNode(node);
        }
        function parseTypeOfExpression() {
            var node = createNode(174 /* TypeOfExpression */);
            nextToken();
            node.expression = parseUnaryExpressionOrHigher();
            return finishNode(node);
        }
        function parseVoidExpression() {
            var node = createNode(175 /* VoidExpression */);
            nextToken();
            node.expression = parseUnaryExpressionOrHigher();
            return finishNode(node);
        }
        function isAwaitExpression() {
            if (token === 117 /* AwaitKeyword */) {
                if (inAwaitContext()) {
                    return true;
                }
                // here we are using similar heuristics as 'isYieldExpression'
                return lookAhead(nextTokenIsIdentifierOnSameLine);
            }
            return false;
        }
        function parseAwaitExpression() {
            var node = createNode(176 /* AwaitExpression */);
            nextToken();
            node.expression = parseUnaryExpressionOrHigher();
            return finishNode(node);
        }
        function parseUnaryExpressionOrHigher() {
            if (isAwaitExpression()) {
                return parseAwaitExpression();
            }
            switch (token) {
                case 35 /* PlusToken */:
                case 36 /* MinusToken */:
                case 49 /* TildeToken */:
                case 48 /* ExclamationToken */:
                case 40 /* PlusPlusToken */:
                case 41 /* MinusMinusToken */:
                    return parsePrefixUnaryExpression();
                case 76 /* DeleteKeyword */:
                    return parseDeleteExpression();
                case 99 /* TypeOfKeyword */:
                    return parseTypeOfExpression();
                case 101 /* VoidKeyword */:
                    return parseVoidExpression();
                case 25 /* LessThanToken */:
                    if (sourceFile.languageVariant !== 1 /* JSX */) {
                        return parseTypeAssertion();
                    }
                    if (lookAhead(nextTokenIsIdentifierOrKeyword)) {
                        return parseJsxElementOrSelfClosingElement(true);
                    }
                // Fall through
                default:
                    return parsePostfixExpressionOrHigher();
            }
        }
        function parsePostfixExpressionOrHigher() {
            var expression = parseLeftHandSideExpressionOrHigher();
            Debug.assert(ts.isLeftHandSideExpression(expression));
            if ((token === 40 /* PlusPlusToken */ || token === 41 /* MinusMinusToken */) && !scanner.hasPrecedingLineBreak()) {
                var node = createNode(178 /* PostfixUnaryExpression */, expression.pos);
                node.operand = expression;
                node.operator = token;
                nextToken();
                return finishNode(node);
            }
            return expression;
        }
        function parseLeftHandSideExpressionOrHigher() {
            // Original Ecma:
            // LeftHandSideExpression: See 11.2
            //      NewExpression
            //      CallExpression
            //
            // Our simplification:
            //
            // LeftHandSideExpression: See 11.2
            //      MemberExpression
            //      CallExpression
            //
            // See comment in parseMemberExpressionOrHigher on how we replaced NewExpression with
            // MemberExpression to make our lives easier.
            //
            // to best understand the below code, it's important to see how CallExpression expands
            // out into its own productions:
            //
            // CallExpression:
            //      MemberExpression Arguments
            //      CallExpression Arguments
            //      CallExpression[Expression]
            //      CallExpression.IdentifierName
            //      super   (   ArgumentListopt   )
            //      super.IdentifierName
            //
            // Because of the recursion in these calls, we need to bottom out first.  There are two
            // bottom out states we can run into.  Either we see 'super' which must start either of
            // the last two CallExpression productions.  Or we have a MemberExpression which either
            // completes the LeftHandSideExpression, or starts the beginning of the first four
            // CallExpression productions.
            var expression = token === 93 /* SuperKeyword */
                ? parseSuperExpression()
                : parseMemberExpressionOrHigher();
            // Now, we *may* be complete.  However, we might have consumed the start of a
            // CallExpression.  As such, we need to consume the rest of it here to be complete.
            return parseCallExpressionRest(expression);
        }
        function parseMemberExpressionOrHigher() {
            // Note: to make our lives simpler, we decompose the the NewExpression productions and
            // place ObjectCreationExpression and FunctionExpression into PrimaryExpression.
            // like so:
            //
            //   PrimaryExpression : See 11.1
            //      this
            //      Identifier
            //      Literal
            //      ArrayLiteral
            //      ObjectLiteral
            //      (Expression)
            //      FunctionExpression
            //      new MemberExpression Arguments?
            //
            //   MemberExpression : See 11.2
            //      PrimaryExpression
            //      MemberExpression[Expression]
            //      MemberExpression.IdentifierName
            //
            //   CallExpression : See 11.2
            //      MemberExpression
            //      CallExpression Arguments
            //      CallExpression[Expression]
            //      CallExpression.IdentifierName
            //
            // Technically this is ambiguous.  i.e. CallExpression defines:
            //
            //   CallExpression:
            //      CallExpression Arguments
            //
            // If you see: "new Foo()"
            //
            // Then that could be treated as a single ObjectCreationExpression, or it could be
            // treated as the invocation of "new Foo".  We disambiguate that in code (to match
            // the original grammar) by making sure that if we see an ObjectCreationExpression
            // we always consume arguments if they are there. So we treat "new Foo()" as an
            // object creation only, and not at all as an invocation)  Another way to think
            // about this is that for every "new" that we see, we will consume an argument list if
            // it is there as part of the *associated* object creation node.  Any additional
            // argument lists we see, will become invocation expressions.
            //
            // Because there are no other places in the grammar now that refer to FunctionExpression
            // or ObjectCreationExpression, it is safe to push down into the PrimaryExpression
            // production.
            //
            // Because CallExpression and MemberExpression are left recursive, we need to bottom out
            // of the recursion immediately.  So we parse out a primary expression to start with.
            var expression = parsePrimaryExpression();
            return parseMemberExpressionRest(expression);
        }
        function parseSuperExpression() {
            var expression = parseTokenNode();
            if (token === 17 /* OpenParenToken */ || token === 21 /* DotToken */ || token === 19 /* OpenBracketToken */) {
                return expression;
            }
            // If we have seen "super" it must be followed by '(' or '.'.
            // If it wasn't then just try to parse out a '.' and report an error.
            var node = createNode(164 /* PropertyAccessExpression */, expression.pos);
            node.expression = expression;
            node.dotToken = parseExpectedToken(21 /* DotToken */, false, ts.Diagnostics.super_must_be_followed_by_an_argument_list_or_member_access);
            node.name = parseRightSideOfDot(true);
            return finishNode(node);
        }
        function parseJsxElementOrSelfClosingElement(inExpressionContext) {
            var opening = parseJsxOpeningOrSelfClosingElement(inExpressionContext);
            if (opening.kind === 233 /* JsxOpeningElement */) {
                var node = createNode(231 /* JsxElement */, opening.pos);
                node.openingElement = opening;
                node.children = parseJsxChildren(node.openingElement.tagName);
                node.closingElement = parseJsxClosingElement(inExpressionContext);
                return finishNode(node);
            }
            else {
                Debug.assert(opening.kind === 232 /* JsxSelfClosingElement */);
                // Nothing else to do for self-closing elements
                return opening;
            }
        }
        function parseJsxText() {
            var node = createNode(234 /* JsxText */, scanner.getStartPos());
            token = scanner.scanJsxToken();
            return finishNode(node);
        }
        function parseJsxChild() {
            switch (token) {
                case 234 /* JsxText */:
                    return parseJsxText();
                case 15 /* OpenBraceToken */:
                    return parseJsxExpression(false);
                case 25 /* LessThanToken */:
                    return parseJsxElementOrSelfClosingElement(false);
            }
            Debug.fail("Unknown JSX child kind " + token);
        }
        function parseJsxChildren(openingTagName) {
            var result = [];
            result.pos = scanner.getStartPos();
            var saveParsingContext = parsingContext;
            parsingContext |= 1 << 14 /* JsxChildren */;
            while (true) {
                token = scanner.reScanJsxToken();
                if (token === 26 /* LessThanSlashToken */) {
                    break;
                }
                else if (token === 1 /* EndOfFileToken */) {
                    parseErrorAtCurrentToken(ts.Diagnostics.Expected_corresponding_JSX_closing_tag_for_0, ts.getTextOfNodeFromSourceText(sourceText, openingTagName));
                    break;
                }
                result.push(parseJsxChild());
            }
            result.end = scanner.getTokenPos();
            parsingContext = saveParsingContext;
            return result;
        }
        function parseJsxOpeningOrSelfClosingElement(inExpressionContext) {
            var fullStart = scanner.getStartPos();
            parseExpected(25 /* LessThanToken */);
            var tagName = parseJsxElementName();
            var attributes = parseList(13 /* JsxAttributes */, parseJsxAttribute);
            var node;
            if (token === 27 /* GreaterThanToken */) {
                // Closing tag, so scan the immediately-following text with the JSX scanning instead
                // of regular scanning to avoid treating illegal characters (e.g. '#') as immediate
                // scanning errors
                node = createNode(233 /* JsxOpeningElement */, fullStart);
                scanJsxText();
            }
            else {
                parseExpected(38 /* SlashToken */);
                if (inExpressionContext) {
                    parseExpected(27 /* GreaterThanToken */);
                }
                else {
                    parseExpected(27 /* GreaterThanToken */, undefined, false);
                    scanJsxText();
                }
                node = createNode(232 /* JsxSelfClosingElement */, fullStart);
            }
            node.tagName = tagName;
            node.attributes = attributes;
            return finishNode(node);
        }
        function parseJsxElementName() {
            scanJsxIdentifier();
            var elementName = parseIdentifierName();
            while (parseOptional(21 /* DotToken */)) {
                scanJsxIdentifier();
                var node = createNode(133 /* QualifiedName */, elementName.pos);
                node.left = elementName;
                node.right = parseIdentifierName();
                elementName = finishNode(node);
            }
            return elementName;
        }
        function parseJsxExpression(inExpressionContext) {
            var node = createNode(238 /* JsxExpression */);
            parseExpected(15 /* OpenBraceToken */);
            if (token !== 16 /* CloseBraceToken */) {
                node.expression = parseExpression();
            }
            if (inExpressionContext) {
                parseExpected(16 /* CloseBraceToken */);
            }
            else {
                parseExpected(16 /* CloseBraceToken */, undefined, false);
                scanJsxText();
            }
            return finishNode(node);
        }
        function parseJsxAttribute() {
            if (token === 15 /* OpenBraceToken */) {
                return parseJsxSpreadAttribute();
            }
            scanJsxIdentifier();
            var node = createNode(236 /* JsxAttribute */);
            node.name = parseIdentifierName();
            if (parseOptional(55 /* EqualsToken */)) {
                switch (token) {
                    case 9 /* StringLiteral */:
                        node.initializer = parseLiteralNode();
                        break;
                    default:
                        node.initializer = parseJsxExpression(true);
                        break;
                }
            }
            return finishNode(node);
        }
        function parseJsxSpreadAttribute() {
            var node = createNode(237 /* JsxSpreadAttribute */);
            parseExpected(15 /* OpenBraceToken */);
            parseExpected(22 /* DotDotDotToken */);
            node.expression = parseExpression();
            parseExpected(16 /* CloseBraceToken */);
            return finishNode(node);
        }
        function parseJsxClosingElement(inExpressionContext) {
            var node = createNode(235 /* JsxClosingElement */);
            parseExpected(26 /* LessThanSlashToken */);
            node.tagName = parseJsxElementName();
            if (inExpressionContext) {
                parseExpected(27 /* GreaterThanToken */);
            }
            else {
                parseExpected(27 /* GreaterThanToken */, undefined, false);
                scanJsxText();
            }
            return finishNode(node);
        }
        function parseTypeAssertion() {
            var node = createNode(169 /* TypeAssertionExpression */);
            parseExpected(25 /* LessThanToken */);
            node.type = parseType();
            parseExpected(27 /* GreaterThanToken */);
            node.expression = parseUnaryExpressionOrHigher();
            return finishNode(node);
        }
        function parseMemberExpressionRest(expression) {
            while (true) {
                var dotToken = parseOptionalToken(21 /* DotToken */);
                if (dotToken) {
                    var propertyAccess = createNode(164 /* PropertyAccessExpression */, expression.pos);
                    propertyAccess.expression = expression;
                    propertyAccess.dotToken = dotToken;
                    propertyAccess.name = parseRightSideOfDot(true);
                    expression = finishNode(propertyAccess);
                    continue;
                }
                // when in the [Decorator] context, we do not parse ElementAccess as it could be part of a ComputedPropertyName
                if (!inDecoratorContext() && parseOptional(19 /* OpenBracketToken */)) {
                    var indexedAccess = createNode(165 /* ElementAccessExpression */, expression.pos);
                    indexedAccess.expression = expression;
                    // It's not uncommon for a user to write: "new Type[]".
                    // Check for that common pattern and report a better error message.
                    if (token !== 20 /* CloseBracketToken */) {
                        indexedAccess.argumentExpression = allowInAnd(parseExpression);
                        if (indexedAccess.argumentExpression.kind === 9 /* StringLiteral */ || indexedAccess.argumentExpression.kind === 8 /* NumericLiteral */) {
                            var literal = indexedAccess.argumentExpression;
                            literal.text = internIdentifier(literal.text);
                        }
                    }
                    parseExpected(20 /* CloseBracketToken */);
                    expression = finishNode(indexedAccess);
                    continue;
                }
                if (token === 11 /* NoSubstitutionTemplateLiteral */ || token === 12 /* TemplateHead */) {
                    var tagExpression = createNode(168 /* TaggedTemplateExpression */, expression.pos);
                    tagExpression.tag = expression;
                    tagExpression.template = token === 11 /* NoSubstitutionTemplateLiteral */
                        ? parseLiteralNode()
                        : parseTemplateExpression();
                    expression = finishNode(tagExpression);
                    continue;
                }
                return expression;
            }
        }
        function parseCallExpressionRest(expression) {
            while (true) {
                expression = parseMemberExpressionRest(expression);
                if (token === 25 /* LessThanToken */) {
                    // See if this is the start of a generic invocation.  If so, consume it and
                    // keep checking for postfix expressions.  Otherwise, it's just a '<' that's
                    // part of an arithmetic expression.  Break out so we consume it higher in the
                    // stack.
                    var typeArguments = tryParse(parseTypeArgumentsInExpression);
                    if (!typeArguments) {
                        return expression;
                    }
                    var callExpr = createNode(166 /* CallExpression */, expression.pos);
                    callExpr.expression = expression;
                    callExpr.typeArguments = typeArguments;
                    callExpr.arguments = parseArgumentList();
                    expression = finishNode(callExpr);
                    continue;
                }
                else if (token === 17 /* OpenParenToken */) {
                    var callExpr = createNode(166 /* CallExpression */, expression.pos);
                    callExpr.expression = expression;
                    callExpr.arguments = parseArgumentList();
                    expression = finishNode(callExpr);
                    continue;
                }
                return expression;
            }
        }
        function parseArgumentList() {
            parseExpected(17 /* OpenParenToken */);
            var result = parseDelimitedList(11 /* ArgumentExpressions */, parseArgumentExpression);
            parseExpected(18 /* CloseParenToken */);
            return result;
        }
        function parseTypeArgumentsInExpression() {
            if (!parseOptional(25 /* LessThanToken */)) {
                return undefined;
            }
            var typeArguments = parseDelimitedList(18 /* TypeArguments */, parseType);
            if (!parseExpected(27 /* GreaterThanToken */)) {
                // If it doesn't have the closing >  then it's definitely not an type argument list.
                return undefined;
            }
            // If we have a '<', then only parse this as a arugment list if the type arguments
            // are complete and we have an open paren.  if we don't, rewind and return nothing.
            return typeArguments && canFollowTypeArgumentsInExpression()
                ? typeArguments
                : undefined;
        }
        function canFollowTypeArgumentsInExpression() {
            switch (token) {
                case 17 /* OpenParenToken */: // foo<x>(
                // this case are the only case where this token can legally follow a type argument
                // list.  So we definitely want to treat this as a type arg list.
                case 21 /* DotToken */: // foo<x>.
                case 18 /* CloseParenToken */: // foo<x>)
                case 20 /* CloseBracketToken */: // foo<x>]
                case 53 /* ColonToken */: // foo<x>:
                case 23 /* SemicolonToken */: // foo<x>;
                case 52 /* QuestionToken */: // foo<x>?
                case 30 /* EqualsEqualsToken */: // foo<x> ==
                case 32 /* EqualsEqualsEqualsToken */: // foo<x> ===
                case 31 /* ExclamationEqualsToken */: // foo<x> !=
                case 33 /* ExclamationEqualsEqualsToken */: // foo<x> !==
                case 50 /* AmpersandAmpersandToken */: // foo<x> &&
                case 51 /* BarBarToken */: // foo<x> ||
                case 47 /* CaretToken */: // foo<x> ^
                case 45 /* AmpersandToken */: // foo<x> &
                case 46 /* BarToken */: // foo<x> |
                case 16 /* CloseBraceToken */: // foo<x> }
                case 1 /* EndOfFileToken */:
                    // these cases can't legally follow a type arg list.  However, they're not legal
                    // expressions either.  The user is probably in the middle of a generic type. So
                    // treat it as such.
                    return true;
                case 24 /* CommaToken */: // foo<x>,
                case 15 /* OpenBraceToken */: // foo<x> {
                // We don't want to treat these as type arguments.  Otherwise we'll parse this
                // as an invocation expression.  Instead, we want to parse out the expression
                // in isolation from the type arguments.
                default:
                    // Anything else treat as an expression.
                    return false;
            }
        }
        function parsePrimaryExpression() {
            switch (token) {
                case 8 /* NumericLiteral */:
                case 9 /* StringLiteral */:
                case 11 /* NoSubstitutionTemplateLiteral */:
                    return parseLiteralNode();
                case 95 /* ThisKeyword */:
                case 93 /* SuperKeyword */:
                case 91 /* NullKeyword */:
                case 97 /* TrueKeyword */:
                case 82 /* FalseKeyword */:
                    return parseTokenNode();
                case 17 /* OpenParenToken */:
                    return parseParenthesizedExpression();
                case 19 /* OpenBracketToken */:
                    return parseArrayLiteralExpression();
                case 15 /* OpenBraceToken */:
                    return parseObjectLiteralExpression();
                case 116 /* AsyncKeyword */:
                    // Async arrow functions are parsed earlier in parseAssignmentExpressionOrHigher.
                    // If we encounter `async [no LineTerminator here] function` then this is an async
                    // function; otherwise, its an identifier.
                    if (!lookAhead(nextTokenIsFunctionKeywordOnSameLine)) {
                        break;
                    }
                    return parseFunctionExpression();
                case 71 /* ClassKeyword */:
                    return parseClassExpression();
                case 85 /* FunctionKeyword */:
                    return parseFunctionExpression();
                case 90 /* NewKeyword */:
                    return parseNewExpression();
                case 38 /* SlashToken */:
                case 59 /* SlashEqualsToken */:
                    if (reScanSlashToken() === 10 /* RegularExpressionLiteral */) {
                        return parseLiteralNode();
                    }
                    break;
                case 12 /* TemplateHead */:
                    return parseTemplateExpression();
            }
            return parseIdentifier(ts.Diagnostics.Expression_expected);
        }
        function parseParenthesizedExpression() {
            var node = createNode(170 /* ParenthesizedExpression */);
            parseExpected(17 /* OpenParenToken */);
            node.expression = allowInAnd(parseExpression);
            parseExpected(18 /* CloseParenToken */);
            return finishNode(node);
        }
        function parseSpreadElement() {
            var node = createNode(183 /* SpreadElementExpression */);
            parseExpected(22 /* DotDotDotToken */);
            node.expression = parseAssignmentExpressionOrHigher();
            return finishNode(node);
        }
        function parseArgumentOrArrayLiteralElement() {
            return token === 22 /* DotDotDotToken */ ? parseSpreadElement() :
                token === 24 /* CommaToken */ ? createNode(185 /* OmittedExpression */) :
                    parseAssignmentExpressionOrHigher();
        }
        function parseArgumentExpression() {
            return doOutsideOfContext(disallowInAndDecoratorContext, parseArgumentOrArrayLiteralElement);
        }
        function parseArrayLiteralExpression() {
            var node = createNode(162 /* ArrayLiteralExpression */);
            parseExpected(19 /* OpenBracketToken */);
            if (scanner.hasPrecedingLineBreak())
                node.flags |= 2048 /* MultiLine */;
            node.elements = parseDelimitedList(15 /* ArrayLiteralMembers */, parseArgumentOrArrayLiteralElement);
            parseExpected(20 /* CloseBracketToken */);
            return finishNode(node);
        }
        function tryParseAccessorDeclaration(fullStart, decorators, modifiers) {
            if (parseContextualModifier(121 /* GetKeyword */)) {
                return parseAccessorDeclaration(143 /* GetAccessor */, fullStart, decorators, modifiers);
            }
            else if (parseContextualModifier(127 /* SetKeyword */)) {
                return parseAccessorDeclaration(144 /* SetAccessor */, fullStart, decorators, modifiers);
            }
            return undefined;
        }
        function parseObjectLiteralElement() {
            var fullStart = scanner.getStartPos();
            var decorators = parseDecorators();
            var modifiers = parseModifiers();
            var accessor = tryParseAccessorDeclaration(fullStart, decorators, modifiers);
            if (accessor) {
                return accessor;
            }
            var asteriskToken = parseOptionalToken(37 /* AsteriskToken */);
            var tokenIsIdentifier = isIdentifier();
            var nameToken = token;
            var propertyName = parsePropertyName();
            // Disallowing of optional property assignments happens in the grammar checker.
            var questionToken = parseOptionalToken(52 /* QuestionToken */);
            if (asteriskToken || token === 17 /* OpenParenToken */ || token === 25 /* LessThanToken */) {
                return parseMethodDeclaration(fullStart, decorators, modifiers, asteriskToken, propertyName, questionToken);
            }
            // Parse to check if it is short-hand property assignment or normal property assignment
            if ((token === 24 /* CommaToken */ || token === 16 /* CloseBraceToken */) && tokenIsIdentifier) {
                var shorthandDeclaration = createNode(244 /* ShorthandPropertyAssignment */, fullStart);
                shorthandDeclaration.name = propertyName;
                shorthandDeclaration.questionToken = questionToken;
                return finishNode(shorthandDeclaration);
            }
            else {
                var propertyAssignment = createNode(243 /* PropertyAssignment */, fullStart);
                propertyAssignment.name = propertyName;
                propertyAssignment.questionToken = questionToken;
                parseExpected(53 /* ColonToken */);
                propertyAssignment.initializer = allowInAnd(parseAssignmentExpressionOrHigher);
                return finishNode(propertyAssignment);
            }
        }
        function parseObjectLiteralExpression() {
            var node = createNode(163 /* ObjectLiteralExpression */);
            parseExpected(15 /* OpenBraceToken */);
            if (scanner.hasPrecedingLineBreak()) {
                node.flags |= 2048 /* MultiLine */;
            }
            node.properties = parseDelimitedList(12 /* ObjectLiteralMembers */, parseObjectLiteralElement, true);
            parseExpected(16 /* CloseBraceToken */);
            return finishNode(node);
        }
        function parseFunctionExpression() {
            // GeneratorExpression:
            //      function* BindingIdentifier [Yield][opt](FormalParameters[Yield]){ GeneratorBody }
            //
            // FunctionExpression:
            //      function BindingIdentifier[opt](FormalParameters){ FunctionBody }
            var saveDecoratorContext = inDecoratorContext();
            if (saveDecoratorContext) {
                setDecoratorContext(false);
            }
            var node = createNode(171 /* FunctionExpression */);
            setModifiers(node, parseModifiers());
            parseExpected(85 /* FunctionKeyword */);
            node.asteriskToken = parseOptionalToken(37 /* AsteriskToken */);
            var isGenerator = !!node.asteriskToken;
            var isAsync = !!(node.flags & 512 /* Async */);
            node.name =
                isGenerator && isAsync ? doInYieldAndAwaitContext(parseOptionalIdentifier) :
                    isGenerator ? doInYieldContext(parseOptionalIdentifier) :
                        isAsync ? doInAwaitContext(parseOptionalIdentifier) :
                            parseOptionalIdentifier();
            fillSignature(53 /* ColonToken */, isGenerator, isAsync, false, node);
            node.body = parseFunctionBlock(isGenerator, isAsync, false);
            if (saveDecoratorContext) {
                setDecoratorContext(true);
            }
            return finishNode(node);
        }
        function parseOptionalIdentifier() {
            return isIdentifier() ? parseIdentifier() : undefined;
        }
        function parseNewExpression() {
            var node = createNode(167 /* NewExpression */);
            parseExpected(90 /* NewKeyword */);
            node.expression = parseMemberExpressionOrHigher();
            node.typeArguments = tryParse(parseTypeArgumentsInExpression);
            if (node.typeArguments || token === 17 /* OpenParenToken */) {
                node.arguments = parseArgumentList();
            }
            return finishNode(node);
        }
        // STATEMENTS
        function parseBlock(ignoreMissingOpenBrace, diagnosticMessage) {
            var node = createNode(190 /* Block */);
            if (parseExpected(15 /* OpenBraceToken */, diagnosticMessage) || ignoreMissingOpenBrace) {
                node.statements = parseList(1 /* BlockStatements */, parseStatement);
                parseExpected(16 /* CloseBraceToken */);
            }
            else {
                node.statements = createMissingList();
            }
            return finishNode(node);
        }
        function parseFunctionBlock(allowYield, allowAwait, ignoreMissingOpenBrace, diagnosticMessage) {
            var savedYieldContext = inYieldContext();
            setYieldContext(allowYield);
            var savedAwaitContext = inAwaitContext();
            setAwaitContext(allowAwait);
            // We may be in a [Decorator] context when parsing a function expression or
            // arrow function. The body of the function is not in [Decorator] context.
            var saveDecoratorContext = inDecoratorContext();
            if (saveDecoratorContext) {
                setDecoratorContext(false);
            }
            var block = parseBlock(ignoreMissingOpenBrace, diagnosticMessage);
            if (saveDecoratorContext) {
                setDecoratorContext(true);
            }
            setYieldContext(savedYieldContext);
            setAwaitContext(savedAwaitContext);
            return block;
        }
        function parseEmptyStatement() {
            var node = createNode(192 /* EmptyStatement */);
            parseExpected(23 /* SemicolonToken */);
            return finishNode(node);
        }
        function parseIfStatement() {
            var node = createNode(194 /* IfStatement */);
            parseExpected(86 /* IfKeyword */);
            parseExpected(17 /* OpenParenToken */);
            node.expression = allowInAnd(parseExpression);
            parseExpected(18 /* CloseParenToken */);
            node.thenStatement = parseStatement();
            node.elseStatement = parseOptional(78 /* ElseKeyword */) ? parseStatement() : undefined;
            return finishNode(node);
        }
        function parseDoStatement() {
            var node = createNode(195 /* DoStatement */);
            parseExpected(77 /* DoKeyword */);
            node.statement = parseStatement();
            parseExpected(102 /* WhileKeyword */);
            parseExpected(17 /* OpenParenToken */);
            node.expression = allowInAnd(parseExpression);
            parseExpected(18 /* CloseParenToken */);
            // From: https://mail.mozilla.org/pipermail/es-discuss/2011-August/016188.html
            // 157 min --- All allen at wirfs-brock.com CONF --- "do{;}while(false)false" prohibited in
            // spec but allowed in consensus reality. Approved -- this is the de-facto standard whereby
            //  do;while(0)x will have a semicolon inserted before x.
            parseOptional(23 /* SemicolonToken */);
            return finishNode(node);
        }
        function parseWhileStatement() {
            var node = createNode(196 /* WhileStatement */);
            parseExpected(102 /* WhileKeyword */);
            parseExpected(17 /* OpenParenToken */);
            node.expression = allowInAnd(parseExpression);
            parseExpected(18 /* CloseParenToken */);
            node.statement = parseStatement();
            return finishNode(node);
        }
        function parseForOrForInOrForOfStatement() {
            var pos = getNodePos();
            parseExpected(84 /* ForKeyword */);
            parseExpected(17 /* OpenParenToken */);
            var initializer = undefined;
            if (token !== 23 /* SemicolonToken */) {
                if (token === 100 /* VarKeyword */ || token === 106 /* LetKeyword */ || token === 72 /* ConstKeyword */) {
                    initializer = parseVariableDeclarationList(true);
                }
                else {
                    initializer = disallowInAnd(parseExpression);
                }
            }
            var forOrForInOrForOfStatement;
            if (parseOptional(88 /* InKeyword */)) {
                var forInStatement = createNode(198 /* ForInStatement */, pos);
                forInStatement.initializer = initializer;
                forInStatement.expression = allowInAnd(parseExpression);
                parseExpected(18 /* CloseParenToken */);
                forOrForInOrForOfStatement = forInStatement;
            }
            else if (parseOptional(132 /* OfKeyword */)) {
                var forOfStatement = createNode(199 /* ForOfStatement */, pos);
                forOfStatement.initializer = initializer;
                forOfStatement.expression = allowInAnd(parseAssignmentExpressionOrHigher);
                parseExpected(18 /* CloseParenToken */);
                forOrForInOrForOfStatement = forOfStatement;
            }
            else {
                var forStatement = createNode(197 /* ForStatement */, pos);
                forStatement.initializer = initializer;
                parseExpected(23 /* SemicolonToken */);
                if (token !== 23 /* SemicolonToken */ && token !== 18 /* CloseParenToken */) {
                    forStatement.condition = allowInAnd(parseExpression);
                }
                parseExpected(23 /* SemicolonToken */);
                if (token !== 18 /* CloseParenToken */) {
                    forStatement.incrementor = allowInAnd(parseExpression);
                }
                parseExpected(18 /* CloseParenToken */);
                forOrForInOrForOfStatement = forStatement;
            }
            forOrForInOrForOfStatement.statement = parseStatement();
            return finishNode(forOrForInOrForOfStatement);
        }
        function parseBreakOrContinueStatement(kind) {
            var node = createNode(kind);
            parseExpected(kind === 201 /* BreakStatement */ ? 68 /* BreakKeyword */ : 73 /* ContinueKeyword */);
            if (!canParseSemicolon()) {
                node.label = parseIdentifier();
            }
            parseSemicolon();
            return finishNode(node);
        }
        function parseReturnStatement() {
            var node = createNode(202 /* ReturnStatement */);
            parseExpected(92 /* ReturnKeyword */);
            if (!canParseSemicolon()) {
                node.expression = allowInAnd(parseExpression);
            }
            parseSemicolon();
            return finishNode(node);
        }
        function parseWithStatement() {
            var node = createNode(203 /* WithStatement */);
            parseExpected(103 /* WithKeyword */);
            parseExpected(17 /* OpenParenToken */);
            node.expression = allowInAnd(parseExpression);
            parseExpected(18 /* CloseParenToken */);
            node.statement = parseStatement();
            return finishNode(node);
        }
        function parseCaseClause() {
            var node = createNode(239 /* CaseClause */);
            parseExpected(69 /* CaseKeyword */);
            node.expression = allowInAnd(parseExpression);
            parseExpected(53 /* ColonToken */);
            node.statements = parseList(3 /* SwitchClauseStatements */, parseStatement);
            return finishNode(node);
        }
        function parseDefaultClause() {
            var node = createNode(240 /* DefaultClause */);
            parseExpected(75 /* DefaultKeyword */);
            parseExpected(53 /* ColonToken */);
            node.statements = parseList(3 /* SwitchClauseStatements */, parseStatement);
            return finishNode(node);
        }
        function parseCaseOrDefaultClause() {
            return token === 69 /* CaseKeyword */ ? parseCaseClause() : parseDefaultClause();
        }
        function parseSwitchStatement() {
            var node = createNode(204 /* SwitchStatement */);
            parseExpected(94 /* SwitchKeyword */);
            parseExpected(17 /* OpenParenToken */);
            node.expression = allowInAnd(parseExpression);
            parseExpected(18 /* CloseParenToken */);
            var caseBlock = createNode(218 /* CaseBlock */, scanner.getStartPos());
            parseExpected(15 /* OpenBraceToken */);
            caseBlock.clauses = parseList(2 /* SwitchClauses */, parseCaseOrDefaultClause);
            parseExpected(16 /* CloseBraceToken */);
            node.caseBlock = finishNode(caseBlock);
            return finishNode(node);
        }
        function parseThrowStatement() {
            // ThrowStatement[Yield] :
            //      throw [no LineTerminator here]Expression[In, ?Yield];
            // Because of automatic semicolon insertion, we need to report error if this
            // throw could be terminated with a semicolon.  Note: we can't call 'parseExpression'
            // directly as that might consume an expression on the following line.
            // We just return 'undefined' in that case.  The actual error will be reported in the
            // grammar walker.
            var node = createNode(206 /* ThrowStatement */);
            parseExpected(96 /* ThrowKeyword */);
            node.expression = scanner.hasPrecedingLineBreak() ? undefined : allowInAnd(parseExpression);
            parseSemicolon();
            return finishNode(node);
        }
        // TODO: Review for error recovery
        function parseTryStatement() {
            var node = createNode(207 /* TryStatement */);
            parseExpected(98 /* TryKeyword */);
            node.tryBlock = parseBlock(false);
            node.catchClause = token === 70 /* CatchKeyword */ ? parseCatchClause() : undefined;
            // If we don't have a catch clause, then we must have a finally clause.  Try to parse
            // one out no matter what.
            if (!node.catchClause || token === 83 /* FinallyKeyword */) {
                parseExpected(83 /* FinallyKeyword */);
                node.finallyBlock = parseBlock(false);
            }
            return finishNode(node);
        }
        function parseCatchClause() {
            var result = createNode(242 /* CatchClause */);
            parseExpected(70 /* CatchKeyword */);
            if (parseExpected(17 /* OpenParenToken */)) {
                result.variableDeclaration = parseVariableDeclaration();
            }
            parseExpected(18 /* CloseParenToken */);
            result.block = parseBlock(false);
            return finishNode(result);
        }
        function parseDebuggerStatement() {
            var node = createNode(208 /* DebuggerStatement */);
            parseExpected(74 /* DebuggerKeyword */);
            parseSemicolon();
            return finishNode(node);
        }
        function parseExpressionOrLabeledStatement() {
            // Avoiding having to do the lookahead for a labeled statement by just trying to parse
            // out an expression, seeing if it is identifier and then seeing if it is followed by
            // a colon.
            var fullStart = scanner.getStartPos();
            var expression = allowInAnd(parseExpression);
            if (expression.kind === 67 /* Identifier */ && parseOptional(53 /* ColonToken */)) {
                var labeledStatement = createNode(205 /* LabeledStatement */, fullStart);
                labeledStatement.label = expression;
                labeledStatement.statement = parseStatement();
                return finishNode(labeledStatement);
            }
            else {
                var expressionStatement = createNode(193 /* ExpressionStatement */, fullStart);
                expressionStatement.expression = expression;
                parseSemicolon();
                return finishNode(expressionStatement);
            }
        }
        function isIdentifierOrKeyword() {
            return token >= 67 /* Identifier */;
        }
        function nextTokenIsIdentifierOrKeywordOnSameLine() {
            nextToken();
            return isIdentifierOrKeyword() && !scanner.hasPrecedingLineBreak();
        }
        function nextTokenIsFunctionKeywordOnSameLine() {
            nextToken();
            return token === 85 /* FunctionKeyword */ && !scanner.hasPrecedingLineBreak();
        }
        function nextTokenIsIdentifierOrKeywordOrNumberOnSameLine() {
            nextToken();
            return (isIdentifierOrKeyword() || token === 8 /* NumericLiteral */) && !scanner.hasPrecedingLineBreak();
        }
        function isDeclaration() {
            while (true) {
                switch (token) {
                    case 100 /* VarKeyword */:
                    case 106 /* LetKeyword */:
                    case 72 /* ConstKeyword */:
                    case 85 /* FunctionKeyword */:
                    case 71 /* ClassKeyword */:
                    case 79 /* EnumKeyword */:
                        return true;
                    // 'declare', 'module', 'namespace', 'interface'* and 'type' are all legal JavaScript identifiers;
                    // however, an identifier cannot be followed by another identifier on the same line. This is what we
                    // count on to parse out the respective declarations. For instance, we exploit this to say that
                    //
                    //    namespace n
                    //
                    // can be none other than the beginning of a namespace declaration, but need to respect that JavaScript sees
                    //
                    //    namespace
                    //    n
                    //
                    // as the identifier 'namespace' on one line followed by the identifier 'n' on another.
                    // We need to look one token ahead to see if it permissible to try parsing a declaration.
                    //
                    // *Note*: 'interface' is actually a strict mode reserved word. So while
                    //
                    //   "use strict"
                    //   interface
                    //   I {}
                    //
                    // could be legal, it would add complexity for very little gain.
                    case 105 /* InterfaceKeyword */:
                    case 130 /* TypeKeyword */:
                        return nextTokenIsIdentifierOnSameLine();
                    case 123 /* ModuleKeyword */:
                    case 124 /* NamespaceKeyword */:
                        return nextTokenIsIdentifierOrStringLiteralOnSameLine();
                    case 116 /* AsyncKeyword */:
                    case 120 /* DeclareKeyword */:
                        nextToken();
                        // ASI takes effect for this modifier.
                        if (scanner.hasPrecedingLineBreak()) {
                            return false;
                        }
                        continue;
                    case 87 /* ImportKeyword */:
                        nextToken();
                        return token === 9 /* StringLiteral */ || token === 37 /* AsteriskToken */ ||
                            token === 15 /* OpenBraceToken */ || isIdentifierOrKeyword();
                    case 80 /* ExportKeyword */:
                        nextToken();
                        if (token === 55 /* EqualsToken */ || token === 37 /* AsteriskToken */ ||
                            token === 15 /* OpenBraceToken */ || token === 75 /* DefaultKeyword */) {
                            return true;
                        }
                        continue;
                    case 110 /* PublicKeyword */:
                    case 108 /* PrivateKeyword */:
                    case 109 /* ProtectedKeyword */:
                    case 111 /* StaticKeyword */:
                    case 113 /* AbstractKeyword */:
                        nextToken();
                        continue;
                    default:
                        return false;
                }
            }
        }
        function isStartOfDeclaration() {
            return lookAhead(isDeclaration);
        }
        function isStartOfStatement() {
            switch (token) {
                case 54 /* AtToken */:
                case 23 /* SemicolonToken */:
                case 15 /* OpenBraceToken */:
                case 100 /* VarKeyword */:
                case 106 /* LetKeyword */:
                case 85 /* FunctionKeyword */:
                case 71 /* ClassKeyword */:
                case 79 /* EnumKeyword */:
                case 86 /* IfKeyword */:
                case 77 /* DoKeyword */:
                case 102 /* WhileKeyword */:
                case 84 /* ForKeyword */:
                case 73 /* ContinueKeyword */:
                case 68 /* BreakKeyword */:
                case 92 /* ReturnKeyword */:
                case 103 /* WithKeyword */:
                case 94 /* SwitchKeyword */:
                case 96 /* ThrowKeyword */:
                case 98 /* TryKeyword */:
                case 74 /* DebuggerKeyword */:
                // 'catch' and 'finally' do not actually indicate that the code is part of a statement,
                // however, we say they are here so that we may gracefully parse them and error later.
                case 70 /* CatchKeyword */:
                case 83 /* FinallyKeyword */:
                    return true;
                case 72 /* ConstKeyword */:
                case 80 /* ExportKeyword */:
                case 87 /* ImportKeyword */:
                    return isStartOfDeclaration();
                case 116 /* AsyncKeyword */:
                case 120 /* DeclareKeyword */:
                case 105 /* InterfaceKeyword */:
                case 123 /* ModuleKeyword */:
                case 124 /* NamespaceKeyword */:
                case 130 /* TypeKeyword */:
                    // When these don't start a declaration, they're an identifier in an expression statement
                    return true;
                case 110 /* PublicKeyword */:
                case 108 /* PrivateKeyword */:
                case 109 /* ProtectedKeyword */:
                case 111 /* StaticKeyword */:
                    // When these don't start a declaration, they may be the start of a class member if an identifier
                    // immediately follows. Otherwise they're an identifier in an expression statement.
                    return isStartOfDeclaration() || !lookAhead(nextTokenIsIdentifierOrKeywordOnSameLine);
                default:
                    return isStartOfExpression();
            }
        }
        function nextTokenIsIdentifierOrStartOfDestructuring() {
            nextToken();
            return isIdentifier() || token === 15 /* OpenBraceToken */ || token === 19 /* OpenBracketToken */;
        }
        function isLetDeclaration() {
            // In ES6 'let' always starts a lexical declaration if followed by an identifier or {
            // or [.
            return lookAhead(nextTokenIsIdentifierOrStartOfDestructuring);
        }
        function parseStatement() {
            switch (token) {
                case 23 /* SemicolonToken */:
                    return parseEmptyStatement();
                case 15 /* OpenBraceToken */:
                    return parseBlock(false);
                case 100 /* VarKeyword */:
                    return parseVariableStatement(scanner.getStartPos(), undefined, undefined);
                case 106 /* LetKeyword */:
                    if (isLetDeclaration()) {
                        return parseVariableStatement(scanner.getStartPos(), undefined, undefined);
                    }
                    break;
                case 85 /* FunctionKeyword */:
                    return parseFunctionDeclaration(scanner.getStartPos(), undefined, undefined);
                case 71 /* ClassKeyword */:
                    return parseClassDeclaration(scanner.getStartPos(), undefined, undefined);
                case 86 /* IfKeyword */:
                    return parseIfStatement();
                case 77 /* DoKeyword */:
                    return parseDoStatement();
                case 102 /* WhileKeyword */:
                    return parseWhileStatement();
                case 84 /* ForKeyword */:
                    return parseForOrForInOrForOfStatement();
                case 73 /* ContinueKeyword */:
                    return parseBreakOrContinueStatement(200 /* ContinueStatement */);
                case 68 /* BreakKeyword */:
                    return parseBreakOrContinueStatement(201 /* BreakStatement */);
                case 92 /* ReturnKeyword */:
                    return parseReturnStatement();
                case 103 /* WithKeyword */:
                    return parseWithStatement();
                case 94 /* SwitchKeyword */:
                    return parseSwitchStatement();
                case 96 /* ThrowKeyword */:
                    return parseThrowStatement();
                case 98 /* TryKeyword */:
                // Include 'catch' and 'finally' for error recovery.
                case 70 /* CatchKeyword */:
                case 83 /* FinallyKeyword */:
                    return parseTryStatement();
                case 74 /* DebuggerKeyword */:
                    return parseDebuggerStatement();
                case 54 /* AtToken */:
                    return parseDeclaration();
                case 116 /* AsyncKeyword */:
                case 105 /* InterfaceKeyword */:
                case 130 /* TypeKeyword */:
                case 123 /* ModuleKeyword */:
                case 124 /* NamespaceKeyword */:
                case 120 /* DeclareKeyword */:
                case 72 /* ConstKeyword */:
                case 79 /* EnumKeyword */:
                case 80 /* ExportKeyword */:
                case 87 /* ImportKeyword */:
                case 108 /* PrivateKeyword */:
                case 109 /* ProtectedKeyword */:
                case 110 /* PublicKeyword */:
                case 113 /* AbstractKeyword */:
                case 111 /* StaticKeyword */:
                    if (isStartOfDeclaration()) {
                        return parseDeclaration();
                    }
                    break;
            }
            return parseExpressionOrLabeledStatement();
        }
        function parseDeclaration() {
            var fullStart = getNodePos();
            var decorators = parseDecorators();
            var modifiers = parseModifiers();
            switch (token) {
                case 100 /* VarKeyword */:
                case 106 /* LetKeyword */:
                case 72 /* ConstKeyword */:
                    return parseVariableStatement(fullStart, decorators, modifiers);
                case 85 /* FunctionKeyword */:
                    return parseFunctionDeclaration(fullStart, decorators, modifiers);
                case 71 /* ClassKeyword */:
                    return parseClassDeclaration(fullStart, decorators, modifiers);
                case 105 /* InterfaceKeyword */:
                    return parseInterfaceDeclaration(fullStart, decorators, modifiers);
                case 130 /* TypeKeyword */:
                    return parseTypeAliasDeclaration(fullStart, decorators, modifiers);
                case 79 /* EnumKeyword */:
                    return parseEnumDeclaration(fullStart, decorators, modifiers);
                case 123 /* ModuleKeyword */:
                case 124 /* NamespaceKeyword */:
                    return parseModuleDeclaration(fullStart, decorators, modifiers);
                case 87 /* ImportKeyword */:
                    return parseImportDeclarationOrImportEqualsDeclaration(fullStart, decorators, modifiers);
                case 80 /* ExportKeyword */:
                    nextToken();
                    return token === 75 /* DefaultKeyword */ || token === 55 /* EqualsToken */ ?
                        parseExportAssignment(fullStart, decorators, modifiers) :
                        parseExportDeclaration(fullStart, decorators, modifiers);
                default:
                    if (decorators || modifiers) {
                        // We reached this point because we encountered decorators and/or modifiers and assumed a declaration
                        // would follow. For recovery and error reporting purposes, return an incomplete declaration.
                        var node = createMissingNode(229 /* MissingDeclaration */, true, ts.Diagnostics.Declaration_expected);
                        node.pos = fullStart;
                        node.decorators = decorators;
                        setModifiers(node, modifiers);
                        return finishNode(node);
                    }
            }
        }
        function nextTokenIsIdentifierOrStringLiteralOnSameLine() {
            nextToken();
            return !scanner.hasPrecedingLineBreak() && (isIdentifier() || token === 9 /* StringLiteral */);
        }
        function parseFunctionBlockOrSemicolon(isGenerator, isAsync, diagnosticMessage) {
            if (token !== 15 /* OpenBraceToken */ && canParseSemicolon()) {
                parseSemicolon();
                return;
            }
            return parseFunctionBlock(isGenerator, isAsync, false, diagnosticMessage);
        }
        // DECLARATIONS
        function parseArrayBindingElement() {
            if (token === 24 /* CommaToken */) {
                return createNode(185 /* OmittedExpression */);
            }
            var node = createNode(161 /* BindingElement */);
            node.dotDotDotToken = parseOptionalToken(22 /* DotDotDotToken */);
            node.name = parseIdentifierOrPattern();
            node.initializer = parseBindingElementInitializer(false);
            return finishNode(node);
        }
        function parseObjectBindingElement() {
            var node = createNode(161 /* BindingElement */);
            // TODO(andersh): Handle computed properties
            var tokenIsIdentifier = isIdentifier();
            var propertyName = parsePropertyName();
            if (tokenIsIdentifier && token !== 53 /* ColonToken */) {
                node.name = propertyName;
            }
            else {
                parseExpected(53 /* ColonToken */);
                node.propertyName = propertyName;
                node.name = parseIdentifierOrPattern();
            }
            node.initializer = parseBindingElementInitializer(false);
            return finishNode(node);
        }
        function parseObjectBindingPattern() {
            var node = createNode(159 /* ObjectBindingPattern */);
            parseExpected(15 /* OpenBraceToken */);
            node.elements = parseDelimitedList(9 /* ObjectBindingElements */, parseObjectBindingElement);
            parseExpected(16 /* CloseBraceToken */);
            return finishNode(node);
        }
        function parseArrayBindingPattern() {
            var node = createNode(160 /* ArrayBindingPattern */);
            parseExpected(19 /* OpenBracketToken */);
            node.elements = parseDelimitedList(10 /* ArrayBindingElements */, parseArrayBindingElement);
            parseExpected(20 /* CloseBracketToken */);
            return finishNode(node);
        }
        function isIdentifierOrPattern() {
            return token === 15 /* OpenBraceToken */ || token === 19 /* OpenBracketToken */ || isIdentifier();
        }
        function parseIdentifierOrPattern() {
            if (token === 19 /* OpenBracketToken */) {
                return parseArrayBindingPattern();
            }
            if (token === 15 /* OpenBraceToken */) {
                return parseObjectBindingPattern();
            }
            return parseIdentifier();
        }
        function parseVariableDeclaration() {
            var node = createNode(209 /* VariableDeclaration */);
            node.name = parseIdentifierOrPattern();
            node.type = parseTypeAnnotation();
            if (!isInOrOfKeyword(token)) {
                node.initializer = parseInitializer(false);
            }
            return finishNode(node);
        }
        function parseVariableDeclarationList(inForStatementInitializer) {
            var node = createNode(210 /* VariableDeclarationList */);
            switch (token) {
                case 100 /* VarKeyword */:
                    break;
                case 106 /* LetKeyword */:
                    node.flags |= 16384 /* Let */;
                    break;
                case 72 /* ConstKeyword */:
                    node.flags |= 32768 /* Const */;
                    break;
                default:
                    Debug.fail();
            }
            nextToken();
            // The user may have written the following:
            //
            //    for (let of X) { }
            //
            // In this case, we want to parse an empty declaration list, and then parse 'of'
            // as a keyword. The reason this is not automatic is that 'of' is a valid identifier.
            // So we need to look ahead to determine if 'of' should be treated as a keyword in
            // this context.
            // The checker will then give an error that there is an empty declaration list.
            if (token === 132 /* OfKeyword */ && lookAhead(canFollowContextualOfKeyword)) {
                node.declarations = createMissingList();
            }
            else {
                var savedDisallowIn = inDisallowInContext();
                setDisallowInContext(inForStatementInitializer);
                node.declarations = parseDelimitedList(8 /* VariableDeclarations */, parseVariableDeclaration);
                setDisallowInContext(savedDisallowIn);
            }
            return finishNode(node);
        }
        function canFollowContextualOfKeyword() {
            return nextTokenIsIdentifier() && nextToken() === 18 /* CloseParenToken */;
        }
        function parseVariableStatement(fullStart, decorators, modifiers) {
            var node = createNode(191 /* VariableStatement */, fullStart);
            node.decorators = decorators;
            setModifiers(node, modifiers);
            node.declarationList = parseVariableDeclarationList(false);
            parseSemicolon();
            return finishNode(node);
        }
        function parseFunctionDeclaration(fullStart, decorators, modifiers) {
            var node = createNode(211 /* FunctionDeclaration */, fullStart);
            node.decorators = decorators;
            setModifiers(node, modifiers);
            parseExpected(85 /* FunctionKeyword */);
            node.asteriskToken = parseOptionalToken(37 /* AsteriskToken */);
            node.name = node.flags & 1024 /* Default */ ? parseOptionalIdentifier() : parseIdentifier();
            var isGenerator = !!node.asteriskToken;
            var isAsync = !!(node.flags & 512 /* Async */);
            fillSignature(53 /* ColonToken */, isGenerator, isAsync, false, node);
            node.body = parseFunctionBlockOrSemicolon(isGenerator, isAsync, ts.Diagnostics.or_expected);
            return finishNode(node);
        }
        function parseConstructorDeclaration(pos, decorators, modifiers) {
            var node = createNode(142 /* Constructor */, pos);
            node.decorators = decorators;
            setModifiers(node, modifiers);
            parseExpected(119 /* ConstructorKeyword */);
            fillSignature(53 /* ColonToken */, false, false, false, node);
            node.body = parseFunctionBlockOrSemicolon(false, false, ts.Diagnostics.or_expected);
            return finishNode(node);
        }
        function parseMethodDeclaration(fullStart, decorators, modifiers, asteriskToken, name, questionToken, diagnosticMessage) {
            var method = createNode(141 /* MethodDeclaration */, fullStart);
            method.decorators = decorators;
            setModifiers(method, modifiers);
            method.asteriskToken = asteriskToken;
            method.name = name;
            method.questionToken = questionToken;
            var isGenerator = !!asteriskToken;
            var isAsync = !!(method.flags & 512 /* Async */);
            fillSignature(53 /* ColonToken */, isGenerator, isAsync, false, method);
            method.body = parseFunctionBlockOrSemicolon(isGenerator, isAsync, diagnosticMessage);
            return finishNode(method);
        }
        function parsePropertyDeclaration(fullStart, decorators, modifiers, name, questionToken) {
            var property = createNode(139 /* PropertyDeclaration */, fullStart);
            property.decorators = decorators;
            setModifiers(property, modifiers);
            property.name = name;
            property.questionToken = questionToken;
            property.type = parseTypeAnnotation();
            // For instance properties specifically, since they are evaluated inside the constructor,
            // we do *not * want to parse yield expressions, so we specifically turn the yield context
            // off. The grammar would look something like this:
            //
            //    MemberVariableDeclaration[Yield]:
            //        AccessibilityModifier_opt   PropertyName   TypeAnnotation_opt   Initialiser_opt[In];
            //        AccessibilityModifier_opt  static_opt  PropertyName   TypeAnnotation_opt   Initialiser_opt[In, ?Yield];
            //
            // The checker may still error in the static case to explicitly disallow the yield expression.
            property.initializer = modifiers && modifiers.flags & 128 /* Static */
                ? allowInAnd(parseNonParameterInitializer)
                : doOutsideOfContext(2 /* Yield */ | 1 /* DisallowIn */, parseNonParameterInitializer);
            parseSemicolon();
            return finishNode(property);
        }
        function parsePropertyOrMethodDeclaration(fullStart, decorators, modifiers) {
            var asteriskToken = parseOptionalToken(37 /* AsteriskToken */);
            var name = parsePropertyName();
            // Note: this is not legal as per the grammar.  But we allow it in the parser and
            // report an error in the grammar checker.
            var questionToken = parseOptionalToken(52 /* QuestionToken */);
            if (asteriskToken || token === 17 /* OpenParenToken */ || token === 25 /* LessThanToken */) {
                return parseMethodDeclaration(fullStart, decorators, modifiers, asteriskToken, name, questionToken, ts.Diagnostics.or_expected);
            }
            else {
                return parsePropertyDeclaration(fullStart, decorators, modifiers, name, questionToken);
            }
        }
        function parseNonParameterInitializer() {
            return parseInitializer(false);
        }
        function parseAccessorDeclaration(kind, fullStart, decorators, modifiers) {
            var node = createNode(kind, fullStart);
            node.decorators = decorators;
            setModifiers(node, modifiers);
            node.name = parsePropertyName();
            fillSignature(53 /* ColonToken */, false, false, false, node);
            node.body = parseFunctionBlockOrSemicolon(false, false);
            return finishNode(node);
        }
        function isClassMemberModifier(idToken) {
            switch (idToken) {
                case 110 /* PublicKeyword */:
                case 108 /* PrivateKeyword */:
                case 109 /* ProtectedKeyword */:
                case 111 /* StaticKeyword */:
                    return true;
                default:
                    return false;
            }
        }
        function isClassMemberStart() {
            var idToken;
            if (token === 54 /* AtToken */) {
                return true;
            }
            // Eat up all modifiers, but hold on to the last one in case it is actually an identifier.
            while (ts.isModifier(token)) {
                idToken = token;
                // If the idToken is a class modifier (protected, private, public, and static), it is
                // certain that we are starting to parse class member. This allows better error recovery
                // Example:
                //      public foo() ...     // true
                //      public @dec blah ... // true; we will then report an error later
                //      export public ...    // true; we will then report an error later
                if (isClassMemberModifier(idToken)) {
                    return true;
                }
                nextToken();
            }
            if (token === 37 /* AsteriskToken */) {
                return true;
            }
            // Try to get the first property-like token following all modifiers.
            // This can either be an identifier or the 'get' or 'set' keywords.
            if (isLiteralPropertyName()) {
                idToken = token;
                nextToken();
            }
            // Index signatures and computed properties are class members; we can parse.
            if (token === 19 /* OpenBracketToken */) {
                return true;
            }
            // If we were able to get any potential identifier...
            if (idToken !== undefined) {
                // If we have a non-keyword identifier, or if we have an accessor, then it's safe to parse.
                if (!ts.isKeyword(idToken) || idToken === 127 /* SetKeyword */ || idToken === 121 /* GetKeyword */) {
                    return true;
                }
                // If it *is* a keyword, but not an accessor, check a little farther along
                // to see if it should actually be parsed as a class member.
                switch (token) {
                    case 17 /* OpenParenToken */: // Method declaration
                    case 25 /* LessThanToken */: // Generic Method declaration
                    case 53 /* ColonToken */: // Type Annotation for declaration
                    case 55 /* EqualsToken */: // Initializer for declaration
                    case 52 /* QuestionToken */:
                        return true;
                    default:
                        // Covers
                        //  - Semicolons     (declaration termination)
                        //  - Closing braces (end-of-class, must be declaration)
                        //  - End-of-files   (not valid, but permitted so that it gets caught later on)
                        //  - Line-breaks    (enabling *automatic semicolon insertion*)
                        return canParseSemicolon();
                }
            }
            return false;
        }
        function parseDecorators() {
            var decorators;
            while (true) {
                var decoratorStart = getNodePos();
                if (!parseOptional(54 /* AtToken */)) {
                    break;
                }
                if (!decorators) {
                    decorators = [];
                    decorators.pos = scanner.getStartPos();
                }
                var decorator = createNode(137 /* Decorator */, decoratorStart);
                decorator.expression = doInDecoratorContext(parseLeftHandSideExpressionOrHigher);
                decorators.push(finishNode(decorator));
            }
            if (decorators) {
                decorators.end = getNodeEnd();
            }
            return decorators;
        }
        function parseModifiers() {
            var flags = 0;
            var modifiers;
            while (true) {
                var modifierStart = scanner.getStartPos();
                var modifierKind = token;
                if (!parseAnyContextualModifier()) {
                    break;
                }
                if (!modifiers) {
                    modifiers = [];
                    modifiers.pos = modifierStart;
                }
                flags |= ts.modifierToFlag(modifierKind);
                modifiers.push(finishNode(createNode(modifierKind, modifierStart)));
            }
            if (modifiers) {
                modifiers.flags = flags;
                modifiers.end = scanner.getStartPos();
            }
            return modifiers;
        }
        function parseModifiersForArrowFunction() {
            var flags = 0;
            var modifiers;
            if (token === 116 /* AsyncKeyword */) {
                var modifierStart = scanner.getStartPos();
                var modifierKind = token;
                nextToken();
                modifiers = [];
                modifiers.pos = modifierStart;
                flags |= ts.modifierToFlag(modifierKind);
                modifiers.push(finishNode(createNode(modifierKind, modifierStart)));
                modifiers.flags = flags;
                modifiers.end = scanner.getStartPos();
            }
            return modifiers;
        }
        function parseClassElement() {
            if (token === 23 /* SemicolonToken */) {
                var result = createNode(189 /* SemicolonClassElement */);
                nextToken();
                return finishNode(result);
            }
            var fullStart = getNodePos();
            var decorators = parseDecorators();
            var modifiers = parseModifiers();
            var accessor = tryParseAccessorDeclaration(fullStart, decorators, modifiers);
            if (accessor) {
                return accessor;
            }
            if (token === 119 /* ConstructorKeyword */) {
                return parseConstructorDeclaration(fullStart, decorators, modifiers);
            }
            if (isIndexSignature()) {
                return parseIndexSignatureDeclaration(fullStart, decorators, modifiers);
            }
            // It is very important that we check this *after* checking indexers because
            // the [ token can start an index signature or a computed property name
            if (isIdentifierOrKeyword() ||
                token === 9 /* StringLiteral */ ||
                token === 8 /* NumericLiteral */ ||
                token === 37 /* AsteriskToken */ ||
                token === 19 /* OpenBracketToken */) {
                return parsePropertyOrMethodDeclaration(fullStart, decorators, modifiers);
            }
            if (decorators || modifiers) {
                // treat this as a property declaration with a missing name.
                var name_1 = createMissingNode(67 /* Identifier */, true, ts.Diagnostics.Declaration_expected);
                return parsePropertyDeclaration(fullStart, decorators, modifiers, name_1, undefined);
            }
            // 'isClassMemberStart' should have hinted not to attempt parsing.
            Debug.fail("Should not have attempted to parse class member declaration.");
        }
        function parseClassExpression() {
            return parseClassDeclarationOrExpression(
            /*fullStart*/ scanner.getStartPos(), 
            /*decorators*/ undefined, 
            /*modifiers*/ undefined, 184 /* ClassExpression */);
        }
        function parseClassDeclaration(fullStart, decorators, modifiers) {
            return parseClassDeclarationOrExpression(fullStart, decorators, modifiers, 212 /* ClassDeclaration */);
        }
        function parseClassDeclarationOrExpression(fullStart, decorators, modifiers, kind) {
            var node = createNode(kind, fullStart);
            node.decorators = decorators;
            setModifiers(node, modifiers);
            parseExpected(71 /* ClassKeyword */);
            node.name = parseOptionalIdentifier();
            node.typeParameters = parseTypeParameters();
            node.heritageClauses = parseHeritageClauses(true);
            if (parseExpected(15 /* OpenBraceToken */)) {
                // ClassTail[Yield,Await] : (Modified) See 14.5
                //      ClassHeritage[?Yield,?Await]opt { ClassBody[?Yield,?Await]opt }
                node.members = parseClassMembers();
                parseExpected(16 /* CloseBraceToken */);
            }
            else {
                node.members = createMissingList();
            }
            return finishNode(node);
        }
        function parseHeritageClauses(isClassHeritageClause) {
            // ClassTail[Yield,Await] : (Modified) See 14.5
            //      ClassHeritage[?Yield,?Await]opt { ClassBody[?Yield,?Await]opt }
            if (isHeritageClause()) {
                return parseList(20 /* HeritageClauses */, parseHeritageClause);
            }
            return undefined;
        }
        function parseHeritageClausesWorker() {
            return parseList(20 /* HeritageClauses */, parseHeritageClause);
        }
        function parseHeritageClause() {
            if (token === 81 /* ExtendsKeyword */ || token === 104 /* ImplementsKeyword */) {
                var node = createNode(241 /* HeritageClause */);
                node.token = token;
                nextToken();
                node.types = parseDelimitedList(7 /* HeritageClauseElement */, parseExpressionWithTypeArguments);
                return finishNode(node);
            }
            return undefined;
        }
        function parseExpressionWithTypeArguments() {
            var node = createNode(186 /* ExpressionWithTypeArguments */);
            node.expression = parseLeftHandSideExpressionOrHigher();
            if (token === 25 /* LessThanToken */) {
                node.typeArguments = parseBracketedList(18 /* TypeArguments */, parseType, 25 /* LessThanToken */, 27 /* GreaterThanToken */);
            }
            return finishNode(node);
        }
        function isHeritageClause() {
            return token === 81 /* ExtendsKeyword */ || token === 104 /* ImplementsKeyword */;
        }
        function parseClassMembers() {
            return parseList(5 /* ClassMembers */, parseClassElement);
        }
        function parseInterfaceDeclaration(fullStart, decorators, modifiers) {
            var node = createNode(213 /* InterfaceDeclaration */, fullStart);
            node.decorators = decorators;
            setModifiers(node, modifiers);
            parseExpected(105 /* InterfaceKeyword */);
            node.name = parseIdentifier();
            node.typeParameters = parseTypeParameters();
            node.heritageClauses = parseHeritageClauses(false);
            node.members = parseObjectTypeMembers();
            return finishNode(node);
        }
        function parseTypeAliasDeclaration(fullStart, decorators, modifiers) {
            var node = createNode(214 /* TypeAliasDeclaration */, fullStart);
            node.decorators = decorators;
            setModifiers(node, modifiers);
            parseExpected(130 /* TypeKeyword */);
            node.name = parseIdentifier();
            node.typeParameters = parseTypeParameters();
            parseExpected(55 /* EqualsToken */);
            node.type = parseType();
            parseSemicolon();
            return finishNode(node);
        }
        // In an ambient declaration, the grammar only allows integer literals as initializers.
        // In a non-ambient declaration, the grammar allows uninitialized members only in a
        // ConstantEnumMemberSection, which starts at the beginning of an enum declaration
        // or any time an integer literal initializer is encountered.
        function parseEnumMember() {
            var node = createNode(245 /* EnumMember */, scanner.getStartPos());
            node.name = parsePropertyName();
            node.initializer = allowInAnd(parseNonParameterInitializer);
            return finishNode(node);
        }
        function parseEnumDeclaration(fullStart, decorators, modifiers) {
            var node = createNode(215 /* EnumDeclaration */, fullStart);
            node.decorators = decorators;
            setModifiers(node, modifiers);
            parseExpected(79 /* EnumKeyword */);
            node.name = parseIdentifier();
            if (parseExpected(15 /* OpenBraceToken */)) {
                node.members = parseDelimitedList(6 /* EnumMembers */, parseEnumMember);
                parseExpected(16 /* CloseBraceToken */);
            }
            else {
                node.members = createMissingList();
            }
            return finishNode(node);
        }
        function parseModuleBlock() {
            var node = createNode(217 /* ModuleBlock */, scanner.getStartPos());
            if (parseExpected(15 /* OpenBraceToken */)) {
                node.statements = parseList(1 /* BlockStatements */, parseStatement);
                parseExpected(16 /* CloseBraceToken */);
            }
            else {
                node.statements = createMissingList();
            }
            return finishNode(node);
        }
        function parseModuleOrNamespaceDeclaration(fullStart, decorators, modifiers, flags) {
            var node = createNode(216 /* ModuleDeclaration */, fullStart);
            node.decorators = decorators;
            setModifiers(node, modifiers);
            node.flags |= flags;
            node.name = parseIdentifier();
            node.body = parseOptional(21 /* DotToken */)
                ? parseModuleOrNamespaceDeclaration(getNodePos(), undefined, undefined, 1 /* Export */)
                : parseModuleBlock();
            return finishNode(node);
        }
        function parseAmbientExternalModuleDeclaration(fullStart, decorators, modifiers) {
            var node = createNode(216 /* ModuleDeclaration */, fullStart);
            node.decorators = decorators;
            setModifiers(node, modifiers);
            node.name = parseLiteralNode(true);
            node.body = parseModuleBlock();
            return finishNode(node);
        }
        function parseModuleDeclaration(fullStart, decorators, modifiers) {
            var flags = modifiers ? modifiers.flags : 0;
            if (parseOptional(124 /* NamespaceKeyword */)) {
                flags |= 131072 /* Namespace */;
            }
            else {
                parseExpected(123 /* ModuleKeyword */);
                if (token === 9 /* StringLiteral */) {
                    return parseAmbientExternalModuleDeclaration(fullStart, decorators, modifiers);
                }
            }
            return parseModuleOrNamespaceDeclaration(fullStart, decorators, modifiers, flags);
        }
        function isExternalModuleReference() {
            return token === 125 /* RequireKeyword */ &&
                lookAhead(nextTokenIsOpenParen);
        }
        function nextTokenIsOpenParen() {
            return nextToken() === 17 /* OpenParenToken */;
        }
        function nextTokenIsSlash() {
            return nextToken() === 38 /* SlashToken */;
        }
        function nextTokenIsCommaOrFromKeyword() {
            nextToken();
            return token === 24 /* CommaToken */ ||
                token === 131 /* FromKeyword */;
        }
        function parseImportDeclarationOrImportEqualsDeclaration(fullStart, decorators, modifiers) {
            parseExpected(87 /* ImportKeyword */);
            var afterImportPos = scanner.getStartPos();
            var identifier;
            if (isIdentifier()) {
                identifier = parseIdentifier();
                if (token !== 24 /* CommaToken */ && token !== 131 /* FromKeyword */) {
                    // ImportEquals declaration of type:
                    // import x = require("mod"); or
                    // import x = M.x;
                    var importEqualsDeclaration = createNode(219 /* ImportEqualsDeclaration */, fullStart);
                    importEqualsDeclaration.decorators = decorators;
                    setModifiers(importEqualsDeclaration, modifiers);
                    importEqualsDeclaration.name = identifier;
                    parseExpected(55 /* EqualsToken */);
                    importEqualsDeclaration.moduleReference = parseModuleReference();
                    parseSemicolon();
                    return finishNode(importEqualsDeclaration);
                }
            }
            // Import statement
            var importDeclaration = createNode(220 /* ImportDeclaration */, fullStart);
            importDeclaration.decorators = decorators;
            setModifiers(importDeclaration, modifiers);
            // ImportDeclaration:
            //  import ImportClause from ModuleSpecifier ;
            //  import ModuleSpecifier;
            if (identifier ||
                token === 37 /* AsteriskToken */ ||
                token === 15 /* OpenBraceToken */) {
                importDeclaration.importClause = parseImportClause(identifier, afterImportPos);
                parseExpected(131 /* FromKeyword */);
            }
            importDeclaration.moduleSpecifier = parseModuleSpecifier();
            parseSemicolon();
            return finishNode(importDeclaration);
        }
        function parseImportClause(identifier, fullStart) {
            // ImportClause:
            //  ImportedDefaultBinding
            //  NameSpaceImport
            //  NamedImports
            //  ImportedDefaultBinding, NameSpaceImport
            //  ImportedDefaultBinding, NamedImports
            var importClause = createNode(221 /* ImportClause */, fullStart);
            if (identifier) {
                // ImportedDefaultBinding:
                //  ImportedBinding
                importClause.name = identifier;
            }
            // If there was no default import or if there is comma token after default import
            // parse namespace or named imports
            if (!importClause.name ||
                parseOptional(24 /* CommaToken */)) {
                importClause.namedBindings = token === 37 /* AsteriskToken */ ? parseNamespaceImport() : parseNamedImportsOrExports(223 /* NamedImports */);
            }
            return finishNode(importClause);
        }
        function parseModuleReference() {
            return isExternalModuleReference()
                ? parseExternalModuleReference()
                : parseEntityName(false);
        }
        function parseExternalModuleReference() {
            var node = createNode(230 /* ExternalModuleReference */);
            parseExpected(125 /* RequireKeyword */);
            parseExpected(17 /* OpenParenToken */);
            node.expression = parseModuleSpecifier();
            parseExpected(18 /* CloseParenToken */);
            return finishNode(node);
        }
        function parseModuleSpecifier() {
            // We allow arbitrary expressions here, even though the grammar only allows string
            // literals.  We check to ensure that it is only a string literal later in the grammar
            // walker.
            var result = parseExpression();
            // Ensure the string being required is in our 'identifier' table.  This will ensure
            // that features like 'find refs' will look inside this file when search for its name.
            if (result.kind === 9 /* StringLiteral */) {
                internIdentifier(result.text);
            }
            return result;
        }
        function parseNamespaceImport() {
            // NameSpaceImport:
            //  * as ImportedBinding
            var namespaceImport = createNode(222 /* NamespaceImport */);
            parseExpected(37 /* AsteriskToken */);
            parseExpected(114 /* AsKeyword */);
            namespaceImport.name = parseIdentifier();
            return finishNode(namespaceImport);
        }
        function parseNamedImportsOrExports(kind) {
            var node = createNode(kind);
            // NamedImports:
            //  { }
            //  { ImportsList }
            //  { ImportsList, }
            // ImportsList:
            //  ImportSpecifier
            //  ImportsList, ImportSpecifier
            node.elements = parseBracketedList(21 /* ImportOrExportSpecifiers */, kind === 223 /* NamedImports */ ? parseImportSpecifier : parseExportSpecifier, 15 /* OpenBraceToken */, 16 /* CloseBraceToken */);
            return finishNode(node);
        }
        function parseExportSpecifier() {
            return parseImportOrExportSpecifier(228 /* ExportSpecifier */);
        }
        function parseImportSpecifier() {
            return parseImportOrExportSpecifier(224 /* ImportSpecifier */);
        }
        function parseImportOrExportSpecifier(kind) {
            var node = createNode(kind);
            // ImportSpecifier:
            //   BindingIdentifier
            //   IdentifierName as BindingIdentifier
            // ExportSpecififer:
            //   IdentifierName
            //   IdentifierName as IdentifierName
            var checkIdentifierIsKeyword = ts.isKeyword(token) && !isIdentifier();
            var checkIdentifierStart = scanner.getTokenPos();
            var checkIdentifierEnd = scanner.getTextPos();
            var identifierName = parseIdentifierName();
            if (token === 114 /* AsKeyword */) {
                node.propertyName = identifierName;
                parseExpected(114 /* AsKeyword */);
                checkIdentifierIsKeyword = ts.isKeyword(token) && !isIdentifier();
                checkIdentifierStart = scanner.getTokenPos();
                checkIdentifierEnd = scanner.getTextPos();
                node.name = parseIdentifierName();
            }
            else {
                node.name = identifierName;
            }
            if (kind === 224 /* ImportSpecifier */ && checkIdentifierIsKeyword) {
                // Report error identifier expected
                parseErrorAtPosition(checkIdentifierStart, checkIdentifierEnd - checkIdentifierStart, ts.Diagnostics.Identifier_expected);
            }
            return finishNode(node);
        }
        function parseExportDeclaration(fullStart, decorators, modifiers) {
            var node = createNode(226 /* ExportDeclaration */, fullStart);
            node.decorators = decorators;
            setModifiers(node, modifiers);
            if (parseOptional(37 /* AsteriskToken */)) {
                parseExpected(131 /* FromKeyword */);
                node.moduleSpecifier = parseModuleSpecifier();
            }
            else {
                node.exportClause = parseNamedImportsOrExports(227 /* NamedExports */);
                // It is not uncommon to accidentally omit the 'from' keyword. Additionally, in editing scenarios,
                // the 'from' keyword can be parsed as a named export when the export clause is unterminated (i.e. `export { from "moduleName";`)
                // If we don't have a 'from' keyword, see if we have a string literal such that ASI won't take effect.
                if (token === 131 /* FromKeyword */ || (token === 9 /* StringLiteral */ && !scanner.hasPrecedingLineBreak())) {
                    parseExpected(131 /* FromKeyword */);
                    node.moduleSpecifier = parseModuleSpecifier();
                }
            }
            parseSemicolon();
            return finishNode(node);
        }
        function parseExportAssignment(fullStart, decorators, modifiers) {
            var node = createNode(225 /* ExportAssignment */, fullStart);
            node.decorators = decorators;
            setModifiers(node, modifiers);
            if (parseOptional(55 /* EqualsToken */)) {
                node.isExportEquals = true;
            }
            else {
                parseExpected(75 /* DefaultKeyword */);
            }
            node.expression = parseAssignmentExpressionOrHigher();
            parseSemicolon();
            return finishNode(node);
        }
        function processReferenceComments(sourceFile) {
            var triviaScanner = ts.createScanner(sourceFile.languageVersion, false, 0 /* Standard */, sourceText);
            var referencedFiles = [];
            var amdDependencies = [];
            var amdModuleName;
            // Keep scanning all the leading trivia in the file until we get to something that
            // isn't trivia.  Any single line comment will be analyzed to see if it is a
            // reference comment.
            while (true) {
                var kind = triviaScanner.scan();
                if (kind === 5 /* WhitespaceTrivia */ || kind === 4 /* NewLineTrivia */ || kind === 3 /* MultiLineCommentTrivia */) {
                    continue;
                }
                if (kind !== 2 /* SingleLineCommentTrivia */) {
                    break;
                }
                var range = { pos: triviaScanner.getTokenPos(), end: triviaScanner.getTextPos(), kind: triviaScanner.getToken() };
                var comment = sourceText.substring(range.pos, range.end);
                var referencePathMatchResult = ts.getFileReferenceFromReferencePath(comment, range);
                if (referencePathMatchResult) {
                    var fileReference = referencePathMatchResult.fileReference;
                    sourceFile.hasNoDefaultLib = referencePathMatchResult.isNoDefaultLib;
                    var diagnosticMessage = referencePathMatchResult.diagnosticMessage;
                    if (fileReference) {
                        referencedFiles.push(fileReference);
                    }
                    if (diagnosticMessage) {
                        parseDiagnostics.push(createFileDiagnostic(sourceFile, range.pos, range.end - range.pos, diagnosticMessage));
                    }
                }
                else {
                    var amdModuleNameRegEx = /^\/\/\/\s*<amd-module\s+name\s*=\s*('|")(.+?)\1/gim;
                    var amdModuleNameMatchResult = amdModuleNameRegEx.exec(comment);
                    if (amdModuleNameMatchResult) {
                        if (amdModuleName) {
                            parseDiagnostics.push(createFileDiagnostic(sourceFile, range.pos, range.end - range.pos, ts.Diagnostics.An_AMD_module_cannot_have_multiple_name_assignments));
                        }
                        amdModuleName = amdModuleNameMatchResult[2];
                    }
                    var amdDependencyRegEx = /^\/\/\/\s*<amd-dependency\s/gim;
                    var pathRegex = /\spath\s*=\s*('|")(.+?)\1/gim;
                    var nameRegex = /\sname\s*=\s*('|")(.+?)\1/gim;
                    var amdDependencyMatchResult = amdDependencyRegEx.exec(comment);
                    if (amdDependencyMatchResult) {
                        var pathMatchResult = pathRegex.exec(comment);
                        var nameMatchResult = nameRegex.exec(comment);
                        if (pathMatchResult) {
                            var amdDependency = { path: pathMatchResult[2], name: nameMatchResult ? nameMatchResult[2] : undefined };
                            amdDependencies.push(amdDependency);
                        }
                    }
                }
            }
            sourceFile.referencedFiles = referencedFiles;
            sourceFile.amdDependencies = amdDependencies;
            sourceFile.moduleName = amdModuleName;
        }
        function setExternalModuleIndicator(sourceFile) {
            sourceFile.externalModuleIndicator = forEach(sourceFile.statements, function (node) {
                return node.flags & 1 /* Export */
                    || node.kind === 219 /* ImportEqualsDeclaration */ && node.moduleReference.kind === 230 /* ExternalModuleReference */
                    || node.kind === 220 /* ImportDeclaration */
                    || node.kind === 225 /* ExportAssignment */
                    || node.kind === 226 /* ExportDeclaration */
                    ? node
                    : undefined;
            });
        }
        var JSDocParser;
        (function (JSDocParser) {
            function isJSDocType() {
                switch (token) {
                    case 37 /* AsteriskToken */:
                    case 52 /* QuestionToken */:
                    case 17 /* OpenParenToken */:
                    case 19 /* OpenBracketToken */:
                    case 48 /* ExclamationToken */:
                    case 15 /* OpenBraceToken */:
                    case 85 /* FunctionKeyword */:
                    case 22 /* DotDotDotToken */:
                    case 90 /* NewKeyword */:
                    case 95 /* ThisKeyword */:
                        return true;
                }
                return isIdentifierOrKeyword();
            }
            JSDocParser.isJSDocType = isJSDocType;
            function parseJSDocTypeExpressionForTests(content, start, length) {
                initializeState("file.js", content, 2 /* Latest */, undefined);
                var jsDocTypeExpression = parseJSDocTypeExpression(start, length);
                var diagnostics = parseDiagnostics;
                clearState();
                return jsDocTypeExpression ? { jsDocTypeExpression: jsDocTypeExpression, diagnostics: diagnostics } : undefined;
            }
            JSDocParser.parseJSDocTypeExpressionForTests = parseJSDocTypeExpressionForTests;
            // Parses out a JSDoc type expression.  The starting position should be right at the open
            // curly in the type expression.  Returns 'undefined' if it encounters any errors while parsing.
            /* @internal */
            function parseJSDocTypeExpression(start, length) {
                scanner.setText(sourceText, start, length);
                // Prime the first token for us to start processing.
                token = nextToken();
                var result = createNode(247 /* JSDocTypeExpression */);
                parseExpected(15 /* OpenBraceToken */);
                result.type = parseJSDocTopLevelType();
                parseExpected(16 /* CloseBraceToken */);
                fixupParentReferences(result);
                return finishNode(result);
            }
            JSDocParser.parseJSDocTypeExpression = parseJSDocTypeExpression;
            function parseJSDocTopLevelType() {
                var type = parseJSDocType();
                if (token === 46 /* BarToken */) {
                    var unionType = createNode(251 /* JSDocUnionType */, type.pos);
                    unionType.types = parseJSDocTypeList(type);
                    type = finishNode(unionType);
                }
                if (token === 55 /* EqualsToken */) {
                    var optionalType = createNode(258 /* JSDocOptionalType */, type.pos);
                    nextToken();
                    optionalType.type = type;
                    type = finishNode(optionalType);
                }
                return type;
            }
            function parseJSDocType() {
                var type = parseBasicTypeExpression();
                while (true) {
                    if (token === 19 /* OpenBracketToken */) {
                        var arrayType = createNode(250 /* JSDocArrayType */, type.pos);
                        arrayType.elementType = type;
                        nextToken();
                        parseExpected(20 /* CloseBracketToken */);
                        type = finishNode(arrayType);
                    }
                    else if (token === 52 /* QuestionToken */) {
                        var nullableType = createNode(253 /* JSDocNullableType */, type.pos);
                        nullableType.type = type;
                        nextToken();
                        type = finishNode(nullableType);
                    }
                    else if (token === 48 /* ExclamationToken */) {
                        var nonNullableType = createNode(254 /* JSDocNonNullableType */, type.pos);
                        nonNullableType.type = type;
                        nextToken();
                        type = finishNode(nonNullableType);
                    }
                    else {
                        break;
                    }
                }
                return type;
            }
            function parseBasicTypeExpression() {
                switch (token) {
                    case 37 /* AsteriskToken */:
                        return parseJSDocAllType();
                    case 52 /* QuestionToken */:
                        return parseJSDocUnknownOrNullableType();
                    case 17 /* OpenParenToken */:
                        return parseJSDocUnionType();
                    case 19 /* OpenBracketToken */:
                        return parseJSDocTupleType();
                    case 48 /* ExclamationToken */:
                        return parseJSDocNonNullableType();
                    case 15 /* OpenBraceToken */:
                        return parseJSDocRecordType();
                    case 85 /* FunctionKeyword */:
                        return parseJSDocFunctionType();
                    case 22 /* DotDotDotToken */:
                        return parseJSDocVariadicType();
                    case 90 /* NewKeyword */:
                        return parseJSDocConstructorType();
                    case 95 /* ThisKeyword */:
                        return parseJSDocThisType();
                    case 115 /* AnyKeyword */:
                    case 128 /* StringKeyword */:
                    case 126 /* NumberKeyword */:
                    case 118 /* BooleanKeyword */:
                    case 129 /* SymbolKeyword */:
                    case 101 /* VoidKeyword */:
                        return parseTokenNode();
                }
                return parseJSDocTypeReference();
            }
            function parseJSDocThisType() {
                var result = createNode(262 /* JSDocThisType */);
                nextToken();
                parseExpected(53 /* ColonToken */);
                result.type = parseJSDocType();
                return finishNode(result);
            }
            function parseJSDocConstructorType() {
                var result = createNode(261 /* JSDocConstructorType */);
                nextToken();
                parseExpected(53 /* ColonToken */);
                result.type = parseJSDocType();
                return finishNode(result);
            }
            function parseJSDocVariadicType() {
                var result = createNode(260 /* JSDocVariadicType */);
                nextToken();
                result.type = parseJSDocType();
                return finishNode(result);
            }
            function parseJSDocFunctionType() {
                var result = createNode(259 /* JSDocFunctionType */);
                nextToken();
                parseExpected(17 /* OpenParenToken */);
                result.parameters = parseDelimitedList(22 /* JSDocFunctionParameters */, parseJSDocParameter);
                checkForTrailingComma(result.parameters);
                parseExpected(18 /* CloseParenToken */);
                if (token === 53 /* ColonToken */) {
                    nextToken();
                    result.type = parseJSDocType();
                }
                return finishNode(result);
            }
            function parseJSDocParameter() {
                var parameter = createNode(136 /* Parameter */);
                parameter.type = parseJSDocType();
                return finishNode(parameter);
            }
            function parseJSDocOptionalType(type) {
                var result = createNode(258 /* JSDocOptionalType */, type.pos);
                nextToken();
                result.type = type;
                return finishNode(result);
            }
            function parseJSDocTypeReference() {
                var result = createNode(257 /* JSDocTypeReference */);
                result.name = parseSimplePropertyName();
                while (parseOptional(21 /* DotToken */)) {
                    if (token === 25 /* LessThanToken */) {
                        result.typeArguments = parseTypeArguments();
                        break;
                    }
                    else {
                        result.name = parseQualifiedName(result.name);
                    }
                }
                return finishNode(result);
            }
            function parseTypeArguments() {
                // Move past the <
                nextToken();
                var typeArguments = parseDelimitedList(23 /* JSDocTypeArguments */, parseJSDocType);
                checkForTrailingComma(typeArguments);
                checkForEmptyTypeArgumentList(typeArguments);
                parseExpected(27 /* GreaterThanToken */);
                return typeArguments;
            }
            function checkForEmptyTypeArgumentList(typeArguments) {
                if (parseDiagnostics.length === 0 && typeArguments && typeArguments.length === 0) {
                    var start = typeArguments.pos - "<".length;
                    var end = ts.skipTrivia(sourceText, typeArguments.end) + ">".length;
                    return parseErrorAtPosition(start, end - start, ts.Diagnostics.Type_argument_list_cannot_be_empty);
                }
            }
            function parseQualifiedName(left) {
                var result = createNode(133 /* QualifiedName */, left.pos);
                result.left = left;
                result.right = parseIdentifierName();
                return finishNode(result);
            }
            function parseJSDocRecordType() {
                var result = createNode(255 /* JSDocRecordType */);
                nextToken();
                result.members = parseDelimitedList(24 /* JSDocRecordMembers */, parseJSDocRecordMember);
                checkForTrailingComma(result.members);
                parseExpected(16 /* CloseBraceToken */);
                return finishNode(result);
            }
            function parseJSDocRecordMember() {
                var result = createNode(256 /* JSDocRecordMember */);
                result.name = parseSimplePropertyName();
                if (token === 53 /* ColonToken */) {
                    nextToken();
                    result.type = parseJSDocType();
                }
                return finishNode(result);
            }
            function parseJSDocNonNullableType() {
                var result = createNode(254 /* JSDocNonNullableType */);
                nextToken();
                result.type = parseJSDocType();
                return finishNode(result);
            }
            function parseJSDocTupleType() {
                var result = createNode(252 /* JSDocTupleType */);
                nextToken();
                result.types = parseDelimitedList(25 /* JSDocTupleTypes */, parseJSDocType);
                checkForTrailingComma(result.types);
                parseExpected(20 /* CloseBracketToken */);
                return finishNode(result);
            }
            function checkForTrailingComma(list) {
                if (parseDiagnostics.length === 0 && list.hasTrailingComma) {
                    var start = list.end - ",".length;
                    parseErrorAtPosition(start, ",".length, ts.Diagnostics.Trailing_comma_not_allowed);
                }
            }
            function parseJSDocUnionType() {
                var result = createNode(251 /* JSDocUnionType */);
                nextToken();
                result.types = parseJSDocTypeList(parseJSDocType());
                parseExpected(18 /* CloseParenToken */);
                return finishNode(result);
            }
            function parseJSDocTypeList(firstType) {
                Debug.assert(!!firstType);
                var types = [];
                types.pos = firstType.pos;
                types.push(firstType);
                while (parseOptional(46 /* BarToken */)) {
                    types.push(parseJSDocType());
                }
                types.end = scanner.getStartPos();
                return types;
            }
            function parseJSDocAllType() {
                var result = createNode(248 /* JSDocAllType */);
                nextToken();
                return finishNode(result);
            }
            function parseJSDocUnknownOrNullableType() {
                var pos = scanner.getStartPos();
                // skip the ?
                nextToken();
                // Need to lookahead to decide if this is a nullable or unknown type.
                // Here are cases where we'll pick the unknown type:
                //
                //      Foo(?,
                //      { a: ? }
                //      Foo(?)
                //      Foo<?>
                //      Foo(?=
                //      (?|
                if (token === 24 /* CommaToken */ ||
                    token === 16 /* CloseBraceToken */ ||
                    token === 18 /* CloseParenToken */ ||
                    token === 27 /* GreaterThanToken */ ||
                    token === 55 /* EqualsToken */ ||
                    token === 46 /* BarToken */) {
                    var result = createNode(249 /* JSDocUnknownType */, pos);
                    return finishNode(result);
                }
                else {
                    var result = createNode(253 /* JSDocNullableType */, pos);
                    result.type = parseJSDocType();
                    return finishNode(result);
                }
            }
            function parseIsolatedJSDocComment(content, start, length) {
                initializeState("file.js", content, 2 /* Latest */, undefined);
                var jsDocComment = parseJSDocComment(undefined, start, length);
                var diagnostics = parseDiagnostics;
                clearState();
                return jsDocComment ? { jsDocComment: jsDocComment, diagnostics: diagnostics } : undefined;
            }
            JSDocParser.parseIsolatedJSDocComment = parseIsolatedJSDocComment;
            function parseJSDocComment(parent, start, length) {
                var comment = parseJSDocCommentWorker(start, length);
                if (comment) {
                    fixupParentReferences(comment);
                    comment.parent = parent;
                }
                return comment;
            }
            JSDocParser.parseJSDocComment = parseJSDocComment;
            function parseJSDocCommentWorker(start, length) {
                var content = sourceText;
                start = start || 0;
                var end = length === undefined ? content.length : start + length;
                length = end - start;
                Debug.assert(start >= 0);
                Debug.assert(start <= end);
                Debug.assert(end <= content.length);
                var tags;
                var pos;
                // NOTE(cyrusn): This is essentially a handwritten scanner for JSDocComments. I
                // considered using an actual Scanner, but this would complicate things.  The
                // scanner would need to know it was in a Doc Comment.  Otherwise, it would then
                // produce comments *inside* the doc comment.  In the end it was just easier to
                // write a simple scanner rather than go that route.
                if (length >= "/** */".length) {
                    if (content.charCodeAt(start) === 47 /* slash */ &&
                        content.charCodeAt(start + 1) === 42 /* asterisk */ &&
                        content.charCodeAt(start + 2) === 42 /* asterisk */ &&
                        content.charCodeAt(start + 3) !== 42 /* asterisk */) {
                        // Initially we can parse out a tag.  We also have seen a starting asterisk.
                        // This is so that /** * @type */ doesn't parse.
                        var canParseTag = true;
                        var seenAsterisk = true;
                        for (pos = start + "/**".length; pos < end;) {
                            var ch = content.charCodeAt(pos);
                            pos++;
                            if (ch === 64 /* at */ && canParseTag) {
                                parseTag();
                                // Once we parse out a tag, we cannot keep parsing out tags on this line.
                                canParseTag = false;
                                continue;
                            }
                            if (ts.isLineBreak(ch)) {
                                // After a line break, we can parse a tag, and we haven't seen as asterisk
                                // on the next line yet.
                                canParseTag = true;
                                seenAsterisk = false;
                                continue;
                            }
                            if (ts.isWhiteSpace(ch)) {
                                // Whitespace doesn't affect any of our parsing.
                                continue;
                            }
                            // Ignore the first asterisk on a line.
                            if (ch === 42 /* asterisk */) {
                                if (seenAsterisk) {
                                    // If we've already seen an asterisk, then we can no longer parse a tag
                                    // on this line.
                                    canParseTag = false;
                                }
                                seenAsterisk = true;
                                continue;
                            }
                            // Anything else is doc comment text.  We can't do anything with it.  Because it
                            // wasn't a tag, we can no longer parse a tag on this line until we hit the next
                            // line break.
                            canParseTag = false;
                        }
                    }
                }
                return createJSDocComment();
                function createJSDocComment() {
                    if (!tags) {
                        return undefined;
                    }
                    var result = createNode(263 /* JSDocComment */, start);
                    result.tags = tags;
                    return finishNode(result, end);
                }
                function skipWhitespace() {
                    while (pos < end && ts.isWhiteSpace(content.charCodeAt(pos))) {
                        pos++;
                    }
                }
                function parseTag() {
                    Debug.assert(content.charCodeAt(pos - 1) === 64 /* at */);
                    var atToken = createNode(54 /* AtToken */, pos - 1);
                    atToken.end = pos;
                    var tagName = scanIdentifier();
                    if (!tagName) {
                        return;
                    }
                    var tag = handleTag(atToken, tagName) || handleUnknownTag(atToken, tagName);
                    addTag(tag);
                }
                function handleTag(atToken, tagName) {
                    if (tagName) {
                        switch (tagName.text) {
                            case "param":
                                return handleParamTag(atToken, tagName);
                            case "return":
                            case "returns":
                                return handleReturnTag(atToken, tagName);
                            case "template":
                                return handleTemplateTag(atToken, tagName);
                            case "type":
                                return handleTypeTag(atToken, tagName);
                        }
                    }
                    return undefined;
                }
                function handleUnknownTag(atToken, tagName) {
                    var result = createNode(264 /* JSDocTag */, atToken.pos);
                    result.atToken = atToken;
                    result.tagName = tagName;
                    return finishNode(result, pos);
                }
                function addTag(tag) {
                    if (tag) {
                        if (!tags) {
                            tags = [];
                            tags.pos = tag.pos;
                        }
                        tags.push(tag);
                        tags.end = tag.end;
                    }
                }
                function tryParseTypeExpression() {
                    skipWhitespace();
                    if (content.charCodeAt(pos) !== 123 /* openBrace */) {
                        return undefined;
                    }
                    var typeExpression = parseJSDocTypeExpression(pos, end - pos);
                    pos = typeExpression.end;
                    return typeExpression;
                }
                function handleParamTag(atToken, tagName) {
                    var typeExpression = tryParseTypeExpression();
                    skipWhitespace();
                    var name;
                    var isBracketed;
                    if (content.charCodeAt(pos) === 91 /* openBracket */) {
                        pos++;
                        skipWhitespace();
                        name = scanIdentifier();
                        isBracketed = true;
                    }
                    else {
                        name = scanIdentifier();
                    }
                    if (!name) {
                        parseErrorAtPosition(pos, 0, ts.Diagnostics.Identifier_expected);
                    }
                    var preName, postName;
                    if (typeExpression) {
                        postName = name;
                    }
                    else {
                        preName = name;
                    }
                    if (!typeExpression) {
                        typeExpression = tryParseTypeExpression();
                    }
                    var result = createNode(265 /* JSDocParameterTag */, atToken.pos);
                    result.atToken = atToken;
                    result.tagName = tagName;
                    result.preParameterName = preName;
                    result.typeExpression = typeExpression;
                    result.postParameterName = postName;
                    result.isBracketed = isBracketed;
                    return finishNode(result, pos);
                }
                function handleReturnTag(atToken, tagName) {
                    if (forEach(tags, function (t) { return t.kind === 266 /* JSDocReturnTag */; })) {
                        parseErrorAtPosition(tagName.pos, pos - tagName.pos, ts.Diagnostics._0_tag_already_specified, tagName.text);
                    }
                    var result = createNode(266 /* JSDocReturnTag */, atToken.pos);
                    result.atToken = atToken;
                    result.tagName = tagName;
                    result.typeExpression = tryParseTypeExpression();
                    return finishNode(result, pos);
                }
                function handleTypeTag(atToken, tagName) {
                    if (forEach(tags, function (t) { return t.kind === 267 /* JSDocTypeTag */; })) {
                        parseErrorAtPosition(tagName.pos, pos - tagName.pos, ts.Diagnostics._0_tag_already_specified, tagName.text);
                    }
                    var result = createNode(267 /* JSDocTypeTag */, atToken.pos);
                    result.atToken = atToken;
                    result.tagName = tagName;
                    result.typeExpression = tryParseTypeExpression();
                    return finishNode(result, pos);
                }
                function handleTemplateTag(atToken, tagName) {
                    if (forEach(tags, function (t) { return t.kind === 268 /* JSDocTemplateTag */; })) {
                        parseErrorAtPosition(tagName.pos, pos - tagName.pos, ts.Diagnostics._0_tag_already_specified, tagName.text);
                    }
                    var typeParameters = [];
                    typeParameters.pos = pos;
                    while (true) {
                        skipWhitespace();
                        var startPos = pos;
                        var name_2 = scanIdentifier();
                        if (!name_2) {
                            parseErrorAtPosition(startPos, 0, ts.Diagnostics.Identifier_expected);
                            return undefined;
                        }
                        var typeParameter = createNode(135 /* TypeParameter */, name_2.pos);
                        typeParameter.name = name_2;
                        finishNode(typeParameter, pos);
                        typeParameters.push(typeParameter);
                        skipWhitespace();
                        if (content.charCodeAt(pos) !== 44 /* comma */) {
                            break;
                        }
                        pos++;
                    }
                    typeParameters.end = pos;
                    var result = createNode(268 /* JSDocTemplateTag */, atToken.pos);
                    result.atToken = atToken;
                    result.tagName = tagName;
                    result.typeParameters = typeParameters;
                    return finishNode(result, pos);
                }
                function scanIdentifier() {
                    var startPos = pos;
                    for (; pos < end; pos++) {
                        var ch = content.charCodeAt(pos);
                        if (pos === startPos && ts.isIdentifierStart(ch, 2 /* Latest */)) {
                            continue;
                        }
                        else if (pos > startPos && ts.isIdentifierPart(ch, 2 /* Latest */)) {
                            continue;
                        }
                        break;
                    }
                    if (startPos === pos) {
                        return undefined;
                    }
                    var result = createNode(67 /* Identifier */, startPos);
                    result.text = content.substring(startPos, pos);
                    return finishNode(result, pos);
                }
            }
            JSDocParser.parseJSDocCommentWorker = parseJSDocCommentWorker;
        })(JSDocParser = Parser.JSDocParser || (Parser.JSDocParser = {}));
    })(Parser || (Parser = {}));
    var IncrementalParser;
    (function (IncrementalParser) {
        function updateSourceFile(sourceFile, newText, textChangeRange, aggressiveChecks) {
            aggressiveChecks = aggressiveChecks || Debug.shouldAssert(AssertionLevel.Aggressive);
            checkChangeRange(sourceFile, newText, textChangeRange, aggressiveChecks);
            if (ts.textChangeRangeIsUnchanged(textChangeRange)) {
                // if the text didn't change, then we can just return our current source file as-is.
                return sourceFile;
            }
            if (sourceFile.statements.length === 0) {
                // If we don't have any statements in the current source file, then there's no real
                // way to incrementally parse.  So just do a full parse instead.
                return Parser.parseSourceFile(sourceFile.fileName, newText, sourceFile.languageVersion, undefined, true);
            }
            // Make sure we're not trying to incrementally update a source file more than once.  Once
            // we do an update the original source file is considered unusbale from that point onwards.
            //
            // This is because we do incremental parsing in-place.  i.e. we take nodes from the old
            // tree and give them new positions and parents.  From that point on, trusting the old
            // tree at all is not possible as far too much of it may violate invariants.
            var incrementalSourceFile = sourceFile;
            Debug.assert(!incrementalSourceFile.hasBeenIncrementallyParsed);
            incrementalSourceFile.hasBeenIncrementallyParsed = true;
            var oldText = sourceFile.text;
            var syntaxCursor = createSyntaxCursor(sourceFile);
            // Make the actual change larger so that we know to reparse anything whose lookahead
            // might have intersected the change.
            var changeRange = extendToAffectedRange(sourceFile, textChangeRange);
            checkChangeRange(sourceFile, newText, changeRange, aggressiveChecks);
            // Ensure that extending the affected range only moved the start of the change range
            // earlier in the file.
            Debug.assert(changeRange.span.start <= textChangeRange.span.start);
            Debug.assert(ts.textSpanEnd(changeRange.span) === ts.textSpanEnd(textChangeRange.span));
            Debug.assert(ts.textSpanEnd(ts.textChangeRangeNewSpan(changeRange)) === ts.textSpanEnd(ts.textChangeRangeNewSpan(textChangeRange)));
            // The is the amount the nodes after the edit range need to be adjusted.  It can be
            // positive (if the edit added characters), negative (if the edit deleted characters)
            // or zero (if this was a pure overwrite with nothing added/removed).
            var delta = ts.textChangeRangeNewSpan(changeRange).length - changeRange.span.length;
            // If we added or removed characters during the edit, then we need to go and adjust all
            // the nodes after the edit.  Those nodes may move forward (if we inserted chars) or they
            // may move backward (if we deleted chars).
            //
            // Doing this helps us out in two ways.  First, it means that any nodes/tokens we want
            // to reuse are already at the appropriate position in the new text.  That way when we
            // reuse them, we don't have to figure out if they need to be adjusted.  Second, it makes
            // it very easy to determine if we can reuse a node.  If the node's position is at where
            // we are in the text, then we can reuse it.  Otherwise we can't.  If the node's position
            // is ahead of us, then we'll need to rescan tokens.  If the node's position is behind
            // us, then we'll need to skip it or crumble it as appropriate
            //
            // We will also adjust the positions of nodes that intersect the change range as well.
            // By doing this, we ensure that all the positions in the old tree are consistent, not
            // just the positions of nodes entirely before/after the change range.  By being
            // consistent, we can then easily map from positions to nodes in the old tree easily.
            //
            // Also, mark any syntax elements that intersect the changed span.  We know, up front,
            // that we cannot reuse these elements.
            updateTokenPositionsAndMarkElements(incrementalSourceFile, changeRange.span.start, ts.textSpanEnd(changeRange.span), ts.textSpanEnd(ts.textChangeRangeNewSpan(changeRange)), delta, oldText, newText, aggressiveChecks);
            // Now that we've set up our internal incremental state just proceed and parse the
            // source file in the normal fashion.  When possible the parser will retrieve and
            // reuse nodes from the old tree.
            //
            // Note: passing in 'true' for setNodeParents is very important.  When incrementally
            // parsing, we will be reusing nodes from the old tree, and placing it into new
            // parents.  If we don't set the parents now, we'll end up with an observably
            // inconsistent tree.  Setting the parents on the new tree should be very fast.  We
            // will immediately bail out of walking any subtrees when we can see that their parents
            // are already correct.
            var result = Parser.parseSourceFile(sourceFile.fileName, newText, sourceFile.languageVersion, syntaxCursor, true);
            return result;
        }
        IncrementalParser.updateSourceFile = updateSourceFile;
        function moveElementEntirelyPastChangeRange(element, isArray, delta, oldText, newText, aggressiveChecks) {
            if (isArray) {
                visitArray(element);
            }
            else {
                visitNode(element);
            }
            return;
            function visitNode(node) {
                var text = "";
                if (aggressiveChecks && shouldCheckNode(node)) {
                    text = oldText.substring(node.pos, node.end);
                }
                // Ditch any existing LS children we may have created.  This way we can avoid
                // moving them forward.
                if (node._children) {
                    node._children = undefined;
                }
                if (node.jsDocComment) {
                    node.jsDocComment = undefined;
                }
                node.pos += delta;
                node.end += delta;
                if (aggressiveChecks && shouldCheckNode(node)) {
                    Debug.assert(text === newText.substring(node.pos, node.end));
                }
                forEachChild(node, visitNode, visitArray);
                checkNodePositions(node, aggressiveChecks);
            }
            function visitArray(array) {
                array._children = undefined;
                array.pos += delta;
                array.end += delta;
                for (var _i = 0; _i < array.length; _i++) {
                    var node = array[_i];
                    visitNode(node);
                }
            }
        }
        function shouldCheckNode(node) {
            switch (node.kind) {
                case 9 /* StringLiteral */:
                case 8 /* NumericLiteral */:
                case 67 /* Identifier */:
                    return true;
            }
            return false;
        }
        function adjustIntersectingElement(element, changeStart, changeRangeOldEnd, changeRangeNewEnd, delta) {
            Debug.assert(element.end >= changeStart, "Adjusting an element that was entirely before the change range");
            Debug.assert(element.pos <= changeRangeOldEnd, "Adjusting an element that was entirely after the change range");
            Debug.assert(element.pos <= element.end);
            // We have an element that intersects the change range in some way.  It may have its
            // start, or its end (or both) in the changed range.  We want to adjust any part
            // that intersects such that the final tree is in a consistent state.  i.e. all
            // chlidren have spans within the span of their parent, and all siblings are ordered
            // properly.
            // We may need to update both the 'pos' and the 'end' of the element.
            // If the 'pos' is before the start of the change, then we don't need to touch it.
            // If it isn't, then the 'pos' must be inside the change.  How we update it will
            // depend if delta is  positive or negative.  If delta is positive then we have
            // something like:
            //
            //  -------------------AAA-----------------
            //  -------------------BBBCCCCCCC-----------------
            //
            // In this case, we consider any node that started in the change range to still be
            // starting at the same position.
            //
            // however, if the delta is negative, then we instead have something like this:
            //
            //  -------------------XXXYYYYYYY-----------------
            //  -------------------ZZZ-----------------
            //
            // In this case, any element that started in the 'X' range will keep its position.
            // However any element htat started after that will have their pos adjusted to be
            // at the end of the new range.  i.e. any node that started in the 'Y' range will
            // be adjusted to have their start at the end of the 'Z' range.
            //
            // The element will keep its position if possible.  Or Move backward to the new-end
            // if it's in the 'Y' range.
            element.pos = Math.min(element.pos, changeRangeNewEnd);
            // If the 'end' is after the change range, then we always adjust it by the delta
            // amount.  However, if the end is in the change range, then how we adjust it
            // will depend on if delta is  positive or negative.  If delta is positive then we
            // have something like:
            //
            //  -------------------AAA-----------------
            //  -------------------BBBCCCCCCC-----------------
            //
            // In this case, we consider any node that ended inside the change range to keep its
            // end position.
            //
            // however, if the delta is negative, then we instead have something like this:
            //
            //  -------------------XXXYYYYYYY-----------------
            //  -------------------ZZZ-----------------
            //
            // In this case, any element that ended in the 'X' range will keep its position.
            // However any element htat ended after that will have their pos adjusted to be
            // at the end of the new range.  i.e. any node that ended in the 'Y' range will
            // be adjusted to have their end at the end of the 'Z' range.
            if (element.end >= changeRangeOldEnd) {
                // Element ends after the change range.  Always adjust the end pos.
                element.end += delta;
            }
            else {
                // Element ends in the change range.  The element will keep its position if
                // possible. Or Move backward to the new-end if it's in the 'Y' range.
                element.end = Math.min(element.end, changeRangeNewEnd);
            }
            Debug.assert(element.pos <= element.end);
            if (element.parent) {
                Debug.assert(element.pos >= element.parent.pos);
                Debug.assert(element.end <= element.parent.end);
            }
        }
        function checkNodePositions(node, aggressiveChecks) {
            if (aggressiveChecks) {
                var pos = node.pos;
                forEachChild(node, function (child) {
                    Debug.assert(child.pos >= pos);
                    pos = child.end;
                });
                Debug.assert(pos <= node.end);
            }
        }
        function updateTokenPositionsAndMarkElements(sourceFile, changeStart, changeRangeOldEnd, changeRangeNewEnd, delta, oldText, newText, aggressiveChecks) {
            visitNode(sourceFile);
            return;
            function visitNode(child) {
                Debug.assert(child.pos <= child.end);
                if (child.pos > changeRangeOldEnd) {
                    // Node is entirely past the change range.  We need to move both its pos and
                    // end, forward or backward appropriately.
                    moveElementEntirelyPastChangeRange(child, false, delta, oldText, newText, aggressiveChecks);
                    return;
                }
                // Check if the element intersects the change range.  If it does, then it is not
                // reusable.  Also, we'll need to recurse to see what constituent portions we may
                // be able to use.
                var fullEnd = child.end;
                if (fullEnd >= changeStart) {
                    child.intersectsChange = true;
                    child._children = undefined;
                    // Adjust the pos or end (or both) of the intersecting element accordingly.
                    adjustIntersectingElement(child, changeStart, changeRangeOldEnd, changeRangeNewEnd, delta);
                    forEachChild(child, visitNode, visitArray);
                    checkNodePositions(child, aggressiveChecks);
                    return;
                }
                // Otherwise, the node is entirely before the change range.  No need to do anything with it.
                Debug.assert(fullEnd < changeStart);
            }
            function visitArray(array) {
                Debug.assert(array.pos <= array.end);
                if (array.pos > changeRangeOldEnd) {
                    // Array is entirely after the change range.  We need to move it, and move any of
                    // its children.
                    moveElementEntirelyPastChangeRange(array, true, delta, oldText, newText, aggressiveChecks);
                    return;
                }
                // Check if the element intersects the change range.  If it does, then it is not
                // reusable.  Also, we'll need to recurse to see what constituent portions we may
                // be able to use.
                var fullEnd = array.end;
                if (fullEnd >= changeStart) {
                    array.intersectsChange = true;
                    array._children = undefined;
                    // Adjust the pos or end (or both) of the intersecting array accordingly.
                    adjustIntersectingElement(array, changeStart, changeRangeOldEnd, changeRangeNewEnd, delta);
                    for (var _i = 0; _i < array.length; _i++) {
                        var node = array[_i];
                        visitNode(node);
                    }
                    return;
                }
                // Otherwise, the array is entirely before the change range.  No need to do anything with it.
                Debug.assert(fullEnd < changeStart);
            }
        }
        function extendToAffectedRange(sourceFile, changeRange) {
            // Consider the following code:
            //      void foo() { /; }
            //
            // If the text changes with an insertion of / just before the semicolon then we end up with:
            //      void foo() { //; }
            //
            // If we were to just use the changeRange a is, then we would not rescan the { token
            // (as it does not intersect the actual original change range).  Because an edit may
            // change the token touching it, we actually need to look back *at least* one token so
            // that the prior token sees that change.
            var maxLookahead = 1;
            var start = changeRange.span.start;
            // the first iteration aligns us with the change start. subsequent iteration move us to
            // the left by maxLookahead tokens.  We only need to do this as long as we're not at the
            // start of the tree.
            for (var i = 0; start > 0 && i <= maxLookahead; i++) {
                var nearestNode = findNearestNodeStartingBeforeOrAtPosition(sourceFile, start);
                Debug.assert(nearestNode.pos <= start);
                var position = nearestNode.pos;
                start = Math.max(0, position - 1);
            }
            var finalSpan = ts.createTextSpanFromBounds(start, ts.textSpanEnd(changeRange.span));
            var finalLength = changeRange.newLength + (changeRange.span.start - start);
            return ts.createTextChangeRange(finalSpan, finalLength);
        }
        function findNearestNodeStartingBeforeOrAtPosition(sourceFile, position) {
            var bestResult = sourceFile;
            var lastNodeEntirelyBeforePosition;
            forEachChild(sourceFile, visit);
            if (lastNodeEntirelyBeforePosition) {
                var lastChildOfLastEntireNodeBeforePosition = getLastChild(lastNodeEntirelyBeforePosition);
                if (lastChildOfLastEntireNodeBeforePosition.pos > bestResult.pos) {
                    bestResult = lastChildOfLastEntireNodeBeforePosition;
                }
            }
            return bestResult;
            function getLastChild(node) {
                while (true) {
                    var lastChild = getLastChildWorker(node);
                    if (lastChild) {
                        node = lastChild;
                    }
                    else {
                        return node;
                    }
                }
            }
            function getLastChildWorker(node) {
                var last = undefined;
                forEachChild(node, function (child) {
                    if (ts.nodeIsPresent(child)) {
                        last = child;
                    }
                });
                return last;
            }
            function visit(child) {
                if (ts.nodeIsMissing(child)) {
                    // Missing nodes are effectively invisible to us.  We never even consider them
                    // When trying to find the nearest node before us.
                    return;
                }
                // If the child intersects this position, then this node is currently the nearest
                // node that starts before the position.
                if (child.pos <= position) {
                    if (child.pos >= bestResult.pos) {
                        // This node starts before the position, and is closer to the position than
                        // the previous best node we found.  It is now the new best node.
                        bestResult = child;
                    }
                    // Now, the node may overlap the position, or it may end entirely before the
                    // position.  If it overlaps with the position, then either it, or one of its
                    // children must be the nearest node before the position.  So we can just
                    // recurse into this child to see if we can find something better.
                    if (position < child.end) {
                        // The nearest node is either this child, or one of the children inside
                        // of it.  We've already marked this child as the best so far.  Recurse
                        // in case one of the children is better.
                        forEachChild(child, visit);
                        // Once we look at the children of this node, then there's no need to
                        // continue any further.
                        return true;
                    }
                    else {
                        Debug.assert(child.end <= position);
                        // The child ends entirely before this position.  Say you have the following
                        // (where $ is the position)
                        //
                        //      <complex expr 1> ? <complex expr 2> $ : <...> <...>
                        //
                        // We would want to find the nearest preceding node in "complex expr 2".
                        // To support that, we keep track of this node, and once we're done searching
                        // for a best node, we recurse down this node to see if we can find a good
                        // result in it.
                        //
                        // This approach allows us to quickly skip over nodes that are entirely
                        // before the position, while still allowing us to find any nodes in the
                        // last one that might be what we want.
                        lastNodeEntirelyBeforePosition = child;
                    }
                }
                else {
                    Debug.assert(child.pos > position);
                    // We're now at a node that is entirely past the position we're searching for.
                    // This node (and all following nodes) could never contribute to the result,
                    // so just skip them by returning 'true' here.
                    return true;
                }
            }
        }
        function checkChangeRange(sourceFile, newText, textChangeRange, aggressiveChecks) {
            var oldText = sourceFile.text;
            if (textChangeRange) {
                Debug.assert((oldText.length - textChangeRange.span.length + textChangeRange.newLength) === newText.length);
                if (aggressiveChecks || Debug.shouldAssert(AssertionLevel.VeryAggressive)) {
                    var oldTextPrefix = oldText.substr(0, textChangeRange.span.start);
                    var newTextPrefix = newText.substr(0, textChangeRange.span.start);
                    Debug.assert(oldTextPrefix === newTextPrefix);
                    var oldTextSuffix = oldText.substring(ts.textSpanEnd(textChangeRange.span), oldText.length);
                    var newTextSuffix = newText.substring(ts.textSpanEnd(ts.textChangeRangeNewSpan(textChangeRange)), newText.length);
                    Debug.assert(oldTextSuffix === newTextSuffix);
                }
            }
        }
        function createSyntaxCursor(sourceFile) {
            var currentArray = sourceFile.statements;
            var currentArrayIndex = 0;
            Debug.assert(currentArrayIndex < currentArray.length);
            var current = currentArray[currentArrayIndex];
            var lastQueriedPosition = -1 /* Value */;
            return {
                currentNode: function (position) {
                    // Only compute the current node if the position is different than the last time
                    // we were asked.  The parser commonly asks for the node at the same position
                    // twice.  Once to know if can read an appropriate list element at a certain point,
                    // and then to actually read and consume the node.
                    if (position !== lastQueriedPosition) {
                        // Much of the time the parser will need the very next node in the array that
                        // we just returned a node from.So just simply check for that case and move
                        // forward in the array instead of searching for the node again.
                        if (current && current.end === position && currentArrayIndex < (currentArray.length - 1)) {
                            currentArrayIndex++;
                            current = currentArray[currentArrayIndex];
                        }
                        // If we don't have a node, or the node we have isn't in the right position,
                        // then try to find a viable node at the position requested.
                        if (!current || current.pos !== position) {
                            findHighestListElementThatStartsAtPosition(position);
                        }
                    }
                    // Cache this query so that we don't do any extra work if the parser calls back
                    // into us.  Note: this is very common as the parser will make pairs of calls like
                    // 'isListElement -> parseListElement'.  If we were unable to find a node when
                    // called with 'isListElement', we don't want to redo the work when parseListElement
                    // is called immediately after.
                    lastQueriedPosition = position;
                    // Either we don'd have a node, or we have a node at the position being asked for.
                    Debug.assert(!current || current.pos === position);
                    return current;
                }
            };
            // Finds the highest element in the tree we can find that starts at the provided position.
            // The element must be a direct child of some node list in the tree.  This way after we
            // return it, we can easily return its next sibling in the list.
            function findHighestListElementThatStartsAtPosition(position) {
                // Clear out any cached state about the last node we found.
                currentArray = undefined;
                currentArrayIndex = -1 /* Value */;
                current = undefined;
                // Recurse into the source file to find the highest node at this position.
                forEachChild(sourceFile, visitNode, visitArray);
                return;
                function visitNode(node) {
                    if (position >= node.pos && position < node.end) {
                        // Position was within this node.  Keep searching deeper to find the node.
                        forEachChild(node, visitNode, visitArray);
                        // don't procede any futher in the search.
                        return true;
                    }
                    // position wasn't in this node, have to keep searching.
                    return false;
                }
                function visitArray(array) {
                    if (position >= array.pos && position < array.end) {
                        // position was in this array.  Search through this array to see if we find a
                        // viable element.
                        for (var i = 0, n = array.length; i < n; i++) {
                            var child = array[i];
                            if (child) {
                                if (child.pos === position) {
                                    // Found the right node.  We're done.
                                    currentArray = array;
                                    currentArrayIndex = i;
                                    current = child;
                                    return true;
                                }
                                else {
                                    if (child.pos < position && position < child.end) {
                                        // Position in somewhere within this child.  Search in it and
                                        // stop searching in this array.
                                        forEachChild(child, visitNode, visitArray);
                                        return true;
                                    }
                                }
                            }
                        }
                    }
                    // position wasn't in this array, have to keep searching.
                    return false;
                }
            }
        }
    })(IncrementalParser || (IncrementalParser = {}));
})(ts || (ts = {}));