// handles ACID money transfers:

const prisma = require('../db');

exports.getAccounts = async (req, res) => {
    try {
        const accounts = await prisma.account.findMany({ where: { userId: req.user.userId } });
        res.json(accounts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deposit = async (req, res) => {
    const { accountId, amount } = req.body;
    if (!amount || amount <= 0) {
        return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    try {
        const updatedAccount = await prisma.$transaction(async (tx) => {
            // Increment balance atomically
            const account = await tx.account.update({
                where: { id: accountId },
                data: { balance: { increment: amount } }
            });

            // Record deposit transaction
            await tx.transaction.create({
                data: {
                    amount,
                    type: 'DEPOSIT',
                    receiverId: accountId
                }
            });

            return account;
        });

        res.json({ message: 'Deposit successful', balance: updatedAccount.balance });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.transfer = async (req, res) => {
    const { senderAccountId, receiverAccountNum, amount } = req.body;
    if (!amount || amount <= 0) {
        return res.status(400).json({ message: 'Invalid transfer amount' });
    }

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Verify receiver exists prior to debiting
            const receiver = await tx.account.findUnique({
                where: { accountNum: receiverAccountNum }
            });
            if (!receiver) {
                throw new Error('Receiver account not found');
            }

            if (receiver.id === senderAccountId) {
                throw new Error('Cannot transfer funds to the same account');
            }

            // 2. Perform Atomic Conditional Update on sender
            // The update succeeds ONLY if balance >= amount AT THE MOMENT OF EXECUTION
            const senderUpdate = await tx.account.updateMany({
                where: {
                    id: senderAccountId,
                    userId: req.user.userId, // Ensures account belongs to authenticated user
                    balance: { gte: amount } // Prevents double-spending & negative balances under race conditions
                },
                data: {
                    balance: { decrement: amount }
                }
            });

            if (senderUpdate.count === 0) {
                throw new Error('Insufficient funds, account invalid, or unauthorized');
            }

            // 3. Credit receiver account
            await tx.account.update({
                where: { id: receiver.id },
                data: {
                    balance: { increment: amount }
                }
            });

            // 4. Log ledger transaction record
            await tx.transaction.create({
                data: {
                    amount,
                    type: 'TRANSFER',
                    senderId: senderAccountId,
                    receiverId: receiver.id
                }
            });
        });

        res.json({ message: 'Transfer completed successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

/* Because findUnique does a standard SELECT without a row-level lock, 
 two concurrent requests sent at the exact same millisecond could both execute findUnique, 
 read the old balance ($100), pass the sender.balance < amount check, and both proceed to deduct $100. 
Even inside a transaction, default isolation levels (Read Committed) do not lock the row during a read.
*/

/* The FIX:
Option 1: Atomic Database Updates with Constraints (Simplest & Best)
Instead of checking sender.balance < amount in JS, execute the update directly and check if a record was modified, or add a PostgreSQL CHECK constraint (balance >= 0).

JavaScript
// Execute decrement directly; if balance is insufficient, no rows update
const updatedSender = await tx.account.updateMany({
  where: {
    id: senderAccountId,
    balance: { gte: amount } // Ensures balance is sufficient AT THE MOMENT OF UPDATE
  },
  data: { balance: { decrement: amount } }
});

if (updatedSender.count === 0) {
  throw new Error('Insufficient funds or account invalid');
}
Option 2: Pessimistic Row Locking (FOR UPDATE)
Lock the sender's account row so parallel transactions are forced to wait:


// Raw query to acquire SELECT ... FOR UPDATE lock in Prisma
const [sender] = await tx.$queryRaw`
  SELECT * FROM "Account" WHERE id = ${senderAccountId} FOR UPDATE
`;

*/


/*
High-Precision Ledger & ACID Transactions
Floating-point arithmetic in software leads to compounding rounding errors—an absolute dealbreaker for financial systems.

- Fixed-Point Precision: Configured Prisma ORM with Decimal(18,4) field types to ensure exact balance management down to fractional currency units.
- Atomic Transfers: All multi-step fund transfers are wrapped inside strict PostgreSQL ACID transactions (prisma.$transaction) 
using atomic conditional updates (balance >= amount). This guarantees that either both the debit and credit legs complete 
successfully or roll back instantly—preventing balance oversights, race conditions, and orphan transactions.

*/