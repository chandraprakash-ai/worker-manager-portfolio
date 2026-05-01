import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useDataStore = create(
  persist(
    (set, get) => ({
      // Full database state
      allWorkers: [],
      allTransactions: [],
      allSettlements: [],
      
      // Current view state (to maintain compatibility with App.jsx)
      workers: [],
      transactions: [],
      isLoading: false,
      error: null,

      setError: (error) => set({ error }),

      fetchWorkers: async () => {
        set({ workers: get().allWorkers });
      },

      getSettlements: (workerId) => {
        return get().allSettlements.filter(s => s.workerId === workerId).sort((a, b) => new Date(b.date) - new Date(a.date));
      },

      getSettlementTransactions: (settlementId) => {
        return get().allTransactions.filter(tx => tx.settlementId === settlementId);
      },

      addWorker: async (workerData) => {
        set({ isLoading: true });
        const newWorker = {
          id: `worker_${Date.now()}`,
          ...workerData,
          createdAt: new Date().toISOString(),
        };
        
        set(state => {
          const updatedWorkers = [...state.allWorkers, newWorker];
          return { 
            allWorkers: updatedWorkers,
            workers: updatedWorkers, // Sync view state
            isLoading: false 
          };
        });
        return newWorker.id;
      },

      fetchTransactions: async (workerId, settlementId = null) => {
        let filtered = get().allTransactions.filter(tx => tx.workerId === workerId);
        if (settlementId) {
          filtered = filtered.filter(tx => tx.settlementId === settlementId);
        }
        set({ transactions: filtered });
      },

      addTransaction: async (txData) => {
        set({ isLoading: true });
        const newTx = {
          id: `tx_${Date.now()}`,
          ...txData,
          status: 'active',
          settlementId: null,
          createdAt: new Date().toISOString(),
        };

        set(state => {
          const updatedTxs = [newTx, ...state.allTransactions];
          // Only update view state if it matches current worker
          const currentFiltered = updatedTxs.filter(tx => tx.workerId === txData.workerId);
          return { 
            allTransactions: updatedTxs,
            transactions: currentFiltered, 
            isLoading: false 
          };
        });
        return newTx.id;
      },

      addBulkTransactions: async (txs) => {
        set({ isLoading: true });
        const newTxs = txs.map(tx => ({
          id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...tx,
          status: 'active',
          settlementId: null,
          createdAt: new Date().toISOString(),
        }));

        set(state => {
          const updatedAll = [...newTxs, ...state.allTransactions];
          const currentWorkerId = txs[0]?.workerId;
          return { 
            allTransactions: updatedAll,
            transactions: updatedAll.filter(tx => tx.workerId === currentWorkerId),
            isLoading: false 
          };
        });
      },

      settleWorker: async (workerId, amountPaid) => {
        set({ isLoading: true });
        const activeTxs = get().allTransactions.filter(tx => tx.workerId === workerId && tx.status === 'active');
        
        const earnedSnapshot = activeTxs.filter(tx => tx.type === 'work').reduce((sum, tx) => sum + (tx.amount || 0), 0);
        const advanceSnapshot = activeTxs.filter(tx => tx.type === 'advance').reduce((sum, tx) => sum + (tx.amount || 0), 0);
        
        const settlementId = `settlement_${Date.now()}`;
        const newSettlement = {
          id: settlementId,
          workerId,
          date: new Date().toISOString(),
          amountPaid,
          earnedSnapshot,
          advanceSnapshot,
          txIds: activeTxs.map(tx => tx.id),
        };

        const updatedAllTransactions = get().allTransactions.map(tx => {
          if (tx.workerId === workerId && tx.status === 'active') {
            return { ...tx, status: 'settled', settlementId };
          }
          return tx;
        });

        set(state => ({
          allSettlements: [...state.allSettlements, newSettlement],
          allTransactions: updatedAllTransactions,
          transactions: updatedAllTransactions.filter(tx => tx.workerId === workerId),
          isLoading: false
        }));
      },

      updateTransaction: async (txId, updatedData) => {
        set({ isLoading: true });
        set(state => {
          const updatedAll = state.allTransactions.map(tx => 
            tx.id === txId ? { 
              ...tx, 
              ...updatedData, 
              amount: updatedData.type === 'work' 
                ? (parseFloat(updatedData.pieces) * parseFloat(updatedData.rate)) 
                : parseFloat(updatedData.amount) 
            } : tx
          );
          const currentWorkerId = state.allTransactions.find(tx => tx.id === txId)?.workerId;
          return {
            allTransactions: updatedAll,
            transactions: updatedAll.filter(tx => tx.workerId === currentWorkerId),
            isLoading: false
          };
        });
      },

      deleteTransaction: async (txId) => {
        set({ isLoading: true });
        set(state => {
          const workerId = state.allTransactions.find(tx => tx.id === txId)?.workerId;
          const updatedAll = state.allTransactions.filter(tx => tx.id !== txId);
          return {
            allTransactions: updatedAll,
            transactions: updatedAll.filter(tx => tx.workerId === workerId),
            isLoading: false
          };
        });
      }
    }),
    {
      name: 'amrut-fashion-data',
      // Only persist the 'all' arrays
      partialize: (state) => ({ 
        allWorkers: state.allWorkers, 
        allTransactions: state.allTransactions, 
        allSettlements: state.allSettlements 
      }),
    }
  )
);
