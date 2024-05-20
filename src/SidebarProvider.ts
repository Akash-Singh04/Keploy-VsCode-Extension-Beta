import * as vscode from "vscode";
// import context from "vscode";
import { getNonce } from "./Utils";
// import { downloadAndUpdate , downloadAndInstallKeployBinary ,downloadAndUpdateDocker  } from './updateKeploy';
import { startRecording , stopRecording } from "./Record";
import { startTesting , stopTesting ,  displayTestCases } from "./Test";

const recordOptions: vscode.OpenDialogOptions = {
  canSelectFolders: true,
  canSelectMany: false,
  openLabel: 'Select folder to record test cases for',
  title: 'Select folder to record test cases for',
};

const testOptions: vscode.OpenDialogOptions = {
  canSelectFolders: true,
  canSelectMany: false,
  openLabel: 'Select folder to run test cases for',
  title: 'Select folder to run test cases for',
};


export class SidebarProvider implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;
  _doc?: vscode.TextDocument;

  constructor(private readonly _extensionUri: vscode.Uri) {
   }

   public postMessage(type: any, value: any) {
    console.log('postMessage');
    this._view?.webview.postMessage({ type: type, value: value });
  }

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [
        this._extensionUri,
        vscode.Uri.joinPath(this._extensionUri, "out", "compiled"),
        vscode.Uri.joinPath(this._extensionUri, "media"),
        vscode.Uri.joinPath(this._extensionUri, "sidebar"),
        vscode.Uri.joinPath(this._extensionUri, "scripts"),

      ],
    };
    const scriptUri = webviewView.webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "out", "compiled/Home.js")
    );
    const compiledCSSUri = webviewView.webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "out", "compiled/Home.css")
    );
    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview ,  compiledCSSUri , scriptUri);

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case "onInfo": {
          if (!data.value) {
            return;
          }
          vscode.window.showInformationMessage(data.value);
          break;
        }
        case "onError": {
          if (!data.value) {
            return;
          }
          vscode.window.showErrorMessage(data.value);
          break;
        }
        case "selectRecordFolder": {
          if (!data.value) {
            return;
          } try {
            console.log('Opening Record Dialogue Box...');
            vscode.window.showOpenDialog(recordOptions).then(async fileUri => {
              if (fileUri && fileUri[0]) {
                console.log('Selected file: ' + fileUri[0].fsPath);
                this._view?.webview.postMessage({ type: 'recordfile', value: `${fileUri[0].fsPath}` });
              }
            });
          } catch (error) {
            this._view?.webview.postMessage({ type: 'error', value: `Failed to record ${error}` });
          }
          break;
        }
        case 'startRecordingCommand' : {
          if (!data.value) {
            return;
          }
          try {
            console.log('Start Recording button clicked');

            const script =  vscode.Uri.joinPath(this._extensionUri, "scripts", "keploy_record_script.sh");
            const logfilePath =  vscode.Uri.joinPath(this._extensionUri, "scripts", "keploy_record_script.log");
            let wslscriptPath = script.fsPath;
            let wsllogPath = logfilePath.fsPath;
            if(process.platform === 'win32'){
              //convert filepaths to windows format
              wslscriptPath = wslscriptPath.replace(/\\/g, '/');
              wsllogPath = wsllogPath.replace(/\\/g, '/');
              //add /mnt/ to the start of the path
              wslscriptPath = '/mnt/' + wslscriptPath;
              wsllogPath = '/mnt/' + wsllogPath;
              // remove : from the path
              wslscriptPath = wslscriptPath.replace(/:/g, '');
              wsllogPath = wsllogPath.replace(/:/g, '');
            }
            console.log("script path" + wslscriptPath);
            console.log(wsllogPath);

            
            await startRecording(data.command , data.filePath , data.generatedRecordCommand ,  wslscriptPath , wsllogPath , script.fsPath , logfilePath.fsPath , this._view?.webview );
            this._view?.webview.postMessage({ type: 'success', value: 'Recording Started' });
            this._view?.webview.postMessage({ type: 'writeRecord', value: 'Write Recorded test cases ', logfilePath: logfilePath.fsPath });
          } catch (error) {
            this._view?.webview.postMessage({ type: 'error', value: `Failed to record ${error}` });
          }
          break;
        }
        case 'stopRecordingCommand' : {
          if (!data.value) {
            return;
          }
          try{
            console.log("Stopping recording");
            await stopRecording();

          }
          catch(error){
            this._view?.webview.postMessage({ type: 'error', value: `Failed to Stop record ${error}` });
          }
          break;
        }

        case "selectTestFolder":{
          if (!data.value) {
            return;
          }
          try {
            console.log('Opening Test Dialogue Box...');
            vscode.window.showOpenDialog(testOptions).then(async fileUri => {
              if (fileUri && fileUri[0]) {
                console.log('Selected file: ' + fileUri[0].fsPath);
                this._view?.webview.postMessage({ type: 'testfile', value: `${fileUri[0].fsPath}` });
              }
            });
          } catch (error) {
            this._view?.webview.postMessage({ type: 'error', value: `Failed to test ${error}` });
          }
          break;
        }

        case 'startTestingCommand' : {
          if (!data.value) {
            return;
          }
          try {
            console.log('Start Testing button clicked');
            const script =  vscode.Uri.joinPath(this._extensionUri, "scripts", "keploy_test_script.sh");
            const logfilePath =  vscode.Uri.joinPath(this._extensionUri, "scripts", "keploy_test_script.log");
            let wslscriptPath = script.fsPath;
            let wsllogPath = logfilePath.fsPath;
            if(process.platform === 'win32'){
              //convert filepaths to windows format
              wslscriptPath = wslscriptPath.replace(/\\/g, '/');
              wsllogPath = wsllogPath.replace(/\\/g, '/');
              //add /mnt/ to the start of the path
              wslscriptPath = '/mnt/' + wslscriptPath;
              wsllogPath = '/mnt/' + wsllogPath;
              // remove : from the path
              wslscriptPath = wslscriptPath.replace(/:/g, '');
              wsllogPath = wsllogPath.replace(/:/g, '');
            }
            console.log("script path" + wslscriptPath);
            console.log(wsllogPath);
            // await startTesting(data.command , data.filePath , data.generatedTestCommand  ,wslscriptPath , wsllogPath , script.fsPath , logfilePath.fsPath ,this._view?.webview );
          } catch (error) {
            this._view?.webview.postMessage({ type: 'error', value: `Failed to test ${error}` });
          }
          break;
        } 
        case 'stopTestingCommand' : {
          if (!data.value) {
            return;
          }
          try{
            console.log("Stopping Testing");
            // await stopTesting();
          }
          catch(error){
            this._view?.webview.postMessage({ type: 'error', value: `Failed to Stop Testing ${error}` });
          }
          break;
        }
        case "navigate" : {
          if (!data.value) {
            return;
          }
          try {
            console.log('Navigate to ' + data.value);
            const recordPageJs = webviewView.webview.asWebviewUri(
              vscode.Uri.joinPath(this._extensionUri, "out", `compiled/${data.value}.js`)
            );
            const recordPageCss = webviewView.webview.asWebviewUri(
              vscode.Uri.joinPath(this._extensionUri, "out", `compiled/${data.value}.css`)
            );
            webviewView.webview.html = this._getHtmlForWebview(webviewView.webview ,  recordPageCss , recordPageJs);
            this._view?.webview.postMessage({ type: 'openRecordPage', value: 'Record Page opened' });
        
          } catch (error) {
            this._view?.webview.postMessage({ type: 'error', value: `Failed to open record page ${error}` });
          }
          break;
        }
        case "openRecordedTestFile": {
          if (!data.value) {
            return;
          }
          try {
            console.log('Opening Recorded Test File...' + data.value);
            vscode.workspace.openTextDocument(data.value).then(doc => {
              vscode.window.showTextDocument(doc, { preview: false });
            });
          } catch (error) {
            this._view?.webview.postMessage({ type: 'error', value: `Failed to open recorded test file ${error}` });
          }
          break;
        }

        case "viewCompleteSummary" : {
          if (!data.value) {
            return;
          }
          try {
            console.log('Opening Complete Summary...');
            const logfilePath =  vscode.Uri.joinPath(this._extensionUri, "scripts", "keploy_test_script.log");
            // displayTestCases(logfilePath.fsPath, this._view?.webview , false , true);
          } catch (error) {
            this._view?.webview.postMessage({ type: 'error', value: `Failed to open complete summary ${error}` });
          }
          break;

        }
      }

    });
  }

  public revive(panel: vscode.WebviewView) {
    this._view = panel;
  }
  private _getHtmlForWebview(webview: vscode.Webview , compiledCSSUri: vscode.Uri , scriptUri: vscode.Uri) {
    const styleResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "reset.css")
    );
    
    const styleMainUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "sidebar", "sidebar.css")
    );
    const scriptMainUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "sidebar", "sidebar.js")
    );

    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css")
    );

    // Use a nonce to only allow a specific script to be run.
    const nonce = getNonce();
    //read the global state to check if the user is signed in
    

    // webview.postMessage({ type: 'displayPreviousTestResults', value: 'Displaying Previous Test Results' });
    // const logfilePath =  vscode.Uri.joinPath(this._extensionUri, "scripts", "keploy_test_script.log");
    //call the function below after 3 seconds
    // setTimeout(() => {
    //   displayTestCases(logfilePath.fsPath, webview ,  true , false);
    // }, 3000);
    // displayTestCases(logfilePath.fsPath, webview);
   

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
        -->
        <meta http-equiv="Content-Security-Policy" content="img-src https: data:; style-src 'unsafe-inline' ${webview.cspSource
      }; script-src 'nonce-${nonce}';">    
  	<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleResetUri}" rel="stylesheet">
				<link href="${styleVSCodeUri}" rel="stylesheet">
        <link href="${styleMainUri}" rel="stylesheet">
        <link href="${compiledCSSUri}" rel="stylesheet">
			</head>
      <body>
				<script nonce="${nonce}" src="${scriptUri}"></script>
        <script type="module" nonce="${nonce}" src="${scriptMainUri}"></script>
			</body>
			</html>`;
  }
}
