
export const SET_BREADCRUMBS = 'SET_BREADCRUMBS'
export const SET_BREADCRUMBS_ACTIVE = 'SET_BREADCRUMBS_ACTIVE'

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

export function setSprintBreadcrumbsHelper(project, optional_sprint) {
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
        breadcrumbs.push({to: '/projects/' + project.id + '/sprints',
                          label: sprint.name,
                          type: 'sprint',
                          selected_entities: {project: project,
                                              sprint: sprint}})
    }
    return setBreadcrumbs(breadcrumbs)
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
