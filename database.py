import sqlite3

DATABASE_NAME = "transactions.db"


def init_db():
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            amount REAL,
            payment_method TEXT,
            location TEXT,
            risk_points INTEGER,
            risk_level TEXT,
            risk_reasons TEXT,
            decision TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cursor.execute("PRAGMA table_info(transactions)")
    columns = [column[1] for column in cursor.fetchall()]

    if "risk_reasons" not in columns:
        cursor.execute("""
            ALTER TABLE transactions
            ADD COLUMN risk_reasons TEXT
        """)

    if "decision" not in columns:
        cursor.execute("""
            ALTER TABLE transactions
            ADD COLUMN decision TEXT
        """)

    conn.commit()
    conn.close()


def save_transaction(
    user_id,
    amount,
    payment_method,
    location,
    risk_points,
    risk_level,
    risk_reasons,
    decision
):
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO transactions
        (
            user_id,
            amount,
            payment_method,
            location,
            risk_points,
            risk_level,
            risk_reasons,
            decision
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        user_id,
        amount,
        payment_method,
        location,
        risk_points,
        risk_level,
        ", ".join(risk_reasons),
        decision
    ))

    conn.commit()

    transaction_id = cursor.lastrowid

    conn.close()

    return transaction_id


def get_transaction():
    conn = sqlite3.connect(DATABASE_NAME)
    conn.row_factory = sqlite3.Row

    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM transactions
        ORDER BY id DESC
    """)

    transactions = cursor.fetchall()

    conn.close()

    return [dict(transaction) for transaction in transactions]


def get_user_transaction_count(user_id):
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()

    cursor.execute("""
        SELECT COUNT(*)
        FROM transactions
        WHERE user_id = ?
    """, (user_id,))

    count = cursor.fetchone()[0]

    conn.close()

    return count


def get_recent_transaction_count(user_id):
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()

    cursor.execute("""
        SELECT COUNT(*)
        FROM transactions
        WHERE user_id = ?
        AND created_at >= datetime('now', '-10 minutes')
    """, (user_id,))

    count = cursor.fetchone()[0]

    conn.close()

    return count


def get_user_transactions(user_id):
    conn = sqlite3.connect(DATABASE_NAME)
    conn.row_factory = sqlite3.Row

    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM transactions
        WHERE user_id = ?
        ORDER BY id DESC
    """, (user_id,))

    transactions = cursor.fetchall()

    conn.close()

    return [dict(transaction) for transaction in transactions]


def get_statistics():
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()

    cursor.execute("""
        SELECT COUNT(*)
        FROM transactions
    """)
    total_transactions = cursor.fetchone()[0]

    cursor.execute("""
        SELECT COALESCE(SUM(amount), 0)
        FROM transactions
    """)
    total_amount = cursor.fetchone()[0]

    cursor.execute("""
        SELECT COUNT(*)
        FROM transactions
        WHERE risk_level = 'LOW'
    """)
    low_risk = cursor.fetchone()[0]

    cursor.execute("""
        SELECT COUNT(*)
        FROM transactions
        WHERE risk_level = 'MEDIUM'
    """)
    medium_risk = cursor.fetchone()[0]

    cursor.execute("""
        SELECT COUNT(*)
        FROM transactions
        WHERE risk_level = 'HIGH'
    """)
    high_risk = cursor.fetchone()[0]

    cursor.execute("""
        SELECT COUNT(*)
        FROM transactions
        WHERE decision = 'APPROVE'
    """)
    approved = cursor.fetchone()[0]

    cursor.execute("""
        SELECT COUNT(*)
        FROM transactions
        WHERE decision = 'REVIEW'
    """)
    review = cursor.fetchone()[0]

    cursor.execute("""
        SELECT COUNT(*)
        FROM transactions
        WHERE decision = 'BLOCK'
    """)
    blocked = cursor.fetchone()[0]

    conn.close()

    return {
        "total_transactions": total_transactions,
        "total_amount": total_amount,
        "low_risk": low_risk,
        "medium_risk": medium_risk,
        "high_risk": high_risk,
        "approved": approved,
        "review": review,
        "blocked": blocked
    }


def get_transaction_by_id(transaction_id):
    conn = sqlite3.connect(DATABASE_NAME)
    conn.row_factory = sqlite3.Row

    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM transactions
        WHERE id = ?
    """, (transaction_id,))

    transaction = cursor.fetchone()

    conn.close()

    if transaction is None:
        return None

    return dict(transaction)


# NEW FUNCTION
def get_user_average_amount(user_id):
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()

    cursor.execute("""
        SELECT AVG(amount)
        FROM transactions
        WHERE user_id = ?
    """, (user_id,))

    average = cursor.fetchone()[0]

    conn.close()

    if average is None:
        return 0

    return average


# NEW FUNCTION
def is_new_location(user_id, location):
    conn = sqlite3.connect(DATABASE_NAME)
    cursor = conn.cursor()

    cursor.execute("""
        SELECT COUNT(*)
        FROM transactions
        WHERE user_id = ?
        AND LOWER(location) = LOWER(?)
    """, (user_id, location))

    count = cursor.fetchone()[0]

    conn.close()

    return count == 0