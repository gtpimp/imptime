import {
    ENTITY_KEY__DECISION_JOURNAL,
    medium_col_width
} from './ItemListKeyRegistry'
import {
    invalidateAllItems,
    invalidateItems,
    fetchItemsIfNeeded,
    ensureItemsLoaded,
    getItem,
    getItems,
    getItemsById,
    getItemByRef,
    updateItem,
    startCandidateItem,
    saveCandidateItem,
    updateCandidateDetails,
    cancelCandidateItem,
    getCandidateItem,
    deleteItems,
    is_item_invalidated,
    getInvalidatedItemIds,
    getSavingItemIds,
    getLoadingItemIds,
    isLoadingItems
} from '../actions/Item'

export const SET_DECISION_JOURNAL_STORE_VALUE = 'SET_DECISION_JOURNAL_STORE_VALUE'
export const ANNOUNCE_BULK_CREATING_DECISION_JOURNALS = 'ANNOUNCE_BULK_CREATING_DECISION_JOURNALS'
export const ANNOUNCE_BULK_CREATING_DECISION_JOURNALS_FAILED = 'ANNOUNCE_BULK_CREATING_DECISION_JOURNALS_FAILED'
export const ANNOUNCE_BULK_CREATED_DECISION_JOURNALS = 'ANNOUNCE_BULK_CREATED_DECISION_JOURNALS'

export const ALL_AVAILABLE_DECISION_JOURNAL_HEADERS = [ {key:'decision_made_at', label:"Made at", description:"Decision made at", width:medium_col_width, is_default: true},
                                                        {key:'decision_made_by', label:"Made By", description:"Decision made by", width:medium_col_width, is_default: true},
                                                        {key:'decision', label:"Decision", description:"Decision", width:"auto", flex:1, is_default: true}
]

export function invalidateAllDecisionJournals() {
    return (dispatch, getState) => {
        dispatch(invalidateAllItems(ENTITY_KEY__DECISION_JOURNAL))
    }
}

export function invalidateDecisionJournals(decision_journal_ids) {
    return (dispatch, getState) => {
        dispatch(invalidateItems(ENTITY_KEY__DECISION_JOURNAL, decision_journal_ids
        ))
    }
}

export function fetchDecisionJournalsIfNeeded(list_key) {
    return (dispatch, getState) => {
        dispatch(fetchItemsIfNeeded(ENTITY_KEY__DECISION_JOURNAL, list_key))
    }
}

export function ensureDecisionJournalsLoaded(decision_journal_ids) {
    return ensureItemsLoaded(ENTITY_KEY__DECISION_JOURNAL, decision_journal_ids)
}

export function getDecisionJournalByRef(state, ref) {
    return getItemByRef(state, ENTITY_KEY__DECISION_JOURNAL, ref)
}

export function getDecisionJournal(state, decision_journal_id) {
    return getItem(state, ENTITY_KEY__DECISION_JOURNAL, decision_journal_id)
}

export function getDecisionJournals(state, decision_journal_ids) {
    return getItems(state, ENTITY_KEY__DECISION_JOURNAL, decision_journal_ids)
}

export function getDecisionJournalsById(state, decision_journal_ids) {
    return getItemsById(state, ENTITY_KEY__DECISION_JOURNAL, decision_journal_ids)
}

export function updateDecisionJournalDecision(decision_journal_id, value) {
    return updateItem(ENTITY_KEY__DECISION_JOURNAL, [decision_journal_id], "decision", value)
}

export function updateDecisionJournalContext(decision_journal_id, value) {
    return updateItem(ENTITY_KEY__DECISION_JOURNAL, [decision_journal_id], "context", value)
}

export function updateDecisionJournalReason(decision_journal_id, value) {
    return updateItem(ENTITY_KEY__DECISION_JOURNAL, [decision_journal_id], "reason", value)
}

export function updateDecisionJournalRepercussions(decision_journal_id, value) {
    return updateItem(ENTITY_KEY__DECISION_JOURNAL, [decision_journal_id], "repercussions", value)
}

export function updateDecisionJournalDecisionMadeBy(decision_journal_id, value) {
    return updateItem(ENTITY_KEY__DECISION_JOURNAL, [decision_journal_id], "repercussions", value)
}

export function updateDecisionJournalDecisionMadeAt(decision_journal_id, value) {
    return updateItem(ENTITY_KEY__DECISION_JOURNAL, [decision_journal_id], "decision_made_at", value)
}

export function startCandidateDecisionJournal(project_id) {
    return (dispatch, getState) => {
        dispatch(startCandidateItem(ENTITY_KEY__DECISION_JOURNAL,
                                    { project_id: project_id }))
    }
}

export function updateCandidateDecision(decision) {
    return updateCandidateDetails(ENTITY_KEY__DECISION_JOURNAL, {decision:decision})
}

export function updateCandidateProperties(props) {
    return updateCandidateDetails(ENTITY_KEY__DECISION_JOURNAL, props)
}

export function cancelCandidateDecisionJournal() {
    return cancelCandidateItem(ENTITY_KEY__DECISION_JOURNAL)
}

export function saveCandidateDecisionJournal(on_done) {
    return saveCandidateItem(ENTITY_KEY__DECISION_JOURNAL, on_done)
}

export function deleteDecisionJournals(decision_journal_ids) {
    return deleteItems(ENTITY_KEY__DECISION_JOURNAL, decision_journal_ids)
}

export function getCandidateDecisionJournal(state) {
    return getCandidateItem(ENTITY_KEY__DECISION_JOURNAL, state)
}

export function getInvalidatedDecisionJournalIds(state, decision_journal_ids) {
    return getInvalidatedItemIds(ENTITY_KEY__DECISION_JOURNAL, state, decision_journal_ids)
}

export function getLoadingDecisionJournalIds(state, decision_journal_ids) {
    return getLoadingItemIds(state, ENTITY_KEY__DECISION_JOURNAL, decision_journal_ids)
}

export function getSavingDecisionJournalIds(state, decision_journal_ids) {
    return getSavingItemIds(ENTITY_KEY__DECISION_JOURNAL, state, decision_journal_ids)
}

export function is_decision_journal_invalidated(state, decision_journal_id) {
    return is_item_invalidated(ENTITY_KEY__DECISION_JOURNAL, state, decision_journal_id)
}

export function isLoadingDecisionJournals(state, item_ids) {
    return isLoadingItems(state, ENTITY_KEY__DECISION_JOURNAL, item_ids)
}
