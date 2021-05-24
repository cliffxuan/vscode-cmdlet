// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as path from "path";

function getfileWorkspaceFolder(): string | undefined {
  const fileName = vscode.window.activeTextEditor?.document.fileName;
  return vscode.workspace.workspaceFolders
    ?.map((wf) => wf.uri.fsPath)
    .filter((fsPath) => fileName?.startsWith(fsPath))[0];
}

function getFileDirname(): string | undefined {
  const fileName = vscode.window.activeTextEditor?.document.fileName;
  return fileName ? path.dirname(fileName) : undefined;
}

function getWordUnderCursor(): string | undefined {
  const activeTextEditor = vscode.window.activeTextEditor;
  if (!activeTextEditor) {
    return;
  }
  const wordRange = activeTextEditor.document.getWordRangeAtPosition(
    activeTextEditor.selection.start
  );
  if (!wordRange) {
    return;
  }
  return activeTextEditor.document.getText(wordRange);
}

async function runCmd(cmd: string | undefined, folder: string | undefined) {
  cmd =
    cmd ??
    (await vscode.window.showInputBox({
      placeHolder: "Command to execute",
    }));
  if (!cmd) {
    vscode.window.showErrorMessage("no command entered");
    return;
  }
  if (cmd.includes("${wordUnderCursor}")) {
    const wordUnderCursor = getWordUnderCursor();
    if (!wordUnderCursor) {
      vscode.window.showErrorMessage("no word is under the cursor");
      return;
    }
    cmd = cmd.replace("${wordUnderCursor}", wordUnderCursor);
  }
  if (cmd.includes("${searchPhrase}")) {
    const searchPhrase = await vscode.window.showInputBox({placeHolder: "Search phrase"});
    if (!searchPhrase) {
      vscode.window.showErrorMessage("no search phrase entered");
      return;
    }
    cmd = cmd.replace("${searchPhrase}", searchPhrase);
  }
  if (folder) {
    if (folder === "${projectFolder}") {
      folder = getfileWorkspaceFolder() ?? getFileDirname();
    }
    cmd = `cd ${folder} && ${cmd}`;
  }
  vscode.window.showInformationMessage(`running cmd: ${cmd}`);
  vscode.commands.executeCommand("workbench.action.terminal.focus");
  vscode.commands.executeCommand("workbench.action.terminal.sendSequence", {
    text: `${cmd}\x0d`,
  });
}

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-term.runCmd",
      (
        args:
          | { cmd: string | undefined; folder: string | undefined }
          | undefined
      ) => {
        const { cmd, folder } = args ?? {};
        runCmd(cmd, folder);
      }
    )
  );
}

export function deactivate() {}
