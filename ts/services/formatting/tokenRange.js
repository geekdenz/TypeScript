///<reference path='references.ts' />
/* @internal */
var ts;
(function (ts) {
    var formatting;
    (function (formatting) {
        var Shared;
        (function (Shared) {
            var TokenRangeAccess = (function () {
                function TokenRangeAccess(from, to, except) {
                    this.tokens = [];
                    for (var token = from; token <= to; token++) {
                        if (except.indexOf(token) < 0) {
                            this.tokens.push(token);
                        }
                    }
                }
                TokenRangeAccess.prototype.GetTokens = function () {
                    return this.tokens;
                };
                TokenRangeAccess.prototype.Contains = function (token) {
                    return this.tokens.indexOf(token) >= 0;
                };
                return TokenRangeAccess;
            })();
            Shared.TokenRangeAccess = TokenRangeAccess;
            var TokenValuesAccess = (function () {
                function TokenValuesAccess(tks) {
                    this.tokens = tks && tks.length ? tks : [];
                }
                TokenValuesAccess.prototype.GetTokens = function () {
                    return this.tokens;
                };
                TokenValuesAccess.prototype.Contains = function (token) {
                    return this.tokens.indexOf(token) >= 0;
                };
                return TokenValuesAccess;
            })();
            Shared.TokenValuesAccess = TokenValuesAccess;
            var TokenSingleValueAccess = (function () {
                function TokenSingleValueAccess(token) {
                    this.token = token;
                }
                TokenSingleValueAccess.prototype.GetTokens = function () {
                    return [this.token];
                };
                TokenSingleValueAccess.prototype.Contains = function (tokenValue) {
                    return tokenValue === this.token;
                };
                return TokenSingleValueAccess;
            })();
            Shared.TokenSingleValueAccess = TokenSingleValueAccess;
            var TokenAllAccess = (function () {
                function TokenAllAccess() {
                }
                TokenAllAccess.prototype.GetTokens = function () {
                    var result = [];
                    for (var token = 0 /* FirstToken */; token <= 132 /* LastToken */; token++) {
                        result.push(token);
                    }
                    return result;
                };
                TokenAllAccess.prototype.Contains = function (tokenValue) {
                    return true;
                };
                TokenAllAccess.prototype.toString = function () {
                    return "[allTokens]";
                };
                return TokenAllAccess;
            })();
            Shared.TokenAllAccess = TokenAllAccess;
            var TokenRange = (function () {
                function TokenRange(tokenAccess) {
                    this.tokenAccess = tokenAccess;
                }
                TokenRange.FromToken = function (token) {
                    return new TokenRange(new TokenSingleValueAccess(token));
                };
                TokenRange.FromTokens = function (tokens) {
                    return new TokenRange(new TokenValuesAccess(tokens));
                };
                TokenRange.FromRange = function (f, to, except) {
                    if (except === void 0) { except = []; }
                    return new TokenRange(new TokenRangeAccess(f, to, except));
                };
                TokenRange.AllTokens = function () {
                    return new TokenRange(new TokenAllAccess());
                };
                TokenRange.prototype.GetTokens = function () {
                    return this.tokenAccess.GetTokens();
                };
                TokenRange.prototype.Contains = function (token) {
                    return this.tokenAccess.Contains(token);
                };
                TokenRange.prototype.toString = function () {
                    return this.tokenAccess.toString();
                };
                TokenRange.Any = TokenRange.AllTokens();
                TokenRange.AnyIncludingMultilineComments = TokenRange.FromTokens(TokenRange.Any.GetTokens().concat([3 /* MultiLineCommentTrivia */]));
                TokenRange.Keywords = TokenRange.FromRange(68 /* FirstKeyword */, 132 /* LastKeyword */);
                TokenRange.BinaryOperators = TokenRange.FromRange(25 /* FirstBinaryOperator */, 66 /* LastBinaryOperator */);
                TokenRange.BinaryKeywordOperators = TokenRange.FromTokens([88 /* InKeyword */, 89 /* InstanceOfKeyword */, 132 /* OfKeyword */, 114 /* AsKeyword */, 122 /* IsKeyword */]);
                TokenRange.UnaryPrefixOperators = TokenRange.FromTokens([40 /* PlusPlusToken */, 41 /* MinusMinusToken */, 49 /* TildeToken */, 48 /* ExclamationToken */]);
                TokenRange.UnaryPrefixExpressions = TokenRange.FromTokens([8 /* NumericLiteral */, 67 /* Identifier */, 17 /* OpenParenToken */, 19 /* OpenBracketToken */, 15 /* OpenBraceToken */, 95 /* ThisKeyword */, 90 /* NewKeyword */]);
                TokenRange.UnaryPreincrementExpressions = TokenRange.FromTokens([67 /* Identifier */, 17 /* OpenParenToken */, 95 /* ThisKeyword */, 90 /* NewKeyword */]);
                TokenRange.UnaryPostincrementExpressions = TokenRange.FromTokens([67 /* Identifier */, 18 /* CloseParenToken */, 20 /* CloseBracketToken */, 90 /* NewKeyword */]);
                TokenRange.UnaryPredecrementExpressions = TokenRange.FromTokens([67 /* Identifier */, 17 /* OpenParenToken */, 95 /* ThisKeyword */, 90 /* NewKeyword */]);
                TokenRange.UnaryPostdecrementExpressions = TokenRange.FromTokens([67 /* Identifier */, 18 /* CloseParenToken */, 20 /* CloseBracketToken */, 90 /* NewKeyword */]);
                TokenRange.Comments = TokenRange.FromTokens([2 /* SingleLineCommentTrivia */, 3 /* MultiLineCommentTrivia */]);
                TokenRange.TypeNames = TokenRange.FromTokens([67 /* Identifier */, 126 /* NumberKeyword */, 128 /* StringKeyword */, 118 /* BooleanKeyword */, 129 /* SymbolKeyword */, 101 /* VoidKeyword */, 115 /* AnyKeyword */]);
                return TokenRange;
            })();
            Shared.TokenRange = TokenRange;
        })(Shared = formatting.Shared || (formatting.Shared = {}));
    })(formatting = ts.formatting || (ts.formatting = {}));
})(ts || (ts = {}));
