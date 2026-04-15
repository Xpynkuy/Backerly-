import { baseApi } from "@shared/api/baseApi";

export interface WithdrawalItem {
  id: string;
  grossCents: number;
  commissionCents: number;
  amountCents: number;
  status: string;
  createdAt: string;
}

export interface PayoutInfo {
  lifetimeGrossCents: number;
  lifetimeNetCents: number;
  totalWithdrawnCents: number;
  availableBalanceCents: number;
  currentMonthGrossCents: number;
  commissionRate: number;
  minWithdrawalCents: number;
  incomePerMonth: { month: string; cents: number }[];
  subscribersPerMonth: { month: string; count: number }[];
  history: WithdrawalItem[];
}

export const payoutsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPayoutInfo: builder.query<PayoutInfo, void>({
      query: () => ({ url: "/payouts/me", method: "GET" }),
      providesTags: ["Payouts" as any],
    }),
    requestWithdrawal: builder.mutation<WithdrawalItem, { amountCents: number }>({
      query: ({ amountCents }) => ({
        url: "/payouts/withdraw",
        method: "POST",
        body: { amountCents },
      }),
      invalidatesTags: ["Payouts" as any],
    }),
  }),
  overrideExisting: false,
});

export const { useGetPayoutInfoQuery, useRequestWithdrawalMutation } =
  payoutsApi;