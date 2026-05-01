import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useDataStore = create(
  persist(
    (set, get) => ({
      // Full database state
      allWorkers: [],
      allTransactions: [],
      allSettlements: [],
      allInventory: [],
      allInventoryLogs: [],
      allLots: [],
      
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
      },

      // Inventory Actions
      addInventoryItem: (item) => {
        const newItem = {
          id: `inv_${Date.now()}`,
          ...item,
          quantity: Number(item.quantity) || 0,
          minThreshold: Number(item.minThreshold) || 5,
          lastRestocked: new Date().toISOString()
        };
        set(state => ({ allInventory: [...state.allInventory, newItem] }));
      },

      updateInventoryStock: (itemId, delta, reason = 'Adjustment') => {
        set(state => {
          const updatedAll = state.allInventory.map(item => {
            if (item.id === itemId) {
              const newQty = Math.max(0, item.quantity + delta);
              return { ...item, quantity: newQty, lastRestocked: delta > 0 ? new Date().toISOString() : item.lastRestocked };
            }
            return item;
          });

          const newLog = {
            id: `log_${Date.now()}`,
            itemId,
            delta,
            reason,
            date: new Date().toISOString()
          };

          return { 
            allInventory: updatedAll,
            allInventoryLogs: [newLog, ...state.allInventoryLogs]
          };
        });
      },

      deleteInventoryItem: (itemId) => {
        set(state => ({
          allInventory: state.allInventory.filter(i => i.id !== itemId),
          allInventoryLogs: state.allInventoryLogs.filter(l => l.itemId !== itemId)
        }));
      },

      // Lot Production Actions
      addLot: (lotData) => {
        const newLot = {
          id: `lot_${Date.now()}`,
          status: 'In Production',
          createdAt: new Date().toISOString(),
          itemImage: lotData.itemImage || null,
          sampleImage: lotData.sampleImage || null,
          sizes: lotData.sizes || {}, // { M: 10, L: 20 }
          processes: [
            { id: 'screening', name: 'Screening', isDone: false, billNumber: '', notes: '', pieces: 0 },
            { id: 'embroidery', name: 'Embroidery', isDone: false, billNumber: '', notes: '', pieces: 0 },
            { id: 'cutting', name: 'Cutting', isDone: false, pieces: 0 },
            { id: 'stitching', name: 'Stitching', isDone: false, pieces: 0 },
            { id: 'interlock', name: 'Interlock', isDone: false, pieces: 0 },
            { id: 'diamond', name: 'Diamond', isDone: false, pieces: 0, pricePerPc: 0 },
            { id: 'button', name: 'Button', isDone: false, numButtons: 0, pieces: 0, pricePerPc: 0 },
            { id: 'steampress', name: 'Steam Press', isDone: false, pieces: 0 },
          ],
          ...lotData
        };
        set(state => ({ allLots: [newLot, ...state.allLots] }));
      },

      updateLotProcess: (lotId, processId, updates) => {
        set(state => ({
          allLots: state.allLots.map(lot => {
            if (lot.id === lotId) {
              return {
                ...lot,
                processes: lot.processes.map(p => p.id === processId ? { ...p, ...updates } : p)
              };
            }
            return lot;
          })
        }));
      },

      deleteLot: (lotId) => {
        set(state => ({ allLots: state.allLots.filter(l => l.id !== lotId) }));
      }
    }),
    {
      name: 'amrut-fashion-data',
      // Only persist the 'all' arrays
      partialize: (state) => ({ 
        allWorkers: state.allWorkers, 
        allTransactions: state.allTransactions, 
        allSettlements: state.allSettlements,
        allInventory: state.allInventory,
        allInventoryLogs: state.allInventoryLogs,
        allLots: state.allLots
      }),
    }
  )
);
