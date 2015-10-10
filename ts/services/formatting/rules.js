///<reference path='references.ts' />
/* @internal */
var ts;
(function (ts) {
    var formatting;
    (function (formatting) {
        var Rules = (function () {
            function Rules() {
                ///
                /// Common Rules
                ///
                // Leave comments alone
                this.IgnoreBeforeComment = new formatting.Rule(formatting.RuleDescriptor.create4(formatting.Shared.TokenRange.Any, formatting.Shared.TokenRange.Comments), formatting.RuleOperation.create1(1 /* Ignore */));
                this.IgnoreAfterLineComment = new formatting.Rule(formatting.RuleDescriptor.create3(2 /* SingleLineCommentTrivia */, formatting.Shared.TokenRange.Any), formatting.RuleOperation.create1(1 /* Ignore */));
                // Space after keyword but not before ; or : or ?
                this.NoSpaceBeforeSemicolon = new formatting.Rule(formatting.RuleDescriptor.create2(formatting.Shared.TokenRange.Any, 23 /* SemicolonToken */), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext), 8 /* Delete */));
                this.NoSpaceBeforeColon = new formatting.Rule(formatting.RuleDescriptor.create2(formatting.Shared.TokenRange.Any, 53 /* ColonToken */), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsNotBinaryOpContext), 8 /* Delete */));
                this.NoSpaceBeforeQuestionMark = new formatting.Rule(formatting.RuleDescriptor.create2(formatting.Shared.TokenRange.Any, 52 /* QuestionToken */), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsNotBinaryOpContext), 8 /* Delete */));
                this.SpaceAfterColon = new formatting.Rule(formatting.RuleDescriptor.create3(53 /* ColonToken */, formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsNotBinaryOpContext), 2 /* Space */));
                this.SpaceAfterQuestionMarkInConditionalOperator = new formatting.Rule(formatting.RuleDescriptor.create3(52 /* QuestionToken */, formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsConditionalOperatorContext), 2 /* Space */));
                this.NoSpaceAfterQuestionMark = new formatting.Rule(formatting.RuleDescriptor.create3(52 /* QuestionToken */, formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext), 8 /* Delete */));
                this.SpaceAfterSemicolon = new formatting.Rule(formatting.RuleDescriptor.create3(23 /* SemicolonToken */, formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext), 2 /* Space */));
                // Space after }.
                this.SpaceAfterCloseBrace = new formatting.Rule(formatting.RuleDescriptor.create3(16 /* CloseBraceToken */, formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsAfterCodeBlockContext), 2 /* Space */));
                // Special case for (}, else) and (}, while) since else & while tokens are not part of the tree which makes SpaceAfterCloseBrace rule not applied
                this.SpaceBetweenCloseBraceAndElse = new formatting.Rule(formatting.RuleDescriptor.create1(16 /* CloseBraceToken */, 78 /* ElseKeyword */), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext), 2 /* Space */));
                this.SpaceBetweenCloseBraceAndWhile = new formatting.Rule(formatting.RuleDescriptor.create1(16 /* CloseBraceToken */, 102 /* WhileKeyword */), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext), 2 /* Space */));
                this.NoSpaceAfterCloseBrace = new formatting.Rule(formatting.RuleDescriptor.create3(16 /* CloseBraceToken */, formatting.Shared.TokenRange.FromTokens([18 /* CloseParenToken */, 20 /* CloseBracketToken */, 24 /* CommaToken */, 23 /* SemicolonToken */])), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext), 8 /* Delete */));
                // No space for dot
                this.NoSpaceBeforeDot = new formatting.Rule(formatting.RuleDescriptor.create2(formatting.Shared.TokenRange.Any, 21 /* DotToken */), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext), 8 /* Delete */));
                this.NoSpaceAfterDot = new formatting.Rule(formatting.RuleDescriptor.create3(21 /* DotToken */, formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext), 8 /* Delete */));
                // No space before and after indexer
                this.NoSpaceBeforeOpenBracket = new formatting.Rule(formatting.RuleDescriptor.create2(formatting.Shared.TokenRange.Any, 19 /* OpenBracketToken */), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext), 8 /* Delete */));
                this.NoSpaceAfterCloseBracket = new formatting.Rule(formatting.RuleDescriptor.create3(20 /* CloseBracketToken */, formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsNotBeforeBlockInFunctionDeclarationContext), 8 /* Delete */));
                // Place a space before open brace in a function declaration
                this.FunctionOpenBraceLeftTokenRange = formatting.Shared.TokenRange.AnyIncludingMultilineComments;
                this.SpaceBeforeOpenBraceInFunction = new formatting.Rule(formatting.RuleDescriptor.create2(this.FunctionOpenBraceLeftTokenRange, 15 /* OpenBraceToken */), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsFunctionDeclContext, Rules.IsBeforeBlockContext, Rules.IsNotFormatOnEnter, Rules.IsSameLineTokenOrBeforeMultilineBlockContext), 2 /* Space */), 1 /* CanDeleteNewLines */);
                // Place a space before open brace in a TypeScript declaration that has braces as children (class, module, enum, etc)
                this.TypeScriptOpenBraceLeftTokenRange = formatting.Shared.TokenRange.FromTokens([67 /* Identifier */, 3 /* MultiLineCommentTrivia */, 71 /* ClassKeyword */]);
                this.SpaceBeforeOpenBraceInTypeScriptDeclWithBlock = new formatting.Rule(formatting.RuleDescriptor.create2(this.TypeScriptOpenBraceLeftTokenRange, 15 /* OpenBraceToken */), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsTypeScriptDeclWithBlockContext, Rules.IsNotFormatOnEnter, Rules.IsSameLineTokenOrBeforeMultilineBlockContext), 2 /* Space */), 1 /* CanDeleteNewLines */);
                // Place a space before open brace in a control flow construct
                this.ControlOpenBraceLeftTokenRange = formatting.Shared.TokenRange.FromTokens([18 /* CloseParenToken */, 3 /* MultiLineCommentTrivia */, 77 /* DoKeyword */, 98 /* TryKeyword */, 83 /* FinallyKeyword */, 78 /* ElseKeyword */]);
                this.SpaceBeforeOpenBraceInControl = new formatting.Rule(formatting.RuleDescriptor.create2(this.ControlOpenBraceLeftTokenRange, 15 /* OpenBraceToken */), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsControlDeclContext, Rules.IsNotFormatOnEnter, Rules.IsSameLineTokenOrBeforeMultilineBlockContext), 2 /* Space */), 1 /* CanDeleteNewLines */);
                // Insert a space after { and before } in single-line contexts, but remove space from empty object literals {}.
                this.SpaceAfterOpenBrace = new formatting.Rule(formatting.RuleDescriptor.create3(15 /* OpenBraceToken */, formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSingleLineBlockContext), 2 /* Space */));
                this.SpaceBeforeCloseBrace = new formatting.Rule(formatting.RuleDescriptor.create2(formatting.Shared.TokenRange.Any, 16 /* CloseBraceToken */), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSingleLineBlockContext), 2 /* Space */));
                this.NoSpaceBetweenEmptyBraceBrackets = new formatting.Rule(formatting.RuleDescriptor.create1(15 /* OpenBraceToken */, 16 /* CloseBraceToken */), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsObjectContext), 8 /* Delete */));
                // Insert new line after { and before } in multi-line contexts.
                this.NewLineAfterOpenBraceInBlockContext = new formatting.Rule(formatting.RuleDescriptor.create3(15 /* OpenBraceToken */, formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsMultilineBlockContext), 4 /* NewLine */));
                // For functions and control block place } on a new line    [multi-line rule]
                this.NewLineBeforeCloseBraceInBlockContext = new formatting.Rule(formatting.RuleDescriptor.create2(formatting.Shared.TokenRange.AnyIncludingMultilineComments, 16 /* CloseBraceToken */), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsMultilineBlockContext), 4 /* NewLine */));
                // Special handling of unary operators.
                // Prefix operators generally shouldn't have a space between
                // them and their target unary expression.
                this.NoSpaceAfterUnaryPrefixOperator = new formatting.Rule(formatting.RuleDescriptor.create4(formatting.Shared.TokenRange.UnaryPrefixOperators, formatting.Shared.TokenRange.UnaryPrefixExpressions), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsNotBinaryOpContext), 8 /* Delete */));
                this.NoSpaceAfterUnaryPreincrementOperator = new formatting.Rule(formatting.RuleDescriptor.create3(40 /* PlusPlusToken */, formatting.Shared.TokenRange.UnaryPreincrementExpressions), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext), 8 /* Delete */));
                this.NoSpaceAfterUnaryPredecrementOperator = new formatting.Rule(formatting.RuleDescriptor.create3(41 /* MinusMinusToken */, formatting.Shared.TokenRange.UnaryPredecrementExpressions), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext), 8 /* Delete */));
                this.NoSpaceBeforeUnaryPostincrementOperator = new formatting.Rule(formatting.RuleDescriptor.create2(formatting.Shared.TokenRange.UnaryPostincrementExpressions, 40 /* PlusPlusToken */), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext), 8 /* Delete */));
                this.NoSpaceBeforeUnaryPostdecrementOperator = new formatting.Rule(formatting.RuleDescriptor.create2(formatting.Shared.TokenRange.UnaryPostdecrementExpressions, 41 /* MinusMinusToken */), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext), 8 /* Delete */));
                // More unary operator special-casing.
                // DevDiv 181814:  Be careful when removing leading whitespace
                // around unary operators.  Examples:
                //      1 - -2  --X-->  1--2
                //      a + ++b --X-->  a+++b
                this.SpaceAfterPostincrementWhenFollowedByAdd = new formatting.Rule(formatting.RuleDescriptor.create1(40 /* PlusPlusToken */, 35 /* PlusToken */), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsBinaryOpContext), 2 /* Space */));
                this.SpaceAfterAddWhenFollowedByUnaryPlus = new formatting.Rule(formatting.RuleDescriptor.create1(35 /* PlusToken */, 35 /* PlusToken */), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsBinaryOpContext), 2 /* Space */));
                this.SpaceAfterAddWhenFollowedByPreincrement = new formatting.Rule(formatting.RuleDescriptor.create1(35 /* PlusToken */, 40 /* PlusPlusToken */), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsBinaryOpContext), 2 /* Space */));
                this.SpaceAfterPostdecrementWhenFollowedBySubtract = new formatting.Rule(formatting.RuleDescriptor.create1(41 /* MinusMinusToken */, 36 /* MinusToken */), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsBinaryOpContext), 2 /* Space */));
                this.SpaceAfterSubtractWhenFollowedByUnaryMinus = new formatting.Rule(formatting.RuleDescriptor.create1(36 /* MinusToken */, 36 /* MinusToken */), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsBinaryOpContext), 2 /* Space */));
                this.SpaceAfterSubtractWhenFollowedByPredecrement = new formatting.Rule(formatting.RuleDescriptor.create1(36 /* MinusToken */, 41 /* MinusMinusToken */), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsBinaryOpContext), 2 /* Space */));
                this.NoSpaceBeforeComma = new formatting.Rule(formatting.RuleDescriptor.create2(formatting.Shared.TokenRange.Any, 24 /* CommaToken */), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext), 8 /* Delete */));
                this.SpaceAfterCertainKeywords = new formatting.Rule(formatting.RuleDescriptor.create4(formatting.Shared.TokenRange.FromTokens([100 /* VarKeyword */, 96 /* ThrowKeyword */, 90 /* NewKeyword */, 76 /* DeleteKeyword */, 92 /* ReturnKeyword */, 99 /* TypeOfKeyword */]), formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext), 2 /* Space */));
                this.SpaceAfterLetConstInVariableDeclaration = new formatting.Rule(formatting.RuleDescriptor.create4(formatting.Shared.TokenRange.FromTokens([106 /* LetKeyword */, 72 /* ConstKeyword */]), formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsStartOfVariableDeclarationList), 2 /* Space */));
                this.NoSpaceBeforeOpenParenInFuncCall = new formatting.Rule(formatting.RuleDescriptor.create2(formatting.Shared.TokenRange.Any, 17 /* OpenParenToken */), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsFunctionCallOrNewContext, Rules.IsPreviousTokenNotComma), 8 /* Delete */));
                this.SpaceAfterFunctionInFuncDecl = new formatting.Rule(formatting.RuleDescriptor.create3(85 /* FunctionKeyword */, formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsFunctionDeclContext), 2 /* Space */));
                this.NoSpaceBeforeOpenParenInFuncDecl = new formatting.Rule(formatting.RuleDescriptor.create2(formatting.Shared.TokenRange.Any, 17 /* OpenParenToken */), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsFunctionDeclContext), 8 /* Delete */));
                this.SpaceAfterVoidOperator = new formatting.Rule(formatting.RuleDescriptor.create3(101 /* VoidKeyword */, formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsVoidOpContext), 2 /* Space */));
                this.NoSpaceBetweenReturnAndSemicolon = new formatting.Rule(formatting.RuleDescriptor.create1(92 /* ReturnKeyword */, 23 /* SemicolonToken */), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext), 8 /* Delete */));
                // Add a space between statements. All keywords except (do,else,case) has open/close parens after them.
                // So, we have a rule to add a space for [),Any], [do,Any], [else,Any], and [case,Any]
                this.SpaceBetweenStatements = new formatting.Rule(formatting.RuleDescriptor.create4(formatting.Shared.TokenRange.FromTokens([18 /* CloseParenToken */, 77 /* DoKeyword */, 78 /* ElseKeyword */, 69 /* CaseKeyword */]), formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsNotForContext), 2 /* Space */));
                // This low-pri rule takes care of "try {" and "finally {" in case the rule SpaceBeforeOpenBraceInControl didn't execute on FormatOnEnter.
                this.SpaceAfterTryFinally = new formatting.Rule(formatting.RuleDescriptor.create2(formatting.Shared.TokenRange.FromTokens([98 /* TryKeyword */, 83 /* FinallyKeyword */]), 15 /* OpenBraceToken */), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext), 2 /* Space */));
                //      get x() {}
                //      set x(val) {}
                this.SpaceAfterGetSetInMember = new formatting.Rule(formatting.RuleDescriptor.create2(formatting.Shared.TokenRange.FromTokens([121 /* GetKeyword */, 127 /* SetKeyword */]), 67 /* Identifier */), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsFunctionDeclContext), 2 /* Space */));
                // Special case for binary operators (that are keywords). For these we have to add a space and shouldn't follow any user options.
                this.SpaceBeforeBinaryKeywordOperator = new formatting.Rule(formatting.RuleDescriptor.create4(formatting.Shared.TokenRange.Any, formatting.Shared.TokenRange.BinaryKeywordOperators), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsBinaryOpContext), 2 /* Space */));
                this.SpaceAfterBinaryKeywordOperator = new formatting.Rule(formatting.RuleDescriptor.create4(formatting.Shared.TokenRange.BinaryKeywordOperators, formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsBinaryOpContext), 2 /* Space */));
                // TypeScript-specific higher priority rules
                // Treat constructor as an identifier in a function declaration, and remove spaces between constructor and following left parentheses
                this.NoSpaceAfterConstructor = new formatting.Rule(formatting.RuleDescriptor.create1(119 /* ConstructorKeyword */, 17 /* OpenParenToken */), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext), 8 /* Delete */));
                // Use of module as a function call. e.g.: import m2 = module("m2");
                this.NoSpaceAfterModuleImport = new formatting.Rule(formatting.RuleDescriptor.create2(formatting.Shared.TokenRange.FromTokens([123 /* ModuleKeyword */, 125 /* RequireKeyword */]), 17 /* OpenParenToken */), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext), 8 /* Delete */));
                // Add a space around certain TypeScript keywords
                this.SpaceAfterCertainTypeScriptKeywords = new formatting.Rule(formatting.RuleDescriptor.create4(formatting.Shared.TokenRange.FromTokens([113 /* AbstractKeyword */, 71 /* ClassKeyword */, 120 /* DeclareKeyword */, 75 /* DefaultKeyword */, 79 /* EnumKeyword */, 80 /* ExportKeyword */, 81 /* ExtendsKeyword */, 121 /* GetKeyword */, 104 /* ImplementsKeyword */, 87 /* ImportKeyword */, 105 /* InterfaceKeyword */, 123 /* ModuleKeyword */, 124 /* NamespaceKeyword */, 108 /* PrivateKeyword */, 110 /* PublicKeyword */, 109 /* ProtectedKeyword */, 127 /* SetKeyword */, 111 /* StaticKeyword */]), formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext), 2 /* Space */));
                this.SpaceBeforeCertainTypeScriptKeywords = new formatting.Rule(formatting.RuleDescriptor.create4(formatting.Shared.TokenRange.Any, formatting.Shared.TokenRange.FromTokens([81 /* ExtendsKeyword */, 104 /* ImplementsKeyword */])), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext), 2 /* Space */));
                // Treat string literals in module names as identifiers, and add a space between the literal and the opening Brace braces, e.g.: module "m2" {
                this.SpaceAfterModuleName = new formatting.Rule(formatting.RuleDescriptor.create1(9 /* StringLiteral */, 15 /* OpenBraceToken */), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsModuleDeclContext), 2 /* Space */));
                // Lambda expressions
                this.SpaceAfterArrow = new formatting.Rule(formatting.RuleDescriptor.create3(34 /* EqualsGreaterThanToken */, formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext), 2 /* Space */));
                // Optional parameters and let args
                this.NoSpaceAfterEllipsis = new formatting.Rule(formatting.RuleDescriptor.create1(22 /* DotDotDotToken */, 67 /* Identifier */), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext), 8 /* Delete */));
                this.NoSpaceAfterOptionalParameters = new formatting.Rule(formatting.RuleDescriptor.create3(52 /* QuestionToken */, formatting.Shared.TokenRange.FromTokens([18 /* CloseParenToken */, 24 /* CommaToken */])), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsNotBinaryOpContext), 8 /* Delete */));
                // generics and type assertions
                this.NoSpaceBeforeOpenAngularBracket = new formatting.Rule(formatting.RuleDescriptor.create2(formatting.Shared.TokenRange.TypeNames, 25 /* LessThanToken */), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsTypeArgumentOrParameterOrAssertionContext), 8 /* Delete */));
                this.NoSpaceBetweenCloseParenAndAngularBracket = new formatting.Rule(formatting.RuleDescriptor.create1(18 /* CloseParenToken */, 25 /* LessThanToken */), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsTypeArgumentOrParameterOrAssertionContext), 8 /* Delete */));
                this.NoSpaceAfterOpenAngularBracket = new formatting.Rule(formatting.RuleDescriptor.create3(25 /* LessThanToken */, formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsTypeArgumentOrParameterOrAssertionContext), 8 /* Delete */));
                this.NoSpaceBeforeCloseAngularBracket = new formatting.Rule(formatting.RuleDescriptor.create2(formatting.Shared.TokenRange.Any, 27 /* GreaterThanToken */), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsTypeArgumentOrParameterOrAssertionContext), 8 /* Delete */));
                this.NoSpaceAfterCloseAngularBracket = new formatting.Rule(formatting.RuleDescriptor.create3(27 /* GreaterThanToken */, formatting.Shared.TokenRange.FromTokens([17 /* OpenParenToken */, 19 /* OpenBracketToken */, 27 /* GreaterThanToken */, 24 /* CommaToken */])), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsTypeArgumentOrParameterOrAssertionContext), 8 /* Delete */));
                this.NoSpaceAfterTypeAssertion = new formatting.Rule(formatting.RuleDescriptor.create3(27 /* GreaterThanToken */, formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsTypeAssertionContext), 8 /* Delete */));
                // Remove spaces in empty interface literals. e.g.: x: {}
                this.NoSpaceBetweenEmptyInterfaceBraceBrackets = new formatting.Rule(formatting.RuleDescriptor.create1(15 /* OpenBraceToken */, 16 /* CloseBraceToken */), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsObjectTypeContext), 8 /* Delete */));
                // decorators
                this.SpaceBeforeAt = new formatting.Rule(formatting.RuleDescriptor.create2(formatting.Shared.TokenRange.Any, 54 /* AtToken */), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext), 2 /* Space */));
                this.NoSpaceAfterAt = new formatting.Rule(formatting.RuleDescriptor.create3(54 /* AtToken */, formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext), 8 /* Delete */));
                this.SpaceAfterDecorator = new formatting.Rule(formatting.RuleDescriptor.create4(formatting.Shared.TokenRange.Any, formatting.Shared.TokenRange.FromTokens([113 /* AbstractKeyword */, 67 /* Identifier */, 80 /* ExportKeyword */, 75 /* DefaultKeyword */, 71 /* ClassKeyword */, 111 /* StaticKeyword */, 110 /* PublicKeyword */, 108 /* PrivateKeyword */, 109 /* ProtectedKeyword */, 121 /* GetKeyword */, 127 /* SetKeyword */, 19 /* OpenBracketToken */, 37 /* AsteriskToken */])), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsEndOfDecoratorContextOnSameLine), 2 /* Space */));
                this.NoSpaceBetweenFunctionKeywordAndStar = new formatting.Rule(formatting.RuleDescriptor.create1(85 /* FunctionKeyword */, 37 /* AsteriskToken */), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsFunctionDeclarationOrFunctionExpressionContext), 8 /* Delete */));
                this.SpaceAfterStarInGeneratorDeclaration = new formatting.Rule(formatting.RuleDescriptor.create3(37 /* AsteriskToken */, formatting.Shared.TokenRange.FromTokens([67 /* Identifier */, 17 /* OpenParenToken */])), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsFunctionDeclarationOrFunctionExpressionContext), 2 /* Space */));
                this.NoSpaceBetweenYieldKeywordAndStar = new formatting.Rule(formatting.RuleDescriptor.create1(112 /* YieldKeyword */, 37 /* AsteriskToken */), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsYieldOrYieldStarWithOperand), 8 /* Delete */));
                this.SpaceBetweenYieldOrYieldStarAndOperand = new formatting.Rule(formatting.RuleDescriptor.create4(formatting.Shared.TokenRange.FromTokens([112 /* YieldKeyword */, 37 /* AsteriskToken */]), formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsYieldOrYieldStarWithOperand), 2 /* Space */));
                // Async-await
                this.SpaceBetweenAsyncAndFunctionKeyword = new formatting.Rule(formatting.RuleDescriptor.create1(116 /* AsyncKeyword */, 85 /* FunctionKeyword */), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext), 2 /* Space */));
                this.NoSpaceBetweenAsyncAndFunctionKeyword = new formatting.Rule(formatting.RuleDescriptor.create1(116 /* AsyncKeyword */, 85 /* FunctionKeyword */), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext), 8 /* Delete */));
                this.SpaceAfterAwaitKeyword = new formatting.Rule(formatting.RuleDescriptor.create3(117 /* AwaitKeyword */, formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext), 2 /* Space */));
                this.NoSpaceAfterAwaitKeyword = new formatting.Rule(formatting.RuleDescriptor.create3(117 /* AwaitKeyword */, formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext), 8 /* Delete */));
                // Type alias declaration
                this.SpaceAfterTypeKeyword = new formatting.Rule(formatting.RuleDescriptor.create3(130 /* TypeKeyword */, formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext), 2 /* Space */));
                this.NoSpaceAfterTypeKeyword = new formatting.Rule(formatting.RuleDescriptor.create3(130 /* TypeKeyword */, formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext), 8 /* Delete */));
                // template string
                this.SpaceBetweenTagAndTemplateString = new formatting.Rule(formatting.RuleDescriptor.create3(67 /* Identifier */, formatting.Shared.TokenRange.FromTokens([11 /* NoSubstitutionTemplateLiteral */, 12 /* TemplateHead */])), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext), 2 /* Space */));
                this.NoSpaceBetweenTagAndTemplateString = new formatting.Rule(formatting.RuleDescriptor.create3(67 /* Identifier */, formatting.Shared.TokenRange.FromTokens([11 /* NoSubstitutionTemplateLiteral */, 12 /* TemplateHead */])), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext), 8 /* Delete */));
                // type operation
                this.SpaceBeforeBar = new formatting.Rule(formatting.RuleDescriptor.create3(46 /* BarToken */, formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext), 2 /* Space */));
                this.NoSpaceBeforeBar = new formatting.Rule(formatting.RuleDescriptor.create3(46 /* BarToken */, formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext), 8 /* Delete */));
                this.SpaceAfterBar = new formatting.Rule(formatting.RuleDescriptor.create2(formatting.Shared.TokenRange.Any, 46 /* BarToken */), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext), 2 /* Space */));
                this.NoSpaceAfterBar = new formatting.Rule(formatting.RuleDescriptor.create2(formatting.Shared.TokenRange.Any, 46 /* BarToken */), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext), 8 /* Delete */));
                this.SpaceBeforeAmpersand = new formatting.Rule(formatting.RuleDescriptor.create3(45 /* AmpersandToken */, formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext), 2 /* Space */));
                this.SpaceAfterAmpersand = new formatting.Rule(formatting.RuleDescriptor.create2(formatting.Shared.TokenRange.Any, 45 /* AmpersandToken */), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext), 2 /* Space */));
                // These rules are higher in priority than user-configurable rules.
                this.HighPriorityCommonRules =
                    [
                        this.IgnoreBeforeComment, this.IgnoreAfterLineComment,
                        this.NoSpaceBeforeColon, this.SpaceAfterColon, this.NoSpaceBeforeQuestionMark, this.SpaceAfterQuestionMarkInConditionalOperator,
                        this.NoSpaceAfterQuestionMark,
                        this.NoSpaceBeforeDot, this.NoSpaceAfterDot,
                        this.NoSpaceAfterUnaryPrefixOperator,
                        this.NoSpaceAfterUnaryPreincrementOperator, this.NoSpaceAfterUnaryPredecrementOperator,
                        this.NoSpaceBeforeUnaryPostincrementOperator, this.NoSpaceBeforeUnaryPostdecrementOperator,
                        this.SpaceAfterPostincrementWhenFollowedByAdd,
                        this.SpaceAfterAddWhenFollowedByUnaryPlus, this.SpaceAfterAddWhenFollowedByPreincrement,
                        this.SpaceAfterPostdecrementWhenFollowedBySubtract,
                        this.SpaceAfterSubtractWhenFollowedByUnaryMinus, this.SpaceAfterSubtractWhenFollowedByPredecrement,
                        this.NoSpaceAfterCloseBrace,
                        this.SpaceAfterOpenBrace, this.SpaceBeforeCloseBrace, this.NewLineBeforeCloseBraceInBlockContext,
                        this.SpaceAfterCloseBrace, this.SpaceBetweenCloseBraceAndElse, this.SpaceBetweenCloseBraceAndWhile, this.NoSpaceBetweenEmptyBraceBrackets,
                        this.NoSpaceBetweenFunctionKeywordAndStar, this.SpaceAfterStarInGeneratorDeclaration,
                        this.SpaceAfterFunctionInFuncDecl, this.NewLineAfterOpenBraceInBlockContext, this.SpaceAfterGetSetInMember,
                        this.NoSpaceBetweenYieldKeywordAndStar, this.SpaceBetweenYieldOrYieldStarAndOperand,
                        this.NoSpaceBetweenReturnAndSemicolon,
                        this.SpaceAfterCertainKeywords,
                        this.SpaceAfterLetConstInVariableDeclaration,
                        this.NoSpaceBeforeOpenParenInFuncCall,
                        this.SpaceBeforeBinaryKeywordOperator, this.SpaceAfterBinaryKeywordOperator,
                        this.SpaceAfterVoidOperator,
                        this.SpaceBetweenAsyncAndFunctionKeyword, this.NoSpaceBetweenAsyncAndFunctionKeyword,
                        this.SpaceAfterAwaitKeyword, this.NoSpaceAfterAwaitKeyword,
                        this.SpaceAfterTypeKeyword, this.NoSpaceAfterTypeKeyword,
                        this.SpaceBetweenTagAndTemplateString, this.NoSpaceBetweenTagAndTemplateString,
                        this.SpaceBeforeBar, this.NoSpaceBeforeBar, this.SpaceAfterBar, this.NoSpaceAfterBar,
                        this.SpaceBeforeAmpersand, this.SpaceAfterAmpersand,
                        // TypeScript-specific rules
                        this.NoSpaceAfterConstructor, this.NoSpaceAfterModuleImport,
                        this.SpaceAfterCertainTypeScriptKeywords, this.SpaceBeforeCertainTypeScriptKeywords,
                        this.SpaceAfterModuleName,
                        this.SpaceAfterArrow,
                        this.NoSpaceAfterEllipsis,
                        this.NoSpaceAfterOptionalParameters,
                        this.NoSpaceBetweenEmptyInterfaceBraceBrackets,
                        this.NoSpaceBeforeOpenAngularBracket,
                        this.NoSpaceBetweenCloseParenAndAngularBracket,
                        this.NoSpaceAfterOpenAngularBracket,
                        this.NoSpaceBeforeCloseAngularBracket,
                        this.NoSpaceAfterCloseAngularBracket,
                        this.NoSpaceAfterTypeAssertion,
                        this.SpaceBeforeAt,
                        this.NoSpaceAfterAt,
                        this.SpaceAfterDecorator,
                    ];
                // These rules are lower in priority than user-configurable rules.
                this.LowPriorityCommonRules =
                    [
                        this.NoSpaceBeforeSemicolon,
                        this.SpaceBeforeOpenBraceInControl, this.SpaceBeforeOpenBraceInFunction, this.SpaceBeforeOpenBraceInTypeScriptDeclWithBlock,
                        this.NoSpaceBeforeComma,
                        this.NoSpaceBeforeOpenBracket,
                        this.NoSpaceAfterCloseBracket,
                        this.SpaceAfterSemicolon,
                        this.NoSpaceBeforeOpenParenInFuncDecl,
                        this.SpaceBetweenStatements, this.SpaceAfterTryFinally
                    ];
                ///
                /// Rules controlled by user options
                ///
                // Insert space after comma delimiter
                this.SpaceAfterComma = new formatting.Rule(formatting.RuleDescriptor.create3(24 /* CommaToken */, formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext), 2 /* Space */));
                this.NoSpaceAfterComma = new formatting.Rule(formatting.RuleDescriptor.create3(24 /* CommaToken */, formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext), 8 /* Delete */));
                // Insert space before and after binary operators
                this.SpaceBeforeBinaryOperator = new formatting.Rule(formatting.RuleDescriptor.create4(formatting.Shared.TokenRange.Any, formatting.Shared.TokenRange.BinaryOperators), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsBinaryOpContext), 2 /* Space */));
                this.SpaceAfterBinaryOperator = new formatting.Rule(formatting.RuleDescriptor.create4(formatting.Shared.TokenRange.BinaryOperators, formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsBinaryOpContext), 2 /* Space */));
                this.NoSpaceBeforeBinaryOperator = new formatting.Rule(formatting.RuleDescriptor.create4(formatting.Shared.TokenRange.Any, formatting.Shared.TokenRange.BinaryOperators), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsBinaryOpContext), 8 /* Delete */));
                this.NoSpaceAfterBinaryOperator = new formatting.Rule(formatting.RuleDescriptor.create4(formatting.Shared.TokenRange.BinaryOperators, formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsBinaryOpContext), 8 /* Delete */));
                // Insert space after keywords in control flow statements
                this.SpaceAfterKeywordInControl = new formatting.Rule(formatting.RuleDescriptor.create2(formatting.Shared.TokenRange.Keywords, 17 /* OpenParenToken */), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsControlDeclContext), 2 /* Space */));
                this.NoSpaceAfterKeywordInControl = new formatting.Rule(formatting.RuleDescriptor.create2(formatting.Shared.TokenRange.Keywords, 17 /* OpenParenToken */), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsControlDeclContext), 8 /* Delete */));
                // Open Brace braces after function
                //TypeScript: Function can have return types, which can be made of tons of different token kinds
                this.NewLineBeforeOpenBraceInFunction = new formatting.Rule(formatting.RuleDescriptor.create2(this.FunctionOpenBraceLeftTokenRange, 15 /* OpenBraceToken */), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsFunctionDeclContext, Rules.IsBeforeMultilineBlockContext), 4 /* NewLine */), 1 /* CanDeleteNewLines */);
                // Open Brace braces after TypeScript module/class/interface
                this.NewLineBeforeOpenBraceInTypeScriptDeclWithBlock = new formatting.Rule(formatting.RuleDescriptor.create2(this.TypeScriptOpenBraceLeftTokenRange, 15 /* OpenBraceToken */), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsTypeScriptDeclWithBlockContext, Rules.IsBeforeMultilineBlockContext), 4 /* NewLine */), 1 /* CanDeleteNewLines */);
                // Open Brace braces after control block
                this.NewLineBeforeOpenBraceInControl = new formatting.Rule(formatting.RuleDescriptor.create2(this.ControlOpenBraceLeftTokenRange, 15 /* OpenBraceToken */), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsControlDeclContext, Rules.IsBeforeMultilineBlockContext), 4 /* NewLine */), 1 /* CanDeleteNewLines */);
                // Insert space after semicolon in for statement
                this.SpaceAfterSemicolonInFor = new formatting.Rule(formatting.RuleDescriptor.create3(23 /* SemicolonToken */, formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsForContext), 2 /* Space */));
                this.NoSpaceAfterSemicolonInFor = new formatting.Rule(formatting.RuleDescriptor.create3(23 /* SemicolonToken */, formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext, Rules.IsForContext), 8 /* Delete */));
                // Insert space after opening and before closing nonempty parenthesis
                this.SpaceAfterOpenParen = new formatting.Rule(formatting.RuleDescriptor.create3(17 /* OpenParenToken */, formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext), 2 /* Space */));
                this.SpaceBeforeCloseParen = new formatting.Rule(formatting.RuleDescriptor.create2(formatting.Shared.TokenRange.Any, 18 /* CloseParenToken */), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext), 2 /* Space */));
                this.NoSpaceBetweenParens = new formatting.Rule(formatting.RuleDescriptor.create1(17 /* OpenParenToken */, 18 /* CloseParenToken */), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext), 8 /* Delete */));
                this.NoSpaceAfterOpenParen = new formatting.Rule(formatting.RuleDescriptor.create3(17 /* OpenParenToken */, formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext), 8 /* Delete */));
                this.NoSpaceBeforeCloseParen = new formatting.Rule(formatting.RuleDescriptor.create2(formatting.Shared.TokenRange.Any, 18 /* CloseParenToken */), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext), 8 /* Delete */));
                // Insert space after opening and before closing nonempty brackets
                this.SpaceAfterOpenBracket = new formatting.Rule(formatting.RuleDescriptor.create3(19 /* OpenBracketToken */, formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext), 2 /* Space */));
                this.SpaceBeforeCloseBracket = new formatting.Rule(formatting.RuleDescriptor.create2(formatting.Shared.TokenRange.Any, 20 /* CloseBracketToken */), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext), 2 /* Space */));
                this.NoSpaceBetweenBrackets = new formatting.Rule(formatting.RuleDescriptor.create1(19 /* OpenBracketToken */, 20 /* CloseBracketToken */), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext), 8 /* Delete */));
                this.NoSpaceAfterOpenBracket = new formatting.Rule(formatting.RuleDescriptor.create3(19 /* OpenBracketToken */, formatting.Shared.TokenRange.Any), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext), 8 /* Delete */));
                this.NoSpaceBeforeCloseBracket = new formatting.Rule(formatting.RuleDescriptor.create2(formatting.Shared.TokenRange.Any, 20 /* CloseBracketToken */), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsSameLineTokenContext), 8 /* Delete */));
                // Insert space after function keyword for anonymous functions
                this.SpaceAfterAnonymousFunctionKeyword = new formatting.Rule(formatting.RuleDescriptor.create1(85 /* FunctionKeyword */, 17 /* OpenParenToken */), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsFunctionDeclContext), 2 /* Space */));
                this.NoSpaceAfterAnonymousFunctionKeyword = new formatting.Rule(formatting.RuleDescriptor.create1(85 /* FunctionKeyword */, 17 /* OpenParenToken */), formatting.RuleOperation.create2(new formatting.RuleOperationContext(Rules.IsFunctionDeclContext), 8 /* Delete */));
            }
            Rules.prototype.getRuleName = function (rule) {
                var o = this;
                for (var name_1 in o) {
                    if (o[name_1] === rule) {
                        return name_1;
                    }
                }
                throw new Error("Unknown rule");
            };
            ///
            /// Contexts
            ///
            Rules.IsForContext = function (context) {
                return context.contextNode.kind === 197 /* ForStatement */;
            };
            Rules.IsNotForContext = function (context) {
                return !Rules.IsForContext(context);
            };
            Rules.IsBinaryOpContext = function (context) {
                switch (context.contextNode.kind) {
                    case 179 /* BinaryExpression */:
                    case 180 /* ConditionalExpression */:
                    case 187 /* AsExpression */:
                    case 148 /* TypePredicate */:
                        return true;
                    // equals in binding elements: function foo([[x, y] = [1, 2]])
                    case 161 /* BindingElement */:
                    // equals in type X = ...
                    case 214 /* TypeAliasDeclaration */:
                    // equal in import a = module('a');
                    case 219 /* ImportEqualsDeclaration */:
                    // equal in let a = 0;
                    case 209 /* VariableDeclaration */:
                    // equal in p = 0;
                    case 136 /* Parameter */:
                    case 245 /* EnumMember */:
                    case 139 /* PropertyDeclaration */:
                    case 138 /* PropertySignature */:
                        return context.currentTokenSpan.kind === 55 /* EqualsToken */ || context.nextTokenSpan.kind === 55 /* EqualsToken */;
                    // "in" keyword in for (let x in []) { }
                    case 198 /* ForInStatement */:
                        return context.currentTokenSpan.kind === 88 /* InKeyword */ || context.nextTokenSpan.kind === 88 /* InKeyword */;
                    // Technically, "of" is not a binary operator, but format it the same way as "in"
                    case 199 /* ForOfStatement */:
                        return context.currentTokenSpan.kind === 132 /* OfKeyword */ || context.nextTokenSpan.kind === 132 /* OfKeyword */;
                }
                return false;
            };
            Rules.IsNotBinaryOpContext = function (context) {
                return !Rules.IsBinaryOpContext(context);
            };
            Rules.IsConditionalOperatorContext = function (context) {
                return context.contextNode.kind === 180 /* ConditionalExpression */;
            };
            Rules.IsSameLineTokenOrBeforeMultilineBlockContext = function (context) {
                //// This check is mainly used inside SpaceBeforeOpenBraceInControl and SpaceBeforeOpenBraceInFunction.
                ////
                //// Ex: 
                //// if (1)     { ....
                ////      * ) and { are on the same line so apply the rule. Here we don't care whether it's same or multi block context
                ////
                //// Ex: 
                //// if (1)
                //// { ... }
                ////      * ) and { are on differnet lines. We only need to format if the block is multiline context. So in this case we don't format.
                ////
                //// Ex:
                //// if (1) 
                //// { ...
                //// }
                ////      * ) and { are on differnet lines. We only need to format if the block is multiline context. So in this case we format.
                return context.TokensAreOnSameLine() || Rules.IsBeforeMultilineBlockContext(context);
            };
            // This check is done before an open brace in a control construct, a function, or a typescript block declaration
            Rules.IsBeforeMultilineBlockContext = function (context) {
                return Rules.IsBeforeBlockContext(context) && !(context.NextNodeAllOnSameLine() || context.NextNodeBlockIsOnOneLine());
            };
            Rules.IsMultilineBlockContext = function (context) {
                return Rules.IsBlockContext(context) && !(context.ContextNodeAllOnSameLine() || context.ContextNodeBlockIsOnOneLine());
            };
            Rules.IsSingleLineBlockContext = function (context) {
                return Rules.IsBlockContext(context) && (context.ContextNodeAllOnSameLine() || context.ContextNodeBlockIsOnOneLine());
            };
            Rules.IsBlockContext = function (context) {
                return Rules.NodeIsBlockContext(context.contextNode);
            };
            Rules.IsBeforeBlockContext = function (context) {
                return Rules.NodeIsBlockContext(context.nextTokenParent);
            };
            // IMPORTANT!!! This method must return true ONLY for nodes with open and close braces as immediate children
            Rules.NodeIsBlockContext = function (node) {
                if (Rules.NodeIsTypeScriptDeclWithBlockContext(node)) {
                    // This means we are in a context that looks like a block to the user, but in the grammar is actually not a node (it's a class, module, enum, object type literal, etc).
                    return true;
                }
                switch (node.kind) {
                    case 190 /* Block */:
                    case 218 /* CaseBlock */:
                    case 163 /* ObjectLiteralExpression */:
                    case 217 /* ModuleBlock */:
                        return true;
                }
                return false;
            };
            Rules.IsFunctionDeclContext = function (context) {
                switch (context.contextNode.kind) {
                    case 211 /* FunctionDeclaration */:
                    case 141 /* MethodDeclaration */:
                    case 140 /* MethodSignature */:
                    //case SyntaxKind.MemberFunctionDeclaration:
                    case 143 /* GetAccessor */:
                    case 144 /* SetAccessor */:
                    ///case SyntaxKind.MethodSignature:
                    case 145 /* CallSignature */:
                    case 171 /* FunctionExpression */:
                    case 142 /* Constructor */:
                    case 172 /* ArrowFunction */:
                    //case SyntaxKind.ConstructorDeclaration:
                    //case SyntaxKind.SimpleArrowFunctionExpression:
                    //case SyntaxKind.ParenthesizedArrowFunctionExpression:
                    case 213 /* InterfaceDeclaration */:
                        return true;
                }
                return false;
            };
            Rules.IsFunctionDeclarationOrFunctionExpressionContext = function (context) {
                return context.contextNode.kind === 211 /* FunctionDeclaration */ || context.contextNode.kind === 171 /* FunctionExpression */;
            };
            Rules.IsTypeScriptDeclWithBlockContext = function (context) {
                return Rules.NodeIsTypeScriptDeclWithBlockContext(context.contextNode);
            };
            Rules.NodeIsTypeScriptDeclWithBlockContext = function (node) {
                switch (node.kind) {
                    case 212 /* ClassDeclaration */:
                    case 184 /* ClassExpression */:
                    case 213 /* InterfaceDeclaration */:
                    case 215 /* EnumDeclaration */:
                    case 153 /* TypeLiteral */:
                    case 216 /* ModuleDeclaration */:
                        return true;
                }
                return false;
            };
            Rules.IsAfterCodeBlockContext = function (context) {
                switch (context.currentTokenParent.kind) {
                    case 212 /* ClassDeclaration */:
                    case 216 /* ModuleDeclaration */:
                    case 215 /* EnumDeclaration */:
                    case 190 /* Block */:
                    case 242 /* CatchClause */:
                    case 217 /* ModuleBlock */:
                    case 204 /* SwitchStatement */:
                        return true;
                }
                return false;
            };
            Rules.IsControlDeclContext = function (context) {
                switch (context.contextNode.kind) {
                    case 194 /* IfStatement */:
                    case 204 /* SwitchStatement */:
                    case 197 /* ForStatement */:
                    case 198 /* ForInStatement */:
                    case 199 /* ForOfStatement */:
                    case 196 /* WhileStatement */:
                    case 207 /* TryStatement */:
                    case 195 /* DoStatement */:
                    case 203 /* WithStatement */:
                    // TODO
                    // case SyntaxKind.ElseClause:
                    case 242 /* CatchClause */:
                        return true;
                    default:
                        return false;
                }
            };
            Rules.IsObjectContext = function (context) {
                return context.contextNode.kind === 163 /* ObjectLiteralExpression */;
            };
            Rules.IsFunctionCallContext = function (context) {
                return context.contextNode.kind === 166 /* CallExpression */;
            };
            Rules.IsNewContext = function (context) {
                return context.contextNode.kind === 167 /* NewExpression */;
            };
            Rules.IsFunctionCallOrNewContext = function (context) {
                return Rules.IsFunctionCallContext(context) || Rules.IsNewContext(context);
            };
            Rules.IsPreviousTokenNotComma = function (context) {
                return context.currentTokenSpan.kind !== 24 /* CommaToken */;
            };
            Rules.IsSameLineTokenContext = function (context) {
                return context.TokensAreOnSameLine();
            };
            Rules.IsNotBeforeBlockInFunctionDeclarationContext = function (context) {
                return !Rules.IsFunctionDeclContext(context) && !Rules.IsBeforeBlockContext(context);
            };
            Rules.IsEndOfDecoratorContextOnSameLine = function (context) {
                return context.TokensAreOnSameLine() &&
                    context.contextNode.decorators &&
                    Rules.NodeIsInDecoratorContext(context.currentTokenParent) &&
                    !Rules.NodeIsInDecoratorContext(context.nextTokenParent);
            };
            Rules.NodeIsInDecoratorContext = function (node) {
                while (ts.isExpression(node)) {
                    node = node.parent;
                }
                return node.kind === 137 /* Decorator */;
            };
            Rules.IsStartOfVariableDeclarationList = function (context) {
                return context.currentTokenParent.kind === 210 /* VariableDeclarationList */ &&
                    context.currentTokenParent.getStart(context.sourceFile) === context.currentTokenSpan.pos;
            };
            Rules.IsNotFormatOnEnter = function (context) {
                return context.formattingRequestKind !== 2 /* FormatOnEnter */;
            };
            Rules.IsModuleDeclContext = function (context) {
                return context.contextNode.kind === 216 /* ModuleDeclaration */;
            };
            Rules.IsObjectTypeContext = function (context) {
                return context.contextNode.kind === 153 /* TypeLiteral */; // && context.contextNode.parent.kind !== SyntaxKind.InterfaceDeclaration;
            };
            Rules.IsTypeArgumentOrParameterOrAssertion = function (token, parent) {
                if (token.kind !== 25 /* LessThanToken */ && token.kind !== 27 /* GreaterThanToken */) {
                    return false;
                }
                switch (parent.kind) {
                    case 149 /* TypeReference */:
                    case 169 /* TypeAssertionExpression */:
                    case 212 /* ClassDeclaration */:
                    case 184 /* ClassExpression */:
                    case 213 /* InterfaceDeclaration */:
                    case 211 /* FunctionDeclaration */:
                    case 171 /* FunctionExpression */:
                    case 172 /* ArrowFunction */:
                    case 141 /* MethodDeclaration */:
                    case 140 /* MethodSignature */:
                    case 145 /* CallSignature */:
                    case 146 /* ConstructSignature */:
                    case 166 /* CallExpression */:
                    case 167 /* NewExpression */:
                    case 186 /* ExpressionWithTypeArguments */:
                        return true;
                    default:
                        return false;
                }
            };
            Rules.IsTypeArgumentOrParameterOrAssertionContext = function (context) {
                return Rules.IsTypeArgumentOrParameterOrAssertion(context.currentTokenSpan, context.currentTokenParent) ||
                    Rules.IsTypeArgumentOrParameterOrAssertion(context.nextTokenSpan, context.nextTokenParent);
            };
            Rules.IsTypeAssertionContext = function (context) {
                return context.contextNode.kind === 169 /* TypeAssertionExpression */;
            };
            Rules.IsVoidOpContext = function (context) {
                return context.currentTokenSpan.kind === 101 /* VoidKeyword */ && context.currentTokenParent.kind === 175 /* VoidExpression */;
            };
            Rules.IsYieldOrYieldStarWithOperand = function (context) {
                return context.contextNode.kind === 182 /* YieldExpression */ && context.contextNode.expression !== undefined;
            };
            return Rules;
        })();
        formatting.Rules = Rules;
    })(formatting = ts.formatting || (ts.formatting = {}));
})(ts || (ts = {}));
