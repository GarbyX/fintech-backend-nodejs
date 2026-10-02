// handles ACID money transfers:

const prisma = require('../db');

exports.getAccounts = async (req, res) => {
    const accounts = await prisma.account.findMany({ where: { userId: req.user.userId } });
    res.json(accounts);
};

exports.deposit = async (req, res) => {
    const { accountId, amount } = req.body;
    if (amount <= 0) return res.status(400).json({ message: 'Amount must be greater than 0' });

    try {
        const updated = await prisma.$transaction(async (tx) => {
            const account = await tx.account.update({
                where: { id: accountId },
                data: { balance: { increment: amount } }
            });
            await tx.transaction.create({
                data: { amount, type: 'DEPOSIT', receiverId: accountId }
            });
            return account;
        });

        res.json({ message: 'Deposit successful', balance: updated.balance });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.transfer = async (req, res) => {
    const { senderAccountId, receiverAccountNum, amount } = req.body;
    if (amount <= 0) return res.status(400).json({ message: 'Invalid transfer amount' });

    try {
        // Execute atomic PostgreSQL transaction to prevent double spending
        await prisma.$transaction(async (tx) => {
            const sender = await tx.account.findUnique({ where: { id: senderAccountId } });
            if (!sender || sender.balance < amount) {
                throw new Error('Insufficient funds or account invalid');
            }

            const receiver = await tx.account.findUnique({ where: { accountNum: receiverAccountNum } });
            if (!receiver) throw new Error('Receiver account not found');

            await tx.account.update({
                where: { id: sender.id },
                data: { balance: { decrement: amount } }
            });

            await tx.account.update({
                where: { id: receiver.id },
                data: { balance: { increment: amount } }
            });

            await tx.transaction.create({
                data: {
                    amount,
                    type: 'TRANSFER',
                    senderId: sender.id,
                    receiverId: receiver.id
                }
            });
        });

        res.json({ message: 'Transfer completed successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};