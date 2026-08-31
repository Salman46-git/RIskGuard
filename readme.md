# 🛡️ RiskGuard — Transaction Risk & Fraud Detection System

RiskGuard is a rule-based transaction risk assessment system built with **FastAPI, Python, SQLite, HTML, CSS, and JavaScript**.

The system analyzes transactions using multiple risk signals such as transaction amount, payment method, location, transaction frequency, and the user's historical behavior.

Based on the calculated risk score, every transaction is classified as:

- 🟢 LOW — APPROVE
- 🟠 MEDIUM — REVIEW
- 🔴 HIGH — BLOCK

The project also provides APIs and a web dashboard for monitoring transaction activity and investigating user transaction history.

---

## 🎯 Project Objective

The objective of RiskGuard is to demonstrate how a transaction risk detection pipeline can be designed using backend APIs, database storage, rule-based risk scoring, and a monitoring dashboard.

The system attempts to identify potentially suspicious transactions by analyzing both the **current transaction** and **historical user behavior**.

---

## 🚀 Features

### Transaction Analysis

Users can submit:

- User ID
- Transaction amount
- Payment method
- Location

The backend analyzes the transaction and generates:

- Risk score
- Risk level
- Risk reasons
- Transaction decision

---

### Risk Scoring

The current rule-based engine considers factors such as:

- High transaction amount
- Medium transaction amount
- CARD payment
- Unknown location
- New location
- Number of previous transactions
- Number of recent transactions
- Unusually high transaction amount compared with the user's average

Example:

```text
Transaction Amount > ₹50,000
        ↓
+40 Risk Points

CARD Payment
        ↓
+10 Risk Points

UNKNOWN Location
        ↓
+20 Risk Points

Total
─────
70 Risk Points

# RiskGuard

A transaction risk detection system built with FastAPI, Python, SQLite, HTML, CSS, and JavaScript.

## 🚀 Live Demo

[Try RiskGuard](https://transaction-risk-frontend.onrender.com)

## Features

- Transaction risk scoring
- Risk level classification
- Risk reasons
- Transaction history
- User transaction analysis
- Statistics dashboard
- REST API using FastAPI