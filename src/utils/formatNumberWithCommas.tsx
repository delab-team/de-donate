export const formatNumberWithCommas = (number: number): string => {
    if (typeof number !== 'number') {
        throw new Error('Error: Invalid number')
    }

    const formattedNumber = number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')

    return formattedNumber
}
