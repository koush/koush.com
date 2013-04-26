#!/usr/bin/env python

import sys
import pygments
import pygments.lexers
from pygments.formatters import HtmlFormatter

from async import AsyncLexer

data = sys.stdin.read()

if sys.argv[1] == 'javascript':
    lexer = AsyncLexer()
else:
    lexer = pygments.lexers.get_lexer_by_name(sys.argv[1])

print pygments.highlight(data, lexer, HtmlFormatter())