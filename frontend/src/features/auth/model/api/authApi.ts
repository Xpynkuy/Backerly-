import {baseApi} from '../../../../shared/api/baseApi';
import type {
  AuthResponse,
  LoginRequest, RegisterRequest, RegisterResponse
} from "@features/auth/model/type/authType.ts";
import {logout, setCredentials} from "@features/auth/model/slice/authSlice.ts";


export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 🔑 Логин пользователя
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),

      async onQueryStarted(_, {dispatch, queryFulfilled}) {
        try {
          const {data} = await queryFulfilled;
          dispatch(setCredentials(data));
        } catch (error) {

        }
      },
    }),

    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled; // ← КЛЮЧЕВОЙ МОМЕНТ
          dispatch(logout());
        } catch (error) {
          // Даже если logout "упал" (например, 401 — уже вышел),
          // всё равно очищаем клиентское состояние
          dispatch(logout());
        }
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
} = authApi;