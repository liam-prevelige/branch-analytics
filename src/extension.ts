import * as vscode from 'vscode';

let activeTime: { [key: string]: number } = {};
let lastActiveTimestamp: number | null = null;

function updateActiveTime() {
    const currentBranch = getCurrentBranch();
    if (currentBranch && lastActiveTimestamp) {
        const currentTime = Date.now();
        const elapsedTime = currentTime - lastActiveTimestamp;
        activeTime[currentBranch] = (activeTime[currentBranch] || 0) + elapsedTime;
        lastActiveTimestamp = currentTime;
    }
}

function getCurrentBranch(): string | null {
	const extension = vscode.extensions.getExtension('vscode.git');
	if (!extension) {
		return null;
	}
    const gitExtension = extension.exports;
    const api = gitExtension.getAPI(1);
    const repo = api.repositories[0];
    return repo.state.HEAD?.name || null;
}

export function activate(context: vscode.ExtensionContext) {
    vscode.window.onDidChangeTextEditorSelection(updateActiveTime);
    vscode.window.onDidChangeWindowState((e) => {
        if (e.focused) {
            lastActiveTimestamp = Date.now();
        } else {
            updateActiveTime();
            lastActiveTimestamp = null;
        }
    });

    context.subscriptions.push(vscode.commands.registerCommand('extension.showActiveTime', () => {
        updateActiveTime();  // Update before showing the results
        vscode.window.showInformationMessage(JSON.stringify(activeTime));
    }));
}

export function deactivate() {
    // When the extension is deactivated, ensure any pending time is recorded.
    updateActiveTime();
}