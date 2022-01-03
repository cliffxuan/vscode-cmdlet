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

function getOpenFiles(): string[] {
  return vscode.workspace.textDocuments
    .map((d) => d.fileName)
    .filter((f) => !f.endsWith(".git"));
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

async function runCmd(
  cmd: string | undefined,
  folder: string | undefined,
  termName: string | undefined
) {
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
  if (cmd.includes("${openFiles}")) {
    cmd = cmd.replace("${openFiles}", getOpenFiles().join("\n"));
  }
  if (folder === "${projectFolder}") {
    folder =
      getfileWorkspaceFolder() ??
      getFileDirname() ??
      getWorkspaceFolder() ??
      "$HOME";
  }
  cmd = folder ? `cd ${folder} && ${cmd}` : cmd;
  termName = "cmdlet";
  const term =
    vscode.window.terminals.filter((t) => t.name === termName)[0] ??
    vscode.window.createTerminal({ name: termName });
  vscode.window.showInformationMessage(`run in ${termName}: ${cmd}`);
  for (let i = 0; i < 10; i++) {
    if (i === 0) {
      term.show();
    } else if (i === 10) {
      vscode.window.showErrorMessage(`failed to open terminal ${termName}`);
    }
    if (term === vscode.window.activeTerminal) {
      break;
    }
    await new Promise(res => setTimeout(res, 100));
  }
  await vscode.commands.executeCommand("workbench.action.terminal.clear");
  // use below instead of term.sendText(`${cmd}`) for builtin variable substitution.
  vscode.commands.executeCommand("workbench.action.terminal.sendSequence", {
    text: `${cmd}\x0d`,
  });
}

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "cmdlet.runCmd",
      (
        args:
          | { cmd: string | undefined; folder: string | undefined }
          | undefined
      ) => {
        const { cmd, folder } = args ?? {};
        runCmd(cmd, folder, undefined);
      }
    )
  );
}

export function deactivate() {}
