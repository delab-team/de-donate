export const smlAddr = (address: string | undefined): string => {
    if (!address) {
        return ''
    }
    return `${address.slice(0, 3)}-${address.slice(address.length - 5, address.length)}`
}
