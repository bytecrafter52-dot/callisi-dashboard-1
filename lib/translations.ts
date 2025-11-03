// Translation system for Callisi Dashboard
// Supports German (de) and English (en)

export const translations = {
  de: {
    // Navigation
    nav_dashboard: 'Dashboard',
    nav_calls: 'Anrufe',
    nav_tasks: 'Aufgaben',
    nav_employees: 'Mitarbeiter',
    nav_statistics: 'Statistiken',
    nav_settings: 'Einstellungen',
    nav_logout: 'Abmelden',
    
    // Dashboard Home
    welcome_back: 'Willkommen zurück!',
    dashboard_overview: 'Hier ist Ihre Übersicht für Callisi',
    total_calls: 'Anrufe Gesamt',
    calls_today: 'Anrufe Heute',
    avg_duration: 'Ø Dauer',
    open_tasks: 'Offene Aufgaben',
    recent_calls: 'Letzte Anrufe',
    no_calls_yet: 'Noch keine Anrufe vorhanden',
    unknown: 'Unbekannt',
    no_number: 'Keine Nummer',
    
    // Calls Page
    calls: 'Anrufe',
    calls_overview: 'Übersicht aller eingegangenen Anrufe',
    export_csv: 'CSV Exportieren',
    search_placeholder: 'Suchen nach Name, Telefon oder Zusammenfassung...',
    all_status: 'Alle Status',
    caller: 'ANRUFER',
    phone: 'TELEFON',
    start_time: 'STARTZEIT',
    duration: 'DAUER',
    status: 'STATUS',
    tags: 'TAGS',
    actions: 'AKTIONEN',
    details: 'Details',
    completed: 'Abgeschlossen',
    missed: 'Verpasst',
    forwarded: 'Weitergeleitet',
    failed: 'Fehlgeschlagen',
    
    // Tasks Page
    tasks: 'Aufgaben',
    tasks_manage: 'Verwalten Sie Ihre Aufgaben und Zuweisungen',
    new_task: 'Neue Aufgabe',
    all: 'Alle',
    open: 'Offen',
    in_progress: 'In Bearbeitung',
    closed: 'Abgeschlossen',
    no_tasks: 'Keine Aufgaben',
    
    // Employees Page
    employees: 'Mitarbeiter',
    manage_team: 'Verwalten Sie Ihr Team',
    add_employee: 'Mitarbeiter hinzufügen',
    total: 'Gesamt',
    admin: 'Admin',
    manager: 'Manager',
    agent: 'Agent',
    
    // Statistics Page
    statistics: 'Statistiken',
    stats_overview: 'Übersicht Ihrer Anruf- und Aufgabenstatistiken',
    week: 'Woche',
    month: 'Monat',
    year: 'Jahr',
    success_rate: 'Erfolgsquote',
    avg_duration_stat: 'Durchschnittsdauer',
    active_employees: 'Aktive Mitarbeiter',
    call_status: 'Anrufstatus',
    daily_activity: 'Tägliche Aktivität',
    
    // Settings Page
    settings: 'Einstellungen',
    
    // Common
    min: 'min',
    search: 'Suchen',
    filter: 'Filtern',
    loading: 'Wird geladen...',
    error: 'Fehler',
    success: 'Erfolg',
    cancel: 'Abbrechen',
    save: 'Speichern',
    delete: 'Löschen',
    edit: 'Bearbeiten',
  },
  
  en: {
    // Navigation
    nav_dashboard: 'Dashboard',
    nav_calls: 'Calls',
    nav_tasks: 'Tasks',
    nav_employees: 'Employees',
    nav_statistics: 'Statistics',
    nav_settings: 'Settings',
    nav_logout: 'Logout',
    
    // Dashboard Home
    welcome_back: 'Welcome back!',
    dashboard_overview: 'Here is your overview for Callisi',
    total_calls: 'Total Calls',
    calls_today: 'Calls Today',
    avg_duration: 'Avg Duration',
    open_tasks: 'Open Tasks',
    recent_calls: 'Recent Calls',
    no_calls_yet: 'No calls yet',
    unknown: 'Unknown',
    no_number: 'No number',
    
    // Calls Page
    calls: 'Calls',
    calls_overview: 'Overview of all incoming calls',
    export_csv: 'Export CSV',
    search_placeholder: 'Search by name, phone or summary...',
    all_status: 'All Status',
    caller: 'CALLER',
    phone: 'PHONE',
    start_time: 'START TIME',
    duration: 'DURATION',
    status: 'STATUS',
    tags: 'TAGS',
    actions: 'ACTIONS',
    details: 'Details',
    completed: 'Completed',
    missed: 'Missed',
    forwarded: 'Forwarded',
    failed: 'Failed',
    
    // Tasks Page
    tasks: 'Tasks',
    tasks_manage: 'Manage your tasks and assignments',
    new_task: 'New Task',
    all: 'All',
    open: 'Open',
    in_progress: 'In Progress',
    closed: 'Completed',
    no_tasks: 'No tasks',
    
    // Employees Page
    employees: 'Employees',
    manage_team: 'Manage your team',
    add_employee: 'Add Employee',
    total: 'Total',
    admin: 'Admin',
    manager: 'Manager',
    agent: 'Agent',
    
    // Statistics Page
    statistics: 'Statistics',
    stats_overview: 'Overview of your call and task statistics',
    week: 'Week',
    month: 'Month',
    year: 'Year',
    success_rate: 'Success Rate',
    avg_duration_stat: 'Average Duration',
    active_employees: 'Active Employees',
    call_status: 'Call Status',
    daily_activity: 'Daily Activity',
    
    // Settings Page
    settings: 'Settings',
    
    // Common
    min: 'min',
    search: 'Search',
    filter: 'Filter',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
  }
}

export type Language = 'de' | 'en'
export type TranslationKey = keyof typeof translations.de

export function translate(key: TranslationKey, lang: Language): string {
  return translations[lang][key] || translations.de[key] || key
}
