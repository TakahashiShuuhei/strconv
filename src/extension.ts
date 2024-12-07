// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// コンテキストメニューコマンドを登録
	let disposable = vscode.commands.registerTextEditorCommand('strconv.decodeString', 
		async (editor: vscode.TextEditor) => {
			// 選択されているテキストを取得
			const selection = editor.selection;
			const text = editor.document.getText(selection);
			
			if (!text) {
				vscode.window.showWarningMessage('テキストが選択されていません');
				return;
			}

			// デコード処理を実行
			const results = await decodeWithVariousMethods(text);
			
			// 新しいタブで結果を表示
			const document = await vscode.workspace.openTextDocument({
				content: formatResults(results),
				language: 'text'
			});
			
			vscode.window.showTextDocument(document);
		});

	context.subscriptions.push(disposable);
}

interface DecodingResult {
	method: string;
	result: string;
}

async function decodeWithVariousMethods(text: string): Promise<DecodingResult[]> {
	const results: DecodingResult[] = [];
	
	try {
		// URLデコード
		results.push({
			method: 'URL Decode',
			result: decodeURIComponent(text)
		});
		
		// Base64デコード
		results.push({
			method: 'Base64 Decode',
			result: Buffer.from(text, 'base64').toString('utf-8')
		});
		
		// Unicode エスケープシーケンスのデコード
		results.push({
			method: 'Unicode Escape',
			result: text.replace(/\\u([0-9a-fA-F]{4})/g, 
				(_, p1) => String.fromCharCode(parseInt(p1, 16)))
		});
		
	} catch (error) {
		// エラーが発生しても処理を継続
	}
	
	return results;
}

function formatResults(results: DecodingResult[]): string {
	return results.map(r => 
		`=== ${r.method} ===\n${r.result}\n\n`
	).join('');
}

// This method is called when your extension is deactivated
export function deactivate() {}
