<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>The Security Buzz: SRA App</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <style>
        .step {
            min-height: 450px;
        }
    </style>
</head>
<body class="bg-gray-100 font-sans antialiased text-gray-800">

    <!-- Landing Page -->
    <div id="landing-page" class="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-gray-900 text-white">
        <div class="mb-6">
           <!-- FIX: Corrected image extension to .jpg to match the uploaded file -->
           <img src="tsb-no-circuit.jpg" alt="The Security Buzz Logo" class="mx-auto max-w-xs rounded-lg shadow-lg mb-4">
        </div>
        <h1 class="text-4xl md:text-5xl font-extrabold mb-4 text-blue-400">Create a Simple Security Risk Analysis</h1>
        <p class="text-lg md:text-xl max-w-2xl mb-8">
            This tool will walk you through a simple six-step process to help you identify, analyze, and treat potential security risks to your business.
        </p>
        <button id="start-app-btn" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition-transform duration-200 hover:scale-105">
            Start Here
        </button>
    </div>

    <!-- Main Application Container -->
    <div id="app-container" class="hidden min-h-screen flex items-center justify-center p-4">
        <div class="bg-white rounded-xl shadow-2xl p-8 max-w-4xl w-full my-8">
            <div class="flex justify-between items-center mb-6 border-b pb-4">
                <h1 id="step-title" class="text-2xl md:text-3xl font-extrabold text-blue-800"></h1>
                <span id="user-id" class="text-xs text-gray-500"></span>
            </div>
            <div id="step-content" class="step"></div>
            <div id="nav-buttons" class="mt-8 flex justify-between">
                <button id="prev-btn" class="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-md transition-colors duration-200">Previous</button>
                <button id="next-btn" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md transition-colors duration-200">Next Step</button>
            </div>
        </div>
    </div>
    
    <!-- Report Container -->
    <div id="report-container" class="hidden min-h-screen flex items-center justify-center p-4">
        <div class="bg-white rounded-xl shadow-2xl p-8 max-w-4xl w-full my-8">
            <div id="report-content"></div>
            <div class="mt-8 flex justify-end">
                <button id="report-back-btn" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md transition-colors duration-200">Back to Editor</button>
            </div>
        </div>
    </div>
    
    <!-- Modal for messages -->
    <div id="modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div class="bg-white p-6 rounded-lg shadow-lg">
            <p id="modal-message"></p>
            <button id="modal-close" class="mt-4 bg-blue-500 text-white px-4 py-2 rounded">Close</button>
        </div>
    </div>

    <script type="module">
        // Firebase SDKs and other library imports
        import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
        import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
        import { getFirestore, doc, setDoc, onSnapshot, setLogLevel } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

        // Set Firebase log level for debugging
        setLogLevel('debug');

        // *** YOUR FIREBASE CONFIGURATION ***
        const firebaseConfig = {
            apiKey: "AIzaSyBHOENHyjr0_lUVpLboWcUhrSQqEMJLiEI",
            authDomain: "sra-template.firebaseapp.com",
            projectId: "sra-template",
            storageBucket: "sra-template.firebasestorage.app",
            messagingSenderId: "18970200035",
            appId: "1:18970200035:web:b268762237703591d602d6",
        };

        // --- App Initialization wrapped in a function to be called later ---
        function main() {
            let app, db, auth;
            let userId = null;
            let sraData = {};
            let currentStep = 1;
            const totalSteps = 6;
            const collectionName = 'sra_assessments';

            // UI Elements
            const landingPage = document.getElementById('landing-page');
            const appContainer = document.getElementById('app-container');
            const startButton = document.getElementById('start-app-btn');
            const userIdDisplay = document.getElementById('user-id');
            const modal = document.getElementById('modal');
            const modalMessage = document.getElementById('modal-message');
            const modalClose = document.getElementById('modal-close');
            const stepTitleElement = document.getElementById('step-title');
            const prevButton = document.getElementById('prev-btn');
            const nextButton = document.getElementById('next-btn');
            const reportContainer = document.getElementById('report-container');
            const reportContent = document.getElementById('report-content');

            const riskMatrix = { 'Almost Certain': { 'Insignificant': 'Medium', 'Minor': 'High', 'Moderate': 'High', 'Major': 'Extreme', 'Catastrophic': 'Extreme' }, 'Likely': { 'Insignificant': 'Low', 'Minor': 'Medium', 'Moderate': 'High', 'Major': 'High', 'Catastrophic': 'Extreme' }, 'Possible': { 'Insignificant': 'Low', 'Minor': 'Low', 'Moderate': 'Medium', 'Major': 'High', 'Catastrophic': 'High' }, 'Unlikely': { 'Insignificant': 'Low', 'Minor': 'Low', 'Moderate': 'Low', 'Major': 'Medium', 'Catastrophic': 'High' }, 'Rare': { 'Insignificant': 'Low', 'Minor': 'Low', 'Moderate': 'Low', 'Major': 'Low', 'Catastrophic': 'Medium' } };
            const riskColors = { 'Low': 'bg-green-500', 'Medium': 'bg-yellow-500', 'High': 'bg-orange-500', 'Extreme': 'bg-red-500' };

            function showMessage(message) { modalMessage.textContent = message; modal.classList.remove('hidden'); }
            modalClose.addEventListener('click', () => modal.classList.add('hidden'));

            async function initFirebase() {
                try {
                    app = initializeApp(firebaseConfig);
                    db = getFirestore(app);
                    auth = getAuth(app);
                    onAuthStateChanged(auth, async (user) => {
                        userId = user ? user.uid : (await signInAnonymously(auth)).user.uid;
                        userIdDisplay.textContent = `User ID: ${userId}`;
                        setupFirestoreListener();
                    });
                } catch (error) { console.error("Firebase init error:", error); showMessage("Failed to connect to the database."); }
            }

            function setupFirestoreListener() {
                if (!userId) return;
                const docRef = doc(db, collectionName, userId);
                onSnapshot(docRef, (docSnap) => {
                    sraData = docSnap.exists() ? docSnap.data() : {};
                    console.log("Data loaded from Firestore:", sraData);
                    updateUI();
                }, (error) => { console.error("Error fetching document:", error); showMessage("Error fetching your saved data."); });
            }

            async function saveData() {
                if (!userId) return;
                try {
                    await setDoc(doc(db, collectionName, userId), sraData, { merge: true });
                    console.log("Data saved!");
                } catch (error) { console.error("Error saving document:", error); showMessage("Error saving your progress."); }
            }

            function updateUI() {
                document.getElementById('step-content').innerHTML = getStepContent(currentStep);
                if (appContainer.classList.contains('hidden')) return;
                prevButton.classList.toggle('hidden', currentStep === 1);
                const isLastStep = currentStep === totalSteps;
                nextButton.textContent = isLastStep ? 'View Report' : 'Next Step';
                nextButton.classList.toggle('bg-blue-600', !isLastStep);
                nextButton.classList.toggle('hover:bg-blue-700', !isLastStep);
                nextButton.classList.toggle('bg-green-600', isLastStep);
                nextButton.classList.toggle('hover:bg-green-700', isLastStep);
                const titles = ['Step 1: Establish Context', 'Step 2: Identify Risks', 'Step 3: Analyze Risks', 'Step 4: Evaluate Risks', 'Step 5: Treat Risks', 'Step 6: Monitor and Review'];
                stepTitleElement.textContent = titles[currentStep - 1] || 'Security Risk Assessment';
                renderDataIntoForm();
                setupStepSpecificListeners();
            }
            
            function renderDataIntoForm() {
                document.querySelectorAll('#step-content textarea').forEach(textarea => { textarea.value = sraData[textarea.id] || ''; });
                if (currentStep === 3) {
                    const riskTableBody = document.getElementById('risk-table-body');
                    if (riskTableBody) {
                        riskTableBody.innerHTML = '';
                        (sraData.riskScenarios || []).forEach((risk, index) => {
                            const riskLevel = (risk.likelihood && risk.impact && riskMatrix[risk.likelihood]) ? riskMatrix[risk.likelihood][risk.impact] : '-';
                            const colorClass = riskLevel !== '-' ? riskColors[riskLevel] : 'bg-gray-200 text-black';
                            riskTableBody.innerHTML += `<tr><td class="p-2 border"><input type="text" data-index="${index}" data-field="scenario" class="w-full p-1 border rounded" value="${risk.scenario || ''}" placeholder="e.g., Theft of cash"></td><td class="p-2 border"><input type="text" data-index="${index}" data-field="asset" class="w-full p-1 border rounded" value="${risk.asset || ''}" placeholder="e.g., Cash register"></td><td class="p-2 border"><select data-index="${index}" data-field="likelihood" class="w-full p-1 border rounded bg-white"><option value="">Select...</option>${Object.keys(riskMatrix).map(l => `<option value="${l}" ${risk.likelihood === l ? 'selected' : ''}>${l}</option>`).join('')}</select></td><td class="p-2 border"><select data-index="${index}" data-field="impact" class="w-full p-1 border rounded bg-white"><option value="">Select...</option>${Object.keys(riskMatrix['Rare']).map(i => `<option value="${i}" ${risk.impact === i ? 'selected' : ''}>${i}</option>`).join('')}</select></td><td data-index="${index}" data-field="riskLevel" class="p-2 border text-center font-bold text-white ${colorClass}">${riskLevel}</td><td class="p-2 border text-center"><button data-index="${index}" class="remove-risk-btn text-red-500 hover:text-red-700 font-semibold">X</button></td></tr>`;
                        });
                    }
                }
                if (currentStep === 5) {
                    const container = document.getElementById('treatment-plans-container');
                    if(container) {
                        container.innerHTML = '';
                        (sraData.treatmentPlans || []).forEach((plan, index) => {
                            container.innerHTML += `<div class="bg-gray-100 p-4 rounded-lg border"><div class="flex justify-between items-center mb-2"><h4 class="font-bold text-lg">Treatment Plan #${index + 1}</h4><button data-index="${index}" class="remove-treatment-btn text-red-500 hover:text-red-700 font-semibold">X</button></div><div class="mb-2"><label class="block text-sm font-medium">Risk to Treat:</label><input type="text" data-index="${index}" data-field="risk" class="w-full p-2 border rounded" value="${plan.risk || ''}" placeholder="e.g., Burglary"></div><div class="mb-2"><label class="block text-sm font-medium">Treatment Option:</label><select data-index="${index}" data-field="treatmentOption" class="w-full p-2 border rounded bg-white"><option value="">Select...</option><option value="Avoid" ${plan.treatmentOption === 'Avoid' ? 'selected' : ''}>Avoid</option><option value="Mitigate" ${plan.treatmentOption === 'Mitigate' ? 'selected' : ''}>Mitigate</option><option value="Transfer" ${plan.treatmentOption === 'Transfer' ? 'selected' : ''}>Transfer</option><option value="Accept" ${plan.treatmentOption === 'Accept' ? 'selected' : ''}>Accept</option></select></div><div><label class="block text-sm font-medium">Action Plan:</label><textarea data-index="${index}" data-field="actionPlan" class="w-full p-2 border rounded h-20" placeholder="e.g., Install new locks, add security cameras.">${plan.actionPlan || ''}</textarea></div></div>`;
                        });
                    }
                }
            }

            function getStepContent(step) {
                switch (step) {
                    case 1: return `<p class="mb-4 text-gray-600">Define the scope of your assessment. Clearly state what you are protecting, the boundaries, and the criteria for measuring risk.</p><div class="mb-4"><label for="assets" class="block text-gray-700 font-medium mb-1">Identified Assets:</label><textarea id="assets" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24" placeholder="e.g., Retail Storefront, Inventory, Employees"></textarea></div><div class="mb-4"><label for="boundaries" class="block text-gray-700 font-medium mb-1">Boundaries:</label><textarea id="boundaries" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24" placeholder="e.g., The physical premises of the retail store and warehouse"></textarea></div><div class="mb-4"><label for="businessObjectives" class="block text-gray-700 font-medium mb-1">Business Objectives:</label><textarea id="businessObjectives" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24" placeholder="e.g., Protect physical assets, Ensure employee safety, Minimize financial loss"></textarea></div><div class="mb-4"><label for="riskCriteria" class="block text-gray-700 font-medium mb-1">Risk Criteria:</label><textarea id="riskCriteria" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24" placeholder="Likelihood: Rare, Unlikely, Possible, Likely, Almost Certain. Impact: Insignificant, Minor, Moderate, Major, Catastrophic."></textarea></div>`;
                    case 2: return `<p class="mb-4 text-gray-600">Brainstorm potential threats and vulnerabilities that could exploit your assets.</p><div class="mb-4"><label for="threats" class="block text-gray-700 font-medium mb-1">Brainstormed Threats:</label><textarea id="threats" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24" placeholder="e.g., Burglary, Vandalism, Fire, Armed Robbery"></textarea></div><div class="mb-4"><label for="vulnerabilities" class="block text-gray-700 font-medium mb-1">Identified Vulnerabilities:</label><textarea id="vulnerabilities" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24" placeholder="e.g., No security cameras, Weak locks, Poor lighting"></textarea></div><div class="mb-4"><label for="threatsToAssets" class="block text-gray-700 font-medium mb-1">Threats to Assets (Link them):</label><textarea id="threatsToAssets" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24" placeholder="e.g., Inventory & Equipment: Theft (due to weak locks)"></textarea></div>`;
                    case 3: return `<p class="mb-4 text-gray-600">Evaluate each risk by assessing its likelihood and impact. Add new risks to the table below.</p><div class="mb-4 overflow-x-auto"><table id="risk-table" class="min-w-full bg-white border border-gray-300 rounded-md"><thead><tr class="bg-gray-200"><th class="p-2 border">Risk Scenario</th><th class="p-2 border">Asset(s)</th><th class="p-2 border">Likelihood</th><th class="p-2 border">Impact</th><th class="p-2 border">Risk Level</th><th class="p-2 border">Action</th></tr></thead><tbody id="risk-table-body"></tbody></table></div><button id="add-risk-btn" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 mt-2">Add New Risk</button>`;
                    case 4: return `<p class="mb-4 text-gray-600">Prioritize the risks based on their levels. Focus on the highest-level risks first.</p><div class="mb-4"><label for="highPriority" class="block text-gray-700 font-medium mb-1">Highest Priority Risks:</label><textarea id="highPriority" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24" placeholder="e.g., Burglary, Armed Robbery"></textarea></div><div class="mb-4"><label for="mediumPriority" class="block text-gray-700 font-medium mb-1">Medium Priority Risks:</label><textarea id="mediumPriority" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24" placeholder="e.g., Vandalism, Fire"></textarea></div><div class="mb-4"><label for="lowPriority" class="block text-gray-700 font-medium mb-1">Lowest Priority Risks:</label><textarea id="lowPriority" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24" placeholder="e.g., None in this assessment"></textarea></div><div class="mb-4"><label for="evaluationSummary" class="block text-gray-700 font-medium mb-1">Evaluation Summary:</label><textarea id="evaluationSummary" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24" placeholder="Summarize your key findings and priorities."></textarea></div>`;
                    case 5: return `<p class="mb-4 text-gray-600">Develop a plan to treat your highest-priority risks. Add a treatment plan for each.</p><div id="treatment-plans-container" class="space-y-4"></div><button id="add-treatment-btn" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 mt-4">Add Treatment Plan</button>`;
                    case 6: return `<p class="mb-4 text-gray-600">Security is a continuous process. Plan how you will monitor and review your controls and assessment.</p><div class="mb-4"><label for="reviewCycle" class="block text-gray-700 font-medium mb-1">Review Cycle:</label><textarea id="reviewCycle" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24" placeholder="e.g., Semi-annually or after any incident."></textarea></div><div class="mb-4"><label for="monitoring" class="block text-gray-700 font-medium mb-1">Monitoring:</label><textarea id="monitoring" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24" placeholder="e.g., Operations Manager will conduct weekly checks on all locks and systems."></textarea></div><div class="mb-4"><label for="action" class="block text-gray-700 font-medium mb-1">Action:</label><textarea id="action" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24" placeholder="e.g., All security systems will be tested monthly."></textarea></div>`;
                    default: return '';
                }
            }

            function collectStepDataAndSave() {
                document.querySelectorAll('#step-content textarea, #step-content input, #step-content select').forEach(el => { if (el.id) sraData[el.id] = el.value; });
                saveData();
            }

            function nextStep() { collectStepDataAndSave(); if (currentStep < totalSteps) { currentStep++; updateUI(); } else { generateReport(); } }
            function prevStep() { collectStepDataAndSave(); if (currentStep > 1) { currentStep--; updateUI(); } }
            function generateReport() { appContainer.classList.add('hidden'); reportContainer.classList.remove('hidden'); reportContent.innerHTML = `<h2 class="text-2xl font-bold text-blue-800 mb-4">Security Risk Assessment Report</h2><p class="text-gray-600 mb-6">Generated on: ${new Date().toLocaleDateString()}</p>`; }
            
            function handleFormChanges(e) {
                const { target } = e;
                if (!target) return;
                const { index, field } = target.dataset;
                if (target.closest('#risk-table')) {
                    sraData.riskScenarios = sraData.riskScenarios || [];
                    if(sraData.riskScenarios[index]) sraData.riskScenarios[index][field] = target.value;
                    if (field === 'likelihood' || field === 'impact') renderDataIntoForm();
                } else if (target.closest('#treatment-plans-container')) {
                    sraData.treatmentPlans = sraData.treatmentPlans || [];
                    if(sraData.treatmentPlans[index]) sraData.treatmentPlans[index][field] = target.value;
                } else if(target.id) { sraData[target.id] = target.value; }
                saveData();
            }
            
            function setupStepSpecificListeners() {
                document.getElementById('add-risk-btn')?.addEventListener('click', () => { sraData.riskScenarios = sraData.riskScenarios || []; sraData.riskScenarios.push({ scenario: '', asset: '', likelihood: '', impact: '' }); updateUI(); });
                document.querySelectorAll('.remove-risk-btn').forEach(btn => btn.addEventListener('click', (e) => { sraData.riskScenarios.splice(e.target.dataset.index, 1); updateUI(); }));
                document.getElementById('add-treatment-btn')?.addEventListener('click', () => { sraData.treatmentPlans = sraData.treatmentPlans || []; sraData.treatmentPlans.push({ risk: '', treatmentOption: '', actionPlan: '' }); updateUI(); });
                document.querySelectorAll('.remove-treatment-btn').forEach(btn => btn.addEventListener('click', (e) => { sraData.treatmentPlans.splice(e.target.dataset.index, 1); updateUI(); }));
            }

            // --- Attach Event Listeners ---
            startButton.addEventListener('click', () => {
                landingPage.classList.add('hidden');
                appContainer.classList.remove('hidden');
                updateUI(); 
                initFirebase();
            });
            nextButton.addEventListener('click', nextStep);
            prevButton.addEventListener('click', prevStep);
            document.getElementById('report-back-btn').addEventListener('click', () => {
                reportContainer.classList.add('hidden');
                appContainer.classList.remove('hidden');
            });
            appContainer.addEventListener('change', handleFormChanges);
        }

        // --- FIX: Wait for the DOM to be fully loaded before running the app logic ---
        document.addEventListener('DOMContentLoaded', main);

    </script>
</body>
</html>

