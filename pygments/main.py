#!/usr/bin/env python

import sys
import pygments
from pygments.formatters import HtmlFormatter

from async import AsyncLexer

data = sys.stdin.read()
print pygments.highlight(data, AsyncLexer(), HtmlFormatter())