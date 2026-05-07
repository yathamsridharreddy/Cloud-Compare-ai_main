// ============================================================
// CLOUDCOMPARE AI - FRONTEND JAVASCRIPT
// ============================================================

// Configuration - API Base URL
const API_BASE_URL = window.location.origin === 'null' || window.location.origin === 'file://' || window.location.port === '5000' ? 'http://localhost:5000' : (window.location.origin || 'http://localhost:5000');

// Global chart instances
let costChartInstance = null;
let performanceChartInstance = null;
let rankingChartInstance = null;
let distributionChartInstance = null;
let valueChartInstance = null;
let popularityChartInstance = null;
let trendChartInstance = null;

// Track current services data for sorting
let currentServices = [];

// Track all providers globally
let allProviders = [];

// Global chart options template
const globalChartOptions = {
    responsive: true,
    plugins: {
        legend: {
            display: false
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            grid: {
                color: "rgba(212, 160, 23, 0.08)"
            },
            ticks: {
                color: "#a89968"
            }
        },
        x: {
            grid: {
                display: false
            },
            ticks: {
                color: "#a89968",
                font: {
                    size: 10
                }
            }
        }
    }
};

// Current category state
let currentCategory = 'compute';

// Platform colors for charts
const platformColors = {
    'AWS': '#d4a017',
    'GCP': '#f5d060',
    'Azure': '#c9a84c',
    'OCI': '#b8860b',
    'Alibaba': '#8b6914'
};

// Platform icons
const platformIcons = {
    'AWS': 'fab fa-aws',
    'GCP': 'fab fa-google',
    'Azure': 'fab fa-microsoft',
    'OCI': 'fas fa-cloud',
    'Alibaba': 'fas fa-server'
};

// Category configuration
const categoryConfig = {
    compute: {
        icon: 'fa-microchip',
        label: 'Compute',
        description: 'Virtual machines and containers'
    },
    storage: {
        icon: 'fa-database',
        label: 'Storage',
        description: 'Object and block storage'
    },
    database: {
        icon: 'fa-server',
        label: 'Database',
        description: 'Managed database services'
    }
};

// Initialize on page load
document.addEventListener("DOMContentLoaded", function () {
    console.log("CloudCompare AI initialized");

    // Set up category button listeners
    setupCategoryButtons();

    // Set up enter key support
    setupEnterKeySupport();

    // Load service count
    loadServiceCount();

    // Load regions dynamically
    loadRegions();

    // Check Auth State
    checkAuthState();

    // Load service types for default category
    loadServiceTypes(currentCategory);
});

// Check auth state
function checkAuthState() {
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName');

    const loginLinkBtn = document.getElementById('loginLinkBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    if (token && userName) {
        if (loginLinkBtn) loginLinkBtn.style.display = 'none';
        if (logoutBtn) {
            logoutBtn.style.display = 'inline-block';
            logoutBtn.innerHTML = `<i class="fas fa-sign-out-alt"></i> ${userName}`;
            logoutBtn.onclick = function () {
                localStorage.removeItem('token');
                localStorage.removeItem('userName');
                window.location.href = 'login.html';
            };
        }
    } else {
        if (loginLinkBtn) loginLinkBtn.style.display = 'inline-block';
        if (logoutBtn) logoutBtn.style.display = 'none';
    }
}

// Load regions from API
async function loadRegions() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/regions`);
        if (res.ok) {
            const regions = await res.json();
            const regionSelect = document.getElementById('region');

            // Keep the first "All Regions" option
            regionSelect.innerHTML = '<option value="all">All Regions</option>';

            // Add regions from database
            regions.forEach(region => {
                const option = document.createElement('option');
                option.value = region.value;
                option.textContent = region.label;
                regionSelect.appendChild(option);
            });

            console.log("Loaded " + regions.length + " regions");
        }
    } catch (error) {
        console.log("Could not load regions");
    }
}

// Load service types dynamically based on category
async function loadServiceTypes(category) {
    try {
        const res = await fetch(`${API_BASE_URL}/api/service-types/${category}`);
        if (!res.ok) return;

        const types = await res.json();
        const select = document.getElementById('serviceTypeSelect');
        if (!select) return;

        select.innerHTML = '<option value="all">All Types</option>';

        types.forEach(type => {
            const option = document.createElement('option');
            option.value = type.value || type.id;
            option.textContent = type.label || type.name;
            select.appendChild(option);
        });

    } catch (error) {
        console.error('Error loading service types:', error);
    }
}

// Setup category buttons
function setupCategoryButtons() {
    const buttons = document.querySelectorAll('.category-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', function () {
            // Remove active from all
            buttons.forEach(b => b.classList.remove('active'));
            // Add active to clicked
            this.classList.add('active');
            // Update current category
            currentCategory = this.dataset.category;
            // Load specific service types for this category
            loadServiceTypes(currentCategory);
        });
    });
}

// Setup enter key support
function setupEnterKeySupport() {
    const inputs = document.querySelectorAll('.input-group input, .input-group select');
    inputs.forEach(input => {
        input.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                compare();
            }
        });
    });
}

// Load service count and provider count
async function loadServiceCount() {
    // No static DB anymore — show accurate counts from hardcoded service types
    const totalServiceTypes = 12 + 9 + 13 + 20; // compute + storage + database + ai
    document.getElementById('serviceCount').textContent = totalServiceTypes + ' Service Types';
    document.getElementById('featureServiceCount').textContent = totalServiceTypes + ' Cloud Service Types';
    document.getElementById('providerCount').textContent = '5 Providers';
    document.getElementById('featureProviderCount').textContent = '5 Cloud Providers';
    allProviders = ['AWS', 'GCP', 'Azure', 'OCI', 'Alibaba'];
}

// Main compare function
let isComparing = false;
async function compare() {
    if (isComparing) return;

    // Get current category from active button
    const activeBtn = document.querySelector('.category-btn.active');
    const category = activeBtn ? activeBtn.dataset.category : 'compute';

    const compareBtn = document.querySelector('.compare-btn');
    const originalBtnText = compareBtn.innerHTML;
    compareBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
    compareBtn.style.opacity = '0.7';
    compareBtn.style.cursor = 'not-allowed';
    isComparing = true;

    // Show loading state
    showLoading();

    // Get form values
    const regionValue = document.getElementById("region").value;
    const priorityValue = document.getElementById("priority").value;
    let currentType = 'all';
    const typeSelect = document.getElementById('serviceTypeSelect');
    if (typeSelect) {
        currentType = typeSelect.value;
    }

    const data = {
        category: category,
        region: regionValue || 'all',
        priority: priorityValue || 'balanced',
        serviceType: currentType || 'all',
        cpu: parseInt(document.getElementById("cpu").value) || 2,
        ram: parseInt(document.getElementById("ram").value) || 4,
        storage: parseInt(document.getElementById("storage").value) || 100,
        hours: parseInt(document.getElementById("hours").value) || 730
    };

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        const res = await fetch(`${API_BASE_URL}/api/compare`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        const result = await res.json();

        if (result.error) {
            throw new Error(result.error);
        }

        if (!result.services || result.services.length === 0) {
            showError("No services found for the selected category");
            return;
        }

        hideLoading();

        // Store globally for sorting
        currentServices = result.services;

        // Display results
        displayRecommendations(result.services);
        displayCharts(result.services);
        displayProviderStats(result.providerStats);
        displayTable(result.services);

        // Show results section
        document.getElementById('resultsSection').style.display = 'block';
        document.getElementById('emptyState').style.display = 'none';

    } catch (error) {
        console.error("Compare error:", error);
        hideLoading();
        showError("Failed to compare services. Please try again.\n" + error.message);
    } finally {
        isComparing = false;
        const compareBtn = document.querySelector('.compare-btn');
        compareBtn.innerHTML = '<i class="fas fa-rocket"></i> Compare Services';
        compareBtn.style.opacity = '1';
        compareBtn.style.cursor = 'pointer';
    }
}

// Display recommendations grid
function displayRecommendations(services) {
    const grid = document.getElementById('recommendationsGrid');

    if (!services || services.length === 0) {
        grid.style.display = 'none';
        return;
    }

    grid.innerHTML = '';

    // Sort services by score to ensure they are displayed in priority order
    const sortedServices = [...services].sort((a, b) => b.score - a.score);

    sortedServices.forEach((rec, index) => {
        const platformIcon = platformIcons[rec.platform] || 'fas fa-cloud';
        const color = platformColors[rec.platform] || '#3b82f6';

        // Use gold, silver, bronze for top 3, else standard color
        let rankBadgeStyle = `background: ${adjustColorOpacity(color, 0.15)}; color: ${color}; border: 1px solid ${adjustColorOpacity(color, 0.3)};`;
        let rankText = `#${index + 1} Recommendation`;

        if (index === 0) rankBadgeStyle = `background: linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.2)); color: #fbbf24; border: 1px solid rgba(251, 191, 36, 0.5);`; // Gold
        else if (index === 1) rankBadgeStyle = `background: linear-gradient(135deg, rgba(148, 163, 184, 0.2), rgba(100, 116, 139, 0.2)); color: #cbd5e1; border: 1px solid rgba(148, 163, 184, 0.5);`; // Silver
        else if (index === 2) rankBadgeStyle = `background: linear-gradient(135deg, rgba(205, 127, 50, 0.2), rgba(184, 115, 51, 0.2)); color: #cd7f32; border: 1px solid rgba(205, 127, 50, 0.5);`; // Bronze

        const card = document.createElement('div');
        card.className = 'recommendation-card';
        card.innerHTML = `
            <div class="recommendation-badge" style="${rankBadgeStyle}">
                <i class="${platformIcon}"></i> ${rankText}
            </div>
            <div class="recommendation-content">
                <div class="recommendation-platform">
                    <h3>${rec.platform} - ${rec.service_name}</h3>
                </div>
                <div class="recommendation-stats">
                    <div class="stat-item" style="text-align: left;">
                        <span class="stat-label">Est. Cost</span>
                        <span class="stat-value cost" style="font-size: 1.25rem;">$${rec.cost.toFixed(2)}</span>
                    </div>
                    <div class="stat-item" style="text-align: right;">
                        <span class="stat-label">Performance</span>
                        <span class="stat-value performance" style="font-size: 1.25rem; color: ${color};">${rec.performanceLevel}</span>
                    </div>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });

    grid.style.display = 'grid';
}

// Generate gradient for bars based on platform color - Premium Financial Dashboard Style
function createGradient(ctx, color) {
    const canvasHeight = ctx.canvas.height || 250;
    const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    // Subtle premium gradient: light at top fading to darker
    gradient.addColorStop(0, adjustColorBrightness(color, 1.25));
    gradient.addColorStop(0.35, adjustColorBrightness(color, 1.1));
    gradient.addColorStop(0.65, color);
    gradient.addColorStop(1, adjustColorBrightness(color, 0.5));
    return gradient;
}

// Create gradient with premium glow effect
function createGlowGradient(ctx, color) {
    const canvasHeight = ctx.canvas.height || 250;
    const gradient = ctx.createLinearGradient(0, canvasHeight, 0, 0);
    gradient.addColorStop(0, adjustColorOpacity(color, 0.15));
    gradient.addColorStop(0.4, adjustColorOpacity(color, 0.5));
    gradient.addColorStop(0.7, adjustColorOpacity(color, 0.8));
    gradient.addColorStop(1, adjustColorBrightness(color, 1.4));
    return gradient;
}

// Create soft shadow gradient for bars
function createShadowGradient(ctx, color) {
    const canvasHeight = ctx.canvas.height || 250;
    const gradient = ctx.createLinearGradient(0, canvasHeight * 0.7, 0, canvasHeight);
    gradient.addColorStop(0, adjustColorOpacity(color, 0));
    gradient.addColorStop(1, adjustColorOpacity(color, 0.35));
    return gradient;
}

// Adjust color brightness helper
function adjustColorBrightness(hex, factor) {
    const r = Math.min(255, Math.round(parseInt(hex.slice(1, 3), 16) * factor));
    const g = Math.min(255, Math.round(parseInt(hex.slice(3, 5), 16) * factor));
    const b = Math.min(255, Math.round(parseInt(hex.slice(5, 7), 16) * factor));
    return `rgb(${r}, ${g}, ${b})`;
}

// Adjust color opacity helper
function adjustColorOpacity(hex, opacity) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

// Custom easing function - easeOutCubic
function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

// Custom easing function - easeOutQuart
function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
}

// Enhanced chart options with smooth animations and clean design - Premium Financial Dashboard Style
function getChartOptions(title) {
    return {
        responsive: true,
        maintainAspectRatio: true,
        animation: {
            duration: 1500,
            easing: 'easeOutCubic',
            delay: function (context) {
                // Staggered animation on load for premium feel
                return context.dataIndex * 120;
            }
        },
        interaction: {
            mode: 'index',
            intersect: false,
        },
        hover: {
            mode: 'index',
            intersect: false,
            axis: 'x'
        },
        plugins: {
            legend: {
                display: false // Remove unnecessary legends for cleaner UI
            },
            tooltip: {
                enabled: true,
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                titleColor: '#ffffff',
                bodyColor: '#e2e8f0',
                borderColor: 'rgba(59, 130, 246, 0.4)',
                borderWidth: 1,
                padding: 14,
                cornerRadius: 12,
                displayColors: true,
                boxPadding: 8,
                titleFont: {
                    family: "'Inter', sans-serif",
                    size: 13,
                    weight: '600'
                },
                bodyFont: {
                    family: "'Inter', sans-serif",
                    size: 12,
                    weight: '500'
                },
                callbacks: {
                    label: function (context) {
                        return title + ': ' + context.parsed.y.toFixed(2);
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: "rgba(255, 255, 255, 0.03)", // Subtle grid
                    drawBorder: false,
                    lineWidth: 1
                },
                ticks: {
                    color: "#64748b",
                    font: {
                        family: "'Inter', sans-serif",
                        size: 11,
                        weight: '500'
                    },
                    padding: 12,
                    backdropColor: 'transparent'
                },
                border: {
                    display: false
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: "#64748b",
                    font: {
                        family: "'Inter', sans-serif",
                        size: 10,
                        weight: '500'
                    },
                    padding: 8,
                    maxRotation: 45
                },
                border: {
                    display: false
                }
            }
        }
    };
}

// Display charts
function displayCharts(services) {
    const labels = services.map(s => s.platform + ' ' + s.service_name.split(' ').slice(1).join(' '));
    const costs = services.map(s => s.cost);
    const performance = services.map(s => s.performance_score);
    const scores = services.map(s => s.score);
    const bgColors = services.map(s => platformColors[s.platform] || '#64748b');

    // Destroy existing charts
    if (costChartInstance) costChartInstance.destroy();
    if (performanceChartInstance) performanceChartInstance.destroy();
    if (rankingChartInstance) rankingChartInstance.destroy();
    if (distributionChartInstance) distributionChartInstance.destroy();
    if (valueChartInstance) valueChartInstance.destroy();
    if (popularityChartInstance) popularityChartInstance.destroy();
    if (trendChartInstance) trendChartInstance.destroy();

    // Get canvas contexts
    const costCtx = document.getElementById("costChart").getContext("2d");
    const perfCtx = document.getElementById("performanceChart").getContext("2d");
    const rankCtx = document.getElementById("rankingChart").getContext("2d");

    // Cost Chart with enhanced gradient and modern SaaS styling
    costChartInstance = new Chart(costCtx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Cost ($)",
                data: costs,
                backgroundColor: bgColors.map(c => createGradient(costCtx, c)),
                borderColor: 'transparent',
                borderWidth: 0,
                borderRadius: 14, // Rounded bars (12-15px)
                borderSkipped: false,
                hoverBackgroundColor: bgColors.map(c => createGlowGradient(costCtx, c)),
                hoverBorderWidth: 0,
                barPercentage: 0.7, // Consistent thickness
                categoryPercentage: 0.8 // Bar spacing
            }]
        },
        options: {
            ...getChartOptions("Cost"),
            plugins: {
                ...getChartOptions("Cost").plugins,
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    titleColor: '#ffffff',
                    bodyColor: '#e2e8f0',
                    borderColor: 'rgba(59, 130, 246, 0.3)',
                    borderWidth: 1,
                    padding: 14,
                    cornerRadius: 10,
                    callbacks: {
                        label: function (context) {
                            return "Cost: $" + context.raw.toFixed(2);
                        }
                    }
                }
            }
        }
    });

    // Performance Chart with enhanced gradient and modern SaaS styling
    performanceChartInstance = new Chart(perfCtx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Performance",
                data: performance,
                backgroundColor: bgColors.map(c => createGradient(perfCtx, c)),
                borderColor: 'transparent',
                borderWidth: 0,
                borderRadius: 14, // Rounded bars (12-15px)
                borderSkipped: false,
                hoverBackgroundColor: bgColors.map(c => createGlowGradient(perfCtx, c)),
                hoverBorderWidth: 0,
                barPercentage: 0.7,
                categoryPercentage: 0.8
            }]
        },
        options: {
            ...getChartOptions("Performance"),
            scales: {
                ...getChartOptions("Performance").scales,
                y: {
                    ...getChartOptions("Performance").scales.y,
                    max: 10
                }
            },
            plugins: {
                ...getChartOptions("Performance").plugins,
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    titleColor: '#ffffff',
                    bodyColor: '#e2e8f0',
                    borderColor: 'rgba(59, 130, 246, 0.3)',
                    borderWidth: 1,
                    padding: 14,
                    cornerRadius: 10,
                    callbacks: {
                        label: function (context) {
                            return "Performance: " + context.raw;
                        }
                    }
                }
            }
        }
    });

    // Ranking Chart with enhanced gradient and modern SaaS styling
    rankingChartInstance = new Chart(rankCtx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Score",
                data: scores,
                backgroundColor: bgColors.map(c => createGradient(rankCtx, c)),
                borderColor: 'transparent',
                borderWidth: 0,
                borderRadius: 14, // Rounded bars (12-15px)
                borderSkipped: false,
                hoverBackgroundColor: bgColors.map(c => createGlowGradient(rankCtx, c)),
                hoverBorderWidth: 0,
                barPercentage: 0.7,
                categoryPercentage: 0.8
            }]
        },
        options: {
            ...getChartOptions("Score"),
            scales: {
                ...getChartOptions("Score").scales,
                y: {
                    ...getChartOptions("Score").scales.y,
                    max: 10
                }
            },
            plugins: {
                ...getChartOptions("Score").plugins,
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    titleColor: '#ffffff',
                    bodyColor: '#e2e8f0',
                    borderColor: 'rgba(59, 130, 246, 0.3)',
                    borderWidth: 1,
                    padding: 14,
                    cornerRadius: 10,
                    callbacks: {
                        label: function (context) {
                            return "Score: " + context.raw.toFixed(1);
                        }
                    }
                }
            }
        }
    });

    // Additional charts - Platform Comparison
    displayPlatformCharts(services);

    // Display Trend Line Chart - Stock Market Style
    displayTrendChart(services);
}

// Display Trend Line Chart - Stock Market Style
function displayTrendChart(services) {
    const trendCtx = document.getElementById("trendChart").getContext("2d");

    // Generate simulated trend data based on services
    // Create 12 months of trend data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Map over all services instead of just platforms
    const datasets = services.map((service, index) => {
        const baseCost = service.cost || 50;
        const variation = (index + 1) * 0.1;

        // Generate trend data with some variation
        const data = months.map((_, i) => {
            const randomVar = (Math.sin(i * 0.5 + index) * 0.15 + 1);
            const trend = baseCost * randomVar * (1 - variation * 0.1 + (i * 0.02));
            return parseFloat(trend.toFixed(2));
        });

        const color = platformColors[service.platform] || '#64748b';

        return {
            label: `${service.platform} - ${service.service_name}`,
            data: data,
            borderColor: color,
            backgroundColor: adjustColorOpacity(color, 0.1),
            borderWidth: 2,
            fill: false,
            tension: 0.4, // Smooth curves like stock charts
            pointRadius: 4,
            pointHoverRadius: 8,
            pointBackgroundColor: color,
            pointBorderColor: 'rgba(15, 23, 42, 0.9)',
            pointBorderWidth: 2,
            pointHoverBackgroundColor: color,
            pointHoverBorderColor: '#ffffff'
        };
    });

    trendChartInstance = new Chart(trendCtx, {
        type: "line",
        data: {
            labels: months,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            interaction: {
                mode: 'index',
                intersect: false,
                axis: 'x'
            },
            hover: {
                mode: 'index',
                intersect: false,
                axis: 'x'
            },
            animation: {
                duration: 1800,
                easing: 'easeOutCubic'
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    align: 'end',
                    labels: {
                        color: "#94a3b8",
                        padding: 24,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        font: {
                            family: "'Inter', sans-serif",
                            size: 11,
                            weight: '500'
                        }
                    }
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    titleColor: '#ffffff',
                    bodyColor: '#e2e8f0',
                    borderColor: 'rgba(59, 130, 246, 0.4)',
                    borderWidth: 1,
                    padding: 16,
                    cornerRadius: 12,
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        title: function (context) {
                            return '📊 ' + context[0].label + ' 2024';
                        },
                        label: function (context) {
                            return context.dataset.label + ': $' + context.raw.toFixed(2);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: "rgba(255, 255, 255, 0.025)",
                        drawBorder: false
                    },
                    ticks: {
                        color: "#64748b",
                        font: {
                            family: "'Inter', sans-serif",
                            size: 11,
                            weight: '500'
                        },
                        padding: 12,
                        callback: function (value) {
                            return '$' + value;
                        }
                    },
                    border: {
                        display: false
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: "#64748b",
                        font: {
                            family: "'Inter', sans-serif",
                            size: 10,
                            weight: '500'
                        },
                        padding: 8
                    },
                    border: {
                        display: false
                    }
                }
            }
        }
    });
}

// Display additional platform comparison charts with enhanced styling
function displayPlatformCharts(services) {
    // Get platform-level aggregated data
    const platforms = [...new Set(services.map(s => s.platform))];
    const platformData = platforms.map(p => {
        const platformServices = services.filter(s => s.platform === p);
        return {
            platform: p,
            avgCost: platformServices.reduce((a, s) => a + s.cost, 0) / platformServices.length,
            avgPerformance: platformServices.reduce((a, s) => a + s.performance_score, 0) / platformServices.length,
            avgPopularity: platformServices.reduce((a, s) => a + (s.popularity_score || 5), 0) / platformServices.length,
            avgScore: platformServices.reduce((a, s) => a + s.score, 0) / platformServices.length,
            count: platformServices.length
        };
    });

    const platformLabels = platformData.map(p => p.platform);
    const platformBgColors = platformData.map(p => platformColors[p.platform] || '#64748b');

    // Get canvas contexts
    const distCtx = document.getElementById("distributionChart").getContext("2d");
    const valueCtx = document.getElementById("valueChart").getContext("2d");
    const popCtx = document.getElementById("popularityChart").getContext("2d");

    // Distribution Doughnut Chart with premium styling
    distributionChartInstance = new Chart(distCtx, {
        type: "doughnut",
        data: {
            labels: platformLabels,
            datasets: [{
                data: platformData.map(p => p.count),
                backgroundColor: platformBgColors.map(c => adjustColorOpacity(c, 0.85)),
                borderColor: "rgba(15, 23, 42, 0.95)",
                borderWidth: 4,
                hoverOffset: 16,
                hoverBorderColor: "rgba(59, 130, 246, 0.9)",
                hoverBorderWidth: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            animation: {
                duration: 1600,
                easing: 'easeOutCubic',
                animateRotate: true,
                animateScale: true
            },
            cutout: '60%',
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        color: "#94a3b8",
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        font: {
                            family: "'Inter', sans-serif",
                            size: 11,
                            weight: '500'
                        }
                    }
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    titleColor: '#ffffff',
                    bodyColor: '#e2e8f0',
                    borderColor: 'rgba(59, 130, 246, 0.4)',
                    borderWidth: 1,
                    padding: 16,
                    cornerRadius: 12,
                    callbacks: {
                        label: function (context) {
                            return '📊 ' + context.label + ': ' + context.raw + ' services';
                        }
                    }
                }
            }
        }
    });

    // Value Score Chart with enhanced gradient and modern SaaS styling
    valueChartInstance = new Chart(valueCtx, {
        type: "bar",
        data: {
            labels: platformLabels,
            datasets: [{
                label: "Value Score",
                data: platformData.map(p => p.avgScore),
                backgroundColor: platformBgColors.map(c => createGradient(valueCtx, c)),
                borderColor: 'transparent',
                borderWidth: 0,
                borderRadius: 14, // Rounded bars (12-15px)
                borderSkipped: false,
                hoverBackgroundColor: platformBgColors.map(c => createGlowGradient(valueCtx, c)),
                hoverBorderWidth: 0,
                barPercentage: 0.7,
                categoryPercentage: 0.8
            }]
        },
        options: {
            ...getChartOptions("Value"),
            scales: {
                ...getChartOptions("Value").scales,
                y: {
                    ...getChartOptions("Value").scales.y,
                    max: 10
                }
            },
            plugins: {
                ...getChartOptions("Value").plugins,
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    titleColor: '#ffffff',
                    bodyColor: '#e2e8f0',
                    borderColor: 'rgba(59, 130, 246, 0.3)',
                    borderWidth: 1,
                    padding: 14,
                    cornerRadius: 10,
                    callbacks: {
                        label: function (context) {
                            return "Value: " + context.raw.toFixed(1);
                        }
                    }
                }
            }
        }
    });

    // Popularity Chart with enhanced gradient and modern SaaS styling
    popularityChartInstance = new Chart(popCtx, {
        type: "bar",
        data: {
            labels: platformLabels,
            datasets: [{
                label: "Popularity",
                data: platformData.map(p => p.avgPopularity),
                backgroundColor: platformBgColors.map(c => createGradient(popCtx, c)),
                borderColor: 'transparent',
                borderWidth: 0,
                borderRadius: 14, // Rounded bars (12-15px)
                borderSkipped: false,
                hoverBackgroundColor: platformBgColors.map(c => createGlowGradient(popCtx, c)),
                hoverBorderWidth: 0,
                barPercentage: 0.7,
                categoryPercentage: 0.8
            }]
        },
        options: {
            ...getChartOptions("Popularity"),
            scales: {
                ...getChartOptions("Popularity").scales,
                y: {
                    ...getChartOptions("Popularity").scales.y,
                    max: 10
                }
            },
            plugins: {
                ...getChartOptions("Popularity").plugins,
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    titleColor: '#ffffff',
                    bodyColor: '#e2e8f0',
                    borderColor: 'rgba(59, 130, 246, 0.3)',
                    borderWidth: 1,
                    padding: 14,
                    cornerRadius: 10,
                    callbacks: {
                        label: function (context) {
                            return "Popularity: " + context.raw.toFixed(1);
                        }
                    }
                }
            }
        }
    });
}

// Display results table
function displayTable(services) {
    const tbody = document.getElementById('resultsBody');

    // Clear existing rows
    tbody.innerHTML = "";

    // Add rows for each service
    services.forEach(s => {
        const row = document.createElement("tr");

        // Get rank badge class
        let rankClass = "rank-other";
        if (s.rank === 1) rankClass = "rank-1";
        else if (s.rank === 2) rankClass = "rank-2";
        else if (s.rank === 3) rankClass = "rank-3";

        // Get performance class
        let perfClass = "perf-low";
        if (s.performanceLevel === "High") perfClass = "perf-high";
        else if (s.performanceLevel === "Medium") perfClass = "perf-medium";

        row.innerHTML = `
            <td><span class="rank-badge ${rankClass}">#${s.rank}</span></td>
            <td>
                <span class="platform-badge" style="background: ${platformColors[s.platform]}">
                    ${s.platform}
                </span>
            </td>
            <td>${s.service_name}</td>
            <td>${s.cpu || '-'}</td>
            <td>${s.ram || '-'}</td>
            <td>${s.storage || '-'}</td>
            <td><strong>$${s.cost_per_hour.toFixed(4)}</strong></td>
            <td><strong>$${s.cost_per_day.toFixed(2)}</strong></td>
            <td><strong>$${s.cost_per_week.toFixed(2)}</strong></td>
            <td><strong>$${s.cost_per_month.toFixed(2)}</strong></td>
            <td><span class="${perfClass}">${s.performanceLevel}</span></td>
            <td>${(s.popularity_score || 5).toFixed(1)}/10</td>
            <td><strong>${s.score.toFixed(1)}</strong></td>
        `;

        tbody.appendChild(row);
    });
}

// Sort table (Data-driven instead of DOM-driven)
function sortTable(sortBy) {
    if (!currentServices || currentServices.length === 0) return;

    // Create a clone to safely sort and update UI ranks
    let sortedList = [...currentServices];

    if (sortBy === 'cost') {
        sortedList.sort((a, b) => {
            const costA = a.cost || a.cost_per_month || 0;
            const costB = b.cost || b.cost_per_month || 0;
            return costA - costB;
        });
    } else {
        sortedList.sort((a, b) => {
            const scoreA = a.score || 0;
            const scoreB = b.score || 0;
            return scoreB - scoreA;
        });
    }

    // Smoothly re-render table 
    displayTable(sortedList);
}

// Show loading state
function showLoading() {
    document.getElementById('loadingState').style.display = 'flex';
    document.getElementById('resultsSection').style.display = 'none';
    document.getElementById('emptyState').style.display = 'none';
}

// Hide loading state
function hideLoading() {
    document.getElementById('loadingState').style.display = 'none';
}

// Show error message
function showError(message) {
    alert(message);
}

// Display provider statistics
function displayProviderStats(stats) {
    const grid = document.getElementById('providerStatsGrid');
    if (!grid || !stats) return;

    grid.innerHTML = '';
    stats.forEach(stat => {
        const card = document.createElement('div');
        card.style.background = 'rgba(15, 23, 42, 0.6)';
        card.style.border = '1px solid rgba(255, 255, 255, 0.05)';
        card.style.borderRadius = '12px';
        card.style.padding = '1.5rem';
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.style.gap = '0.5rem';

        card.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                <span style="color: ${platformColors[stat.platform] || '#3b82f6'}; font-size: 1.25rem;">
                    <i class="${platformIcons[stat.platform] || 'fas fa-cloud'}"></i>
                </span>
                <strong style="font-size: 1.1rem; color: white;">${stat.platform}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.9rem;">
                <span style="color: #94a3b8;">Services:</span>
                <span style="color: white; font-weight: 500;">${stat.count}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.9rem;">
                <span style="color: #94a3b8;">Avg Cost:</span>
                <span style="color: white; font-weight: 500;">$${stat.avgCost.toFixed(2)}/mo</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.9rem;">
                <span style="color: #94a3b8;">Avg Performance:</span>
                <span style="color: white; font-weight: 500;">${stat.avgPerformance.toFixed(1)}/10</span>
            </div>
        `;
        grid.appendChild(card);
    });
}

// ============================================================
// AI COMPARE LOGIC
// ============================================================
function toggleView(view) {
    const cloudBtn = document.getElementById('btn-view-cloud');
    const aiBtn = document.getElementById('btn-view-ai');
    const cloudView = document.getElementById('cloudView');
    const aiView = document.getElementById('aiView');

    if (view === 'cloud') {
        cloudBtn.classList.add('active');
        aiBtn.classList.remove('active');
        cloudView.style.display = 'block';
        aiView.style.display = 'none';

        // ensure correct results show up if previously completed
        document.getElementById('aiResultsSection').style.display = 'none';
        if (currentServices && currentServices.length > 0 && !isComparing) {
            document.getElementById('resultsSection').style.display = 'block';
        }
    } else {
        aiBtn.classList.add('active');
        cloudBtn.classList.remove('active');
        aiView.style.display = 'block';
        cloudView.style.display = 'none';

        document.getElementById('resultsSection').style.display = 'none';
    }
}

async function compareAiTools() {
    if (isComparing) return;

    const purpose = document.getElementById('aiPurpose').value;
    const compareBtn = document.getElementById('btnCompareAi');

    compareBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
    compareBtn.style.opacity = '0.7';
    compareBtn.style.cursor = 'not-allowed';
    isComparing = true;

    // We can reuse the main loading UI for AI too
    document.getElementById('loadingState').style.display = 'flex';
    document.getElementById('aiResultsSection').style.display = 'none';
    document.getElementById('aiEmptyState').style.display = 'none';

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        const res = await fetch(`${API_BASE_URL}/api/ai-compare`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ purpose: purpose })
        });

        const result = await res.json();
        if (result.error) throw new Error(result.error);
        if (!result.tools || result.tools.length === 0) {
            showError("No AI tools found for the category");
            return;
        }

        hideLoading();
        displayAiRecommendations(result.tools);
        document.getElementById('aiResultsSection').style.display = 'block';

    } catch (error) {
        console.error("AI Compare error:", error);
        hideLoading();
        showError("Failed to compare AI tools. Please try again.\n" + error.message);
        document.getElementById('aiEmptyState').style.display = 'block';
    } finally {
        isComparing = false;
        compareBtn.innerHTML = '<i class="fas fa-magic"></i> Compare AI Tools';
        compareBtn.style.opacity = '1';
        compareBtn.style.cursor = 'pointer';
    }
}

function displayAiRecommendations(tools) {
    const grid = document.getElementById('aiRecommendationsGrid');
    grid.innerHTML = '';

    tools.forEach((tool, index) => {
        let rankBadgeStyle = `background: rgba(148, 163, 184, 0.2); color: #cbd5e1; border: 1px solid rgba(148, 163, 184, 0.5);`;
        if (index === 0) rankBadgeStyle = `background: linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.2)); color: #fbbf24; border: 1px solid rgba(251, 191, 36, 0.5);`;
        else if (index === 1) rankBadgeStyle = `background: linear-gradient(135deg, rgba(148, 163, 184, 0.2), rgba(100, 116, 139, 0.2)); color: #cbd5e1; border: 1px solid rgba(148, 163, 184, 0.5);`;
        else if (index === 2) rankBadgeStyle = `background: linear-gradient(135deg, rgba(205, 127, 50, 0.2), rgba(184, 115, 51, 0.2)); color: #cd7f32; border: 1px solid rgba(205, 127, 50, 0.5);`;

        const card = document.createElement('div');
        card.className = 'recommendation-card';
        card.innerHTML = `
            <div class="recommendation-badge" style="${rankBadgeStyle}">
                <i class="fas fa-trophy"></i> #${tool.rank} Recommendation
            </div>
            <div class="recommendation-content">
                <div class="recommendation-platform">
                    <h3 style="flex-wrap: wrap;">${tool.tool_name} <span style="font-size: 0.8em; color: #a89968; font-weight: normal;">by ${tool.provider}</span></h3>
                </div>
                <p style="color: #e2e8f0; font-size: 0.95rem; line-height: 1.5; margin: 0.5rem 0;">${tool.description}</p>
                <div class="recommendation-stats" style="margin-top: auto; flex-wrap: wrap; gap: 1rem;">
                    <div class="stat-item" style="text-align: left; flex: 1; min-width: 120px;">
                        <span class="stat-label">Model Engine</span>
                        <span class="stat-value" style="font-size: 1rem; color: #fff;">${tool.model_number}</span>
                    </div>
                    <div class="stat-item" style="text-align: left; flex: 1; min-width: 120px;">
                        <span class="stat-label">Pricing</span>
                        <span class="stat-value" style="font-size: 1rem; color: #fbbf24;">${tool.pricing}</span>
                    </div>
                    <div class="stat-item" style="text-align: right;">
                        <span class="stat-label">Rating</span>
                        <span class="stat-value performance" style="font-size: 1.25rem;">${tool.score.toFixed(1)}/10</span>
                    </div>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// ============================================================
// THEME TOGGLE (Dark / Light)
// ============================================================
(function initThemeToggle() {
    const toggle = document.getElementById('themeToggle');
    const icon = document.getElementById('themeIcon');
    if (!toggle || !icon) return;

    // Restore saved preference
    const saved = localStorage.getItem('cc-theme');
    if (saved === 'light') {
        document.body.classList.add('light-theme');
        icon.classList.replace('fa-sun', 'fa-moon');
    }

    toggle.addEventListener('click', () => {
        const isLight = document.body.classList.toggle('light-theme');
        icon.classList.replace(
            isLight ? 'fa-sun' : 'fa-moon',
            isLight ? 'fa-moon' : 'fa-sun'
        );
        localStorage.setItem('cc-theme', isLight ? 'light' : 'dark');

        // Update Chart.js grid/tick colors for the new theme
        const tickColor = isLight ? '#6b5c3e' : '#a89968';
        const gridColor = isLight ? 'rgba(184,134,11,0.08)' : 'rgba(212,160,23,0.08)';
        [costChartInstance, performanceChartInstance, rankingChartInstance,
            distributionChartInstance, valueChartInstance, popularityChartInstance,
            trendChartInstance].forEach(chart => {
                if (!chart) return;
                if (chart.options.scales?.y) {
                    chart.options.scales.y.ticks.color = tickColor;
                    chart.options.scales.y.grid.color = gridColor;
                }
                if (chart.options.scales?.x) {
                    chart.options.scales.x.ticks.color = tickColor;
                }
                chart.update('none');
            });
    });
})();

// Export for potential testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        compare,
        displayRecommendation,
        displayCharts,
        displayTable,
        sortTable
    };
}
