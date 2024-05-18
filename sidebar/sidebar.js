const vscode = acquireVsCodeApi();
const progressDiv = document.getElementById('Progress');
const filePathDiv = document.getElementById('filePathDiv');
const recordedTestCasesDiv = document.getElementById('recordedTestCases');
const testResultsDiv = document.getElementById('testResults');
const recordCommandInput = document.getElementById('recordCommand');
const testCommandInput = document.getElementById('testCommand');
const stopRecordingButton = document.getElementById("stopRecordingButton");
const startRecordingButton = document.getElementById('startRecordingButton');
const startTestButton = document.getElementById('startTestingButton');
const stopTestButton = document.getElementById('stopTestingButton');
const openRecordPageButton = document.getElementById('openRecordPageButton');
const openTestPageButton = document.getElementById('openTestPageButton');
const navigateHomeButton = document.getElementById('navigateHomeButton');
const recordStatus = document.getElementById('recordStatus');
const testStatus = document.getElementById('testStatus');
const upperOutputDiv = document.getElementById('upperOutputDiv');
const generatedRecordCommandDiv = document.getElementById('recordCommandDiv');
const generatedTestCommandDiv = document.getElementById('testCommandDiv');
const viewCompleteSummaryButton = document.getElementById('viewCompleteSummaryButton');
const lastTestResultsDiv = document.getElementById('lastTestResults');
const testSuiteNameDiv = document.getElementById('testSuiteName');
const totalTestCasesDiv = document.getElementById('totalTestCases');
const testCasesPassedDiv = document.getElementById('testCasesPassed');
const testCasesFailedDiv = document.getElementById('testCasesFailed');
const rerunTestSuiteButton = document.getElementById('rerunTestSuiteButton');
const upperHR = document.getElementById('upperHR');
const lowerHR = document.getElementById('lowerHR');
const loader = document.getElementById('loader');
let FilePath = "";

//cleanup required

if (openRecordPageButton) {
  openRecordPageButton.addEventListener('click', async () => {
    console.log("openRecordPageButton clicked");
    vscode.postMessage({
      type: "navigate",
      value: "Keploy"
    });
  });
}

if (navigateHomeButton) {
  navigateHomeButton.addEventListener('click', async () => {
    console.log("navigateHomeButton clicked");
    vscode.postMessage({
      type: "navigate",
      value: "Main"
    });
  });
}
if (openTestPageButton) {
  openTestPageButton.addEventListener('click', async () => {
    console.log("openTestPageButton clicked");
    vscode.postMessage({
      type: "navigate",
      value: "Test"
    });
  });

}
if(rerunTestSuiteButton){
  rerunTestSuiteButton.addEventListener('click', async () => {
    console.log("rerunTestSuiteButton clicked");
    vscode.postMessage({
      type: "navigate",
      value: "Test"
    });
  });

}


const selectRecordFolderButton = document.getElementById('selectRecordFolderButton');
if (selectRecordFolderButton) {
  selectRecordFolderButton.addEventListener('click', async () => {
    console.log("selectRecordFolderButton clicked");
    vscode.postMessage({
      type: "selectRecordFolder",
      value: "Selecting Record Folder..."
    });
  });
}
const selectTestFolderButton = document.getElementById('selectTestFolderButton');
if (selectTestFolderButton) {
  selectTestFolderButton.addEventListener('click', async () => {
    console.log("selectTestFolderButton clicked");
    vscode.postMessage({
      type: "selectTestFolder",
      value: "Selecting Test Folder..."
    });
  });
}

async function getKeployVersion() {
  // GitHub repository details
  const repoOwner = "keploy";
  const repoName = "keploy";

  const apiURL = `https://api.github.com/repos/${repoOwner}/${repoName}/releases/latest`;

  // Get the latest release
  const response = await fetch(apiURL);
  const data = await response.json();
  const latestVersion = data.tag_name;
  return latestVersion;
}
// Create a function to update the version display
function updateVersionDisplay(version) {
  const versionDisplay = document.getElementById('versionDisplay');
  if (versionDisplay) {
    versionDisplay.innerHTML = `Latest version:
     <p>${version}</p>`;
  }
}



const getVersionButton = document.getElementById('getVersionButton');
if (getVersionButton) {
  getVersionButton.addEventListener('click', async () => {
    try {
      // Call the getKeployVersion function
      const version = await getKeployVersion();
      console.log(`The latest version of Keploy is ${version}`);
      // Update the version display
      updateVersionDisplay(version);
      // Post a message to the extension with the latest version
      vscode.postMessage({
        type: "onInfo",
        value: `The latest version of Keploy is ${version}`
      });
    } catch (error) {
      // Handle any errors that occur
      vscode.postMessage({
        type: "onError",
        value: `Error getting Keploy version: ${error.message}`
      });
    }
  });
}


if (startRecordingButton) {
  startRecordingButton.addEventListener('click', async () => {
    console.log("startRecordingButton clicked");
    const commandValue = recordCommandInput.value;
    recordedTestCasesDiv.innerHTML = "";
    console.log('Command value:', commandValue);
    FilePath = document.getElementById('recordProjectFolder').value;
    const generatedRecordCommand = document.getElementById('generatedRecordCommand');
    vscode.postMessage({
      type: "startRecordingCommand",
      value: `Recording Command...`,
      command: commandValue,
      filePath: FilePath,
      generatedRecordCommand: generatedRecordCommand.innerHTML
    });
  });
}
if (stopRecordingButton) {
  stopRecordingButton.addEventListener('click', async () => {
    console.log("stopRecordingButton clicked");
    vscode.postMessage({
      type: "stopRecordingCommand",
      value: `Stop Recording`
    });
  });
}
if (startTestButton) {
  startTestButton.addEventListener('click', async () => {
    console.log("startTestButton clicked");
    testStatus.innerHTML = "";
    const commandValue = testCommandInput.value;
    console.log('Command value:', commandValue);
    FilePath = document.getElementById('testProjectFolder').value;
    const generatedTestCommand = document.getElementById('generatedTestCommand');
    vscode.postMessage({
      type: "startTestingCommand",
      value: `Testing Command...`,
      command: commandValue,
      filePath: FilePath,
      generatedTestCommand: generatedTestCommand.innerHTML
    });
  });
}
if (stopTestButton) {
  stopTestButton.addEventListener('click', async () => {
    console.log("stopTestButton clicked");
    vscode.postMessage({
      type: "stopTestingCommand",
      value: `Stop Testing`
    });
  });
}

if (viewCompleteSummaryButton) {
  viewCompleteSummaryButton.addEventListener('click', async () => {
    console.log("viewCompleteSummaryButton clicked");

    vscode.postMessage({
      type: "navigate",
      value: `Testresults`
    });

    vscode.postMessage({
      type: "viewCompleteSummary",
      value: `View Complete Summary`
    });
  });

}

// Handle messages sent from the extension
window.addEventListener('message', event => {
  const message = event.data;
  console.log("message", message);
  if (message.type === 'updateStatus') {
    console.log("message.value", message.value);

  }
  else if (message.type === 'error') {
    console.error(message.value);
  }
  else if (message.type === 'success') {
    console.log(message.value);
  }
  else if (message.type === 'recordfile') {
    console.log(message.value);
    const recordProjectFolder = document.getElementById('recordProjectFolder');
    if (recordProjectFolder) {
      recordProjectFolder.value = message.value;
      FilePath = message.value;
    }
  }
  else if (message.type === 'testcaserecorded') {
    console.log("message.textContent", message.textContent);
    if (message.error === true) {
      recordStatus.textContent = `Failed To Test Test Cases`;
      recordStatus.Testist.add("error");
      const errorMessage = document.createElement('p class="error"');
      errorMessage.textContent = message.textContent;
      recordedTestCasesDiv.appendChild(errorMessage);
      return;
    }
    if (message.noTestCases === true) {
      recordStatus.textContent = `No Test Cases Recorded`;
      recordStatus.classList.add("info");
      return;
    }
    recordStatus.textContent = `Test Cases Recorded`;
    recordStatus.classList.add("success");
    console.log(message.textContent);
    const testCaseElement = document.createElement('button');
    testCaseElement.classList.add("recordedTestCase");
    testCaseElement.addEventListener('click', async () => {
      vscode.postMessage({
        type: "openRecordedTestFile",
        value: message.path
      });
    }
    );

    testCaseElement.textContent = message.textContent;
    recordedTestCasesDiv.appendChild(testCaseElement);
  }
  else if (message.type === "testResults") {
    console.log("message.value", message.value);
    const testCaseElement = document.createElement('p');
    testCaseElement.textContent = message.textSummary;
    if (message.textSummary.includes("test passed")) {
      testCaseElement.classList.add("success");
    }
    else if (message.textSummary.includes("test failed")) {
      testCaseElement.classList.add("error");
    }
    else {
      testCaseElement.classList.add("info");
    }
    if (message.isCompleteSummary === true) {
      console.log("message.isCompleteSummary", message.isCompleteSummary);
      let messageList = message.textSummary.split("\t");
      //remove all "" from the list
      messageList = messageList.filter(function (el) {
        return el !== '';
      });
      console.log("messageList", messageList);
      const testSuiteNameElement = document.createElement('p');
      testSuiteNameElement.textContent = messageList[0];
      testSuiteNameDiv.appendChild(testSuiteNameElement);
      const testCasesTotalElement = document.createElement('p');
      testCasesTotalElement.textContent = messageList[1];
      totalTestCasesDiv.appendChild(testCasesTotalElement);
      const testCasesPassedElement = document.createElement('p');
      testCasesPassedElement.textContent = messageList[2];
      testCasesPassedDiv.appendChild(testCasesPassedElement);
      const testCasesFailedElement = document.createElement('p');
      testCasesFailedElement.textContent = messageList[3];
      testCasesFailedDiv.appendChild(testCasesFailedElement);
      return;
    }
    if (message.isHomePage === true) {
      if (message.error === true) {
        if (lastTestResultsDiv) {
          lastTestResultsDiv.innerHTML = `<p class="error">No Test Runs Found</p>`;
          return;
        }
      }
      else {
        lastTestResultsDiv.appendChild(testCaseElement);
      }
      return;
    }
    if (message.error === true) {
      viewCompleteSummaryButton.style.display = "none";
    }
    else{
    viewCompleteSummaryButton.style.display = "block";
    }
    if (message.error === true) {
      if (testStatus) {
        testStatus.textContent = message.value;
        testStatus.classList.add("error");
      }
      else {
        testResultsDiv.innerHTML = `<p class="error">${message.value}</p>`;
      }
    }
    testResultsDiv.appendChild(testCaseElement);
  }
  else if (message.type === "testfile") {
    const testProjectFolder = document.getElementById('testProjectFolder');
    if (testProjectFolder) {
      testProjectFolder.value = message.value;
      FilePath = message.value;
    }
    const testCommandDiv = document.getElementById('testCommandInput');
    if (testCommandDiv) {
      testCommandDiv.style.display = "block";
    }

  }
});






