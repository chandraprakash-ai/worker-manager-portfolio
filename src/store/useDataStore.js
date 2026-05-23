import { create } from 'zustand';
import * as fs from '../lib/firebaseServices';

export const useDataStore = create(
  (set, get) => ({
    // Full database state
    allWorkers: [],
    allTransactions: [],
    allSettlements: [],
    allInventory: [],
    allInventoryLogs: [],
    allLots: [],
    
    // Current view state
    workers: [],
    transactions: [],
    isLoading: false,
    error: null,

    setError: (error) => set({ error }),

    initializeData: async () => {
      set({ isLoading: true });
      try {
        const [workers, lots, inventory, inventoryLogs, transactions, settlements] = await Promise.all([
          fs.fetchWorkers(),
          fs.fetchLots(),
          fs.fetchInventory(),
          fs.fetchInventoryLogs(),
          fs.fetchTransactions(),
          fs.fetchSettlements()
        ]);
        set({ 
          allWorkers: workers, 
          workers, 
          allLots: lots, 
          allInventory: inventory, 
          allInventoryLogs: inventoryLogs,
          allTransactions: transactions,
          allSettlements: settlements,
          isLoading: false 
        });
      } catch (err) {
        set({ error: err.message, isLoading: false });
      }
    },

    fetchWorkers: async () => {
      try {
        const workers = await fs.fetchWorkers();
        set({ allWorkers: workers, workers });
      } catch (err) {
        console.error("Error fetching workers:", err);
      }
    },

    getSettlements: (workerId) => {
      return get().allSettlements.filter(s => s.workerId === workerId).sort((a, b) => new Date(b.date) - new Date(a.date));
    },

    getSettlementTransactions: (settlementId) => {
      return get().allTransactions.filter(tx => tx.settlementId === settlementId);
    },

    addWorker: async (workerData) => {
      set({ isLoading: true });
      try {
        const newWorker = await fs.addWorker(workerData);
        set(state => {
          const updated = [...state.allWorkers, newWorker];
          return { allWorkers: updated, workers: updated, isLoading: false };
        });
        return newWorker.id;
      } catch (err) {
        set({ isLoading: false });
        alert(`Failed to add worker: ${err.message}`);
      }
    },

    updateWorker: async (workerId, workerData) => {
      set({ isLoading: true });
      try {
        await fs.updateWorker(workerId, workerData);
        set(state => {
          const updated = state.allWorkers.map(w => w.id === workerId ? { ...w, ...workerData } : w);
          return { allWorkers: updated, workers: updated, isLoading: false };
        });
      } catch (err) {
        set({ isLoading: false });
        alert(`Failed to update worker: ${err.message}`);
      }
    },

    deleteWorker: async (workerId) => {
      set({ isLoading: true });
      try {
        await fs.deleteWorker(workerId);
        set(state => ({
          allWorkers: state.allWorkers.filter(w => w.id !== workerId),
          workers: state.workers.filter(w => w.id !== workerId),
          isLoading: false
        }));
      } catch (err) {
        set({ isLoading: false });
        alert(`Failed to delete worker: ${err.message}`);
      }
    },

    fetchTransactions: async (workerId, settlementId = null) => {
      set({ isLoading: true });
      try {
        const txs = await fs.fetchTransactions(workerId);
        let filtered = txs;
        if (settlementId) {
          filtered = txs.filter(tx => tx.settlementId === settlementId);
        }
        set({ transactions: filtered, allTransactions: txs, isLoading: false });
      } catch (err) {
        set({ isLoading: false });
        console.error("Error fetching transactions:", err);
      }
    },

    addTransaction: async (txData) => {
      set({ isLoading: true });
      try {
        const newTx = await fs.addTransaction(txData);
        set(state => ({
          allTransactions: [newTx, ...state.allTransactions],
          transactions: [newTx, ...state.transactions],
          isLoading: false
        }));
        return newTx.id;
      } catch (err) {
        set({ isLoading: false });
        alert(`Failed to add transaction: ${err.message}`);
      }
    },

    addBulkTransactions: async (txs) => {
      set({ isLoading: true });
      try {
        const newTxs = await fs.addTransactionsBatch(txs);
        set(state => ({
          allTransactions: [...newTxs, ...state.allTransactions],
          transactions: [...newTxs, ...state.transactions],
          isLoading: false
        }));
      } catch (err) {
        set({ isLoading: false });
        alert(`Failed to save bulk entries: ${err.message}`);
      }
    },

    updateTransaction: async (txId, updates) => {
      set({ isLoading: true });
      try {
        await fs.updateTransaction(txId, updates);
        set(state => ({
          allTransactions: state.allTransactions.map(tx => tx.id === txId ? { ...tx, ...updates } : tx),
          transactions: state.transactions.map(tx => tx.id === txId ? { ...tx, ...updates } : tx),
          isLoading: false
        }));
      } catch (err) {
        set({ isLoading: false });
        alert(`Failed to update transaction: ${err.message}`);
      }
    },

    deleteTransaction: async (txId) => {
      set({ isLoading: true });
      try {
        await fs.deleteTransaction(txId);
        set(state => ({
          allTransactions: state.allTransactions.filter(tx => tx.id !== txId),
          transactions: state.transactions.filter(tx => tx.id !== txId),
          isLoading: false
        }));
      } catch (err) {
        set({ isLoading: false });
        alert(`Failed to delete transaction: ${err.message}`);
      }
    },

    settleWorker: async (workerId, amountPaid, activeTransactions) => {
      set({ isLoading: true });
      try {
        const settlement = await fs.createSettlement(workerId, amountPaid, activeTransactions);
        set(state => ({
          allSettlements: [settlement, ...state.allSettlements],
          allTransactions: state.allTransactions.map(tx => 
            activeTransactions.some(at => at.id === tx.id) 
            ? { ...tx, status: 'settled', settlementId: settlement.id } 
            : tx
          ),
          isLoading: false
        }));
      } catch (err) {
        set({ isLoading: false });
        alert(`Failed to settle worker: ${err.message}`);
      }
    },

    addInventoryItem: async (itemData) => {
      set({ isLoading: true });
      try {
        const newItem = await fs.addInventoryItem(itemData);
        set(state => ({
          allInventory: [newItem, ...state.allInventory],
          isLoading: false
        }));
      } catch (err) {
        set({ isLoading: false });
        alert(`Failed to add inventory item: ${err.message}`);
      }
    },

    updateInventoryStock: async (itemId, delta, reason) => {
      set({ isLoading: true });
      try {
        const item = get().allInventory.find(i => i.id === itemId);
        await fs.updateInventoryStock(itemId, delta, reason, item.quantity);
        // Refresh full state to get logs
        await get().initializeData();
      } catch (err) {
        set({ isLoading: false });
        alert(`Failed to update inventory stock: ${err.message}`);
      }
    },

    deleteInventoryItem: async (itemId) => {
      set({ isLoading: true });
      try {
        await fs.deleteInventoryItem(itemId);
        set(state => ({
          allInventory: state.allInventory.filter(i => i.id !== itemId),
          isLoading: false
        }));
      } catch (err) {
        set({ isLoading: false });
        alert(`Failed to delete inventory item: ${err.message}`);
      }
    },

    addLot: async (lotData) => {
      set({ isLoading: true });
      try {
        const newLot = await fs.addLot(lotData);
        set(state => ({
          allLots: [newLot, ...state.allLots],
          isLoading: false
        }));
      } catch (err) {
        set({ isLoading: false });
        alert(`Failed to add lot: ${err.message}`);
      }
    },

    updateLot: async (lotId, updates) => {
      set({ isLoading: true });
      try {
        await fs.updateLot(lotId, updates);
        set(state => ({
          allLots: state.allLots.map(l => l.id === lotId ? { ...l, ...updates } : l),
          isLoading: false
        }));
      } catch (err) {
        set({ isLoading: false });
        alert(`Failed to update lot: ${err.message}`);
      }
    },

    updateLotProcess: async (lotId, processId, updates) => {
      set({ isLoading: true });
      try {
        const lot = get().allLots.find(l => l.id === lotId);
        
        // Hydrate processes if they don't exist yet
        let currentProcesses = lot.processes;
        if (!currentProcesses || currentProcesses.length === 0) {
          const STAGE_NAMES = {
            screening: 'Screening', embroidery: 'Embroidery', cutting: 'Cutting',
            stitching: 'Stitching', interlock: 'Interlock', diamond: 'Diamond',
            button: 'Button', steampress: 'Steam Press', finishing: 'Finishing'
          };
          currentProcesses = (lot.stages || []).map(id => ({
            id,
            name: STAGE_NAMES[id] || id.charAt(0).toUpperCase() + id.slice(1),
            pieces: 0,
            isDone: false
          }));
        }

        const updatedProcesses = currentProcesses.map(p => 
          p.id === processId ? { ...p, ...updates } : p
        );

        await fs.updateLot(lotId, { processes: updatedProcesses });
        set(state => ({
          allLots: state.allLots.map(l => l.id === lotId ? { ...l, processes: updatedProcesses } : l),
          isLoading: false
        }));
      } catch (err) {
        set({ isLoading: false });
        alert(`Failed to update workflow process: ${err.message}`);
      }
    },

    deleteLot: async (lotId) => {
      set({ isLoading: true });
      try {
        await fs.deleteLot(lotId);
        set(state => ({
          allLots: state.allLots.filter(l => l.id !== lotId),
          isLoading: false
        }));
      } catch (err) {
        set({ isLoading: false });
        alert(`Failed to delete lot: ${err.message}`);
      }
    },
  })
);
