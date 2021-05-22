// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as path from "path";

function getDocumentWorkspaceFolder(): string | undefined {
  const fileName = vscode.window.activeTextEditor?.document.fileName;
  return vscode.workspace.workspaceFolders
    ?.map((wf) => wf.uri.fsPath)
    .filter((fsPath) => fileName?.startsWith(fsPath))[0];
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "vscode-rg-fzf" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const rgFzf = vscode.commands.registerCommand("vscode-rg-fzf.rgFzf", () => {
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
      vscode.window.showErrorMessage("no active editor");
      return;
    }

    const folder =
      getDocumentWorkspaceFolder() ||
      path.dirname(activeEditor.document.fileName);

    const wordRange = activeEditor.document.getWordRangeAtPosition(
      activeEditor.selection.start
    );
    if (!wordRange) {
      return;
    }
    const wordText = activeEditor.document.getText(wordRange);
    vscode.commands.executeCommand("workbench.action.terminal.focus");
    vscode.commands.executeCommand("workbench.action.terminal.sendSequence", {
      text: `cd ${folder}\x0d`,
    });
    vscode.commands.executeCommand("workbench.action.terminal.sendSequence", {
      text: `xx --editor code ${wordText}\x0d`,
    });
  });

  const fdFzf = vscode.commands.registerCommand("vscode-rg-fzf.fdFzf", () => {
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
      vscode.window.showErrorMessage("no active editor");
      return;
    }

    const folder =
      getDocumentWorkspaceFolder() ||
      path.dirname(activeEditor.document.fileName);
    vscode.commands.executeCommand("workbench.action.terminal.focus");
    vscode.commands.executeCommand("workbench.action.terminal.sendSequence", {
      text: `cd ${folder}\x0d`,
    });
    vscode.commands.executeCommand("workbench.action.terminal.sendSequence", {
      text: `xf\x0d`,
    });
  });

  context.subscriptions.push(rgFzf);
  context.subscriptions.push(fdFzf);
}

// this method is called when your extension is deactivated
export function deactivate() {}
