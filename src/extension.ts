// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

const handleInput = async () => {
	const input = vscode.window.showInputBox()
		.then((out) => {
			if (out) {
				return out.trim();
			}
		});
	return input;
};

const getChunkedRowBounds = (row: number, columnStart: number, chunkSize: number) => {
	const lineStart = new vscode.Position(row, columnStart);
	const lineEnd = new vscode.Position(row + chunkSize, columnStart);
	return [lineStart, lineEnd];
};

const getTextChunk = (start: vscode.Position, stop: vscode.Position) => {
	const range = new vscode.Range(start, stop);
	return vscode.window.activeTextEditor?.document.getText(range);
};

const selectBreakpointsChunked = (pattern: string | undefined) => {
	if (!pattern) { return; }
	let editor = vscode.window.activeTextEditor;
	if (!editor) {
		vscode.window.showInformationMessage('Open a file first to manipulate text selections');
		return;
	}
	let document = editor.document;
	const documentLength = vscode.window.activeTextEditor?.document.lineCount;
	if (!documentLength) { return; }
	const columnStart = 0;
	const chunkSize = 100;
	const bps: vscode.Breakpoint[] = [];
	for (let i = 0; i < documentLength; i += chunkSize) {
		let [lineStart, lineEnd] = getChunkedRowBounds(i, columnStart, chunkSize);
		const textChunk = getTextChunk(lineStart, lineEnd);
		if (!textChunk) { return; }
		let lines = textChunk.split('\n');
		for (let line = 0; line < lines.length; line++) {
			const lineMatch = lines[line].match(pattern);
			if (!lineMatch) { continue; }
			const editorLine = i + line;
			bps.push(new vscode.SourceBreakpoint(new vscode.Location(document.uri, new vscode.Position(editorLine, 0))));
		}
		return bps;
	}
};

const findCurrentBreakPointsPattern = (pattern: string | undefined) => {
	if (!pattern) { return; }
	let editor = vscode.window.activeTextEditor;
	if (!editor) {
		vscode.window.showInformationMessage('Open a file first to manipulate text selections');
		return;
	}
	let document = editor.document;
	const found = vscode.debug.breakpoints.filter(bp => {
		if (bp instanceof vscode.SourceBreakpoint) {
			const bpline = bp.location.range.start.line;
			const { text } = document.lineAt(bpline);
			return text.match(pattern) !== null;
		}
		return false;
	});
	return found;
};

const findBreakPointsAboveBelowCurrentLine = async (aboveBelow: string) => {
	let editor = vscode.window.activeTextEditor;
	if (!editor) {
		vscode.window.showInformationMessage('Open a file first to manipulate text selections');
		return;
	}
	const currentLine = editor.selection.active.line;
	if (aboveBelow === 'above') {
		const found = vscode.debug.breakpoints.filter(bp => {
			if (bp instanceof vscode.SourceBreakpoint) {
				return bp.location.range.start.line < currentLine;
			}
			return false;
		});
		return found;
	} else {
		const found = vscode.debug.breakpoints.filter(bp => {
			if (bp instanceof vscode.SourceBreakpoint) {
				const isBelow = bp.location.range.start.line > currentLine;
				return isBelow;
			}
			return false;
		});
		return found;
	}
};


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	let addRegexBreakPoints = vscode.commands.registerCommand('yeetpoint.addRegex', () => {
		handleInput()
			.then((pattern) => {
				return selectBreakpointsChunked(pattern);
			})
			.then((breakPoints) => {
				if (breakPoints) {
					vscode.debug.addBreakpoints(breakPoints);
				}
			});
	});
	context.subscriptions.push(addRegexBreakPoints);

	let removeRegexBreakPoints = vscode.commands.registerCommand('yeetpoint.removeRegex', () => {
		handleInput()
			.then((pattern) => {
				return findCurrentBreakPointsPattern(pattern);
			})
			.then((breakPoints) => {
				if (breakPoints) {
					vscode.debug.removeBreakpoints(breakPoints);
				}
			});
	});
	context.subscriptions.push(removeRegexBreakPoints);

	let removeBelowCurrentLine = vscode.commands.registerCommand('yeetpoint.removeBelowCurrentLine', () => {
		findBreakPointsAboveBelowCurrentLine('below')
			.then((breakPoints) => {
				if (!breakPoints) {
					return;
				}
				vscode.debug.removeBreakpoints(breakPoints);
			});
	});
	context.subscriptions.push(removeBelowCurrentLine);
	
	let removeAboveCurrentLine = vscode.commands.registerCommand('yeetpoint.removeAboveCurrentLine', () => {
		findBreakPointsAboveBelowCurrentLine('above')
			.then((breakPoints) => {
				if (!breakPoints) {
					return;
				}
				vscode.debug.removeBreakpoints(breakPoints);
			});
	});
	context.subscriptions.push(removeAboveCurrentLine);
}

// This method is called when your extension is deactivated
export function deactivate() { }
