/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable import/no-default-export */
import { useState, useEffect } from 'react'

function useDebounce (value: any, delay: number) {
    const [ debouncedValue, setDebouncedValue ] = useState(value)

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        return () => {
            clearTimeout(timer)
        }
    }, [ value, delay ])

    return debouncedValue
}

export default useDebounce
