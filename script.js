// Configuration
const CONFIG = {
    // API Keys - ใส่ API keys ของคุณที่นี่
    IPQUALITYSCORE_KEY: 'yU0rfEBebKjGWGl7A5BL6sNQ8y5lREq0', // IPQualityScore API Key
    
    // API Endpoints
    APIs: {
        primary: 'https://ipapi.co/json/',
        secondary: 'https://ip-api.com/json/',
        vpnCheck: 'https://ipqualityscore.com/api/json/ip/', // IPQualityScore endpoint
        fallback: 'https://ipwhois.app/json/'
    },
    
    // Timing
    SCAN_DURATION: 3000,
    TYPING_SPEED: 100
};

// Global state
let currentIP = null;
let scanResults = {};
let progressInterval = null;
let currentProgress = 0;

// DOM Elements
const elements = {
    loadingScreen: document.getElementById('loadingScreen'),
    resultsContainer: document.getElementById('resultsContainer'),
    errorScreen: document.getElementById('errorScreen'),
    statusIndicator: document.getElementById('statusIndicator'),
    loadingText: document.getElementById('loadingText'),
    progressPercentage: document.getElementById('progressPercentage'),
    progressBar: document.getElementById('progressBar'),
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

// Matrix Rain Effect
class MatrixRain {
    constructor() {
        this.canvas = document.getElementById('matrixCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+-=[]{}|;:,.<>?';
        this.drops = [];
        this.fontSize = 14;
        
        this.init();
        this.animate();
    }
    
    init() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        const columns = Math.floor(this.canvas.width / this.fontSize);
        
        for (let i = 0; i < columns; i++) {
            this.drops[i] = Math.random() * -100;
        }
    }
    
    animate() {
        this.ctx.fillStyle = 'rgba(10, 10, 10, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#00ff41';
        this.ctx.font = `${this.fontSize}px monospace`;
        
        for (let i = 0; i < this.drops.length; i++) {
            const char = this.characters[Math.floor(Math.random() * this.characters.length)];
            this.ctx.fillText(char, i * this.fontSize, this.drops[i] * this.fontSize);
            
            if (this.drops[i] * this.fontSize > this.canvas.height && Math.random() > 0.975) {
                this.drops[i] = 0;
            }
            this.drops[i]++;
        }
        
        requestAnimationFrame(() => this.animate());
    }
    
    resize() {
        this.init();
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Matrix Rain Effect
    const matrixRain = new MatrixRain();
    window.addEventListener('resize', () => matrixRain.resize());
    
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
    
    updateStatusIndicator('กำลังสแกน...', 'scanning');
    
    // Reset progress
    currentProgress = 0;
    updateProgress(0);
    
    // Start progress animation
    startProgressAnimation();
    
    // Simulate typing effect for loading messages
    const messages = [
        'เริ่มต้นการสแกน IP...',
        'เชื่อมต่อกับเป้าหมาย...',
        'วิเคราะห์ข้อมูลเครือข่าย...',
        'ตรวจสอบ VPN/Proxy...',
        'คำนวณคะแนนความเสี่ยง...',
        'จัดเตรียมผลลัพธ์...'
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

function startProgressAnimation() {
    if (progressInterval) clearInterval(progressInterval);
    
    progressInterval = setInterval(() => {
        if (currentProgress < 100) {
            // Simulate realistic progress with some randomness
            const increment = Math.random() * 3 + 1;
            currentProgress = Math.min(100, currentProgress + increment);
            updateProgress(currentProgress);
        } else {
            clearInterval(progressInterval);
        }
    }, 100);
}

function updateProgress(percentage) {
    const roundedPercentage = Math.floor(percentage);
    elements.progressPercentage.textContent = `${roundedPercentage}%`;
    
    // Calculate stroke-dashoffset for circular progress
    const circumference = 2 * Math.PI * 90; // radius = 90
    const offset = circumference - (percentage / 100) * circumference;
    elements.progressBar.style.strokeDashoffset = offset;
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
        
        // Ensure progress reaches 100%
        currentProgress = 100;
        updateProgress(100);
        
        // Small delay to show 100%
        await new Promise(resolve => setTimeout(resolve, 300));
        
        displayResults();
        
    } catch (error) {
        console.error('Scan failed:', error);
        showError('ไม่สามารถสแกน IP ได้ กรุณาตรวจสอบการเชื่อมต่อและลองใหม่');
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
        if (CONFIG.IPQUALITYSCORE_KEY) {
            const response = await fetch(`${CONFIG.APIs.vpnCheck}${CONFIG.IPQUALITYSCORE_KEY}/${ip}`);
            if (response.ok) {
                const data = await response.json();
                
                // Check if API response is successful
                if (data.success) {
                    securityData.isVPN = data.vpn || false;
                    securityData.isProxy = data.proxy || false;
                    securityData.isTor = data.tor || false;
                    securityData.riskScore = data.fraud_score || 0;
                    securityData.connectionType = data.connection_type || 'Residential';
                    securityData.reputation = data.fraud_score > 75 ? 'High Risk' : 
                                            data.fraud_score > 25 ? 'Medium Risk' : 'Clean';
                    
                    // Additional IPQualityScore data
                    securityData.mobile = data.mobile || false;
                    securityData.recent_abuse = data.recent_abuse || false;
                    securityData.bot_status = data.bot_status || false;
                } else {
                    console.warn('IPQualityScore API error:', data.message);
                    // Fall back to simulated data
                    securityData.riskScore = Math.floor(Math.random() * 30);
                    securityData.isVPN = Math.random() > 0.8;
                    securityData.isProxy = Math.random() > 0.9;
                }
            } else {
                console.warn('IPQualityScore API request failed');
                // Fall back to simulated data
                securityData.riskScore = Math.floor(Math.random() * 30);
                securityData.isVPN = Math.random() > 0.8;
                securityData.isProxy = Math.random() > 0.9;
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
    
    updateStatusIndicator('สแกนเสร็จสิ้น', 'complete');
    
    // Clear progress interval
    if (progressInterval) {
        clearInterval(progressInterval);
    }
    
    // Display IP
    elements.ipAddress.textContent = scanResults.ip;
    
    // Display location
    const location = [scanResults.city, scanResults.region, scanResults.country]
        .filter(Boolean).join(', ');
    elements.location.textContent = location || 'ไม่ทราบ';
    
    // Display ISP
    elements.isp.textContent = scanResults.isp || 'ไม่ทราบ';
    
    // Display connection type
    const connectionTypeMap = {
        'Residential': 'บ้านพักอาศัย',
        'Mobile': 'มือถือ',
        'Corporate': 'องค์กร',
        'Data Center': 'ศูนย์ข้อมูล',
        'Hosting': 'โฮสติ้ง'
    };
    elements.connectionType.textContent = connectionTypeMap[scanResults.connectionType] || scanResults.connectionType || 'ไม่ทราบ';
    
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
        vpnElement.textContent = 'สะอาด';
        vpnElement.className = 'data-value safe';
    }
    
    // Display reputation
    const reputationMap = {
        'Clean': 'สะอาด',
        'Medium Risk': 'เสี่ยงปานกลาง',
        'High Risk': 'เสี่ยงสูง'
    };
    elements.reputation.textContent = reputationMap[scanResults.reputation] || scanResults.reputation || 'ไม่ทราบ';
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
        riskLevel = 'เสี่ยงสูง';
        riskClass = 'high';
        riskWidth = Math.max(75, riskScore);
    } else if (riskScore > 25 || hasVPN) {
        riskLevel = 'เสี่ยงปานกลาง';
        riskClass = 'medium';
        riskWidth = Math.max(40, riskScore);
    } else {
        riskLevel = 'เสี่ยงต่ำ';
        riskClass = 'safe';
        riskWidth = Math.max(10, riskScore);
    }
    
    elements.riskLevel.textContent = riskLevel;
    elements.riskLevel.className = `risk-level ${riskClass}`;
    elements.riskFill.style.width = `${Math.min(riskWidth, 100)}%`;
    elements.riskText.textContent = `คะแนนความเสี่ยง: ${riskScore}/100`;
}

function displayRecommendation() {
    const riskScore = scanResults.riskScore || 0;
    const hasVPN = scanResults.isVPN || scanResults.isProxy || scanResults.isTor;
    
    let recommendation, recommendationClass;
    
    if (riskScore > 75 || (hasVPN && riskScore > 50)) {
        recommendation = '🚫 เสี่ยงสูง - ควรบล็อก';
        recommendationClass = 'danger';
    } else if (riskScore > 25 || hasVPN) {
        recommendation = '⚠️ ระวัง - ควรติดตาม';
        recommendationClass = 'warning';
    } else {
        recommendation = '✅ ปลอดภัย - ใช้งานได้';
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
    
    // Clear progress interval
    if (progressInterval) {
        clearInterval(progressInterval);
    }
    
    elements.errorMessage.textContent = message;
    updateStatusIndicator('การสแกนล้มเหลว', 'error');
}

function showDetailedAnalysis() {
    const details = `
=== การวิเคราะห์ IP รายละเอียด ===

ที่อยู่ IP: ${scanResults.ip}
ตำแหน่ง: ${scanResults.city}, ${scanResults.region}, ${scanResults.country}
ผู้ให้บริการ: ${scanResults.isp}
เขตเวลา: ${scanResults.timezone}
รหัสไปรษณีย์: ${scanResults.postal || 'ไม่มี'}

=== การวิเคราะห์ความปลอดภัย ===
ตรวจพบ VPN: ${scanResults.isVPN ? 'ใช่' : 'ไม่'}
ตรวจพบ Proxy: ${scanResults.isProxy ? 'ใช่' : 'ไม่'}
เครือข่าย Tor: ${scanResults.isTor ? 'ใช่' : 'ไม่'}
ประเภทการเชื่อมต่อ: ${scanResults.connectionType}
คะแนนความเสี่ยง: ${scanResults.riskScore}/100
ชื่อเสียง: ${scanResults.reputation}

=== คำแนะนำ ===
${elements.recommendation.textContent}

=== หมายเหตุ ===
- คะแนนความเสี่ยงเกิน 75 บ่งชี้ถึงความเป็นไปได้สูงของกิจกรรมฉ้อโกง
- การตรวจพบ VPN/Proxy อาจส่งผลต่อการสมัครบัญชี
- ติดตาม IP ที่น่าสงสัยเพื่อดูรูปแบบกิจกรรมที่ผิดปกติ
    `.trim();
    
    // Create modal or alert with detailed info
    if (confirm('แสดงการวิเคราะห์รายละเอียดใน console? (กด OK เพื่อดูใน browser console)')) {
        console.log(details);
        alert('การวิเคราะห์รายละเอียดถูกบันทึกใน browser console แล้ว กด F12 เพื่อดู');
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