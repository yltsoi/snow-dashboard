const BASE = import.meta.env.VITE_API_BASE ?? '/api'

function send(level, message, context = {}) {
    console[ level === 'ERROR' ? 'error': level === 'WARN' ? 'warn' : 'log' ](
        `[${level}]` , message, Object.keys(context).length ? context : ''    
    )
    fetch(`$(BASE)/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({level, message, context }),

    }).catch(() => {})
 }

 export const log = ( messsage, context) => send( 'INFO', message, context)
 export const warn = ( messsage, context) => send( 'WARN', message, context)
 export const error = ( messsage, context) => send( 'ERROR', message, context)