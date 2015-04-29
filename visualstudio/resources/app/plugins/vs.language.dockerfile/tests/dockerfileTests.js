/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/// <reference path="../../declares.d.ts" />
'use strict';
define(["require", "exports", '../dockerfileDef', 'monaco-testing'], function (require, exports, dockerfileDef, T) {
    var tokenize = T.createTokenize(dockerfileDef.language);
    var assertTokens = T.assertTokens;
    T.module('Docker Colorizer');
    T.test('All', function () {
        var previousState = null;
        // Line 1
        var src = 'FROM mono:3.12';
        var tokens = tokenize(src);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'keyword.dockerfile' },
            { startIndex: 4, type: '' }
        ]);
        // Line 2
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 3
        src = 'ENV KRE_FEED https://www.myget.org/F/aspnetvnext/api/v2';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'keyword.dockerfile' },
            { startIndex: 3, type: '' },
            { startIndex: 4, type: 'variable.dockerfile' },
            { startIndex: 12, type: '' }
        ]);
        // Line 4
        src = 'ENV KRE_USER_HOME /opt/kre';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'keyword.dockerfile' },
            { startIndex: 3, type: '' },
            { startIndex: 4, type: 'variable.dockerfile' },
            { startIndex: 17, type: '' }
        ]);
        // Line 5
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 6
        src = 'RUN apt-get -qq update && apt-get -qqy install unzip ';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'keyword.dockerfile' },
            { startIndex: 3, type: '' }
        ]);
        // Line 7
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 8
        src = 'ONBUILD RUN curl -sSL https://raw.githubusercontent.com/aspnet/Home/dev/kvminstall.sh | sh';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'keyword.dockerfile' },
            { startIndex: 7, type: '' },
            { startIndex: 8, type: 'keyword.dockerfile' },
            { startIndex: 11, type: '' }
        ]);
        // Line 9
        src = 'ONBUILD RUN bash -c "source $KRE_USER_HOME/kvm/kvm.sh \\';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'keyword.dockerfile' },
            { startIndex: 7, type: '' },
            { startIndex: 8, type: 'keyword.dockerfile' },
            { startIndex: 11, type: '' },
            { startIndex: 20, type: 'string.dockerfile' },
            { startIndex: 28, type: 'variable.dockerfile' },
            { startIndex: 42, type: 'string.dockerfile' }
        ]);
        // Line 10
        src = '    && kvm install latest -a default \\';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'string.dockerfile' }
        ]);
        // Line 11
        src = '    && kvm alias default | xargs -i ln -s $KRE_USER_HOME/packages/{} $KRE_USER_HOME/packages/default"';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'string.dockerfile' },
            { startIndex: 42, type: 'variable.dockerfile' },
            { startIndex: 56, type: 'string.dockerfile' },
            { startIndex: 69, type: 'variable.dockerfile' },
            { startIndex: 83, type: 'string.dockerfile' }
        ]);
        // Line 12
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 13
        src = '# Install libuv for Kestrel from source code (binary is not in wheezy and one in jessie is still too old)';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'comment.dockerfile' }
        ]);
        // Line 14
        src = 'RUN apt-get -qqy install \\';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'keyword.dockerfile' },
            { startIndex: 3, type: '' }
        ]);
        // Line 15
        src = '    autoconf \\';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '' }
        ]);
        // Line 16
        src = '    automake \\';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '' }
        ]);
        // Line 17
        src = '    build-essential \\';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '' }
        ]);
        // Line 18
        src = '    libtool ';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '' }
        ]);
        // Line 19
        src = 'RUN LIBUV_VERSION=1.0.0-rc2 \\';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'keyword.dockerfile' },
            { startIndex: 3, type: '' }
        ]);
        // Line 20
        src = '    && curl -sSL https://github.com/joyent/libuv/archive/v${LIBUV_VERSION}.tar.gz | tar zxfv - -C /usr/local/src \\';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '' },
            { startIndex: 58, type: 'variable.dockerfile' },
            { startIndex: 74, type: '' }
        ]);
        // Line 21
        src = '    && cd /usr/local/src/libuv-$LIBUV_VERSION \\';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '' },
            { startIndex: 31, type: 'variable.dockerfile' },
            { startIndex: 45, type: '' }
        ]);
        // Line 22
        src = '    && sh autogen.sh && ./configure && make && make install \\';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '' }
        ]);
        // Line 23
        src = '    && rm -rf /usr/local/src/libuv-$LIBUV_VERSION \\';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '' },
            { startIndex: 35, type: 'variable.dockerfile' },
            { startIndex: 49, type: '' }
        ]);
        // Line 24
        src = '    && ldconfig';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: '' }
        ]);
        // Line 25
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 26
        src = 'ENV PATH $PATH:$KRE_USER_HOME/packages/default/bin';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'keyword.dockerfile' },
            { startIndex: 3, type: '' },
            { startIndex: 4, type: 'variable.dockerfile' },
            { startIndex: 8, type: '' },
            { startIndex: 9, type: 'variable.dockerfile' },
            { startIndex: 14, type: '' },
            { startIndex: 15, type: 'variable.dockerfile' },
            { startIndex: 29, type: '' }
        ]);
        // Line 27
        src = '';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
        ]);
        // Line 28
        src = '# Extra things to test';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'comment.dockerfile' }
        ]);
        // Line 29
        src = 'RUN echo "string at end"';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'keyword.dockerfile' },
            { startIndex: 3, type: '' },
            { startIndex: 9, type: 'string.dockerfile' }
        ]);
        // Line 30
        src = 'RUN echo must work \'some str\' and some more';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'keyword.dockerfile' },
            { startIndex: 3, type: '' },
            { startIndex: 19, type: 'string.dockerfile' },
            { startIndex: 29, type: '' }
        ]);
        // Line 31
        src = 'RUN echo hi this is # not a comment';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'keyword.dockerfile' },
            { startIndex: 3, type: '' }
        ]);
        // Line 32
        src = 'RUN echo \'String with ${VAR} and another $one here\'';
        tokens = tokenize(src, previousState);
        previousState = tokens.endState;
        assertTokens(tokens.tokens, [
            { startIndex: 0, type: 'keyword.dockerfile' },
            { startIndex: 3, type: '' },
            { startIndex: 9, type: 'string.dockerfile' },
            { startIndex: 22, type: 'variable.dockerfile' },
            { startIndex: 28, type: 'string.dockerfile' },
            { startIndex: 41, type: 'variable.dockerfile' },
            { startIndex: 45, type: 'string.dockerfile' }
        ]);
    });
});
