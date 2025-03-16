"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = __importStar(require("vscode"));
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "markdown-sort" is now active!');
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    // Sort Markdown List
    const sortCommand = vscode.commands.registerCommand('markdown-sort.list', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== 'markdown') {
            vscode.window.showInformationMessage('Please open a markdown file first.');
            return;
        }
        if (editor) {
            const document = editor.document;
            const selection = editor.selection;
            const selectedText = document.getText(selection);
            const lines = selectedText.split('\n').filter(line => line.trim() !== '');
            function buildTree(lines) {
                const root = { text: "", children: [] };
                const stack = [{ node: root, level: -1 }];
                lines.forEach((line) => {
                    const indent = line.search(/\S|$/);
                    const firstNonChar = line[indent];
                    if (firstNonChar !== '-' && firstNonChar !== '*' && firstNonChar !== '+') {
                        if (stack[stack.length - 1].level === -1) {
                            stack[stack.length - 1].node.text = (stack[stack.length - 1].node.text || '') + line + '\n';
                        }
                        else {
                            stack[stack.length - 1].node.text = (stack[stack.length - 1].node.text || '') + '\n' + line;
                        }
                    }
                    else {
                        const node = { text: line, children: [] };
                        while (stack.length > 0 && indent <= stack[stack.length - 1].level) {
                            stack.pop();
                        }
                        stack[stack.length - 1].node.children.push(node);
                        stack.push({ node, level: indent });
                    }
                });
                return root;
            }
            function sortTree(node) {
                if (node.children && node.children.length > 0) {
                    node.children.sort((a, b) => a.text.trim().localeCompare(b.text.trim()));
                    node.children.forEach(child => sortTree(child));
                }
            }
            const tree = buildTree(lines);
            console.log('Tree before sorting:', JSON.stringify(tree, null, 2));
            sortTree(tree);
            console.log('Tree after sorting:', JSON.stringify(tree, null, 2));
            function treeToString(node, level) {
                let result = '';
                if (node.text) {
                    result += node.text;
                }
                if (node.children && node.children.length > 0) {
                    node.children.forEach(child => {
                        result += treeToString(child, level + 1);
                    });
                }
                return result;
            }
            const sortedLines = treeToString(tree, 0);
            editor.edit(editBuilder => {
                editBuilder.replace(selection, sortedLines);
            });
        }
        else {
            vscode.window.showInformationMessage('Please select some text first.');
        }
    });
    context.subscriptions.push(sortCommand);
}
// This method is called when your extension is deactivated
function deactivate() { }
//# sourceMappingURL=extension.js.map