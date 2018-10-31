import { size, last, nth } from 'lodash'

export const SET_BREADCRUMBS = 'SET_BREADCRUMBS'
export const SET_BREADCRUMBS_ACTIVE = 'SET_BREADCRUMBS_ACTIVE'

export function setCompanyBreadcrumbsHelper(optional_company) {
    const company = optional_company || {}
    const breadcrumbs = [{to: '/companies',
                          type: 'companies',
                          label: 'Companies'}]
    if ( company.id ) {
        breadcrumbs.push({to: '/companies/' + company.id,
                          type: 'company',
                          label: company.name,
                          selected_entities: {company: company}})
    }
    return setBreadcrumbs(breadcrumbs)
}

export function setCompanyUserBreadcrumbsHelper(company, optional_user) {
    const user = optional_user || {}
    const breadcrumbs = [{to: '/companies',
                          type: 'companies',
                          label: 'Companies'},
                         {to: '/companies/' + company.id,
                          type: 'company',
                          label: company.name,
                          selected_entities: {company: company}},
                         {to: '/companies/'+company.id+'/users/',
                          label: 'Users',
                          type: 'users',
                          selected_entities: {company: company}}
    ]
    if ( user ) {
        breadcrumbs.push({to: '/companies/'+company.id+'/users/'+user.id,
                          type: 'company',
                          label: user.username,
                          selected_entities: {company: company,
                                              user: user}})
    }
    return setBreadcrumbs(breadcrumbs)
}


export function setProjectUserBreadcrumbsHelper(project, optional_user) {
    const user = optional_user || {}
    const breadcrumbs = [{to: '/projects',
                          type: 'projects',
                          label: 'Projects'},
                         {to: '/projects/' + project.id,
                          type: 'project',
                          label: project.name,
                          selected_entities: {project: project}},
                         {to: '/projects/'+project.id+'/users/',
                          label: 'Users',
                          type: 'users',
                          selected_entities: {project: project}}
    ]
    if ( user ) {
        breadcrumbs.push({to: '/projects/'+project.id+'/users/'+user.id,
                          type: 'project',
                          label: user.username,
                          selected_entities: {project: project,
                                              user: user}})
    }
    return setBreadcrumbs(breadcrumbs)
}

export function setProjectBreadcrumbsHelper(optional_project) {
    const project = optional_project || {}
    const breadcrumbs = [{to: '/projects',
                          type: 'projects',
                          label: 'Projects'}]
    if ( project.id ) {
        breadcrumbs.push({to: '/projects/' + project.id,
                          type: 'project',
                          label: project.name,
                          selected_entities: {project: project}})
    }
    return setBreadcrumbs(breadcrumbs)
}

export function setSprintBreadcrumbsHelper(project, optional_sprint, auto_set) {
    if ( auto_set !== false ) {
        auto_set = true
    }
    const sprint = optional_sprint || {}
    const breadcrumbs = [{to: '/projects',
                          type: 'projects',
                          label: 'Projects'},
                         {to: '/projects/' + project.id,
                          type: 'project',
                          label: project.name,
                          selected_entities: {project: project}},
                         {to: '/projects/' + project.id + '/sprints',
                          label: 'Sprints',
                          type: 'sprints',
                          selected_entities: {project: project,
                                              sprint: sprint}}]
    if ( sprint.id ) {
        breadcrumbs.push({to: '/projects/' + project.id + '/sprints/' + sprint.id,
                          label: sprint.name,
                          type: 'sprint',
                          selected_entities: {project: project,
                                              sprint: sprint}})
    }
    if ( auto_set === true ) {
        return setBreadcrumbs(breadcrumbs)
    }
    return breadcrumbs
}

export function setIssueBreadcrumbsHelper(project, sprint, optional_issue) {
    const issue = optional_issue
    const breadcrumbs = [ {to: '/projects',
                           label: 'Projects',
                           type: 'projects'},
                          {to: '/projects/'+project.id,
                           label: project.name,
                           type: 'project',
                           selected_entities: {project: project}
                          },
                          {to: '/projects/'+project.id+'/sprints',
                           label: 'Sprints',
                           type: 'sprints',
                           selected_entities: {project: project}},
                          {to: '/projects/'+project.id+'/sprints/'+sprint.id,
                           label: sprint.name,
                           type: 'sprint',
                           selected_entities: {project: project,
                                               sprint: sprint}},
                          {to: '/projects/'+project.id+'/sprints/'+sprint.id+'/issues',
                           label: 'Issues',
                           type: 'issues',
                           selected_entities: {project: project,
                                               sprint: sprint,
                                               issue: issue}}]
    if ( issue ) {
        breadcrumbs.push({to: '/projects/'+project.id+'/sprints/'+sprint.id+'/issues/' + issue.id,
                          label: issue.number,
                          type: 'issue',
                          selected_entities: {project: project,
                                              sprint: sprint,
                                              issue: issue}})
    }
    return setBreadcrumbs(breadcrumbs)
}

export function setFeatureBreadcrumbsHelper(project, optional_feature) {
    const feature = optional_feature || {}
    const breadcrumbs = [{to: '/projects',
                          label: 'Projects',
                          type: 'projects'},
                         {to: '/projects/'+project.id,
                          label: project.name,
                          type: 'project',
                          selected_entities: {project: project}
                         },
                         {to: '/projects/'+project.id+'/features',
                          type: 'features',
                          label: 'Features',
                          selected_entities: {project:project}}]
    if ( feature.id ) {
        breadcrumbs.push({to: '/projects/'+project.id+'/features/' + feature.id,
                          type: 'feature',
                          label: feature.name,
                          selected_entities: {project:project,
                                              feature: feature}})
    }
    return setBreadcrumbs(breadcrumbs)
}

export function setDecisionJournalBreadcrumbsHelper(project, optional_decision_journal) {
    const decision_journal = optional_decision_journal || {}
    const breadcrumbs = [{to: '/projects',
                          label: 'Projects',
                          type: 'projects'},
                         {to: '/projects/'+project.id,
                          label: project.name,
                          type: 'project',
                          selected_entities: {project: project}
                         },
                         {to: '/projects/'+project.id+'/journals',
                          type: 'decision_journals',
                          label: 'Decision_Journals',
                          selected_entities: {project:project}}]
    if ( decision_journal.id ) {
        breadcrumbs.push({to: '/projects/'+project.id+'/journals/' + decision_journal.id,
                          type: 'decision_journal',
                          label: (decision_journal.decision || "").slice(0,50),
                          selected_entities: {project:project,
                                              decision_journal: decision_journal}})
    }
    return setBreadcrumbs(breadcrumbs)
}


export function setBreadcrumbs(breadcrumbs) {
    return {
        type: SET_BREADCRUMBS,
        breadcrumbs: breadcrumbs,
        is_active: true
    }
}

export function setBreadcrumbsActive(is_active) {
    return {
        type: SET_BREADCRUMBS_ACTIVE,
        is_active: is_active
    }
}

export function areBreadcrumbsActive(state) {
    return ((state || {}).breadcrumbs || {}).is_active === true
}

export function getBreadcrumbs(state) {
    return ((state || {}).breadcrumbs || {}).breadcrumbs
}

export function getRootEntityBreadcrumb(breadcrumbs) {
    if ( size(breadcrumbs) === 0 ) {
        return null
    }
    return nth(breadcrumbs, 1)
}

export function getLeafEntityBreadcrumb(breadcrumbs) {
    return last(breadcrumbs)
}
