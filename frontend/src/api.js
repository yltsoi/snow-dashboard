const BASE = import.meta.env.VITE_API_BASE ?? '/api'

export const fetchSummary = () =>
    fetch(`${BASE}/stats/summary`).then(r => r.json())

export const fetchVolume = (days = 30) =>
    fetch(`${BASE}/stats/volume?days=${days}`).then(r => r.json())


export const fetchByStatus = () =>
    fetch(`${BASE}/stats/by-status`).then(r => r.json())

export const fetchByRisk = () =>
    fetch(`${BASE}/stats/by-risk`).then(r => r.json())

export const fetchChanges = (params = {}) => {
    const q = new URLSearchParams()
    if ( params.state) q.set('state', params.state)
    if ( params.risk) q.set('risk', params.risk)
    if ( params.search) q.set('search', params.search)
    if ( params.page) q.set('page', params.page)
    return fetch(`${BASE}/changes?${q}`).then(r => r.json())
}

export const fetchChange = (number) =>
    fetch(`${BASE}/changes/${number}`).then(r => r.json())

export const assessChange = (number) =>
    fetch(`${BASE}/changes/${number}/assess`, { method: 'POST' }).then( r => {
        if (!r.ok) return r.json().then(e => Promise.reject(new Error(e.detail ?? 'Assessment failed')))
        return r.json()
    })



