def risk_calc(
    amount,
    payment_method,
    location,
    previous_transactions,
    recent_transactions,
    average_amount,
    new_location
):

    risk_points = 0
    risk_reasons = []

    # -------------------------
    # 1. Amount risk
    # -------------------------

    if amount > 50000:
        risk_points += 40

        risk_reasons.append(
            "Transaction amount is above 50000"
        )

    elif amount > 10000:
        risk_points += 20

        risk_reasons.append(
            "Transaction amount is above 10000"
        )


    # -------------------------
    # 2. Payment method risk
    # -------------------------

    if payment_method == "CARD":
        risk_points += 10

        risk_reasons.append(
            "Payment made using CARD"
        )

    elif payment_method == "UPI":
        risk_points += 5


    # -------------------------
    # 3. Unknown location
    # -------------------------

    if location.upper() == "UNKNOWN":
        risk_points += 20

        risk_reasons.append(
            "Transaction location is UNKNOWN"
        )


    # -------------------------
    # 4. New location
    # -------------------------

    if previous_transactions > 0 and new_location:
        risk_points += 15

        risk_reasons.append(
            "Transaction made from a new location"
        )


    # -------------------------
    # 5. Previous transactions
    # -------------------------

    if previous_transactions >= 3:
        risk_points += 20

        risk_reasons.append(
            "User has 3 or more previous transactions"
        )


    # -------------------------
    # 6. Rapid transactions
    # -------------------------

    if recent_transactions >= 3:
        risk_points += 30

        risk_reasons.append(
            "User made 3 or more transactions in the last 10 minutes"
        )


    # -------------------------
    # 7. Unusual amount
    # -------------------------

    if average_amount > 0 and amount >= average_amount * 3:

        risk_points += 25

        risk_reasons.append(
            "Transaction amount is unusually high compared with user's average"
        )


    # -------------------------
    # Risk level
    # -------------------------

    if risk_points >= 60:
        risk_level = "HIGH"

    elif risk_points >= 30:
        risk_level = "MEDIUM"

    else:
        risk_level = "LOW"


    # -------------------------
    # Decision
    # -------------------------

    if risk_level == "HIGH":
        decision = "BLOCK"

    elif risk_level == "MEDIUM":
        decision = "REVIEW"

    else:
        decision = "APPROVE"


    return risk_points, risk_level, risk_reasons, decision