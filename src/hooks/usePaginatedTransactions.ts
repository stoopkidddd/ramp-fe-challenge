import { useCallback, useState } from "react"
import { PaginatedRequestParams, PaginatedResponse, Transaction } from "../utils/types"
import { PaginatedTransactionsResult } from "./types"
import { useCustomFetch } from "./useCustomFetch"

export function usePaginatedTransactions(): PaginatedTransactionsResult {
  const { fetchWithCache, loading } = useCustomFetch()
  const [paginatedTransactions, setPaginatedTransactions] = useState<PaginatedResponse<
    Transaction[]
  > | null>(null)

  const fetchAll = useCallback(async () => {
    if (paginatedTransactions && !paginatedTransactions.nextPage) {
      return
    }

    const response = await fetchWithCache<PaginatedResponse<Transaction[]>, PaginatedRequestParams>(
      "paginatedTransactions",
      {
        page: paginatedTransactions === null ? 0 : paginatedTransactions.nextPage,
      }
    )

    setPaginatedTransactions((previousResponse) => {
      if (response === null || previousResponse === null) {
        return response
      }

      // Bug #4 - it is debatable whether this is the best solution. This would need further architectural discusion
      // about how our cached API responses should be handled. Do we want the cached response to include all previously loaded transactions?
      // Or do we rely on this call to only return a specific subset of transactions for one specific page, and nothing more.
      // It does not seem to have adverse affects for the situation provided here, but handling aggregated state in the App.tsx or in Transactions.tsx
      // could be deemed more appropriate
      const aggregatedData = [...previousResponse.data, ...response.data]

      return { data: aggregatedData, nextPage: response.nextPage }
    })
  }, [fetchWithCache, paginatedTransactions])

  const invalidateData = useCallback(() => {
    setPaginatedTransactions(null)
  }, [])

  return { data: paginatedTransactions, loading, fetchAll, invalidateData }
}
