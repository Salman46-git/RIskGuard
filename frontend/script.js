// ============================================================
// RISKGUARD FRONTEND
// ============================================================

// FastAPI backend
const API_BASE_URL = "https://riskguard-xvhw.onrender.com";


// Store transactions in memory
let allTransactions = [];


// ============================================================
// PAGE NAVIGATION
// ============================================================

const navItems = document.querySelectorAll(".nav-item");

navItems.forEach(item => {

    item.addEventListener("click", () => {

        const page = item.dataset.page;

        showPage(page);

    });

});


function showPage(pageId) {

    // Hide all pages
    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active-page");
    });


    // Show selected page
    const selectedPage = document.getElementById(pageId);

    if (selectedPage) {
        selectedPage.classList.add("active-page");
    }


    // Update active navigation item
    navItems.forEach(item => {

        item.classList.remove("active");

        if (item.dataset.page === pageId) {
            item.classList.add("active");
        }

    });


    // Load page-specific data
    if (pageId === "dashboard") {
        loadDashboard();
    }

    if (pageId === "transactions") {
        loadTransactions();
    }


    // Close mobile menu
    document.querySelector(".sidebar").classList.remove("mobile-open");
}


// ============================================================
// MOBILE MENU
// ============================================================

document
    .getElementById("menuButton")
    .addEventListener("click", () => {

        document
            .querySelector(".sidebar")
            .classList.toggle("mobile-open");

    });


// ============================================================
// API REQUEST HELPER
// ============================================================

async function apiRequest(endpoint, options = {}) {

    try {

        const response = await fetch(
            `${API_BASE_URL}${endpoint}`,
            options
        );


        if (!response.ok) {

            let errorMessage = "Something went wrong.";

            try {

                const errorData = await response.json();

                if (errorData.detail) {

                    if (Array.isArray(errorData.detail)) {

                        errorMessage = errorData.detail
                            .map(error => error.msg)
                            .join(", ");

                    } else {

                        errorMessage = errorData.detail;

                    }

                }

            } catch {
                // Ignore JSON parsing error
            }


            throw new Error(errorMessage);
        }


        return await response.json();

    } catch (error) {

        console.error(error);

        if (error.message === "Failed to fetch") {

            showToast(
                "Unable to connect to FastAPI. Make sure the backend is running on port 8000."
            );

        } else {

            showToast(error.message);

        }

        throw error;
    }
}


// ============================================================
// DASHBOARD
// ============================================================

async function loadDashboard() {

    try {

        const statistics = await apiRequest("/statistics");

        updateStatistics(statistics);


        const transactions = await apiRequest("/transactions");

        allTransactions = transactions;

        renderRecentTransactions(transactions);

    } catch (error) {

        console.error("Dashboard error:", error);

    }

}


// ============================================================
// UPDATE STATISTICS
// ============================================================

function updateStatistics(stats) {

    document.getElementById("totalTransactions").textContent =
        stats.total_transactions;


    document.getElementById("totalAmount").textContent =
        formatCurrency(stats.total_amount);


    document.getElementById("lowRisk").textContent =
        stats.low_risk;


    document.getElementById("mediumRisk").textContent =
        stats.medium_risk;


    document.getElementById("highRisk").textContent =
        stats.high_risk;


    document.getElementById("approved").textContent =
        stats.approved;


    document.getElementById("review").textContent =
        stats.review;


    document.getElementById("blocked").textContent =
        stats.blocked;


    document.getElementById("chartTotal").textContent =
        stats.total_transactions;


    document.getElementById("legendLow").textContent =
        stats.low_risk;


    document.getElementById("legendMedium").textContent =
        stats.medium_risk;


    document.getElementById("legendHigh").textContent =
        stats.high_risk;


    const total = stats.total_transactions;


    if (total > 0) {

        const approvedPercent =
            (stats.approved / total) * 100;

        const reviewPercent =
            (stats.review / total) * 100;

        const blockedPercent =
            (stats.blocked / total) * 100;


        document.getElementById("approvedPercent").textContent =
            `${approvedPercent.toFixed(1)}%`;

        document.getElementById("reviewPercent").textContent =
            `${reviewPercent.toFixed(1)}%`;

        document.getElementById("blockedPercent").textContent =
            `${blockedPercent.toFixed(1)}%`;


        document.getElementById("approvedBar").style.width =
            `${approvedPercent}%`;

        document.getElementById("reviewBar").style.width =
            `${reviewPercent}%`;

        document.getElementById("blockedBar").style.width =
            `${blockedPercent}%`;

    } else {

        document.getElementById("approvedPercent").textContent = "0%";
        document.getElementById("reviewPercent").textContent = "0%";
        document.getElementById("blockedPercent").textContent = "0%";

        document.getElementById("approvedBar").style.width = "0%";
        document.getElementById("reviewBar").style.width = "0%";
        document.getElementById("blockedBar").style.width = "0%";
    }


    updateRiskChart(stats);

}


// ============================================================
// RISK DONUT CHART
// ============================================================

function updateRiskChart(stats) {

    const total = stats.total_transactions;


    if (total === 0) {

        document.querySelector(".donut-chart").style.background =
            "#1e293b";

        return;
    }


    const lowDegrees =
        (stats.low_risk / total) * 360;

    const mediumDegrees =
        (stats.medium_risk / total) * 360;


    const mediumEnd =
        lowDegrees + mediumDegrees;


    const gradient = `
        conic-gradient(
            #22c55e 0deg ${lowDegrees}deg,
            #f59e0b ${lowDegrees}deg ${mediumEnd}deg,
            #ef4444 ${mediumEnd}deg 360deg
        )
    `;


    document.querySelector(".donut-chart").style.background =
        gradient;
}


// ============================================================
// RECENT TRANSACTIONS
// ============================================================

function renderRecentTransactions(transactions) {

    const body =
        document.getElementById("recentTransactionsBody");


    body.innerHTML = "";


    if (transactions.length === 0) {

        body.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;">
                    No transactions available.
                </td>
            </tr>
        `;

        return;
    }


    transactions
        .slice(0, 8)
        .forEach(transaction => {

            body.innerHTML += createTransactionRow(
                transaction,
                false
            );

        });
}


// ============================================================
// TRANSACTIONS PAGE
// ============================================================

async function loadTransactions() {

    try {

        allTransactions =
            await apiRequest("/transactions");

        renderTransactions(allTransactions);

    } catch (error) {

        console.error("Transactions error:", error);

    }
}


function renderTransactions(transactions) {

    const body =
        document.getElementById("transactionsBody");


    body.innerHTML = "";


    if (transactions.length === 0) {

        body.innerHTML = `
            <tr>
                <td colspan="9" style="text-align:center;">
                    No transactions found.
                </td>
            </tr>
        `;

        return;
    }


    transactions.forEach(transaction => {

        body.innerHTML += createTransactionRow(
            transaction,
            true
        );

    });
}


// ============================================================
// TRANSACTION ROW
// ============================================================

function createTransactionRow(transaction, detailed) {

    const riskClass =
        getRiskClass(transaction.risk_level);


    const decisionClass =
        getDecisionClass(transaction.decision);


    return `
        <tr>

            <td>
                <strong>#${transaction.id}</strong>
            </td>

            <td>
                ${transaction.user_id}
            </td>

            <td class="amount">
                ${formatCurrency(transaction.amount)}
            </td>

            <td>
                ${transaction.payment_method}
            </td>

            <td>
                ${escapeHTML(transaction.location)}
            </td>

            ${
                detailed
                ?
                `
                <td>
                    ${transaction.risk_points}
                </td>
                `
                :
                ""
            }

            <td>
                <span class="badge ${riskClass}">
                    ${transaction.risk_level}
                </span>
            </td>

            <td>
                <span class="badge ${decisionClass}">
                    ${transaction.decision}
                </span>
            </td>

            ${
                detailed
                ?
                `
                <td>
                    <button
                        class="view-button"
                        onclick="showTransactionDetails(${transaction.id})"
                    >
                        View
                    </button>
                </td>
                `
                :
                ""
            }

        </tr>
    `;
}


// ============================================================
// FILTERING
// ============================================================

document
    .getElementById("transactionSearch")
    .addEventListener("input", applyFilters);


document
    .getElementById("riskFilter")
    .addEventListener("change", applyFilters);


document
    .getElementById("decisionFilter")
    .addEventListener("change", applyFilters);


document
    .getElementById("methodFilter")
    .addEventListener("change", applyFilters);


function applyFilters() {

    const search =
        document
            .getElementById("transactionSearch")
            .value
            .toLowerCase()
            .trim();


    const risk =
        document.getElementById("riskFilter").value;


    const decision =
        document.getElementById("decisionFilter").value;


    const method =
        document.getElementById("methodFilter").value;


    const filtered =
        allTransactions.filter(transaction => {

            const matchesSearch =
                transaction.id.toString().includes(search) ||
                transaction.user_id.toString().includes(search);


            const matchesRisk =
                risk === "ALL" ||
                transaction.risk_level === risk;


            const matchesDecision =
                decision === "ALL" ||
                transaction.decision === decision;


            const matchesMethod =
                method === "ALL" ||
                transaction.payment_method === method;


            return (
                matchesSearch &&
                matchesRisk &&
                matchesDecision &&
                matchesMethod
            );

        });


    renderTransactions(filtered);
}


// ============================================================
// NEW TRANSACTION
// ============================================================

document
    .getElementById("transactionForm")
    .addEventListener("submit", createTransaction);


async function createTransaction(event) {

    event.preventDefault();


    const userId =
        Number(document.getElementById("userId").value);


    const amount =
        Number(document.getElementById("amount").value);


    const paymentMethod =
        document.getElementById("paymentMethod").value;


    const location =
        document.getElementById("location").value.trim();


    // Frontend validation
    if (userId <= 0) {

        showToast("User ID must be greater than 0.");

        return;
    }


    if (amount <= 0) {

        showToast("Amount must be greater than 0.");

        return;
    }


    if (!["CARD", "UPI"].includes(paymentMethod)) {

        showToast("Select a valid payment method.");

        return;
    }


    if (!location) {

        showToast("Location cannot be empty.");

        return;
    }


    const button =
        document.getElementById("analyzeButton");


    button.disabled = true;

    button.textContent = "Analyzing...";


    try {

        const result =
            await apiRequest("/transaction", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    user_id: userId,
                    amount: amount,
                    payment_method: paymentMethod,
                    location: location
                })

            });


        displayTransactionResult(result);


        showToast(
            `Transaction analyzed: ${result.decision}`
        );


        // Refresh stored transactions
        allTransactions =
            await apiRequest("/transactions");


    } catch (error) {

        console.error("Transaction creation error:", error);

    } finally {

        button.disabled = false;

        button.textContent = "Analyze Transaction";

    }
}


// ============================================================
// DISPLAY RESULT
// ============================================================

function displayTransactionResult(result) {

    const panel =
        document.getElementById("resultPanel");


    panel.classList.remove("hidden");


    document.getElementById("resultRiskScore").textContent =
        result.risk_points;


    document.getElementById("resultRiskLevel").textContent =
        result.risk_level;


    document.getElementById("resultTransactionId").textContent =
        `#${result.transaction_id}`;


    document.getElementById("resultPrevious").textContent =
        result.previous_transactions;


    document.getElementById("resultRecent").textContent =
        result.recent_transactions;


    document.getElementById("resultAverage").textContent =
        formatCurrency(result.average_transaction_amount);


    document.getElementById("resultNewLocation").textContent =
        result.new_location ? "Yes" : "No";


    const decision =
        document.getElementById("resultDecision");


    decision.textContent =
        result.decision;


    decision.className =
        `decision-badge ${getDecisionClass(result.decision)}`;


    const riskReasons =
        document.getElementById("riskReasons");


    riskReasons.innerHTML = "";


    if (
        !result.risk_reasons ||
        result.risk_reasons.length === 0
    ) {

        riskReasons.innerHTML = `
            <li>
                No significant risk factors detected.
            </li>
        `;

    } else {

        result.risk_reasons.forEach(reason => {

            const li =
                document.createElement("li");

            li.textContent = reason;

            riskReasons.appendChild(li);

        });

    }


    // Scroll to result
    panel.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


// ============================================================
// USER HISTORY
// ============================================================

async function searchUserHistory() {

    const userId =
        Number(
            document.getElementById("historyUserId").value
        );


    if (userId <= 0) {

        showToast("Enter a valid User ID.");

        return;
    }


    try {

        const data =
            await apiRequest(`/transactions/${userId}`);


        const transactions =
            data.transactions;


        const content =
            document.getElementById("userHistoryContent");


        const empty =
            document.getElementById("userEmpty");


        if (transactions.length === 0) {

            content.classList.add("hidden");

            empty.classList.remove("hidden");

            return;
        }


        empty.classList.add("hidden");

        content.classList.remove("hidden");


        document.getElementById("displayUserId").textContent =
            userId;


        document.getElementById("userTotalTransactions").textContent =
            transactions.length;


        const totalAmount =
            transactions.reduce(
                (sum, transaction) =>
                    sum + Number(transaction.amount),
                0
            );


        document.getElementById("userTotalAmount").textContent =
            formatCurrency(totalAmount);


        const highRisk =
            transactions.filter(
                transaction =>
                    transaction.risk_level === "HIGH"
            ).length;


        const blocked =
            transactions.filter(
                transaction =>
                    transaction.decision === "BLOCK"
            ).length;


        document.getElementById("userHighRisk").textContent =
            highRisk;


        document.getElementById("userBlocked").textContent =
            blocked;


        const body =
            document.getElementById("userTransactionsBody");


        body.innerHTML = "";


        transactions.forEach(transaction => {

            body.innerHTML += `
                <tr>

                    <td>
                        #${transaction.id}
                    </td>

                    <td class="amount">
                        ${formatCurrency(transaction.amount)}
                    </td>

                    <td>
                        ${transaction.payment_method}
                    </td>

                    <td>
                        ${escapeHTML(transaction.location)}
                    </td>

                    <td>
                        <span class="badge ${getRiskClass(transaction.risk_level)}">
                            ${transaction.risk_level}
                        </span>
                    </td>

                    <td>
                        <span class="badge ${getDecisionClass(transaction.decision)}">
                            ${transaction.decision}
                        </span>
                    </td>

                    <td>
                        ${formatDate(transaction.created_at)}
                    </td>

                </tr>
            `;

        });

    } catch (error) {

        console.error("User history error:", error);

    }
}


// ============================================================
// TRANSACTION DETAILS
// ============================================================

async function showTransactionDetails(transactionId) {

    try {

        const transaction =
            await apiRequest(
                `/transaction/${transactionId}`
            );


        document.getElementById("modalTransactionId").textContent =
            `Transaction #${transaction.id}`;


        document.getElementById("modalUserId").textContent =
            transaction.user_id;


        document.getElementById("modalAmount").textContent =
            formatCurrency(transaction.amount);


        document.getElementById("modalMethod").textContent =
            transaction.payment_method;


        document.getElementById("modalLocation").textContent =
            transaction.location;


        document.getElementById("modalRiskScore").textContent =
            transaction.risk_points;


        document.getElementById("modalRiskLevel").textContent =
            transaction.risk_level;


        document.getElementById("modalDecision").textContent =
            transaction.decision;


        document.getElementById("modalCreatedAt").textContent =
            formatDate(transaction.created_at);


        const reasons =
            document.getElementById("modalRiskReasons");


        reasons.innerHTML = "";


        if (transaction.risk_reasons) {

            const reasonList =
                transaction.risk_reasons.split(",");


            reasonList.forEach(reason => {

                const li =
                    document.createElement("li");

                li.textContent =
                    reason.trim();

                reasons.appendChild(li);

            });

        } else {

            reasons.innerHTML = `
                <li>No risk reasons recorded.</li>
            `;

        }


        document
            .getElementById("transactionModal")
            .classList.remove("hidden");


    } catch (error) {

        console.error(
            "Transaction details error:",
            error
        );

    }
}


function closeTransactionModal() {

    document
        .getElementById("transactionModal")
        .classList.add("hidden");

}


// ============================================================
// HELPERS
// ============================================================

function formatCurrency(amount) {

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2
        }
    ).format(amount || 0);
}


function formatDate(date) {

    if (!date) {
        return "-";
    }


    const parsedDate =
        new Date(date.replace(" ", "T") + "Z");


    if (isNaN(parsedDate.getTime())) {
        return date;
    }


    return parsedDate.toLocaleString(
        "en-IN",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );
}


function getRiskClass(riskLevel) {

    switch (riskLevel) {

        case "LOW":
            return "badge-low";

        case "MEDIUM":
            return "badge-medium";

        case "HIGH":
            return "badge-high";

        default:
            return "";

    }
}


function getDecisionClass(decision) {

    switch (decision) {

        case "APPROVE":
            return "badge-approve";

        case "REVIEW":
            return "badge-review";

        case "BLOCK":
            return "badge-block";

        default:
            return "";

    }
}


function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;
}


// ============================================================
// TOAST
// ============================================================

let toastTimeout;


function showToast(message) {

    const toast =
        document.getElementById("toast");


    const toastMessage =
        document.getElementById("toastMessage");


    toastMessage.textContent =
        message;


    toast.classList.remove("hidden");


    clearTimeout(toastTimeout);


    toastTimeout =
        setTimeout(() => {

            toast.classList.add("hidden");

        }, 4000);
}


// ============================================================
// INITIAL LOAD
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadDashboard();

    }
);