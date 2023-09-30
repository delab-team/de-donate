import { Navigate, Outlet } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth'

import { ROUTES } from './router'

export const PrivateRoute = (): JSX.Element => {
    const auth = useAuth()
    return auth ? <Outlet /> : <Navigate to={ROUTES.HOME} />
}
