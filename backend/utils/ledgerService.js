import Ledger from '../models/Ledger.js';
import Customer from '../models/Customer.js';
import Supplier from '../models/Supplier.js';

/**
 * Reusable helper — call this whenever a financial transaction happens.
 *
 * Usage examples:
 *   On sale creation    → createLedgerEntry({ partyType:'customer', transactionType:'sale',    credit: totalAmount, ... })
 *   On purchase         → createLedgerEntry({ partyType:'supplier', transactionType:'purchase', credit: totalAmount, ... })
 *   Customer pays cash  → createLedgerEntry({ partyType:'customer', transactionType:'payment_in',  debit: amount, ... })
 *   We pay supplier     → createLedgerEntry({ partyType:'supplier', transactionType:'payment_out', debit: amount, ... })
 *
 * Balance convention (same for both customer and supplier):
 *   credit → increases balance  (they owe us more / we owe them more)
 *   debit  → decreases balance  (they paid us   / we paid them)
 *   positive balance = they owe us   (receivable from customer, we already paid supplier)
 *   negative balance = we owe them   (customer overpaid, supplier awaiting our payment)
 *
 * @param {Object} opts
 * @param {ObjectId} opts.storeId
 * @param {string}   opts.partyType       - 'customer' | 'supplier'
 * @param {ObjectId} opts.partyId
 * @param {string}   opts.transactionType - 'sale'|'purchase'|'payment_in'|'payment_out'|'return'
 * @param {ObjectId} [opts.referenceId]   - Sale or Purchase _id
 * @param {number}   [opts.debit]
 * @param {number}   [opts.credit]
 * @param {string}   [opts.paymentMode]
 * @param {string}   [opts.note]
 * @param {ObjectId} opts.createdBy
 * @returns {Promise<Object>} the saved ledger entry
 */
export const createLedgerEntry = async ({
  storeId,
  partyType,
  partyId,
  transactionType,
  referenceId = null,
  debit = 0,
  credit = 0,
  paymentMode = null,
  note = '',
  createdBy
}) => {
  // 1. Fetch the last ledger entry for this party to get the running balance
  const lastEntry = await Ledger.findOne({ store: storeId, partyId })
    .sort({ createdAt: -1 })
    .select('balanceAfter');

  const lastBalance = lastEntry ? lastEntry.balanceAfter : 0;

  // 2. Calculate new balance
  const balanceAfter = lastBalance + credit - debit;

  // 3. Create the ledger entry with stored balance
  const entry = new Ledger({
    store: storeId,
    partyType,
    partyId,
    transactionType,
    referenceId,
    debit,
    credit,
    balanceAfter,
    paymentMode,
    note,
    createdBy
  });

  await entry.save();

  // 4. Sync currentBalance on the party document
  const PartyModel = partyType === 'customer' ? Customer : Supplier;
  await PartyModel.findByIdAndUpdate(partyId, { currentBalance: balanceAfter });

  return entry;
};