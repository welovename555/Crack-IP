// Configuration
const CONFIG = {
    // API Keys - ใส่ API keys ของคุณที่นี่
    IPQUALITYSCORE_KEY: 'YOUR_API_KEY_HERE', // Get free key from https://www.ipqualityscore.com/
    
    // API Endpoints
    APIs: {
        primary: 'https://ipapi.co/json/',
        secondary: 'https://ip-api.com/json/',
        vpnCheck: 'https://ipqualityscore.com/api/json/ip/', // Requires API key
        fallback: 'https://ipwhois.app/json/'
    },
    
    // Timing
    SCAN_DURATION: 3000,
    TYPING_SPEED: 100
};

// Global state
let currentIP = null;
let scanResults = {};

// DOM Elements
const elements = {
    loadingScreen: document.getElementById('loadingScreen'),
    resultsContainer: document.getElementById('resultsContainer'),
    errorScreen: document.getElementById('errorScreen'),
    statusIndicator: document.getElementById('statusIndicator'),
    loadingText: document.getElementById('loadingText'),
    ipAddress: document.getElementById('ipAddress'),
    riskLevel: document.getElementById('riskLevel'),
    riskFill: document.getElementById('riskFill'),
    riskText: document.getElementById('riskText'),
    riskAssessment: document.getElementById('riskAssessment'),
    location: document.getElementById('location'),
    isp: document.getElementById('isp'),
    connectionType: document.getElementById('connectionType'),
    vpnStatus: document.getElementById('vpnStatus'),
    reputation: document.getElementById('reputation'),
    recommendation: document.getElementById('recommendation'),
    rescanBtn: document.getElementById('rescanBtn'),
    detailsBtn: document.getElementById('detailsBtn'),
    retryBtn: document.getElementById('retryBtn'),
    errorMessage: document.getElementById('errorMessage')
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
});

function initializeApp() {
    showLoadingScreen();
    startIPScan();
}

function setupEventListeners() {
    elements.rescanBtn.addEventListener('click', () => {
        showLoadingScreen();
        startIPScan();
    });
    
    elements.retryBtn.addEventListener('click', () => {
        showLoadingScreen();
        startIPScan();
    });
    
    elements.detailsBtn.addEventListener('click', showDetailedAnalysis);
}

function showLoadingScreen() {
    elements.loadingScreen.style.display = 'block';
    elements.resultsContainer.style.display = 'none';
    elements.errorScreen.style.display = 'none';
    
    updateStatusIndicator('SCANNING...', 'scanning');
    
    // Simulate typing effect for loading messages
    const messages = [
        'Initializing IP scan...',
        'Connecting to target...',
        'Analyzing network data...',
        'Checking VPN/Proxy...',
        'Calculating risk score...',
        'Finalizing results...'
    ];
    
    let messageIndex = 0;
    const messageInterval = setInterval(() => {
        if (messageIndex < messages.length) {
            typeText(elements.loadingText, messages[messageIndex]);
            messageIndex++;
        } else {
            clearInterval(messageInterval);
        }
    }, 500);
}

function typeText(element, text) {
    element.textContent = '';
    let i = 0;
    const typing = setInterval(() => {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
        } else {
            clearInterval(typing);
        }
    }, CONFIG.TYPING_SPEED);
}

async function startIPScan() {
    try {
        // Get basic IP info
        const basicInfo = await fetchIPInfo();
        currentIP = basicInfo.ip;
        
        // Get additional security info
        const securityInfo = await fetchSecurityInfo(currentIP);
        
        // Combine results
        scanResults = { ...basicInfo, ...securityInfo };
        
        // Wait for minimum scan duration for dramatic effect
        await new Promise(resolve => setTimeout(resolve, CONFIG.SCAN_DURATION));
        
        displayResults();
        
    } catch (error) {
        console.error('Scan failed:', error);
        showError('Failed to scan IP address. Please check your connection and try again.');
    }
}

async function fetchIPInfo() {
    try {
        // Try primary API first
        const response = await fetch(CONFIG.APIs.primary);
        if (!response.ok) throw new Error('Primary API failed');
        
        const data = await response.json();
        return {
            ip: data.ip,
            country: data.country_name || data.country,
            city: data.city,
            region: data.region,
            isp: data.org || data.isp,
            timezone: data.timezone,
            postal: data.postal
        };
    } catch (error) {
        // Fallback to secondary API
        try {
            const response = await fetch(CONFIG.APIs.secondary);
            if (!response.ok) throw new Error('Secondary API failed');
            
            const data = await response.json();
            return {
                ip: data.query,
                country: data.country,
                city: data.city,
                region: data.regionName,
                isp: data.isp,
                timezone: data.timezone,
                postal: data.zip
            };
        } catch (fallbackError) {
            // Final fallback
            const response = await fetch(CONFIG.APIs.fallback);
            const data = await response.json();
            return {
                ip: data.ip,
                country: data.country,
                city: data.city,
                region: data.region,
                isp: data.isp,
                timezone: data.timezone
            };
        }
    }
}

async function fetchSecurityInfo(ip) {
    const securityData = {
        isVPN: false,
        isProxy: false,
        isTor: false,
        riskScore: 0,
        connectionType: 'Residential',
        reputation: 'Clean'
    };
    
    try {
        // If API key is provided, use IPQualityScore
        if (CONFIG.IPQUALITYSCORE_KEY && CONFIG.IPQUALITYSCORE_KEY !== 'YOUR_API_KEY_HERE') {
            const response = await fetch(`${CONFIG.APIs.vpnCheck}${CONFIG.IPQUALITYSCORE_KEY}/${ip}`);
            if (response.ok) {
                const data = await response.json();
                securityData.isVPN = data.vpn || false;
                securityData.isProxy = data.proxy || false;
                securityData.isTor = data.tor || false;
                securityData.riskScore = data.fraud_score || 0;
                securityData.connectionType = data.connection_type || 'Residential';
                securityData.reputation = data.fraud_score > 75 ? 'High Risk' : 
                                        data.fraud_score > 25 ? 'Medium Risk' : 'Clean';
            }
        } else {
            // Simulate basic detection for demo purposes
            securityData.riskScore = Math.floor(Math.random() * 30); // Random low risk score
            securityData.isVPN = Math.random() > 0.8; // 20% chance of VPN detection
            securityData.isProxy = Math.random() > 0.9; // 10% chance of proxy detection
        }
    } catch (error) {
        console.warn('Security check failed, using defaults:', error);
    }
    
    return securityData;
}

function displayResults() {
    elements.loadingScreen.style.display = 'none';
    elements.resultsContainer.style.display = 'block';
    
    updateStatusIndicator('SCAN COMPLETE', 'complete');
    
    // Display IP
    elements.ipAddress.textContent = scanResults.ip;
    
    // Display location
    const location = [scanResults.city, scanResults.region, scanResults.country]
        .filter(Boolean).join(', ');
    elements.location.textContent = location || 'Unknown';
    
    // Display ISP
    elements.isp.textContent = scanResults.isp || 'Unknown';
    
    // Display connection type
    elements.connectionType.textContent = scanResults.connectionType || 'Unknown';
    
    // Display VPN/Proxy status
    const vpnProxyStatus = [];
    if (scanResults.isVPN) vpnProxyStatus.push('VPN');
    if (scanResults.isProxy) vpnProxyStatus.push('PROXY');
    if (scanResults.isTor) vpnProxyStatus.push('TOR');
    
    const vpnElement = elements.vpnStatus;
    if (vpnProxyStatus.length > 0) {
        vpnElement.textContent = vpnProxyStatus.join(' + ');
        vpnElement.className = 'data-value warning';
    } else {
        vpnElement.textContent = 'CLEAN';
        vpnElement.className = 'data-value safe';
    }
    
    // Display reputation
    elements.reputation.textContent = scanResults.reputation || 'Unknown';
    elements.reputation.className = `data-value ${getReputationClass(scanResults.reputation)}`;
    
    // Calculate and display risk assessment
    displayRiskAssessment();
    
    // Display recommendation
    displayRecommendation();
}

function displayRiskAssessment() {
    const riskScore = scanResults.riskScore || 0;
    const hasVPN = scanResults.isVPN || scanResults.isProxy || scanResults.isTor;
    
    let riskLevel, riskClass, riskWidth;
    
    if (riskScore > 75 || (hasVPN && riskScore > 25)) {
        riskLevel = 'HIGH RISK';
        riskClass = 'high';
        riskWidth = Math.max(75, riskScore);
    } else if (riskScore > 25 || hasVPN) {
        riskLevel = 'MEDIUM RISK';
        riskClass = 'medium';
        riskWidth = Math.max(40, riskScore);
    } else {
        riskLevel = 'LOW RISK';
        riskClass = 'safe';
        riskWidth = Math.max(10, riskScore);
    }
    
    elements.riskLevel.textContent = riskLevel;
    elements.riskLevel.className = `risk-level ${riskClass}`;
    elements.riskFill.style.width = `${Math.min(riskWidth, 100)}%`;
    elements.riskText.textContent = `Risk Score: ${riskScore}/100`;
}

function displayRecommendation() {
    const riskScore = scanResults.riskScore || 0;
    const hasVPN = scanResults.isVPN || scanResults.isProxy || scanResults.isTor;
    
    let recommendation, recommendationClass;
    
    if (riskScore > 75 || (hasVPN && riskScore > 50)) {
        recommendation = '🚫 HIGH RISK - BLOCK';
        recommendationClass = 'danger';
    } else if (riskScore > 25 || hasVPN) {
        recommendation = '⚠️ CAUTION - MONITOR';
        recommendationClass = 'warning';
    } else {
        recommendation = '✅ SAFE - PROCEED';
        recommendationClass = 'safe';
    }
    
    elements.recommendation.textContent = recommendation;
    elements.recommendation.className = `data-value ${recommendationClass}`;
}

function getReputationClass(reputation) {
    if (!reputation) return '';
    
    const rep = reputation.toLowerCase();
    if (rep.includes('high risk') || rep.includes('malicious')) return 'danger';
    if (rep.includes('medium risk') || rep.includes('suspicious')) return 'warning';
    return 'safe';
}

function updateStatusIndicator(text, status) {
    elements.statusIndicator.querySelector('span').textContent = text;
    elements.statusIndicator.className = `status-indicator ${status}`;
}

function showError(message) {
    elements.loadingScreen.style.display = 'none';
    elements.resultsContainer.style.display = 'none';
    elements.errorScreen.style.display = 'block';
    
    elements.errorMessage.textContent = message;
    updateStatusIndicator('SCAN FAILED', 'error');
}

function showDetailedAnalysis() {
    const details = `
=== DETAILED IP ANALYSIS ===

IP Address: ${scanResults.ip}
Location: ${scanResults.city}, ${scanResults.region}, ${scanResults.country}
ISP: ${scanResults.isp}
Timezone: ${scanResults.timezone}
Postal Code: ${scanResults.postal || 'N/A'}

=== SECURITY ANALYSIS ===
VPN Detected: ${scanResults.isVPN ? 'YES' : 'NO'}
Proxy Detected: ${scanResults.isProxy ? 'YES' : 'NO'}
Tor Network: ${scanResults.isTor ? 'YES' : 'NO'}
Connection Type: ${scanResults.connectionType}
Risk Score: ${scanResults.riskScore}/100
Reputation: ${scanResults.reputation}

=== RECOMMENDATION ===
${elements.recommendation.textContent}

=== NOTES ===
- Risk scores above 75 indicate high probability of fraudulent activity
- VPN/Proxy detection may affect account registration
- Monitor suspicious IPs for unusual activity patterns
    `.trim();
    
    // Create modal or alert with detailed info
    if (confirm('Show detailed analysis in console? (Press OK to view in browser console)')) {
        console.log(details);
        alert('Detailed analysis has been logged to the browser console. Press F12 to view.');
    }
}

// Utility functions
function formatTimestamp() {
    return new Date().toLocaleString('th-TH', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

// Export for debugging (if needed)
window.CrackIP = {
    rescan: startIPScan,
    getResults: () => scanResults,
    getCurrentIP: () => currentIP
};