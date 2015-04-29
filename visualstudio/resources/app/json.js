/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
(function (ScanError) {
    ScanError[ScanError["None"] = 0] = "None";
    ScanError[ScanError["UnexpectedEndOfComment"] = 1] = "UnexpectedEndOfComment";
    ScanError[ScanError["UnexpectedEndOfString"] = 2] = "UnexpectedEndOfString";
    ScanError[ScanError["UnexpectedEndOfNumber"] = 3] = "UnexpectedEndOfNumber";
    ScanError[ScanError["InvalidUnicode"] = 4] = "InvalidUnicode";
    ScanError[ScanError["InvalidEscapeCharacter"] = 5] = "InvalidEscapeCharacter";
})(exports.ScanError || (exports.ScanError = {}));
var ScanError = exports.ScanError;
(function (SyntaxKind) {
    SyntaxKind[SyntaxKind["Unknown"] = 0] = "Unknown";
    SyntaxKind[SyntaxKind["OpenBraceToken"] = 1] = "OpenBraceToken";
    SyntaxKind[SyntaxKind["CloseBraceToken"] = 2] = "CloseBraceToken";
    SyntaxKind[SyntaxKind["OpenBracketToken"] = 3] = "OpenBracketToken";
    SyntaxKind[SyntaxKind["CloseBracketToken"] = 4] = "CloseBracketToken";
    SyntaxKind[SyntaxKind["CommaToken"] = 5] = "CommaToken";
    SyntaxKind[SyntaxKind["ColonToken"] = 6] = "ColonToken";
    SyntaxKind[SyntaxKind["NullKeyword"] = 7] = "NullKeyword";
    SyntaxKind[SyntaxKind["TrueKeyword"] = 8] = "TrueKeyword";
    SyntaxKind[SyntaxKind["FalseKeyword"] = 9] = "FalseKeyword";
    SyntaxKind[SyntaxKind["StringLiteral"] = 10] = "StringLiteral";
    SyntaxKind[SyntaxKind["NumericLiteral"] = 11] = "NumericLiteral";
    SyntaxKind[SyntaxKind["LineCommentTrivia"] = 12] = "LineCommentTrivia";
    SyntaxKind[SyntaxKind["BlockCommentTrivia"] = 13] = "BlockCommentTrivia";
    SyntaxKind[SyntaxKind["Trivia"] = 14] = "Trivia";
    SyntaxKind[SyntaxKind["EOF"] = 15] = "EOF";
})(exports.SyntaxKind || (exports.SyntaxKind = {}));
var SyntaxKind = exports.SyntaxKind;
function createScanner(text, ignoreTrivia) {
    if (ignoreTrivia === void 0) { ignoreTrivia = false; }
    var pos = 0, len = text.length, value = '', tokenOffset = 0, token = SyntaxKind.Unknown, scanError = ScanError.None;
    function scanHexDigits(count, exact) {
        var digits = 0;
        var value = 0;
        while (digits < count || !exact) {
            var ch = text.charCodeAt(pos);
            if (ch >= CharacterCodes._0 && ch <= CharacterCodes._9) {
                value = value * 16 + ch - CharacterCodes._0;
            }
            else if (ch >= CharacterCodes.A && ch <= CharacterCodes.F) {
                value = value * 16 + ch - CharacterCodes.A + 10;
            }
            else if (ch >= CharacterCodes.a && ch <= CharacterCodes.f) {
                value = value * 16 + ch - CharacterCodes.a + 10;
            }
            else {
                break;
            }
            pos++;
            digits++;
        }
        if (digits < count) {
            value = -1;
        }
        return value;
    }
    function scanNumber() {
        var start = pos;
        if (text.charCodeAt(pos) === CharacterCodes._0) {
            pos++;
        }
        else {
            pos++;
            while (pos < text.length && isDigit(text.charCodeAt(pos))) {
                pos++;
            }
        }
        if (pos < text.length && text.charCodeAt(pos) === CharacterCodes.dot) {
            pos++;
            if (pos < text.length && isDigit(text.charCodeAt(pos))) {
                pos++;
                while (pos < text.length && isDigit(text.charCodeAt(pos))) {
                    pos++;
                }
            }
            else {
                scanError = ScanError.UnexpectedEndOfNumber;
                return text.substring(start, end);
            }
        }
        var end = pos;
        if (pos < text.length && (text.charCodeAt(pos) === CharacterCodes.E || text.charCodeAt(pos) === CharacterCodes.e)) {
            pos++;
            if (pos < text.length && text.charCodeAt(pos) === CharacterCodes.plus || text.charCodeAt(pos) === CharacterCodes.minus) {
                pos++;
            }
            if (pos < text.length && isDigit(text.charCodeAt(pos))) {
                pos++;
                while (pos < text.length && isDigit(text.charCodeAt(pos))) {
                    pos++;
                }
                end = pos;
            }
            else {
                scanError = ScanError.UnexpectedEndOfNumber;
            }
        }
        return text.substring(start, end);
    }
    function scanString() {
        var result = '', start = pos;
        while (true) {
            if (pos >= len) {
                result += text.substring(start, pos);
                scanError = ScanError.UnexpectedEndOfString;
                break;
            }
            var ch = text.charCodeAt(pos);
            if (ch === CharacterCodes.doubleQuote) {
                result += text.substring(start, pos);
                pos++;
                break;
            }
            if (ch === CharacterCodes.backslash) {
                result += text.substring(start, pos);
                pos++;
                if (pos >= len) {
                    scanError = ScanError.UnexpectedEndOfString;
                    break;
                }
                ch = text.charCodeAt(pos++);
                switch (ch) {
                    case CharacterCodes.doubleQuote:
                        result += '\"';
                        break;
                    case CharacterCodes.backslash:
                        result += '\\';
                        break;
                    case CharacterCodes.slash:
                        result += '/';
                        break;
                    case CharacterCodes.b:
                        result += '\b';
                        break;
                    case CharacterCodes.f:
                        result += '\f';
                        break;
                    case CharacterCodes.n:
                        result += '\n';
                        break;
                    case CharacterCodes.r:
                        result += '\r';
                        break;
                    case CharacterCodes.t:
                        result += '\t';
                        break;
                    case CharacterCodes.u:
                        var ch = scanHexDigits(4, true);
                        if (ch >= 0) {
                            result += String.fromCharCode(ch);
                        }
                        else {
                            scanError = ScanError.InvalidUnicode;
                        }
                        break;
                    default:
                        scanError = ScanError.InvalidEscapeCharacter;
                }
                start = pos;
                continue;
            }
            if (isLineBreak(ch)) {
                result += text.substring(start, pos);
                scanError = ScanError.UnexpectedEndOfString;
                break;
            }
            pos++;
        }
        return result;
    }
    function scanNext() {
        value = '';
        scanError = ScanError.None, tokenOffset = pos;
        if (pos >= len) {
            // at the end
            tokenOffset = len;
            return token = SyntaxKind.EOF;
        }
        var code = text.charCodeAt(pos);
        // trivia: whitespace and newlines
        if (isWhiteSpace(code) || isLineBreak(code)) {
            do {
                pos++;
                value += String.fromCharCode(code);
                code = text.charCodeAt(pos);
            } while (isWhiteSpace(code) || isLineBreak(code));
            return token = SyntaxKind.Trivia;
        }
        switch (code) {
            case CharacterCodes.openBrace:
                pos++;
                return token = SyntaxKind.OpenBraceToken;
            case CharacterCodes.closeBrace:
                pos++;
                return token = SyntaxKind.CloseBraceToken;
            case CharacterCodes.openBracket:
                pos++;
                return token = SyntaxKind.OpenBracketToken;
            case CharacterCodes.closeBracket:
                pos++;
                return token = SyntaxKind.CloseBracketToken;
            case CharacterCodes.colon:
                pos++;
                return token = SyntaxKind.ColonToken;
            case CharacterCodes.comma:
                pos++;
                return token = SyntaxKind.CommaToken;
            case CharacterCodes.doubleQuote:
                pos++;
                value = scanString();
                return token = SyntaxKind.StringLiteral;
            case CharacterCodes.slash:
                var start = pos - 1;
                // Single-line comment
                if (text.charCodeAt(pos + 1) === CharacterCodes.slash) {
                    pos += 2;
                    while (pos < len) {
                        if (isLineBreak(text.charCodeAt(pos))) {
                            break;
                        }
                        pos++;
                    }
                    value = text.substring(start, pos);
                    return token = SyntaxKind.LineCommentTrivia;
                }
                // Multi-line comment
                if (text.charCodeAt(pos + 1) === CharacterCodes.asterisk) {
                    pos += 2;
                    var safeLength = len - 1; // For lookahead.
                    var commentClosed = false;
                    while (pos < safeLength) {
                        var ch = text.charCodeAt(pos);
                        if (ch === CharacterCodes.asterisk && text.charCodeAt(pos + 1) === CharacterCodes.slash) {
                            pos += 2;
                            commentClosed = true;
                            break;
                        }
                        pos++;
                    }
                    if (!commentClosed) {
                        pos++;
                        scanError = ScanError.UnexpectedEndOfComment;
                    }
                    value = text.substring(start, pos);
                    return token = SyntaxKind.BlockCommentTrivia;
                }
                // just a single slash
                value += String.fromCharCode(code);
                pos++;
                return token = SyntaxKind.Unknown;
            case CharacterCodes.minus:
                value += String.fromCharCode(code);
                pos++;
                if (pos === len || !isDigit(text.charCodeAt(pos))) {
                    return token = SyntaxKind.Unknown;
                }
            case CharacterCodes._0:
            case CharacterCodes._1:
            case CharacterCodes._2:
            case CharacterCodes._3:
            case CharacterCodes._4:
            case CharacterCodes._5:
            case CharacterCodes._6:
            case CharacterCodes._7:
            case CharacterCodes._8:
            case CharacterCodes._9:
                value += scanNumber();
                return token = SyntaxKind.NumericLiteral;
            default:
                while (pos < len && isLetter(code)) {
                    pos++;
                    code = text.charCodeAt(pos);
                }
                if (tokenOffset !== pos) {
                    value = text.substring(tokenOffset, pos);
                    switch (value) {
                        case 'true': return token = SyntaxKind.TrueKeyword;
                        case 'false': return token = SyntaxKind.FalseKeyword;
                        case 'null': return token = SyntaxKind.NullKeyword;
                    }
                    return token = SyntaxKind.Unknown;
                }
                // some
                value += String.fromCharCode(code);
                pos++;
                return token = SyntaxKind.Unknown;
        }
    }
    function scanNextNonTrivia() {
        var result;
        do {
            result = scanNext();
        } while (result === SyntaxKind.Trivia || result === SyntaxKind.LineCommentTrivia || result === SyntaxKind.BlockCommentTrivia);
        return result;
    }
    return {
        getPosition: function () { return pos; },
        scan: ignoreTrivia ? scanNextNonTrivia : scanNext,
        getToken: function () { return token; },
        getTokenValue: function () { return value; },
        getTokenOffset: function () { return tokenOffset; },
        getTokenLength: function () { return pos - tokenOffset; },
        getTokenError: function () { return scanError; }
    };
}
exports.createScanner = createScanner;
function isWhiteSpace(ch) {
    return ch === CharacterCodes.space || ch === CharacterCodes.tab || ch === CharacterCodes.verticalTab || ch === CharacterCodes.formFeed || ch === CharacterCodes.nonBreakingSpace || ch === CharacterCodes.ogham || ch >= CharacterCodes.enQuad && ch <= CharacterCodes.zeroWidthSpace || ch === CharacterCodes.narrowNoBreakSpace || ch === CharacterCodes.mathematicalSpace || ch === CharacterCodes.ideographicSpace || ch === CharacterCodes.byteOrderMark;
}
function isLineBreak(ch) {
    return ch === CharacterCodes.lineFeed || ch === CharacterCodes.carriageReturn || ch === CharacterCodes.lineSeparator || ch === CharacterCodes.paragraphSeparator;
}
function isDigit(ch) {
    return ch >= CharacterCodes._0 && ch <= CharacterCodes._9;
}
function isLetter(ch) {
    return ch >= CharacterCodes.a && ch <= CharacterCodes.z || ch >= CharacterCodes.A && ch <= CharacterCodes.Z;
}
exports.isLetter = isLetter;
var CharacterCodes;
(function (CharacterCodes) {
    CharacterCodes[CharacterCodes["nullCharacter"] = 0] = "nullCharacter";
    CharacterCodes[CharacterCodes["maxAsciiCharacter"] = 0x7F] = "maxAsciiCharacter";
    CharacterCodes[CharacterCodes["lineFeed"] = 0x0A] = "lineFeed";
    CharacterCodes[CharacterCodes["carriageReturn"] = 0x0D] = "carriageReturn";
    CharacterCodes[CharacterCodes["lineSeparator"] = 0x2028] = "lineSeparator";
    CharacterCodes[CharacterCodes["paragraphSeparator"] = 0x2029] = "paragraphSeparator";
    // REVIEW: do we need to support this?  The scanner doesn't, but our IText does.  This seems 
    // like an odd disparity?  (Or maybe it's completely fine for them to be different).
    CharacterCodes[CharacterCodes["nextLine"] = 0x0085] = "nextLine";
    // Unicode 3.0 space characters
    CharacterCodes[CharacterCodes["space"] = 0x0020] = "space";
    CharacterCodes[CharacterCodes["nonBreakingSpace"] = 0x00A0] = "nonBreakingSpace";
    CharacterCodes[CharacterCodes["enQuad"] = 0x2000] = "enQuad";
    CharacterCodes[CharacterCodes["emQuad"] = 0x2001] = "emQuad";
    CharacterCodes[CharacterCodes["enSpace"] = 0x2002] = "enSpace";
    CharacterCodes[CharacterCodes["emSpace"] = 0x2003] = "emSpace";
    CharacterCodes[CharacterCodes["threePerEmSpace"] = 0x2004] = "threePerEmSpace";
    CharacterCodes[CharacterCodes["fourPerEmSpace"] = 0x2005] = "fourPerEmSpace";
    CharacterCodes[CharacterCodes["sixPerEmSpace"] = 0x2006] = "sixPerEmSpace";
    CharacterCodes[CharacterCodes["figureSpace"] = 0x2007] = "figureSpace";
    CharacterCodes[CharacterCodes["punctuationSpace"] = 0x2008] = "punctuationSpace";
    CharacterCodes[CharacterCodes["thinSpace"] = 0x2009] = "thinSpace";
    CharacterCodes[CharacterCodes["hairSpace"] = 0x200A] = "hairSpace";
    CharacterCodes[CharacterCodes["zeroWidthSpace"] = 0x200B] = "zeroWidthSpace";
    CharacterCodes[CharacterCodes["narrowNoBreakSpace"] = 0x202F] = "narrowNoBreakSpace";
    CharacterCodes[CharacterCodes["ideographicSpace"] = 0x3000] = "ideographicSpace";
    CharacterCodes[CharacterCodes["mathematicalSpace"] = 0x205F] = "mathematicalSpace";
    CharacterCodes[CharacterCodes["ogham"] = 0x1680] = "ogham";
    CharacterCodes[CharacterCodes["_"] = 0x5F] = "_";
    CharacterCodes[CharacterCodes["$"] = 0x24] = "$";
    CharacterCodes[CharacterCodes["_0"] = 0x30] = "_0";
    CharacterCodes[CharacterCodes["_1"] = 0x31] = "_1";
    CharacterCodes[CharacterCodes["_2"] = 0x32] = "_2";
    CharacterCodes[CharacterCodes["_3"] = 0x33] = "_3";
    CharacterCodes[CharacterCodes["_4"] = 0x34] = "_4";
    CharacterCodes[CharacterCodes["_5"] = 0x35] = "_5";
    CharacterCodes[CharacterCodes["_6"] = 0x36] = "_6";
    CharacterCodes[CharacterCodes["_7"] = 0x37] = "_7";
    CharacterCodes[CharacterCodes["_8"] = 0x38] = "_8";
    CharacterCodes[CharacterCodes["_9"] = 0x39] = "_9";
    CharacterCodes[CharacterCodes["a"] = 0x61] = "a";
    CharacterCodes[CharacterCodes["b"] = 0x62] = "b";
    CharacterCodes[CharacterCodes["c"] = 0x63] = "c";
    CharacterCodes[CharacterCodes["d"] = 0x64] = "d";
    CharacterCodes[CharacterCodes["e"] = 0x65] = "e";
    CharacterCodes[CharacterCodes["f"] = 0x66] = "f";
    CharacterCodes[CharacterCodes["g"] = 0x67] = "g";
    CharacterCodes[CharacterCodes["h"] = 0x68] = "h";
    CharacterCodes[CharacterCodes["i"] = 0x69] = "i";
    CharacterCodes[CharacterCodes["j"] = 0x6A] = "j";
    CharacterCodes[CharacterCodes["k"] = 0x6B] = "k";
    CharacterCodes[CharacterCodes["l"] = 0x6C] = "l";
    CharacterCodes[CharacterCodes["m"] = 0x6D] = "m";
    CharacterCodes[CharacterCodes["n"] = 0x6E] = "n";
    CharacterCodes[CharacterCodes["o"] = 0x6F] = "o";
    CharacterCodes[CharacterCodes["p"] = 0x70] = "p";
    CharacterCodes[CharacterCodes["q"] = 0x71] = "q";
    CharacterCodes[CharacterCodes["r"] = 0x72] = "r";
    CharacterCodes[CharacterCodes["s"] = 0x73] = "s";
    CharacterCodes[CharacterCodes["t"] = 0x74] = "t";
    CharacterCodes[CharacterCodes["u"] = 0x75] = "u";
    CharacterCodes[CharacterCodes["v"] = 0x76] = "v";
    CharacterCodes[CharacterCodes["w"] = 0x77] = "w";
    CharacterCodes[CharacterCodes["x"] = 0x78] = "x";
    CharacterCodes[CharacterCodes["y"] = 0x79] = "y";
    CharacterCodes[CharacterCodes["z"] = 0x7A] = "z";
    CharacterCodes[CharacterCodes["A"] = 0x41] = "A";
    CharacterCodes[CharacterCodes["B"] = 0x42] = "B";
    CharacterCodes[CharacterCodes["C"] = 0x43] = "C";
    CharacterCodes[CharacterCodes["D"] = 0x44] = "D";
    CharacterCodes[CharacterCodes["E"] = 0x45] = "E";
    CharacterCodes[CharacterCodes["F"] = 0x46] = "F";
    CharacterCodes[CharacterCodes["G"] = 0x47] = "G";
    CharacterCodes[CharacterCodes["H"] = 0x48] = "H";
    CharacterCodes[CharacterCodes["I"] = 0x49] = "I";
    CharacterCodes[CharacterCodes["J"] = 0x4A] = "J";
    CharacterCodes[CharacterCodes["K"] = 0x4B] = "K";
    CharacterCodes[CharacterCodes["L"] = 0x4C] = "L";
    CharacterCodes[CharacterCodes["M"] = 0x4D] = "M";
    CharacterCodes[CharacterCodes["N"] = 0x4E] = "N";
    CharacterCodes[CharacterCodes["O"] = 0x4F] = "O";
    CharacterCodes[CharacterCodes["P"] = 0x50] = "P";
    CharacterCodes[CharacterCodes["Q"] = 0x51] = "Q";
    CharacterCodes[CharacterCodes["R"] = 0x52] = "R";
    CharacterCodes[CharacterCodes["S"] = 0x53] = "S";
    CharacterCodes[CharacterCodes["T"] = 0x54] = "T";
    CharacterCodes[CharacterCodes["U"] = 0x55] = "U";
    CharacterCodes[CharacterCodes["V"] = 0x56] = "V";
    CharacterCodes[CharacterCodes["W"] = 0x57] = "W";
    CharacterCodes[CharacterCodes["X"] = 0x58] = "X";
    CharacterCodes[CharacterCodes["Y"] = 0x59] = "Y";
    CharacterCodes[CharacterCodes["Z"] = 0x5a] = "Z";
    CharacterCodes[CharacterCodes["ampersand"] = 0x26] = "ampersand";
    CharacterCodes[CharacterCodes["asterisk"] = 0x2A] = "asterisk";
    CharacterCodes[CharacterCodes["at"] = 0x40] = "at";
    CharacterCodes[CharacterCodes["backslash"] = 0x5C] = "backslash";
    CharacterCodes[CharacterCodes["bar"] = 0x7C] = "bar";
    CharacterCodes[CharacterCodes["caret"] = 0x5E] = "caret";
    CharacterCodes[CharacterCodes["closeBrace"] = 0x7D] = "closeBrace";
    CharacterCodes[CharacterCodes["closeBracket"] = 0x5D] = "closeBracket";
    CharacterCodes[CharacterCodes["closeParen"] = 0x29] = "closeParen";
    CharacterCodes[CharacterCodes["colon"] = 0x3A] = "colon";
    CharacterCodes[CharacterCodes["comma"] = 0x2C] = "comma";
    CharacterCodes[CharacterCodes["dot"] = 0x2E] = "dot";
    CharacterCodes[CharacterCodes["doubleQuote"] = 0x22] = "doubleQuote";
    CharacterCodes[CharacterCodes["equals"] = 0x3D] = "equals";
    CharacterCodes[CharacterCodes["exclamation"] = 0x21] = "exclamation";
    CharacterCodes[CharacterCodes["greaterThan"] = 0x3E] = "greaterThan";
    CharacterCodes[CharacterCodes["lessThan"] = 0x3C] = "lessThan";
    CharacterCodes[CharacterCodes["minus"] = 0x2D] = "minus";
    CharacterCodes[CharacterCodes["openBrace"] = 0x7B] = "openBrace";
    CharacterCodes[CharacterCodes["openBracket"] = 0x5B] = "openBracket";
    CharacterCodes[CharacterCodes["openParen"] = 0x28] = "openParen";
    CharacterCodes[CharacterCodes["percent"] = 0x25] = "percent";
    CharacterCodes[CharacterCodes["plus"] = 0x2B] = "plus";
    CharacterCodes[CharacterCodes["question"] = 0x3F] = "question";
    CharacterCodes[CharacterCodes["semicolon"] = 0x3B] = "semicolon";
    CharacterCodes[CharacterCodes["singleQuote"] = 0x27] = "singleQuote";
    CharacterCodes[CharacterCodes["slash"] = 0x2F] = "slash";
    CharacterCodes[CharacterCodes["tilde"] = 0x7E] = "tilde";
    CharacterCodes[CharacterCodes["backspace"] = 0x08] = "backspace";
    CharacterCodes[CharacterCodes["formFeed"] = 0x0C] = "formFeed";
    CharacterCodes[CharacterCodes["byteOrderMark"] = 0xFEFF] = "byteOrderMark";
    CharacterCodes[CharacterCodes["tab"] = 0x09] = "tab";
    CharacterCodes[CharacterCodes["verticalTab"] = 0x0B] = "verticalTab";
})(CharacterCodes || (CharacterCodes = {}));
/**
 * Takes JSON with JavaScript-style comments and remove
 * them. Optionally replaces every none-newline character
 * of comments with a replaceCharacter
 */
function stripComments(text, replaceCh) {
    var _scanner = createScanner(text), parts = [], kind, offset = 0, pos;
    do {
        pos = _scanner.getPosition();
        kind = _scanner.scan();
        switch (kind) {
            case SyntaxKind.LineCommentTrivia:
            case SyntaxKind.BlockCommentTrivia:
            case SyntaxKind.EOF:
                if (offset !== pos) {
                    parts.push(text.substring(offset, pos));
                }
                if (replaceCh !== void 0) {
                    parts.push(_scanner.getTokenValue().replace(/[^\r\n]/g, replaceCh));
                }
                offset = _scanner.getPosition();
                break;
        }
    } while (kind !== SyntaxKind.EOF);
    return parts.join('');
}
exports.stripComments = stripComments;
