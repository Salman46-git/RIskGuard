from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Literal

from risk import risk_calc

from database import (
    init_db,
    save_transaction,
    get_transaction,
    get_user_transaction_count,
    get_recent_transaction_count,
    get_user_transactions,
    get_statistics,
    get_transaction_by_id,
    get_user_average_amount,
    is_new_location
)


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5500",
        "http://127.0.0.1:5500"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()



class Details(BaseModel):
    user_id: int = Field(gt=0)
    amount: float = Field(gt=0)
    payment_method: Literal["CARD", "UPI"]
    location: str = Field(min_length=1)


@app.get("/home")
def home():
    return {
        "message": "You are at home page"
    }


@app.post("/transaction")
def transaction(details: Details):

    # Total previous transactions
    previous_transactions = get_user_transaction_count(
        details.user_id
    )

    # Recent transactions
    recent_transactions = get_recent_transaction_count(
        details.user_id
    )

    # User's average transaction amount
    average_amount = get_user_average_amount(
        details.user_id
    )

    # Check whether this is a new location
    new_location = is_new_location(
        details.user_id,
        details.location
    )

    # Calculate risk
    risk_points, risk_level, risk_reasons, decision = risk_calc(
        details.amount,
        details.payment_method,
        details.location,
        previous_transactions,
        recent_transactions,
        average_amount,
        new_location
    )

    # Save transaction
    transaction_id = save_transaction(
        details.user_id,
        details.amount,
        details.payment_method,
        details.location,
        risk_points,
        risk_level,
        risk_reasons,
        decision
    )

    return {
        "transaction_id": transaction_id,
        "user_id": details.user_id,
        "amount": details.amount,
        "payment_method": details.payment_method,
        "location": details.location,
        "previous_transactions": previous_transactions,
        "recent_transactions": recent_transactions,
        "average_transaction_amount": average_amount,
        "new_location": new_location,
        "risk_points": risk_points,
        "risk_level": risk_level,
        "risk_reasons": risk_reasons,
        "decision": decision
    }


@app.get("/transactions")
def transactions():
    return get_transaction()


@app.get("/transactions/{user_id}")
def user_transactions(user_id: int):

    transactions = get_user_transactions(user_id)

    return {
        "user_id": user_id,
        "transactions": transactions
    }


@app.get("/transaction/{transaction_id}")
def transaction_by_id(transaction_id: int):

    transaction = get_transaction_by_id(transaction_id)

    if transaction is None:
        raise HTTPException(
            status_code=404,
            detail="Transaction not found"
        )

    return transaction


@app.get("/statistics")
def statistics():
    return get_statistics()