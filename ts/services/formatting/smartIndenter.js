///<reference path='..\services.ts' />
/* @internal */
var ts;
(function (ts) {
    var formatting;
    (function (formatting) {
        var SmartIndenter;
        (function (SmartIndenter) {
            function getIndentation(position, sourceFile, options) {
                if (position > sourceFile.text.length) {
                    return 0; // past EOF
                }
                var precedingToken = ts.findPrecedingToken(position, sourceFile);
                if (!precedingToken) {
                    return 0;
                }
                // no indentation in string \regex\template literals
                var precedingTokenIsLiteral = precedingToken.kind === 9 /* StringLiteral */ ||
                    precedingToken.kind === 10 /* RegularExpressionLiteral */ ||
                    precedingToken.kind === 11 /* NoSubstitutionTemplateLiteral */ ||
                    precedingToken.kind === 12 /* TemplateHead */ ||
                    precedingToken.kind === 13 /* TemplateMiddle */ ||
                    precedingToken.kind === 14 /* TemplateTail */;
                if (precedingTokenIsLiteral && precedingToken.getStart(sourceFile) <= position && precedingToken.end > position) {
                    return 0;
                }
                var lineAtPosition = sourceFile.getLineAndCharacterOfPosition(position).line;
                if (precedingToken.kind === 24 /* CommaToken */ && precedingToken.parent.kind !== 179 /* BinaryExpression */) {
                    // previous token is comma that separates items in list - find the previous item and try to derive indentation from it
                    var actualIndentation = getActualIndentationForListItemBeforeComma(precedingToken, sourceFile, options);
                    if (actualIndentation !== -1 /* Unknown */) {
                        return actualIndentation;
                    }
                }
                // try to find node that can contribute to indentation and includes 'position' starting from 'precedingToken'
                // if such node is found - compute initial indentation for 'position' inside this node
                var previous;
                var current = precedingToken;
                var currentStart;
                var indentationDelta;
                while (current) {
                    if (ts.positionBelongsToNode(current, position, sourceFile) && shouldIndentChildNode(current.kind, previous ? previous.kind : 0 /* Unknown */)) {
                        currentStart = getStartLineAndCharacterForNode(current, sourceFile);
                        if (nextTokenIsCurlyBraceOnSameLineAsCursor(precedingToken, current, lineAtPosition, sourceFile)) {
                            indentationDelta = 0;
                        }
                        else {
                            indentationDelta = lineAtPosition !== currentStart.line ? options.IndentSize : 0;
                        }
                        break;
                    }
                    // check if current node is a list item - if yes, take indentation from it
                    var actualIndentation = getActualIndentationForListItem(current, sourceFile, options);
                    if (actualIndentation !== -1 /* Unknown */) {
                        return actualIndentation;
                    }
                    actualIndentation = getLineIndentationWhenExpressionIsInMultiLine(current, sourceFile, options);
                    if (actualIndentation !== -1 /* Unknown */) {
                        return actualIndentation + options.IndentSize;
                    }
                    previous = current;
                    current = current.parent;
                }
                if (!current) {
                    // no parent was found - return 0 to be indented on the level of SourceFile
                    return 0;
                }
                return getIndentationForNodeWorker(current, currentStart, undefined, indentationDelta, sourceFile, options);
            }
            SmartIndenter.getIndentation = getIndentation;
            function getIndentationForNode(n, ignoreActualIndentationRange, sourceFile, options) {
                var start = sourceFile.getLineAndCharacterOfPosition(n.getStart(sourceFile));
                return getIndentationForNodeWorker(n, start, ignoreActualIndentationRange, 0, sourceFile, options);
            }
            SmartIndenter.getIndentationForNode = getIndentationForNode;
            function getIndentationForNodeWorker(current, currentStart, ignoreActualIndentationRange, indentationDelta, sourceFile, options) {
                var parent = current.parent;
                var parentStart;
                // walk upwards and collect indentations for pairs of parent-child nodes
                // indentation is not added if parent and child nodes start on the same line or if parent is IfStatement and child starts on the same line with 'else clause'
                while (parent) {
                    var useActualIndentation = true;
                    if (ignoreActualIndentationRange) {
                        var start = current.getStart(sourceFile);
                        useActualIndentation = start < ignoreActualIndentationRange.pos || start > ignoreActualIndentationRange.end;
                    }
                    if (useActualIndentation) {
                        // check if current node is a list item - if yes, take indentation from it
                        var actualIndentation = getActualIndentationForListItem(current, sourceFile, options);
                        if (actualIndentation !== -1 /* Unknown */) {
                            return actualIndentation + indentationDelta;
                        }
                    }
                    parentStart = getParentStart(parent, current, sourceFile);
                    var parentAndChildShareLine = parentStart.line === currentStart.line ||
                        childStartsOnTheSameLineWithElseInIfStatement(parent, current, currentStart.line, sourceFile);
                    if (useActualIndentation) {
                        // try to fetch actual indentation for current node from source text
                        var actualIndentation = getActualIndentationForNode(current, parent, currentStart, parentAndChildShareLine, sourceFile, options);
                        if (actualIndentation !== -1 /* Unknown */) {
                            return actualIndentation + indentationDelta;
                        }
                        actualIndentation = getLineIndentationWhenExpressionIsInMultiLine(current, sourceFile, options);
                        if (actualIndentation !== -1 /* Unknown */) {
                            return actualIndentation + indentationDelta;
                        }
                    }
                    // increase indentation if parent node wants its content to be indented and parent and child nodes don't start on the same line
                    if (shouldIndentChildNode(parent.kind, current.kind) && !parentAndChildShareLine) {
                        indentationDelta += options.IndentSize;
                    }
                    current = parent;
                    currentStart = parentStart;
                    parent = current.parent;
                }
                return indentationDelta;
            }
            function getParentStart(parent, child, sourceFile) {
                var containingList = getContainingList(child, sourceFile);
                if (containingList) {
                    return sourceFile.getLineAndCharacterOfPosition(containingList.pos);
                }
                return sourceFile.getLineAndCharacterOfPosition(parent.getStart(sourceFile));
            }
            /*
             * Function returns Value.Unknown if indentation cannot be determined
             */
            function getActualIndentationForListItemBeforeComma(commaToken, sourceFile, options) {
                // previous token is comma that separates items in list - find the previous item and try to derive indentation from it
                var commaItemInfo = ts.findListItemInfo(commaToken);
                if (commaItemInfo && commaItemInfo.listItemIndex > 0) {
                    return deriveActualIndentationFromList(commaItemInfo.list.getChildren(), commaItemInfo.listItemIndex - 1, sourceFile, options);
                }
                else {
                    // handle broken code gracefully
                    return -1 /* Unknown */;
                }
            }
            /*
             * Function returns Value.Unknown if actual indentation for node should not be used (i.e because node is nested expression)
             */
            function getActualIndentationForNode(current, parent, currentLineAndChar, parentAndChildShareLine, sourceFile, options) {
                // actual indentation is used for statements\declarations if one of cases below is true:
                // - parent is SourceFile - by default immediate children of SourceFile are not indented except when user indents them manually
                // - parent and child are not on the same line
                var useActualIndentation = (ts.isDeclaration(current) || ts.isStatement(current)) &&
                    (parent.kind === 246 /* SourceFile */ || !parentAndChildShareLine);
                if (!useActualIndentation) {
                    return -1 /* Unknown */;
                }
                return findColumnForFirstNonWhitespaceCharacterInLine(currentLineAndChar, sourceFile, options);
            }
            function nextTokenIsCurlyBraceOnSameLineAsCursor(precedingToken, current, lineAtPosition, sourceFile) {
                var nextToken = ts.findNextToken(precedingToken, current);
                if (!nextToken) {
                    return false;
                }
                if (nextToken.kind === 15 /* OpenBraceToken */) {
                    // open braces are always indented at the parent level
                    return true;
                }
                else if (nextToken.kind === 16 /* CloseBraceToken */) {
                    // close braces are indented at the parent level if they are located on the same line with cursor
                    // this means that if new line will be added at $ position, this case will be indented
                    // class A {
                    //    $
                    // }
                    /// and this one - not
                    // class A {
                    // $}
                    var nextTokenStartLine = getStartLineAndCharacterForNode(nextToken, sourceFile).line;
                    return lineAtPosition === nextTokenStartLine;
                }
                return false;
            }
            function getStartLineAndCharacterForNode(n, sourceFile) {
                return sourceFile.getLineAndCharacterOfPosition(n.getStart(sourceFile));
            }
            function childStartsOnTheSameLineWithElseInIfStatement(parent, child, childStartLine, sourceFile) {
                if (parent.kind === 194 /* IfStatement */ && parent.elseStatement === child) {
                    var elseKeyword = ts.findChildOfKind(parent, 78 /* ElseKeyword */, sourceFile);
                    Debug.assert(elseKeyword !== undefined);
                    var elseKeywordStartLine = getStartLineAndCharacterForNode(elseKeyword, sourceFile).line;
                    return elseKeywordStartLine === childStartLine;
                }
                return false;
            }
            SmartIndenter.childStartsOnTheSameLineWithElseInIfStatement = childStartsOnTheSameLineWithElseInIfStatement;
            function getContainingList(node, sourceFile) {
                if (node.parent) {
                    switch (node.parent.kind) {
                        case 149 /* TypeReference */:
                            if (node.parent.typeArguments &&
                                ts.rangeContainsStartEnd(node.parent.typeArguments, node.getStart(sourceFile), node.getEnd())) {
                                return node.parent.typeArguments;
                            }
                            break;
                        case 163 /* ObjectLiteralExpression */:
                            return node.parent.properties;
                        case 162 /* ArrayLiteralExpression */:
                            return node.parent.elements;
                        case 211 /* FunctionDeclaration */:
                        case 171 /* FunctionExpression */:
                        case 172 /* ArrowFunction */:
                        case 141 /* MethodDeclaration */:
                        case 140 /* MethodSignature */:
                        case 145 /* CallSignature */:
                        case 146 /* ConstructSignature */: {
                            var start = node.getStart(sourceFile);
                            if (node.parent.typeParameters &&
                                ts.rangeContainsStartEnd(node.parent.typeParameters, start, node.getEnd())) {
                                return node.parent.typeParameters;
                            }
                            if (ts.rangeContainsStartEnd(node.parent.parameters, start, node.getEnd())) {
                                return node.parent.parameters;
                            }
                            break;
                        }
                        case 167 /* NewExpression */:
                        case 166 /* CallExpression */: {
                            var start = node.getStart(sourceFile);
                            if (node.parent.typeArguments &&
                                ts.rangeContainsStartEnd(node.parent.typeArguments, start, node.getEnd())) {
                                return node.parent.typeArguments;
                            }
                            if (node.parent.arguments &&
                                ts.rangeContainsStartEnd(node.parent.arguments, start, node.getEnd())) {
                                return node.parent.arguments;
                            }
                            break;
                        }
                    }
                }
                return undefined;
            }
            function getActualIndentationForListItem(node, sourceFile, options) {
                var containingList = getContainingList(node, sourceFile);
                return containingList ? getActualIndentationFromList(containingList) : -1 /* Unknown */;
                function getActualIndentationFromList(list) {
                    var index = indexOf(list, node);
                    return index !== -1 ? deriveActualIndentationFromList(list, index, sourceFile, options) : -1 /* Unknown */;
                }
            }
            function getLineIndentationWhenExpressionIsInMultiLine(node, sourceFile, options) {
                // actual indentation should not be used when:
                // - node is close parenthesis - this is the end of the expression
                if (node.kind === 18 /* CloseParenToken */) {
                    return -1 /* Unknown */;
                }
                if (node.parent && (node.parent.kind === 166 /* CallExpression */ ||
                    node.parent.kind === 167 /* NewExpression */) &&
                    node.parent.expression !== node) {
                    var fullCallOrNewExpression = node.parent.expression;
                    var startingExpression = getStartingExpression(fullCallOrNewExpression);
                    if (fullCallOrNewExpression === startingExpression) {
                        return -1 /* Unknown */;
                    }
                    var fullCallOrNewExpressionEnd = sourceFile.getLineAndCharacterOfPosition(fullCallOrNewExpression.end);
                    var startingExpressionEnd = sourceFile.getLineAndCharacterOfPosition(startingExpression.end);
                    if (fullCallOrNewExpressionEnd.line === startingExpressionEnd.line) {
                        return -1 /* Unknown */;
                    }
                    return findColumnForFirstNonWhitespaceCharacterInLine(fullCallOrNewExpressionEnd, sourceFile, options);
                }
                return -1 /* Unknown */;
                function getStartingExpression(node) {
                    while (true) {
                        switch (node.kind) {
                            case 166 /* CallExpression */:
                            case 167 /* NewExpression */:
                            case 164 /* PropertyAccessExpression */:
                            case 165 /* ElementAccessExpression */:
                                node = node.expression;
                                break;
                            default:
                                return node;
                        }
                    }
                    return node;
                }
            }
            function deriveActualIndentationFromList(list, index, sourceFile, options) {
                Debug.assert(index >= 0 && index < list.length);
                var node = list[index];
                // walk toward the start of the list starting from current node and check if the line is the same for all items.
                // if end line for item [i - 1] differs from the start line for item [i] - find column of the first non-whitespace character on the line of item [i]
                var lineAndCharacter = getStartLineAndCharacterForNode(node, sourceFile);
                for (var i = index - 1; i >= 0; --i) {
                    if (list[i].kind === 24 /* CommaToken */) {
                        continue;
                    }
                    // skip list items that ends on the same line with the current list element
                    var prevEndLine = sourceFile.getLineAndCharacterOfPosition(list[i].end).line;
                    if (prevEndLine !== lineAndCharacter.line) {
                        return findColumnForFirstNonWhitespaceCharacterInLine(lineAndCharacter, sourceFile, options);
                    }
                    lineAndCharacter = getStartLineAndCharacterForNode(list[i], sourceFile);
                }
                return -1 /* Unknown */;
            }
            function findColumnForFirstNonWhitespaceCharacterInLine(lineAndCharacter, sourceFile, options) {
                var lineStart = sourceFile.getPositionOfLineAndCharacter(lineAndCharacter.line, 0);
                return findFirstNonWhitespaceColumn(lineStart, lineStart + lineAndCharacter.character, sourceFile, options);
            }
            /*
                Character is the actual index of the character since the beginning of the line.
                Column - position of the character after expanding tabs to spaces
                "0\t2$"
                value of 'character' for '$' is 3
                value of 'column' for '$' is 6 (assuming that tab size is 4)
            */
            function findFirstNonWhitespaceCharacterAndColumn(startPos, endPos, sourceFile, options) {
                var character = 0;
                var column = 0;
                for (var pos = startPos; pos < endPos; ++pos) {
                    var ch = sourceFile.text.charCodeAt(pos);
                    if (!ts.isWhiteSpace(ch)) {
                        break;
                    }
                    if (ch === 9 /* tab */) {
                        column += options.TabSize + (column % options.TabSize);
                    }
                    else {
                        column++;
                    }
                    character++;
                }
                return { column: column, character: character };
            }
            SmartIndenter.findFirstNonWhitespaceCharacterAndColumn = findFirstNonWhitespaceCharacterAndColumn;
            function findFirstNonWhitespaceColumn(startPos, endPos, sourceFile, options) {
                return findFirstNonWhitespaceCharacterAndColumn(startPos, endPos, sourceFile, options).column;
            }
            SmartIndenter.findFirstNonWhitespaceColumn = findFirstNonWhitespaceColumn;
            function nodeContentIsAlwaysIndented(kind) {
                switch (kind) {
                    case 212 /* ClassDeclaration */:
                    case 184 /* ClassExpression */:
                    case 213 /* InterfaceDeclaration */:
                    case 215 /* EnumDeclaration */:
                    case 214 /* TypeAliasDeclaration */:
                    case 162 /* ArrayLiteralExpression */:
                    case 190 /* Block */:
                    case 217 /* ModuleBlock */:
                    case 163 /* ObjectLiteralExpression */:
                    case 153 /* TypeLiteral */:
                    case 155 /* TupleType */:
                    case 218 /* CaseBlock */:
                    case 240 /* DefaultClause */:
                    case 239 /* CaseClause */:
                    case 170 /* ParenthesizedExpression */:
                    case 164 /* PropertyAccessExpression */:
                    case 166 /* CallExpression */:
                    case 167 /* NewExpression */:
                    case 191 /* VariableStatement */:
                    case 209 /* VariableDeclaration */:
                    case 225 /* ExportAssignment */:
                    case 202 /* ReturnStatement */:
                    case 180 /* ConditionalExpression */:
                    case 160 /* ArrayBindingPattern */:
                    case 159 /* ObjectBindingPattern */:
                    case 231 /* JsxElement */:
                    case 232 /* JsxSelfClosingElement */:
                    case 140 /* MethodSignature */:
                    case 145 /* CallSignature */:
                    case 146 /* ConstructSignature */:
                    case 136 /* Parameter */:
                    case 150 /* FunctionType */:
                    case 151 /* ConstructorType */:
                    case 158 /* ParenthesizedType */:
                    case 168 /* TaggedTemplateExpression */:
                    case 176 /* AwaitExpression */:
                        return true;
                }
                return false;
            }
            function shouldIndentChildNode(parent, child) {
                if (nodeContentIsAlwaysIndented(parent)) {
                    return true;
                }
                switch (parent) {
                    case 195 /* DoStatement */:
                    case 196 /* WhileStatement */:
                    case 198 /* ForInStatement */:
                    case 199 /* ForOfStatement */:
                    case 197 /* ForStatement */:
                    case 194 /* IfStatement */:
                    case 211 /* FunctionDeclaration */:
                    case 171 /* FunctionExpression */:
                    case 141 /* MethodDeclaration */:
                    case 172 /* ArrowFunction */:
                    case 142 /* Constructor */:
                    case 143 /* GetAccessor */:
                    case 144 /* SetAccessor */:
                        return child !== 190 /* Block */;
                    default:
                        return false;
                }
            }
            SmartIndenter.shouldIndentChildNode = shouldIndentChildNode;
        })(SmartIndenter = formatting.SmartIndenter || (formatting.SmartIndenter = {}));
    })(formatting = ts.formatting || (ts.formatting = {}));
})(ts || (ts = {}));
