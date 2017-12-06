"use babel";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PythonIndent = (function () {
    function PythonIndent() {
        _classCallCheck(this, PythonIndent);

        this.version = atom.getVersion().split(".").slice(0, 2).map(function (p) {
            return parseInt(p, 10);
        });
    }

    _createClass(PythonIndent, [{
        key: "indent",
        value: function indent() {
            this.editor = atom.workspace.getActiveTextEditor();

            // Make sure this is a Python file
            if (!this.editor || this.editor.getGrammar().scopeName.substring(0, 13) !== "source.python" || !this.editor.getSoftTabs()) {
                return;
            }

            // Get base variables
            var row = this.editor.getCursorBufferPosition().row;
            var col = this.editor.getCursorBufferPosition().column;

            // Parse the entire file up to the current point, keeping track of brackets
            var lines = this.editor.getTextInBufferRange([[0, 0], [row, col]]).split("\n");
            // At this point, the newline character has just been added,
            // so remove the last element of lines, which will be the empty line
            lines = lines.splice(0, lines.length - 1);

            var parseOutput = PythonIndent.parseLines(lines);
            // openBracketStack: A stack of [row, col] pairs describing where open brackets are
            // lastClosedRow: Either empty, or an array [rowOpen, rowClose] describing the rows
            //     where the last bracket to be closed was opened and closed.
            // shouldHang: Boolean, indicating whether or not a hanging indent is needed.
            // lastColonRow: The last row a def/for/if/elif/else/try/except etc. block started
            var openBracketStack = parseOutput.openBracketStack;
            var lastClosedRow = parseOutput.lastClosedRow;
            var shouldHang = parseOutput.shouldHang;
            var lastColonRow = parseOutput.lastColonRow;

            if (shouldHang) {
                this.indentHanging(row, this.editor.buffer.lineForRow(row - 1));
                return;
            }

            if (!(openBracketStack.length || lastClosedRow.length && openBracketStack)) {
                return;
            }

            if (!openBracketStack.length) {
                // Can assume lastClosedRow is not empty
                if (lastClosedRow[1] === row - 1) {
                    // We just closed a bracket on the row, get indentation from the
                    // row where it was opened
                    var indentLevel = this.editor.indentationForBufferRow(lastClosedRow[0]);

                    if (lastColonRow === row - 1) {
                        // We just finished def/for/if/elif/else/try/except etc. block,
                        // need to increase indent level by 1.
                        indentLevel += 1;
                    }
                    this.editor.setIndentationForBufferRow(row, indentLevel);
                }
                return;
            }

            // Get tab length for context
            var tabLength = this.editor.getTabLength();

            var lastOpenBracketLocations = openBracketStack.pop();

            // Get some booleans to help work through the cases

            // haveClosedBracket is true if we have ever closed a bracket
            var haveClosedBracket = lastClosedRow.length;
            // justOpenedBracket is true if we opened a bracket on the row we just finished
            var justOpenedBracket = lastOpenBracketLocations[0] === row - 1;
            // justClosedBracket is true if we closed a bracket on the row we just finished
            var justClosedBracket = haveClosedBracket && lastClosedRow[1] === row - 1;
            // closedBracketOpenedAfterLineWithCurrentOpen is an ***extremely*** long name, and
            // it is true if the most recently closed bracket pair was opened on
            // a line AFTER the line where the current open bracket
            var closedBracketOpenedAfterLineWithCurrentOpen = haveClosedBracket && lastClosedRow[0] > lastOpenBracketLocations[0];
            var indentColumn = undefined;

            if (!justOpenedBracket && !justClosedBracket) {
                // The bracket was opened before the previous line,
                // and we did not close a bracket on the previous line.
                // Thus, nothing has happened that could have changed the
                // indentation level since the previous line, so
                // we should use whatever indent we are given.
                return;
            } else if (justClosedBracket && closedBracketOpenedAfterLineWithCurrentOpen) {
                // A bracket that was opened after the most recent open
                // bracket was closed on the line we just finished typing.
                // We should use whatever indent was used on the row
                // where we opened the bracket we just closed. This needs
                // to be handled as a separate case from the last case below
                // in case the current bracket is using a hanging indent.
                // This handles cases such as
                // x = [0, 1, 2,
                //      [3, 4, 5,
                //       6, 7, 8],
                //      9, 10, 11]
                // which would be correctly handled by the case below, but it also correctly handles
                // x = [
                //     0, 1, 2, [3, 4, 5,
                //               6, 7, 8],
                //     9, 10, 11
                // ]
                // which the last case below would incorrectly indent an extra space
                // before the "9", because it would try to match it up with the
                // open bracket instead of using the hanging indent.
                var previousIndent = this.editor.indentationForBufferRow(lastClosedRow[0]);
                indentColumn = previousIndent * tabLength;
            } else {
                // lastOpenBracketLocations[1] is the column where the bracket was,
                // so need to bump up the indentation by one
                indentColumn = lastOpenBracketLocations[1] + 1;
            }

            // Calculate soft-tabs from spaces (can have remainder)
            var tabs = indentColumn / tabLength;
            var rem = (tabs - Math.floor(tabs)) * tabLength;

            // If there's a remainder, `@editor.buildIndentString` requires the tab to
            // be set past the desired indentation level, thus the ceiling.
            tabs = rem > 0 ? Math.ceil(tabs) : tabs;

            // Offset is the number of spaces to subtract from the soft-tabs if they
            // are past the desired indentation (not divisible by tab length).
            var offset = rem > 0 ? tabLength - rem : 0;

            // I'm glad Atom has an optional `column` param to subtract spaces from
            // soft-tabs, though I don't see it used anywhere in the core.
            // It looks like for hard tabs, the "tabs" input can be fractional and
            // the "column" input is ignored...?
            var indent = this.editor.buildIndentString(tabs, offset);

            // The range of text to replace with our indent
            // will need to change this for hard tabs, especially tricky for when
            // hard tabs have mixture of tabs + spaces, which they can judging from
            // the editor.buildIndentString function
            var startRange = [row, 0];
            var stopRange = [row, this.editor.indentationForBufferRow(row) * tabLength];
            this.editor.getBuffer().setTextInRange([startRange, stopRange], indent);
        }
    }, {
        key: "indentHanging",
        value: function indentHanging(row) {
            // Indent at the current block level plus the setting amount (1 or 2)
            var indent = this.editor.indentationForBufferRow(row) + atom.config.get("python-indent.hangingIndentTabs");

            // Use the old version of the "decreaseNextIndent" for Atom < 1.22
            if (this.version[0] === 1 && this.version[1] < 22) {
                // If the line where a newline was hit passes the DecreaseNextIndentPattern
                // regex, then Atom will automatically decrease the indent on the next line
                // but we don't actually want that since we're going to continue doing stuff
                // on the next line.
                var scope = this.editor.getRootScopeDescriptor();
                var decreaseIndentPattern = this.editor.getDecreaseNextIndentPattern(scope);
                var re = new RegExp(decreaseIndentPattern);

                if (re.test(this.editor.lineTextForBufferRow(row - 1))) {
                    indent += 1;
                    if (row + 1 <= this.editor.buffer.getLastRow()) {
                        // If row+1 is a valid row, then that will also have been
                        // dedented, so we need to fix that too.
                        this.editor.setIndentationForBufferRow(row + 1, this.editor.indentationForBufferRow(row + 1) + 1);
                    }
                }
                // Atom >= 1.22
            } else {
                    var re = this.editor.tokenizedBuffer.decreaseNextIndentRegexForScopeDescriptor(this.editor.getRootScopeDescriptor());

                    // If this is a "decrease next indent" line, then indent more
                    if (re.testSync(this.editor.lineTextForBufferRow(row - 1))) {
                        indent += 1;
                    }
                }

            // Set the indent
            this.editor.setIndentationForBufferRow(row, indent);
        }
    }], [{
        key: "parseLines",
        value: function parseLines(lines) {
            // openBracketStack is an array of [row, col] indicating the location
            // of the opening bracket (square, curly, or parentheses)
            var openBracketStack = [];
            // lastClosedRow is either empty or [rowOpen, rowClose] describing the
            // rows where the latest closed bracket was opened and closed.
            var lastClosedRow = [];
            // If we are in a string, this tells us what character introduced the string
            // i.e., did this string start with ' or with "?
            var stringDelimiter = null;
            // This is the row of the last function definition
            var lastColonRow = NaN;
            // true if we are in a triple quoted string
            var inTripleQuotedString = false;
            // If we have seen two of the same string delimiters in a row,
            // then we have to check the next character to see if it matches
            // in order to correctly parse triple quoted strings.
            var checkNextCharForString = false;
            // true if we should have a hanging indent, false otherwise
            var shouldHang = false;

            // NOTE: this parsing will only be correct if the python code is well-formed
            // statements like "[0, (1, 2])" might break the parsing

            // loop over each line
            var linesLength = lines.length;
            for (var row = 0; row < linesLength; row += 1) {
                var line = lines[row];

                // Keep track of the number of consecutive string delimiter's we've seen
                // in this line; this is used to tell if we are in a triple quoted string
                var numConsecutiveStringDelimiters = 0;
                // boolean, whether or not the current character is being escaped
                // applicable when we are currently in a string
                var isEscaped = false;

                // This is the last defined def/for/if/elif/else/try/except row
                var lastlastColonRow = lastColonRow;
                var lineLength = line.length;
                for (var col = 0; col < lineLength; col += 1) {
                    var c = line[col];

                    if (c === stringDelimiter && !isEscaped) {
                        numConsecutiveStringDelimiters += 1;
                    } else if (checkNextCharForString) {
                        numConsecutiveStringDelimiters = 0;
                        stringDelimiter = null;
                    } else {
                        numConsecutiveStringDelimiters = 0;
                    }

                    checkNextCharForString = false;

                    // If stringDelimiter is set, then we are in a string
                    // Note that this works correctly even for triple quoted strings
                    if (stringDelimiter) {
                        if (isEscaped) {
                            // If current character is escaped, then we do not care what it was,
                            // but since it is impossible for the next character to be escaped as well,
                            // go ahead and set that to false
                            isEscaped = false;
                        } else if (c === stringDelimiter) {
                            // We are seeing the same quote that started the string, i.e. ' or "
                            if (inTripleQuotedString) {
                                if (numConsecutiveStringDelimiters === 3) {
                                    // Breaking out of the triple quoted string...
                                    numConsecutiveStringDelimiters = 0;
                                    stringDelimiter = null;
                                    inTripleQuotedString = false;
                                }
                            } else if (numConsecutiveStringDelimiters === 3) {
                                // reset the count, correctly handles cases like ''''''
                                numConsecutiveStringDelimiters = 0;
                                inTripleQuotedString = true;
                            } else if (numConsecutiveStringDelimiters === 2) {
                                // We are not currently in a triple quoted string, and we've
                                // seen two of the same string delimiter in a row. This could
                                // either be an empty string, i.e. '' or "", or it could be
                                // the start of a triple quoted string. We will check the next
                                // character, and if it matches then we know we're in a triple
                                // quoted string, and if it does not match we know we're not
                                // in a string any more (i.e. it was the empty string).
                                checkNextCharForString = true;
                            } else if (numConsecutiveStringDelimiters === 1) {
                                // We are not in a string that is not triple quoted, and we've
                                // just seen an un-escaped instance of that string delimiter.
                                // In other words, we've left the string.
                                // It is also worth noting that it is impossible for
                                // numConsecutiveStringDelimiters to be 0 at this point, so
                                // this set of if/else if statements covers all cases.
                                stringDelimiter = null;
                            }
                        } else if (c === "\\") {
                            // We are seeing an unescaped backslash, the next character is escaped.
                            // Note that this is not exactly true in raw strings, HOWEVER, in raw
                            // strings you can still escape the quote mark by using a backslash.
                            // Since that's all we really care about as far as escaped characters
                            // go, we can assume we are now escaping the next character.
                            isEscaped = true;
                        }
                    } else if ("[({".includes(c)) {
                        openBracketStack.push([row, col]);
                        // If the only characters after this opening bracket are whitespace,
                        // then we should do a hanging indent. If there are other non-whitespace
                        // characters after this, then they will set the shouldHang boolean to false
                        shouldHang = true;
                    } else if (" \t\r\n".includes(c)) {// just in case there's a new line
                        // If it's whitespace, we don't care at all
                        // this check is necessary so we don't set shouldHang to false even if
                        // someone e.g. just entered a space between the opening bracket and the
                        // newline.
                    } else if (c === "#") {
                            // This check goes as well to make sure we don't set shouldHang
                            // to false in similar circumstances as described in the whitespace section.
                            break;
                        } else {
                            // We've already skipped if the character was white-space, an opening
                            // bracket, or a new line, so that means the current character is not
                            // whitespace and not an opening bracket, so shouldHang needs to get set to
                            // false.
                            shouldHang = false;

                            // Similar to above, we've already skipped all irrelevant characters,
                            // so if we saw a colon earlier in this line, then we would have
                            // incorrectly thought it was the end of a def/for/if/elif/else/try/except
                            // block when it was actually a dictionary being defined, reset the
                            // lastColonRow variable to whatever it was when we started parsing this
                            // line.
                            lastColonRow = lastlastColonRow;

                            if (c === ":") {
                                lastColonRow = row;
                            } else if ("})]".includes(c) && openBracketStack.length) {
                                // The .pop() will take the element off of the openBracketStack as it
                                // adds it to the array for lastClosedRow.
                                lastClosedRow = [openBracketStack.pop()[0], row];
                            } else if ("'\"".includes(c)) {
                                // Starting a string, keep track of what quote was used to start it.
                                stringDelimiter = c;
                                numConsecutiveStringDelimiters += 1;
                            }
                        }
                }
            }
            return { openBracketStack: openBracketStack, lastClosedRow: lastClosedRow, shouldHang: shouldHang, lastColonRow: lastColonRow };
        }
    }]);

    return PythonIndent;
})();

exports["default"] = PythonIndent;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vQzovVXNlcnMvc3RhcnQvLmF0b20vcGFja2FnZXMvcHl0aG9uLWluZGVudC9saWIvcHl0aG9uLWluZGVudC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUM7Ozs7Ozs7Ozs7SUFFUyxZQUFZO0FBQ2xCLGFBRE0sWUFBWSxHQUNmOzhCQURHLFlBQVk7O0FBRXpCLFlBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFBLENBQUM7bUJBQUksUUFBUSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7U0FBQSxDQUFDLENBQUM7S0FDckY7O2lCQUhnQixZQUFZOztlQUt2QixrQkFBRztBQUNMLGdCQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQW1CLEVBQUUsQ0FBQzs7O0FBR25ELGdCQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sSUFDWixJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxLQUFLLGVBQWUsSUFDdkUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxFQUFFO0FBQzVCLHVCQUFPO2FBQ1Y7OztBQUdELGdCQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLHVCQUF1QixFQUFFLENBQUMsR0FBRyxDQUFDO0FBQ3RELGdCQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLHVCQUF1QixFQUFFLENBQUMsTUFBTSxDQUFDOzs7QUFHekQsZ0JBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxH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QU0sRUFBRTs7O0FBR3JELDZDQUFhLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQzs2QkFDcEQsTUFBTSxJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUU7O0FBRTFCLCtDQUFlLEdBQUcsQ0FBQyxDQUFDO0FBQ3BCLDhEQUE4QixJQUFJLENBQUMsQ0FBQzs2QkFDdkM7eUJBQ0o7aUJBQ0o7YUFDSjtBQUNELG1CQUFPLEVBQUUsZ0JBQWdCLEVBQWhCLGdCQUFnQixFQUFFLGFBQWEsRUFBYixhQUFhLEVBQUUsVUFBVSxFQUFWLFVBQVUsRUFBRSxZQUFZLEVBQVosWUFBWSxFQUFFLENBQUM7U0FDeEU7OztXQS9SZ0IsWUFBWTs7O3FCQUFaLFlBQVkiLCJmaWxlIjoiZmlsZTovLy9DOi9Vc2Vycy9zdGFydC8uYXRvbS9wYWNrYWdlcy9weXRob24taW5kZW50L2xpYi9weXRob24taW5kZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2UgYmFiZWxcIjtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFB5dGhvbkluZGVudCB7XHJcbiAgICBjb25zdHJ1Y3RvcigpIHtcclxuICAgICAgICB0aGlzLnZlcnNpb24gPSBhdG9tLmdldFZlcnNpb24oKS5zcGxpdChcIi5cIikuc2xpY2UoMCwgMikubWFwKHAgPT4gcGFyc2VJbnQocCwgMTApKTtcclxuICAgIH1cclxuXHJcbiAgICBpbmRlbnQoKSB7XHJcbiAgICAgICAgdGhpcy5lZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XHJcblxyXG4gICAgICAgIC8vIE1ha2Ugc3VyZSB0aGlzIGlzIGEgUHl0aG9uIGZpbGVcclxuICAgICAgICBpZiAoIXRoaXMuZWRpdG9yIHx8XHJcbiAgICAgICAgICAgIHRoaXMuZWRpdG9yLmdldEdyYW1tYXIoKS5zY29wZU5hbWUuc3Vic3RyaW5nKDAsIDEzKSAhPT0gXCJzb3VyY2UucHl0aG9uXCIgfHxcclxuICAgICAgICAgICAgIXRoaXMuZWRpdG9yLmdldFNvZnRUYWJzKCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gR2V0IGJhc2UgdmFyaWFibGVzXHJcbiAgICAgICAgY29uc3Qgcm93ID0gdGhpcy5lZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKS5yb3c7XHJcbiAgICAgICAgY29uc3QgY29sID0gdGhpcy5lZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKS5jb2x1bW47XHJcblxyXG4gICAgICAgIC8vIFBhcnNlIHRoZSBlbnRpcmUgZmlsZSB1cCB0byB0aGUgY3VycmVudCBwb2ludCwga2VlcGluZyB0cmFjayBvZiBicmFja2V0c1xyXG4gICAgICAgIGxldCBsaW5lcyA9IHRoaXMuZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKFtbMCwgMF0sIFtyb3csIGNvbF1dKS5zcGxpdChcIlxcblwiKTtcclxuICAgICAgICAvLyBBdCB0aGlzIHBvaW50LCB0aGUgbmV3bGluZSBjaGFyYWN0ZXIgaGFzIGp1c3QgYmVlbiBhZGRlZCxcclxuICAgICAgICAvLyBzbyByZW1vdmUgdGhlIGxhc3QgZWxlbWVudCBvZiBsaW5lcywgd2hpY2ggd2lsbCBiZSB0aGUgZW1wdHkgbGluZVxyXG4gICAgICAgIGxpbmVzID0gbGluZXMuc3BsaWNlKDAsIGxpbmVzLmxlbmd0aCAtIDEpO1xyXG5cclxuICAgICAgICBjb25zdCBwYXJzZU91dHB1dCA9IFB5dGhvbkluZGVudC5wYXJzZUxpbmVzKGxpbmVzKTtcclxuICAgICAgICAvLyBvcGVuQnJhY2tldFN0YWNrOiBBIHN0YWNrIG9mIFtyb3csIGNvbF0gcGFpcnMgZGVzY3JpYmluZyB3aGVyZSBvcGVuIGJyYWNrZXRzIGFyZVxyXG4gICAgICAgIC8vIGxhc3RDbG9zZWRSb3c6IEVpdGhlciBlbXB0eSwgb3IgYW4gYXJyYXkgW3Jvd09wZW4sIHJvd0Nsb3NlXSBkZXNjcmliaW5nIHRoZSByb3dzXHJcbiAgICAgICAgLy8gICAgIHdoZXJlIHRoZSBsYXN0IGJyYWNrZXQgdG8gYmUgY2xvc2VkIHdhcyBvcGVuZWQgYW5kIGNsb3NlZC5cclxuICAgICAgICAvLyBzaG91bGRIYW5nOiBCb29sZWFuLCBpbmRpY2F0aW5nIHdoZXRoZXIgb3Igbm90IGEgaGFuZ2luZyBpbmRlbnQgaXMgbmVlZGVkLlxyXG4gICAgICAgIC8vIGxhc3RDb2xvblJvdzogVGhlIGxhc3Qgcm93IGEgZGVmL2Zvci9pZi9lbGlmL2Vsc2UvdHJ5L2V4Y2VwdCBldGMuIGJsb2NrIHN0YXJ0ZWRcclxuICAgICAgICBjb25zdCB7IG9wZW5CcmFja2V0U3RhY2ssIGxhc3RDbG9zZWRSb3csIHNob3VsZEhhbmcsIGxhc3RDb2xvblJvdyB9ID0gcGFyc2VPdXRwdXQ7XHJcblxyXG4gICAgICAgIGlmIChzaG91bGRIYW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5kZW50SGFuZ2luZyhyb3csIHRoaXMuZWRpdG9yLmJ1ZmZlci5saW5lRm9yUm93KHJvdyAtIDEpKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCEob3BlbkJyYWNrZXRTdGFjay5sZW5ndGggfHwgKGxhc3RDbG9zZWRSb3cubGVuZ3RoICYmIG9wZW5CcmFja2V0U3RhY2spKSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIW9wZW5CcmFja2V0U3RhY2subGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIC8vIENhbiBhc3N1bWUgbGFzdENsb3NlZFJvdyBpcyBub3QgZW1wdHlcclxuICAgICAgICAgICAgaWYgKGxhc3RDbG9zZWRSb3dbMV0gPT09IHJvdyAtIDEpIHtcclxuICAgICAgICAgICAgICAgIC8vIFdlIGp1c3QgY2xvc2VkIGEgYnJhY2tldCBvbiB0aGUgcm93LCBnZXQgaW5kZW50YXRpb24gZnJvbSB0aGVcclxuICAgICAgICAgICAgICAgIC8vIHJvdyB3aGVyZSBpdCB3YXMgb3BlbmVkXHJcbiAgICAgICAgICAgICAgICBsZXQgaW5kZW50TGV2ZWwgPSB0aGlzLmVkaXRvci5pbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhsYXN0Q2xvc2VkUm93WzBdKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAobGFzdENvbG9uUm93ID09PSByb3cgLSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gV2UganVzdCBmaW5pc2hlZCBkZWYvZm9yL2lmL2VsaWYvZWxzZS90cnkvZXhjZXB0IGV0Yy4gYmxvY2ssXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gbmVlZCB0byBpbmNyZWFzZSBpbmRlbnQgbGV2ZWwgYnkgMS5cclxuICAgICAgICAgICAgICAgICAgICBpbmRlbnRMZXZlbCArPSAxO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5lZGl0b3Iuc2V0SW5kZW50YXRpb25Gb3JCdWZmZXJSb3cocm93LCBpbmRlbnRMZXZlbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gR2V0IHRhYiBsZW5ndGggZm9yIGNvbnRleHRcclxuICAgICAgICBjb25zdCB0YWJMZW5ndGggPSB0aGlzLmVkaXRvci5nZXRUYWJMZW5ndGgoKTtcclxuXHJcbiAgICAgICAgY29uc3QgbGFzdE9wZW5CcmFja2V0TG9jYXRpb25zID0gb3BlbkJyYWNrZXRTdGFjay5wb3AoKTtcclxuXHJcbiAgICAgICAgLy8gR2V0IHNvbWUgYm9vbGVhbnMgdG8gaGVscCB3b3JrIHRocm91Z2ggdGhlIGNhc2VzXHJcblxyXG4gICAgICAgIC8vIGhhdmVDbG9zZWRCcmFja2V0IGlzIHRydWUgaWYgd2UgaGF2ZSBldmVyIGNsb3NlZCBhIGJyYWNrZXRcclxuICAgICAgICBjb25zdCBoYXZlQ2xvc2VkQnJhY2tldCA9IGxhc3RDbG9zZWRSb3cubGVuZ3RoO1xyXG4gICAgICAgIC8vIGp1c3RPcGVuZWRCcmFja2V0IGlzIHRydWUgaWYgd2Ugb3BlbmVkIGEgYnJhY2tldCBvbiB0aGUgcm93IHdlIGp1c3QgZmluaXNoZWRcclxuICAgICAgICBjb25zdCBqdXN0T3BlbmVkQnJhY2tldCA9IGxhc3RPcGVuQnJhY2tldExvY2F0aW9uc1swXSA9PT0gcm93IC0gMTtcclxuICAgICAgICAvLyBqdXN0Q2xvc2VkQnJhY2tldCBpcyB0cnVlIGlmIHdlIGNsb3NlZCBhIGJyYWNrZXQgb24gdGhlIHJvdyB3ZSBqdXN0IGZpbmlzaGVkXHJcbiAgICAgICAgY29uc3QganVzdENsb3NlZEJyYWNrZXQgPSBoYXZlQ2xvc2VkQnJhY2tldCAmJiBsYXN0Q2xvc2VkUm93WzFdID09PSByb3cgLSAxO1xyXG4gICAgICAgIC8vIGNsb3NlZEJyYWNrZXRPcGVuZWRBZnRlckxpbmVXaXRoQ3VycmVudE9wZW4gaXMgYW4gKioqZXh0cmVtZWx5KioqIGxvbmcgbmFtZSwgYW5kXHJcbiAgICAgICAgLy8gaXQgaXMgdHJ1ZSBpZiB0aGUgbW9zdCByZWNlbnRseSBjbG9zZWQgYnJhY2tldCBwYWlyIHdhcyBvcGVuZWQgb25cclxuICAgICAgICAvLyBhIGxpbmUgQUZURVIgdGhlIGxpbmUgd2hlcmUgdGhlIGN1cnJlbnQgb3BlbiBicmFja2V0XHJcbiAgICAgICAgY29uc3QgY2xvc2VkQnJhY2tldE9wZW5lZEFmdGVyTGluZVdpdGhDdXJyZW50T3BlbiA9IGhhdmVDbG9zZWRCcmFja2V0ICYmXHJcbiAgICAgICAgICAgIGxhc3RDbG9zZWRSb3dbMF0gPiBsYXN0T3BlbkJyYWNrZXRMb2NhdGlvbnNbMF07XHJcbiAgICAgICAgbGV0IGluZGVudENvbHVtbjtcclxuXHJcbiAgICAgICAgaWYgKCFqdXN0T3BlbmVkQnJhY2tldCAmJiAhanVzdENsb3NlZEJyYWNrZXQpIHtcclxuICAgICAgICAgICAgLy8gVGhlIGJyYWNrZXQgd2FzIG9wZW5lZCBiZWZvcmUgdGhlIHByZXZpb3VzIGxpbmUsXHJcbiAgICAgICAgICAgIC8vIGFuZCB3ZSBkaWQgbm90IGNsb3NlIGEgYnJhY2tldCBvbiB0aGUgcHJldmlvdXMgbGluZS5cclxuICAgICAgICAgICAgLy8gVGh1cywgbm90aGluZyBoYXMgaGFwcGVuZWQgdGhhdCBjb3VsZCBoYXZlIGNoYW5nZWQgdGhlXHJcbiAgICAgICAgICAgIC8vIGluZGVudGF0aW9uIGxldmVsIHNpbmNlIHRoZSBwcmV2aW91cyBsaW5lLCBzb1xyXG4gICAgICAgICAgICAvLyB3ZSBzaG91bGQgdXNlIHdoYXRldmVyIGluZGVudCB3ZSBhcmUgZ2l2ZW4uXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9IGVsc2UgaWYgKGp1c3RDbG9zZWRCcmFja2V0ICYmIGNsb3NlZEJyYWNrZXRPcGVuZWRBZnRlckxpbmVXaXRoQ3VycmVudE9wZW4pIHtcclxuICAgICAgICAgICAgLy8gQSBicmFja2V0IHRoYXQgd2FzIG9wZW5lZCBhZnRlciB0aGUgbW9zdCByZWNlbnQgb3BlblxyXG4gICAgICAgICAgICAvLyBicmFja2V0IHdhcyBjbG9zZWQgb24gdGhlIGxpbmUgd2UganVzdCBmaW5pc2hlZCB0eXBpbmcuXHJcbiAgICAgICAgICAgIC8vIFdlIHNob3VsZCB1c2Ugd2hhdGV2ZXIgaW5kZW50IHdhcyB1c2VkIG9uIHRoZSByb3dcclxuICAgICAgICAgICAgLy8gd2hlcmUgd2Ugb3BlbmVkIHRoZSBicmFja2V0IHdlIGp1c3QgY2xvc2VkLiBUaGlzIG5lZWRzXHJcbiAgICAgICAgICAgIC8vIHRvIGJlIGhhbmRsZWQgYXMgYSBzZXBhcmF0ZSBjYXNlIGZyb20gdGhlIGxhc3QgY2FzZSBiZWxvd1xyXG4gICAgICAgICAgICAvLyBpbiBjYXNlIHRoZSBjdXJyZW50IGJyYWNrZXQgaXMgdXNpbmcgYSBoYW5naW5nIGluZGVudC5cclxuICAgICAgICAgICAgLy8gVGhpcyBoYW5kbGVzIGNhc2VzIHN1Y2ggYXNcclxuICAgICAgICAgICAgLy8geCA9IFswLCAxLCAyLFxyXG4gICAgICAgICAgICAvLyAgICAgIFszLCA0LCA1LFxyXG4gICAgICAgICAgICAvLyAgICAgICA2LCA3LCA4XSxcclxuICAgICAgICAgICAgLy8gICAgICA5LCAxMCwgMTFdXHJcbiAgICAgICAgICAgIC8vIHdoaWNoIHdvdWxkIGJlIGNvcnJlY3RseSBoYW5kbGVkIGJ5IHRoZSBjYXNlIGJlbG93LCBidXQgaXQgYWxzbyBjb3JyZWN0bHkgaGFuZGxlc1xyXG4gICAgICAgICAgICAvLyB4ID0gW1xyXG4gICAgICAgICAgICAvLyAgICAgMCwgMSwgMiwgWzMsIDQsIDUsXHJcbiAgICAgICAgICAgIC8vICAgICAgICAgICAgICAgNiwgNywgOF0sXHJcbiAgICAgICAgICAgIC8vICAgICA5LCAxMCwgMTFcclxuICAgICAgICAgICAgLy8gXVxyXG4gICAgICAgICAgICAvLyB3aGljaCB0aGUgbGFzdCBjYXNlIGJlbG93IHdvdWxkIGluY29ycmVjdGx5IGluZGVudCBhbiBleHRyYSBzcGFjZVxyXG4gICAgICAgICAgICAvLyBiZWZvcmUgdGhlIFwiOVwiLCBiZWNhdXNlIGl0IHdvdWxkIHRyeSB0byBtYXRjaCBpdCB1cCB3aXRoIHRoZVxyXG4gICAgICAgICAgICAvLyBvcGVuIGJyYWNrZXQgaW5zdGVhZCBvZiB1c2luZyB0aGUgaGFuZ2luZyBpbmRlbnQuXHJcbiAgICAgICAgICAgIGNvbnN0IHByZXZpb3VzSW5kZW50ID0gdGhpcy5lZGl0b3IuaW5kZW50YXRpb25Gb3JCdWZmZXJSb3cobGFzdENsb3NlZFJvd1swXSk7XHJcbiAgICAgICAgICAgIGluZGVudENvbHVtbiA9IHByZXZpb3VzSW5kZW50ICogdGFiTGVuZ3RoO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIGxhc3RPcGVuQnJhY2tldExvY2F0aW9uc1sxXSBpcyB0aGUgY29sdW1uIHdoZXJlIHRoZSBicmFja2V0IHdhcyxcclxuICAgICAgICAgICAgLy8gc28gbmVlZCB0byBidW1wIHVwIHRoZSBpbmRlbnRhdGlvbiBieSBvbmVcclxuICAgICAgICAgICAgaW5kZW50Q29sdW1uID0gbGFzdE9wZW5CcmFja2V0TG9jYXRpb25zWzFdICsgMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIENhbGN1bGF0ZSBzb2Z0LXRhYnMgZnJvbSBzcGFjZXMgKGNhbiBoYXZlIHJlbWFpbmRlcilcclxuICAgICAgICBsZXQgdGFicyA9IGluZGVudENvbHVtbiAvIHRhYkxlbmd0aDtcclxuICAgICAgICBjb25zdCByZW0gPSAodGFicyAtIE1hdGguZmxvb3IodGFicykpICogdGFiTGVuZ3RoO1xyXG5cclxuICAgICAgICAvLyBJZiB0aGVyZSdzIGEgcmVtYWluZGVyLCBgQGVkaXRvci5idWlsZEluZGVudFN0cmluZ2AgcmVxdWlyZXMgdGhlIHRhYiB0b1xyXG4gICAgICAgIC8vIGJlIHNldCBwYXN0IHRoZSBkZXNpcmVkIGluZGVudGF0aW9uIGxldmVsLCB0aHVzIHRoZSBjZWlsaW5nLlxyXG4gICAgICAgIHRhYnMgPSByZW0gPiAwID8gTWF0aC5jZWlsKHRhYnMpIDogdGFicztcclxuXHJcbiAgICAgICAgLy8gT2Zmc2V0IGlzIHRoZSBudW1iZXIgb2Ygc3BhY2VzIHRvIHN1YnRyYWN0IGZyb20gdGhlIHNvZnQtdGFicyBpZiB0aGV5XHJcbiAgICAgICAgLy8gYXJlIHBhc3QgdGhlIGRlc2lyZWQgaW5kZW50YXRpb24gKG5vdCBkaXZpc2libGUgYnkgdGFiIGxlbmd0aCkuXHJcbiAgICAgICAgY29uc3Qgb2Zmc2V0ID0gcmVtID4gMCA/IHRhYkxlbmd0aCAtIHJlbSA6IDA7XHJcblxyXG4gICAgICAgIC8vIEknbSBnbGFkIEF0b20gaGFzIGFuIG9wdGlvbmFsIGBjb2x1bW5gIHBhcmFtIHRvIHN1YnRyYWN0IHNwYWNlcyBmcm9tXHJcbiAgICAgICAgLy8gc29mdC10YWJzLCB0aG91Z2ggSSBkb24ndCBzZWUgaXQgdXNlZCBhbnl3aGVyZSBpbiB0aGUgY29yZS5cclxuICAgICAgICAvLyBJdCBsb29rcyBsaWtlIGZvciBoYXJkIHRhYnMsIHRoZSBcInRhYnNcIiBpbnB1dCBjYW4gYmUgZnJhY3Rpb25hbCBhbmRcclxuICAgICAgICAvLyB0aGUgXCJjb2x1bW5cIiBpbnB1dCBpcyBpZ25vcmVkLi4uP1xyXG4gICAgICAgIGNvbnN0IGluZGVudCA9IHRoaXMuZWRpdG9yLmJ1aWxkSW5kZW50U3RyaW5nKHRhYnMsIG9mZnNldCk7XHJcblxyXG4gICAgICAgIC8vIFRoZSByYW5nZSBvZiB0ZXh0IHRvIHJlcGxhY2Ugd2l0aCBvdXIgaW5kZW50XHJcbiAgICAgICAgLy8gd2lsbCBuZWVkIHRvIGNoYW5nZSB0aGlzIGZvciBoYXJkIHRhYnMsIGVzcGVjaWFsbHkgdHJpY2t5IGZvciB3aGVuXHJcbiAgICAgICAgLy8gaGFyZCB0YWJzIGhhdmUgbWl4dHVyZSBvZiB0YWJzICsgc3BhY2VzLCB3aGljaCB0aGV5IGNhbiBqdWRnaW5nIGZyb21cclxuICAgICAgICAvLyB0aGUgZWRpdG9yLmJ1aWxkSW5kZW50U3RyaW5nIGZ1bmN0aW9uXHJcbiAgICAgICAgY29uc3Qgc3RhcnRSYW5nZSA9IFtyb3csIDBdO1xyXG4gICAgICAgIGNvbnN0IHN0b3BSYW5nZSA9IFtyb3csIHRoaXMuZWRpdG9yLmluZGVudGF0aW9uRm9yQnVmZmVyUm93KHJvdykgKiB0YWJMZW5ndGhdO1xyXG4gICAgICAgIHRoaXMuZWRpdG9yLmdldEJ1ZmZlcigpLnNldFRleHRJblJhbmdlKFtzdGFydFJhbmdlLCBzdG9wUmFuZ2VdLCBpbmRlbnQpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBwYXJzZUxpbmVzKGxpbmVzKSB7XHJcbiAgICAgICAgLy8gb3BlbkJyYWNrZXRTdGFjayBpcyBhbiBhcnJheSBvZiBbcm93LCBjb2xdIGluZGljYXRpbmcgdGhlIGxvY2F0aW9uXHJcbiAgICAgICAgLy8gb2YgdGhlIG9wZW5pbmcgYnJhY2tldCAoc3F1YXJlLCBjdXJseSwgb3IgcGFyZW50aGVzZXMpXHJcbiAgICAgICAgY29uc3Qgb3BlbkJyYWNrZXRTdGFjayA9IFtdO1xyXG4gICAgICAgIC8vIGxhc3RDbG9zZWRSb3cgaXMgZWl0aGVyIGVtcHR5IG9yIFtyb3dPcGVuLCByb3dDbG9zZV0gZGVzY3JpYmluZyB0aGVcclxuICAgICAgICAvLyByb3dzIHdoZXJlIHRoZSBsYXRlc3QgY2xvc2VkIGJyYWNrZXQgd2FzIG9wZW5lZCBhbmQgY2xvc2VkLlxyXG4gICAgICAgIGxldCBsYXN0Q2xvc2VkUm93ID0gW107XHJcbiAgICAgICAgLy8gSWYgd2UgYXJlIGluIGEgc3RyaW5nLCB0aGlzIHRlbGxzIHVzIHdoYXQgY2hhcmFjdGVyIGludHJvZHVjZWQgdGhlIHN0cmluZ1xyXG4gICAgICAgIC8vIGkuZS4sIGRpZCB0aGlzIHN0cmluZyBzdGFydCB3aXRoICcgb3Igd2l0aCBcIj9cclxuICAgICAgICBsZXQgc3RyaW5nRGVsaW1pdGVyID0gbnVsbDtcclxuICAgICAgICAvLyBUaGlzIGlzIHRoZSByb3cgb2YgdGhlIGxhc3QgZnVuY3Rpb24gZGVmaW5pdGlvblxyXG4gICAgICAgIGxldCBsYXN0Q29sb25Sb3cgPSBOYU47XHJcbiAgICAgICAgLy8gdHJ1ZSBpZiB3ZSBhcmUgaW4gYSB0cmlwbGUgcXVvdGVkIHN0cmluZ1xyXG4gICAgICAgIGxldCBpblRyaXBsZVF1b3RlZFN0cmluZyA9IGZhbHNlO1xyXG4gICAgICAgIC8vIElmIHdlIGhhdmUgc2VlbiB0d28gb2YgdGhlIHNhbWUgc3RyaW5nIGRlbGltaXRlcnMgaW4gYSByb3csXHJcbiAgICAgICAgLy8gdGhlbiB3ZSBoYXZlIHRvIGNoZWNrIHRoZSBuZXh0IGNoYXJhY3RlciB0byBzZWUgaWYgaXQgbWF0Y2hlc1xyXG4gICAgICAgIC8vIGluIG9yZGVyIHRvIGNvcnJlY3RseSBwYXJzZSB0cmlwbGUgcXVvdGVkIHN0cmluZ3MuXHJcbiAgICAgICAgbGV0IGNoZWNrTmV4dENoYXJGb3JTdHJpbmcgPSBmYWxzZTtcclxuICAgICAgICAvLyB0cnVlIGlmIHdlIHNob3VsZCBoYXZlIGEgaGFuZ2luZyBpbmRlbnQsIGZhbHNlIG90aGVyd2lzZVxyXG4gICAgICAgIGxldCBzaG91bGRIYW5nID0gZmFsc2U7XHJcblxyXG4gICAgICAgIC8vIE5PVEU6IHRoaXMgcGFyc2luZyB3aWxsIG9ubHkgYmUgY29ycmVjdCBpZiB0aGUgcHl0aG9uIGNvZGUgaXMgd2VsbC1mb3JtZWRcclxuICAgICAgICAvLyBzdGF0ZW1lbnRzIGxpa2UgXCJbMCwgKDEsIDJdKVwiIG1pZ2h0IGJyZWFrIHRoZSBwYXJzaW5nXHJcblxyXG4gICAgICAgIC8vIGxvb3Agb3ZlciBlYWNoIGxpbmVcclxuICAgICAgICBjb25zdCBsaW5lc0xlbmd0aCA9IGxpbmVzLmxlbmd0aDtcclxuICAgICAgICBmb3IgKGxldCByb3cgPSAwOyByb3cgPCBsaW5lc0xlbmd0aDsgcm93ICs9IDEpIHtcclxuICAgICAgICAgICAgY29uc3QgbGluZSA9IGxpbmVzW3Jvd107XHJcblxyXG4gICAgICAgICAgICAvLyBLZWVwIHRyYWNrIG9mIHRoZSBudW1iZXIgb2YgY29uc2VjdXRpdmUgc3RyaW5nIGRlbGltaXRlcidzIHdlJ3ZlIHNlZW5cclxuICAgICAgICAgICAgLy8gaW4gdGhpcyBsaW5lOyB0aGlzIGlzIHVzZWQgdG8gdGVsbCBpZiB3ZSBhcmUgaW4gYSB0cmlwbGUgcXVvdGVkIHN0cmluZ1xyXG4gICAgICAgICAgICBsZXQgbnVtQ29uc2VjdXRpdmVTdHJpbmdEZWxpbWl0ZXJzID0gMDtcclxuICAgICAgICAgICAgLy8gYm9vbGVhbiwgd2hldGhlciBvciBub3QgdGhlIGN1cnJlbnQgY2hhcmFjdGVyIGlzIGJlaW5nIGVzY2FwZWRcclxuICAgICAgICAgICAgLy8gYXBwbGljYWJsZSB3aGVuIHdlIGFyZSBjdXJyZW50bHkgaW4gYSBzdHJpbmdcclxuICAgICAgICAgICAgbGV0IGlzRXNjYXBlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgLy8gVGhpcyBpcyB0aGUgbGFzdCBkZWZpbmVkIGRlZi9mb3IvaWYvZWxpZi9lbHNlL3RyeS9leGNlcHQgcm93XHJcbiAgICAgICAgICAgIGNvbnN0IGxhc3RsYXN0Q29sb25Sb3cgPSBsYXN0Q29sb25Sb3c7XHJcbiAgICAgICAgICAgIGNvbnN0IGxpbmVMZW5ndGggPSBsaW5lLmxlbmd0aDtcclxuICAgICAgICAgICAgZm9yIChsZXQgY29sID0gMDsgY29sIDwgbGluZUxlbmd0aDsgY29sICs9IDEpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGMgPSBsaW5lW2NvbF07XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGMgPT09IHN0cmluZ0RlbGltaXRlciAmJiAhaXNFc2NhcGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbnVtQ29uc2VjdXRpdmVTdHJpbmdEZWxpbWl0ZXJzICs9IDE7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNoZWNrTmV4dENoYXJGb3JTdHJpbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICBudW1Db25zZWN1dGl2ZVN0cmluZ0RlbGltaXRlcnMgPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgIHN0cmluZ0RlbGltaXRlciA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIG51bUNvbnNlY3V0aXZlU3RyaW5nRGVsaW1pdGVycyA9IDA7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgY2hlY2tOZXh0Q2hhckZvclN0cmluZyA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIElmIHN0cmluZ0RlbGltaXRlciBpcyBzZXQsIHRoZW4gd2UgYXJlIGluIGEgc3RyaW5nXHJcbiAgICAgICAgICAgICAgICAvLyBOb3RlIHRoYXQgdGhpcyB3b3JrcyBjb3JyZWN0bHkgZXZlbiBmb3IgdHJpcGxlIHF1b3RlZCBzdHJpbmdzXHJcbiAgICAgICAgICAgICAgICBpZiAoc3RyaW5nRGVsaW1pdGVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzRXNjYXBlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiBjdXJyZW50IGNoYXJhY3RlciBpcyBlc2NhcGVkLCB0aGVuIHdlIGRvIG5vdCBjYXJlIHdoYXQgaXQgd2FzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBidXQgc2luY2UgaXQgaXMgaW1wb3NzaWJsZSBmb3IgdGhlIG5leHQgY2hhcmFjdGVyIHRvIGJlIGVzY2FwZWQgYXMgd2VsbCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZ28gYWhlYWQgYW5kIHNldCB0aGF0IHRvIGZhbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzRXNjYXBlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoYyA9PT0gc3RyaW5nRGVsaW1pdGVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdlIGFyZSBzZWVpbmcgdGhlIHNhbWUgcXVvdGUgdGhhdCBzdGFydGVkIHRoZSBzdHJpbmcsIGkuZS4gJyBvciBcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5UcmlwbGVRdW90ZWRTdHJpbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChudW1Db25zZWN1dGl2ZVN0cmluZ0RlbGltaXRlcnMgPT09IDMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBCcmVha2luZyBvdXQgb2YgdGhlIHRyaXBsZSBxdW90ZWQgc3RyaW5nLi4uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVtQ29uc2VjdXRpdmVTdHJpbmdEZWxpbWl0ZXJzID0gMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHJpbmdEZWxpbWl0ZXIgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluVHJpcGxlUXVvdGVkU3RyaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobnVtQ29uc2VjdXRpdmVTdHJpbmdEZWxpbWl0ZXJzID09PSAzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyByZXNldCB0aGUgY291bnQsIGNvcnJlY3RseSBoYW5kbGVzIGNhc2VzIGxpa2UgJycnJycnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBudW1Db25zZWN1dGl2ZVN0cmluZ0RlbGltaXRlcnMgPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5UcmlwbGVRdW90ZWRTdHJpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG51bUNvbnNlY3V0aXZlU3RyaW5nRGVsaW1pdGVycyA9PT0gMikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gV2UgYXJlIG5vdCBjdXJyZW50bHkgaW4gYSB0cmlwbGUgcXVvdGVkIHN0cmluZywgYW5kIHdlJ3ZlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBzZWVuIHR3byBvZiB0aGUgc2FtZSBzdHJpbmcgZGVsaW1pdGVyIGluIGEgcm93LiBUaGlzIGNvdWxkXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBlaXRoZXIgYmUgYW4gZW1wdHkgc3RyaW5nLCBpLmUuICcnIG9yIFwiXCIsIG9yIGl0IGNvdWxkIGJlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGUgc3RhcnQgb2YgYSB0cmlwbGUgcXVvdGVkIHN0cmluZy4gV2Ugd2lsbCBjaGVjayB0aGUgbmV4dFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2hhcmFjdGVyLCBhbmQgaWYgaXQgbWF0Y2hlcyB0aGVuIHdlIGtub3cgd2UncmUgaW4gYSB0cmlwbGVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHF1b3RlZCBzdHJpbmcsIGFuZCBpZiBpdCBkb2VzIG5vdCBtYXRjaCB3ZSBrbm93IHdlJ3JlIG5vdFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaW4gYSBzdHJpbmcgYW55IG1vcmUgKGkuZS4gaXQgd2FzIHRoZSBlbXB0eSBzdHJpbmcpLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tOZXh0Q2hhckZvclN0cmluZyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobnVtQ29uc2VjdXRpdmVTdHJpbmdEZWxpbWl0ZXJzID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBXZSBhcmUgbm90IGluIGEgc3RyaW5nIHRoYXQgaXMgbm90IHRyaXBsZSBxdW90ZWQsIGFuZCB3ZSd2ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8ganVzdCBzZWVuIGFuIHVuLWVzY2FwZWQgaW5zdGFuY2Ugb2YgdGhhdCBzdHJpbmcgZGVsaW1pdGVyLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSW4gb3RoZXIgd29yZHMsIHdlJ3ZlIGxlZnQgdGhlIHN0cmluZy5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEl0IGlzIGFsc28gd29ydGggbm90aW5nIHRoYXQgaXQgaXMgaW1wb3NzaWJsZSBmb3JcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG51bUNvbnNlY3V0aXZlU3RyaW5nRGVsaW1pdGVycyB0byBiZSAwIGF0IHRoaXMgcG9pbnQsIHNvXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGlzIHNldCBvZiBpZi9lbHNlIGlmIHN0YXRlbWVudHMgY292ZXJzIGFsbCBjYXNlcy5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0cmluZ0RlbGltaXRlciA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGMgPT09IFwiXFxcXFwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdlIGFyZSBzZWVpbmcgYW4gdW5lc2NhcGVkIGJhY2tzbGFzaCwgdGhlIG5leHQgY2hhcmFjdGVyIGlzIGVzY2FwZWQuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5vdGUgdGhhdCB0aGlzIGlzIG5vdCBleGFjdGx5IHRydWUgaW4gcmF3IHN0cmluZ3MsIEhPV0VWRVIsIGluIHJhd1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzdHJpbmdzIHlvdSBjYW4gc3RpbGwgZXNjYXBlIHRoZSBxdW90ZSBtYXJrIGJ5IHVzaW5nIGEgYmFja3NsYXNoLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBTaW5jZSB0aGF0J3MgYWxsIHdlIHJlYWxseSBjYXJlIGFib3V0IGFzIGZhciBhcyBlc2NhcGVkIGNoYXJhY3RlcnNcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZ28sIHdlIGNhbiBhc3N1bWUgd2UgYXJlIG5vdyBlc2NhcGluZyB0aGUgbmV4dCBjaGFyYWN0ZXIuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzRXNjYXBlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChcIlsoe1wiLmluY2x1ZGVzKGMpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb3BlbkJyYWNrZXRTdGFjay5wdXNoKFtyb3csIGNvbF0pO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHRoZSBvbmx5IGNoYXJhY3RlcnMgYWZ0ZXIgdGhpcyBvcGVuaW5nIGJyYWNrZXQgYXJlIHdoaXRlc3BhY2UsXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gdGhlbiB3ZSBzaG91bGQgZG8gYSBoYW5naW5nIGluZGVudC4gSWYgdGhlcmUgYXJlIG90aGVyIG5vbi13aGl0ZXNwYWNlXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gY2hhcmFjdGVycyBhZnRlciB0aGlzLCB0aGVuIHRoZXkgd2lsbCBzZXQgdGhlIHNob3VsZEhhbmcgYm9vbGVhbiB0byBmYWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIHNob3VsZEhhbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChcIiBcXHRcXHJcXG5cIi5pbmNsdWRlcyhjKSkgeyAvLyBqdXN0IGluIGNhc2UgdGhlcmUncyBhIG5ldyBsaW5lXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgaXQncyB3aGl0ZXNwYWNlLCB3ZSBkb24ndCBjYXJlIGF0IGFsbFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIHRoaXMgY2hlY2sgaXMgbmVjZXNzYXJ5IHNvIHdlIGRvbid0IHNldCBzaG91bGRIYW5nIHRvIGZhbHNlIGV2ZW4gaWZcclxuICAgICAgICAgICAgICAgICAgICAvLyBzb21lb25lIGUuZy4ganVzdCBlbnRlcmVkIGEgc3BhY2UgYmV0d2VlbiB0aGUgb3BlbmluZyBicmFja2V0IGFuZCB0aGVcclxuICAgICAgICAgICAgICAgICAgICAvLyBuZXdsaW5lLlxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjID09PSBcIiNcIikge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIFRoaXMgY2hlY2sgZ29lcyBhcyB3ZWxsIHRvIG1ha2Ugc3VyZSB3ZSBkb24ndCBzZXQgc2hvdWxkSGFuZ1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIHRvIGZhbHNlIGluIHNpbWlsYXIgY2lyY3Vtc3RhbmNlcyBhcyBkZXNjcmliZWQgaW4gdGhlIHdoaXRlc3BhY2Ugc2VjdGlvbi5cclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gV2UndmUgYWxyZWFkeSBza2lwcGVkIGlmIHRoZSBjaGFyYWN0ZXIgd2FzIHdoaXRlLXNwYWNlLCBhbiBvcGVuaW5nXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gYnJhY2tldCwgb3IgYSBuZXcgbGluZSwgc28gdGhhdCBtZWFucyB0aGUgY3VycmVudCBjaGFyYWN0ZXIgaXMgbm90XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gd2hpdGVzcGFjZSBhbmQgbm90IGFuIG9wZW5pbmcgYnJhY2tldCwgc28gc2hvdWxkSGFuZyBuZWVkcyB0byBnZXQgc2V0IHRvXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gZmFsc2UuXHJcbiAgICAgICAgICAgICAgICAgICAgc2hvdWxkSGFuZyA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBTaW1pbGFyIHRvIGFib3ZlLCB3ZSd2ZSBhbHJlYWR5IHNraXBwZWQgYWxsIGlycmVsZXZhbnQgY2hhcmFjdGVycyxcclxuICAgICAgICAgICAgICAgICAgICAvLyBzbyBpZiB3ZSBzYXcgYSBjb2xvbiBlYXJsaWVyIGluIHRoaXMgbGluZSwgdGhlbiB3ZSB3b3VsZCBoYXZlXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gaW5jb3JyZWN0bHkgdGhvdWdodCBpdCB3YXMgdGhlIGVuZCBvZiBhIGRlZi9mb3IvaWYvZWxpZi9lbHNlL3RyeS9leGNlcHRcclxuICAgICAgICAgICAgICAgICAgICAvLyBibG9jayB3aGVuIGl0IHdhcyBhY3R1YWxseSBhIGRpY3Rpb25hcnkgYmVpbmcgZGVmaW5lZCwgcmVzZXQgdGhlXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gbGFzdENvbG9uUm93IHZhcmlhYmxlIHRvIHdoYXRldmVyIGl0IHdhcyB3aGVuIHdlIHN0YXJ0ZWQgcGFyc2luZyB0aGlzXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gbGluZS5cclxuICAgICAgICAgICAgICAgICAgICBsYXN0Q29sb25Sb3cgPSBsYXN0bGFzdENvbG9uUm93O1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoYyA9PT0gXCI6XCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGFzdENvbG9uUm93ID0gcm93O1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoXCJ9KV1cIi5pbmNsdWRlcyhjKSAmJiBvcGVuQnJhY2tldFN0YWNrLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGUgLnBvcCgpIHdpbGwgdGFrZSB0aGUgZWxlbWVudCBvZmYgb2YgdGhlIG9wZW5CcmFja2V0U3RhY2sgYXMgaXRcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gYWRkcyBpdCB0byB0aGUgYXJyYXkgZm9yIGxhc3RDbG9zZWRSb3cuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RDbG9zZWRSb3cgPSBbb3BlbkJyYWNrZXRTdGFjay5wb3AoKVswXSwgcm93XTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKFwiJ1xcXCJcIi5pbmNsdWRlcyhjKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBTdGFydGluZyBhIHN0cmluZywga2VlcCB0cmFjayBvZiB3aGF0IHF1b3RlIHdhcyB1c2VkIHRvIHN0YXJ0IGl0LlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHJpbmdEZWxpbWl0ZXIgPSBjO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBudW1Db25zZWN1dGl2ZVN0cmluZ0RlbGltaXRlcnMgKz0gMTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHsgb3BlbkJyYWNrZXRTdGFjaywgbGFzdENsb3NlZFJvdywgc2hvdWxkSGFuZywgbGFzdENvbG9uUm93IH07XHJcbiAgICB9XHJcblxyXG4gICAgaW5kZW50SGFuZ2luZyhyb3cpIHtcclxuICAgICAgICAvLyBJbmRlbnQgYXQgdGhlIGN1cnJlbnQgYmxvY2sgbGV2ZWwgcGx1cyB0aGUgc2V0dGluZyBhbW91bnQgKDEgb3IgMilcclxuICAgICAgICBsZXQgaW5kZW50ID0gKHRoaXMuZWRpdG9yLmluZGVudGF0aW9uRm9yQnVmZmVyUm93KHJvdykpICtcclxuICAgICAgICAgICAgKGF0b20uY29uZmlnLmdldChcInB5dGhvbi1pbmRlbnQuaGFuZ2luZ0luZGVudFRhYnNcIikpO1xyXG5cclxuICAgICAgICAvLyBVc2UgdGhlIG9sZCB2ZXJzaW9uIG9mIHRoZSBcImRlY3JlYXNlTmV4dEluZGVudFwiIGZvciBBdG9tIDwgMS4yMlxyXG4gICAgICAgIGlmICh0aGlzLnZlcnNpb25bMF0gPT09IDEgJiYgdGhpcy52ZXJzaW9uWzFdIDwgMjIpIHtcclxuICAgICAgICAgICAgLy8gSWYgdGhlIGxpbmUgd2hlcmUgYSBuZXdsaW5lIHdhcyBoaXQgcGFzc2VzIHRoZSBEZWNyZWFzZU5leHRJbmRlbnRQYXR0ZXJuXHJcbiAgICAgICAgICAgIC8vIHJlZ2V4LCB0aGVuIEF0b20gd2lsbCBhdXRvbWF0aWNhbGx5IGRlY3JlYXNlIHRoZSBpbmRlbnQgb24gdGhlIG5leHQgbGluZVxyXG4gICAgICAgICAgICAvLyBidXQgd2UgZG9uJ3QgYWN0dWFsbHkgd2FudCB0aGF0IHNpbmNlIHdlJ3JlIGdvaW5nIHRvIGNvbnRpbnVlIGRvaW5nIHN0dWZmXHJcbiAgICAgICAgICAgIC8vIG9uIHRoZSBuZXh0IGxpbmUuXHJcbiAgICAgICAgICAgIGNvbnN0IHNjb3BlID0gdGhpcy5lZGl0b3IuZ2V0Um9vdFNjb3BlRGVzY3JpcHRvcigpO1xyXG4gICAgICAgICAgICBjb25zdCBkZWNyZWFzZUluZGVudFBhdHRlcm4gPSB0aGlzLmVkaXRvci5nZXREZWNyZWFzZU5leHRJbmRlbnRQYXR0ZXJuKHNjb3BlKTtcclxuICAgICAgICAgICAgY29uc3QgcmUgPSBuZXcgUmVnRXhwKGRlY3JlYXNlSW5kZW50UGF0dGVybik7XHJcblxyXG4gICAgICAgICAgICBpZiAocmUudGVzdCh0aGlzLmVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhyb3cgLSAxKSkpIHtcclxuICAgICAgICAgICAgICAgIGluZGVudCArPSAxO1xyXG4gICAgICAgICAgICAgICAgaWYgKHJvdyArIDEgPD0gdGhpcy5lZGl0b3IuYnVmZmVyLmdldExhc3RSb3coKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHJvdysxIGlzIGEgdmFsaWQgcm93LCB0aGVuIHRoYXQgd2lsbCBhbHNvIGhhdmUgYmVlblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGRlZGVudGVkLCBzbyB3ZSBuZWVkIHRvIGZpeCB0aGF0IHRvby5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmVkaXRvci5zZXRJbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhyb3cgKyAxLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVkaXRvci5pbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhyb3cgKyAxKSArIDEpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgLy8gQXRvbSA+PSAxLjIyXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY29uc3QgcmUgPSB0aGlzLmVkaXRvci50b2tlbml6ZWRCdWZmZXIuZGVjcmVhc2VOZXh0SW5kZW50UmVnZXhGb3JTY29wZURlc2NyaXB0b3IoXHJcbiAgICAgICAgICAgICAgICB0aGlzLmVkaXRvci5nZXRSb290U2NvcGVEZXNjcmlwdG9yKCkpO1xyXG5cclxuICAgICAgICAgICAgLy8gSWYgdGhpcyBpcyBhIFwiZGVjcmVhc2UgbmV4dCBpbmRlbnRcIiBsaW5lLCB0aGVuIGluZGVudCBtb3JlXHJcbiAgICAgICAgICAgIGlmIChyZS50ZXN0U3luYyh0aGlzLmVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhyb3cgLSAxKSkpIHtcclxuICAgICAgICAgICAgICAgIGluZGVudCArPSAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBTZXQgdGhlIGluZGVudFxyXG4gICAgICAgIHRoaXMuZWRpdG9yLnNldEluZGVudGF0aW9uRm9yQnVmZmVyUm93KHJvdywgaW5kZW50KTtcclxuICAgIH1cclxufVxyXG4iXX0=