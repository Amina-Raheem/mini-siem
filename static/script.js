document.addEventListener('DOMContentLoaded', () => {
    const refreshBtn = document.getElementById('refresh-btn');
    const searchInput = document.getElementById('search-input');
    
    // Evaluate initial risk levels
    evaluateRisk();
    countActiveSources();

    // Search functionality
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('.log-row');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            if (text.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });

    // Refresh functionality
    refreshBtn.addEventListener('click', () => {
        const originalContent = refreshBtn.innerHTML;
        refreshBtn.innerHTML = `
            <svg class="spin-anim" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
            Refreshing...
        `;
        refreshBtn.disabled = true;
        
        // Add CSS for spinner if not exists
        if (!document.getElementById('spinner-style')) {
            const style = document.createElement('style');
            style.id = 'spinner-style';
            style.innerHTML = `@keyframes spin { 100% { transform: rotate(360deg); } } .spin-anim { animation: spin 1s linear infinite; }`;
            document.head.appendChild(style);
        }
        
        fetch('/logs', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            // Apply a slight delay to make the animation visible and feel "app-like"
            setTimeout(() => {
                updateTable(data);
                refreshBtn.innerHTML = originalContent;
                refreshBtn.disabled = false;
                
                // Re-apply search filter
                searchInput.dispatchEvent(new Event('input'));
            }, 600);
        })
        .catch(error => {
            console.error('Error fetching logs:', error);
            refreshBtn.innerHTML = originalContent;
            refreshBtn.disabled = false;
        });
    });
});

function countActiveSources() {
    const rows = document.querySelectorAll('.log-row');
    const sources = new Set();
    
    rows.forEach(row => {
        const sourceBadge = row.querySelector('.badge');
        if (sourceBadge) {
            sources.add(sourceBadge.textContent.trim());
        }
    });
    
    document.getElementById('active-sources').textContent = sources.size;
}

function evaluateRisk() {
    const isAlertsPage = document.body.dataset.page === 'alerts';
    const rows = document.querySelectorAll('.log-row');
    let highRiskCount = 0;

    rows.forEach((row, idx) => {
        // Cascade animation delay for initial load
        if (row.style.animationDelay === '') {
            row.style.animationDelay = `${idx * 0.05}s`;
        }

        const messageCell = row.cells[3].textContent;
        const riskCell = row.cells[4];
        let score = 0;

        // Simple heuristic rules based on analyzer.py
        if (messageCell.includes("Failed login")) score += 5;
        if (messageCell.includes("Password changed")) score += 2;
        if (messageCell.includes("Service restarted")) score += 1;
        if (messageCell.includes("Port blocked")) score += 3;
        if (messageCell.includes("User logged in")) score += 1;
        if (messageCell.includes("User logged out")) score += 1;

        const badgeHtml = score > 5 
            ? '<span class="risk-badge risk-high">High Risk</span>' 
            : '<span class="risk-badge risk-normal">Normal</span>';
            
        riskCell.innerHTML = badgeHtml;
        
        if (score > 5) highRiskCount++;

        // If we are on the Alerts page, Hide any Normal risk logs entirely
        if (isAlertsPage && score <= 5) {
             row.style.display = 'none';
             row.classList.remove('log-row'); // remove from search queries logic
        }
    });

    const counterElem = document.getElementById('high-risk-count');
    if (counterElem) {
        // Animate counter change
        if (counterElem.textContent != highRiskCount) {
            counterElem.style.transform = 'scale(1.2)';
            counterElem.style.transition = 'transform 0.2s';
            setTimeout(() => {
                counterElem.textContent = highRiskCount;
                counterElem.style.transform = 'scale(1)';
            }, 200);
        } else {
            counterElem.textContent = highRiskCount;
        }
    }
}

function updateTable(logs) {
    const isAlertsPage = document.body.dataset.page === 'alerts';
    const tbody = document.getElementById('logs-body');
    
    if (!logs || logs.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 16px; opacity: 0.5;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                    <p>No ${isAlertsPage ? 'alerts' : 'logs'} found at this time.</p>
                </td>
            </tr>`;
        if (document.getElementById('total-logs')) document.getElementById('total-logs').textContent = 0;
        if (document.getElementById('high-risk-count')) document.getElementById('high-risk-count').textContent = 0;
        if (document.getElementById('active-sources')) document.getElementById('active-sources').textContent = 0;
        return;
    }

    tbody.innerHTML = '';
    
    logs.forEach((log, index) => {
        const row = document.createElement('tr');
        row.className = 'log-row';
        row.style.animationDelay = `${index * 0.05}s`;
        
        let sourceClass = log[2] ? log[2].toLowerCase() : 'unknown';
        
        row.innerHTML = `
            <td>${log[0]}</td>
            <td>${log[1]}</td>
            <td><span class="badge source-${sourceClass}">${log[2] || 'Unknown'}</span></td>
            <td>${log[3]}</td>
            <td><span class="risk-badge">Evaluating...</span></td>
        `;
        
        tbody.appendChild(row);
    });

    if (document.getElementById('total-logs')) document.getElementById('total-logs').textContent = logs.length;
    evaluateRisk();
    countActiveSources();
}
