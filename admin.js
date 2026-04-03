document.addEventListener('DOMContentLoaded', function() {
    loadActivities();
    setupModalHandlers();
    setupFormHandlers();
});

function loadActivities() {
    fetch('/api/activities')
        .then(response => response.json())
        .then(activities => {
            displayAdminActivities(activities);
            updateRegistrationsOverview(activities);
        })
        .catch(error => {
            console.error('Error loading activities:', error);
            document.getElementById('activities-list').innerHTML = '<p>Er is een fout opgetreden bij het laden van de activiteiten.</p>';
        });
}

function displayAdminActivities(activities) {
    const container = document.getElementById('activities-list');
    
    if (activities.length === 0) {
        container.innerHTML = '<p>Er zijn geen activiteiten gevonden.</p>';
        return;
    }
    
    container.innerHTML = `
        <table class="admin-table">
            <thead>
                <tr>
                    <th>Titel</th>
                    <th>Type</th>
                    <th>Datum</th>
                    <th>Tijd</th>
                    <th>Locatie</th>
                    <th>Max. Deelnemers</th>
                    <th>Aanmeldingen</th>
                    <th>Acties</th>
                </tr>
            </thead>
            <tbody>
                ${activities.map(activity => `
                    <tr>
                        <td>${activity.title}</td>
                        <td><span class="activity-type">${activity.type}</span></td>
                        <td>${formatDate(activity.date)}</td>
                        <td>${activity.time || '-'}</td>
                        <td>${activity.location || '-'}</td>
                        <td>${activity.max_participants || '-'}</td>
                        <td>
                            <button class="btn btn-secondary" onclick="showRegistrations(${activity.id})">
                                Bekijk aanmeldingen
                            </button>
                        </td>
                        <td>
                            <button class="btn btn-danger" onclick="deleteActivity(${activity.id}, '${activity.title}')">
                                Verwijderen
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function updateRegistrationsOverview(activities) {
    const container = document.getElementById('registrations-overview');
    
    if (activities.length === 0) {
        container.innerHTML = '<p>Er zijn geen activiteiten gevonden.</p>';
        return;
    }
    
    // Load registration counts for all activities
    const registrationPromises = activities.map(activity => 
        fetch(`/api/activities/${activity.id}/registrations`)
            .then(response => response.json())
            .then(registrations => ({
                activity: activity,
                count: registrations.length
            }))
    );
    
    Promise.all(registrationPromises)
        .then(results => {
            container.innerHTML = `
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Activiteit</th>
                            <th>Datum</th>
                            <th>Type</th>
                            <th>Aantal aanmeldingen</th>
                            <th>Acties</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${results.map(result => `
                            <tr>
                                <td>${result.activity.title}</td>
                                <td>${formatDate(result.activity.date)}</td>
                                <td>${result.activity.type}</td>
                                <td>${result.count}</td>
                                <td>
                                    <button class="btn btn-secondary" onclick="showRegistrations(${result.activity.id})">
                                        Details bekijken
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        })
        .catch(error => {
            console.error('Error loading registration counts:', error);
            container.innerHTML = '<p>Er is een fout opgetreden bij het laden van de aanmeldingen.</p>';
        });
}

function showRegistrations(activityId) {
    fetch(`/api/activities/${activityId}`)
        .then(response => response.json())
        .then(activity => {
            return fetch(`/api/activities/${activityId}/registrations`)
                .then(response => response.json())
                .then(registrations => ({ activity, registrations }));
        })
        .then(({ activity, registrations }) => {
            const registrationsHtml = `
                <h3>${activity.title} - ${formatDate(activity.date)}</h3>
                <p><strong>Totaal aanmeldingen:</strong> ${registrations.length}</p>
                ${activity.max_participants ? `<p><strong>Capaciteit:</strong> ${registrations.length}/${activity.max_participants}</p>` : ''}
                
                ${registrations.length === 0 ? 
                    '<p>Er zijn nog geen aanmeldingen voor deze activiteit.</p>' :
                    `<table class="admin-table">
                        <thead>
                            <tr>
                                <th>Naam</th>
                                <th>E-mail</th>
                                <th>Telefoon</th>
                                <th>Aanmelddatum</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${registrations.map(registration => `
                                <tr>
                                    <td>${registration.name}</td>
                                    <td>${registration.email}</td>
                                    <td>${registration.phone || '-'}</td>
                                    <td>${formatDateTime(registration.registration_date)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>`
                }
            `;
            
            document.getElementById('registrations-list').innerHTML = registrationsHtml;
            document.getElementById('registrations-modal').style.display = 'block';
        })
        .catch(error => {
            console.error('Error loading registrations:', error);
        });
}

function showAddActivityForm() {
    document.getElementById('add-activity-form').reset();
    document.getElementById('add-activity-message').innerHTML = '';
    document.getElementById('add-activity-modal').style.display = 'block';
}

function deleteActivity(activityId, activityTitle) {
    if (confirm(`Weet u zeker dat u "${activityTitle}" wilt verwijderen? Alle aanmeldingen voor deze activiteit worden ook verwijderd.`)) {
        fetch(`/api/activities/${activityId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert('Fout bij verwijderen: ' + data.error);
            } else {
                alert('Activiteit succesvol verwijderd.');
                loadActivities();
            }
        })
        .catch(error => {
            console.error('Error deleting activity:', error);
            alert('Er is een fout opgetreden bij het verwijderen van de activiteit.');
        });
    }
}

function setupModalHandlers() {
    // Close modals when clicking on X
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
}

function setupFormHandlers() {
    document.getElementById('add-activity-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            title: document.getElementById('title').value,
            description: document.getElementById('description').value,
            date: document.getElementById('date').value,
            time: document.getElementById('time').value,
            location: document.getElementById('location').value,
            max_participants: document.getElementById('max_participants').value || null,
            type: document.getElementById('type').value
        };
        
        fetch('/api/activities', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showMessage('add-activity-message', data.error, 'error');
            } else {
                showMessage('add-activity-message', 'Activiteit succesvol toegevoegd!', 'success');
                document.getElementById('add-activity-form').reset();
                
                // Close modal after 2 seconds and refresh
                setTimeout(() => {
                    document.getElementById('add-activity-modal').style.display = 'none';
                    loadActivities();
                }, 2000);
            }
        })
        .catch(error => {
            console.error('Error adding activity:', error);
            showMessage('add-activity-message', 'Er is een fout opgetreden bij het toevoegen van de activiteit.', 'error');
        });
    });
}

function showMessage(elementId, message, type) {
    const messageElement = document.getElementById(elementId);
    messageElement.innerHTML = `<div class="message ${type}">${message}</div>`;
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('nl-NL', options);
}

function formatDateTime(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('nl-NL', options);
}
