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
        
        // Unicode エスケープシーケンス (\uXXXX) のデコード
        results.push({
            method: 'Unicode Escape (\\uXXXX)',
            result: text.replace(/\\u([0-9a-fA-F]{4})/g, 
                (_, p1) => String.fromCharCode(parseInt(p1, 16)))
        });

        // Unicode コードポイント (U+XXXX) のデコード
        results.push({
            method: 'Unicode Codepoint (U+XXXX)',
            result: text.replace(/U\+([0-9a-fA-F]{4,6})/gi, 
                (_, p1) => String.fromCodePoint(parseInt(p1, 16)))
        });

        // UTF-8 バイト列のデコード
				const utf8Result = decodeUTF8Bytes(text);
				results.push({
						method: 'UTF-8 Bytes',
						result: utf8Result
				});
    } catch (error) {
        // エラーが発生しても処理を継続
    }
    
    return results;
}

function decodeUTF8Bytes(text: string): string {
    const pattern = /(?:\\[ux]?|u\+)((?:[0-9a-f][0-9a-f]){1,4})/gi;
    
    // パターンにマッチしない場合は、スペース区切りの16進数として処理
    if (!pattern.test(text)) {
        text = text.replace(/((?:[0-9a-f]){2})\s?/gi, (str, p1) => {
            const num = parseInt(p1, 16);
            if ((num >> 6) !== 0x02) {
                return '\\' + str;
            }
            return str;
        });
    }

    return text.replace(pattern, (str, p1) => {
        const num = parseInt(p1, 16);
        let codePoint = Number.NaN;

        if (num <= 0xff) {
            codePoint = num;
        }
        else if (num <= 0xffff) {
            codePoint = (num & 0x3f) | ((num >> 2) & 0x7c0);
        }
        else if (num <= 0xffffff) {
            codePoint = (num & 0x3f) | 
                       ((num >> 2) & 0xfc0) | 
                       ((num >> 4) & 0xf000);
        }
        else if (num <= 0xffffffff) {
            codePoint = (num & 0x3f) | 
                       ((num >> 2) & 0xfc0) | 
                       ((num >> 4) & 0x3f000) | 
                       ((num >> 6) & 0x1c0000);
        }

        return String.fromCodePoint(codePoint);
    });
}

function formatResults(results: DecodingResult[]): string {
	return results.map(r => 
		`=== ${r.method} ===\n${r.result}\n\n`
	).join('');
}

// This method is called when your extension is deactivated
export function deactivate() {}
