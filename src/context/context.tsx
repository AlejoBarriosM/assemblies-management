"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"

// Define the user data structure
interface User {
    name: string
    email: string
    profilePicture?: string
    role: "user" | "admin" | "guest"
}

interface Company {
    id: string
    nit: number
    dv: number
    commercialName: string
    legalName: string
    location_id: string
    contactPhone: string
    website: string
    logo?: string
    email?: string
}

// Define the context type
interface UserContextType {
    user: User | null
    company: Company | null
    loading: boolean
    error: string | null
    refreshUserData: () => Promise<void>
    updateUserName: (newName: string) => Promise<void>
}

// Create the context with a default value
const Context = createContext<UserContextType>({
    user: null,
    company: null,
    loading: false,
    error: null,
    refreshUserData: async () => {},
    updateUserName: async () => {},
})

// Custom hook to use the user context
export const useUser = () => useContext(Context)
// Custom hook to use the company context
export const useCompany = () => useContext(Context)
// Custom hook to use the loading context
export const useLoading = () => useContext(Context)

// Provider component
export function ContextProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [company, setCompany] = useState<Company | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const showLoading = useCallback(() => setIsLoading(true), []);
    const hideLoading = useCallback(() => setIsLoading(false), []);

    // Function to fetch user data from API
    const fetchUserData = async () => {
        setLoading(true)
        setError(null)

        try {
            // In a real app, this would be a fetch call to your API
            // const response = await fetch('/api/user')
            // const userData = await response.json()

            // Simulating API response for demonstration
            const userData: User = {
                name: "Jane Doe",
                email: "jane@example.com",
                profilePicture: "/placeholder.svg?height=40&width=40",
                role: "user",
            }

            setUser(userData)
        } catch (err) {
            console.error("Failed to fetch user data:", err)
            setError("Failed to load user data. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    // Function to fetch company data from API
    const fetchCompanyData = async () => {
        setLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/company')
            const companyData = await response.json()
            setCompany(companyData[0])
        } catch (err) {
            console.error("Failed to fetch company data:", err)
            setError("Failed to load company data. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    // Function to refresh user data
    const refreshUserData = async () => {
        await fetchUserData()
    }

    // Function to update user name (example of updating user data)
    const updateUserName = async (newName: string) => {
        setLoading(true)

        try {
            // In a real app, this would be a fetch call to update the name
            // await fetch('/api/user/update', {
            //   method: 'POST',
            //   body: JSON.stringify({ name: newName }),
            //   headers: { 'Content-Type': 'application/json' }
            // })

            // Simulate API call success
            setUser((prev) => (prev ? { ...prev, name: newName } : null))
        } catch (err) {
            console.error("Failed to update user name:", err)
            setError("Failed to update user name. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    // Fetch user data on initial load
    useEffect(() => {
        fetchUserData()
        fetchCompanyData()
    }, [])

    // Value to be provided by the context
    const value = {
        user,
        company,
        loading,
        error,
        refreshUserData,
        updateUserName,
        isLoading,
        showLoading,
        hideLoading,
    }

    return <Context.Provider value={value}>{children}</Context.Provider>
}

