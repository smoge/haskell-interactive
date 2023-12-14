import * as vscode from 'vscode';
import * as path from 'path';
import { kMaxLength } from 'buffer';





export function activate(context: vscode.ExtensionContext) {
	//let activeEditor = vscode.window.activeTextEditor;
	let decorationType = vscode.window.createTextEditorDecorationType({
		backgroundColor: 'rgba(255, 136, 0, 0.44)' // Example color, change as needed
	});

	let run_haskell_terminal = vscode.commands.registerCommand('haskell-interactive.run_haskell_terminal', () => {
		var editor = vscode.window.activeTextEditor;

		if (!editor) {
			return;
		}

		var terminal = getTerminal();

		let rangeToHighlight;
		if (editor.selection.isEmpty) {
			var selection = findMultiLines(editor);

			if (selection.max - selection.min === 0) {
				var text = editor.document.lineAt(editor.selection.start.line).text;
				rangeToHighlight = new vscode.Range(editor.selection.start.line, 0, editor.selection.start.line, text.length);
				sendTextToGhci(text, terminal, false);
			} else {
				var pos1 = new vscode.Position(selection.min, 0);
				var pos2 = new vscode.Position(selection.max, editor.document.lineAt(selection.max).text.length);
				var range = new vscode.Range(pos1, pos2);
				text = editor.document.getText(range);
				rangeToHighlight = range;
				sendTextToGhci(text, terminal, true);
			}
		}
		else {
			var text = editor.document.getText(editor.selection);
			if (!text) {
				return;
			}
			rangeToHighlight = new vscode.Range(editor.selection.start, editor.selection.end);
			sendTextToGhci(text, terminal, true);
		}

		if (editor) {
			editor.setDecorations(decorationType, [rangeToHighlight]);
			setTimeout(() => {
				if (editor) {
					editor.setDecorations(decorationType, []);
				}
			}, 1000); // Remove highlight after a delay
		}

		returnFocus();
	});




	context.subscriptions.push(run_haskell_terminal);
}

function returnFocus() {
	let config = vscode.workspace.getConfiguration("haskell-interactive");

	if (config.get("returnFocus") === "editor") {
		setTimeout(() => {
			vscode.window.activeTextEditor?.show();
		}, 50);
	}
}

function getTerminal(name: string = "haskell-interactive") {
	let config = vscode.workspace.getConfiguration("haskell-interactive");
	if (config.get("findSharedTerminals")) {
		var terminal = vscode.window.terminals.filter((x) => x.name.replace(" [Shared]", "") === name)[0];
	} else {
		var terminal = vscode.window.terminals.filter((x) => x.name === name)[0];
	}

	if (!terminal) {
		terminal = vscode.window.createTerminal(name);
		if (name === "haskell-interactive") {
			let command = config.get("ghciLaunchCommand") as string;
			terminal.sendText(command);
		}
	}
	terminal.show();
	return terminal;
}

function sendTextToGhci(text: string, terminal: vscode.Terminal, isMultiline: boolean = true) {

	if (isMultiline) {
		text = ":{\n" + text.trim() + "\n:}";
	}
	terminal.sendText(text);
}

function findMultiLines(editor: vscode.TextEditor) {
	let start = editor.selection.start.line;
	var tabsize = editor.options.tabSize as number;
	let min = start;

	while (min > 0) {
		var line = editor.document.lineAt(min).text;
		let startWithTab = line.startsWith(" ".repeat(tabsize));

		if (!startWithTab || line === "") {
			break;
		}
		min--;
	}
	var max = start;
	while (max < editor.document.lineCount - 1) {
		var line = editor.document.lineAt(max + 1).text;
		let startWithTab = line.startsWith(" ".repeat(tabsize));
		if (!startWithTab || line === "") {
			break;
		}
		max++;
	}

	let parts = editor.document.lineAt(min).text.split(" ");
	if (parts.length > 1) {
		let funcName = parts[0];

		while (min > 0) {
			let line = editor.document.lineAt(min - 1).text;
			if (line === "") { break; }

			let parts = line.split(" ");
			if (parts.length > 1 && parts[0] !== funcName) { break; }

			min--;
		}

		while (max < editor.document.lineCount - 1) {
			let line = editor.document.lineAt(max + 1).text;
			if (line === "") { break; }

			let parts = line.split(" ");
			if ((parts.length > 1 && parts[0] !== funcName) && (!line.startsWith(" ".repeat(tabsize)))) {
				break;
			}
			max++;
		}
	}

	return { "min": min, "max": max };
}

// this method is called when your extension is deactivated
export function deactivate() { }
