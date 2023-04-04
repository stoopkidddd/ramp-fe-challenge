import { useCallback } from "react"
import { useCustomFetch } from "src/hooks/useCustomFetch"
import { SetTransactionApprovalParams } from "src/utils/types"
import { TransactionPane } from "./TransactionPane"
import { SetTransactionApprovalFunction, TransactionsComponent } from "./types"
import { usePaginatedTransactions } from "../../hooks/usePaginatedTransactions"
import { useTransactionsByEmployee } from "../../hooks/useTransactionsByEmployee"

export const Transactions: TransactionsComponent = ({ transactions }) => {
  const { fetchWithoutCache, loading, clearCacheByEndpoint } = useCustomFetch()
  const { invalidateData: invalidatePaginatedTransactions } = usePaginatedTransactions()
  const { invalidateData: invalidateEmployeeTransactions } = useTransactionsByEmployee()

  const setTransactionApproval = useCallback<SetTransactionApprovalFunction>(
    async ({ transactionId, newValue }) => {
      await fetchWithoutCache<void, SetTransactionApprovalParams>("setTransactionApproval", {
        transactionId,
        value: newValue,
      })

      // Bug #7 - this is a suboptimal fix because we are forcing an extra API call to refetch the data from the API
      // because we busted the cache.
      
      // What I would really want to do here is to create an optimisticUpdate hook into the mutation so that upon a succesful
      // mutation post, we could directly manipulate the cache to match what the server now has saved.
      
      // In a real world example, I would be using react-query which has this functionality built in.
      // I started to implement this into the customFetch, but it becomes problematic because of the way the cache is currently
      // being saved. Since the cache is saving paginated responses, we would need to make assumptions about the response structure
      // and be forced to iterate to find existing ID's. This is possible, but felt it was out of scope for the exercise, 
      // especially since using a very common library like react-query would have all of this functionality baked in out of the box
      
      // Side note - the fetchWithoutCache/setTransactionApproval should be returning some sort of a result to indicate success vs failure.
      invalidateEmployeeTransactions()
      invalidatePaginatedTransactions()

      clearCacheByEndpoint(["paginatedTransactions", "transactionsByEmployee"])
    },
    [
      fetchWithoutCache,
      invalidateEmployeeTransactions,
      invalidatePaginatedTransactions,
      clearCacheByEndpoint,
    ]
  )

  if (transactions === null) {
    return <div className="RampLoading--container">Loading...</div>
  }

  return (
    <div data-testid="transaction-container">
      {transactions.map((transaction) => (
        <TransactionPane
          key={transaction.id}
          transaction={transaction}
          loading={loading}
          setTransactionApproval={setTransactionApproval}
        />
      ))}
    </div>
  )
}
