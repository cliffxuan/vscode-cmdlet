// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "vscode-rg-fzf" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand("vscode-rg-fzf.rgFzf", () => {
    // The code you place here will be executed every time your command is executed

    // Display a message box to the user
    let editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    let wordRange = editor.document.getWordRangeAtPosition(
      editor.selection.start
    );
    if (!wordRange) {
      return;
    }

    let wordText = editor.document.getText(wordRange);
    vscode.commands.executeCommand("workbench.action.terminal.focus");
    vscode.commands.executeCommand("workbench.action.terminal.sendSequence", {
      text: `xx ${wordText}\x0d`,
    });
  });

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
