
export function saveToLocalStorage(field_name, field_value) {
    let impDataHistoryStore = JSON.parse(localStorage.getItem('impDataHistoryStore')) || []

    let indexInStore = impDataHistoryStore.findIndex(p => p.field_name === field_name)

    if ( indexInStore !== -1 ) {
        impDataHistoryStore.splice(indexInStore, 1)
    }

    let historyLength = impDataHistoryStore.unshift(
        {"field_name": field_name, "field_value": field_value}
    )

    if (historyLength > 50) {
        impDataHistoryStore.pop()
    }

    localStorage.setItem('impDataHistoryStore', JSON.stringify(impDataHistoryStore));

}
