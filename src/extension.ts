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

function getWorkspaceFolder(): string | undefined {
  return vscode.workspace.workspaceFolders?.map((wf) => wf.uri.fsPath)[0];
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
    const searchPhrase = await vscode.window.showInputBox({
      placeHolder: "Search phrase",
    });
    if (!searchPhrase) {
      vscode.window.showErrorMessage("no search phrase entered");
      return;
    }
    cmd = cmd.replace("${searchPhrase}", searchPhrase);
  }
  if (folder === "${projectFolder}") {
    folder =
      getfileWorkspaceFolder() ??
      getFileDirname() ??
      getWorkspaceFolder() ??
      "$HOME";
  }
  cmd = folder ? `cd ${folder} && ${cmd}` : cmd;
  const term =
    vscode.window.terminals.filter((t) => t.name === "vs-term")[0] ??
    vscode.window.createTerminal({ name: "vs-term" });
  vscode.window.showInformationMessage(`run in vs-term: ${cmd}`);
  // use below instead of term.sendText(`${cmd}`) for builtin variable evaluation.
  vscode.commands.executeCommand("workbench.action.terminal.sendSequence", {
    text: `${cmd}\x0d`,
  });
  term.show();
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
