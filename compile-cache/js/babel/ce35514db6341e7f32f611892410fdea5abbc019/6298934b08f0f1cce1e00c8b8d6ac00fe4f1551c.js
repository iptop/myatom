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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vQzovVXNlcnMvQWRtaW5pc3RyYXRvci8uYXRvbS9wYWNrYWdlcy9weXRob24taW5kZW50L2xpYi9weXRob24taW5kZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQzs7Ozs7Ozs7OztJQUVTLFlBQVk7QUFDbEIsYUFETSxZQUFZLEdBQ2Y7OEJBREcsWUFBWTs7QUFFekIsWUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUEsQ0FBQzttQkFBSSxRQUFRLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQztTQUFBLENBQUMsQ0FBQztLQUNyRjs7aUJBSGdCLFlBQVk7O2VBS3ZCLGtCQUFHO0FBQ0wsZ0JBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDOzs7QUFHbkQsZ0JBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUNaLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEtBQUssZUFBZSxJQUN2RSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLEVBQUU7QUFDNUIsdUJBQU87YUFDVjs7O0FBR0QsZ0JBQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsdUJBQXVCLEVBQUUsQ0FBQyxHQUFHLENBQUM7QUFDdEQsZ0JBQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsdUJBQXVCLEVBQUUsQ0FBQyxNQUFNLENBQUM7OztBQUd6RCxnQkFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FB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LENBQUMsTUFBTSxFQUFFOzs7QUFHckQsNkNBQWEsR0FBRyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDOzZCQUNwRCxNQUFNLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRTs7QUFFMUIsK0NBQWUsR0FBRyxDQUFDLENBQUM7QUFDcEIsOERBQThCLElBQUksQ0FBQyxDQUFDOzZCQUN2Qzt5QkFDSjtpQkFDSjthQUNKO0FBQ0QsbUJBQU8sRUFBRSxnQkFBZ0IsRUFBaEIsZ0JBQWdCLEVBQUUsYUFBYSxFQUFiLGFBQWEsRUFBRSxVQUFVLEVBQVYsVUFBVSxFQUFFLFlBQVksRUFBWixZQUFZLEVBQUUsQ0FBQztTQUN4RTs7O1dBL1JnQixZQUFZOzs7cUJBQVosWUFBWSIsImZpbGUiOiJmaWxlOi8vL0M6L1VzZXJzL0FkbWluaXN0cmF0b3IvLmF0b20vcGFja2FnZXMvcHl0aG9uLWluZGVudC9saWIvcHl0aG9uLWluZGVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIGJhYmVsXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFB5dGhvbkluZGVudCB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMudmVyc2lvbiA9IGF0b20uZ2V0VmVyc2lvbigpLnNwbGl0KFwiLlwiKS5zbGljZSgwLCAyKS5tYXAocCA9PiBwYXJzZUludChwLCAxMCkpO1xuICAgIH1cblxuICAgIGluZGVudCgpIHtcbiAgICAgICAgdGhpcy5lZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG5cbiAgICAgICAgLy8gTWFrZSBzdXJlIHRoaXMgaXMgYSBQeXRob24gZmlsZVxuICAgICAgICBpZiAoIXRoaXMuZWRpdG9yIHx8XG4gICAgICAgICAgICB0aGlzLmVkaXRvci5nZXRHcmFtbWFyKCkuc2NvcGVOYW1lLnN1YnN0cmluZygwLCAxMykgIT09IFwic291cmNlLnB5dGhvblwiIHx8XG4gICAgICAgICAgICAhdGhpcy5lZGl0b3IuZ2V0U29mdFRhYnMoKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gR2V0IGJhc2UgdmFyaWFibGVzXG4gICAgICAgIGNvbnN0IHJvdyA9IHRoaXMuZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkucm93O1xuICAgICAgICBjb25zdCBjb2wgPSB0aGlzLmVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpLmNvbHVtbjtcblxuICAgICAgICAvLyBQYXJzZSB0aGUgZW50aXJlIGZpbGUgdXAgdG8gdGhlIGN1cnJlbnQgcG9pbnQsIGtlZXBpbmcgdHJhY2sgb2YgYnJhY2tldHNcbiAgICAgICAgbGV0IGxpbmVzID0gdGhpcy5lZGl0b3IuZ2V0VGV4dEluQnVmZmVyUmFuZ2UoW1swLCAwXSwgW3JvdywgY29sXV0pLnNwbGl0KFwiXFxuXCIpO1xuICAgICAgICAvLyBBdCB0aGlzIHBvaW50LCB0aGUgbmV3bGluZSBjaGFyYWN0ZXIgaGFzIGp1c3QgYmVlbiBhZGRlZCxcbiAgICAgICAgLy8gc28gcmVtb3ZlIHRoZSBsYXN0IGVsZW1lbnQgb2YgbGluZXMsIHdoaWNoIHdpbGwgYmUgdGhlIGVtcHR5IGxpbmVcbiAgICAgICAgbGluZXMgPSBsaW5lcy5zcGxpY2UoMCwgbGluZXMubGVuZ3RoIC0gMSk7XG5cbiAgICAgICAgY29uc3QgcGFyc2VPdXRwdXQgPSBQeXRob25JbmRlbnQucGFyc2VMaW5lcyhsaW5lcyk7XG4gICAgICAgIC8vIG9wZW5CcmFja2V0U3RhY2s6IEEgc3RhY2sgb2YgW3JvdywgY29sXSBwYWlycyBkZXNjcmliaW5nIHdoZXJlIG9wZW4gYnJhY2tldHMgYXJlXG4gICAgICAgIC8vIGxhc3RDbG9zZWRSb3c6IEVpdGhlciBlbXB0eSwgb3IgYW4gYXJyYXkgW3Jvd09wZW4sIHJvd0Nsb3NlXSBkZXNjcmliaW5nIHRoZSByb3dzXG4gICAgICAgIC8vICAgICB3aGVyZSB0aGUgbGFzdCBicmFja2V0IHRvIGJlIGNsb3NlZCB3YXMgb3BlbmVkIGFuZCBjbG9zZWQuXG4gICAgICAgIC8vIHNob3VsZEhhbmc6IEJvb2xlYW4sIGluZGljYXRpbmcgd2hldGhlciBvciBub3QgYSBoYW5naW5nIGluZGVudCBpcyBuZWVkZWQuXG4gICAgICAgIC8vIGxhc3RDb2xvblJvdzogVGhlIGxhc3Qgcm93IGEgZGVmL2Zvci9pZi9lbGlmL2Vsc2UvdHJ5L2V4Y2VwdCBldGMuIGJsb2NrIHN0YXJ0ZWRcbiAgICAgICAgY29uc3QgeyBvcGVuQnJhY2tldFN0YWNrLCBsYXN0Q2xvc2VkUm93LCBzaG91bGRIYW5nLCBsYXN0Q29sb25Sb3cgfSA9IHBhcnNlT3V0cHV0O1xuXG4gICAgICAgIGlmIChzaG91bGRIYW5nKSB7XG4gICAgICAgICAgICB0aGlzLmluZGVudEhhbmdpbmcocm93LCB0aGlzLmVkaXRvci5idWZmZXIubGluZUZvclJvdyhyb3cgLSAxKSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIShvcGVuQnJhY2tldFN0YWNrLmxlbmd0aCB8fCAobGFzdENsb3NlZFJvdy5sZW5ndGggJiYgb3BlbkJyYWNrZXRTdGFjaykpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIW9wZW5CcmFja2V0U3RhY2subGVuZ3RoKSB7XG4gICAgICAgICAgICAvLyBDYW4gYXNzdW1lIGxhc3RDbG9zZWRSb3cgaXMgbm90IGVtcHR5XG4gICAgICAgICAgICBpZiAobGFzdENsb3NlZFJvd1sxXSA9PT0gcm93IC0gMSkge1xuICAgICAgICAgICAgICAgIC8vIFdlIGp1c3QgY2xvc2VkIGEgYnJhY2tldCBvbiB0aGUgcm93LCBnZXQgaW5kZW50YXRpb24gZnJvbSB0aGVcbiAgICAgICAgICAgICAgICAvLyByb3cgd2hlcmUgaXQgd2FzIG9wZW5lZFxuICAgICAgICAgICAgICAgIGxldCBpbmRlbnRMZXZlbCA9IHRoaXMuZWRpdG9yLmluZGVudGF0aW9uRm9yQnVmZmVyUm93KGxhc3RDbG9zZWRSb3dbMF0pO1xuXG4gICAgICAgICAgICAgICAgaWYgKGxhc3RDb2xvblJvdyA9PT0gcm93IC0gMSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBXZSBqdXN0IGZpbmlzaGVkIGRlZi9mb3IvaWYvZWxpZi9lbHNlL3RyeS9leGNlcHQgZXRjLiBibG9jayxcbiAgICAgICAgICAgICAgICAgICAgLy8gbmVlZCB0byBpbmNyZWFzZSBpbmRlbnQgbGV2ZWwgYnkgMS5cbiAgICAgICAgICAgICAgICAgICAgaW5kZW50TGV2ZWwgKz0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5lZGl0b3Iuc2V0SW5kZW50YXRpb25Gb3JCdWZmZXJSb3cocm93LCBpbmRlbnRMZXZlbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBHZXQgdGFiIGxlbmd0aCBmb3IgY29udGV4dFxuICAgICAgICBjb25zdCB0YWJMZW5ndGggPSB0aGlzLmVkaXRvci5nZXRUYWJMZW5ndGgoKTtcblxuICAgICAgICBjb25zdCBsYXN0T3BlbkJyYWNrZXRMb2NhdGlvbnMgPSBvcGVuQnJhY2tldFN0YWNrLnBvcCgpO1xuXG4gICAgICAgIC8vIEdldCBzb21lIGJvb2xlYW5zIHRvIGhlbHAgd29yayB0aHJvdWdoIHRoZSBjYXNlc1xuXG4gICAgICAgIC8vIGhhdmVDbG9zZWRCcmFja2V0IGlzIHRydWUgaWYgd2UgaGF2ZSBldmVyIGNsb3NlZCBhIGJyYWNrZXRcbiAgICAgICAgY29uc3QgaGF2ZUNsb3NlZEJyYWNrZXQgPSBsYXN0Q2xvc2VkUm93Lmxlbmd0aDtcbiAgICAgICAgLy8ganVzdE9wZW5lZEJyYWNrZXQgaXMgdHJ1ZSBpZiB3ZSBvcGVuZWQgYSBicmFja2V0IG9uIHRoZSByb3cgd2UganVzdCBmaW5pc2hlZFxuICAgICAgICBjb25zdCBqdXN0T3BlbmVkQnJhY2tldCA9IGxhc3RPcGVuQnJhY2tldExvY2F0aW9uc1swXSA9PT0gcm93IC0gMTtcbiAgICAgICAgLy8ganVzdENsb3NlZEJyYWNrZXQgaXMgdHJ1ZSBpZiB3ZSBjbG9zZWQgYSBicmFja2V0IG9uIHRoZSByb3cgd2UganVzdCBmaW5pc2hlZFxuICAgICAgICBjb25zdCBqdXN0Q2xvc2VkQnJhY2tldCA9IGhhdmVDbG9zZWRCcmFja2V0ICYmIGxhc3RDbG9zZWRSb3dbMV0gPT09IHJvdyAtIDE7XG4gICAgICAgIC8vIGNsb3NlZEJyYWNrZXRPcGVuZWRBZnRlckxpbmVXaXRoQ3VycmVudE9wZW4gaXMgYW4gKioqZXh0cmVtZWx5KioqIGxvbmcgbmFtZSwgYW5kXG4gICAgICAgIC8vIGl0IGlzIHRydWUgaWYgdGhlIG1vc3QgcmVjZW50bHkgY2xvc2VkIGJyYWNrZXQgcGFpciB3YXMgb3BlbmVkIG9uXG4gICAgICAgIC8vIGEgbGluZSBBRlRFUiB0aGUgbGluZSB3aGVyZSB0aGUgY3VycmVudCBvcGVuIGJyYWNrZXRcbiAgICAgICAgY29uc3QgY2xvc2VkQnJhY2tldE9wZW5lZEFmdGVyTGluZVdpdGhDdXJyZW50T3BlbiA9IGhhdmVDbG9zZWRCcmFja2V0ICYmXG4gICAgICAgICAgICBsYXN0Q2xvc2VkUm93WzBdID4gbGFzdE9wZW5CcmFja2V0TG9jYXRpb25zWzBdO1xuICAgICAgICBsZXQgaW5kZW50Q29sdW1uO1xuXG4gICAgICAgIGlmICghanVzdE9wZW5lZEJyYWNrZXQgJiYgIWp1c3RDbG9zZWRCcmFja2V0KSB7XG4gICAgICAgICAgICAvLyBUaGUgYnJhY2tldCB3YXMgb3BlbmVkIGJlZm9yZSB0aGUgcHJldmlvdXMgbGluZSxcbiAgICAgICAgICAgIC8vIGFuZCB3ZSBkaWQgbm90IGNsb3NlIGEgYnJhY2tldCBvbiB0aGUgcHJldmlvdXMgbGluZS5cbiAgICAgICAgICAgIC8vIFRodXMsIG5vdGhpbmcgaGFzIGhhcHBlbmVkIHRoYXQgY291bGQgaGF2ZSBjaGFuZ2VkIHRoZVxuICAgICAgICAgICAgLy8gaW5kZW50YXRpb24gbGV2ZWwgc2luY2UgdGhlIHByZXZpb3VzIGxpbmUsIHNvXG4gICAgICAgICAgICAvLyB3ZSBzaG91bGQgdXNlIHdoYXRldmVyIGluZGVudCB3ZSBhcmUgZ2l2ZW4uXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSBpZiAoanVzdENsb3NlZEJyYWNrZXQgJiYgY2xvc2VkQnJhY2tldE9wZW5lZEFmdGVyTGluZVdpdGhDdXJyZW50T3Blbikge1xuICAgICAgICAgICAgLy8gQSBicmFja2V0IHRoYXQgd2FzIG9wZW5lZCBhZnRlciB0aGUgbW9zdCByZWNlbnQgb3BlblxuICAgICAgICAgICAgLy8gYnJhY2tldCB3YXMgY2xvc2VkIG9uIHRoZSBsaW5lIHdlIGp1c3QgZmluaXNoZWQgdHlwaW5nLlxuICAgICAgICAgICAgLy8gV2Ugc2hvdWxkIHVzZSB3aGF0ZXZlciBpbmRlbnQgd2FzIHVzZWQgb24gdGhlIHJvd1xuICAgICAgICAgICAgLy8gd2hlcmUgd2Ugb3BlbmVkIHRoZSBicmFja2V0IHdlIGp1c3QgY2xvc2VkLiBUaGlzIG5lZWRzXG4gICAgICAgICAgICAvLyB0byBiZSBoYW5kbGVkIGFzIGEgc2VwYXJhdGUgY2FzZSBmcm9tIHRoZSBsYXN0IGNhc2UgYmVsb3dcbiAgICAgICAgICAgIC8vIGluIGNhc2UgdGhlIGN1cnJlbnQgYnJhY2tldCBpcyB1c2luZyBhIGhhbmdpbmcgaW5kZW50LlxuICAgICAgICAgICAgLy8gVGhpcyBoYW5kbGVzIGNhc2VzIHN1Y2ggYXNcbiAgICAgICAgICAgIC8vIHggPSBbMCwgMSwgMixcbiAgICAgICAgICAgIC8vICAgICAgWzMsIDQsIDUsXG4gICAgICAgICAgICAvLyAgICAgICA2LCA3LCA4XSxcbiAgICAgICAgICAgIC8vICAgICAgOSwgMTAsIDExXVxuICAgICAgICAgICAgLy8gd2hpY2ggd291bGQgYmUgY29ycmVjdGx5IGhhbmRsZWQgYnkgdGhlIGNhc2UgYmVsb3csIGJ1dCBpdCBhbHNvIGNvcnJlY3RseSBoYW5kbGVzXG4gICAgICAgICAgICAvLyB4ID0gW1xuICAgICAgICAgICAgLy8gICAgIDAsIDEsIDIsIFszLCA0LCA1LFxuICAgICAgICAgICAgLy8gICAgICAgICAgICAgICA2LCA3LCA4XSxcbiAgICAgICAgICAgIC8vICAgICA5LCAxMCwgMTFcbiAgICAgICAgICAgIC8vIF1cbiAgICAgICAgICAgIC8vIHdoaWNoIHRoZSBsYXN0IGNhc2UgYmVsb3cgd291bGQgaW5jb3JyZWN0bHkgaW5kZW50IGFuIGV4dHJhIHNwYWNlXG4gICAgICAgICAgICAvLyBiZWZvcmUgdGhlIFwiOVwiLCBiZWNhdXNlIGl0IHdvdWxkIHRyeSB0byBtYXRjaCBpdCB1cCB3aXRoIHRoZVxuICAgICAgICAgICAgLy8gb3BlbiBicmFja2V0IGluc3RlYWQgb2YgdXNpbmcgdGhlIGhhbmdpbmcgaW5kZW50LlxuICAgICAgICAgICAgY29uc3QgcHJldmlvdXNJbmRlbnQgPSB0aGlzLmVkaXRvci5pbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhsYXN0Q2xvc2VkUm93WzBdKTtcbiAgICAgICAgICAgIGluZGVudENvbHVtbiA9IHByZXZpb3VzSW5kZW50ICogdGFiTGVuZ3RoO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gbGFzdE9wZW5CcmFja2V0TG9jYXRpb25zWzFdIGlzIHRoZSBjb2x1bW4gd2hlcmUgdGhlIGJyYWNrZXQgd2FzLFxuICAgICAgICAgICAgLy8gc28gbmVlZCB0byBidW1wIHVwIHRoZSBpbmRlbnRhdGlvbiBieSBvbmVcbiAgICAgICAgICAgIGluZGVudENvbHVtbiA9IGxhc3RPcGVuQnJhY2tldExvY2F0aW9uc1sxXSArIDE7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDYWxjdWxhdGUgc29mdC10YWJzIGZyb20gc3BhY2VzIChjYW4gaGF2ZSByZW1haW5kZXIpXG4gICAgICAgIGxldCB0YWJzID0gaW5kZW50Q29sdW1uIC8gdGFiTGVuZ3RoO1xuICAgICAgICBjb25zdCByZW0gPSAodGFicyAtIE1hdGguZmxvb3IodGFicykpICogdGFiTGVuZ3RoO1xuXG4gICAgICAgIC8vIElmIHRoZXJlJ3MgYSByZW1haW5kZXIsIGBAZWRpdG9yLmJ1aWxkSW5kZW50U3RyaW5nYCByZXF1aXJlcyB0aGUgdGFiIHRvXG4gICAgICAgIC8vIGJlIHNldCBwYXN0IHRoZSBkZXNpcmVkIGluZGVudGF0aW9uIGxldmVsLCB0aHVzIHRoZSBjZWlsaW5nLlxuICAgICAgICB0YWJzID0gcmVtID4gMCA/IE1hdGguY2VpbCh0YWJzKSA6IHRhYnM7XG5cbiAgICAgICAgLy8gT2Zmc2V0IGlzIHRoZSBudW1iZXIgb2Ygc3BhY2VzIHRvIHN1YnRyYWN0IGZyb20gdGhlIHNvZnQtdGFicyBpZiB0aGV5XG4gICAgICAgIC8vIGFyZSBwYXN0IHRoZSBkZXNpcmVkIGluZGVudGF0aW9uIChub3QgZGl2aXNpYmxlIGJ5IHRhYiBsZW5ndGgpLlxuICAgICAgICBjb25zdCBvZmZzZXQgPSByZW0gPiAwID8gdGFiTGVuZ3RoIC0gcmVtIDogMDtcblxuICAgICAgICAvLyBJJ20gZ2xhZCBBdG9tIGhhcyBhbiBvcHRpb25hbCBgY29sdW1uYCBwYXJhbSB0byBzdWJ0cmFjdCBzcGFjZXMgZnJvbVxuICAgICAgICAvLyBzb2Z0LXRhYnMsIHRob3VnaCBJIGRvbid0IHNlZSBpdCB1c2VkIGFueXdoZXJlIGluIHRoZSBjb3JlLlxuICAgICAgICAvLyBJdCBsb29rcyBsaWtlIGZvciBoYXJkIHRhYnMsIHRoZSBcInRhYnNcIiBpbnB1dCBjYW4gYmUgZnJhY3Rpb25hbCBhbmRcbiAgICAgICAgLy8gdGhlIFwiY29sdW1uXCIgaW5wdXQgaXMgaWdub3JlZC4uLj9cbiAgICAgICAgY29uc3QgaW5kZW50ID0gdGhpcy5lZGl0b3IuYnVpbGRJbmRlbnRTdHJpbmcodGFicywgb2Zmc2V0KTtcblxuICAgICAgICAvLyBUaGUgcmFuZ2Ugb2YgdGV4dCB0byByZXBsYWNlIHdpdGggb3VyIGluZGVudFxuICAgICAgICAvLyB3aWxsIG5lZWQgdG8gY2hhbmdlIHRoaXMgZm9yIGhhcmQgdGFicywgZXNwZWNpYWxseSB0cmlja3kgZm9yIHdoZW5cbiAgICAgICAgLy8gaGFyZCB0YWJzIGhhdmUgbWl4dHVyZSBvZiB0YWJzICsgc3BhY2VzLCB3aGljaCB0aGV5IGNhbiBqdWRnaW5nIGZyb21cbiAgICAgICAgLy8gdGhlIGVkaXRvci5idWlsZEluZGVudFN0cmluZyBmdW5jdGlvblxuICAgICAgICBjb25zdCBzdGFydFJhbmdlID0gW3JvdywgMF07XG4gICAgICAgIGNvbnN0IHN0b3BSYW5nZSA9IFtyb3csIHRoaXMuZWRpdG9yLmluZGVudGF0aW9uRm9yQnVmZmVyUm93KHJvdykgKiB0YWJMZW5ndGhdO1xuICAgICAgICB0aGlzLmVkaXRvci5nZXRCdWZmZXIoKS5zZXRUZXh0SW5SYW5nZShbc3RhcnRSYW5nZSwgc3RvcFJhbmdlXSwgaW5kZW50KTtcbiAgICB9XG5cbiAgICBzdGF0aWMgcGFyc2VMaW5lcyhsaW5lcykge1xuICAgICAgICAvLyBvcGVuQnJhY2tldFN0YWNrIGlzIGFuIGFycmF5IG9mIFtyb3csIGNvbF0gaW5kaWNhdGluZyB0aGUgbG9jYXRpb25cbiAgICAgICAgLy8gb2YgdGhlIG9wZW5pbmcgYnJhY2tldCAoc3F1YXJlLCBjdXJseSwgb3IgcGFyZW50aGVzZXMpXG4gICAgICAgIGNvbnN0IG9wZW5CcmFja2V0U3RhY2sgPSBbXTtcbiAgICAgICAgLy8gbGFzdENsb3NlZFJvdyBpcyBlaXRoZXIgZW1wdHkgb3IgW3Jvd09wZW4sIHJvd0Nsb3NlXSBkZXNjcmliaW5nIHRoZVxuICAgICAgICAvLyByb3dzIHdoZXJlIHRoZSBsYXRlc3QgY2xvc2VkIGJyYWNrZXQgd2FzIG9wZW5lZCBhbmQgY2xvc2VkLlxuICAgICAgICBsZXQgbGFzdENsb3NlZFJvdyA9IFtdO1xuICAgICAgICAvLyBJZiB3ZSBhcmUgaW4gYSBzdHJpbmcsIHRoaXMgdGVsbHMgdXMgd2hhdCBjaGFyYWN0ZXIgaW50cm9kdWNlZCB0aGUgc3RyaW5nXG4gICAgICAgIC8vIGkuZS4sIGRpZCB0aGlzIHN0cmluZyBzdGFydCB3aXRoICcgb3Igd2l0aCBcIj9cbiAgICAgICAgbGV0IHN0cmluZ0RlbGltaXRlciA9IG51bGw7XG4gICAgICAgIC8vIFRoaXMgaXMgdGhlIHJvdyBvZiB0aGUgbGFzdCBmdW5jdGlvbiBkZWZpbml0aW9uXG4gICAgICAgIGxldCBsYXN0Q29sb25Sb3cgPSBOYU47XG4gICAgICAgIC8vIHRydWUgaWYgd2UgYXJlIGluIGEgdHJpcGxlIHF1b3RlZCBzdHJpbmdcbiAgICAgICAgbGV0IGluVHJpcGxlUXVvdGVkU3RyaW5nID0gZmFsc2U7XG4gICAgICAgIC8vIElmIHdlIGhhdmUgc2VlbiB0d28gb2YgdGhlIHNhbWUgc3RyaW5nIGRlbGltaXRlcnMgaW4gYSByb3csXG4gICAgICAgIC8vIHRoZW4gd2UgaGF2ZSB0byBjaGVjayB0aGUgbmV4dCBjaGFyYWN0ZXIgdG8gc2VlIGlmIGl0IG1hdGNoZXNcbiAgICAgICAgLy8gaW4gb3JkZXIgdG8gY29ycmVjdGx5IHBhcnNlIHRyaXBsZSBxdW90ZWQgc3RyaW5ncy5cbiAgICAgICAgbGV0IGNoZWNrTmV4dENoYXJGb3JTdHJpbmcgPSBmYWxzZTtcbiAgICAgICAgLy8gdHJ1ZSBpZiB3ZSBzaG91bGQgaGF2ZSBhIGhhbmdpbmcgaW5kZW50LCBmYWxzZSBvdGhlcndpc2VcbiAgICAgICAgbGV0IHNob3VsZEhhbmcgPSBmYWxzZTtcblxuICAgICAgICAvLyBOT1RFOiB0aGlzIHBhcnNpbmcgd2lsbCBvbmx5IGJlIGNvcnJlY3QgaWYgdGhlIHB5dGhvbiBjb2RlIGlzIHdlbGwtZm9ybWVkXG4gICAgICAgIC8vIHN0YXRlbWVudHMgbGlrZSBcIlswLCAoMSwgMl0pXCIgbWlnaHQgYnJlYWsgdGhlIHBhcnNpbmdcblxuICAgICAgICAvLyBsb29wIG92ZXIgZWFjaCBsaW5lXG4gICAgICAgIGNvbnN0IGxpbmVzTGVuZ3RoID0gbGluZXMubGVuZ3RoO1xuICAgICAgICBmb3IgKGxldCByb3cgPSAwOyByb3cgPCBsaW5lc0xlbmd0aDsgcm93ICs9IDEpIHtcbiAgICAgICAgICAgIGNvbnN0IGxpbmUgPSBsaW5lc1tyb3ddO1xuXG4gICAgICAgICAgICAvLyBLZWVwIHRyYWNrIG9mIHRoZSBudW1iZXIgb2YgY29uc2VjdXRpdmUgc3RyaW5nIGRlbGltaXRlcidzIHdlJ3ZlIHNlZW5cbiAgICAgICAgICAgIC8vIGluIHRoaXMgbGluZTsgdGhpcyBpcyB1c2VkIHRvIHRlbGwgaWYgd2UgYXJlIGluIGEgdHJpcGxlIHF1b3RlZCBzdHJpbmdcbiAgICAgICAgICAgIGxldCBudW1Db25zZWN1dGl2ZVN0cmluZ0RlbGltaXRlcnMgPSAwO1xuICAgICAgICAgICAgLy8gYm9vbGVhbiwgd2hldGhlciBvciBub3QgdGhlIGN1cnJlbnQgY2hhcmFjdGVyIGlzIGJlaW5nIGVzY2FwZWRcbiAgICAgICAgICAgIC8vIGFwcGxpY2FibGUgd2hlbiB3ZSBhcmUgY3VycmVudGx5IGluIGEgc3RyaW5nXG4gICAgICAgICAgICBsZXQgaXNFc2NhcGVkID0gZmFsc2U7XG5cbiAgICAgICAgICAgIC8vIFRoaXMgaXMgdGhlIGxhc3QgZGVmaW5lZCBkZWYvZm9yL2lmL2VsaWYvZWxzZS90cnkvZXhjZXB0IHJvd1xuICAgICAgICAgICAgY29uc3QgbGFzdGxhc3RDb2xvblJvdyA9IGxhc3RDb2xvblJvdztcbiAgICAgICAgICAgIGNvbnN0IGxpbmVMZW5ndGggPSBsaW5lLmxlbmd0aDtcbiAgICAgICAgICAgIGZvciAobGV0IGNvbCA9IDA7IGNvbCA8IGxpbmVMZW5ndGg7IGNvbCArPSAxKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYyA9IGxpbmVbY29sXTtcblxuICAgICAgICAgICAgICAgIGlmIChjID09PSBzdHJpbmdEZWxpbWl0ZXIgJiYgIWlzRXNjYXBlZCkge1xuICAgICAgICAgICAgICAgICAgICBudW1Db25zZWN1dGl2ZVN0cmluZ0RlbGltaXRlcnMgKz0gMTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNoZWNrTmV4dENoYXJGb3JTdHJpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgbnVtQ29uc2VjdXRpdmVTdHJpbmdEZWxpbWl0ZXJzID0gMDtcbiAgICAgICAgICAgICAgICAgICAgc3RyaW5nRGVsaW1pdGVyID0gbnVsbDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBudW1Db25zZWN1dGl2ZVN0cmluZ0RlbGltaXRlcnMgPSAwO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNoZWNrTmV4dENoYXJGb3JTdHJpbmcgPSBmYWxzZTtcblxuICAgICAgICAgICAgICAgIC8vIElmIHN0cmluZ0RlbGltaXRlciBpcyBzZXQsIHRoZW4gd2UgYXJlIGluIGEgc3RyaW5nXG4gICAgICAgICAgICAgICAgLy8gTm90ZSB0aGF0IHRoaXMgd29ya3MgY29ycmVjdGx5IGV2ZW4gZm9yIHRyaXBsZSBxdW90ZWQgc3RyaW5nc1xuICAgICAgICAgICAgICAgIGlmIChzdHJpbmdEZWxpbWl0ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzRXNjYXBlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgY3VycmVudCBjaGFyYWN0ZXIgaXMgZXNjYXBlZCwgdGhlbiB3ZSBkbyBub3QgY2FyZSB3aGF0IGl0IHdhcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGJ1dCBzaW5jZSBpdCBpcyBpbXBvc3NpYmxlIGZvciB0aGUgbmV4dCBjaGFyYWN0ZXIgdG8gYmUgZXNjYXBlZCBhcyB3ZWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZ28gYWhlYWQgYW5kIHNldCB0aGF0IHRvIGZhbHNlXG4gICAgICAgICAgICAgICAgICAgICAgICBpc0VzY2FwZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjID09PSBzdHJpbmdEZWxpbWl0ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdlIGFyZSBzZWVpbmcgdGhlIHNhbWUgcXVvdGUgdGhhdCBzdGFydGVkIHRoZSBzdHJpbmcsIGkuZS4gJyBvciBcIlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluVHJpcGxlUXVvdGVkU3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG51bUNvbnNlY3V0aXZlU3RyaW5nRGVsaW1pdGVycyA9PT0gMykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBCcmVha2luZyBvdXQgb2YgdGhlIHRyaXBsZSBxdW90ZWQgc3RyaW5nLi4uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG51bUNvbnNlY3V0aXZlU3RyaW5nRGVsaW1pdGVycyA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0cmluZ0RlbGltaXRlciA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluVHJpcGxlUXVvdGVkU3RyaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChudW1Db25zZWN1dGl2ZVN0cmluZ0RlbGltaXRlcnMgPT09IDMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyByZXNldCB0aGUgY291bnQsIGNvcnJlY3RseSBoYW5kbGVzIGNhc2VzIGxpa2UgJycnJycnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVtQ29uc2VjdXRpdmVTdHJpbmdEZWxpbWl0ZXJzID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpblRyaXBsZVF1b3RlZFN0cmluZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG51bUNvbnNlY3V0aXZlU3RyaW5nRGVsaW1pdGVycyA9PT0gMikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdlIGFyZSBub3QgY3VycmVudGx5IGluIGEgdHJpcGxlIHF1b3RlZCBzdHJpbmcsIGFuZCB3ZSd2ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNlZW4gdHdvIG9mIHRoZSBzYW1lIHN0cmluZyBkZWxpbWl0ZXIgaW4gYSByb3cuIFRoaXMgY291bGRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBlaXRoZXIgYmUgYW4gZW1wdHkgc3RyaW5nLCBpLmUuICcnIG9yIFwiXCIsIG9yIGl0IGNvdWxkIGJlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhlIHN0YXJ0IG9mIGEgdHJpcGxlIHF1b3RlZCBzdHJpbmcuIFdlIHdpbGwgY2hlY2sgdGhlIG5leHRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBjaGFyYWN0ZXIsIGFuZCBpZiBpdCBtYXRjaGVzIHRoZW4gd2Uga25vdyB3ZSdyZSBpbiBhIHRyaXBsZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHF1b3RlZCBzdHJpbmcsIGFuZCBpZiBpdCBkb2VzIG5vdCBtYXRjaCB3ZSBrbm93IHdlJ3JlIG5vdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGluIGEgc3RyaW5nIGFueSBtb3JlIChpLmUuIGl0IHdhcyB0aGUgZW1wdHkgc3RyaW5nKS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGVja05leHRDaGFyRm9yU3RyaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobnVtQ29uc2VjdXRpdmVTdHJpbmdEZWxpbWl0ZXJzID09PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gV2UgYXJlIG5vdCBpbiBhIHN0cmluZyB0aGF0IGlzIG5vdCB0cmlwbGUgcXVvdGVkLCBhbmQgd2UndmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBqdXN0IHNlZW4gYW4gdW4tZXNjYXBlZCBpbnN0YW5jZSBvZiB0aGF0IHN0cmluZyBkZWxpbWl0ZXIuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSW4gb3RoZXIgd29yZHMsIHdlJ3ZlIGxlZnQgdGhlIHN0cmluZy5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJdCBpcyBhbHNvIHdvcnRoIG5vdGluZyB0aGF0IGl0IGlzIGltcG9zc2libGUgZm9yXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbnVtQ29uc2VjdXRpdmVTdHJpbmdEZWxpbWl0ZXJzIHRvIGJlIDAgYXQgdGhpcyBwb2ludCwgc29cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGlzIHNldCBvZiBpZi9lbHNlIGlmIHN0YXRlbWVudHMgY292ZXJzIGFsbCBjYXNlcy5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHJpbmdEZWxpbWl0ZXIgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGMgPT09IFwiXFxcXFwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBXZSBhcmUgc2VlaW5nIGFuIHVuZXNjYXBlZCBiYWNrc2xhc2gsIHRoZSBuZXh0IGNoYXJhY3RlciBpcyBlc2NhcGVkLlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gTm90ZSB0aGF0IHRoaXMgaXMgbm90IGV4YWN0bHkgdHJ1ZSBpbiByYXcgc3RyaW5ncywgSE9XRVZFUiwgaW4gcmF3XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzdHJpbmdzIHlvdSBjYW4gc3RpbGwgZXNjYXBlIHRoZSBxdW90ZSBtYXJrIGJ5IHVzaW5nIGEgYmFja3NsYXNoLlxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2luY2UgdGhhdCdzIGFsbCB3ZSByZWFsbHkgY2FyZSBhYm91dCBhcyBmYXIgYXMgZXNjYXBlZCBjaGFyYWN0ZXJzXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBnbywgd2UgY2FuIGFzc3VtZSB3ZSBhcmUgbm93IGVzY2FwaW5nIHRoZSBuZXh0IGNoYXJhY3Rlci5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlzRXNjYXBlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKFwiWyh7XCIuaW5jbHVkZXMoYykpIHtcbiAgICAgICAgICAgICAgICAgICAgb3BlbkJyYWNrZXRTdGFjay5wdXNoKFtyb3csIGNvbF0pO1xuICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGUgb25seSBjaGFyYWN0ZXJzIGFmdGVyIHRoaXMgb3BlbmluZyBicmFja2V0IGFyZSB3aGl0ZXNwYWNlLFxuICAgICAgICAgICAgICAgICAgICAvLyB0aGVuIHdlIHNob3VsZCBkbyBhIGhhbmdpbmcgaW5kZW50LiBJZiB0aGVyZSBhcmUgb3RoZXIgbm9uLXdoaXRlc3BhY2VcbiAgICAgICAgICAgICAgICAgICAgLy8gY2hhcmFjdGVycyBhZnRlciB0aGlzLCB0aGVuIHRoZXkgd2lsbCBzZXQgdGhlIHNob3VsZEhhbmcgYm9vbGVhbiB0byBmYWxzZVxuICAgICAgICAgICAgICAgICAgICBzaG91bGRIYW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKFwiIFxcdFxcclxcblwiLmluY2x1ZGVzKGMpKSB7IC8vIGp1c3QgaW4gY2FzZSB0aGVyZSdzIGEgbmV3IGxpbmVcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgaXQncyB3aGl0ZXNwYWNlLCB3ZSBkb24ndCBjYXJlIGF0IGFsbFxuICAgICAgICAgICAgICAgICAgICAvLyB0aGlzIGNoZWNrIGlzIG5lY2Vzc2FyeSBzbyB3ZSBkb24ndCBzZXQgc2hvdWxkSGFuZyB0byBmYWxzZSBldmVuIGlmXG4gICAgICAgICAgICAgICAgICAgIC8vIHNvbWVvbmUgZS5nLiBqdXN0IGVudGVyZWQgYSBzcGFjZSBiZXR3ZWVuIHRoZSBvcGVuaW5nIGJyYWNrZXQgYW5kIHRoZVxuICAgICAgICAgICAgICAgICAgICAvLyBuZXdsaW5lLlxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoYyA9PT0gXCIjXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBjaGVjayBnb2VzIGFzIHdlbGwgdG8gbWFrZSBzdXJlIHdlIGRvbid0IHNldCBzaG91bGRIYW5nXG4gICAgICAgICAgICAgICAgICAgIC8vIHRvIGZhbHNlIGluIHNpbWlsYXIgY2lyY3Vtc3RhbmNlcyBhcyBkZXNjcmliZWQgaW4gdGhlIHdoaXRlc3BhY2Ugc2VjdGlvbi5cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gV2UndmUgYWxyZWFkeSBza2lwcGVkIGlmIHRoZSBjaGFyYWN0ZXIgd2FzIHdoaXRlLXNwYWNlLCBhbiBvcGVuaW5nXG4gICAgICAgICAgICAgICAgICAgIC8vIGJyYWNrZXQsIG9yIGEgbmV3IGxpbmUsIHNvIHRoYXQgbWVhbnMgdGhlIGN1cnJlbnQgY2hhcmFjdGVyIGlzIG5vdFxuICAgICAgICAgICAgICAgICAgICAvLyB3aGl0ZXNwYWNlIGFuZCBub3QgYW4gb3BlbmluZyBicmFja2V0LCBzbyBzaG91bGRIYW5nIG5lZWRzIHRvIGdldCBzZXQgdG9cbiAgICAgICAgICAgICAgICAgICAgLy8gZmFsc2UuXG4gICAgICAgICAgICAgICAgICAgIHNob3VsZEhhbmcgPSBmYWxzZTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBTaW1pbGFyIHRvIGFib3ZlLCB3ZSd2ZSBhbHJlYWR5IHNraXBwZWQgYWxsIGlycmVsZXZhbnQgY2hhcmFjdGVycyxcbiAgICAgICAgICAgICAgICAgICAgLy8gc28gaWYgd2Ugc2F3IGEgY29sb24gZWFybGllciBpbiB0aGlzIGxpbmUsIHRoZW4gd2Ugd291bGQgaGF2ZVxuICAgICAgICAgICAgICAgICAgICAvLyBpbmNvcnJlY3RseSB0aG91Z2h0IGl0IHdhcyB0aGUgZW5kIG9mIGEgZGVmL2Zvci9pZi9lbGlmL2Vsc2UvdHJ5L2V4Y2VwdFxuICAgICAgICAgICAgICAgICAgICAvLyBibG9jayB3aGVuIGl0IHdhcyBhY3R1YWxseSBhIGRpY3Rpb25hcnkgYmVpbmcgZGVmaW5lZCwgcmVzZXQgdGhlXG4gICAgICAgICAgICAgICAgICAgIC8vIGxhc3RDb2xvblJvdyB2YXJpYWJsZSB0byB3aGF0ZXZlciBpdCB3YXMgd2hlbiB3ZSBzdGFydGVkIHBhcnNpbmcgdGhpc1xuICAgICAgICAgICAgICAgICAgICAvLyBsaW5lLlxuICAgICAgICAgICAgICAgICAgICBsYXN0Q29sb25Sb3cgPSBsYXN0bGFzdENvbG9uUm93O1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChjID09PSBcIjpcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFzdENvbG9uUm93ID0gcm93O1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKFwifSldXCIuaW5jbHVkZXMoYykgJiYgb3BlbkJyYWNrZXRTdGFjay5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoZSAucG9wKCkgd2lsbCB0YWtlIHRoZSBlbGVtZW50IG9mZiBvZiB0aGUgb3BlbkJyYWNrZXRTdGFjayBhcyBpdFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gYWRkcyBpdCB0byB0aGUgYXJyYXkgZm9yIGxhc3RDbG9zZWRSb3cuXG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0Q2xvc2VkUm93ID0gW29wZW5CcmFja2V0U3RhY2sucG9wKClbMF0sIHJvd107XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoXCInXFxcIlwiLmluY2x1ZGVzKGMpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBTdGFydGluZyBhIHN0cmluZywga2VlcCB0cmFjayBvZiB3aGF0IHF1b3RlIHdhcyB1c2VkIHRvIHN0YXJ0IGl0LlxuICAgICAgICAgICAgICAgICAgICAgICAgc3RyaW5nRGVsaW1pdGVyID0gYztcbiAgICAgICAgICAgICAgICAgICAgICAgIG51bUNvbnNlY3V0aXZlU3RyaW5nRGVsaW1pdGVycyArPSAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IG9wZW5CcmFja2V0U3RhY2ssIGxhc3RDbG9zZWRSb3csIHNob3VsZEhhbmcsIGxhc3RDb2xvblJvdyB9O1xuICAgIH1cblxuICAgIGluZGVudEhhbmdpbmcocm93KSB7XG4gICAgICAgIC8vIEluZGVudCBhdCB0aGUgY3VycmVudCBibG9jayBsZXZlbCBwbHVzIHRoZSBzZXR0aW5nIGFtb3VudCAoMSBvciAyKVxuICAgICAgICBsZXQgaW5kZW50ID0gKHRoaXMuZWRpdG9yLmluZGVudGF0aW9uRm9yQnVmZmVyUm93KHJvdykpICtcbiAgICAgICAgICAgIChhdG9tLmNvbmZpZy5nZXQoXCJweXRob24taW5kZW50LmhhbmdpbmdJbmRlbnRUYWJzXCIpKTtcblxuICAgICAgICAvLyBVc2UgdGhlIG9sZCB2ZXJzaW9uIG9mIHRoZSBcImRlY3JlYXNlTmV4dEluZGVudFwiIGZvciBBdG9tIDwgMS4yMlxuICAgICAgICBpZiAodGhpcy52ZXJzaW9uWzBdID09PSAxICYmIHRoaXMudmVyc2lvblsxXSA8IDIyKSB7XG4gICAgICAgICAgICAvLyBJZiB0aGUgbGluZSB3aGVyZSBhIG5ld2xpbmUgd2FzIGhpdCBwYXNzZXMgdGhlIERlY3JlYXNlTmV4dEluZGVudFBhdHRlcm5cbiAgICAgICAgICAgIC8vIHJlZ2V4LCB0aGVuIEF0b20gd2lsbCBhdXRvbWF0aWNhbGx5IGRlY3JlYXNlIHRoZSBpbmRlbnQgb24gdGhlIG5leHQgbGluZVxuICAgICAgICAgICAgLy8gYnV0IHdlIGRvbid0IGFjdHVhbGx5IHdhbnQgdGhhdCBzaW5jZSB3ZSdyZSBnb2luZyB0byBjb250aW51ZSBkb2luZyBzdHVmZlxuICAgICAgICAgICAgLy8gb24gdGhlIG5leHQgbGluZS5cbiAgICAgICAgICAgIGNvbnN0IHNjb3BlID0gdGhpcy5lZGl0b3IuZ2V0Um9vdFNjb3BlRGVzY3JpcHRvcigpO1xuICAgICAgICAgICAgY29uc3QgZGVjcmVhc2VJbmRlbnRQYXR0ZXJuID0gdGhpcy5lZGl0b3IuZ2V0RGVjcmVhc2VOZXh0SW5kZW50UGF0dGVybihzY29wZSk7XG4gICAgICAgICAgICBjb25zdCByZSA9IG5ldyBSZWdFeHAoZGVjcmVhc2VJbmRlbnRQYXR0ZXJuKTtcblxuICAgICAgICAgICAgaWYgKHJlLnRlc3QodGhpcy5lZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cocm93IC0gMSkpKSB7XG4gICAgICAgICAgICAgICAgaW5kZW50ICs9IDE7XG4gICAgICAgICAgICAgICAgaWYgKHJvdyArIDEgPD0gdGhpcy5lZGl0b3IuYnVmZmVyLmdldExhc3RSb3coKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBJZiByb3crMSBpcyBhIHZhbGlkIHJvdywgdGhlbiB0aGF0IHdpbGwgYWxzbyBoYXZlIGJlZW5cbiAgICAgICAgICAgICAgICAgICAgLy8gZGVkZW50ZWQsIHNvIHdlIG5lZWQgdG8gZml4IHRoYXQgdG9vLlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmVkaXRvci5zZXRJbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhyb3cgKyAxLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lZGl0b3IuaW5kZW50YXRpb25Gb3JCdWZmZXJSb3cocm93ICsgMSkgKyAxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIC8vIEF0b20gPj0gMS4yMlxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgcmUgPSB0aGlzLmVkaXRvci50b2tlbml6ZWRCdWZmZXIuZGVjcmVhc2VOZXh0SW5kZW50UmVnZXhGb3JTY29wZURlc2NyaXB0b3IoXG4gICAgICAgICAgICAgICAgdGhpcy5lZGl0b3IuZ2V0Um9vdFNjb3BlRGVzY3JpcHRvcigpKTtcblxuICAgICAgICAgICAgLy8gSWYgdGhpcyBpcyBhIFwiZGVjcmVhc2UgbmV4dCBpbmRlbnRcIiBsaW5lLCB0aGVuIGluZGVudCBtb3JlXG4gICAgICAgICAgICBpZiAocmUudGVzdFN5bmModGhpcy5lZGl0b3IubGluZVRleHRGb3JCdWZmZXJSb3cocm93IC0gMSkpKSB7XG4gICAgICAgICAgICAgICAgaW5kZW50ICs9IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTZXQgdGhlIGluZGVudFxuICAgICAgICB0aGlzLmVkaXRvci5zZXRJbmRlbnRhdGlvbkZvckJ1ZmZlclJvdyhyb3csIGluZGVudCk7XG4gICAgfVxufVxuIl19